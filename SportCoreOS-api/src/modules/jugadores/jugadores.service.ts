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

    // Hoja 1: Plantilla Jugadores (Cabeceras en camelCase y datos de ejemplo claros)
    const headers = [
      {
        nombresJugador: 'Mateo',
        apellidosJugador: 'Gómez Ríos',
        tipoDocumento: 'TI',
        numeroDocumento: '1023456789',
        fechaNacimiento: '2010-05-14',
        genero: 'MASCULINO',
        codigoCategoria: 'CatSub15',
        nombreCategoria: 'Sub-15 Élite A',
        posicionPrincipal: 'Delantero Centro',
        posicionSecundaria: 'Extremo Derecho',
        piernaHabil: 'DIESTRO',
        numeroDorsal: 9,
        eps: 'SURA EPS',
        emailJugador: 'mateo.gomez@gmail.com',
        telefonoJugador: '+57 310 123 4567',
        nombresAcudiente: 'Carlos Alberto',
        apellidosAcudiente: 'Gómez Silva',
        parentesco: 'PADRE',
        tipoDocumentoAcudiente: 'CC',
        numeroDocumentoAcudiente: '79876543',
        emailAcudiente: 'carlos.gomez@gmail.com',
        telefonoAcudiente: '+57 311 987 6543',
      },
      {
        nombresJugador: 'Samuel',
        apellidosJugador: 'Pardo Mendoza',
        tipoDocumento: 'RC',
        numeroDocumento: '1034567890',
        fechaNacimiento: '2015-08-22',
        genero: 'MASCULINO',
        codigoCategoria: 'CatSub11',
        nombreCategoria: 'Sub-11 Cantera',
        posicionPrincipal: 'Mediocampista Ofensivo',
        posicionSecundaria: 'Mediocampista Defensivo',
        piernaHabil: 'DIESTRO',
        numeroDorsal: 10,
        eps: 'Sanitas EPS',
        emailJugador: '',
        telefonoJugador: '',
        nombresAcudiente: 'María Claudia',
        apellidosAcudiente: 'Mendoza Pérez',
        parentesco: 'MADRE',
        tipoDocumentoAcudiente: 'CC',
        numeroDocumentoAcudiente: '52345678',
        emailAcudiente: 'maria.mendoza@gmail.com',
        telefonoAcudiente: '+57 315 876 5432',
      },
      {
        nombresJugador: 'Valeria',
        apellidosJugador: 'Ospina Quintero',
        tipoDocumento: 'TI',
        numeroDocumento: '1045678901',
        fechaNacimiento: '2008-11-03',
        genero: 'FEMENINO',
        codigoCategoria: 'CatFemSub16',
        nombreCategoria: 'Femenino Juvenil Pro',
        posicionPrincipal: 'Defensa Central',
        posicionSecundaria: 'Lateral Derecho',
        piernaHabil: 'DIESTRO',
        numeroDorsal: 4,
        eps: 'Compensar EPS',
        emailJugador: 'valeria.ospina@gmail.com',
        telefonoJugador: '+57 300 456 7890',
        nombresAcudiente: 'Jorge Mario',
        apellidosAcudiente: 'Ospina Torres',
        parentesco: 'PADRE',
        tipoDocumentoAcudiente: 'CC',
        numeroDocumentoAcudiente: '71234567',
        emailAcudiente: 'jorge.ospina@gmail.com',
        telefonoAcudiente: '+57 312 345 6789',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(headers);
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Jugadores');

    // Hoja 2: Diccionario de Códigos y Enums Oficiales
    const guia = [
      {
        campo: 'codigoCategoria',
        tipoDato: 'Código Alfanumérico',
        ejemplosValidos: 'CatSub9, CatSub11, CatSub13, CatSub14, CatSub15, CatSub16, CatSub17, CatSub20, CatFemSub16',
        descripcion: 'Código único para comparar de forma exacta en BD y evitar errores de tildes o espacios.',
      },
      {
        campo: 'nombreCategoria',
        tipoDato: 'Texto Descriptivo',
        ejemplosValidos: 'Sub-15 Élite A, Iniciación Sub-9, Femenino Sub-16 Élite, Sub-20 Proyección Primera',
        descripcion: 'Nombre visible de la categoría en el sistema. Si se omite, se utiliza el código.',
      },
      {
        campo: 'tipoDocumento',
        tipoDato: 'Enum',
        ejemplosValidos: 'TI, CC, CE, PASAPORTE, PEP, RC',
        descripcion: 'Tipo de documento del deportista (TI por defecto si es menor de edad).',
      },
      {
        campo: 'genero',
        tipoDato: 'Enum',
        ejemplosValidos: 'MASCULINO, FEMENINO',
        descripcion: 'Género del deportista.',
      },
      {
        campo: 'posicionPrincipal',
        tipoDato: 'Enum / Texto',
        ejemplosValidos: 'Portero, Defensa Central, Lateral Derecho, Lateral Izquierdo, Mediocampista Defensivo, Mediocampista Ofensivo, Extremo Derecho, Extremo Izquierdo, Delantero Centro',
        descripcion: 'Posición táctica principal en cancha.',
      },
      {
        campo: 'piernaHabil',
        tipoDato: 'Enum',
        ejemplosValidos: 'DIESTRO, ZURDO, AMBIDIESTRO',
        descripcion: 'Perfil dominante del jugador.',
      },
      {
        campo: 'parentesco',
        tipoDato: 'Enum',
        ejemplosValidos: 'PADRE, MADRE, TUTOR_LEGAL, OTRO',
        descripcion: 'Vínculo familiar del acudiente con el deportista.',
      },
      {
        campo: 'fechaNacimiento',
        tipoDato: 'Fecha (YYYY-MM-DD)',
        ejemplosValidos: '2010-05-14, 2015-08-22, 2008-11-03',
        descripcion: 'Formato estándar de fecha ISO. Determina si el deportista recibe cuenta propia (>= 14 años).',
      },
    ];

    const wsGuia = XLSX.utils.json_to_sheet(guia);
    XLSX.utils.book_append_sheet(wb, wsGuia, 'Guia Codigos & Enums');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async previewImportacionMasiva(clubId: string, filas: any[]) {
    if (!Array.isArray(filas) || filas.length === 0) {
      throw new BadRequestException('El archivo o listado de filas está vacío');
    }

    const categoriasExistentes = await this.jugadoresRepository.findCategoriasClub(clubId);
    const catCodeMap = new Map<string, any>();
    const catNameMap = new Map<string, any>();
    categoriasExistentes.forEach((c) => {
      if (c.codigo_categoria) {
        catCodeMap.set(c.codigo_categoria.toLowerCase().trim(), c);
      }
      if (c.nombre) {
        catNameMap.set(c.nombre.toLowerCase().trim(), c);
      }
    });

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
          f[k.toLowerCase().trim().replace(/[^a-z0-9_]/g, '')] = raw[k];
        });

        const nombres = (f.nombresjugador || f.nombres_jugador || f.nombres || f.nombre || '').toString().trim();
        const apellidos = (f.apellidosjugador || f.apellidos_jugador || f.apellidos || f.apellido || '').toString().trim();
        const tipoDoc = (f.tipodocumentojugador || f.tipo_documento_jugador || f.tipodocumento || f.tipo_documento || 'TI').toString().trim().toUpperCase();
        const numDoc = (f.numerodocumentojugador || f.numero_documento_jugador || f.numerodocumento || f.numero_documento || f.documento || '').toString().trim();
        const fechaNac = (f.fechanacimientojugador || f.fecha_nacimiento_jugador || f.fechanacimiento || f.fecha_nacimiento || '').toString().trim();

        // Extracción de código y nombre de categoría (minimiza errores con códigos normalizados como CatSub15)
        const codigoCat = (f.codigocategoria || f.codigo_categoria || f.codcat || f.cod_cat || '').toString().trim();
        const categoriaNombre = (f.nombrecategoria || f.nombre_categoria || f.categoria || f.categoria_nombre || codigoCat || 'General').toString().trim();

        const dorsal = f.numerodorsal !== undefined && f.numerodorsal !== null && f.numerodorsal !== '' 
          ? Number(f.numerodorsal) 
          : (f.numero_dorsal !== undefined && f.numero_dorsal !== null && f.numero_dorsal !== '' ? Number(f.numero_dorsal) : null);

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

        // Búsqueda inteligente de categoría:
        // 1. Por código exacto (e.g., 'CatSub15')
        // 2. Por nombre exacto (e.g., 'Sub-15 Élite A')
        let categoriaEncontrada: any = null;
        if (codigoCat) {
          categoriaEncontrada = catCodeMap.get(codigoCat.toLowerCase().trim());
        }
        if (!categoriaEncontrada && categoriaNombre) {
          categoriaEncontrada = catNameMap.get(categoriaNombre.toLowerCase().trim());
        }

        let categoriaId = categoriaEncontrada?.id || null;
        let esNuevaCategoria = false;
        const nombreFinalCategoria = categoriaEncontrada?.nombre || categoriaNombre || codigoCat || 'General';

        if (!categoriaId) {
          nuevasCategorias.add(nombreFinalCategoria);
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

        const nomAcudiente = (f.nombresacudiente || f.nombres_acudiente || f.nombreacudiente || f.nombre_acudiente || '').toString().trim();
        const apeAcudiente = (f.apellidosacudiente || f.apellidos_acudiente || f.apellidoacudiente || f.apellido_acudiente || '').toString().trim();
        const docAcudiente = (f.numerodocumentoacudiente || f.numero_documento_acudiente || f.documentoacudiente || f.documento_acudiente || '').toString().trim();
        const emailAcudiente = (f.emailacudiente || f.email_acudiente || f.correoacudiente || f.correo_acudiente || '').toString().trim();

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
          codigoCategoria: codigoCat || null,
          categoriaNombre: nombreFinalCategoria,
          esNuevaCategoria,
          posicionPrincipal: f.posicionprincipal || f.posicion_principal || PosicionJugador.SIN_DEFINIR,
          piernaHabil: (f.piernahabil || f.pierna_habil || f.pierna || PiernaHabil.DIESTRO).toString().toUpperCase().includes('IZQ') ? PiernaHabil.ZURDO : ((f.piernahabil || f.pierna_habil || f.pierna || '').toString().toUpperCase().includes('AMB') ? PiernaHabil.AMBIDIESTRO : PiernaHabil.DIESTRO),
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
      // 1. Resolver Categoría (por código exacto o nombre)
      const catKey = (fila.codigoCategoria || fila.categoriaNombre).toLowerCase();
      let catId = catCache.get(catKey);
      if (!catId) {
        const cat = await this.jugadoresRepository.findOrCreateCategoria(
          clubId,
          fila.categoriaNombre,
          fila.codigoCategoria
        );
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
