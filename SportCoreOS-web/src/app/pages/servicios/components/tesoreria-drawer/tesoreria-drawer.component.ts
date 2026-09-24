import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tesoreria-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tesoreria-drawer.component.html'
})
export class TesoreriaDrawerComponent {
  @Input() visible = false;
  @Input() inscripcionesPendientes: any[] = [];
  @Input() isApproving = false;

  @Output() close = new EventEmitter<void>();
  @Output() aprobar = new EventEmitter<string>();
  @Output() rechazar = new EventEmitter<any>();
  @Output() verComprobante = new EventEmitter<any>();

  formatNumber(val: any): string {
    if (!val) return '0';
    return Number(val).toLocaleString('es-CO');
  }

  cerrar() {
    this.close.emit();
  }
}
