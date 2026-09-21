import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ConvocatoriasService {
  constructor(private readonly db: DatabaseService) {}

  async findByPartido(partidoId: string) {
    const jugadoresRes = await this.db.query(
      `SELECT c.*, j.nombres, j.apellidos, j.numero_dorsal, j.posicion_principal, j.foto_url
       FROM competicion.convocatorias c
       JOIN deportivo.jugadores j ON j.id = c.jugador_id
       WHERE c.partido_id = $1
       ORDER BY 
         CASE c.rol_convocatoria 
           WHEN 'TITULAR' THEN 1 
           WHEN 'SUPLENTE' THEN 2 
           WHEN 'RESERVA' THEN 3 
           ELSE 4 
         END,
         j.numero_dorsal ASC NULLS LAST`,
      [partidoId],
    );

    const partidoRes = await this.db.query(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM competicion.partidos p
       JOIN deportivo.categorias c ON c.id = p.categoria_id
       WHERE p.id = $1`,
      [partidoId],
    );

    return {
      partido: partidoRes.rows[0] || null,
      convocatoria: { id: partidoId, partido_id: partidoId },
      jugadores: jugadoresRes.rows,
    };
  }

  async responderConvocatoria(convocatoriaId: string, estado: string, motivoExcusa?: string, jugadorId?: string) {
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
}
