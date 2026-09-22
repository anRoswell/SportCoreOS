import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface ProductoTienda {
  id: string;
  nombre: string;
  categoria: 'uniformes' | 'calzado' | 'accesorios' | 'entrenamiento';
  precio: number;
  precioOriginal?: number;
  imagen: string;
  descripcion: string;
  tallas: string[];
  stock: number;
  destacado?: boolean;
}

export interface ItemCarrito {
  producto: ProductoTienda;
  tallaSeleccionada: string;
  cantidad: number;
}

@Component({
  selector: 'app-tienda-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="tienda-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Tienda Oficial</h2>
      </div>
      <div class="cart-trigger" (click)="abrirCarrito()">
        <i class="fa-solid fa-bag-shopping"></i>
        @if (totalItemsCarrito() > 0) {
          <span class="cart-badge">{{ totalItemsCarrito() }}</span>
        }
      </div>
    </div>

    <main class="tienda-container">
      <!-- Banner Promocional -->
      <section class="tienda-hero">
        <div class="hero-badge"><i class="fa-solid fa-sparkles"></i> Colección 2026/2027</div>
        <h2>Viste con orgullo los colores del club</h2>
        <p>Uniformes oficiales, equipamiento técnico y accesorios con envío directo o recogida en sede.</p>
      </section>

      <!-- Selector de Categorías -->
      <div class="categories-scroll">
        <button 
          class="cat-chip" 
          [class.active]="categoriaActiva() === 'todos'"
          (click)="categoriaActiva.set('todos')">
          <i class="fa-solid fa-border-all"></i> Todos
        </button>
        <button 
          class="cat-chip" 
          [class.active]="categoriaActiva() === 'uniformes'"
          (click)="categoriaActiva.set('uniformes')">
          <i class="fa-solid fa-shirt"></i> Uniformes
        </button>
        <button 
          class="cat-chip" 
          [class.active]="categoriaActiva() === 'calzado'"
          (click)="categoriaActiva.set('calzado')">
          <i class="fa-solid fa-shoe-prints"></i> Calzado
        </button>
        <button 
          class="cat-chip" 
          [class.active]="categoriaActiva() === 'accesorios'"
          (click)="categoriaActiva.set('accesorios')">
          <i class="fa-solid fa-socks"></i> Accesorios
        </button>
        <button 
          class="cat-chip" 
          [class.active]="categoriaActiva() === 'entrenamiento'"
          (click)="categoriaActiva.set('entrenamiento')">
          <i class="fa-solid fa-futbol"></i> Balones & Conos
        </button>
      </div>

      <!-- Grid de Productos -->
      <div class="products-grid">
        @for (prod of productosFiltrados(); track prod.id) {
          <div class="product-card" (click)="verDetalle(prod)">
            <div class="prod-img-wrap">
              <img [src]="prod.imagen" [alt]="prod.nombre" loading="lazy" />
              @if (prod.destacado) {
                <span class="badge-featured">Top Ventas</span>
              }
            </div>
            
            <div class="prod-info">
              <span class="prod-cat">{{ prod.categoria | uppercase }}</span>
              <h4 class="prod-title">{{ prod.nombre }}</h4>
              
              <div class="prod-price-row">
                <div class="prices">
                  <span class="current-price">\${{ prod.precio | number }}</span>
                  @if (prod.precioOriginal) {
                    <span class="old-price">\${{ prod.precioOriginal | number }}</span>
                  }
                </div>
                <button class="btn-add-quick" (click)="abrirModalRapido(prod, $event)">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <i class="fa-solid fa-box-open"></i>
            <p>No hay artículos disponibles en esta categoría.</p>
          </div>
        }
      </div>
    </main>

    <!-- Modal Detalle / Añadir Producto -->
    @if (productoSeleccionado()) {
      <div class="modal-backdrop" (click)="cerrarDetalle()">
        <div class="modal-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3>Detalle del Artículo</h3>
            <button class="btn-close" (click)="cerrarDetalle()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="sheet-body">
            <div class="modal-img-wrap">
              <img [src]="productoSeleccionado()!.imagen" [alt]="productoSeleccionado()!.nombre" />
            </div>

            <div class="modal-details">
              <div class="modal-title-row">
                <h4>{{ productoSeleccionado()!.nombre }}</h4>
                <span class="modal-price">\${{ productoSeleccionado()!.precio | number }}</span>
              </div>
              <p class="modal-desc">{{ productoSeleccionado()!.descripcion }}</p>

              @if (productoSeleccionado()!.tallas.length > 0) {
                <div class="size-selector-section">
                  <label>Selecciona tu Talla:</label>
                  <div class="sizes-grid">
                    @for (talla of productoSeleccionado()!.tallas; track talla) {
                      <button 
                        class="size-btn" 
                        [class.selected]="tallaElegida() === talla"
                        (click)="tallaElegida.set(talla)">
                        {{ talla }}
                      </button>
                    }
                  </div>
                </div>
              }

              <div class="stock-info">
                <i class="fa-solid fa-circle-check text-success"></i> 
                <span>{{ productoSeleccionado()!.stock }} unidades disponibles en stock</span>
              </div>
            </div>
          </div>

          <div class="sheet-footer">
            <button class="btn-primary-mobile" (click)="agregarAlCarrito()">
              <i class="fa-solid fa-cart-plus"></i> Agregar al Carrito (\${{ productoSeleccionado()!.precio | number }})
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Drawer de Carrito y Checkout -->
    @if (mostrarCarrito()) {
      <div class="modal-backdrop" (click)="mostrarCarrito.set(false)">
        <div class="cart-drawer" (click)="$event.stopPropagation()">
          <div class="drawer-header">
            <div class="drawer-title">
              <i class="fa-solid fa-bag-shopping"></i>
              <h3>Bolsa de Compras ({{ totalItemsCarrito() }})</h3>
            </div>
            <button class="btn-close" (click)="mostrarCarrito.set(false)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="drawer-body">
            @if (carrito().length === 0) {
              <div class="cart-empty-view">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Tu bolsa de compras está vacía</p>
                <button class="btn-outline-mobile" (click)="mostrarCarrito.set(false)">
                  Explorar Catálogo
                </button>
              </div>
            } @else {
              <div class="cart-items-list">
                @for (item of carrito(); track item.producto.id + item.tallaSeleccionada) {
                  <div class="cart-item-row">
                    <img [src]="item.producto.imagen" [alt]="item.producto.nombre" />
                    <div class="item-details">
                      <h5>{{ item.producto.nombre }}</h5>
                      @if (item.tallaSeleccionada) {
                        <span class="item-meta">Talla: {{ item.tallaSeleccionada }}</span>
                      }
                      <span class="item-price">\${{ item.producto.precio * item.cantidad | number }}</span>
                    </div>

                    <div class="qty-controls">
                      <button (click)="cambiarCantidad(item, -1)"><i class="fa-solid fa-minus"></i></button>
                      <span>{{ item.cantidad }}</span>
                      <button (click)="cambiarCantidad(item, 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                  </div>
                }
              </div>

              <div class="checkout-summary">
                <div class="summary-line">
                  <span>Subtotal</span>
                  <span>\${{ subtotalCarrito() | number }}</span>
                </div>
                <div class="summary-line">
                  <span>Envío a Domicilio / Sede</span>
                  <span class="free-text">GRATIS</span>
                </div>
                <div class="summary-total">
                  <span>Total a Pagar</span>
                  <span class="total-amount">\${{ subtotalCarrito() | number }}</span>
                </div>
              </div>
            }
          </div>

          @if (carrito().length > 0) {
            <div class="drawer-footer">
              <button class="btn-checkout-now" (click)="procederPago()">
                <i class="fa-solid fa-lock"></i> Pagar con Wompi / PSE (\${{ subtotalCarrito() | number }})
              </button>
            </div>
          }
        </div>
      </div>
    }

    <!-- Modal Pago Exitoso Simulado -->
    @if (pagoExitoso()) {
      <div class="modal-backdrop">
        <div class="success-card">
          <div class="icon-success-pulse">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3>¡Pedido Confirmado!</h3>
          <p>Tu orden <strong>#SC-{{ orderNumber }}</strong> ha sido procesada con éxito.</p>
          <div class="order-tips">
            <i class="fa-solid fa-truck-fast"></i> Recibirás las notificaciones de despacho y guía en tu WhatsApp y correo.
          </div>
          <button class="btn-primary-mobile" (click)="cerrarExito()">
            Seguir Comprando
          </button>
        </div>
      </div>
    }

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .tienda-subbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
      background: #fff;
      border-bottom: 1px solid var(--border-color, #e2e8f0);

      .subbar-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .btn-back {
          color: #0f172a;
          font-size: 1.1rem;
          text-decoration: none;
        }

        h2 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
      }
    }

    .cart-trigger {
      position: relative;
      background: var(--bg-hover, #f1f5f9);
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-main, #0f172a);
      font-size: 1.1rem;
      cursor: pointer;

      .cart-badge {
        position: absolute;
        top: -3px;
        right: -3px;
        background: #ef4444;
        color: #fff;
        font-size: 0.65rem;
        font-weight: 800;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fff;
      }
    }

    .tienda-container {
      padding: 1rem;
      padding-bottom: calc(75px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .tienda-hero {
      background: linear-gradient(135deg, #093b29 0%, #064e3b 100%);
      color: #fff;
      padding: 1.4rem;
      border-radius: 1rem;
      box-shadow: 0 10px 25px -5px rgba(6, 78, 59, 0.3);

      .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: rgba(16, 185, 129, 0.25);
        color: #6ee7b7;
        padding: 0.25rem 0.6rem;
        border-radius: 20px;
        font-size: 0.72rem;
        font-weight: 700;
        margin-bottom: 0.6rem;
      }

      h2 {
        font-size: 1.25rem;
        font-weight: 800;
        margin: 0 0 0.4rem 0;
        line-height: 1.25;
      }

      p {
        font-size: 0.8rem;
        opacity: 0.88;
        margin: 0;
        line-height: 1.4;
      }
    }

    .categories-scroll {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }

      .cat-chip {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 0.5rem 0.85rem;
        border-radius: 25px;
        font-size: 0.78rem;
        font-weight: 600;
        color: #475569;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
      }
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.85rem;
    }

    .product-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 0.85rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:active {
        transform: scale(0.98);
      }

      .prod-img-wrap {
        position: relative;
        width: 100%;
        height: 140px;
        background: #f1f5f9;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge-featured {
          position: absolute;
          top: 8px;
          left: 8px;
          background: #f59e0b;
          color: #fff;
          font-size: 0.62rem;
          font-weight: 800;
          padding: 0.2rem 0.45rem;
          border-radius: 6px;
        }
      }

      .prod-info {
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        flex: 1;

        .prod-cat {
          font-size: 0.62rem;
          font-weight: 700;
          color: #10b981;
          letter-spacing: 0.5px;
        }

        .prod-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0.2rem 0 0.5rem 0;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .prod-price-row {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .prices {
            display: flex;
            flex-direction: column;

            .current-price {
              font-size: 0.95rem;
              font-weight: 800;
              color: #0f172a;
            }

            .old-price {
              font-size: 0.7rem;
              text-decoration: line-through;
              color: #94a3b8;
            }
          }

          .btn-add-quick {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #0f172a;
            color: #fff;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            cursor: pointer;
          }
        }
      }
    }

    /* Modals & Drawers */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .modal-sheet, .cart-drawer {
      background: #fff;
      width: 100%;
      max-width: 480px;
      border-radius: 1.5rem 1.5rem 0 0;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sheet-header, .drawer-header {
      padding: 1.15rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;

      h3 {
        font-size: 1.05rem;
        font-weight: 800;
        margin: 0;
        color: #0f172a;
      }

      .drawer-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
        color: #0f172a;
      }

      .btn-close {
        background: #f1f5f9;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        color: #64748b;
        cursor: pointer;
      }
    }

    .sheet-body, .drawer-body {
      padding: 1.25rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .modal-img-wrap {
      width: 100%;
      height: 200px;
      border-radius: 0.85rem;
      overflow: hidden;
      background: #f8fafc;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .modal-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .modal-title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        h4 {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .modal-price {
          font-size: 1.2rem;
          font-weight: 800;
          color: #047857;
        }
      }

      .modal-desc {
        font-size: 0.85rem;
        color: #64748b;
        line-height: 1.45;
        margin: 0;
      }

      .size-selector-section {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e293b;
        }

        .sizes-grid {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;

          .size-btn {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 0.45rem 0.85rem;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.8rem;
            color: #334155;
            cursor: pointer;

            &.selected {
              background: #047857;
              color: #fff;
              border-color: #047857;
            }
          }
        }
      }

      .stock-info {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.78rem;
        font-weight: 600;
        color: #059669;
      }
    }

    .sheet-footer, .drawer-footer {
      padding: 1rem 1.25rem calc(1rem + var(--safe-area-bottom));
      border-top: 1px solid #f1f5f9;
    }

    .btn-primary-mobile, .btn-checkout-now {
      width: 100%;
      background: #047857;
      color: #fff;
      border: none;
      padding: 0.95rem;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.92rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);
    }

    .btn-checkout-now {
      background: #0284c7;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
    }

    /* Carrito Lista */
    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .cart-item-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #f8fafc;
        padding: 0.65rem;
        border-radius: 10px;

        img {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;

          h5 {
            font-size: 0.82rem;
            font-weight: 700;
            margin: 0;
            color: #0f172a;
          }

          .item-meta {
            font-size: 0.7rem;
            color: #64748b;
          }

          .item-price {
            font-size: 0.85rem;
            font-weight: 800;
            color: #047857;
          }
        }

        .qty-controls {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.2rem 0.4rem;

          button {
            background: none;
            border: none;
            color: #475569;
            cursor: pointer;
            font-size: 0.75rem;
          }

          span {
            font-size: 0.8rem;
            font-weight: 700;
            min-width: 16px;
            text-align: center;
          }
        }
      }
    }

    .checkout-summary {
      background: #f8fafc;
      padding: 0.85rem;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      .summary-line {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #64748b;

        .free-text {
          color: #10b981;
          font-weight: 700;
        }
      }

      .summary-total {
        display: flex;
        justify-content: space-between;
        border-top: 1px dashed #cbd5e1;
        padding-top: 0.5rem;
        margin-top: 0.25rem;
        font-size: 0.95rem;
        font-weight: 800;
        color: #0f172a;

        .total-amount {
          color: #047857;
        }
      }
    }

    .cart-empty-view {
      text-align: center;
      padding: 2.5rem 1rem;
      color: #94a3b8;

      i { font-size: 2.8rem; margin-bottom: 0.75rem; }
      p { font-size: 0.9rem; font-weight: 600; }
    }

    .success-card {
      background: #fff;
      width: 90%;
      max-width: 360px;
      border-radius: 1.5rem;
      padding: 1.75rem;
      text-align: center;
      margin: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;

      .icon-success-pulse {
        font-size: 3.5rem;
        color: #10b981;
      }

      h3 {
        font-size: 1.25rem;
        font-weight: 800;
        margin: 0;
        color: #0f172a;
      }

      p {
        font-size: 0.85rem;
        color: #64748b;
        margin: 0;
      }

      .order-tips {
        background: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
        padding: 0.65rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        text-align: left;
      }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `]
})
export class TiendaMobileComponent {
  auth = inject(AuthService);

  categoriaActiva = signal<string>('todos');
  productoSeleccionado = signal<ProductoTienda | null>(null);
  tallaElegida = signal<string>('');
  mostrarCarrito = signal<boolean>(false);
  pagoExitoso = signal<boolean>(false);
  orderNumber = Math.floor(100000 + Math.random() * 900000);

  carrito = signal<ItemCarrito[]>([]);

  productos = signal<ProductoTienda[]>([
    {
      id: 'p1',
      nombre: 'Camiseta Oficial Titular 2026',
      categoria: 'uniformes',
      precio: 145000,
      precioOriginal: 165000,
      imagen: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Tejido transpirable de alta tecnología Dri-FIT con escudo termosellado y detalles en verde esmeralda y blanco.',
      tallas: ['6', '8', '10', '12', '14', 'S', 'M', 'L', 'XL'],
      stock: 42,
      destacado: true
    },
    {
      id: 'p2',
      nombre: 'Uniforme de Presentación & Concentración',
      categoria: 'uniformes',
      precio: 210000,
      precioOriginal: 240000,
      imagen: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Chaqueta impermeable ligera y jogger con bolsillos termosellados. Ideal para viajes oficiales del plantel.',
      tallas: ['10', '12', '14', 'S', 'M', 'L'],
      stock: 18,
      destacado: true
    },
    {
      id: 'p3',
      nombre: 'Guayos Profesionales Césped Sintético',
      categoria: 'calzado',
      precio: 290000,
      precioOriginal: 330000,
      imagen: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Suela multitaco diseñada para máxima tracción y giros rápidos en canchas sintéticas de alto impacto.',
      tallas: ['35', '36', '37', '38', '39', '40', '41', '42'],
      stock: 15
    },
    {
      id: 'p4',
      nombre: 'Espinilleras Anatómicas Pro con Portaespinilleras',
      categoria: 'accesorios',
      precio: 48000,
      imagen: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Carcasa reforzada de polímero ultraligero con espuma EVA de alto confort para absorción de impactos.',
      tallas: ['S', 'M', 'L'],
      stock: 35
    },
    {
      id: 'p5',
      nombre: 'Balón Oficial de Competición #5 FIFA Quality',
      categoria: 'entrenamiento',
      precio: 125000,
      precioOriginal: 140000,
      imagen: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Construcción termosellada sin costuras para un vuelo preciso y nula absorción de agua en lluvia.',
      tallas: [],
      stock: 28,
      destacado: true
    },
    {
      id: 'p6',
      nombre: 'Tula Deportiva con Compartimiento de Calzado',
      categoria: 'accesorios',
      precio: 55000,
      imagen: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
      descripcion: 'Morral compacto con ventilación para guayos y bolsillo interior para celular y documentos personales.',
      tallas: [],
      stock: 50
    }
  ]);

  productosFiltrados = computed(() => {
    const cat = this.categoriaActiva();
    if (cat === 'todos') return this.productos();
    return this.productos().filter(p => p.categoria === cat);
  });

  totalItemsCarrito = computed(() => {
    return this.carrito().reduce((acc, item) => acc + item.cantidad, 0);
  });

  subtotalCarrito = computed(() => {
    return this.carrito().reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  });

  verDetalle(prod: ProductoTienda) {
    this.productoSeleccionado.set(prod);
    this.tallaElegida.set(prod.tallas.length > 0 ? prod.tallas[0] : '');
  }

  abrirModalRapido(prod: ProductoTienda, event: Event) {
    event.stopPropagation();
    this.verDetalle(prod);
  }

  cerrarDetalle() {
    this.productoSeleccionado.set(null);
  }

  abrirCarrito() {
    this.mostrarCarrito.set(true);
  }

  agregarAlCarrito() {
    const prod = this.productoSeleccionado();
    if (!prod) return;

    const talla = this.tallaElegida();
    const items = [...this.carrito()];
    const index = items.findIndex(i => i.producto.id === prod.id && i.tallaSeleccionada === talla);

    if (index > -1) {
      items[index].cantidad += 1;
    } else {
      items.push({
        producto: prod,
        tallaSeleccionada: talla,
        cantidad: 1
      });
    }

    this.carrito.set(items);
    this.cerrarDetalle();
    this.mostrarCarrito.set(true);
  }

  cambiarCantidad(item: ItemCarrito, delta: number) {
    let items = [...this.carrito()];
    const index = items.findIndex(i => i.producto.id === item.producto.id && i.tallaSeleccionada === item.tallaSeleccionada);
    if (index > -1) {
      items[index].cantidad += delta;
      if (items[index].cantidad <= 0) {
        items.splice(index, 1);
      }
    }
    this.carrito.set(items);
  }

  procederPago() {
    this.mostrarCarrito.set(false);
    this.pagoExitoso.set(true);
    this.carrito.set([]);
  }

  cerrarExito() {
    this.pagoExitoso.set(false);
  }
}
