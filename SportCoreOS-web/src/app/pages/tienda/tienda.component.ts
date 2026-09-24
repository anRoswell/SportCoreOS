import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { TiendaTab, TiendaCategoriaProducto } from '../../core/enums/domain.enums';
import { ProductoTienda, PedidoTienda, VarianteTienda, CreatePedidoTiendaDto, CreateProductoTiendaDto } from '../../core/models/tienda.model';
import { TiendaCatalogoComponent } from './components/tienda-catalogo/tienda-catalogo.component';
import { TiendaPedidosComponent } from './components/tienda-pedidos/tienda-pedidos.component';
import { TiendaStockComponent } from './components/tienda-stock/tienda-stock.component';
import { TiendaBuyModalComponent } from './components/tienda-buy-modal/tienda-buy-modal.component';
import { TiendaDespachoModalComponent } from './components/tienda-despacho-modal/tienda-despacho-modal.component';
import { TiendaProductFormModalComponent } from './components/tienda-product-form-modal/tienda-product-form-modal.component';
import { TiendaDeleteModalComponent } from './components/tienda-delete-modal/tienda-delete-modal.component';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [
    CommonModule,
    TiendaCatalogoComponent,
    TiendaPedidosComponent,
    TiendaStockComponent,
    TiendaBuyModalComponent,
    TiendaDespachoModalComponent,
    TiendaProductFormModalComponent,
    TiendaDeleteModalComponent
  ],
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.scss'
})
export class TiendaComponent implements OnInit {
  private api = inject(ApiService);

  readonly TiendaTab = TiendaTab;

  readonly activeTab = signal<TiendaTab>(TiendaTab.CATALOGO);
  readonly selectedCatFilter = signal<string>(TiendaCategoriaProducto.TODAS);

  readonly catalogoList = signal<ProductoTienda[]>([]);
  readonly pedidosList = signal<PedidoTienda[]>([]);
  readonly loading = signal<boolean>(false);

  readonly selectedProduct = signal<ProductoTienda | null>(null);
  readonly selectedPedidoToDeliver = signal<PedidoTienda | null>(null);

  readonly showBuyModal = signal<boolean>(false);
  readonly showDespachoModal = signal<boolean>(false);
  readonly showCreateProductModal = signal<boolean>(false);
  readonly showEditProductModal = signal<boolean>(false);
  readonly showDeleteProductModal = signal<boolean>(false);
  readonly productToEdit = signal<ProductoTienda | null>(null);
  readonly productToDelete = signal<ProductoTienda | null>(null);
  readonly toastMessage = signal<string>('');

  // Paginación Server-Side
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(8);
  readonly totalRecords = signal<number>(0);
  readonly totalPages = signal<number>(1);

  readonly showingStart = computed(() => {
    if (this.totalRecords() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingEnd = computed(() => {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.totalRecords());
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.activeTab() === TiendaTab.CATALOGO || this.activeTab() === TiendaTab.STOCK) {
      this.loadCatalogo();
    } else if (this.activeTab() === TiendaTab.PEDIDOS) {
      this.loadPedidos();
    }
  }

  onTabChange(tab: TiendaTab): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.pageSize.set(tab === TiendaTab.CATALOGO ? 8 : 10);
    this.loadData();
  }

  onCatFilterChange(cat: string): void {
    this.selectedCatFilter.set(cat);
    this.currentPage.set(1);
    this.loadCatalogo();
  }

  loadCatalogo(): void {
    this.loading.set(true);
    const cat = this.selectedCatFilter() !== TiendaCategoriaProducto.TODAS ? this.selectedCatFilter() : undefined;
    this.api.getCatalogoTienda({
      page: this.currentPage(),
      limit: this.pageSize(),
      categoria: cat
    }).subscribe({
      next: (res) => {
        const rows = Array.isArray(res) ? res : (res?.data || []);
        const total = res?.total !== undefined ? res.total : rows.length;
        const totalP = res?.totalPages !== undefined ? res.totalPages : Math.ceil(total / this.pageSize()) || 1;
        this.catalogoList.set(rows);
        this.totalRecords.set(total);
        this.totalPages.set(totalP);
        this.loading.set(false);
      },
      error: () => {
        this.catalogoList.set([]);
        this.totalRecords.set(0);
        this.totalPages.set(1);
        this.loading.set(false);
      }
    });
  }

  loadPedidos(): void {
    this.loading.set(true);
    this.api.getPedidosTienda({
      page: this.currentPage(),
      limit: this.pageSize()
    }).subscribe({
      next: (res) => {
        const rows = Array.isArray(res) ? res : (res?.data || []);
        const total = res?.total !== undefined ? res.total : rows.length;
        const totalP = res?.totalPages !== undefined ? res.totalPages : Math.ceil(total / this.pageSize()) || 1;
        this.pedidosList.set(rows);
        this.totalRecords.set(total);
        this.totalPages.set(totalP);
        this.loading.set(false);
      },
      error: () => {
        this.pedidosList.set([]);
        this.totalRecords.set(0);
        this.totalPages.set(1);
        this.loading.set(false);
      }
    });
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadData();
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadData();
  }

  openBuyModal(producto: ProductoTienda): void {
    this.selectedProduct.set(producto);
    this.showBuyModal.set(true);
  }

  closeBuyModal(): void {
    this.showBuyModal.set(false);
    this.selectedProduct.set(null);
  }

  submitPedido(dto: CreatePedidoTiendaDto): void {
    this.api.createPedidoTienda(dto).subscribe({
      next: () => {
        this.showToast('¡Pedido registrado con éxito! QR de despacho generado.');
        this.closeBuyModal();
        this.loadCatalogo();
        this.loadPedidos();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al procesar orden';
        this.showToast(msg);
      }
    });
  }

  openDespacharModal(ped: PedidoTienda): void {
    this.selectedPedidoToDeliver.set(ped);
    this.showDespachoModal.set(true);
  }

  closeDespachoModal(): void {
    this.showDespachoModal.set(false);
    this.selectedPedidoToDeliver.set(null);
  }

  submitDespacho(event: { id: string; recibidoPor: string }): void {
    this.api.despacharPedidoTienda(event.id, event.recibidoPor).subscribe({
      next: () => {
        this.showToast('¡Indumentaria entregada y registrada en utilería!');
        this.closeDespachoModal();
        this.loadPedidos();
      },
      error: () => {
        this.showToast('Error al registrar despacho');
      }
    });
  }

  ajustarStockRapido(event: { variante: VarianteTienda; delta: number }): void {
    if (!event.variante.id) return;
    const nuevoStock = Math.max(0, event.variante.stock_actual + event.delta);
    this.api.ajustarStockVariante(event.variante.id, nuevoStock).subscribe({
      next: () => {
        event.variante.stock_actual = nuevoStock;
        this.showToast(`Stock actualizado: ${nuevoStock} unidades`);
      },
      error: () => {
        this.showToast('Error al actualizar stock');
      }
    });
  }

  openCreateProductModal(): void {
    this.productToEdit.set(null);
    this.showCreateProductModal.set(true);
    this.showEditProductModal.set(false);
  }

  openEditProductModal(producto: ProductoTienda): void {
    this.productToEdit.set(producto);
    this.showEditProductModal.set(true);
    this.showCreateProductModal.set(false);
  }

  closeProductFormModal(): void {
    this.showCreateProductModal.set(false);
    this.showEditProductModal.set(false);
    this.productToEdit.set(null);
  }

  submitProductForm(event: { id: string | null; form: CreateProductoTiendaDto }): void {
    if (event.id) {
      this.api.updateProductoTienda(event.id, event.form).subscribe({
        next: () => {
          this.showToast('¡Producto actualizado exitosamente!');
          this.closeProductFormModal();
          this.loadCatalogo();
        },
        error: () => {
          this.showToast('Error al actualizar producto');
        }
      });
    } else {
      this.api.createProductoTienda(event.form).subscribe({
        next: () => {
          this.showToast('¡Producto agregado al catálogo exitosamente!');
          this.closeProductFormModal();
          this.loadCatalogo();
        },
        error: () => {
          this.showToast('Error al crear producto');
        }
      });
    }
  }

  eliminarProducto(producto: ProductoTienda): void {
    this.productToDelete.set(producto);
    this.showDeleteProductModal.set(true);
  }

  closeDeleteProductModal(): void {
    this.showDeleteProductModal.set(false);
    this.productToDelete.set(null);
  }

  confirmarEliminarProducto(producto: ProductoTienda): void {
    if (!producto.id) return;
    this.api.deleteProductoTienda(producto.id).subscribe({
      next: () => {
        this.showToast('Producto desactivado del catálogo.');
        this.closeDeleteProductModal();
        this.loadCatalogo();
      },
      error: () => {
        this.showToast('Error al eliminar producto.');
      }
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
