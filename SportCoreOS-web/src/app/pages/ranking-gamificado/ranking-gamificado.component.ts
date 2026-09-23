import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';

export type TierRank = 'DIAMANTE' | 'ORO' | 'PLATA' | 'BRONCE';

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

import { PaginationBarComponent } from '../../shared/components/pagination-bar/pagination-bar.component';
import { FutPlayerCardComponent } from '../../shared/components/fut-player-card/fut-player-card.component';

@Component({
  selector: 'app-ranking-gamificado',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationBarComponent, FutPlayerCardComponent],
  templateUrl: './ranking-gamificado.component.html',
  styleUrl: './ranking-gamificado.component.scss'
})
export class RankingGamificadoComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  isRefreshing = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Pestaña Principal de la Vista
  activeMainTab = signal<'LEADERBOARD' | 'RETOS' | 'CERTIFICACION_DT'>('LEADERBOARD');

  // Filtros de Clasificación
  categoriaSeleccionada = signal<string>('TODAS');
  tierSeleccionado = signal<string>('TODOS');
  posicionSeleccionada = signal<string>('TODAS');
  filtroTemporal = signal<'TEMPORADA' | 'MES' | 'SEMANA'>('TEMPORADA');
  busquedaTexto = '';

  // Filtros y Estado del Módulo de Retos Individuales Comprobables
  filtroTipoReto = signal<string>('TODOS');
  retosCatalogo = signal<any[]>([]);
  retosPendientesDT = signal<any[]>([]);
  jugadorParaRetos = signal<AlumnoRankItem | null>(null);
  retosDelJugador = signal<any[]>([]);
  metricasRetosJugador = signal<any>(null);
  mensajeNotificacion = signal<{ texto: string; tipo: 'exito' | 'info' | 'alerta' } | null>(null);
  
  // Ordenamiento por columnas
  sortColumn = signal<string>('posicionRanking');
  sortDirection = signal<'ASC' | 'DESC'>('ASC');

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
          if (catId === 'TODAS') {
            this.top3.set(this.obtenerMockAlumnos().slice(0, 3));
          } else {
            const filteredMock = this.obtenerMockAlumnos().filter(a => a.categoriaId === catId);
            this.top3.set(filteredMock.slice(0, 3));
          }
        }
      },
      error: () => {
        if (catId === 'TODAS') {
          this.top3.set(this.obtenerMockAlumnos().slice(0, 3));
        } else {
          const filteredMock = this.obtenerMockAlumnos().filter(a => a.categoriaId === catId);
          this.top3.set(filteredMock.slice(0, 3));
        }
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
          // Fallback con datos locales si la BD no retorna registros
          this.cargarFallbackLocal();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.cargarFallbackLocal();
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
    let tier: TierRank = 'BRONCE';
    if (nivel >= 15) tier = 'DIAMANTE';
    else if (nivel >= 12) tier = 'ORO';
    else if (nivel >= 10) tier = 'PLATA';

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

  private cargarFallbackLocal(): void {
    let mockList = this.obtenerMockAlumnos();

    // Filtros locales
    if (this.categoriaSeleccionada() !== 'TODAS') {
      mockList = mockList.filter(a => a.categoriaId === this.categoriaSeleccionada());
    }
    if (this.tierSeleccionado() !== 'TODOS') {
      mockList = mockList.filter(a => a.tier === this.tierSeleccionado());
    }
    if (this.posicionSeleccionada() !== 'TODAS') {
      mockList = mockList.filter(a => a.posicionCampo.toLowerCase().includes(this.posicionSeleccionada().toLowerCase()));
    }
    if (this.busquedaTexto.trim()) {
      const q = this.busquedaTexto.trim().toLowerCase();
      mockList = mockList.filter(a => 
        a.nombres.toLowerCase().includes(q) || 
        a.apellidos.toLowerCase().includes(q) ||
        a.dorsal.toString().includes(q) ||
        a.categoriaNombre.toLowerCase().includes(q)
      );
    }

    // Ordenamiento local
    const col = this.sortColumn();
    const isAsc = this.sortDirection() === 'ASC';
    mockList.sort((a: any, b: any) => {
      let valA = a[col];
      let valB = b[col];
      if (typeof valA === 'string') {
        return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
      return isAsc ? valA - valB : valB - valA;
    });

    this.totalRecords.set(mockList.length);
    const start = (this.currentPage() - 1) * this.pageSize();
    this.alumnos.set(mockList.slice(start, start + this.pageSize()));
  }

  // Métodos de Ordenamiento
  setSortColumn(col: string): void {
    if (this.sortColumn() === col) {
      this.sortDirection.update(d => d === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortColumn.set(col);
      if (['xpTotal', 'overallRating', 'rachaEntrenamientos', 'asistenciasEfectividad', 'nivel'].includes(col)) {
        this.sortDirection.set('DESC');
      } else {
        this.sortDirection.set('ASC');
      }
    }
    this.currentPage.set(1);
    this.cargarJugadoresDesdeBD();
  }

  getSortIcon(col: string): string {
    if (this.sortColumn() !== col) {
      return 'fa-sort text-slate-300';
    }
    return this.sortDirection() === 'ASC' 
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
  setMainTab(tab: 'LEADERBOARD' | 'RETOS' | 'CERTIFICACION_DT'): void {
    this.activeMainTab.set(tab);
    if (tab === 'RETOS') {
      if (!this.jugadorParaRetos()) {
        const primero = this.alumnos()[0] || this.top3()[0] || this.obtenerMockAlumnos()[0];
        if (primero) {
          this.seleccionarJugadorParaRetos(primero);
        }
      }
    } else if (tab === 'CERTIFICACION_DT') {
      this.cargarRetosPendientesDT();
    }
  }

  cargarRetosCatalogo(): void {
    this.api.getRetosCatalogo().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        if (list && list.length > 0) {
          this.retosCatalogo.set(list);
        } else {
          this.retosCatalogo.set(this.obtenerMockRetosCatalogo());
        }
      },
      error: () => {
        this.retosCatalogo.set(this.obtenerMockRetosCatalogo());
      }
    });
  }

  cargarRetosPendientesDT(): void {
    this.api.getRetosPendientesVerificacion(this.categoriaSeleccionada()).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        if (list && list.length > 0) {
          this.retosPendientesDT.set(list);
        } else {
          this.retosPendientesDT.set(this.obtenerMockRetosPendientes());
        }
      },
      error: () => {
        this.retosPendientesDT.set(this.obtenerMockRetosPendientes());
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
                  this.top3().find(a => a.id === id) || 
                  this.obtenerMockAlumnos().find(a => a.id === id);
    if (found) {
      this.seleccionarJugadorParaRetos(found);
    }
  }

  cargarRetosJugador(jugadorId: string): void {
    this.api.getRetosJugador(jugadorId).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        if (list && list.length > 0) {
          this.retosDelJugador.set(list);
        } else {
          this.retosDelJugador.set(this.obtenerMockRetosProgresoJugador(jugadorId));
        }
        this.cargarMetricasRetos(jugadorId);
      },
      error: () => {
        this.retosDelJugador.set(this.obtenerMockRetosProgresoJugador(jugadorId));
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
        if (prog.estado === 'APROBADO') {
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
      retosPendientesCount: this.retosDelJugador().filter(p => p.estado === 'COMPROBABLE').length,
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
        this.mostrarNotificacion(`🎯 ¡Reto "${reto.nombre} - ${nivel.titulo}" marcado como COMPROBABLE! Realízalo en cancha delante de tu DT para certificar tus +${nivel.xp} XP.`, 'exito');
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
        this.mostrarNotificacion(`🎯 ¡Reto "${reto.nombre} - ${nivel.titulo}" marcado como COMPROBABLE! Preséntalo delante del profe para validar tus +${nivel.xp} XP.`, 'exito');
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
          'exito'
        );
      } else {
        this.mostrarNotificacion(
          `🏆 ¡Reto Nivel ${nivelTarget} APROBADO por el DT! Se sumaron +${totalXpGanado} XP a ${jugNombre}.`,
          'exito'
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
            existing.estado = 'APROBADO';
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
              estado: 'APROBADO',
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
      this.mostrarNotificacion(`⚠️ Reto devuelto a ${jugNombre} para perfeccionar técnica y volver a presentar.`, 'alerta');
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
        .filter(p => (p.reto_id === retoId || p.retoId === retoId) && p.estado === 'APROBADO')
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

  getProgresoNivel(retoId: string, nivelNum: number): { estado: string; item?: any } {
    const encontrados = this.retosDelJugador().filter(
      p => (p.reto_id === retoId || p.retoId === retoId) && 
           (p.nivel_solicitado === nivelNum || p.nivelSolicitado === nivelNum)
    );
    if (encontrados.length === 0) return { estado: 'DISPONIBLE' };
    const aprobado = encontrados.find(e => e.estado === 'APROBADO');
    if (aprobado) return { estado: 'APROBADO', item: aprobado };
    const comprobable = encontrados.find(e => e.estado === 'COMPROBABLE');
    if (comprobable) return { estado: 'COMPROBABLE', item: comprobable };
    const rechazado = encontrados.find(e => e.estado === 'RECHAZADO');
    if (rechazado) return { estado: 'RECHAZADO', item: rechazado };
    return { estado: 'DISPONIBLE' };
  }

  mostrarNotificacion(texto: string, tipo: 'exito' | 'info' | 'alerta'): void {
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

  private obtenerMockAlumnos(): AlumnoRankItem[] {
    return [
      {
        id: 'alm-1',
        posicionRanking: 1,
        posicionAnterior: 1,
        nombres: 'Mateo',
        apellidos: 'Gómez Restrepo',
        dorsal: 10,
        posicionCampo: 'Volante Ofensivo',
        categoriaId: 'cat-u15',
        categoriaNombre: 'Sub-15 Élite',
        fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
        tier: 'ORO',
        nivel: 14,
        overallRating: 88,
        xpTotal: 3450,
        xpAsistencia: 1200,
        xpRendimientoDT: 900,
        xpMisiones: 650,
        xpTactica: 700,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 98,
        rachaEntrenamientos: 12,
        insigniasCount: 8,
        destacadoSemana: true,
        stats: { ritmo: 89, tiro: 86, pase: 92, regate: 90, defensa: 54, fisico: 78 }
      },
      {
        id: 'alm-2',
        posicionRanking: 2,
        posicionAnterior: 3,
        nombres: 'Samuel',
        apellidos: 'Díaz Marín',
        dorsal: 7,
        posicionCampo: 'Extremo Derecho',
        categoriaId: 'cat-u17',
        categoriaNombre: 'Sub-17 Pro',
        fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        tier: 'ORO',
        nivel: 13,
        overallRating: 86,
        xpTotal: 3120,
        xpAsistencia: 1100,
        xpRendimientoDT: 800,
        xpMisiones: 620,
        xpTactica: 600,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 95,
        rachaEntrenamientos: 9,
        insigniasCount: 6,
        destacadoSemana: false,
        stats: { ritmo: 93, tiro: 84, pase: 80, regate: 88, defensa: 45, fisico: 76 }
      },
      {
        id: 'alm-3',
        posicionRanking: 3,
        posicionAnterior: 2,
        nombres: 'Esteban',
        apellidos: 'Pérez Salazar',
        dorsal: 4,
        posicionCampo: 'Defensa Central',
        categoriaId: 'cat-u17',
        categoriaNombre: 'Sub-17 Pro',
        fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        tier: 'PLATA',
        nivel: 12,
        overallRating: 83,
        xpTotal: 2850,
        xpAsistencia: 1150,
        xpRendimientoDT: 600,
        xpMisiones: 500,
        xpTactica: 600,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 96,
        rachaEntrenamientos: 8,
        insigniasCount: 5,
        destacadoSemana: false,
        stats: { ritmo: 76, tiro: 52, pase: 78, regate: 68, defensa: 88, fisico: 89 }
      },
      {
        id: 'alm-4',
        posicionRanking: 4,
        posicionAnterior: 5,
        nombres: 'Sebastián',
        apellidos: 'Muñoz Arango',
        dorsal: 1,
        posicionCampo: 'Arquero Titular',
        categoriaId: 'cat-u15',
        categoriaNombre: 'Sub-15 Élite',
        fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
        tier: 'PLATA',
        nivel: 11,
        overallRating: 81,
        xpTotal: 2640,
        xpAsistencia: 1050,
        xpRendimientoDT: 500,
        xpMisiones: 490,
        xpTactica: 600,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 92,
        rachaEntrenamientos: 6,
        insigniasCount: 4,
        destacadoSemana: false,
        stats: { ritmo: 72, tiro: 40, pase: 75, regate: 60, defensa: 82, fisico: 84 }
      },
      {
        id: 'alm-5',
        posicionRanking: 5,
        posicionAnterior: 4,
        nombres: 'Santiago',
        apellidos: 'Restrepo Cardona',
        dorsal: 8,
        posicionCampo: 'Mediocentro',
        categoriaId: 'cat-u15',
        categoriaNombre: 'Sub-15 Élite',
        fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
        tier: 'PLATA',
        nivel: 11,
        overallRating: 80,
        xpTotal: 2510,
        xpAsistencia: 1000,
        xpRendimientoDT: 400,
        xpMisiones: 550,
        xpTactica: 560,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 90,
        rachaEntrenamientos: 5,
        insigniasCount: 4,
        destacadoSemana: false,
        stats: { ritmo: 78, tiro: 74, pase: 85, regate: 81, defensa: 72, fisico: 75 }
      },
      {
        id: 'alm-6',
        posicionRanking: 6,
        posicionAnterior: 6,
        nombres: 'Nicolás',
        apellidos: 'Zapata Herrera',
        dorsal: 3,
        posicionCampo: 'Lateral Izquierdo',
        categoriaId: 'cat-u15',
        categoriaNombre: 'Sub-15 Élite',
        fotoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200',
        tier: 'BRONCE',
        nivel: 9,
        overallRating: 77,
        xpTotal: 2190,
        xpAsistencia: 900,
        xpRendimientoDT: 300,
        xpMisiones: 490,
        xpTactica: 500,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 85,
        rachaEntrenamientos: 3,
        insigniasCount: 3,
        destacadoSemana: false,
        stats: { ritmo: 84, tiro: 62, pase: 74, regate: 76, defensa: 75, fisico: 74 }
      },
      {
        id: 'alm-7',
        posicionRanking: 7,
        posicionAnterior: 8,
        nombres: 'Jerónimo',
        apellidos: 'Cano Henao',
        dorsal: 9,
        posicionCampo: 'Delantero Centro',
        categoriaId: 'cat-u17',
        categoriaNombre: 'Sub-17 Pro',
        fotoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
        tier: 'BRONCE',
        nivel: 9,
        overallRating: 76,
        xpTotal: 2050,
        xpAsistencia: 850,
        xpRendimientoDT: 400,
        xpMisiones: 400,
        xpTactica: 400,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 82,
        rachaEntrenamientos: 4,
        insigniasCount: 3,
        destacadoSemana: false,
        stats: { ritmo: 82, tiro: 84, pase: 68, regate: 75, defensa: 35, fisico: 80 }
      },
      {
        id: 'alm-8',
        posicionRanking: 8,
        posicionAnterior: 7,
        nombres: 'Samuel',
        apellidos: 'Vásquez Morales',
        dorsal: 11,
        posicionCampo: 'Extremo Izquierdo',
        categoriaId: 'cat-u15',
        categoriaNombre: 'Sub-15 Élite',
        fotoUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200',
        tier: 'BRONCE',
        nivel: 7,
        overallRating: 72,
        xpTotal: 1580,
        xpAsistencia: 650,
        xpRendimientoDT: 200,
        xpMisiones: 420,
        xpTactica: 370,
        xpPenalizaciones: -60,
        asistenciasEfectividad: 70,
        rachaEntrenamientos: 0,
        insigniasCount: 2,
        destacadoSemana: false,
        stats: { ritmo: 85, tiro: 70, pase: 68, regate: 78, defensa: 32, fisico: 64 }
      },
      {
        id: 'alm-9',
        posicionRanking: 9,
        posicionAnterior: 10,
        nombres: 'Tomás',
        apellidos: 'Mejía Castro',
        dorsal: 5,
        posicionCampo: 'Volante Defensivo',
        categoriaId: 'cat-u13',
        categoriaNombre: 'Sub-13 Cantera',
        fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
        tier: 'BRONCE',
        nivel: 8,
        overallRating: 75,
        xpTotal: 1980,
        xpAsistencia: 900,
        xpRendimientoDT: 350,
        xpMisiones: 380,
        xpTactica: 350,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 88,
        rachaEntrenamientos: 5,
        insigniasCount: 3,
        destacadoSemana: false,
        stats: { ritmo: 75, tiro: 60, pase: 77, regate: 72, defensa: 78, fisico: 70 }
      },
      {
        id: 'alm-10',
        posicionRanking: 10,
        posicionAnterior: 9,
        nombres: 'David',
        apellidos: 'Osorio Londoño',
        dorsal: 2,
        posicionCampo: 'Lateral Derecho',
        categoriaId: 'cat-u13',
        categoriaNombre: 'Sub-13 Cantera',
        fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
        tier: 'BRONCE',
        nivel: 8,
        overallRating: 74,
        xpTotal: 1890,
        xpAsistencia: 800,
        xpRendimientoDT: 300,
        xpMisiones: 400,
        xpTactica: 390,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 84,
        rachaEntrenamientos: 3,
        insigniasCount: 2,
        destacadoSemana: false,
        stats: { ritmo: 82, tiro: 55, pase: 70, regate: 73, defensa: 74, fisico: 68 }
      },
      {
        id: 'alm-11',
        posicionRanking: 11,
        posicionAnterior: 11,
        nombres: 'Lucas',
        apellidos: 'Montoya Bedoya',
        dorsal: 10,
        posicionCampo: 'Volante de Creación',
        categoriaId: 'cat-u20',
        categoriaNombre: 'Sub-20 Primera',
        fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
        tier: 'ORO',
        nivel: 15,
        overallRating: 89,
        xpTotal: 3600,
        xpAsistencia: 1300,
        xpRendimientoDT: 950,
        xpMisiones: 700,
        xpTactica: 650,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 99,
        rachaEntrenamientos: 14,
        insigniasCount: 9,
        destacadoSemana: true,
        stats: { ritmo: 88, tiro: 88, pase: 94, regate: 91, defensa: 62, fisico: 81 }
      },
      {
        id: 'alm-12',
        posicionRanking: 12,
        posicionAnterior: 12,
        nombres: 'Valentina',
        apellidos: 'Sierra Guzmán',
        dorsal: 10,
        posicionCampo: 'Delantera',
        categoriaId: 'cat-fem',
        categoriaNombre: 'Femenino Juvenil',
        fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
        tier: 'ORO',
        nivel: 14,
        overallRating: 87,
        xpTotal: 3380,
        xpAsistencia: 1250,
        xpRendimientoDT: 880,
        xpMisiones: 650,
        xpTactica: 600,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 97,
        rachaEntrenamientos: 11,
        insigniasCount: 7,
        destacadoSemana: true,
        stats: { ritmo: 92, tiro: 90, pase: 85, regate: 89, defensa: 50, fisico: 76 }
      },
      {
        id: 'alm-13',
        posicionRanking: 13,
        posicionAnterior: 13,
        nombres: 'Mariana',
        apellidos: 'Herrera Toro',
        dorsal: 6,
        posicionCampo: 'Volante Central',
        categoriaId: 'cat-fem',
        categoriaNombre: 'Femenino Juvenil',
        fotoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200',
        tier: 'PLATA',
        nivel: 12,
        overallRating: 82,
        xpTotal: 2790,
        xpAsistencia: 1100,
        xpRendimientoDT: 600,
        xpMisiones: 540,
        xpTactica: 550,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 93,
        rachaEntrenamientos: 7,
        insigniasCount: 5,
        destacadoSemana: false,
        stats: { ritmo: 80, tiro: 75, pase: 86, regate: 82, defensa: 74, fisico: 72 }
      },
      {
        id: 'alm-14',
        posicionRanking: 14,
        posicionAnterior: 14,
        nombres: 'Emiliano',
        apellidos: 'Villegas Ruiz',
        dorsal: 9,
        posicionCampo: 'Delantero Centro',
        categoriaId: 'cat-u11',
        categoriaNombre: 'Sub-11 Semillero',
        fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
        tier: 'BRONCE',
        nivel: 6,
        overallRating: 71,
        xpTotal: 1450,
        xpAsistencia: 600,
        xpRendimientoDT: 250,
        xpMisiones: 350,
        xpTactica: 250,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 78,
        rachaEntrenamientos: 2,
        insigniasCount: 2,
        destacadoSemana: false,
        stats: { ritmo: 80, tiro: 76, pase: 65, regate: 74, defensa: 30, fisico: 60 }
      },
      {
        id: 'alm-15',
        posicionRanking: 15,
        posicionAnterior: 15,
        nombres: 'Joaquín',
        apellidos: 'Bustamante Silva',
        dorsal: 1,
        posicionCampo: 'Arquero Titular',
        categoriaId: 'cat-u11',
        categoriaNombre: 'Sub-11 Semillero',
        fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
        tier: 'BRONCE',
        nivel: 6,
        overallRating: 70,
        xpTotal: 1390,
        xpAsistencia: 580,
        xpRendimientoDT: 260,
        xpMisiones: 300,
        xpTactica: 250,
        xpPenalizaciones: 0,
        asistenciasEfectividad: 76,
        rachaEntrenamientos: 1,
        insigniasCount: 1,
        destacadoSemana: false,
        stats: { ritmo: 68, tiro: 35, pase: 66, regate: 55, defensa: 76, fisico: 70 }
      }
    ];
  }

  private obtenerMockRetosCatalogo(): any[] {
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

  private obtenerMockRetosPendientes(): any[] {
    return [
      {
        id: 'p1000000-0000-0000-0000-000000000001',
        club_id: '10000000-0000-0000-0000-000000000001',
        jugador_id: '40000000-0000-0000-0000-000000000001',
        reto_id: 'c1000000-0000-0000-0000-000000000001',
        nivel_solicitado: 3,
        meta_cantidad: 15,
        unidad_medida: 'flexiones',
        xp_recompensa: 100,
        estado: 'COMPROBABLE',
        fecha_solicitud: new Date(Date.now() - 3600000).toISOString(),
        reto_nombre: 'Flexiones de Pecho (Push-Ups)',
        reto_icono: 'fa-solid fa-dumbbell',
        reto_color: '#10B981',
        categoria_reto: 'FUERZA_CALISTENIA',
        jugador_nombre: 'Mateo',
        jugador_apellidos: 'Gómez Restrepo',
        jugador_foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
        jugador_dorsal: 10,
        categoria_nombre: 'Sub-15 Élite'
      },
      {
        id: 'p1000000-0000-0000-0000-000000000002',
        club_id: '10000000-0000-0000-0000-000000000001',
        jugador_id: '40000000-0000-0000-0000-000000000002',
        reto_id: 'c1000000-0000-0000-0000-000000000002',
        nivel_solicitado: 2,
        meta_cantidad: 25,
        unidad_medida: 'toques',
        xp_recompensa: 80,
        estado: 'COMPROBABLE',
        fecha_solicitud: new Date(Date.now() - 7200000).toISOString(),
        reto_nombre: 'Dominadas de Balón (21s / Juggling)',
        reto_icono: 'fa-solid fa-futbol',
        reto_color: '#3B82F6',
        categoria_reto: 'TECNICA_CONTROL',
        jugador_nombre: 'Samuel',
        jugador_apellidos: 'Díaz Marín',
        jugador_foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        jugador_dorsal: 7,
        categoria_nombre: 'Sub-17 Pro'
      }
    ];
  }

  private obtenerMockRetosProgresoJugador(jugadorId: string): any[] {
    return [
      {
        id: 'prog-1',
        jugador_id: jugadorId,
        reto_id: 'c1000000-0000-0000-0000-000000000001',
        nivel_solicitado: 1,
        meta_cantidad: 5,
        unidad_medida: 'flexiones',
        xp_recompensa: 30,
        estado: 'APROBADO',
        fecha_evaluacion: '2026-03-10',
        evaluador_dt_nombre: 'Prof. Mario Yepes',
        observaciones_dt: 'Excelente técnica, pecho abajo y espalda recta.'
      },
      {
        id: 'prog-2',
        jugador_id: jugadorId,
        reto_id: 'c1000000-0000-0000-0000-000000000001',
        nivel_solicitado: 2,
        meta_cantidad: 10,
        unidad_medida: 'flexiones',
        xp_recompensa: 60,
        estado: 'APROBADO',
        fecha_evaluacion: '2026-03-18',
        evaluador_dt_nombre: 'Prof. Mario Yepes',
        observaciones_dt: 'Superó las 10 repeticiones continuas con solvencia.'
      },
      {
        id: 'prog-3',
        jugador_id: jugadorId,
        reto_id: 'c1000000-0000-0000-0000-000000000001',
        nivel_solicitado: 3,
        meta_cantidad: 15,
        unidad_medida: 'flexiones',
        xp_recompensa: 100,
        estado: 'COMPROBABLE',
        fecha_solicitud: new Date().toISOString()
      },
      {
        id: 'prog-4',
        jugador_id: jugadorId,
        reto_id: 'c1000000-0000-0000-0000-000000000002',
        nivel_solicitado: 1,
        meta_cantidad: 10,
        unidad_medida: 'toques',
        xp_recompensa: 40,
        estado: 'APROBADO',
        fecha_evaluacion: '2026-03-12',
        evaluador_dt_nombre: 'Prof. Mario Yepes',
        observaciones_dt: 'Buen control de empeine y borde interno.'
      }
    ];
  }
}

