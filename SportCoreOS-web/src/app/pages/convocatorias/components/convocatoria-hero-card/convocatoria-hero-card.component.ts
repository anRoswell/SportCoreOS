import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartidoConvocatoria } from '../../data/convocatorias.constants';

@Component({
  selector: 'app-convocatoria-hero-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './convocatoria-hero-card.component.html',
  styleUrls: ['./convocatoria-hero-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvocatoriaHeroCardComponent {
  @Input({ required: true }) match!: PartidoConvocatoria;
  @Input({ required: true }) activeClub: { nombre: string; sigla: string } = { nombre: '', sigla: '' };
  @Input({ required: true }) totalConvocados: number = 0;
  @Input({ required: true }) confirmadosCount: number = 0;

  @Output() openGps = new EventEmitter<void>();
}
