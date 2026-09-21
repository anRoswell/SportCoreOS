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

  async findByClub(clubId: string) {
    const res = await this.db.query(
      `SELECT eb.*, 
              CONCAT(j.nombres, ' ', j.apellidos) as jugador_nombre,
              j.numero_dorsal, j.posicion_principal,
              c.nombre as categoria_nombre, c.codigo_categoria
       FROM rendimiento.evaluaciones_biometricas eb
       JOIN deportivo.jugadores j ON j.id = eb.jugador_id
       JOIN deportivo.categorias c ON c.id = j.categoria_id
       WHERE j.club_id = $1
       ORDER BY eb.fecha_evaluacion DESC, j.apellidos ASC`,
      [clubId],
    );
    return res.rows;
  }
}
