import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface EvaluacionBiometricaEntity {
  id: string;
  jugador_id: string;
  evaluador_id?: string;
  fecha_evaluacion: Date | string;
  peso_kg?: number;
  talla_cm?: number;
  imc?: number;
  test_cooper_metros?: number;
  velocidad_30m_seg?: number;
  salto_vertical_cm?: number;
  observaciones?: string;
  jugador_nombre?: string;
  numero_dorsal?: number;
  posicion_principal?: string;
  categoria_id?: string;
  avatar_url?: string;
  categoria_nombre?: string;
  codigo_categoria?: string;
  color_distintivo?: string;
}

export interface CreateEvaluacionBiometricaData {
  jugadorId: string;
  fechaEvaluacion?: Date | string;
  pesoKg?: number;
  tallaCm?: number;
  imc?: number | null;
  testCooperMetros?: number;
  velocidad30mSeg?: number;
  saltoVerticalCm?: number;
  observaciones?: string;
}

export interface FindBiometriaFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoriaId?: string;
  diagnostico?: string;
  sortBy?: string;
}

@Injectable()
export class BiometriaRepository {
  constructor(private readonly db: DatabaseService) {}

  async createEvaluacion(
    evaluadorId: string | null,
    data: CreateEvaluacionBiometricaData,
  ): Promise<EvaluacionBiometricaEntity> {
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
        evaluadorId,
        data.fechaEvaluacion || new Date(),
        data.pesoKg,
        data.tallaCm,
        data.imc,
        data.testCooperMetros || null,
        data.velocidad30mSeg || null,
        data.saltoVerticalCm || null,
        data.observaciones || null,
      ],
    );
    return res.rows[0];
  }

  async findHistorialByJugador(jugadorId: string): Promise<EvaluacionBiometricaEntity[]> {
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

  async findByClubPaginated(
    clubId: string,
    options?: FindBiometriaFilterOptions,
  ): Promise<{ data: EvaluacionBiometricaEntity[]; total: number; page: number; limit: number; totalPages: number }> {
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
