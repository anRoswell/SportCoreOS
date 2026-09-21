import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tienda-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Tienda Oficial & Gestión de Indumentaria</h1>
          <p class="page-subtitle">Kits oficiales, control de tallaje por jugador, inventario en bodega y despachos</p>
        </div>
        <div class="header-actions">
          <div class="filter-tabs">
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'catalogo'"
              (click)="activeTab.set('catalogo')"
            >
              <i class="fa-solid fa-shirt"></i> Catálogo & Ventas
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'pedidos'"
              (click)="activeTab.set('pedidos')"
            >
              <i class="fa-solid fa-boxes-packing"></i> Despachos & Pedidos
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'stock'"
              (click)="activeTab.set('stock')"
            >
              <i class="fa-solid fa-warehouse"></i> Inventario & Bodega
            </button>
          </div>
          <button class="btn-primary" (click)="openCreateProductModal()">
            <i class="fa-solid fa-plus"></i> Nuevo Producto
          </button>
        </div>
      </div>

      <!-- TAB 1: CATÁLOGO DE PRODUCTOS -->
      @if (activeTab() === 'catalogo') {
        <div class="catalogo-section">
          <div class="categories-filter-bar">
            <button
              class="cat-filter-btn"
              [class.active]="selectedCatFilter() === 'TODAS'"
              (click)="selectedCatFilter.set('TODAS')"
            >
              Todos los Artículos
            </button>
            <button
              class="cat-filter-btn"
              [class.active]="selectedCatFilter() === 'uniforme_oficial'"
              (click)="selectedCatFilter.set('uniforme_oficial')"
            >
              Uniformes Oficiales
            </button>
            <button
              class="cat-filter-btn"
              [class.active]="selectedCatFilter() === 'entrenamiento'"
              (click)="selectedCatFilter.set('entrenamiento')"
            >
              Ropa Entrenamiento
            </button>
            <button
              class="cat-filter-btn"
              [class.active]="selectedCatFilter() === 'balones'"
              (click)="selectedCatFilter.set('balones')"
            >
              Balones & Balonería
            </button>
          </div>

          <div class="products-grid">
            @for (p of filteredProductos(); track p.id) {
              <div class="product-card fut-card">
                <div class="product-img-wrap">
                  <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=300'" alt="{{ p.nombre }}" />
                  <span class="badge-cat">{{ formatCategoria(p.categoria) }}</span>
                  @if (p.personalizable) {
                    <span class="badge-custom"><i class="fa-solid fa-signature"></i> Personalizable</span>
                  }
                </div>

                <div class="product-info">
                  <span class="product-sku">{{ p.codigo_sku }}</span>
                  <h3 class="product-title">{{ p.nombre }}</h3>
                  <div class="product-price">\${{ p.precio_venta | number }} COP</div>

                  <!-- VARIANTES DE TALLAS DISPONIBLES -->
                  <div class="variants-wrap">
                    <label class="tallas-label">Tallas disponibles:</label>
                    <div class="tallas-pills">
                      @for (v of p.variantes; track v.id) {
                        <span
                          class="talla-pill"
                          [class.talla-low]="v.stock_actual > 0 && v.stock_actual <= v.stock_minimo_alerta"
                          [class.talla-out]="v.stock_actual === 0"
                        >
                          {{ v.talla }}
                          <small>({{ v.stock_actual }})</small>
                        </span>
                      }
                    </div>
                  </div>

                  <div class="product-card-actions">
                    <button class="btn-primary btn-buy" (click)="openBuyModal(p)">
                      <i class="fa-solid fa-cart-shopping"></i> Pedido
                    </button>
                    <button class="btn-secondary btn-icon-only" (click)="openEditProductModal(p)" title="Editar Producto">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-secondary btn-icon-only btn-danger-hover" (click)="eliminarProducto(p)" title="Desactivar Producto">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-state fut-card">
                <i class="fa-solid fa-shirt"></i>
                <p>No se encontraron productos en esta categoría.</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: PEDIDOS & DESPACHOS -->
      @if (activeTab() === 'pedidos') {
        <div class="pedidos-section fut-card">
          <div class="section-title-wrap">
            <i class="fa-solid fa-boxes-packing"></i>
            <h2>Órdenes de Indumentaria & Entregas en Utilería</h2>
          </div>

          <div class="table-responsive">
            <table class="fut-table">
              <thead>
                <tr>
                  <th>Código QR / Ref</th>
                  <th>Artículo & Talla</th>
                  <th>Personalización</th>
                  <th>Comprador / Jugador</th>
                  <th>Total</th>
                  <th>Estado Entrega</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (ped of pedidosList(); track ped.id) {
                  <tr>
                    <td>
                      <div class="qr-code-pill">
                        <i class="fa-solid fa-qrcode"></i>
                        <span>{{ ped.codigo_qr }}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{{ ped.producto_nombre }}</strong>
                      <div><small class="text-muted">Talla: {{ ped.talla }} • {{ ped.cantidad }} un.</small></div>
                    </td>
                    <td>
                      @if (ped.estampado_nombre || ped.estampado_dorsal) {
                        <div class="dorsal-tag">
                          <span>#{{ ped.estampado_dorsal }}</span>
                          <strong>{{ ped.estampado_nombre }}</strong>
                        </div>
                      } @else {
                        <span class="text-muted">Estándar (Sin dorsal)</span>
                      }
                    </td>
                    <td>
                      <div><strong>{{ ped.comprador_nombre || 'Particular' }}</strong></div>
                      <small class="text-muted">{{ ped.comprador_telefono || '-' }}</small>
                    </td>
                    <td><strong>\${{ ped.monto_total | number }}</strong></td>
                    <td>
                      <span
                        class="badge"
                        [class.badge-success]="ped.estado_despacho === 'ENTREGADO'"
                        [class.badge-warning]="ped.estado_despacho === 'PENDIENTE_ENTREGA'"
                      >
                        {{ ped.estado_despacho === 'ENTREGADO' ? 'Entregado' : 'Pendiente Entrega' }}
                      </span>
                    </td>
                    <td>
                      @if (ped.estado_despacho === 'PENDIENTE_ENTREGA') {
                        <button class="btn-secondary btn-sm" (click)="openDespacharModal(ped)">
                          <i class="fa-solid fa-truck-ramp-box"></i> Despachar
                        </button>
                      } @else {
                        <small class="text-muted"><i class="fa-solid fa-check"></i> {{ ped.recibido_por || 'Entregado' }}</small>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="text-center py-4">No hay órdenes registradas actualmente.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 3: INVENTARIO & BODEGA -->
      @if (activeTab() === 'stock') {
        <div class="stock-section fut-card">
          <div class="section-title-wrap">
            <i class="fa-solid fa-warehouse"></i>
            <h2>Control de Existencias & Bodega por Tallas</h2>
          </div>

          <div class="table-responsive">
            <table class="fut-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Talla</th>
                  <th>Stock Actual</th>
                  <th>Alerta Mínima</th>
                  <th>Nivel de Stock</th>
                  <th>Ajustar Stock</th>
                </tr>
              </thead>
              <tbody>
                @for (p of catalogoList(); track p.id) {
                  @for (v of p.variantes; track v.id) {
                    <tr>
                      <td><code>{{ p.codigo_sku }}</code></td>
                      <td><strong>{{ p.nombre }}</strong></td>
                      <td><span class="badge badge-blue">{{ v.talla }}</span></td>
                      <td><strong class="stock-num">{{ v.stock_actual }}</strong> unidades</td>
                      <td>{{ v.stock_minimo_alerta }} unidades</td>
                      <td>
                        @if (v.stock_actual === 0) {
                          <span class="badge badge-danger">Agotado</span>
                        } @else if (v.stock_actual <= v.stock_minimo_alerta) {
                          <span class="badge badge-warning">Alerta Baja</span>
                        } @else {
                          <span class="badge badge-success">Óptimo</span>
                        }
                      </td>
                      <td>
                        <div class="quick-stock-adjust">
                          <button class="btn-qty" (click)="ajustarStockRapido(v, -1)">-</button>
                          <span class="qty-display">{{ v.stock_actual }}</span>
                          <button class="btn-qty" (click)="ajustarStockRapido(v, 1)">+</button>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL REGISTRAR PEDIDO / VENTA -->
      @if (showBuyModal() && selectedProduct()) {
        <div class="modal-overlay" (click)="closeBuyModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-cart-plus"></i>
                </div>
                <div>
                  <h2>Registrar Pedido de Indumentaria</h2>
                  <p class="modal-subtitle">{{ selectedProduct()?.nombre }}</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeBuyModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitPedido()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-ruler"></i> Talla & Cantidad</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label>Seleccionar Talla <span class="required-star">*</span></label>
                    <select [(ngModel)]="pedidoForm.variante_id" name="variante_id" class="sport-input" required>
                      @for (v of selectedProduct()!.variantes; track v.id) {
                        <option [value]="v.id" [disabled]="v.stock_actual === 0">
                          Talla {{ v.talla }} ({{ v.stock_actual > 0 ? v.stock_actual + ' disp.' : 'AGOTADO' }})
                        </option>
                      }
                    </select>
                  </div>
                  <div class="input-group">
                    <label>Cantidad de Unidades <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="pedidoForm.cantidad" name="cantidad" min="1" class="sport-input" required />
                  </div>
                </div>
              </div>

              @if (selectedProduct()?.personalizable) {
                <div class="modal-section">
                  <span class="modal-section-title"><i class="fa-solid fa-signature"></i> Estampado & Dorsal (Opcional)</span>
                  <div class="form-row g2">
                    <div class="input-group">
                      <label>Nombre a Estampar</label>
                      <input type="text" [(ngModel)]="pedidoForm.estampado_nombre" name="estampado_nombre" placeholder="ej. DÍAZ" class="sport-input" />
                    </div>
                    <div class="input-group">
                      <label>Número de Camiseta (1 al 99)</label>
                      <input type="number" [(ngModel)]="pedidoForm.estampado_dorsal" name="estampado_dorsal" min="1" max="99" class="sport-input" />
                    </div>
                  </div>
                </div>
              }

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-user"></i> Datos del Comprador</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label>Nombre del Padre / Comprador</label>
                    <input type="text" [(ngModel)]="pedidoForm.comprador_nombre" name="comprador_nombre" placeholder="ej. Carlos Pérez" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label>Teléfono WhatsApp</label>
                    <input type="text" [(ngModel)]="pedidoForm.comprador_telefono" name="comprador_telefono" placeholder="+57 310..." class="sport-input" />
                  </div>
                </div>
                <div class="input-group">
                  <label>Método de Pago</label>
                  <select [(ngModel)]="pedidoForm.metodo_pago" name="metodo_pago" class="sport-input">
                    <option value="WOMPI_PSE">Pasarela Wompi / PSE</option>
                    <option value="EFECTIVO_CAJA">Efectivo en Caja</option>
                    <option value="TRANSFERENCIA">Transferencia / Nequi</option>
                  </select>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeBuyModal()">Cancelar</button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-floppy-disk"></i> Confirmar y Generar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL DESPACHAR PEDIDO -->
      @if (showDespachoModal() && selectedPedidoToDeliver()) {
        <div class="modal-overlay" (click)="closeDespachoModal()">
          <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-emerald">
                  <i class="fa-solid fa-truck-ramp-box"></i>
                </div>
                <div>
                  <h2>Validar Despacho</h2>
                  <p class="modal-subtitle">Entrega de indumentaria en secretaría o utilería</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeDespachoModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="despacho-box">
              <div class="qr-big-tag">
                <i class="fa-solid fa-qrcode"></i>
                <span>{{ selectedPedidoToDeliver()?.codigo_qr }}</span>
              </div>
              <p><strong>Artículo:</strong> {{ selectedPedidoToDeliver()?.producto_nombre }} (Talla {{ selectedPedidoToDeliver()?.talla }})</p>
              <p><strong>Comprador:</strong> {{ selectedPedidoToDeliver()?.comprador_nombre }}</p>
            </div>

            <form (ngSubmit)="submitDespacho()" class="modal-form">
              <div class="input-group">
                <label>Nombre de quien recibe la indumentaria <span class="required-star">*</span></label>
                <input type="text" [(ngModel)]="recibidoPorNombre" name="recibidoPor" placeholder="ej. Padre Luis Díaz" class="sport-input" required />
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeDespachoModal()">Cancelar</button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-check"></i> Marcar como Entregado
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL CREAR / EDITAR PRODUCTO -->
      @if (showCreateProductModal() || showEditProductModal()) {
        <div class="modal-overlay" (click)="closeProductFormModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-blue">
                  <i class="fa-solid" [class.fa-shirt]="!isEditingProduct" [class.fa-pen-to-square]="isEditingProduct"></i>
                </div>
                <div>
                  <h2>{{ isEditingProduct ? 'Editar Artículo de Indumentaria' : 'Nuevo Artículo de Indumentaria' }}</h2>
                  <p class="modal-subtitle">Registra o actualiza los datos y catálogo de productos</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeProductFormModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitProductForm()" class="modal-form">
              <div class="modal-section">
                <div class="form-row g2">
                  <div class="input-group">
                    <label>Código SKU <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="productForm.codigo_sku" name="pSku" placeholder="ej. MEDIAS-NEG-2026" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label>Nombre del Producto <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="productForm.nombre" name="pNombre" placeholder="ej. Medias de Competencia Negras" class="sport-input" required />
                  </div>
                </div>

                <div class="form-row g3">
                  <div class="input-group">
                    <label>Categoría <span class="required-star">*</span></label>
                    <select [(ngModel)]="productForm.categoria" name="pCategoria" class="sport-input">
                      <option value="uniforme_oficial">Uniforme Oficial</option>
                      <option value="entrenamiento">Ropa Entrenamiento</option>
                      <option value="balones">Balones</option>
                      <option value="accesorios">Accesorios</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label>Precio Venta ($ COP) <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="productForm.precio_venta" name="pPrecio" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label>Personalizable</label>
                    <select [(ngModel)]="productForm.personalizable" name="pCustom" class="sport-input">
                      <option [ngValue]="false">No</option>
                      <option [ngValue]="true">Sí (Dorsal/Nombre)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeProductFormModal()">Cancelar</button>
                <button type="submit" class="btn-primary">{{ isEditingProduct ? 'Actualizar Producto' : 'Guardar Producto' }}</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- TOAST -->
      @if (toastMessage()) {
        <div class="toast-floating-alert">
          <i class="fa-solid fa-circle-check"></i>
          <span>{{ toastMessage() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .tienda-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;

      .page-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-heading);
      }

      .page-subtitle {
        color: var(--text-body);
        font-size: 0.85rem;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      flex-wrap: wrap;
    }

    .filter-tabs {
      display: flex;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.25rem;

      .tab-btn {
        background: transparent;
        border: none;
        padding: 0.45rem 0.85rem;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.35rem;

        &.active {
          background: var(--color-primary);
          color: #ffffff;
        }
      }
    }

    .categories-filter-bar {
      display: flex;
      gap: 0.65rem;
      margin-bottom: 1.25rem;
      overflow-x: auto;

      .cat-filter-btn {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        color: var(--text-main);
        padding: 0.4rem 0.85rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;

        &.active {
          border-color: var(--color-primary);
          background: rgba(16, 185, 129, 0.12);
          color: var(--color-primary);
        }
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .product-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;

      .product-img-wrap {
        position: relative;
        height: 180px;
        background: #0d1322;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        &:hover img {
          transform: scale(1.05);
        }

        .badge-cat {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: rgba(15, 23, 42, 0.85);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          backdrop-filter: blur(4px);
        }

        .badge-custom {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: #a855f7;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
      }

      .product-info {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        flex: 1;

        .product-sku {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .product-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-heading);
          line-height: 1.35;
        }

        .product-price {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-primary);
        }

        .variants-wrap {
          margin-top: 0.25rem;

          .tallas-label {
            font-size: 0.7rem;
            color: var(--text-muted);
            font-weight: 700;
            display: block;
            margin-bottom: 0.35rem;
          }

          .tallas-pills {
            display: flex;
            gap: 0.35rem;
            flex-wrap: wrap;

            .talla-pill {
              background: var(--bg-hover);
              border: 1px solid var(--border-color);
              font-size: 0.7rem;
              font-weight: 700;
              padding: 0.15rem 0.45rem;
              border-radius: 4px;
              color: var(--text-main);

              &.talla-low {
                border-color: #f59e0b;
                color: #f59e0b;
              }

              &.talla-out {
                opacity: 0.4;
                text-decoration: line-through;
              }
            }
          }
        }

        .product-card-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: auto;

          .btn-buy {
            flex: 1;
          }

          .btn-icon-only {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            border-radius: 6px;
          }

          .btn-danger-hover:hover {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
            border-color: rgba(239, 68, 68, 0.3);
          }
        }
      }
    }

    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 1.25rem;
      color: var(--text-heading);
      i { color: var(--color-primary); }
      h2 { font-size: 1.15rem; font-weight: 800; }
    }

    .qr-code-pill, .qr-big-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--bg-hover);
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--color-primary);
    }

    .dorsal-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(168, 85, 247, 0.15);
      color: #a855f7;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
    }

    .quick-stock-adjust {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;

      .btn-qty {
        width: 26px;
        height: 26px;
        border-radius: 4px;
        border: 1px solid var(--border-color);
        background: var(--bg-hover);
        color: var(--text-main);
        font-weight: 800;
        cursor: pointer;

        &:hover {
          background: var(--color-primary);
          color: #fff;
        }
      }

      .qty-display {
        font-weight: 800;
        font-size: 0.85rem;
        min-width: 24px;
        text-align: center;
      }
    }

    .despacho-box {
      background: var(--bg-hover);
      padding: 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.85rem;
    }

    .toast-floating-alert {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: #ffffff;
      padding: 0.85rem 1.35rem;
      border-radius: var(--radius-md);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-weight: 700;
      z-index: 10000;
      animation: slideInUp 0.3s ease;
    }
  `]
})
export class TiendaComponent implements OnInit {
  private api = inject(ApiService);

  readonly activeTab = signal<'catalogo' | 'pedidos' | 'stock'>('catalogo');
  readonly selectedCatFilter = signal<string>('TODAS');

  readonly catalogoList = signal<any[]>([]);
  readonly pedidosList = signal<any[]>([]);

  readonly selectedProduct = signal<any | null>(null);
  readonly selectedPedidoToDeliver = signal<any | null>(null);

  readonly showBuyModal = signal<boolean>(false);
  readonly showDespachoModal = signal<boolean>(false);
  readonly showCreateProductModal = signal<boolean>(false);
  readonly showEditProductModal = signal<boolean>(false);
  readonly toastMessage = signal<string>('');

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
    ],
  };

  readonly filteredProductos = computed(() => {
    const list = this.catalogoList();
    const filter = this.selectedCatFilter();
    if (filter === 'TODAS') return list;
    return list.filter((p) => p.categoria === filter);
  });

  ngOnInit(): void {
    this.loadCatalogo();
    this.loadPedidos();
  }

  loadCatalogo(): void {
    this.api.getCatalogoTienda().subscribe((data) => {
      this.catalogoList.set(data || []);
    });
  }

  loadPedidos(): void {
    this.api.getPedidosTienda().subscribe((data) => {
      this.pedidosList.set(data || []);
    });
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
      variantes: producto.variantes || [],
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
    if (confirm(`¿Estás seguro de desactivar el producto "${producto.nombre}"?`)) {
      this.api.deleteProductoTienda(producto.id).subscribe({
        next: () => {
          this.showToast('Producto desactivado del catálogo.');
          this.loadCatalogo();
        },
        error: () => {
          this.showToast('Error al eliminar producto.');
        }
      });
    }
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
