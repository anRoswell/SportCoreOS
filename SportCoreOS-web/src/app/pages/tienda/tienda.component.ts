import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.scss'
})
export class TiendaComponent implements OnInit {
  private api = inject(ApiService);

  readonly activeTab = signal<'catalogo' | 'pedidos' | 'stock'>('catalogo');
  readonly selectedCatFilter = signal<string>('TODAS');

  readonly catalogoList = signal<any[]>([]);
  readonly pedidosList = signal<any[]>([]);
  readonly loading = signal<boolean>(false);

  readonly selectedProduct = signal<any | null>(null);
  readonly selectedPedidoToDeliver = signal<any | null>(null);

  readonly showBuyModal = signal<boolean>(false);
  readonly showDespachoModal = signal<boolean>(false);
  readonly showCreateProductModal = signal<boolean>(false);
  readonly showEditProductModal = signal<boolean>(false);
  readonly showDeleteProductModal = signal<boolean>(false);
  readonly productToDelete = signal<any | null>(null);
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

  isEditingProduct: boolean = false;
  editingProductId: string | null = null;
  recibidoPorNombre: string = '';

  pedidoForm = {
    variante_id: '',
    cantidad: 1,
    estampado_nombre: '',
    estampado_dorsal: null,
    comprador_nombre: '',
    comprador_telefono: '',
    metodo_pago: 'WOMPI_PSE',
  };

  productForm = {
    codigo_sku: '',
    nombre: '',
    categoria: 'uniforme_oficial',
    precio_venta: 120000,
    personalizable: false,
    variantes: [
      { talla: '8', stock_actual: 10 },
      { talla: '10', stock_actual: 15 },
      { talla: '12', stock_actual: 15 },
      { talla: 'M', stock_actual: 10 },
    ] as any[],
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (this.activeTab() === 'catalogo' || this.activeTab() === 'stock') {
      this.loadCatalogo();
    } else if (this.activeTab() === 'pedidos') {
      this.loadPedidos();
    }
  }

  onTabChange(tab: 'catalogo' | 'pedidos' | 'stock'): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.pageSize.set(tab === 'catalogo' ? 8 : 10);
    this.loadData();
  }

  onCatFilterChange(cat: string): void {
    this.selectedCatFilter.set(cat);
    this.currentPage.set(1);
    this.loadCatalogo();
  }

  loadCatalogo(): void {
    this.loading.set(true);
    const cat = this.selectedCatFilter() !== 'TODAS' ? this.selectedCatFilter() : undefined;
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

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatCategoria(cat: string): string {
    switch (cat) {
      case 'uniforme_oficial': return 'Uniforme Oficial';
      case 'entrenamiento': return 'Entrenamiento';
      case 'balones': return 'Balones';
      case 'accesorios': return 'Accesorios';
      default: return cat;
    }
  }

  formatCurrency(val: any): string {
    if (val === null || val === undefined || val === '') return '$ 0';
    const num = Number(val);
    if (isNaN(num)) return '$ 0';
    return '$ ' + Math.round(num).toLocaleString('es-CO');
  }

  openBuyModal(producto: any): void {
    this.selectedProduct.set(producto);
    if (producto.variantes && producto.variantes.length > 0) {
      const firstDisp = producto.variantes.find((v: any) => v.stock_actual > 0) || producto.variantes[0];
      this.pedidoForm.variante_id = firstDisp.id;
    }
    this.showBuyModal.set(true);
  }

  closeBuyModal(): void {
    this.showBuyModal.set(false);
    this.selectedProduct.set(null);
  }

  submitPedido(): void {
    if (!this.pedidoForm.variante_id || this.pedidoForm.cantidad < 1) {
      this.showToast('Selecciona una talla válida');
      return;
    }

    this.api.createPedidoTienda(this.pedidoForm).subscribe({
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

  openDespacharModal(ped: any): void {
    this.selectedPedidoToDeliver.set(ped);
    this.recibidoPorNombre = ped.comprador_nombre || '';
    this.showDespachoModal.set(true);
  }

  closeDespachoModal(): void {
    this.showDespachoModal.set(false);
    this.selectedPedidoToDeliver.set(null);
  }

  submitDespacho(): void {
    const ped = this.selectedPedidoToDeliver();
    if (!ped || !this.recibidoPorNombre) {
      this.showToast('Por favor indica quién recibe la indumentaria');
      return;
    }

    this.api.despacharPedidoTienda(ped.id, this.recibidoPorNombre).subscribe({
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

  ajustarStockRapido(variante: any, delta: number): void {
    const nuevoStock = Math.max(0, variante.stock_actual + delta);
    this.api.ajustarStockVariante(variante.id, nuevoStock).subscribe({
      next: () => {
        variante.stock_actual = nuevoStock;
        this.showToast(`Stock actualizado: ${nuevoStock} unidades`);
      },
      error: () => {
        this.showToast('Error al actualizar stock');
      }
    });
  }

  addVariantRow(): void {
    this.productForm.variantes.push({ talla: '', stock_actual: 10 });
  }

  removeVariantRow(index: number): void {
    if (this.productForm.variantes.length > 1) {
      this.productForm.variantes.splice(index, 1);
    }
  }

  openCreateProductModal(): void {
    this.isEditingProduct = false;
    this.editingProductId = null;
    this.productForm = {
      codigo_sku: '',
      nombre: '',
      categoria: 'uniforme_oficial',
      precio_venta: 120000,
      personalizable: false,
      variantes: [
        { talla: '8', stock_actual: 10 },
        { talla: '10', stock_actual: 15 },
        { talla: '12', stock_actual: 15 },
        { talla: 'M', stock_actual: 10 },
      ],
    };
    this.showCreateProductModal.set(true);
    this.showEditProductModal.set(false);
  }

  openEditProductModal(producto: any): void {
    this.isEditingProduct = true;
    this.editingProductId = producto.id;
    this.productForm = {
      codigo_sku: producto.codigo_sku,
      nombre: producto.nombre,
      categoria: producto.categoria || 'uniforme_oficial',
      precio_venta: Number(producto.precio_venta) || 0,
      personalizable: !!producto.personalizable,
      variantes: producto.variantes && producto.variantes.length > 0 
        ? producto.variantes.map((v: any) => ({ talla: v.talla, stock_actual: v.stock_actual }))
        : [{ talla: 'Única', stock_actual: 10 }],
    };
    this.showEditProductModal.set(true);
    this.showCreateProductModal.set(false);
  }

  closeProductFormModal(): void {
    this.showCreateProductModal.set(false);
    this.showEditProductModal.set(false);
    this.isEditingProduct = false;
    this.editingProductId = null;
  }

  submitProductForm(): void {
    if (!this.productForm.codigo_sku || !this.productForm.nombre) {
      this.showToast('Completa los campos obligatorios');
      return;
    }

    if (this.isEditingProduct && this.editingProductId) {
      this.api.updateProductoTienda(this.editingProductId, this.productForm).subscribe({
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
      this.api.createProductoTienda(this.productForm).subscribe({
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

  eliminarProducto(producto: any): void {
    this.productToDelete.set(producto);
    this.showDeleteProductModal.set(true);
  }

  closeDeleteProductModal(): void {
    this.showDeleteProductModal.set(false);
    this.productToDelete.set(null);
  }

  confirmarEliminarProducto(): void {
    const prod = this.productToDelete();
    if (!prod) return;

    this.api.deleteProductoTienda(prod.id).subscribe({
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
