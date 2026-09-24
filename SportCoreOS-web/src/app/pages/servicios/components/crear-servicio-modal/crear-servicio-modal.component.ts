import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { CategoriaServicio } from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-crear-servicio-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-servicio-modal.component.html'
})
export class CrearServicioModalComponent {
  private api = inject(ApiService);

  readonly CategoriaServicio = CategoriaServicio;

  @Input() visible = false;
  @Output() close = new EventEmitter<void>();
  @Output() servicioCreado = new EventEmitter<void>();

  // State
  nuevoTitulo = signal<string>('');
  nuevoSubtitulo = signal<string>('');
  nuevaCategoria = signal<CategoriaServicio>(CategoriaServicio.VELOCIDAD_EXPLOSIVIDAD);
  nuevoEntrenador = signal<string>('');
  nuevaCanchaNombre = signal<string>('');
  nuevaCanchaDireccion = signal<string>('');
  nuevosDias = signal<string>('Martes y Jueves');
  nuevoHorario = signal<string>('04:30 PM - 06:00 PM');
  nuevosCupos = signal<number>(15);
  nuevaInsignia = signal<string>('');
  nuevoPrecioIndividual = signal<number>(38000);
  nuevoPrecioMensual = signal<number>(145000);
  nuevaDescripcion = signal<string>('');
  isSaving = signal<boolean>(false);

  cerrar() {
    this.close.emit();
  }

  submitCrearServicio() {
    if (!this.nuevoTitulo() || !this.nuevoEntrenador() || !this.nuevaCanchaNombre()) {
      alert('Por favor completa todos los campos requeridos (*)');
      return;
    }

    this.isSaving.set(true);

    const dto = {
      titulo: this.nuevoTitulo(),
      subtitulo: this.nuevoSubtitulo(),
      categoria_servicio: this.nuevaCategoria(),
      entrenador_nombre: this.nuevoEntrenador(),
      cancha_nombre: this.nuevaCanchaNombre(),
      cancha_direccion: this.nuevaCanchaDireccion(),
      dias_semana: this.nuevosDias(),
      horario_rango: this.nuevoHorario(),
      cupos_totales: Number(this.nuevosCupos()) || 15,
      insignia_obtenida: this.nuevaInsignia() || '🏅 Atleta Élite Graduado',
      precio_sesion_individual: Number(this.nuevoPrecioIndividual()) || 35000,
      precio_paquete_mensual: Number(this.nuevoPrecioMensual()) || 140000,
      descripcion: this.nuevaDescripcion() || this.nuevoSubtitulo(),
      beneficios: [
        'Metodología de alto impacto',
        'Evaluación biomecánica continua',
        'Certificado e insignia para el perfil del atleta'
      ]
    };

    this.api.createServicio(dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.cerrar();
        this.servicioCreado.emit();
      },
      error: (err: any) => {
        this.isSaving.set(false);
        alert(err?.error?.message || 'Error al crear la clínica');
      }
    });
  }
}
