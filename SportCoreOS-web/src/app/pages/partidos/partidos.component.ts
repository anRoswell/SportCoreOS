import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  templateUrl: './partidos.component.html',
  styleUrl: './partidos.component.scss'
})
export class PartidosComponent implements OnInit {
  api = inject(ApiService);
  private catalogos = inject(CatalogosService);
  private router = inject(Router);

  readonly kitsIndumentaria = this.catalogos.kitsIndumentaria;
  readonly partidos = signal<any[]>([]);
  readonly categorias = signal<any[]>([]);
  readonly selectedCategoriaId = signal<string>('TODAS');
  readonly selectedEstado = signal<string>('TODOS');
  readonly searchQuery = signal<string>('');
  readonly showScheduleModal = signal<boolean>(false);
  readonly showEditModal = signal<boolean>(false);
  readonly selectedMatchToEdit = signal<any | null>(null);
  readonly showActaModal = signal<boolean>(false);
  readonly selectedPartido = signal<any | null>(null);
  readonly actaEvents = signal<any[]>([]);
  readonly showDeleteModal = signal<boolean>(false);
  readonly matchToDelete = signal<any | null>(null);
  readonly toastMessage = signal<string>('');
  readonly loading = signal<boolean>(false);

  // Paginación Server-Side
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalRecords = signal<number>(0);
  readonly totalPages = signal<number>(1);

  newMatch = {
    categoria_id: '',
    rival_nombre: '',
    fecha_partido: new Date().toISOString().split('T')[0],
    hora_partido: '09:00',
    hora_citacion: '08:00',
    sede_cancha: '',
    condicion_juego: 'LOCAL',
    indumentaria_kit: 'Kit Titular Verde Esmeralda',
  };

  editMatch = {
    categoria_id: '',
    rival_nombre: '',
    fecha_partido: new Date().toISOString().split('T')[0],
    hora_partido: '09:00',
    hora_citacion: '08:00',
    sede_cancha: '',
    condicion_juego: 'LOCAL',
    indumentaria_kit: 'Kit Titular Verde Esmeralda',
    goles_club: 0,
    goles_rival: 0,
    estado_partido: 'PROGRAMADO',
  };

  newEvent = {
    minuto_juego: 15,
    tipo_evento: 'GOL',
    descripcion: '',
  };

  private searchDebounceTimer?: any;

  readonly showingStart = computed(() => {
    if (this.totalRecords() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingEnd = computed(() => {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.totalRecords());
  });

  ngOnInit(): void {
    this.loadCategorias();
    this.loadPartidos();
  }

  loadCategorias(): void {
    this.api.getCategorias({ limit: 100 }).subscribe((cats) => {
      this.categorias.set(cats || []);
      if (cats && cats.length > 0 && !this.newMatch.categoria_id) {
        this.newMatch.categoria_id = cats[0].id;
      }
    });
  }

  loadPartidos(): void {
    this.loading.set(true);
    const catId = this.selectedCategoriaId() !== 'TODAS' ? this.selectedCategoriaId() : undefined;
    const estado = this.selectedEstado() !== 'TODOS' ? this.selectedEstado() : undefined;
    const search = this.searchQuery().trim() || undefined;

    this.api.getPartidos({
      page: this.currentPage(),
      limit: this.pageSize(),
      categoriaId: catId,
      estado: estado,
      search: search
    }).subscribe({
      next: (res) => {
        const rows = Array.isArray(res) ? res : (res?.data || []);
        const total = res?.total !== undefined ? res.total : rows.length;
        const totalP = res?.totalPages !== undefined ? res.totalPages : Math.ceil(total / this.pageSize()) || 1;
        this.partidos.set(rows);
        this.totalRecords.set(total);
        this.totalPages.set(totalP);
        this.loading.set(false);
      },
      error: () => {
        this.partidos.set([]);
        this.totalRecords.set(0);
        this.totalPages.set(1);
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadPartidos();
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadPartidos();
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadPartidos();
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPartidos();
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadPartidos();
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  loadData(): void {
    this.loadPartidos();
  }

  openScheduleModal(): void {
    this.showScheduleModal.set(true);
  }

  closeScheduleModal(): void {
    this.showScheduleModal.set(false);
  }

  openEditModal(partido: any): void {
    this.selectedMatchToEdit.set(partido);
    this.editMatch = {
      categoria_id: partido.categoria_id || (this.categorias().length > 0 ? this.categorias()[0].id : ''),
      rival_nombre: partido.rival_nombre || '',
      fecha_partido: partido.fecha_partido ? partido.fecha_partido.substring(0, 10) : new Date().toISOString().split('T')[0],
      hora_partido: partido.hora_partido || '09:00',
      hora_citacion: partido.hora_citacion || '08:00',
      sede_cancha: partido.sede_cancha || '',
      condicion_juego: partido.condicion_juego || 'LOCAL',
      indumentaria_kit: partido.indumentaria_kit || 'Kit Titular',
      goles_club: partido.goles_club !== null ? Number(partido.goles_club) : 0,
      goles_rival: partido.goles_rival !== null ? Number(partido.goles_rival) : 0,
      estado_partido: partido.estado_partido || 'PROGRAMADO',
    };
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedMatchToEdit.set(null);
  }

  submitSchedule(): void {
    if (!this.newMatch.categoria_id) {
      this.showToast('Debes seleccionar una categoría (*)');
      return;
    }
    if (!this.newMatch.rival_nombre?.trim()) {
      this.showToast('El nombre del equipo rival es obligatorio (*)');
      return;
    }
    if (!this.newMatch.fecha_partido) {
      this.showToast('Indica la fecha del encuentro (*)');
      return;
    }
    if (!this.newMatch.hora_partido) {
      this.showToast('Indica la hora de inicio del partido (*)');
      return;
    }
    if (!this.newMatch.sede_cancha?.trim()) {
      this.showToast('La sede o cancha es obligatoria (*)');
      return;
    }

    this.api.createPartido(this.newMatch).subscribe({
      next: () => {
        this.showToast('¡Partido programado y convocatoria creada exitosamente!');
        this.closeScheduleModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al programar partido.');
      },
    });
  }

  submitEditMatch(): void {
    const partido = this.selectedMatchToEdit();
    if (!partido || !partido.id) return;

    if (!this.editMatch.categoria_id) {
      this.showToast('Debes seleccionar una categoría (*)');
      return;
    }
    if (!this.editMatch.rival_nombre?.trim()) {
      this.showToast('El nombre del equipo rival es obligatorio (*)');
      return;
    }
    if (!this.editMatch.fecha_partido) {
      this.showToast('Indica la fecha del encuentro (*)');
      return;
    }
    if (!this.editMatch.hora_partido) {
      this.showToast('Indica la hora de inicio del partido (*)');
      return;
    }
    if (!this.editMatch.sede_cancha?.trim()) {
      this.showToast('La sede o cancha es obligatoria (*)');
      return;
    }

    this.api.updatePartido(partido.id, this.editMatch).subscribe({
      next: () => {
        this.showToast('¡Compromiso deportivo actualizado exitosamente!');
        this.closeEditModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al actualizar el partido.');
      },
    });
  }

  goToConvocatoria(partido: any): void {
    this.router.navigate(['/convocatorias'], { queryParams: { partidoId: partido.id } });
  }

  openActaModal(partido: any): void {
    this.selectedPartido.set(partido);
    this.showActaModal.set(true);
    this.api.getDetallePartido(partido.id).subscribe((detalle) => {
      this.actaEvents.set(detalle?.eventosActa || []);
    });
  }

  closeActaModal(): void {
    this.showActaModal.set(false);
    this.selectedPartido.set(null);
    this.actaEvents.set([]);
  }

  submitAddEvent(): void {
    const partido = this.selectedPartido();
    if (!partido) return;

    this.api.addEventoPartido(partido.id, this.newEvent).subscribe({
      next: (created) => {
        this.showToast('¡Evento registrado en el acta digital!');
        this.actaEvents.update((evs) => [...evs, created]);
        this.newEvent.descripcion = '';
      },
      error: () => {
        this.showToast('Error al registrar evento');
      },
    });
  }

  openGps(partido: any): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partido.sede_cancha)}`;
    window.open(url, '_blank');
    this.showToast(`Abriendo ubicación para ${partido.sede_cancha}`);
  }

  openDeleteModal(partido: any): void {
    this.matchToDelete.set(partido);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.matchToDelete.set(null);
  }

  confirmDeleteMatch(): void {
    const match = this.matchToDelete();
    if (!match || !match.id) return;

    this.api.deletePartido(match.id).subscribe({
      next: () => {
        this.showToast(`Partido vs ${match.rival_nombre} eliminado del calendario.`);
        this.closeDeleteModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al eliminar el partido.');
      }
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
