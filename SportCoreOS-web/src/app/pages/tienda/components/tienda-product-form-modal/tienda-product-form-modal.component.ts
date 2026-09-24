import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { formatCurrencyCOP } from '../../data/tienda.constants';
import { TiendaCategoriaProducto } from '../../../../core/enums/domain.enums';
import { ProductoTienda, CreateProductoTiendaDto } from '../../../../core/models/tienda.model';

@Component({
  selector: 'app-tienda-product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tienda-product-form-modal.component.html',
  styleUrl: './tienda-product-form-modal.component.scss',
})
export class TiendaProductFormModalComponent implements OnInit, OnChanges {
  readonly TiendaCategoriaProducto = TiendaCategoriaProducto;

  @Input() isEditing: boolean = false;
  @Input() producto: ProductoTienda | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: string | null; form: CreateProductoTiendaDto }>();

  productForm: CreateProductoTiendaDto = {
    codigo_sku: '',
    nombre: '',
    categoria: TiendaCategoriaProducto.UNIFORME_OFICIAL,
    precio_venta: 120000,
    personalizable: false,
    variantes: [
      { talla: '8', stock_actual: 10 },
      { talla: '10', stock_actual: 15 },
      { talla: '12', stock_actual: 15 },
      { talla: 'M', stock_actual: 10 },
    ],
  };

  ngOnInit(): void {
    this.syncForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto'] || changes['isEditing']) {
      this.syncForm();
    }
  }

  private syncForm(): void {
    if (this.isEditing && this.producto) {
      this.productForm = {
        codigo_sku: this.producto.codigo_sku,
        nombre: this.producto.nombre,
        categoria: this.producto.categoria || TiendaCategoriaProducto.UNIFORME_OFICIAL,
        precio_venta: Number(this.producto.precio_venta) || 0,
        personalizable: !!this.producto.personalizable,
        variantes: this.producto.variantes && this.producto.variantes.length > 0
          ? this.producto.variantes.map((v) => ({ talla: v.talla, stock_actual: v.stock_actual }))
          : [{ talla: 'Única', stock_actual: 10 }]
      };
    } else {
      this.productForm = {
        codigo_sku: '',
        nombre: '',
        categoria: TiendaCategoriaProducto.UNIFORME_OFICIAL,
        precio_venta: 120000,
        personalizable: false,
        variantes: [
          { talla: '8', stock_actual: 10 },
          { talla: '10', stock_actual: 15 },
          { talla: '12', stock_actual: 15 },
          { talla: 'M', stock_actual: 10 },
        ],
      };
    }
  }

  formatCurrency(val: any): string {
    return formatCurrencyCOP(val);
  }

  addVariantRow(): void {
    this.productForm.variantes.push({ talla: '', stock_actual: 10 });
  }

  removeVariantRow(index: number): void {
    if (this.productForm.variantes.length > 1) {
      this.productForm.variantes.splice(index, 1);
    }
  }

  onSubmit(): void {
    this.save.emit({
      id: this.isEditing && this.producto?.id ? this.producto.id : null,
      form: this.productForm
    });
  }
}
