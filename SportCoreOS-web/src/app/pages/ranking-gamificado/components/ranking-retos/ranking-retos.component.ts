import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlumnoRankItem } from '../../ranking-gamificado.component';
import { EstadoRetoJugador, CategoriaHabilidadReto } from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-ranking-retos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ranking-retos.component.html'
})
export class RankingRetosComponent {
  readonly EstadoRetoJugador = EstadoRetoJugador;
  readonly CategoriaHabilidadReto = CategoriaHabilidadReto;

  @Input() jugadorActivo: AlumnoRankItem | null = null;
  @Input() todosAlumnos: AlumnoRankItem[] = [];
  @Input() metricasRetos: any = null;
  @Input() retosCatalogo: any[] = [];
  @Input() retosDelJugador: any[] = [];
  @Input() filtroTipoReto: string = CategoriaHabilidadReto.TODOS;


  @Output() seleccionarJugador = new EventEmitter<string>();
  @Output() filtroTipoRetoChange = new EventEmitter<string>();
  @Output() solicitarComprobacion = new EventEmitter<{ reto: any; nivel: any }>();

  retosFiltrados(): any[] {
    const filtro = this.filtroTipoReto;
    if (filtro === 'TODOS') return this.retosCatalogo;
    return this.retosCatalogo.filter(r => r.categoria_habilidad === filtro);
  }

  getProgresoNivel(retoId: string, nivel: number): { estado: EstadoRetoJugador; item?: any } {
    const item = this.retosDelJugador.find(r => (r.reto_id === retoId || r.retoId === retoId) && (r.nivel_alcanzado === nivel || r.nivelAlcanzado === nivel));
    if (!item) return { estado: EstadoRetoJugador.DISPONIBLE };
    if (item.estado === EstadoRetoJugador.APROBADO) return { estado: EstadoRetoJugador.APROBADO, item };
    if (item.estado === EstadoRetoJugador.COMPROBABLE || item.estado === EstadoRetoJugador.PENDIENTE) return { estado: EstadoRetoJugador.COMPROBABLE, item };
    if (item.estado === EstadoRetoJugador.RECHAZADO) return { estado: EstadoRetoJugador.RECHAZADO, item };
    return { estado: EstadoRetoJugador.DISPONIBLE };
  }
}
