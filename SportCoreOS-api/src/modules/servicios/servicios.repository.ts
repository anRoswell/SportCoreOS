import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateServicioDto, InscribirServicioDto } from './servicios.dto';
import * as crypto from 'crypto';

@Injectable()
export class ServiciosRepository {
  constructor(private readonly db: DatabaseService) {}

  async findServicios(
    clubId: string,
    options?: {
      categoria?: string;
      search?: string;
      soloActivos?: boolean;
    },
  ) {
    const whereParts = ['s.club_id = $1'];
    const params: any[] = [clubId];

    if (options?.soloActivos !== false) {
      whereParts.push('s.activo = true');
    }

    if (options?.categoria && options.categoria !== 'TODAS') {
      params.push(options.categoria);
      whereParts.push(`s.categoria_servicio = $${params.length}`);
    }

    if (options?.search && options.search.trim()) {
      params.push(`%${options.search.trim()}%`);
      const pIdx = params.length;
      whereParts.push(`(s.titulo ILIKE $${pIdx} OR s.subtitulo ILIKE $${pIdx} OR s.entrenador_nombre ILIKE $${pIdx} OR s.cancha_nombre ILIKE $${pIdx})`);
    }

    const query = `
      SELECT s.*,
             (SELECT COUNT(*) FROM public.inscripciones_servicios i WHERE i.servicio_id = s.id AND i.estado_pago = 'APROBADO') as total_inscritos
      FROM public.servicios_especializados s
      WHERE ${whereParts.join(' AND ')}
      ORDER BY s.destacado DESC, s.created_at DESC
    `;

    const res = await this.db.query(query, params);
    return res.rows;
  }

  async findServicioById(id: string, clubId: string) {
    const res = await this.db.query(
      `SELECT s.*,
              (SELECT COUNT(*) FROM public.inscripciones_servicios i WHERE i.servicio_id = s.id AND i.estado_pago = 'APROBADO') as total_inscritos
       FROM public.servicios_especializados s
       WHERE s.id = $1 AND s.club_id = $2`,
      [id, clubId],
    );
    return res.rows[0] || null;
  }

  async createServicio(clubId: string, dto: CreateServicioDto) {
    const res = await this.db.query(
      `INSERT INTO public.servicios_especializados (
        club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
        entrenador_nombre, entrenador_avatar, entrenador_badge,
        cancha_nombre, cancha_direccion, cancha_gps_url,
        dias_semana, horario_rango, duracion_minutos,
        edad_min, edad_max, cupos_totales, cupos_ocupados,
        precio_sesion_individual, precio_paquete_mensual, descuento_hermanos_pct,
        insignia_obtenida, descripcion, beneficios, destacado, activo
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15,
        $16, $17, $18, $19,
        $20, $21, $22,
        $23, $24, $25, $26, true
      ) RETURNING *`,
      [
        clubId,
        dto.titulo,
        dto.subtitulo,
        dto.categoria_servicio,
        dto.icono || 'fa-bolt',
        dto.color_tema || '#10b981',
        dto.entrenador_nombre,
        dto.entrenador_avatar || null,
        dto.entrenador_badge || 'Entrenador Certificado',
        dto.cancha_nombre,
        dto.cancha_direccion,
        dto.cancha_gps_url || null,
        dto.dias_semana,
        dto.horario_rango,
        dto.duracion_minutos || 90,
        dto.edad_min || 7,
        dto.edad_max || 16,
        dto.cupos_totales || 15,
        0,
        dto.precio_sesion_individual,
        dto.precio_paquete_mensual,
        dto.descuento_hermanos_pct || 15,
        dto.insignia_obtenida,
        dto.descripcion,
        JSON.stringify(dto.beneficios || []),
        true,
      ],
    );
    return res.rows[0];
  }

  async inscribir(clubId: string, servicioId: string, dto: InscribirServicioDto) {
    const servicio = await this.findServicioById(servicioId, clubId);
    if (!servicio) {
      throw new NotFoundException('El servicio o clínica especializada no existe');
    }

    if (Number(servicio.cupos_ocupados) >= Number(servicio.cupos_totales)) {
      throw new BadRequestException('Lo sentimos, los cupos para esta clínica especializada se han agotado.');
    }

    const isDirectInstant = dto.metodo_pago === 'WOMPI_PSE';
    const estadoPago = isDirectInstant && !dto.comprobante_url ? 'APROBADO' : 'PENDIENTE_APROBACION';

    const prefix = dto.metodo_pago.includes('NEQUI')
      ? 'NEQUI-SPORT'
      : dto.metodo_pago.includes('TRANSFERENCIA')
      ? 'TRANSF-SPORT'
      : 'WOMPI-SPORT';

    const referencia = dto.referencia_transaccion || `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const codigoQr = `SPORT-PASS-${crypto.randomUUID().toUpperCase()}`;

    const res = await this.db.query(
      `INSERT INTO public.inscripciones_servicios (
        servicio_id, club_id, jugador_id,
        nombre_jugador, nombre_acudiente, telefono_acudiente, email_acudiente,
        tipo_plan, monto_pagado, metodo_pago, referencia_transaccion, codigo_qr_ticket,
        comprobante_url, estado_pago, fecha_inscripcion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING *`,
      [
        servicioId,
        clubId,
        dto.jugador_id || null,
        dto.nombre_jugador,
        dto.nombre_acudiente,
        dto.telefono_acudiente,
        dto.email_acudiente || null,
        dto.tipo_plan,
        dto.monto_pagado,
        dto.metodo_pago,
        referencia,
        codigoQr,
        dto.comprobante_url || null,
        estadoPago,
      ],
    );

    // Incrementar cupos_ocupados para reservar el lugar del atleta
    await this.db.query(
      `UPDATE public.servicios_especializados
       SET cupos_ocupados = cupos_ocupados + 1, updated_at = NOW()
       WHERE id = $1`,
      [servicioId],
    );

    const mensaje = estadoPago === 'APROBADO'
      ? `¡Inscripción exitosa a la clínica "${servicio.titulo}"! Pase digital activo.`
      : `Comprobante de pago Nequi/Transferencia recibido. Tu Pase QR quedará activo tan pronto Tesorería valide el soporte.`;

    return {
      inscripcion: res.rows[0],
      servicio,
      mensaje,
    };
  }

  async aprobarInscripcion(
    clubId: string,
    inscripcionId: string,
    user: any,
    dto: { estado: 'APROBADO' | 'RECHAZADO'; notas_tesoreria?: string; motivo_rechazo?: string },
  ) {
    const inscripcionRes = await this.db.query(
      `SELECT * FROM public.inscripciones_servicios WHERE id = $1 AND club_id = $2`,
      [inscripcionId, clubId],
    );

    const inscripcion = inscripcionRes.rows[0];
    if (!inscripcion) {
      throw new NotFoundException('Inscripción no encontrada en este club');
    }

    const userName = user?.nombre ? `${user.nombre} (Tesorería)` : 'Tesorería / Admin Financiero';
    const userId = user?.sub || user?.id || null;

    if (dto.estado === 'APROBADO') {
      const res = await this.db.query(
        `UPDATE public.inscripciones_servicios
         SET estado_pago = 'APROBADO',
             fecha_aprobacion = NOW(),
             aprobado_por_user_id = $1,
             aprobado_por_nombre = $2,
             notas_tesoreria = $3,
             motivo_rechazo = NULL
         WHERE id = $4
         RETURNING *`,
        [userId, userName, dto.notas_tesoreria || 'Comprobante verificado con éxito', inscripcionId],
      );
      return {
        inscripcion: res.rows[0],
        mensaje: `Pago aprobado por Tesorería. Pase digital activado para el atleta ${inscripcion.nombre_jugador}.`,
      };
    } else {
      // Si se rechaza y estaba previamente ocupando cupo, liberar el cupo
      if (inscripcion.estado_pago !== 'RECHAZADO') {
        await this.db.query(
          `UPDATE public.servicios_especializados
           SET cupos_ocupados = GREATEST(cupos_ocupados - 1, 0), updated_at = NOW()
           WHERE id = $1`,
          [inscripcion.servicio_id],
        );
      }

      const res = await this.db.query(
        `UPDATE public.inscripciones_servicios
         SET estado_pago = 'RECHAZADO',
             fecha_aprobacion = NOW(),
             aprobado_por_user_id = $1,
             aprobado_por_nombre = $2,
             motivo_rechazo = $3,
             notas_tesoreria = $4
         WHERE id = $5
         RETURNING *`,
        [
          userId,
          userName,
          dto.motivo_rechazo || 'Comprobante ilegible o valor no coincide',
          dto.notas_tesoreria || null,
          inscripcionId,
        ],
      );
      return {
        inscripcion: res.rows[0],
        mensaje: `Inscripción rechazada. El cupo ha sido liberado para otros atletas.`,
      };
    }
  }

  async findInscripcionesByServicio(servicioId: string, clubId: string) {
    const res = await this.db.query(
      `SELECT i.*, s.titulo as servicio_titulo, s.icono, s.color_tema, s.horario_rango, s.dias_semana, s.cancha_nombre
       FROM public.inscripciones_servicios i
       JOIN public.servicios_especializados s ON s.id = i.servicio_id
       WHERE i.servicio_id = $1 AND i.club_id = $2
       ORDER BY i.fecha_inscripcion DESC`,
      [servicioId, clubId],
    );
    return res.rows;
  }

  async findInscripcionesPendientes(clubId: string) {
    const res = await this.db.query(
      `SELECT i.*, s.titulo as servicio_titulo, s.icono, s.color_tema, s.horario_rango, s.dias_semana, s.cancha_nombre
       FROM public.inscripciones_servicios i
       JOIN public.servicios_especializados s ON s.id = i.servicio_id
       WHERE i.club_id = $1 AND i.estado_pago = 'PENDIENTE_APROBACION'
       ORDER BY i.fecha_inscripcion DESC`,
      [clubId],
    );
    return res.rows;
  }
}
