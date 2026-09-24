import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoPago } from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-comprobante-lightbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comprobante-lightbox.component.html'
})
export class ComprobanteLightboxComponent {
  readonly EstadoPago = EstadoPago;

  @Input() visible = false;
  @Input() data: any = null;
  @Input() isApproving = false;

  @Output() close = new EventEmitter<void>();
  @Output() aprobar = new EventEmitter<string>();
  @Output() rechazar = new EventEmitter<any>();

  formatNumber(val: any): string {
    if (!val) return '0';
    return Number(val).toLocaleString('es-CO');
  }

  cerrar() {
    this.close.emit();
  }
}
