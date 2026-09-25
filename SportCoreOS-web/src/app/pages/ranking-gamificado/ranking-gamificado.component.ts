import { Component, OnInit, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { 
  TierRank, 
  TabRanking, 
  FiltroTemporalRanking, 
  TipoNotificacionToast, 
  SortOrder,
  EstadoRetoJugador 
} from '../../core/enums/domain.enums';

export { TierRank };

export interface AlumnoRankItem {
  id: string;
  posicionRanking: number;
  posicionAnterior: number; // Para mostrar flecha subió/bajó/igual
  nombres: string;
  apellidos: string;
  dorsal: number;
  posicionCampo: string;
  categoriaId: string;
  categoriaNombre: string;
  fotoUrl: string;
  tier: TierRank;
  nivel: number;
  overallRating: number; // 60-99
  xpTotal: number;
  xpAsistencia: number; // XP de entrenamientos y puntualidad
  xpRendimientoDT: number; // Bonificaciones de destacados
  xpMisiones: number; // Retos superados
  xpTactica: number; // Trivia táctica
  xpPenalizaciones: number; // Inasistencias sin justificación descontadas (-30 XP)
  asistenciasEfectividad: number; // % Asistencia
  rachaEntrenamientos: number; // Racha de días seguidos (fuego 🔥)
  insigniasCount: number;
  destacadoSemana: boolean;
  stats: {
    ritmo: number;
    tiro: number;
    pase: number;
    regate: number;
    defensa: number;
    fisico: number;
  };
}

import { RankingPodiumComponent } from './components/ranking-podium/ranking-podium.component';
import { RankingTableComponent } from './components/ranking-table/ranking-table.component';
import { RankingRetosComponent } from './components/ranking-retos/ranking-retos.component';
import { RankingCertificacionDtComponent } from './components/ranking-certificacion-dt/ranking-certificacion-dt.component';
import { RankingFutDrawerComponent } from './components/ranking-fut-drawer/ranking-fut-drawer.component';
import { RankingReglasModalComponent } from './components/ranking-reglas-modal/ranking-reglas-modal.component';

@Component({
  selector: 'app-ranking-gamificado',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RankingPodiumComponent,
    RankingTableComponent,
    RankingRetosComponent,
    RankingCertificacionDtComponent,
    RankingFutDrawerComponent,
    RankingReglasModalComponent
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './ranking-gamificado.component.html',
  styleUrl: './ranking-gamificado.component.scss'
})
export class RankingGamificadoComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  readonly TabRanking = TabRanking;
  readonly FiltroTemporalRanking = FiltroTemporalRanking;
  readonly TierRank = TierRank;

  isRefreshing = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Pestaña Principal de la Vista
  activeMainTab = signal<TabRanking>(TabRanking.LEADERBOARD);

  // Filtros de Clasificación
  categoriaSeleccionada = signal<string>('TODAS');
  tierSeleccionado = signal<string>(TierRank.TODOS);
  posicionSeleccionada = signal<string>('TODAS');
  filtroTemporal = signal<FiltroTemporalRanking>(FiltroTemporalRanking.TEMPORADA);
  busquedaTexto = '';

  // Filtros y Estado del Módulo de Retos Individuales Comprobables
  filtroTipoReto = signal<string>('TODOS');
  retosCatalogo = signal<any[]>([]);
  retosPendientesDT = signal<any[]>([]);
  jugadorParaRetos = signal<AlumnoRankItem | null>(null);
  retosDelJugador = signal<any[]>([]);
  metricasRetosJugador = signal<any>(null);
  mensajeNotificacion = signal<{ texto: string; tipo: TipoNotificacionToast } | null>(null);
  
  // Ordenamiento por columnas
  sortColumn = signal<string>('posicionRanking');
  sortDirection = signal<SortOrder>(SortOrder.ASC);

  // Paginación conectada a Base de Datos
  currentPage = signal<number>(1);
  pageSize = signal<number>(8);
  totalRecords = signal<number>(0);

  alumnoSeleccionado = signal<AlumnoRankItem | null>(null);
  mostrarModalReglas = signal<boolean>(false);

  categoriasDisponibles = signal<{ id: string; nombre: string; color: string }[]>([
    { id: 'cat-u15', nombre: 'Sub-15 Élite', color: '#10b981' },
    { id: 'cat-u17', nombre: 'Sub-17 Pro', color: '#3b82f6' },
    { id: 'cat-u13', nombre: 'Sub-13 Cantera', color: '#f59e0b' },
    { id: 'cat-u20', nombre: 'Sub-20 Primera', color: '#8b5cf6' },
    { id: 'cat-u11', nombre: 'Sub-11 Semillero', color: '#ec4899' },
    { id: 'cat-fem', nombre: 'Femenino Juvenil', color: '#f97316' },
  ]);

  // Lista de Jugadores de la página actual traídos desde la BD
  alumnos = signal<AlumnoRankItem[]>([]);

  // Top 3 del podio superior (obtenido de los mejores clasificados)
  top3 = signal<AlumnoRankItem[]>([]);

  // Total de registros filtrados en BD
  totalFilteredCount = computed(() => this.totalRecords());

  // Total de páginas calculadas desde el total de la BD
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalRecords() / this.pageSize())));

  // Lista a renderizar en la tabla (la página activa traída desde la BD)
  paginatedAlumnos = computed(() => this.alumnos());

  // Retos filtrados por categoría de reto
  retosFiltrados = computed(() => {
    const tipo = this.filtroTipoReto();
    if (tipo === 'TODOS') return this.retosCatalogo();
    return this.retosCatalogo().filter(r => r.categoria_reto === tipo || r.categoriaReto === tipo);
  });

  // Conteo de solicitudes pendientes para el DT
  pendientesCount = computed(() => this.retosPendientesDT().length);

  showingStart = computed(() => {
    if (this.totalFilteredCount() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  showingEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalFilteredCount());
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number | undefined;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-1);
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  });

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarTop3Podio();
    this.cargarJugadoresDesdeBD();
    this.cargarRetosCatalogo();
    this.cargarRetosPendientesDT();
  }

  cargarCategorias(): void {
    this.api.getCategorias().subscribe({
      next: (cats) => {
        if (cats && cats.length > 0) {
          const mapped = cats.map(c => ({
            id: c.id,
            nombre: c.nombre,
            color: c.color_distintivo || '#10b981'
          }));
          this.categoriasDisponibles.set(mapped);
        }
      },
      error: () => {}
    });
  }

  // Cargar el TOP 3 de la categoría consultada desde BD para el podio
  cargarTop3Podio(): void {
    const catId = this.categoriaSeleccionada();
    const queryParams: any = {
      page: 1,
      limit: 3,
      sortBy: 'xp_total',
    };
    if (catId && catId !== 'TODAS') {
      queryParams.categoriaId = catId;
    }

    this.api.getJugadores(queryParams).subscribe({
      next: (res) => {
        const list = res.data || (Array.isArray(res) ? res : []);
        if (list && list.length > 0) {
          this.top3.set(list.map((j: any, idx: number) => this.mapJugadorToRankItem(j, idx + 1)));
        } else {
          this.top3.set([]);
        }
      },
      error: () => {
        this.top3.set([]);
      }
    });
  }

  // Carga paginada desde BD con parámetros de página, límite, filtros y ordenamiento
  cargarJugadoresDesdeBD(): void {
    this.isLoading.set(true);

    const queryParams: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      categoriaId: this.categoriaSeleccionada(),
      search: this.busquedaTexto.trim(),
      posicion: this.posicionSeleccionada(),
      sortBy: this.mapSortColumnToApiField(this.sortColumn(), this.sortDirection())
    };

    this.api.getJugadores(queryParams).subscribe({
      next: (res) => {
        const jugadoresList = res.data || (Array.isArray(res) ? res : []);
        const total = res.total !== undefined ? res.total : (res.data ? res.data.length : (Array.isArray(res) ? res.length : 0));
        
        if (jugadoresList && jugadoresList.length > 0) {
          const startRank = (this.currentPage() - 1) * this.pageSize() + 1;
          const items: AlumnoRankItem[] = jugadoresList.map((j: any, idx: number) => 
            this.mapJugadorToRankItem(j, startRank + idx)
          );

          // Si hay filtro por tier en frontend adicional
          let filteredItems = items;
          if (this.tierSeleccionado() !== 'TODOS') {
            filteredItems = items.filter(a => a.tier === this.tierSeleccionado());
          }

          this.alumnos.set(filteredItems);
          this.totalRecords.set(total > 0 ? total : filteredItems.length);
        } else {
          this.alumnos.set([]);
          this.totalRecords.set(0);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.alumnos.set([]);
        this.totalRecords.set(0);
        this.isLoading.set(false);
      }
    });
  }

  private mapSortColumnToApiField(col: string, dir: 'ASC' | 'DESC'): string {
    const direction = dir.toLowerCase();
    switch (col) {
      case 'xpTotal': return `xp_total_${direction}`;
      case 'overallRating': return `overall_rating_${direction}`;
      case 'rachaEntrenamientos': return `racha_asistencia_${direction}`;
      case 'asistenciasEfectividad': return `porcentaje_asistencia_${direction}`;
      case 'nombres': return `nombres_${direction}`;
      case 'categoriaNombre': return `categoria_id_${direction}`;
      default: return `posicion_${direction}`;
    }
  }

  private mapJugadorToRankItem(j: any, rankNumber: number): AlumnoRankItem {
    const nivel = Math.max(1, Math.floor((j.xp_total || 2000) / 250));
    let tier: TierRank = TierRank.BRONCE;
    if (nivel >= 15) tier = TierRank.DIAMANTE;
    else if (nivel >= 12) tier = TierRank.ORO;
    else if (nivel >= 10) tier = TierRank.PLATA;

    return {
      id: j.id || `alm-${rankNumber}`,
      posicionRanking: rankNumber,
      posicionAnterior: rankNumber,
      nombres: j.nombres || 'Jugador',
      apellidos: j.apellidos || '',
      dorsal: j.numero_dorsal || rankNumber,
      posicionCampo: j.posicion_principal || 'Volante',
      categoriaId: j.categoria_id || 'cat-u15',
      categoriaNombre: j.categoria_nombre || 'Sub-15 Élite',
      fotoUrl: j.foto_url || `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200`,
      tier: tier,
      nivel: nivel,
      overallRating: j.overall_rating || (72 + (rankNumber % 18)),
      xpTotal: j.xp_total || (3500 - (rankNumber - 1) * 110),
      xpAsistencia: j.xp_asistencia || 1150,
      xpRendimientoDT: j.xp_rendimiento_dt || 650,
      xpMisiones: j.xp_misiones || 520,
      xpTactica: j.xp_tactica || 480,
      xpPenalizaciones: j.xp_penalizaciones || 0,
      asistenciasEfectividad: j.porcentaje_asistencia || 92,
      rachaEntrenamientos: j.racha_asistencia || (rankNumber % 9),
      insigniasCount: 4,
      destacadoSemana: rankNumber === 1,
      stats: {
        ritmo: j.stat_ritmo || 82,
        tiro: j.stat_tiro || 76,
        pase: j.stat_pase || 84,
        regate: j.stat_regate || 83,
        defensa: j.stat_defensa || 64,
        fisico: j.stat_fisico || 75
      }
    };
  }

  // Métodos de Ordenamiento
  setSortColumn(col: string): void {
    if (this.sortColumn() === col) {
      this.sortDirection.update(d => d === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    } else {
      this.sortColumn.set(col);
      if (['xpTotal', 'overallRating', 'rachaEntrenamientos', 'asistenciasEfectividad', 'nivel'].includes(col)) {
        this.sortDirection.set(SortOrder.DESC);
      } else {
        this.sortDirection.set(SortOrder.ASC);
      }
    }
    this.currentPage.set(1);
    this.cargarJugadoresDesdeBD();
  }

  getSortIcon(col: string): string {
    if (this.sortColumn() !== col) {
      return 'fa-sort text-slate-300';
    }
    return this.sortDirection() === SortOrder.ASC 
      ? 'fa-arrow-up-short-wide text-emerald' 
      : 'fa-arrow-down-wide-short text-emerald';
  }

  // Controles de Paginación hacia BD
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.cargarJugadoresDesdeBD();
    }
  }

  setPageSize(size: any): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.cargarJugadoresDesdeBD();
  }

  // Filtros interactivos
  onCategoriaChange(catId: string): void {
    this.categoriaSeleccionada.set(catId);
    this.currentPage.set(1);
    this.cargarTop3Podio();
    this.cargarJugadoresDesdeBD();
  }

  onTierChange(tier: string): void {
    this.tierSeleccionado.set(tier);
    this.currentPage.set(1);
    this.cargarJugadoresDesdeBD();
  }

  onPosicionChange(pos: string): void {
    this.posicionSeleccionada.set(pos);
    this.currentPage.set(1);
    this.cargarJugadoresDesdeBD();
  }

  onSearchChange(): void {
    this.currentPage.set(1);
    this.cargarJugadoresDesdeBD();
  }

  hasActiveTableFilters(): boolean {
    return this.categoriaSeleccionada() !== 'TODAS' ||
           this.tierSeleccionado() !== 'TODOS' ||
           this.posicionSeleccionada() !== 'TODAS' ||
           !!this.busquedaTexto.trim();
  }

  resetTableFilters(): void {
    this.categoriaSeleccionada.set('TODAS');
    this.tierSeleccionado.set('TODOS');
    this.posicionSeleccionada.set('TODAS');
    this.busquedaTexto = '';
    this.currentPage.set(1);
    this.cargarTop3Podio();
    this.cargarJugadoresDesdeBD();
  }

  getNombreCategoriaSeleccionada(): string {
    const catId = this.categoriaSeleccionada();
    if (catId === 'TODAS') return 'Todas las Categorías';
    const found = this.categoriasDisponibles().find(c => c.id === catId);
    return found ? found.nombre : 'Categoría Seleccionada';
  }

  seleccionarDetalleAlumno(alumno: AlumnoRankItem): void {
    this.alumnoSeleccionado.set(alumno);
  }

  abrirModalReglasXP(): void {
    this.mostrarModalReglas.set(true);
  }

  recargarRanking(): void {
    this.isRefreshing.set(true);
    this.cargarTop3Podio();
    this.cargarJugadoresDesdeBD();
    this.cargarRetosCatalogo();
    this.cargarRetosPendientesDT();
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  // =========================================================================
  // GESTIÓN DE RETOS INDIVIDUALES COMPROBABLES (FLEXIONES, DOMINADAS, ETC.)
  // =========================================================================
  setMainTab(tab: TabRanking): void {
    this.activeMainTab.set(tab);
    if (tab === TabRanking.RETOS) {
      if (!this.jugadorParaRetos()) {
        const primero = this.alumnos()[0] || this.top3()[0];
        if (primero) {
          this.seleccionarJugadorParaRetos(primero);
        }
      }
    } else if (tab === TabRanking.CERTIFICACION_DT) {
      this.cargarRetosPendientesDT();
    }
  }

  cargarRetosCatalogo(): void {
    this.api.getRetosCatalogo().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.retosCatalogo.set(list || []);
      },
      error: () => {
        this.retosCatalogo.set([]);
      }
    });
  }

  cargarRetosPendientesDT(): void {
    this.api.getRetosPendientesVerificacion(this.categoriaSeleccionada()).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.retosPendientesDT.set(list || []);
      },
      error: () => {
        this.retosPendientesDT.set([]);
      }
    });
  }

  seleccionarJugadorParaRetos(alumno: AlumnoRankItem): void {
    this.jugadorParaRetos.set(alumno);
    this.cargarRetosJugador(alumno.id);
    this.cargarMetricasRetos(alumno.id);
  }

  seleccionarJugadorPorId(id: string): void {
    const found = this.alumnos().find(a => a.id === id) || 
                  this.top3().find(a => a.id === id);
    if (found) {
      this.seleccionarJugadorParaRetos(found);
    }
  }

  cargarRetosJugador(jugadorId: string): void {
    this.api.getRetosJugador(jugadorId).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.retosDelJugador.set(list || []);
        this.cargarMetricasRetos(jugadorId);
      },
      error: () => {
        this.retosDelJugador.set([]);
        this.cargarMetricasRetos(jugadorId);
      }
    });
  }

  cargarMetricasRetos(jugadorId: string): void {
    this.api.getMetricasRetosJugador(jugadorId).subscribe({
      next: (res: any) => {
        const payload = res?.data || res;
        if (payload && payload.xpTotalCatalogo) {
          this.metricasRetosJugador.set(payload);
        } else {
          this.metricasRetosJugador.set(this.calcularMetricasLocales(jugadorId));
        }
      },
      error: () => {
        this.metricasRetosJugador.set(this.calcularMetricasLocales(jugadorId));
      }
    });
  }

  private calcularMetricasLocales(jugadorId: string): any {
    const jug = this.jugadorParaRetos() || this.alumnos().find(a => a.id === jugadorId);
    const xpTotalJugador = jug ? jug.xpTotal : 3120;
    const catalogo = this.retosCatalogo();
    
    let xpTotalCatalogo = 0;
    let totalNivelesCatalogo = 0;
    const desglose: any[] = [];

    catalogo.forEach((c: any) => {
      let catXpTotal = 0;
      let catNiveles = 0;
      let catXpGanado = 0;
      let catNivelesAprobados = 0;

      const niveles = Array.isArray(c.niveles) ? c.niveles : [];
      niveles.forEach((lvl: any) => {
        const xp = Number(lvl.xp) || 0;
        catXpTotal += xp;
        catNiveles += 1;
        xpTotalCatalogo += xp;
        totalNivelesCatalogo += 1;

        const prog = this.getProgresoNivel(c.id, Number(lvl.nivel));
        if (prog.estado === EstadoRetoJugador.APROBADO) {
          catXpGanado += xp;
          catNivelesAprobados += 1;
        }
      });

      desglose.push({
        categoria: c.categoria_reto || c.categoriaReto || 'FISICO',
        nombre: c.nombre || c.titulo,
        color: c.color_distintivo || c.color || '#10b981',
        icono: c.icono || 'fa-solid fa-dumbbell',
        xpGanado: catXpGanado,
        xpTotal: catXpTotal,
        nivelesAprobados: catNivelesAprobados,
        nivelesTotales: catNiveles,
        porcentaje: catXpTotal > 0 ? Math.round((catXpGanado / catXpTotal) * 100) : 0
      });
    });

    const xpRetosObtenido = desglose.reduce((acc, curr) => acc + curr.xpGanado, 0);
    const porcentajeXpRetos = xpTotalJugador > 0 ? Math.min(100, Math.round((xpRetosObtenido / xpTotalJugador) * 100)) : 0;
    const porcentajeCatalogoCompletado = xpTotalCatalogo > 0 ? Math.min(100, Math.round((xpRetosObtenido / xpTotalCatalogo) * 100)) : 0;
    const retosAprobadosCount = desglose.reduce((acc, curr) => acc + curr.nivelesAprobados, 0);

    return {
      jugadorId,
      xpTotalJugador,
      xpRetosObtenido,
      xpTotalCatalogo: xpTotalCatalogo || 3610,
      porcentajeXpRetos,
      porcentajeCatalogoCompletado,
      retosAprobadosCount,
      retosPendientesCount: this.retosDelJugador().filter(p => p.estado === EstadoRetoJugador.COMPROBABLE).length,
      totalNivelesCatalogo: totalNivelesCatalogo || 21,
      desgloseCategorias: desglose
    };
  }

  solicitarComprobacionReto(reto: any, nivel: any): void {
    const jug = this.jugadorParaRetos();
    if (!jug) return;

    this.api.solicitarRetoComprobable({
      jugadorId: jug.id,
      retoId: reto.id,
      nivel: nivel.nivel,
      meta: nivel.meta,
      unidad: nivel.unidad,
      xp: nivel.xp,
    }).subscribe({
      next: () => {
        this.mostrarNotificacion(`🎯 ¡Reto "${reto.nombre} - ${nivel.titulo}" marcado como COMPROBABLE! Realízalo en cancha delante de tu DT para certificar tus +${nivel.xp} XP.`, TipoNotificacionToast.EXITO);
        this.cargarRetosJugador(jug.id);
        this.cargarRetosPendientesDT();
      },
      error: () => {
        // Optimistic local update
        const nuevoProgreso = {
          id: `prog-${Date.now()}`,
          club_id: '10000000-0000-0000-0000-000000000001',
          jugador_id: jug.id,
          reto_id: reto.id,
          nivel_solicitado: nivel.nivel,
          meta_cantidad: nivel.meta,
          unidad_medida: nivel.unidad,
          xp_recompensa: nivel.xp,
          estado: 'COMPROBABLE',
          fecha_solicitud: new Date().toISOString(),
          reto_nombre: reto.nombre,
          reto_icono: reto.icono,
          reto_color: reto.color_distintivo,
          jugador_nombre: jug.nombres,
          jugador_apellidos: jug.apellidos,
          jugador_foto: jug.fotoUrl,
          jugador_dorsal: jug.dorsal,
          categoria_nombre: jug.categoriaNombre
        };
        this.retosDelJugador.update(list => [nuevoProgreso, ...list]);
        this.retosPendientesDT.update(list => [nuevoProgreso, ...list]);
        this.mostrarNotificacion(`🎯 ¡Reto "${reto.nombre} - ${nivel.titulo}" marcado como COMPROBABLE! Preséntalo delante del profe para validar tus +${nivel.xp} XP.`, TipoNotificacionToast.EXITO);
      }
    });
  }

  evaluarRetoDT(progreso: any, aprobado: boolean, observaciones?: string): void {
    this.api.evaluarRetoComprobable(progreso.id, {
      aprobado,
      observaciones: observaciones || (aprobado ? 'Reto comprobado y aprobado con técnica impecable en cancha.' : 'Técnica incompleta. Requiere practicar más.'),
      evaluadorDtNombre: 'Prof. Mario Yepes (DT Principal)'
    }).subscribe({
      next: (res: any) => {
        const payload = res?.data || res;
        this.finalizarEvaluacionReto(progreso, aprobado, payload);
      },
      error: () => {
        this.finalizarEvaluacionReto(progreso, aprobado, null);
      }
    });
  }

  private finalizarEvaluacionReto(progreso: any, aprobado: boolean, respPayload?: any): void {
    const jugNombre = progreso.jugador_nombre || progreso.jugadorNombre || 'Alumno';
    const jugadorId = progreso.jugador_id || progreso.jugadorId;
    const nivelTarget = Number(progreso.nivel_solicitado || progreso.nivelSolicitado) || 1;
    const retoId = progreso.reto_id || progreso.retoId;

    if (aprobado) {
      const totalXpGanado = respPayload?.totalXpGanado !== undefined ? Number(respPayload.totalXpGanado) : this.calcularXpAcumuladoLocal(retoId, nivelTarget, jugadorId);
      const esSalto = respPayload?.esSaltoReto || (nivelTarget > 1 && totalXpGanado > (progreso.xp_recompensa || 30));

      if (esSalto) {
        this.mostrarNotificacion(
          `🚀 ¡SALTO DE RETO APROBADO! Al superar el Nivel ${nivelTarget} (${progreso.meta_cantidad || 50} ${progreso.unidad_medida || 'rep'}), se aprobaron automáticamente todos los niveles anteriores sumando un acumulado total de +${totalXpGanado} XP a ${jugNombre}.`,
          TipoNotificacionToast.EXITO
        );
      } else {
        this.mostrarNotificacion(
          `🏆 ¡Reto Nivel ${nivelTarget} APROBADO por el DT! Se sumaron +${totalXpGanado} XP a ${jugNombre}.`,
          TipoNotificacionToast.EXITO
        );
      }
      
      // Actualizar XP en la tabla / podio reactivamente
      this.alumnos.update(list => list.map(a => {
        if (a.id === jugadorId) {
          const newXp = a.xpTotal + totalXpGanado;
          return {
            ...a,
            xpTotal: newXp,
            xpMisiones: a.xpMisiones + totalXpGanado,
            nivel: Math.max(1, Math.floor(newXp / 250))
          };
        }
        return a;
      }));

      this.top3.update(list => list.map(a => {
        if (a.id === jugadorId) {
          const newXp = a.xpTotal + totalXpGanado;
          return {
            ...a,
            xpTotal: newXp,
            xpMisiones: a.xpMisiones + totalXpGanado,
            nivel: Math.max(1, Math.floor(newXp / 250))
          };
        }
        return a;
      }));

      // Si el jugador activo en la pestaña de retos es el evaluado, actualizar sus retos en cascada
      this.retosDelJugador.update(list => {
        const cat = this.retosCatalogo().find(c => c.id === retoId);
        const nivelesDef = cat ? (Array.isArray(cat.niveles) ? cat.niveles : []) : [];
        
        const mapNiveles = new Map<number, any>();
        list.forEach(p => mapNiveles.set(Number(p.nivel_solicitado || p.nivelSolicitado), p));

        // Para cada nivel <= nivelTarget
        for (let l = 1; l <= nivelTarget; l++) {
          const def = nivelesDef.find((nd: any) => Number(nd.nivel) === l) || { xp: 30, meta: l * 5, unidad: 'repeticiones' };
          const existing = mapNiveles.get(l);
          if (existing) {
            existing.estado = EstadoRetoJugador.APROBADO;
            existing.xp_recompensa = def.xp;
            existing.fecha_evaluacion = new Date().toISOString();
          } else {
            list.unshift({
              id: `auto-${Date.now()}-${l}`,
              club_id: '10000000-0000-0000-0000-000000000001',
              jugador_id: jugadorId,
              reto_id: retoId,
              nivel_solicitado: l,
              meta_cantidad: def.meta,
              unidad_medida: def.unidad,
              xp_recompensa: def.xp,
              estado: EstadoRetoJugador.APROBADO,
              fecha_solicitud: new Date().toISOString(),
              fecha_evaluacion: new Date().toISOString(),
              evaluador_dt_nombre: 'Prof. Mario Yepes (DT Principal)',
              observaciones_dt: l === nivelTarget ? 'Aprobado presencialmente ante el DT' : `Aprobado automáticamente por superación de Nivel ${nivelTarget}`
            });
          }
        }
        return [...list];
      });

    } else {
      this.mostrarNotificacion(`⚠️ Reto devuelto a ${jugNombre} para perfeccionar técnica y volver a presentar.`, TipoNotificacionToast.ALERTA);
    }

    this.retosPendientesDT.update(list => list.filter(p => p.id !== progreso.id));
    if (this.jugadorParaRetos()) {
      this.cargarRetosJugador(this.jugadorParaRetos()!.id);
    }
  }

  private calcularXpAcumuladoLocal(retoId: string, nivelTarget: number, jugadorId: string): number {
    const cat = this.retosCatalogo().find(c => c.id === retoId);
    if (!cat || !cat.niveles) return 50;
    
    const yaAprobados = new Set(
      this.retosDelJugador()
        .filter(p => (p.reto_id === retoId || p.retoId === retoId) && p.estado === EstadoRetoJugador.APROBADO)
        .map(p => Number(p.nivel_solicitado || p.nivelSolicitado))
    );

    let sum = 0;
    cat.niveles.forEach((lvl: any) => {
      const n = Number(lvl.nivel);
      if (n <= nivelTarget && !yaAprobados.has(n)) {
        sum += Number(lvl.xp) || 0;
      }
    });
    return sum > 0 ? sum : 50;
  }

  getProgresoNivel(retoId: string, nivelNum: number): { estado: EstadoRetoJugador; item?: any } {
    const encontrados = this.retosDelJugador().filter(
      p => (p.reto_id === retoId || p.retoId === retoId) && 
           (p.nivel_solicitado === nivelNum || p.nivelSolicitado === nivelNum)
    );
    if (encontrados.length === 0) return { estado: EstadoRetoJugador.DISPONIBLE };
    const aprobado = encontrados.find(e => e.estado === EstadoRetoJugador.APROBADO);
    if (aprobado) return { estado: EstadoRetoJugador.APROBADO, item: aprobado };
    const comprobable = encontrados.find(e => e.estado === EstadoRetoJugador.COMPROBABLE);
    if (comprobable) return { estado: EstadoRetoJugador.COMPROBABLE, item: comprobable };
    const rechazado = encontrados.find(e => e.estado === EstadoRetoJugador.RECHAZADO);
    if (rechazado) return { estado: EstadoRetoJugador.RECHAZADO, item: rechazado };
    return { estado: EstadoRetoJugador.DISPONIBLE };
  }

  mostrarNotificacion(texto: string, tipo: TipoNotificacionToast): void {
    this.mensajeNotificacion.set({ texto, tipo });
    setTimeout(() => {
      this.mensajeNotificacion.set(null);
    }, 6000);
  }

  getTrendTitle(alumno: AlumnoRankItem): string {
    if (alumno.posicionAnterior > alumno.posicionRanking) {
      return `Subió ${alumno.posicionAnterior - alumno.posicionRanking} puesto(s) esta semana`;
    }
    if (alumno.posicionAnterior < alumno.posicionRanking) {
      return `Bajó ${alumno.posicionRanking - alumno.posicionAnterior} puesto(s)`;
    }
    return 'Mantiene su posición';
  }
}

