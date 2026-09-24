import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ranking-certificacion-dt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking-certificacion-dt.component.html'
})
export class RankingCertificacionDtComponent {
  @Input({ required: true }) retosPendientes: any[] = [];
  @Input() pendientesCount = 0;

  @Output() evaluarReto = new EventEmitter<{ reto: any; aprobado: boolean }>();
  @Output() irARetos = new EventEmitter<void>();
}
