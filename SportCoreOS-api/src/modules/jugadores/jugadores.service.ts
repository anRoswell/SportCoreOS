import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JugadoresRepository } from './jugadores.repository';
import {
  CreateJugadorDto,
  UpdateJugadorDto,
  CreateAcudienteDto,
  CreateBiometriaDto,
} from './jugadores.dto';

@Injectable()
export class JugadoresService {
  private readonly logger = new Logger(JugadoresService.name);

  constructor(private readonly jugadoresRepository: JugadoresRepository) {}

  async findAllByClub(
    clubId: string,
    optionsOrSearch?:
      | string
      | {
          search?: string;
          categoriaId?: string;
          estado?: string;
          posicion?: string;
          genero?: string;
          page?: number;
          limit?: number;
          sortBy?: string;
        },
    categoriaId?: string,
    estado?: string,
  ) {
    return this.jugadoresRepository.findJugadoresByClub(clubId, optionsOrSearch, categoriaId, estado);
  }

  async findById(id: string, clubId: string) {
    const jugador = await this.jugadoresRepository.findById(id, clubId);
    if (!jugador) {
      throw new NotFoundException(`Jugador con ID '${id}' no encontrado en el club`);
    }
    return jugador;
  }

  async findExpedienteCompleto(id: string, clubId: string) {
    const expediente = await this.jugadoresRepository.findExpediente(id, clubId);
    if (!expediente) {
      throw new NotFoundException(`Expediente del jugador con ID '${id}' no encontrado`);
    }
    return expediente;
  }

  async create(clubId: string, dto: CreateJugadorDto) {
    // 1. Validar unicidad del documento dentro del club
    const docExistente = await this.jugadoresRepository.findByDocumento(clubId, dto.numeroDocumento);
    if (docExistente) {
      throw new ConflictException(
        `Ya existe un jugador registrado con el documento ${dto.numeroDocumento} (${docExistente.nombres} ${docExistente.apellidos})`,
      );
    }

    // 2. Validar dorsal único en la misma categoría si se asignó
    if (dto.numeroDorsal) {
      const dorsalExistente = await this.jugadoresRepository.findByDorsal(
        clubId,
        dto.categoriaId,
        dto.numeroDorsal,
      );
      if (dorsalExistente) {
        throw new ConflictException(
          `El dorsal #${dto.numeroDorsal} ya está asignado al jugador ${dorsalExistente.nombres} ${dorsalExistente.apellidos} en esta categoría`,
        );
      }
    }

    // 3. Crear jugador en deportivo.jugadores
    const nuevoJugador = await this.jugadoresRepository.createJugador({
      clubId,
      categoriaId: dto.categoriaId,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      tipoDocumento: dto.tipoDocumento || 'TI',
      numeroDocumento: dto.numeroDocumento,
      fechaNacimiento: dto.fechaNacimiento,
      genero: dto.genero || 'MASCULINO',
      fotoUrl: dto.fotoUrl,
      posicionPrincipal: dto.posicionPrincipal,
      posicionSecundaria: dto.posicionSecundaria,
      piernaHabil: dto.piernaHabil || 'DIESTRO',
      numeroDorsal: dto.numeroDorsal,
      eps: dto.eps,
      estadoMatricula: dto.estadoMatricula || 'ACTIVO',
    });

    // 4. Si se incluyeron datos del Acudiente, registrarlo y vincularlo
    let acudienteCreado = null;
    const numDocAcudiente = dto.acudienteNumeroDoc || dto.acudienteNumeroDocumento;
    if (dto.acudienteNombres && numDocAcudiente && dto.acudienteTelefono) {
      try {
        acudienteCreado = await this.jugadoresRepository.createAcudiente({
          nombres: dto.acudienteNombres,
          apellidos: dto.acudienteApellidos || '',
          tipoDocumento: dto.acudienteTipoDoc || 'CC',
          numeroDocumento: numDocAcudiente,
          telefonoMovil: dto.acudienteTelefono,
          email: dto.acudienteEmail,
          parentesco: dto.acudienteParentesco || 'PADRE',
        });

        await this.jugadoresRepository.linkJugadorAcudiente(
          nuevoJugador.id,
          acudienteCreado.id,
          true,
          true,
        );
      } catch (err: any) {
        this.logger.warn(`Nota al registrar acudiente inicial: ${err.message}`);
      }
    }

    return {
      message: 'Jugador inscrito y registrado exitosamente en el plantel',
      jugador: nuevoJugador,
      acudiente: acudienteCreado,
    };
  }

  async update(id: string, clubId: string, dto: UpdateJugadorDto) {
    const actual = await this.findById(id, clubId);

    // 1. Validar unicidad del documento si se modificó
    if (dto.numeroDocumento && dto.numeroDocumento !== actual.numero_documento) {
      const docExistente = await this.jugadoresRepository.findByDocumento(
        clubId,
        dto.numeroDocumento,
        id,
      );
      if (docExistente) {
        throw new ConflictException(
          `Ya existe otro jugador con el documento ${dto.numeroDocumento}`,
        );
      }
    }

    // 2. Validar dorsal si se modificó o cambió de categoría
    const targetCategoria = dto.categoriaId || actual.categoria_id;
    const targetDorsal = dto.numeroDorsal !== undefined ? dto.numeroDorsal : actual.numero_dorsal;

    if (targetDorsal && (dto.numeroDorsal !== undefined || dto.categoriaId !== undefined)) {
      const dorsalExistente = await this.jugadoresRepository.findByDorsal(
        clubId,
        targetCategoria,
        targetDorsal,
        id,
      );
      if (dorsalExistente) {
        throw new ConflictException(
          `El dorsal #${targetDorsal} ya está ocupado en la categoría seleccionada por ${dorsalExistente.nombres} ${dorsalExistente.apellidos}`,
        );
      }
    }

    const actualizado = await this.jugadoresRepository.updateJugador(id, clubId, dto);
    return {
      message: 'Ficha del jugador actualizada exitosamente',
      jugador: actualizado,
    };
  }

  async delete(id: string, clubId: string) {
    await this.findById(id, clubId);
    await this.jugadoresRepository.deleteJugador(id, clubId);
    return { message: 'Jugador dado de baja / retirado del club' };
  }

  async addAcudiente(jugadorId: string, clubId: string, dto: CreateAcudienteDto) {
    await this.findById(jugadorId, clubId);

    const acudiente = await this.jugadoresRepository.createAcudiente({
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      tipoDocumento: dto.tipoDocumento || 'CC',
      numeroDocumento: dto.numeroDocumento,
      telefonoMovil: dto.telefonoMovil,
      email: dto.email,
      parentesco: dto.parentesco || 'PADRE',
      direccionResidencia: dto.direccionResidencia,
    });

    await this.jugadoresRepository.linkJugadorAcudiente(
      jugadorId,
      acudiente.id,
      dto.esContactoPrincipal !== undefined ? dto.esContactoPrincipal : true,
      dto.autorizadoRecoger !== undefined ? dto.autorizadoRecoger : true,
    );

    return {
      message: 'Familiar / Acudiente vinculado exitosamente',
      acudiente,
    };
  }

  async removeAcudiente(jugadorId: string, clubId: string, acudienteId: string) {
    await this.findById(jugadorId, clubId);
    const deleted = await this.jugadoresRepository.removeJugadorAcudiente(jugadorId, acudienteId);
    if (!deleted) {
      throw new NotFoundException('Vínculo con acudiente no encontrado');
    }
    return { message: 'Vínculo de acudiente removido exitosamente' };
  }

  async addEvaluacionBiometrica(
    jugadorId: string,
    clubId: string,
    evaluadorId: string,
    dto: CreateBiometriaDto,
  ) {
    await this.findById(jugadorId, clubId);

    if (dto.pesoKg <= 0 || dto.tallaCm <= 0) {
      throw new BadRequestException('El peso y la talla deben ser valores numéricos positivos mayores a 0');
    }

    // Cálculo automático de IMC: Peso / (Talla en metros ^ 2)
    const tallaMetros = dto.tallaCm / 100;
    const imcCalculado = parseFloat((dto.pesoKg / (tallaMetros * tallaMetros)).toFixed(1));
    const fecha = dto.fechaEvaluacion || new Date().toISOString().split('T')[0];

    const evaluacion = await this.jugadoresRepository.createEvaluacionBiometrica({
      jugadorId,
      evaluadorId,
      fechaEvaluacion: fecha,
      pesoKg: dto.pesoKg,
      tallaCm: dto.tallaCm,
      imc: imcCalculado,
      testCooperMetros: dto.testCooperMetros,
      velocidad30mSeg: dto.velocidad30mSeg,
      saltoVerticalCm: dto.saltoVerticalCm,
      observaciones: dto.observaciones,
    });

    return {
      message: 'Evaluación biométrica registrada exitosamente',
      evaluacion,
    };
  }
}
