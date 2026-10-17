import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcrypt';
import { JugadoresRepository } from './jugadores.repository';
import {
  CreateJugadorDto,
  UpdateJugadorDto,
  CreateAcudienteDto,
  CreateBiometriaDto,
} from './jugadores.dto';
import {
  Role,
  TipoDocumentoIdentidad,
  Genero,
  PiernaHabil,
  EstadoMatricula,
  Parentesco,
  PosicionJugador,
} from '../../common/enums/domain.enums';

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
      genero: dto.genero || Genero.MASCULINO,
      fotoUrl: dto.fotoUrl,
      posicionPrincipal: dto.posicionPrincipal,
      posicionSecundaria: dto.posicionSecundaria,
      piernaHabil: dto.piernaHabil || PiernaHabil.DIESTRO,
      numeroDorsal: dto.numeroDorsal,
      eps: dto.eps,
      estadoMatricula: dto.estadoMatricula || EstadoMatricula.ACTIVO,
    });

    // 4. Si se incluyeron datos del Acudiente, registrarlo y vincularlo
    let acudienteCreado = null;
    const numDocAcudiente = dto.acudienteNumeroDoc || dto.acudienteNumeroDocumento;
    if (dto.acudienteNombres && numDocAcudiente && dto.acudienteTelefono) {
      try {
        acudienteCreado = await this.jugadoresRepository.createAcudiente({
          nombres: dto.acudienteNombres,
          apellidos: dto.acudienteApellidos || '',
          tipoDocumento: dto.acudienteTipoDoc || TipoDocumentoIdentidad.CC,
          numeroDocumento: numDocAcudiente,
          telefonoMovil: dto.acudienteTelefono,
          email: dto.acudienteEmail,
          parentesco: dto.acudienteParentesco || Parentesco.PADRE,
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

  async getInitData(clubId: string, options?: { page?: number; limit?: number }) {
    return this.jugadoresRepository.getInitData(clubId, options);
  }

  async generarPlantillaExcel(): Promise<Buffer> {
    const wb = XLSX.utils.book_new();
    const headers = [
      {
        nombres_jugador: 'Mateo',
        apellidos_jugador: 'Gómez Ríos',
        tipo_documento_jugador: 'TI',
        numero_documento_jugador: '1023456789',
        fecha_nacimiento_jugador: '2010-05-14',
        genero_jugador: 'MASCULINO',
        categoria: 'Sub-15 Élite A',
        posicion_principal: 'Delantero Centro',
        posicion_secundaria: 'Extremo Derecho',
        pierna_habil: 'DIESTRO',
        numero_dorsal: 9,
        eps: 'SURA EPS',
        email_jugador: 'mateo.gomez@gmail.com',
        telefono_jugador: '+57 310 123 4567',
        nombres_acudiente: 'Carlos Alberto',
        apellidos_acudiente: 'Gómez Silva',
        parentesco: 'PADRE',
        tipo_documento_acudiente: 'CC',
        numero_documento_acudiente: '79876543',
        email_acudiente: 'carlos.gomez@gmail.com',
        telefono_acudiente: '+57 311 987 6543',
      },
      {
        nombres_jugador: 'Samuel',
        apellidos_jugador: 'Pardo Mendoza',
        tipo_documento_jugador: 'RC',
        numero_documento_jugador: '1034567890',
        fecha_nacimiento_jugador: '2015-08-22',
        genero_jugador: 'MASCULINO',
        categoria: 'Sub-11 Cantera',
        posicion_principal: 'Volante Mixto',
        posicion_secundaria: 'Volante 10',
        pierna_habil: 'DIESTRO',
        numero_dorsal: 10,
        eps: 'Sanitas EPS',
        email_jugador: '',
        telefono_jugador: '',
        nombres_acudiente: 'María Claudia',
        apellidos_acudiente: 'Mendoza Pérez',
        parentesco: 'MADRE',
        tipo_documento_acudiente: 'CC',
        numero_documento_acudiente: '52345678',
        email_acudiente: 'maria.mendoza@gmail.com',
        telefono_acudiente: '+57 315 876 5432',
      },
      {
        nombres_jugador: 'Valeria',
        apellidos_jugador: 'Ospina Quintero',
        tipo_documento_jugador: 'TI',
        numero_documento_jugador: '1045678901',
        fecha_nacimiento_jugador: '2008-11-03',
        genero_jugador: 'FEMENINO',
        categoria: 'Femenino Juvenil Pro',
        posicion_principal: 'Defensa Central',
        posicion_secundaria: 'Lateral Derecho',
        pierna_habil: 'DIESTRO',
        numero_dorsal: 4,
        eps: 'Compensar EPS',
        email_jugador: 'valeria.ospina@gmail.com',
        telefono_jugador: '+57 300 456 7890',
        nombres_acudiente: 'Jorge Mario',
        apellidos_acudiente: 'Ospina Torres',
        parentesco: 'PADRE',
        tipo_documento_acudiente: 'CC',
        numero_documento_acudiente: '71234567',
        email_acudiente: 'jorge.ospina@gmail.com',
        telefono_acudiente: '+57 312 345 6789',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(headers);
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Jugadores');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async previewImportacionMasiva(clubId: string, filas: any[]) {
    if (!Array.isArray(filas) || filas.length === 0) {
      throw new BadRequestException('El archivo o listado de filas está vacío');
    }

    const categoriasExistentes = await this.jugadoresRepository.findCategoriasClub(clubId);
    const catMap = new Map<string, any>();
    categoriasExistentes.forEach((c) => catMap.set(c.nombre.toLowerCase().trim(), c));

    const nuevasCategorias = new Set<string>();
    let jugadoresParaCuenta = 0;
    let acudientesParaCuenta = 0;
    const documentosVistos = new Set<string>();

    const detalle = await Promise.all(
      filas.map(async (raw, idx) => {
        const filaNum = idx + 2;
        const errores: string[] = [];
        const advertencias: string[] = [];

        const f: any = {};
        Object.keys(raw).forEach((k) => {
          f[k.toLowerCase().trim().replace(/\s+/g, '_')] = raw[k];
        });

        const nombres = (f.nombres_jugador || f.nombres || f.nombre || '').toString().trim();
        const apellidos = (f.apellidos_jugador || f.apellidos || f.apellido || '').toString().trim();
        const tipoDoc = (f.tipo_documento_jugador || f.tipo_documento || 'TI').toString().trim().toUpperCase();
        const numDoc = (f.numero_documento_jugador || f.numero_documento || f.documento || '').toString().trim();
        const fechaNac = (f.fecha_nacimiento_jugador || f.fecha_nacimiento || '').toString().trim();
        const categoriaNombre = (f.categoria || f.categoria_nombre || 'General').toString().trim();
        const dorsal = f.numero_dorsal !== undefined && f.numero_dorsal !== null && f.numero_dorsal !== '' ? Number(f.numero_dorsal) : null;

        if (!nombres) errores.push('Falta el nombre del jugador');
        if (!apellidos) errores.push('Falta el apellido del jugador');
        if (!numDoc) errores.push('Falta el número de documento del jugador');
        if (!fechaNac) errores.push('Falta la fecha de nacimiento (YYYY-MM-DD)');

        const edad = this.calcularEdad(fechaNac);

        if (numDoc) {
          if (documentosVistos.has(numDoc)) {
            errores.push(`Documento ${numDoc} duplicado dentro del mismo archivo`);
          } else {
            documentosVistos.add(numDoc);
          }

          const docExistente = await this.jugadoresRepository.findByDocumento(clubId, numDoc);
          if (docExistente) {
            advertencias.push(`El jugador ya existe en la base de datos (${docExistente.nombres} ${docExistente.apellidos}) y será actualizado`);
          }
        }

        const catKey = categoriaNombre.toLowerCase();
        let categoriaId = catMap.get(catKey)?.id || null;
        let esNuevaCategoria = false;
        if (!categoriaId) {
          nuevasCategorias.add(categoriaNombre);
          esNuevaCategoria = true;
        }

        if (dorsal && categoriaId) {
          const dorsalOcupado = await this.jugadoresRepository.findByDorsal(clubId, categoriaId, dorsal);
          if (dorsalOcupado && dorsalOcupado.numero_documento !== numDoc) {
            advertencias.push(`El dorsal #${dorsal} ya está asignado a ${dorsalOcupado.nombres} ${dorsalOcupado.apellidos} en esta categoría (se importará sin dorsal)`);
          }
        }

        const crearUsuarioJugador = edad >= 14;
        if (crearUsuarioJugador) {
          jugadoresParaCuenta++;
        }

        const nomAcudiente = (f.nombres_acudiente || f.nombre_acudiente || '').toString().trim();
        const apeAcudiente = (f.apellidos_acudiente || f.apellido_acudiente || '').toString().trim();
        const docAcudiente = (f.numero_documento_acudiente || f.documento_acudiente || '').toString().trim();
        const emailAcudiente = (f.email_acudiente || '').toString().trim();

        const tieneAcudiente = !!(nomAcudiente || docAcudiente || emailAcudiente);
        if (tieneAcudiente) {
          acudientesParaCuenta++;
        }

        return {
          filaNum,
          nombres,
          apellidos,
          tipoDoc,
          numeroDocumento: numDoc,
          fechaNacimiento: fechaNac,
          edad,
          categoriaNombre,
          esNuevaCategoria,
          posicionPrincipal: f.posicion_principal || PosicionJugador.SIN_DEFINIR,
          piernaHabil: (f.pierna_habil || f.pierna || PiernaHabil.DIESTRO).toString().toUpperCase().includes('IZQ') ? PiernaHabil.ZURDO : ((f.pierna_habil || f.pierna || '').toString().toUpperCase().includes('AMB') ? PiernaHabil.AMBIDIESTRO : PiernaHabil.DIESTRO),
          numeroDorsal: dorsal,
          crearUsuarioJugador,
          tieneAcudiente,
          acudienteNombre: nomAcudiente ? `${nomAcudiente} ${apeAcudiente}`.trim() : null,
          acudienteDocumento: docAcudiente || null,
          acudienteEmail: emailAcudiente || null,
          esValida: errores.length === 0,
          errores,
          advertencias,
        };
      })
    );

    const validas = detalle.filter((d) => d.esValida);

    return {
      totalFilas: filas.length,
      filasValidasCount: validas.length,
      filasConErrorCount: filas.length - validas.length,
      nuevasCategorias: Array.from(nuevasCategorias),
      estimadoUsuariosJugador: jugadoresParaCuenta,
      estimadoUsuariosAcudiente: acudientesParaCuenta,
      detalle,
    };
  }

  async ejecutarImportacionMasiva(clubId: string, filas: any[]) {
    const preview = await this.previewImportacionMasiva(clubId, filas);
    const validas = preview.detalle.filter((d) => d.esValida);

    if (validas.length === 0) {
      throw new BadRequestException('No hay registros válidos para importar en el lote.');
    }

    const saltRounds = 10;
    const credencialesGeneradas: Array<{
      tipo: 'JUGADOR' | 'PADRE_ACUDIENTE';
      nombreCompleto: string;
      documento: string;
      email: string;
      passwordPlano: string;
      categoria?: string;
    }> = [];

    let jugadoresCreados = 0;
    let jugadoresActualizados = 0;
    let acudientesCreados = 0;
    let categoriasCreadas = 0;

    const catCache = new Map<string, string>();

    for (const fila of validas) {
      // 1. Resolver Categoría
      const catKey = fila.categoriaNombre.toLowerCase();
      let catId = catCache.get(catKey);
      if (!catId) {
        const cat = await this.jugadoresRepository.findOrCreateCategoria(clubId, fila.categoriaNombre);
        catId = cat.id;
        catCache.set(catKey, catId);
        if (fila.esNuevaCategoria) {
          categoriasCreadas++;
        }
      }

      // 2. Gestionar Acudiente & Cuenta Familiar
      let acudienteId: string | null = null;
      if (fila.tieneAcudiente && fila.acudienteDocumento) {
        let acudienteExistente = await this.jugadoresRepository.findAcudienteByDocumento(fila.acudienteDocumento);

        if (!acudienteExistente) {
          acudienteExistente = await this.jugadoresRepository.createAcudiente({
            nombres: fila.acudienteNombre?.split(' ')[0] || 'Acudiente',
            apellidos: fila.acudienteNombre?.split(' ').slice(1).join(' ') || 'Familiar',
            tipoDocumento: TipoDocumentoIdentidad.CC,
            numeroDocumento: fila.acudienteDocumento,
            telefonoMovil: '+57 300 000 0000',
            email: fila.acudienteEmail || null,
            parentesco: Parentesco.PADRE,
          });
          acudientesCreados++;

          const emailAcudiente = fila.acudienteEmail || `acudiente_${fila.acudienteDocumento}@familia.sportcore.com`;
          const passwordAcudientePlano = `Familia${fila.acudienteDocumento}`;

          const existingUser = await this.jugadoresRepository.findUserByEmail(emailAcudiente);
          if (!existingUser) {
            const passwordHash = await bcrypt.hash(passwordAcudientePlano, saltRounds);
            const userCreado = await this.jugadoresRepository.createUserWithMembership(
              {
                nombre: fila.acudienteNombre?.split(' ')[0] || 'Acudiente',
                apellido: fila.acudienteNombre?.split(' ').slice(1).join(' ') || 'Familiar',
                email: emailAcudiente,
                passwordHash,
                rol: Role.PADRE_ACUDIENTE,
                telefono: '+57 300 000 0000',
              },
              clubId
            );

            await this.jugadoresRepository.updateAcudienteUsuarioId(acudienteExistente.id, userCreado.id);

            credencialesGeneradas.push({
              tipo: Role.PADRE_ACUDIENTE,
              nombreCompleto: fila.acudienteNombre || 'Acudiente Familiar',
              documento: fila.acudienteDocumento,
              email: emailAcudiente,
              passwordPlano: passwordAcudientePlano,
            });
          }
        }
        acudienteId = acudienteExistente.id;
      }

      // 3. Crear o Actualizar Jugador
      let dorsalFinal = fila.numeroDorsal;
      if (dorsalFinal && catId) {
        const dorsalOcupado = await this.jugadoresRepository.findByDorsal(clubId, catId, dorsalFinal);
        if (dorsalOcupado && dorsalOcupado.numero_documento !== fila.numeroDocumento) {
          dorsalFinal = null;
        }
      }

      const jugadorExistente = await this.jugadoresRepository.findByDocumento(clubId, fila.numeroDocumento);
      let jugadorId: string;

      if (jugadorExistente) {
        await this.jugadoresRepository.updateJugador(jugadorExistente.id, clubId, {
          categoriaId: catId,
          nombres: fila.nombres,
          apellidos: fila.apellidos,
          posicionPrincipal: fila.posicionPrincipal,
          numeroDorsal: dorsalFinal,
        });
        jugadorId = jugadorExistente.id;
        jugadoresActualizados++;
      } else {
        const nuevo = await this.jugadoresRepository.createJugador({
          clubId,
          categoriaId: catId,
          nombres: fila.nombres,
          apellidos: fila.apellidos,
          tipoDocumento: fila.tipoDoc,
          numeroDocumento: fila.numeroDocumento,
          fechaNacimiento: fila.fechaNacimiento,
          genero: Genero.MASCULINO,
          posicionPrincipal: fila.posicionPrincipal,
          piernaHabil: fila.piernaHabil || PiernaHabil.DIESTRO,
          numeroDorsal: dorsalFinal,
          eps: 'EPS Sanitas',
          estadoMatricula: EstadoMatricula.ACTIVO,
        });
        jugadorId = nuevo.id;
        jugadoresCreados++;
      }

      // 4. Vincular Jugador con Acudiente
      if (acudienteId) {
        await this.jugadoresRepository.linkJugadorAcudiente(jugadorId, acudienteId, true, true);
      }

      // 5. Crear Cuenta para el Jugador (si tiene 14 años o más)
      if (fila.crearUsuarioJugador) {
        const emailJugador = `atleta_${fila.numeroDocumento}@academia.sportcore.com`;
        const passwordJugadorPlano = `Atleta${fila.numeroDocumento}`;

        const existingPlayerUser = await this.jugadoresRepository.findUserByEmail(emailJugador);
        if (!existingPlayerUser) {
          const passHash = await bcrypt.hash(passwordJugadorPlano, saltRounds);
          await this.jugadoresRepository.createUserWithMembership(
            {
              nombre: fila.nombres,
              apellido: fila.apellidos,
              email: emailJugador,
              passwordHash: passHash,
              rol: Role.JUGADOR,
            },
            clubId
          );

          credencialesGeneradas.push({
            tipo: Role.JUGADOR,
            nombreCompleto: `${fila.nombres} ${fila.apellidos}`,
            documento: fila.numeroDocumento,
            email: emailJugador,
            passwordPlano: passwordJugadorPlano,
            categoria: fila.categoriaNombre,
          });
        }
      }
    }

    return {
      message: '¡Importación masiva completada con éxito!',
      resumen: {
        totalProcesados: validas.length,
        jugadoresCreados,
        jugadoresActualizados,
        acudientesCreados,
        categoriasCreadas,
        cuentasCreadasTotal: credencialesGeneradas.length,
      },
      credencialesGeneradas,
    };
  }

  private calcularEdad(fechaNacimientoStr: string): number {
    if (!fechaNacimientoStr) return 0;
    const nacimiento = new Date(fechaNacimientoStr);
    if (isNaN(nacimiento.getTime())) return 0;
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return Math.max(0, edad);
  }
}
