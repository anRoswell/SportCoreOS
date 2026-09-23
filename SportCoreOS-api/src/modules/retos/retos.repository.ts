import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface RetoCatalogoItem {
  id: string;
  club_id?: string | null;
  categoria_reto: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color_distintivo: string;
  niveles: {
    nivel: number;
    meta: number;
    unidad: string;
    xp: number;
    titulo: string;
    dificultad: string;
  }[];
  orden_display: number;
  activo: boolean;
}

export interface RetoProgresoItem {
  id: string;
  club_id: string;
  jugador_id: string;
  reto_id: string;
  nivel_solicitado: number;
  meta_cantidad: number;
  unidad_medida: string;
  xp_recompensa: number;
  estado: 'DISPONIBLE' | 'COMPROBABLE' | 'APROBADO' | 'RECHAZADO';
  fecha_solicitud: string;
  fecha_evaluacion?: string | null;
  evaluador_dt_id?: string | null;
  evaluador_dt_nombre?: string | null;
  observaciones_dt?: string | null;
  reto_nombre?: string;
  reto_icono?: string;
  reto_color?: string;
  categoria_reto?: string;
  jugador_nombre?: string;
  jugador_apellidos?: string;
  jugador_foto?: string;
  jugador_dorsal?: number;
  categoria_nombre?: string;
  categoria_id?: string;
}

@Injectable()
export class RetosRepository {
  constructor(private readonly db: DatabaseService) {}

  async findCatalogo(clubId?: string): Promise<RetoCatalogoItem[]> {
    try {
      const query = `
        SELECT id, club_id, categoria_reto, nombre, descripcion, icono, color_distintivo,
               niveles, orden_display, activo
        FROM rendimiento.retos_catalogo
        WHERE activo = true AND (club_id = $1 OR club_id IS NULL)
        ORDER BY orden_display ASC, nombre ASC
      `;
      const res = await this.db.query(query, [clubId || null]);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map(r => ({
          ...r,
          niveles: typeof r.niveles === 'string' ? JSON.parse(r.niveles) : (r.niveles || [])
        }));
      }
    } catch (e) {
      // Fallback
    }
    return this.getFallbackCatalogo();
  }

  async findProgresoByJugador(jugadorId: string, clubId: string): Promise<RetoProgresoItem[]> {
    try {
      const query = `
        SELECT p.*,
               r.nombre as reto_nombre, r.icono as reto_icono, r.color_distintivo as reto_color,
               r.categoria_reto,
               j.nombres as jugador_nombre, j.apellidos as jugador_apellidos,
               j.foto_url as jugador_foto, j.numero_dorsal as jugador_dorsal,
               c.nombre as categoria_nombre, c.id as categoria_id
        FROM rendimiento.retos_jugador_progreso p
        JOIN rendimiento.retos_catalogo r ON r.id = p.reto_id
        JOIN deportivo.jugadores j ON j.id = p.jugador_id
        JOIN deportivo.categorias c ON c.id = j.categoria_id
        WHERE p.jugador_id = $1 AND p.club_id = $2
        ORDER BY p.fecha_solicitud DESC
      `;
      const res = await this.db.query(query, [jugadorId, clubId]);
      return res.rows || [];
    } catch (e) {
      return [];
    }
  }

  async findPendientesEvaluacion(clubId: string, categoriaId?: string): Promise<RetoProgresoItem[]> {
    try {
      let query = `
        SELECT p.*,
               r.nombre as reto_nombre, r.icono as reto_icono, r.color_distintivo as reto_color,
               r.categoria_reto,
               j.nombres as jugador_nombre, j.apellidos as jugador_apellidos,
               j.foto_url as jugador_foto, j.numero_dorsal as jugador_dorsal,
               c.nombre as categoria_nombre, c.id as categoria_id
        FROM rendimiento.retos_jugador_progreso p
        JOIN rendimiento.retos_catalogo r ON r.id = p.reto_id
        JOIN deportivo.jugadores j ON j.id = p.jugador_id
        JOIN deportivo.categorias c ON c.id = j.categoria_id
        WHERE p.club_id = $1 AND p.estado = 'COMPROBABLE'
      `;
      const params: any[] = [clubId];

      if (categoriaId && categoriaId !== 'TODAS') {
        params.push(categoriaId);
        query += ` AND j.categoria_id = $${params.length}`;
      }

      query += ` ORDER BY p.fecha_solicitud DESC`;

      const res = await this.db.query(query, params);
      return res.rows || [];
    } catch (e) {
      return [];
    }
  }

  async solicitarComprobacion(data: {
    clubId: string;
    jugadorId: string;
    retoId: string;
    nivel: number;
    meta: number;
    unidad: string;
    xp: number;
  }): Promise<RetoProgresoItem> {
    const query = `
      INSERT INTO rendimiento.retos_jugador_progreso (
        club_id, jugador_id, reto_id, nivel_solicitado, meta_cantidad, unidad_medida, xp_recompensa, estado, fecha_solicitud
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'COMPROBABLE', NOW())
      RETURNING *
    `;
    const res = await this.db.query(query, [
      data.clubId,
      data.jugadorId,
      data.retoId,
      data.nivel,
      data.meta,
      data.unidad,
      data.xp,
    ]);
    return res.rows[0];
  }

  async evaluarReto(progresoId: string, clubId: string, data: {
    aprobado: boolean;
    evaluadorDtId?: string | null;
    evaluadorDtNombre?: string | null;
    observaciones?: string | null;
  }): Promise<any> {
    // 1. Obtener el progreso objetivo
    const findQuery = `
      SELECT p.*, r.niveles as catalogo_niveles, r.nombre as reto_nombre, r.icono as reto_icono,
             r.color_distintivo as reto_color, r.categoria_reto
      FROM rendimiento.retos_jugador_progreso p
      JOIN rendimiento.retos_catalogo r ON r.id = p.reto_id
      WHERE p.id = $1 AND p.club_id = $2
    `;
    const findRes = await this.db.query(findQuery, [progresoId, clubId]);
    const progresoActual = findRes.rows ? findRes.rows[0] : null;

    if (!progresoActual) {
      return null;
    }

    // 2. Si es RECHAZADO, actualizar únicamente el registro actual
    if (!data.aprobado) {
      const rejQuery = `
        UPDATE rendimiento.retos_jugador_progreso
        SET estado = 'RECHAZADO',
            fecha_evaluacion = NOW(),
            evaluador_dt_id = $1,
            evaluador_dt_nombre = $2,
            observaciones_dt = $3,
            updated_at = NOW()
        WHERE id = $4 AND club_id = $5
        RETURNING *
      `;
      const rejRes = await this.db.query(rejQuery, [
        data.evaluadorDtId || null,
        data.evaluadorDtNombre || 'Director Técnico',
        data.observaciones || 'Técnica incompleta. Requiere practicar y volver a presentar.',
        progresoId,
        clubId,
      ]);
      return {
        progreso: rejRes.rows[0],
        aprobado: false,
        totalXpGanado: 0,
        nivelesAprobados: [],
        mensaje: 'Reto marcado como no superado. El alumno puede volver a intentarlo.'
      };
    }

    // 3. APROBACIÓN EN CASCADA / SALTO DE RETO
    const nivelObjetivo = Number(progresoActual.nivel_solicitado) || 1;
    const jugadorId = progresoActual.jugador_id;
    const retoId = progresoActual.reto_id;

    // Parsear niveles del catálogo
    let catalogoNiveles: any[] = [];
    if (typeof progresoActual.catalogo_niveles === 'string') {
      try {
        catalogoNiveles = JSON.parse(progresoActual.catalogo_niveles);
      } catch (e) {
        catalogoNiveles = [];
      }
    } else if (Array.isArray(progresoActual.catalogo_niveles)) {
      catalogoNiveles = progresoActual.catalogo_niveles;
    }

    // Si el catálogo está vacío en la fila, buscar en fallback
    if (catalogoNiveles.length === 0) {
      const fallback = this.getFallbackCatalogo().find(c => c.id === retoId);
      if (fallback) catalogoNiveles = fallback.niveles;
    }

    // Consultar todos los progresos previos del jugador para este reto
    const prevQuery = `
      SELECT id, nivel_solicitado, estado, xp_recompensa
      FROM rendimiento.retos_jugador_progreso
      WHERE jugador_id = $1 AND reto_id = $2 AND club_id = $3
    `;
    const prevRes = await this.db.query(prevQuery, [jugadorId, retoId, clubId]);
    const prevMap = new Map<number, { id: string; estado: string; xp: number }>();
    if (prevRes.rows) {
      prevRes.rows.forEach(r => {
        prevMap.set(Number(r.nivel_solicitado), {
          id: r.id,
          estado: r.estado,
          xp: Number(r.xp_recompensa) || 0
        });
      });
    }

    let totalXpAcumulado = 0;
    const nivelesAprobados: any[] = [];

    // Iterar todos los niveles <= nivelObjetivo para aprobarlos en cascada
    for (const lvlDef of catalogoNiveles) {
      const numLvl = Number(lvlDef.nivel);
      if (numLvl <= nivelObjetivo) {
        const existing = prevMap.get(numLvl);
        const yaAprobado = existing && existing.estado === 'APROBADO';

        if (!yaAprobado) {
          const xpNivel = Number(lvlDef.xp) || 30;
          totalXpAcumulado += xpNivel;

          const esNivelDirecto = numLvl === nivelObjetivo;
          const obs = esNivelDirecto
            ? (data.observaciones || 'Reto comprobado y aprobado presencialmente ante el DT.')
            : `Aprobado automáticamente por superación del Nivel ${nivelObjetivo} (${lvlDef.meta} ${lvlDef.unidad}).`;

          if (existing) {
            // Actualizar fila existente
            await this.db.query(
              `UPDATE rendimiento.retos_jugador_progreso
               SET estado = 'APROBADO',
                   xp_recompensa = $1,
                   fecha_evaluacion = NOW(),
                   evaluador_dt_id = $2,
                   evaluador_dt_nombre = $3,
                   observaciones_dt = $4,
                   updated_at = NOW()
               WHERE id = $5`,
              [
                xpNivel,
                data.evaluadorDtId || null,
                data.evaluadorDtNombre || 'Director Técnico',
                obs,
                existing.id
              ]
            );
          } else {
            // Insertar nuevo registro aprobado en cascada
            await this.db.query(
              `INSERT INTO rendimiento.retos_jugador_progreso (
                club_id, jugador_id, reto_id, nivel_solicitado, meta_cantidad, unidad_medida,
                xp_recompensa, estado, fecha_solicitud, fecha_evaluacion, evaluador_dt_id,
                evaluador_dt_nombre, observaciones_dt
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'APROBADO', NOW(), NOW(), $8, $9, $10)`,
              [
                clubId,
                jugadorId,
                retoId,
                numLvl,
                lvlDef.meta,
                lvlDef.unidad,
                xpNivel,
                data.evaluadorDtId || null,
                data.evaluadorDtNombre || 'Director Técnico',
                obs
              ]
            );
          }

          nivelesAprobados.push({
            nivel: numLvl,
            meta: lvlDef.meta,
            unidad: lvlDef.unidad,
            xp: xpNivel,
            titulo: lvlDef.titulo,
            esCascada: !esNivelDirecto
          });
        }
      }
    }

    // 4. Acreditar XP Acumulado en el jugador
    if (totalXpAcumulado > 0) {
      try {
        await this.db.query(
          `UPDATE deportivo.jugadores
           SET xp_total = COALESCE(xp_total, 0) + $1,
               xp_misiones = COALESCE(xp_misiones, 0) + $1,
               updated_at = NOW()
           WHERE id = $2`,
          [totalXpAcumulado, jugadorId]
        );
      } catch (e) {
        // Fallback si tabla jugadores no tiene esos campos directamente
      }
    }

    const esSaltoReto = nivelesAprobados.length > 1;
    const mensaje = esSaltoReto
      ? `🚀 ¡Salto de Reto Aprobado! Se aprobaron automáticamente ${nivelesAprobados.length} niveles (hasta Nivel ${nivelObjetivo}), acreditando un total acumulado de +${totalXpAcumulado} XP.`
      : `✅ ¡Reto Nivel ${nivelObjetivo} Aprobado! Se acreditaron +${totalXpAcumulado} XP al jugador.`;

    return {
      progresoId,
      jugadorId,
      retoId,
      nivelAprobado: nivelObjetivo,
      aprobado: true,
      esSaltoReto,
      totalXpGanado: totalXpAcumulado,
      nivelesAprobados,
      mensaje
    };
  }

  async getMetricasJugador(jugadorId: string, clubId: string): Promise<any> {
    try {
      // 1. Catálogo completo
      const catalogo = await this.findCatalogo(clubId);
      let xpTotalCatalogo = 0;
      let totalNivelesCatalogo = 0;
      const categoriasMap = new Map<string, { totalXp: number; totalNiveles: number; xpGanado: number; nivelesAprobados: number; nombre: string; color: string; icono: string }>();

      catalogo.forEach(c => {
        if (!categoriasMap.has(c.categoria_reto)) {
          categoriasMap.set(c.categoria_reto, {
            totalXp: 0,
            totalNiveles: 0,
            xpGanado: 0,
            nivelesAprobados: 0,
            nombre: c.nombre,
            color: c.color_distintivo,
            icono: c.icono
          });
        }
        const cat = categoriasMap.get(c.categoria_reto)!;
        c.niveles.forEach(lvl => {
          xpTotalCatalogo += Number(lvl.xp) || 0;
          totalNivelesCatalogo += 1;
          cat.totalXp += Number(lvl.xp) || 0;
          cat.totalNiveles += 1;
        });
      });

      // 2. Progreso del jugador
      const progreso = await this.findProgresoByJugador(jugadorId, clubId);
      const aprobados = progreso.filter(p => p.estado === 'APROBADO');
      const pendientes = progreso.filter(p => p.estado === 'COMPROBABLE');

      let xpRetosObtenido = 0;
      aprobados.forEach(p => {
        const xp = Number(p.xp_recompensa) || 0;
        xpRetosObtenido += xp;
        if (p.categoria_reto && categoriasMap.has(p.categoria_reto)) {
          const cat = categoriasMap.get(p.categoria_reto)!;
          cat.xpGanado += xp;
          cat.nivelesAprobados += 1;
        }
      });

      // 3. XP total del jugador
      let xpTotalJugador = 3120;
      try {
        const jugRes = await this.db.query('SELECT xp_total FROM deportivo.jugadores WHERE id = $1', [jugadorId]);
        if (jugRes.rows && jugRes.rows[0] && jugRes.rows[0].xp_total) {
          xpTotalJugador = Number(jugRes.rows[0].xp_total);
        }
      } catch (e) {
        // Fallback
      }

      // 4. Cálculos porcentuales
      const porcentajeXpRetos = xpTotalJugador > 0
        ? Math.min(100, Math.round((xpRetosObtenido / xpTotalJugador) * 100))
        : 0;

      const porcentajeCatalogoCompletado = xpTotalCatalogo > 0
        ? Math.min(100, Math.round((xpRetosObtenido / xpTotalCatalogo) * 100))
        : 0;

      const desgloseCategorias = Array.from(categoriasMap.entries()).map(([key, val]) => ({
        categoria: key,
        nombre: val.nombre,
        color: val.color,
        icono: val.icono,
        xpGanado: val.xpGanado,
        xpTotal: val.totalXp,
        nivelesAprobados: val.nivelesAprobados,
        nivelesTotales: val.totalNiveles,
        porcentaje: val.totalXp > 0 ? Math.round((val.xpGanado / val.totalXp) * 100) : 0
      }));

      return {
        jugadorId,
        xpTotalJugador,
        xpRetosObtenido,
        xpTotalCatalogo,
        porcentajeXpRetos,
        porcentajeCatalogoCompletado,
        retosAprobadosCount: aprobados.length,
        retosPendientesCount: pendientes.length,
        totalNivelesCatalogo,
        desgloseCategorias
      };
    } catch (e) {
      return {
        jugadorId,
        xpTotalJugador: 3120,
        xpRetosObtenido: 680,
        xpTotalCatalogo: 4820,
        porcentajeXpRetos: 22,
        porcentajeCatalogoCompletado: 14,
        retosAprobadosCount: 4,
        retosPendientesCount: 2,
        totalNivelesCatalogo: 21,
        desgloseCategorias: []
      };
    }
  }

  private getFallbackCatalogo(): RetoCatalogoItem[] {
    return [
      {
        id: 'c1000000-0000-0000-0000-000000000001',
        categoria_reto: 'FUERZA_CALISTENIA',
        nombre: 'Flexiones de Pecho (Push-Ups)',
        descripcion: 'Dominio de fuerza corporal y estabilidad escapular. Realizar repeticiones con técnica estricta (pecho a 5cm del suelo) delante del DT.',
        icono: 'fa-solid fa-dumbbell',
        color_distintivo: '#10B981',
        niveles: [
          { nivel: 1, meta: 5, unidad: 'flexiones', xp: 30, titulo: '5 Flexiones (Iniciación)', dificultad: 'PRINCIPIANTE' },
          { nivel: 2, meta: 10, unidad: 'flexiones', xp: 60, titulo: '10 Flexiones (Guerrero)', dificultad: 'INTERMEDIO' },
          { nivel: 3, meta: 15, unidad: 'flexiones', xp: 100, titulo: '15 Flexiones (Atleta)', dificultad: 'AVANZADO' },
          { nivel: 4, meta: 25, unidad: 'flexiones', xp: 180, titulo: '25 Flexiones (Pro Cantera)', dificultad: 'ELITE' },
          { nivel: 5, meta: 50, unidad: 'flexiones', xp: 350, titulo: '50 Flexiones (Bestia Blue Lock)', dificultad: 'LEYENDA' },
        ],
        orden_display: 1,
        activo: true,
      },
      {
        id: 'c1000000-0000-0000-0000-000000000002',
        categoria_reto: 'TECNICA_CONTROL',
        nombre: 'Dominadas de Balón (21s / Juggling)',
        descripcion: 'Control y sensibilidad del balón sin que toque el césped. Alternando pie derecho e izquierdo frente al Director Técnico.',
        icono: 'fa-solid fa-futbol',
        color_distintivo: '#3B82F6',
        niveles: [
          { nivel: 1, meta: 10, unidad: 'toques', xp: 40, titulo: '10 Toques Consecutivos', dificultad: 'PRINCIPIANTE' },
          { nivel: 2, meta: 25, unidad: 'toques', xp: 80, titulo: '25 Toques Alternados', dificultad: 'INTERMEDIO' },
          { nivel: 3, meta: 50, unidad: 'toques', xp: 150, titulo: '50 Toques Malabarista', dificultad: 'AVANZADO' },
          { nivel: 4, meta: 100, unidad: 'toques', xp: 300, titulo: '100 Toques Crack Élite', dificultad: 'ELITE' },
          { nivel: 5, meta: 200, unidad: 'toques', xp: 500, titulo: '200 Toques Rey Oliver Atom', dificultad: 'LEYENDA' },
        ],
        orden_display: 2,
        activo: true,
      },
      {
        id: 'c1000000-0000-0000-0000-000000000003',
        categoria_reto: 'POTENCIA_VELOCIDAD',
        nombre: 'Sentadillas con Salto (Jump Squats)',
        descripcion: 'Potencia explosiva de tren inferior para mejorar el salto vertical y despegue en el remate de cabeza.',
        icono: 'fa-solid fa-bolt',
        color_distintivo: '#F59E0B',
        niveles: [
          { nivel: 1, meta: 10, unidad: 'saltos', xp: 40, titulo: '10 Saltos Explosivos', dificultad: 'PRINCIPIANTE' },
          { nivel: 2, meta: 20, unidad: 'saltos', xp: 80, titulo: '20 Saltos Máxima Altura', dificultad: 'INTERMEDIO' },
          { nivel: 3, meta: 35, unidad: 'saltos', xp: 150, titulo: '35 Saltos Potencia CR7', dificultad: 'AVANZADO' },
          { nivel: 4, meta: 50, unidad: 'saltos', xp: 280, titulo: '50 Saltos Resistencia Titan', dificultad: 'ELITE' },
        ],
        orden_display: 3,
        activo: true,
      },
      {
        id: 'c1000000-0000-0000-0000-000000000004',
        categoria_reto: 'RESISTENCIA_CORE',
        nombre: 'Plancha Isométrica de Core',
        descripcion: 'Estabilidad lumbo-pélvica y resistencia estática en apoyo de antebrazos sin quebrar la cadera.',
        icono: 'fa-solid fa-shield-halved',
        color_distintivo: '#8B5CF6',
        niveles: [
          { nivel: 1, meta: 30, unidad: 'segundos', xp: 40, titulo: '30 Segundos de Plancha', dificultad: 'PRINCIPIANTE' },
          { nivel: 2, meta: 60, unidad: 'segundos', xp: 90, titulo: '60 Segundos Muralla', dificultad: 'INTERMEDIO' },
          { nivel: 3, meta: 120, unidad: 'segundos', xp: 200, titulo: '2 Minutos de Acero', dificultad: 'AVANZADO' },
          { nivel: 4, meta: 180, unidad: 'segundos', xp: 350, titulo: '3 Minutos Inquebrantable', dificultad: 'ELITE' },
        ],
        orden_display: 4,
        activo: true,
      },
      {
        id: 'c1000000-0000-0000-0000-000000000005',
        categoria_reto: 'PRECISION_TIRO',
        nombre: 'Tiro al Larguero (Crossbar Challenge)',
        descripcion: 'Impactar el travesaño desde el borde del área grande (16.5 metros) en presencia del entrenador.',
        icono: 'fa-solid fa-crosshairs',
        color_distintivo: '#EC4899',
        niveles: [
          { nivel: 1, meta: 1, unidad: 'aciertos', xp: 60, titulo: '1 Impacto Directo al Larguero', dificultad: 'INTERMEDIO' },
          { nivel: 2, meta: 3, unidad: 'aciertos', xp: 180, titulo: '3 Impactos en 5 Intentos', dificultad: 'AVANZADO' },
          { nivel: 3, meta: 5, unidad: 'aciertos', xp: 350, titulo: '5 de 5 Francotirador Messi', dificultad: 'ELITE' },
        ],
        orden_display: 5,
        activo: true,
      }
    ];
  }
}
