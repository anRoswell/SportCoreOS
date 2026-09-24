import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoTienda } from '../../../../core/models/tienda.model';

@Component({
  selector: 'app-tienda-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tienda-delete-modal.component.html',
  styleUrls: ['./tienda-delete-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiendaDeleteModalComponent {
  @Input() producto: ProductoTienda | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<ProductoTienda>();

  onConfirm(): void {
    if (this.producto) {
      this.confirm.emit(this.producto);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
