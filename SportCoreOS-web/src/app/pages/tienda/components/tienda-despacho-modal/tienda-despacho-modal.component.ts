import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoTienda } from '../../../../core/models/tienda.model';

@Component({
  selector: 'app-tienda-despacho-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tienda-despacho-modal.component.html',
  styleUrl: './tienda-despacho-modal.component.scss',
})
export class TiendaDespachoModalComponent implements OnInit {
  @Input({ required: true }) pedido!: PedidoTienda;
  @Output() close = new EventEmitter<void>();
  @Output() confirmDespacho = new EventEmitter<{ id: string; recibidoPor: string }>();

  recibidoPorNombre: string = '';

  ngOnInit(): void {
    if (this.pedido) {
      this.recibidoPorNombre = this.pedido.comprador_nombre || '';
    }
  }

  onSubmit(): void {
    if (this.pedido?.id) {
      this.confirmDespacho.emit({
        id: this.pedido.id,
        recibidoPor: this.recibidoPorNombre
      });
    }
  }
}
