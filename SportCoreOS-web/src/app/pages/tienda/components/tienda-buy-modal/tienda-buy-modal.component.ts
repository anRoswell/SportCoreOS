import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetodoPagoTienda } from '../../../../core/enums/domain.enums';
import { ProductoTienda, CreatePedidoTiendaDto } from '../../../../core/models/tienda.model';

@Component({
  selector: 'app-tienda-buy-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tienda-buy-modal.component.html',
  styleUrl: './tienda-buy-modal.component.scss',
})
export class TiendaBuyModalComponent implements OnInit {
  readonly MetodoPagoTienda = MetodoPagoTienda;

  @Input({ required: true }) producto!: ProductoTienda;
  @Output() close = new EventEmitter<void>();
  @Output() submitPedido = new EventEmitter<CreatePedidoTiendaDto>();

  pedidoForm: CreatePedidoTiendaDto = {
    variante_id: '',
    cantidad: 1,
    estampado_nombre: '',
    estampado_dorsal: null,
    comprador_nombre: '',
    comprador_telefono: '',
    metodo_pago: MetodoPagoTienda.WOMPI_PSE,
  };

  ngOnInit(): void {
    if (this.producto?.variantes && this.producto.variantes.length > 0) {
      const firstDisp = this.producto.variantes.find((v) => v.stock_actual > 0) || this.producto.variantes[0];
      this.pedidoForm.variante_id = firstDisp.id || '';
    }
  }

  onSubmit(): void {
    this.submitPedido.emit(this.pedidoForm);
  }
}
