import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

interface ReciboMensualidad {
  id: string;
  mes: string;
  ano: number;
  concepto: string;
  valor: number;
  fechaVencimiento: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
  referenciaPago?: string;
  fechaPago?: string;
}

@Component({
  selector: 'app-pagos-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ScrollingModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="pagos-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Estado de Cuenta & Cartera</h2>
      </div>
      <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarPagos()" title="Actualizar">
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
    </div>

    <main class="page-content">
      <!-- Balance Total del Deportista -->
      <div class="wallet-balance-card">
        <div class="wallet-top">
          <div class="wallet-label">
            <i class="fa-solid fa-wallet text-emerald"></i>
            <span>Saldo Pendiente Total</span>
          </div>
          <span class="wallet-status" [class.al-dia]="totalPendiente() === 0">
            {{ totalPendiente() === 0 ? 'AL DÍA' : 'CUOTAS POR PAGAR' }}
          </span>
        </div>

        <div class="balance-amount">
          <span class="currency">$</span>
          <span class="value">{{ totalPendiente() | number:'1.0-0' }}</span>
          <span class="cop">COP</span>
        </div>

        <div class="wallet-meta">
          <span>Deportista: <strong>Samuel Díaz</strong></span>
          <span>Cat: <strong>Sub-15 Élite</strong></span>
        </div>
      </div>

      <!-- Filtros de Recibos -->
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="filter() === 'TODOS'" (click)="setFilter('TODOS')">Todos ({{ displayedRecibos().length }})</button>
        <button class="tab-btn" [class.active]="filter() === 'PENDIENTES'" (click)="setFilter('PENDIENTES')">Pendientes</button>
        <button class="tab-btn" [class.active]="filter() === 'HISTORIAL'" (click)="setFilter('HISTORIAL')">Historial</button>
      </div>

      <!-- Virtual Scrolling Viewport para Historial Masivo de Pagos -->
      <cdk-virtual-scroll-viewport 
        itemSize="210" 
        class="recibos-viewport"
        (scrolledIndexChange)="onScrollChange($event)">
        
        <div *cdkVirtualFor="let r of displayedRecibos(); trackBy: trackById" class="recibo-item-wrapper">
          <div class="recibo-card" [class]="'border-' + r.estado.toLowerCase()">
            <div class="recibo-header">
              <div class="recibo-title-wrap">
                <span class="mes-badge">{{ r.mes }} {{ r.ano }}</span>
                <span class="concepto-title">{{ r.concepto }}</span>
              </div>
              <span class="estado-pill" [class]="r.estado.toLowerCase()">
                {{ r.estado }}
              </span>
            </div>

            <div class="recibo-body">
              <div class="price-row">
                <span class="price-lbl">Valor Cuota:</span>
                <strong class="price-val">$ {{ r.valor | number:'1.0-0' }} COP</strong>
              </div>
              <div class="date-row">
                <i class="fa-regular fa-calendar-xmark text-amber"></i>
                <span>Vence: <strong>{{ r.fechaVencimiento }}</strong></span>
              </div>
            </div>

            <!-- Acciones de Pago -->
            <div class="recibo-actions">
              @if (r.estado === 'PENDIENTE' || r.estado === 'VENCIDO') {
                <button class="btn-pay-now" (click)="iniciarPago(r)">
                  <i class="fa-solid fa-bolt"></i> Pagar con PSE / Wompi
                </button>
              } @else {
                <div class="paid-details">
                  <span><i class="fa-solid fa-circle-check text-emerald"></i> Ref: {{ r.referenciaPago }}</span>
                  <button class="btn-download-pdf" (click)="descargarComprobante(r)">
                    <i class="fa-solid fa-file-arrow-down"></i>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>

        @if (isLoadingMore()) {
          <div class="loading-more-box">
            <i class="fa-solid fa-circle-notch fa-spin text-primary"></i>
            <span>Cargando más extractos...</span>
          </div>
        } @else if (hasReachedEnd() && displayedRecibos().length > 0) {
          <div class="end-history-box">
            <span>Fin del historial financiero</span>
          </div>
        }
      </cdk-virtual-scroll-viewport>
    </main>

    <!-- Modal Pasarela PSE / Wompi -->
    @if (modalPagoActivo()) {
      <div class="modal-backdrop" (click)="cerrarModalPago()">
        <div class="modal-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <div class="wompi-brand">
              <span class="secure-icon"><i class="fa-solid fa-shield-halved"></i></span>
              <div>
                <h4>Pasarela de Pagos Segura</h4>
                <small>Wompi • PSE • Tarjeta Bancaria</small>
              </div>
            </div>
            <button class="btn-close" (click)="cerrarModalPago()"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="sheet-body">
            <div class="summary-box">
              <span class="concept-lbl">{{ reciboSeleccionado()?.concepto }} ({{ reciboSeleccionado()?.mes }})</span>
              <span class="total-topay">$ {{ reciboSeleccionado()?.valor | number:'1.0-0' }} COP</span>
            </div>

            <div class="payment-methods-grid">
              <button 
                class="method-btn" 
                [class.selected]="metodoSeleccionado() === 'PSE'" 
                (click)="metodoSeleccionado.set('PSE')">
                <i class="fa-solid fa-building-columns"></i>
                <span>PSE Débito</span>
              </button>
              <button 
                class="method-btn" 
                [class.selected]="metodoSeleccionado() === 'CARD'" 
                (click)="metodoSeleccionado.set('CARD')">
                <i class="fa-regular fa-credit-card"></i>
                <span>Tarjeta Crédito</span>
              </button>
              <button 
                class="method-btn" 
                [class.selected]="metodoSeleccionado() === 'NEQUI'" 
                (click)="metodoSeleccionado.set('NEQUI')">
                <i class="fa-solid fa-mobile-screen"></i>
                <span>Nequi / Daviplata</span>
              </button>
            </div>

            <button class="btn-confirm-gateway" [disabled]="procesandoPago()" (click)="procesarTransaccion()">
              @if (procesandoPago()) {
                <i class="fa-solid fa-circle-notch fa-spin"></i> Conectando con banco...
              } @else {
                <i class="fa-solid fa-lock"></i> Confirmar Pago Seguro
              }
            </button>
          </div>
        </div>
      </div>
    }

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .pagos-subbar {
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
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
      }

      .btn-icon-refresh {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        color: #059669;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        &.spinning i {
          animation: spin 0.8s linear infinite;
        }
      }
    }

    .page-content {
      height: calc(100vh - 135px - var(--safe-area-bottom));
      height: calc(100dvh - 135px - var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      background: #f8fafc;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden !important;
      overflow-y: hidden;
      box-sizing: border-box;
    }

    .wallet-balance-card {
      background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f172a 100%);
      color: #fff;
      margin: 0.75rem 0.85rem 0.5rem;
      padding: 1.15rem;
      border-radius: 1.25rem;
      box-shadow: 0 10px 20px -5px rgba(6, 78, 59, 0.4);
      flex-shrink: 0;
      box-sizing: border-box;

      .wallet-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.4rem;

        .wallet-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #a7f3d0;
        }

        .wallet-status {
          font-size: 0.62rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 9999px;
          background: rgba(245, 158, 11, 0.25);
          color: #fde68a;
          border: 1px solid rgba(245, 158, 11, 0.4);

          &.al-dia {
            background: rgba(16, 185, 129, 0.25);
            color: #6ee7b7;
            border-color: rgba(16, 185, 129, 0.4);
          }
        }
      }

      .balance-amount {
        display: flex;
        align-items: baseline;
        gap: 4px;
        margin: 0.25rem 0 0.5rem;

        .currency { font-size: 1.2rem; font-weight: 800; color: #34d399; }
        .value { font-size: 1.85rem; font-weight: 900; letter-spacing: -0.02em; }
        .cop { font-size: 0.72rem; font-weight: 800; color: #a7f3d0; }
      }

      .wallet-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.72rem;
        color: #d1fae5;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        padding-top: 0.4rem;
      }
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      padding: 0 0.85rem 0.5rem;
      flex-shrink: 0;
      width: 100%;
      box-sizing: border-box;

      .tab-btn {
        flex: 1;
        padding: 0.45rem;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.74rem;
        font-weight: 700;
        color: #64748b;
        cursor: pointer;

        &.active {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
      }
    }

    .recibos-viewport {
      flex: 1;
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 0.85rem 0.5rem;
      box-sizing: border-box !important;
      overflow-x: hidden !important;
    }

    .recibo-item-wrapper {
      height: 210px;
      padding-bottom: 0.75rem;
      box-sizing: border-box !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    .recibo-card {
      background: #fff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 0.85rem;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);

      &.border-pendiente { border-left: 5px solid #f59e0b; }
      &.border-vencido { border-left: 5px solid #e11d48; }
      &.border-pagado { border-left: 5px solid #059669; }

      .recibo-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .recibo-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .mes-badge {
            font-size: 0.68rem;
            font-weight: 800;
            color: #059669;
          }

          .concepto-title {
            font-size: 0.86rem;
            font-weight: 800;
            color: #0f172a;
          }
        }

        .estado-pill {
          font-size: 0.62rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;

          &.pendiente { background: #fef3c7; color: #b45309; }
          &.vencido { background: #ffe4e6; color: #be123c; }
          &.pagado { background: #d1fae5; color: #047857; }
        }
      }

      .recibo-body {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8fafc;
        padding: 0.5rem 0.65rem;
        border-radius: 8px;

        .price-val { font-size: 0.95rem; color: #0f172a; }
        .date-row { font-size: 0.72rem; color: #64748b; display: flex; align-items: center; gap: 4px; }
      }

      .recibo-actions {
        .btn-pay-now {
          width: 100%;
          padding: 0.55rem;
          background: #059669;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .paid-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.72rem;
          color: #065f46;
          font-weight: 700;

          .btn-download-pdf {
            width: 28px;
            height: 28px;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background: #fff;
            color: #0f172a;
            cursor: pointer;
          }
        }
      }
    }

    .loading-more-box, .end-history-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0.65rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
    }

    /* Modal Sheet */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: flex-end;
    }

    .modal-sheet {
      background: #fff;
      width: 100%;
      border-radius: 1.5rem 1.5rem 0 0;
      padding: 1.25rem;
      box-sizing: border-box;

      .sheet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .wompi-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          .secure-icon { color: #059669; font-size: 1.4rem; }
          h4 { margin: 0; font-size: 0.95rem; font-weight: 800; color: #0f172a; }
          small { color: #64748b; font-size: 0.68rem; }
        }

        .btn-close {
          background: #f1f5f9;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
        }
      }

      .summary-box {
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 10px;
        padding: 0.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .concept-lbl { font-size: 0.78rem; font-weight: 700; color: #065f46; }
        .total-topay { font-size: 1.1rem; font-weight: 900; color: #047857; }
      }

      .payment-methods-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-bottom: 1.25rem;

        .method-btn {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.65rem 0.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          font-weight: 700;
          color: #334155;
          cursor: pointer;

          i { font-size: 1.1rem; color: #059669; }

          &.selected {
            background: #ecfdf5;
            border-color: #059669;
            color: #065f46;
          }
        }
      }

      .btn-confirm-gateway {
        width: 100%;
        height: 44px;
        background: #059669;
        color: #fff;
        border: none;
        border-radius: 10px;
        font-size: 0.85rem;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
    }

    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class PagosMobileComponent implements OnInit {
  auth = inject(AuthService);
  alert = inject(AlertService);

  isRefreshing = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasReachedEnd = signal<boolean>(false);
  filter = signal<'TODOS' | 'PENDIENTES' | 'HISTORIAL'>('TODOS');

  modalPagoActivo = signal<boolean>(false);
  reciboSeleccionado = signal<ReciboMensualidad | null>(null);
  metodoSeleccionado = signal<'PSE' | 'CARD' | 'NEQUI'>('PSE');
  procesandoPago = signal<boolean>(false);

  private allRecibos: ReciboMensualidad[] = [];
  displayedRecibos = signal<ReciboMensualidad[]>([]);
  totalPendiente = signal<number>(220000);
  private pageSize = 6;
  private currentOffset = 0;

  ngOnInit(): void {
    this.generarCatalogoRecibos();
    this.cargarMas();
  }

  trackById(index: number, item: ReciboMensualidad): string {
    return item.id;
  }

  private generarCatalogoRecibos(): void {
    const meses = ['Septiembre', 'Agosto', 'Julio', 'Junio', 'Mayo', 'Abril', 'Marzo', 'Febrero', 'Enero'];
    const conceptos = ['Pensión Deportiva Mensual', 'Cuota de Arbitraje Oficial', 'Kit Indumentaria Alterna', 'Seguro Médico Póliza Deportiva'];
    
    this.allRecibos = [
      {
        id: 'rec-1',
        mes: 'Septiembre',
        ano: 2026,
        concepto: 'Pensión Deportiva Mensual',
        valor: 180000,
        fechaVencimiento: '30/09/2026',
        estado: 'PENDIENTE'
      },
      {
        id: 'rec-2',
        mes: 'Septiembre',
        ano: 2026,
        concepto: 'Cuota de Arbitraje Oficial',
        valor: 40000,
        fechaVencimiento: '25/09/2026',
        estado: 'PENDIENTE'
      }
    ];

    // Histórico de 36 mensualidades y conceptos
    for (let y = 2026; y >= 2024; y--) {
      meses.forEach((m, idx) => {
        if (y === 2026 && (m === 'Septiembre')) return; // Ya agregados arriba
        this.allRecibos.push({
          id: `rec-${y}-${idx}`,
          mes: m,
          ano: y,
          concepto: conceptos[idx % conceptos.length],
          valor: 180000,
          fechaVencimiento: `05/${idx + 1}/${y}`,
          estado: 'PAGADO',
          referenciaPago: `WMP-PSE-${y}${idx}-8923`,
          fechaPago: `03/${idx + 1}/${y}`
        });
      });
    }
  }

  cargarMas(): void {
    if (this.isLoadingMore() || this.hasReachedEnd()) return;

    this.isLoadingMore.set(true);
    setTimeout(() => {
      let filtered = this.allRecibos;
      if (this.filter() === 'PENDIENTES') {
        filtered = this.allRecibos.filter(r => r.estado !== 'PAGADO');
      } else if (this.filter() === 'HISTORIAL') {
        filtered = this.allRecibos.filter(r => r.estado === 'PAGADO');
      }

      const nextBatch = filtered.slice(this.currentOffset, this.currentOffset + this.pageSize);
      if (nextBatch.length > 0) {
        this.displayedRecibos.update(curr => [...curr, ...nextBatch]);
        this.currentOffset += this.pageSize;
      }
      if (this.currentOffset >= filtered.length) {
        this.hasReachedEnd.set(true);
      }
      this.isLoadingMore.set(false);
    }, 300);
  }

  onScrollChange(index: number): void {
    const total = this.displayedRecibos().length;
    if (index >= total - 2 && !this.isLoadingMore() && !this.hasReachedEnd()) {
      this.cargarMas();
    }
  }

  setFilter(filtro: 'TODOS' | 'PENDIENTES' | 'HISTORIAL'): void {
    this.filter.set(filtro);
    this.currentOffset = 0;
    this.displayedRecibos.set([]);
    this.hasReachedEnd.set(false);
    this.cargarMas();
  }

  recargarPagos(): void {
    this.isRefreshing.set(true);
    this.currentOffset = 0;
    this.displayedRecibos.set([]);
    this.hasReachedEnd.set(false);
    setTimeout(() => {
      this.cargarMas();
      this.isRefreshing.set(false);
    }, 450);
  }

  iniciarPago(recibo: ReciboMensualidad): void {
    this.reciboSeleccionado.set(recibo);
    this.modalPagoActivo.set(true);
  }

  cerrarModalPago(): void {
    this.modalPagoActivo.set(false);
    this.reciboSeleccionado.set(null);
  }

  procesarTransaccion(): void {
    const r = this.reciboSeleccionado();
    if (!r) return;

    this.procesandoPago.set(true);
    setTimeout(() => {
      this.procesandoPago.set(false);
      this.modalPagoActivo.set(false);
      
      // Actualizar estado a pagado
      this.allRecibos = this.allRecibos.map(item => item.id === r.id ? {
        ...item,
        estado: 'PAGADO',
        referenciaPago: `WMP-PSE-2026-ONLINE-${Math.floor(Math.random() * 9000 + 1000)}`,
        fechaPago: 'Hoy'
      } : item);

      this.totalPendiente.update(val => Math.max(0, val - r.valor));
      this.setFilter(this.filter());
      this.alert.success('¡Transacción aprobada! Recibo emitido correctamente.');
    }, 1200);
  }

  descargarComprobante(r: ReciboMensualidad): void {
    this.alert.info(`Descargando comprobante fiscal PDF para ${r.concepto} (${r.mes} ${r.ano})...`);
  }
}
