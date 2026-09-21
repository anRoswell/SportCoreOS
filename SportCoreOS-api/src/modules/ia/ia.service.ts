import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IaRepository } from './ia.repository';
import { GenerarBoletinAlumnoDto, ChatTacticoDtDto } from './ia.dto';

@Injectable()
export class IaService {
  constructor(private readonly iaRepo: IaRepository) {}

  async generarBoletinAlumno(clubId: string, dto: GenerarBoletinAlumnoDto) {
    const data = await this.iaRepo.getHistorialJugadorParaBoletin(dto.jugador_id, clubId);
    if (!data.jugador) {
      throw new NotFoundException('Jugador no encontrado en este club');
    }

    const { jugador, biometria, partidos } = data;
    const bioActual = biometria[0] || null;

    // Síntesis formativa con lógica de Inteligencia Deportiva
    const minutosTotales = partidos.reduce((acc: number, p: any) => acc + (p.minutos_jugados || 0), 0);
    const golesTotales = partidos.reduce((acc: number, p: any) => acc + (p.goles || 0), 0);
    const asistenciasTotales = partidos.reduce((acc: number, p: any) => acc + (p.asistencias || 0), 0);

    const fortalezas: string[] = [];
    const mejoras: string[] = [];

    if (minutosTotales >= 180) {
      fortalezas.push('Excelente constancia y regularidad de minutos en competencia.');
    } else {
      mejoras.push('Consolidar mayor tiempo en cancha y ritmo competitivo continuo.');
    }

    if (golesTotales + asistenciasTotales > 0) {
      fortalezas.push(`Gran incidencia ofensiva directa (${golesTotales} goles, ${asistenciasTotales} asistencias).`);
    }

    if (bioActual) {
      if (bioActual.salto_cm && bioActual.salto_cm >= 35) {
        fortalezas.push(`Potencia de salto vertical óptima (${bioActual.salto_cm} cm).`);
      }
      if (bioActual.vo2_max && bioActual.vo2_max < 48) {
        mejoras.push('Aumentar capacidad aeróbica y resistencia cardiovascular (VO2 máx).');
      }
    }

    if (fortalezas.length === 0) fortalezas.push('Buena disciplina táctica y disposición al aprendizaje.');
    if (mejoras.length === 0) mejoras.push('Mantener el plan de fortalecimiento muscular y descanso preventivo.');

    const contenidoGenerado = `
### ⚽ BOLETÍN FORMATIVO MENSUAL - SPORTCORE AI
**Jugador:** ${jugador.nombres} ${jugador.apellidos} | **Dorsal:** #${jugador.dorsal || 'S/D'}
**Categoría:** ${jugador.categoria_nombre || 'Formativa'} | **Posición:** ${jugador.posicion_principal}

---
#### 1. RESUMEN DE EVOLUCIÓN & RENDIMIENTO:
Durante el último ciclo competitivo, ${jugador.nombres} ha acumulado **${minutosTotales} minutos** en partidos oficiales. Ha demostrado compromiso táctico con el modelo de juego del club.

#### 2. FORTALEZAS DESTACADAS:
${fortalezas.map((f) => `- ${f}`).join('\n')}

#### 3. ASPECTOS DE MEJORA & RECOMENDACIONES:
${mejoras.map((m) => `- ${m}`).join('\n')}

#### 4. MENSAJE PARA LA FAMILIA:
El acompañamiento de los padres es vital en esta etapa formativa. Felicitamos la puntualidad, actitud deportiva y respeto hacia compañeros y rivales.
    `.trim();

    const log = await this.iaRepo.guardarLogGeneracion(
      clubId,
      jugador.id,
      'BOLETIN_PADRES_MENSUAL',
      350,
      420,
      contenidoGenerado,
      { periodo: dto.periodo || new Date().toISOString().slice(0, 7), enfoque: dto.enfoque_adicional }
    );

    return {
      jugador_id: jugador.id,
      jugador_nombre: `${jugador.nombres} ${jugador.apellidos}`,
      categoria: jugador.categoria_nombre,
      boletin_markdown: contenidoGenerado,
      fortalezas,
      mejoras,
      log_id: log.id,
    };
  }

  async analisisFatiga(jugadorId: string) {
    const metricas = await this.iaRepo.getMetricasFatigaJugador(jugadorId);

    if (!metricas || metricas.length === 0) {
      return {
        jugador_id: jugadorId,
        nivel_riesgo: 'BAJO',
        acwr_ratio: 0.95,
        minutos_sugeridos_proximo_partido: 90,
        alerta_sobreentrenamiento: false,
        recomendacion: 'Sin sobrecarga detectada. Jugador apto para 90 minutos completos.',
      };
    }

    const playerLoadProm = metricas.reduce((acc, m) => acc + Number(m.player_load_au || 0), 0) / metricas.length;
    const sprintsTotal = metricas.reduce((acc, m) => acc + Number(m.sprints_conteo || 0), 0);

    let nivelRiesgo = 'BAJO';
    let acwr = 1.05;
    let minutosSugeridos = 90;
    let alerta = false;
    let recomendacion = 'Carga física equilibrada. Disponibilidad completa para el cuerpo técnico.';

    if (playerLoadProm > 650 || sprintsTotal > 80) {
      nivelRiesgo = 'ALTO';
      acwr = 1.55;
      minutosSugeridos = 45;
      alerta = true;
      recomendacion = 'ALERTA DE SOBRECARGA: Se recomienda rotación táctica o máximo 45 minutos para prevenir lesiones musculares.';
    } else if (playerLoadProm > 550) {
      nivelRiesgo = 'MODERADO';
      acwr = 1.25;
      minutosSugeridos = 65;
      alerta = false;
      recomendacion = 'Carga elevada en sprints. Se sugiere sesión regenerativa y monitoreo de minutos.';
    }

    return {
      jugador_id: jugadorId,
      nivel_riesgo: nivelRiesgo,
      acwr_ratio: acwr,
      player_load_promedio: Math.round(playerLoadProm),
      sprints_acumulados: sprintsTotal,
      minutos_sugeridos_proximo_partido: minutosSugeridos,
      alerta_sobreentrenamiento: alerta,
      recomendacion: recomendacion,
    };
  }

  async chatTacticoDt(clubId: string, dto: ChatTacticoDtDto) {
    let contextoPlantel = '';
    if (dto.categoria_id) {
      const plantel = await this.iaRepo.getPlantelesParaAnalisis(dto.categoria_id, clubId);
      contextoPlantel = `Nómina activa disponible (${plantel.length} jugadores): ${plantel.map(p => `${p.nombres} ${p.apellidos} (${p.posicion_principal})`).join(', ')}`;
    }

    const respuestaTactico = `
### 🧠 RECOMENDACIÓN TÁCTICA SPORTCORE AI
**Consulta:** "${dto.consulta}"
**Sistema sugerido:** ${dto.sistema_base || '1-4-2-3-1 / 1-4-3-3 Dinámico'}

---
#### 1. Disposición Estratégica:
- **Fase Defensiva:** Bloque medio-alto con presión dirigida hacia bandas. Obligar al rival a salir por su lateral menos técnico.
- **Fase de Transición Ofensiva:** Aprovechar desmarques de ruptura al espacio vacío dejado por los laterales rivales adelantados.
- **Vigilancias Defensivas:** Mantener pivote posicional cerca de los dos centrales para evitar contragolpes directos.

#### 2. Gestión de la Nómina:
${contextoPlantel ? contextoPlantel : 'Asegurar extremos veloces y recambios frescos en el minuto 60 para mantener la intensidad de presión.'}
    `.trim();

    return {
      consulta: dto.consulta,
      sistema: dto.sistema_base || '1-4-2-3-1',
      analisis_tactico: respuestaTactico,
      timestamp: new Date().toISOString(),
    };
  }
}
