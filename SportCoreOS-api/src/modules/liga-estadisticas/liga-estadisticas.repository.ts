import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { RegistrarPartidoLigaDto, LigaJugadorEstadisticaDto } from './liga-estadisticas.dto';

type FuenteCarga = 'MANUAL' | 'CSV';

const CSV_HEADERS = [
  'dorsal', 'minutos', 'goles', 'asistencias', 'remates', 'remates_a_puerta',
  'pases_clave', 'regates_exitosos', 'recuperaciones', 'intercepciones', 'duelos_ganados', 'atajadas',
];

@Injectable()
export class LigaEstadisticasRepository {
  constructor(private readonly db: DatabaseService) {}

  async list(clubId: string, filters: { categoriaId?: string; temporada?: string } = {}) {
    const params: any[] = [clubId];
    const where = ['m.club_id = $1'];
    if (filters.categoriaId) {
      params.push(filters.categoriaId);
      where.push(`m.categoria_id = $${params.length}`);
    }
    if (filters.temporada) {
      params.push(filters.temporada);
      where.push(`m.temporada = $${params.length}`);
    }

    const [partidos, ranking] = await Promise.all([
      this.db.query(
        `SELECT m.id, m.competencia_nombre, m.temporada, m.fecha_partido, m.rival_nombre,
                m.goles_club, m.goles_rival, m.estado, m.fuente,
                c.nombre AS categoria_nombre,
                COUNT(s.id)::int AS jugadores_registrados,
                COALESCE(SUM(s.xp_acreditado), 0)::int AS xp_acreditado,
                m.created_at
         FROM rendimiento.liga_partidos_externos m
         JOIN deportivo.categorias c ON c.id = m.categoria_id
         LEFT JOIN rendimiento.liga_estadisticas_jugador s ON s.partido_id = m.id
         WHERE ${where.join(' AND ')}
         GROUP BY m.id, c.nombre
         ORDER BY m.fecha_partido DESC, m.created_at DESC
         LIMIT 50`,
        params,
      ),
      this.db.query(
        `SELECT j.id AS jugador_id, j.nombres, j.apellidos, j.numero_dorsal,
                j.posicion_principal, c.nombre AS categoria_nombre,
                COUNT(DISTINCT m.id)::int AS partidos,
                COALESCE(SUM(s.minutos), 0)::int AS minutos,
                COALESCE(SUM(s.goles), 0)::int AS goles,
                COALESCE(SUM(s.asistencias), 0)::int AS asistencias,
                COALESCE(SUM(s.remates), 0)::int AS remates,
                COALESCE(SUM(s.remates_a_puerta), 0)::int AS remates_a_puerta,
                COALESCE(SUM(s.pases_clave), 0)::int AS pases_clave,
                COALESCE(SUM(s.regates_exitosos), 0)::int AS regates_exitosos,
                COALESCE(SUM(s.recuperaciones), 0)::int AS recuperaciones,
                COALESCE(SUM(s.intercepciones), 0)::int AS intercepciones,
                COALESCE(SUM(s.duelos_ganados), 0)::int AS duelos_ganados,
                COALESCE(SUM(s.atajadas), 0)::int AS atajadas,
                COALESCE(SUM(s.xp_acreditado), 0)::int AS xp_liga,
                CASE WHEN COALESCE(SUM(s.remates), 0) = 0 THEN 0
                     ELSE ROUND(100.0 * SUM(s.remates_a_puerta) / SUM(s.remates), 1) END AS precision_remate
         FROM rendimiento.liga_estadisticas_jugador s
         JOIN rendimiento.liga_partidos_externos m ON m.id = s.partido_id AND m.club_id = s.club_id
         JOIN deportivo.jugadores j ON j.id = s.jugador_id AND j.club_id = s.club_id
         JOIN deportivo.categorias c ON c.id = j.categoria_id
         WHERE ${where.join(' AND ')} AND m.estado = 'VALIDADO'
         GROUP BY j.id, c.nombre
         ORDER BY xp_liga DESC, goles DESC, asistencias DESC, j.apellidos ASC, j.nombres ASC`,
        params,
      ),
    ]);

    return { partidos: partidos.rows, ranking: ranking.rows };
  }

  async createPending(
    clubId: string,
    actorId: string,
    data: RegistrarPartidoLigaDto,
    jugadores: Array<LigaJugadorEstadisticaDto & { jugadorId: string }>,
    fuente: FuenteCarga,
  ) {
    const category = await this.db.query(
      `SELECT id FROM deportivo.categorias WHERE id = $1 AND club_id = $2 AND activa = TRUE`,
      [data.categoriaId, clubId],
    );
    if (!category.rows.length) throw new NotFoundException('La categoría no pertenece a la escuela activa.');

    const playerIds = jugadores.map((p) => p.jugadorId);
    const playerRes = await this.db.query(
      `SELECT id FROM deportivo.jugadores
       WHERE club_id = $1 AND categoria_id = $2 AND estado_matricula = 'ACTIVO' AND id = ANY($3::uuid[])`,
      [clubId, data.categoriaId, playerIds],
    );
    if (playerRes.rows.length !== playerIds.length) {
      throw new NotFoundException('Uno o más jugadores no pertenecen a la categoría activa de esta escuela.');
    }

    const canonicalData = {
      categoryId: data.categoriaId,
      competition: data.competenciaNombre.trim(),
      season: data.temporada.trim(),
      date: data.fechaPartido.slice(0, 10),
      rival: data.rivalNombre.trim(),
      clubScore: Number(data.golesClub),
      rivalScore: Number(data.golesRival),
    };
    const fingerprint = createHash('sha256').update(JSON.stringify(canonicalData)).digest('hex');

    const client = await this.db.getPool().connect();
    try {
      await client.query('BEGIN');
      const match = await client.query(
        `INSERT INTO rendimiento.liga_partidos_externos
           (club_id, categoria_id, competencia_nombre, temporada, fecha_partido, rival_nombre,
            goles_club, goles_rival, fuente, fingerprint, cargado_por)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [clubId, data.categoriaId, canonicalData.competition, canonicalData.season, canonicalData.date,
          canonicalData.rival, canonicalData.clubScore, canonicalData.rivalScore, fuente, fingerprint, actorId],
      );
      const matchId = match.rows[0].id;
      for (const player of jugadores) {
        await client.query(
          `INSERT INTO rendimiento.liga_estadisticas_jugador
             (club_id, partido_id, jugador_id, minutos, goles, asistencias, remates, remates_a_puerta,
              pases_clave, regates_exitosos, recuperaciones, intercepciones, duelos_ganados, atajadas)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [clubId, matchId, player.jugadorId, player.minutos, player.goles, player.asistencias,
            player.remates, player.rematesAPuerta, player.pasesClave, player.regatesExitosos,
            player.recuperaciones, player.intercepciones, player.duelosGanados, player.atajadas],
        );
      }
      await client.query('COMMIT');
      return { id: matchId, estado: 'PENDIENTE', fuente, fingerprint };
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error?.code === '23505') {
        throw new ConflictException('Este partido y estas estadísticas ya fueron cargados.');
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async validate(clubId: string, actorId: string, matchId: string) {
    const client = await this.db.getPool().connect();
    try {
      await client.query('BEGIN');
      const matchRes = await client.query(
        `SELECT * FROM rendimiento.liga_partidos_externos
         WHERE id = $1 AND club_id = $2 FOR UPDATE`,
        [matchId, clubId],
      );
      if (!matchRes.rows.length) throw new NotFoundException('No se encontró el partido en la escuela activa.');
      const match = matchRes.rows[0];
      if (match.estado === 'VALIDADO') throw new ConflictException('Este partido ya fue validado y acreditado.');

      const statsRes = await client.query(
        `SELECT s.*, j.posicion_principal
         FROM rendimiento.liga_estadisticas_jugador s
         JOIN deportivo.jugadores j ON j.id = s.jugador_id AND j.club_id = s.club_id
         WHERE s.partido_id = $1 AND s.club_id = $2 FOR UPDATE OF s`,
        [matchId, clubId],
      );
      if (!statsRes.rows.length) throw new ConflictException('El acta no contiene estadísticas de jugadores.');

      let totalXp = 0;
      for (const row of statsRes.rows) {
        const xp = this.calculateMatchXp(row);
        if (xp <= 0) continue;
        const movement = await client.query(
          `INSERT INTO rendimiento.xp_movimientos
             (club_id, jugador_id, fuente_tipo, fuente_id, xp_delta, descripcion, actor_id)
           VALUES ($1, $2, 'LIGA_PARTIDO', $3, $4, $5, $6)
           ON CONFLICT (club_id, fuente_tipo, fuente_id) DO NOTHING
           RETURNING id`,
          [clubId, row.jugador_id, row.id, xp, `XP por participación en ${match.competencia_nombre}`, actorId],
        );
        if (movement.rows.length) {
          await client.query(
            `UPDATE deportivo.jugadores
             SET xp_total = COALESCE(xp_total, 0) + $1,
                 xp_liga = COALESCE(xp_liga, 0) + $1,
                 updated_at = NOW()
             WHERE id = $2 AND club_id = $3`,
            [xp, row.jugador_id, clubId],
          );
          totalXp += xp;
        }
        await client.query(
          `UPDATE rendimiento.liga_estadisticas_jugador SET xp_acreditado = $1 WHERE id = $2`,
          [xp, row.id],
        );
      }
      await client.query(
        `UPDATE rendimiento.liga_partidos_externos
         SET estado = 'VALIDADO', validado_por = $1, fecha_validacion = NOW()
         WHERE id = $2 AND club_id = $3`,
        [actorId, matchId, clubId],
      );
      await client.query('COMMIT');
      return { id: matchId, estado: 'VALIDADO', xpAcreditado: totalXp };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private calculateMatchXp(row: any): number {
    const played = Number(row.minutos) > 0 ? 10 : 0;
    const offense = Number(row.goles) * 15 + Number(row.asistencias) * 10
      + Math.min(Number(row.remates_a_puerta), 5) * 2
      + Math.min(Number(row.pases_clave), 5) * 2
      + Math.min(Number(row.regates_exitosos), 5) * 1;
    const defense = Math.min(Number(row.recuperaciones), 8)
      + Math.min(Number(row.intercepciones), 5) * 2
      + Math.min(Number(row.duelos_ganados), 5);
    const goalkeeping = Math.min(Number(row.atajadas), 10) * 2;
    return Math.min(60, played + offense + defense + goalkeeping);
  }

  async resolveDorsals(clubId: string, categoriaId: string) {
    const result = await this.db.query(
      `SELECT id, numero_dorsal FROM deportivo.jugadores
       WHERE club_id = $1 AND categoria_id = $2 AND estado_matricula = 'ACTIVO'
         AND numero_dorsal IS NOT NULL`,
      [clubId, categoriaId],
    );
    return new Map<number, string>(result.rows.map((row: any) => [Number(row.numero_dorsal), row.id]));
  }

  parseCsv(csv: string, dorsalToPlayerId: Map<number, string>): LigaJugadorEstadisticaDto[] {
    const rows = csv.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
    if (rows.length < 2) throw new ConflictException('El CSV debe incluir encabezados y al menos una fila de jugador.');
    const headers = this.parseCsvLine(rows[0]).map((value) => value.trim().toLowerCase());
    if (headers.join(',') !== CSV_HEADERS.join(',')) {
      throw new ConflictException(`Encabezados CSV esperados: ${CSV_HEADERS.join(',')}`);
    }
    const parsed: LigaJugadorEstadisticaDto[] = [];
    const seen = new Set<number>();
    for (const [index, line] of rows.slice(1).entries()) {
      const values = this.parseCsvLine(line);
      if (values.length !== CSV_HEADERS.length) {
        throw new ConflictException(`La fila ${index + 2} tiene ${values.length} columnas; se esperaban ${CSV_HEADERS.length}.`);
      }
      const numeric = values.map((value) => Number(value.trim()));
      if (numeric.some((value) => !Number.isInteger(value) || value < 0)) {
        throw new ConflictException(`La fila ${index + 2} contiene estadísticas vacías o no válidas.`);
      }
      const [dorsal, minutos, goles, asistencias, remates, rematesAPuerta, pasesClave,
        regatesExitosos, recuperaciones, intercepciones, duelosGanados, atajadas] = numeric;
      const jugadorId = dorsalToPlayerId.get(dorsal);
      if (!jugadorId) throw new NotFoundException(`No hay un jugador activo con dorsal ${dorsal} en la categoría seleccionada.`);
      if (seen.has(dorsal)) throw new ConflictException(`El dorsal ${dorsal} aparece más de una vez en el CSV.`);
      if (dorsal < 1 || dorsal > 99 || minutos > 120 || rematesAPuerta > remates) {
        throw new ConflictException(`La fila ${index + 2} incumple los rangos permitidos.`);
      }
      seen.add(dorsal);
      parsed.push({ jugadorId, dorsal, minutos, goles, asistencias, remates, rematesAPuerta,
        pasesClave, regatesExitosos, recuperaciones, intercepciones, duelosGanados, atajadas });
    }
    return parsed;
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let index = 0; index < line.length; index++) {
      const char = line[index];
      if (char === '"' && inQuotes && line[index + 1] === '"') {
        current += '"';
        index++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (inQuotes) throw new ConflictException('El CSV contiene comillas sin cerrar.');
    values.push(current);
    return values;
  }
}
