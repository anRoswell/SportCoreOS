import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class BiometriaService {
  constructor(private readonly db: DatabaseService) {}

  async registrarEvaluacion(clubId: string, evaluadorId: string, data: any) {
    const m = data.tallaCm ? data.tallaCm / 100 : null;
    const imc = m && data.pesoKg ? parseFloat((data.pesoKg / (m * m)).toFixed(1)) : null;

    const res = await this.db.query(
      `INSERT INTO rendimiento.evaluaciones_biometricas (
        jugador_id, evaluador_id, fecha_evaluacion,
        peso_kg, talla_cm, imc,
        test_cooper_metros, velocidad_30m_seg, salto_vertical_cm,
        observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.jugadorId,
        evaluadorId || null,
        data.fechaEvaluacion || new Date(),
        data.pesoKg,
        data.tallaCm,
        imc,
        data.testCooperMetros || null,
        data.testVelocidad30mSeg || data.velocidad30mSeg || null,
        data.testSaltoVerticalCm || data.saltoVerticalCm || null,
        data.observacionesMedicas || data.observaciones || null,
      ],
    );
    return res.rows[0];
  }

  async getHistorialJugador(jugadorId: string) {
    const res = await this.db.query(
      `SELECT eb.*, CONCAT(u.nombre, ' ', u.apellido) as evaluador_nombre
       FROM rendimiento.evaluaciones_biometricas eb
       LEFT JOIN core.usuarios u ON u.id = eb.evaluador_id
       WHERE eb.jugador_id = $1
       ORDER BY eb.fecha_evaluacion ASC`,
      [jugadorId],
    );
    return res.rows;
  }

  async findByClub(
    clubId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      categoriaId?: string;
      diagnostico?: string;
      sortBy?: string;
    },
  ) {
    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options?.limit) || 10));
    const offset = (page - 1) * limit;

    const whereParts = ['j.club_id = $1'];
    const params: any[] = [clubId];

    if (options?.categoriaId && options.categoriaId !== 'TODAS') {
      params.push(options.categoriaId);
      whereParts.push(`j.categoria_id = $${params.length}`);
    }

    if (options?.diagnostico && options.diagnostico !== 'TODOS') {
      if (options.diagnostico === 'OPTIMO') {
        whereParts.push('(eb.imc >= 18.5 AND eb.imc <= 24.9)');
      } else if (options.diagnostico === 'SOBREPESO') {
        whereParts.push('(eb.imc >= 25.0 AND eb.imc <= 29.9)');
      } else if (options.diagnostico === 'OBESIDAD') {
        whereParts.push('(eb.imc >= 30.0)');
      } else if (options.diagnostico === 'BAJOPESO') {
        whereParts.push('(eb.imc < 18.5)');
      }
    }

    if (options?.search && options.search.trim()) {
      params.push(`%${options.search.trim()}%`);
      const pIdx = params.length;
      whereParts.push(
        `(j.nombres ILIKE $${pIdx} OR j.apellidos ILIKE $${pIdx} OR CAST(j.numero_dorsal AS TEXT) ILIKE $${pIdx} OR eb.observaciones ILIKE $${pIdx})`,
      );
    }

    let orderClause = 'ORDER BY eb.fecha_evaluacion DESC, j.apellidos ASC';
    if (options?.sortBy === 'FECHA_ASC') orderClause = 'ORDER BY eb.fecha_evaluacion ASC';
    else if (options?.sortBy === 'IMC_DESC') orderClause = 'ORDER BY eb.imc DESC NULLS LAST';
    else if (options?.sortBy === 'IMC_ASC') orderClause = 'ORDER BY eb.imc ASC NULLS LAST';
    else if (options?.sortBy === 'COOPER_DESC') orderClause = 'ORDER BY eb.test_cooper_metros DESC NULLS LAST';
    else if (options?.sortBy === 'VELOCIDAD_ASC') orderClause = 'ORDER BY eb.velocidad_30m_seg ASC NULLS LAST';
    else if (options?.sortBy === 'SALTO_DESC') orderClause = 'ORDER BY eb.salto_vertical_cm DESC NULLS LAST';
    else if (options?.sortBy === 'JUGADOR_ASC') orderClause = 'ORDER BY j.apellidos ASC, j.nombres ASC';

    const countRes = await this.db.query(
      `SELECT COUNT(*) as count
       FROM rendimiento.evaluaciones_biometricas eb
       JOIN deportivo.jugadores j ON j.id = eb.jugador_id
       JOIN deportivo.categorias c ON c.id = j.categoria_id
       WHERE ${whereParts.join(' AND ')}`,
      params,
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const queryParams = [...params, limit, offset];
    const dataRes = await this.db.query(
      `SELECT eb.*, 
              CONCAT(j.nombres, ' ', j.apellidos) as jugador_nombre,
              j.numero_dorsal, j.posicion_principal, j.categoria_id, j.foto_url as avatar_url,
              c.nombre as categoria_nombre, c.codigo_categoria, c.color_distintivo
       FROM rendimiento.evaluaciones_biometricas eb
       JOIN deportivo.jugadores j ON j.id = eb.jugador_id
       JOIN deportivo.categorias c ON c.id = j.categoria_id
       WHERE ${whereParts.join(' AND ')}
       ${orderClause}
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
      queryParams,
    );

    return {
      data: dataRes.rows,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
