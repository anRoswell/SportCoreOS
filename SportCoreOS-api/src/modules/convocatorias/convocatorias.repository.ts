import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RolConvocatoria, EstadoConfirmacionConvocatoria } from '../../common/enums/domain.enums';

export interface ConvocatoriaJugadorEntity {
  id: string;
  partido_id: string;
  jugador_id: string;
  rol_convocatoria: RolConvocatoria | string;
  posicion_designada?: string;
  estado_confirmacion: EstadoConfirmacionConvocatoria | string;
  motivo_excusa?: string;
  fecha_confirmacion?: Date;
  nombres?: string;
  apellidos?: string;
  numero_dorsal?: number;
  posicion_principal?: string;
  foto_url?: string;
}

export interface PartidoConvocatoriaInfo {
  id: string;
  club_id: string;
  categoria_id: string;
  categoria_nombre?: string;
  rival_nombre: string;
  fecha_partido: string;
  hora_partido: string;
  hora_citacion?: string;
  sede_cancha?: string;
}

@Injectable()
export class ConvocatoriasRepository {
  constructor(private readonly db: DatabaseService) {}

  async findJugadoresConvocados(partidoId: string): Promise<ConvocatoriaJugadorEntity[]> {
    const res = await this.db.query(
      `SELECT c.*, j.nombres, j.apellidos, j.numero_dorsal, j.posicion_principal, j.foto_url
       FROM competicion.convocatorias c
       JOIN deportivo.jugadores j ON j.id = c.jugador_id
       WHERE c.partido_id = $1
       ORDER BY 
         CASE c.rol_convocatoria 
           WHEN '${RolConvocatoria.TITULAR}' THEN 1 
           WHEN '${RolConvocatoria.SUPLENTE}' THEN 2 
           WHEN '${RolConvocatoria.RESERVA}' THEN 3 
           ELSE 4 
         END,
         j.numero_dorsal ASC NULLS LAST`,
      [partidoId],
    );
    return res.rows;
  }

  async findPartidoInfo(partidoId: string): Promise<PartidoConvocatoriaInfo | null> {
    const res = await this.db.query(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM competicion.partidos p
       JOIN deportivo.categorias c ON c.id = p.categoria_id
       WHERE p.id = $1`,
      [partidoId],
    );
    return res.rows[0] || null;
  }

  async updateEstadoConfirmacion(
    convocatoriaId: string,
    estado: EstadoConfirmacionConvocatoria | string,
    motivoExcusa?: string,
    jugadorId?: string,
  ): Promise<any> {
    let query = `
      UPDATE competicion.convocatorias
      SET estado_confirmacion = $1, motivo_excusa = $2, fecha_confirmacion = NOW()
      WHERE id = $3
      RETURNING *
    `;
    let params: any[] = [estado, motivoExcusa || null, convocatoriaId];

    if (jugadorId) {
      query = `
        UPDATE competicion.convocatorias
        SET estado_confirmacion = $1, motivo_excusa = $2, fecha_confirmacion = NOW()
        WHERE (id = $3 OR (partido_id = $3 AND jugador_id = $4))
        RETURNING *
      `;
      params = [estado, motivoExcusa || null, convocatoriaId, jugadorId];
    }

    const res = await this.db.query(query, params);
    return res.rows[0];
  }

  async findJugadorPosicion(jugadorId: string): Promise<string | null> {
    const res = await this.db.query(
      `SELECT posicion_principal FROM deportivo.jugadores WHERE id = $1`,
      [jugadorId],
    );
    return res.rows[0]?.posicion_principal || null;
  }

  async upsertJugadorConvocatoria(
    partidoId: string,
    jugadorId: string,
    rol: RolConvocatoria | string,
    posicion: string,
  ): Promise<any> {
    const res = await this.db.query(
      `INSERT INTO competicion.convocatorias (
         partido_id, jugador_id, rol_convocatoria, posicion_designada, estado_confirmacion
       ) VALUES ($1, $2, $3, $4, '${EstadoConfirmacionConvocatoria.PENDIENTE}')
       ON CONFLICT (partido_id, jugador_id) 
       DO UPDATE SET rol_convocatoria = EXCLUDED.rol_convocatoria, posicion_designada = EXCLUDED.posicion_designada
       RETURNING *`,
      [partidoId, jugadorId, rol, posicion],
    );
    return res.rows[0];
  }

  async deleteJugadorConvocatoria(partidoId: string, jugadorId: string): Promise<any> {
    const res = await this.db.query(
      `DELETE FROM competicion.convocatorias 
       WHERE partido_id = $1 AND (jugador_id::text = $2 OR id::text = $2)
       RETURNING *`,
      [partidoId, jugadorId],
    );
    return res.rows[0] || { deleted: true };
  }

  async updateRolConvocatoria(partidoId: string, jugadorId: string, nuevoRol: string): Promise<any> {
    const res = await this.db.query(
      `UPDATE competicion.convocatorias
       SET rol_convocatoria = $3
       WHERE partido_id = $1 AND (jugador_id::text = $2 OR id::text = $2)
       RETURNING *`,
      [partidoId, jugadorId, nuevoRol],
    );
    return res.rows[0];
  }

  async findJugadoresDisponiblesParaSugerencia(
    clubId: string,
    categoriaId: string,
    limit: number,
  ): Promise<any[]> {
    const res = await this.db.query(
      `SELECT j.id, j.posicion_principal, j.numero_dorsal
       FROM deportivo.jugadores j
       WHERE j.club_id = $1 AND j.categoria_id = $2 AND j.estado_matricula = 'ACTIVO'
       ORDER BY j.numero_dorsal ASC NULLS LAST
       LIMIT $3`,
      [clubId, categoriaId, limit],
    );
    return res.rows;
  }

  async insertSugerido(
    partidoId: string,
    jugadorId: string,
    rol: RolConvocatoria | string,
    posicion: string,
  ): Promise<void> {
    await this.db.query(
      `INSERT INTO competicion.convocatorias (
         partido_id, jugador_id, rol_convocatoria, posicion_designada, estado_confirmacion
       ) VALUES ($1, $2, $3, $4, '${EstadoConfirmacionConvocatoria.PENDIENTE}')
       ON CONFLICT (partido_id, jugador_id) DO NOTHING`,
      [partidoId, jugadorId, rol, posicion],
    );
  }
}
