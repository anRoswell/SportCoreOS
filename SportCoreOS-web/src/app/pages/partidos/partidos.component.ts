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
  readonly showScheduleModal = signal<boolean>(false);
  readonly showEditModal = signal<boolean>(false);
  readonly selectedMatchToEdit = signal<any | null>(null);
  readonly showActaModal = signal<boolean>(false);
  readonly selectedPartido = signal<any | null>(null);
  readonly actaEvents = signal<any[]>([]);
  readonly showDeleteModal = signal<boolean>(false);
  readonly matchToDelete = signal<any | null>(null);
  readonly toastMessage = signal<string>('');

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

  readonly filteredPartidos = computed(() => {
    const list = this.partidos();
    const catId = this.selectedCategoriaId();
    if (catId === 'TODAS') return list;
    return list.filter((p) => p.categoria_id === catId);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.getCategorias().subscribe((cats) => {
      this.categorias.set(cats || []);
      if (cats && cats.length > 0 && !this.newMatch.categoria_id) {
        this.newMatch.categoria_id = cats[0].id;
      }
    });

    this.api.getPartidos().subscribe((data) => {
      const rows = Array.isArray(data) ? data : (data?.data || []);
      this.partidos.set(rows);
    });
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
