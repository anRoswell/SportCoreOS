import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
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
          <span>Deportista: <strong>Santiago Restrepo</strong></span>
          <span>Cat: <strong>Sub-17 Élite</strong></span>
        </div>
      </div>

      <!-- Filtros de Recibos -->
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="filter() === 'TODOS'" (click)="setFilter('TODOS')">Todos</button>
        <button class="tab-btn" [class.active]="filter() === 'PENDIENTES'" (click)="setFilter('PENDIENTES')">Pendientes</button>
        <button class="tab-btn" [class.active]="filter() === 'HISTORIAL'" (click)="setFilter('HISTORIAL')">Historial Pagos</button>
      </div>

      <!-- Lista de Recibos de Mensualidad -->
      <div class="recibos-list">
        @for (r of filteredRecibos(); track r.id) {
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
              @if (r.estado !== 'PAGADO') {
                <button class="btn-pay-pse" (click)="iniciarPago(r)">
                  <i class="fa-solid fa-lock"></i>
                  <span>Pagar con PSE / Wompi</span>
                </button>
              } @else {
                <button class="btn-receipt-download" (click)="descargarComprobante(r)">
                  <i class="fa-solid fa-file-pdf text-emerald"></i>
                  <span>Descargar Comprobante PDF</span>
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <i class="fa-solid fa-receipt empty-icon"></i>
            <p class="empty-title">No hay recibos en este filtro</p>
            <p class="empty-desc">Todos los pagos y cuotas emitidas por administración aparecerán aquí.</p>
          </div>
        }
      </div>
    </main>

    <!-- MODAL DE CHECKOUT PSE / WOMPI -->
    @if (selectedRecibo()) {
      <div class="checkout-modal-backdrop" (click)="cerrarModalCheckout()">
        <div class="checkout-modal-content" (click)="$event.stopPropagation()">
          <div class="checkout-header">
            <div>
              <h3 class="checkout-title"><i class="fa-solid fa-shield-halved text-emerald"></i> Pasarela de Pago Segura</h3>
              <p class="checkout-subtitle">SportCore Club • PSE & Tarjetas (Wompi)</p>
            </div>
            <button class="btn-close-modal" (click)="cerrarModalCheckout()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="checkout-summary-box">
            <div class="summary-line">
              <span>Concepto:</span>
              <strong>{{ selectedRecibo()?.concepto }}</strong>
            </div>
            <div class="summary-line">
              <span>Periodo:</span>
              <strong>{{ selectedRecibo()?.mes }} {{ selectedRecibo()?.ano }}</strong>
            </div>
            <div class="summary-line total">
              <span>Total a Pagar:</span>
              <strong class="total-price">$ {{ selectedRecibo()?.valor | number:'1.0-0' }} COP</strong>
            </div>
          </div>

          <!-- Selector de Método de Pago Móvil -->
          <div class="payment-methods-grid">
            <button type="button" class="btn-method" [class.active]="selectedMethod() === 'PSE'" (click)="selectedMethod.set('PSE')">
              <i class="fa-solid fa-building-columns"></i>
              <span>PSE / Débito</span>
            </button>
            <button type="button" class="btn-method" [class.active]="selectedMethod() === 'TARJETA'" (click)="selectedMethod.set('TARJETA')">
              <i class="fa-solid fa-credit-card"></i>
              <span>Tarjeta Débito/Crédito</span>
            </button>
            <button type="button" class="btn-method" [class.active]="selectedMethod() === 'NEQUI'" (click)="selectedMethod.set('NEQUI')">
              <i class="fa-solid fa-mobile-screen"></i>
              <span>Nequi / Bancolombia</span>
            </button>
          </div>

          <div class="checkout-actions">
            <button class="btn-primary btn-confirm-pay" [disabled]="isProcessingPay()" (click)="procesarPagoFinal()">
              @if (isProcessingPay()) {
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <span>Conectando con Banco...</span>
              } @else {
                <i class="fa-solid fa-lock"></i>
                <span>Confirmar Pago Seguro de $ {{ selectedRecibo()?.valor | number:'1.0-0' }}</span>
              }
            </button>
          </div>
        </div>
      </div>
    }

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .page-content {
      padding: 1rem;
      padding-bottom: calc(85px + var(--safe-area-bottom));
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .wallet-balance-card {
      background: linear-gradient(135deg, #064e3b 0%, #022c22 60%, #0f172a 100%);
      color: #ffffff;
      border-radius: 20px;
      padding: 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(6, 78, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .wallet-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;

      .wallet-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        font-weight: 700;
        color: #a7f3d0;
      }

      .wallet-status {
        font-size: 0.68rem;
        font-weight: 900;
        padding: 3px 8px;
        border-radius: 9999px;
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.4);

        &.al-dia {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border-color: rgba(52, 211, 153, 0.4);
        }
      }
    }

    .balance-amount {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 0.75rem;

      .currency {
        font-size: 1.3rem;
        font-weight: 800;
        color: #34d399;
      }

      .value {
        font-size: 2.2rem;
        font-weight: 900;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .cop {
        font-size: 0.8rem;
        font-weight: 800;
        color: #a7f3d0;
      }
    }

    .wallet-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.76rem;
      color: #94a3b8;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 0.65rem;

      strong {
        color: #ffffff;
      }
    }

    .filter-tabs {
      display: flex;
      gap: 4px;
      background: #ffffff;
      padding: 4px;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .tab-btn {
      flex: 1;
      padding: 7px 8px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;

      &.active {
        background: #10b981;
        color: #ffffff;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
      }
    }

    .recibos-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recibo-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);

      &.border-pendiente { border-left: 4px solid #f59e0b; }
      &.border-vencido { border-left: 4px solid #ef4444; }
      &.border-pagado { border-left: 4px solid #10b981; }
    }

    .recibo-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .recibo-title-wrap {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .mes-badge {
          font-size: 0.7rem;
          font-weight: 900;
          color: #047857;
          text-transform: uppercase;
        }

        .concepto-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
        }
      }
    }

    .estado-pill {
      font-size: 0.68rem;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 9999px;
      text-transform: uppercase;

      &.pendiente { background: rgba(245, 158, 11, 0.15); color: #b45309; }
      &.vencido { background: rgba(239, 68, 68, 0.15); color: #b91c1c; }
      &.pagado { background: rgba(16, 185, 129, 0.15); color: #047857; }
    }

    .recibo-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;

      .price-row {
        display: flex;
        flex-direction: column;

        .price-lbl {
          font-size: 0.68rem;
          font-weight: 700;
          color: #64748b;
        }

        .price-val {
          font-size: 1rem;
          font-weight: 900;
          color: #0f172a;
        }
      }

      .date-row {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.76rem;
        color: #475569;
      }
    }

    .recibo-actions {
      margin-top: 2px;

      .btn-pay-pse {
        width: 100%;
        background: linear-gradient(135deg, #10b981 0%, #047857 100%);
        color: #ffffff;
        border: none;
        padding: 10px;
        border-radius: 12px;
        font-size: 0.88rem;
        font-weight: 900;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);

        &:active {
          transform: scale(0.98);
        }
      }

      .btn-receipt-download {
        width: 100%;
        background: #f1f5f9;
        color: #334155;
        border: 1px solid #cbd5e1;
        padding: 9px;
        border-radius: 12px;
        font-size: 0.82rem;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      background: #ffffff;
      border-radius: 16px;
      border: 1.5px solid #e2e8f0;

      .empty-icon {
        font-size: 2.5rem;
        color: #cbd5e1;
        margin-bottom: 10px;
      }

      .empty-title {
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 4px;
      }

      .empty-desc {
        font-size: 0.8rem;
        color: #64748b;
        margin: 0;
      }
    }

    /* MODAL CHECKOUT */
    .checkout-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .checkout-modal-content {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.25rem;
      max-width: 460px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .checkout-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .checkout-title {
        font-size: 1.1rem;
        font-weight: 900;
        color: #0f172a;
        margin: 0;
      }

      .checkout-subtitle {
        font-size: 0.74rem;
        color: #64748b;
        margin: 2px 0 0;
      }

      .btn-close-modal {
        background: transparent;
        border: none;
        font-size: 1.2rem;
        color: #94a3b8;
        cursor: pointer;
      }
    }

    .checkout-summary-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .summary-line {
        display: flex;
        justify-content: space-between;
        font-size: 0.82rem;
        color: #475569;

        strong {
          color: #0f172a;
        }

        &.total {
          border-top: 1px solid #e2e8f0;
          padding-top: 6px;
          margin-top: 2px;
          font-size: 0.92rem;
          font-weight: 800;

          .total-price {
            color: #047857;
            font-size: 1.15rem;
            font-weight: 900;
          }
        }
      }
    }

    .payment-methods-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;

      .btn-method {
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        padding: 10px 4px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        color: #475569;
        transition: all 0.2s ease;

        i {
          font-size: 1.2rem;
          color: #64748b;
        }

        &.active {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.08);
          color: #047857;
          font-weight: 900;

          i {
            color: #10b981;
          }
        }
      }
    }

    .btn-confirm-pay {
      width: 100%;
      padding: 0.95rem;
      font-size: 0.95rem;
      font-weight: 900;
      border-radius: 14px;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
    }
  `]
})
export class PagosMobileComponent implements OnInit {
  private alertService = inject(AlertService);

  isRefreshing = signal<boolean>(false);
  filter = signal<'TODOS' | 'PENDIENTES' | 'HISTORIAL'>('TODOS');
  selectedRecibo = signal<ReciboMensualidad | null>(null);
  selectedMethod = signal<'PSE' | 'TARJETA' | 'NEQUI'>('PSE');
  isProcessingPay = signal<boolean>(false);

  recargarPagos(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
      this.alertService.success('Estado de cartera y pagos actualizado desde la base de datos.');
    }, 600);
  }

  recibos = signal<ReciboMensualidad[]>([
    {
      id: 'rec-09-2026',
      mes: 'Septiembre',
      ano: 2026,
      concepto: 'Mensualidad Formación Deportiva',
      valor: 180000,
      fechaVencimiento: '05 Oct 2026',
      estado: 'PENDIENTE'
    },
    {
      id: 'rec-08-2026',
      mes: 'Agosto',
      ano: 2026,
      concepto: 'Mensualidad Formación Deportiva',
      valor: 180000,
      fechaVencimiento: '05 Sep 2026',
      estado: 'PAGADO',
      referenciaPago: 'WOMPI-7890214',
      fechaPago: '02 Sep 2026'
    },
    {
      id: 'rec-07-2026',
      mes: 'Julio',
      ano: 2026,
      concepto: 'Mensualidad Formación Deportiva',
      valor: 180000,
      fechaVencimiento: '05 Ago 2026',
      estado: 'PAGADO',
      referenciaPago: 'WOMPI-6541098',
      fechaPago: '03 Ago 2026'
    }
  ]);

  filteredRecibos = signal<ReciboMensualidad[]>([]);

  ngOnInit(): void {
    this.updateFilter();
  }

  setFilter(f: 'TODOS' | 'PENDIENTES' | 'HISTORIAL'): void {
    this.filter.set(f);
    this.updateFilter();
  }

  totalPendiente(): number {
    return this.recibos()
      .filter(r => r.estado !== 'PAGADO')
      .reduce((acc, curr) => acc + curr.valor, 0);
  }

  updateFilter(): void {
    const f = this.filter();
    const all = this.recibos();
    if (f === 'PENDIENTES') {
      this.filteredRecibos.set(all.filter(r => r.estado !== 'PAGADO'));
    } else if (f === 'HISTORIAL') {
      this.filteredRecibos.set(all.filter(r => r.estado === 'PAGADO'));
    } else {
      this.filteredRecibos.set(all);
    }
  }

  iniciarPago(r: ReciboMensualidad): void {
    this.selectedRecibo.set(r);
  }

  cerrarModalCheckout(): void {
    this.selectedRecibo.set(null);
  }

  procesarPagoFinal(): void {
    this.isProcessingPay.set(true);

    setTimeout(() => {
      this.isProcessingPay.set(false);
      const targetId = this.selectedRecibo()?.id;

      this.recibos.update(list => list.map(r => {
        if (r.id === targetId) {
          return {
            ...r,
            estado: 'PAGADO',
            referenciaPago: `PSE-${Math.floor(1000000 + Math.random() * 9000000)}`,
            fechaPago: 'Hoy'
          };
        }
        return r;
      }));

      this.cerrarModalCheckout();
      this.updateFilter();
      this.alertService.success('¡Pago procesado exitosamente a través de PSE / Wompi!');
    }, 1200);
  }

  descargarComprobante(r: ReciboMensualidad): void {
    this.alertService.info(`Descargando comprobante fiscal de pago (${r.referenciaPago || 'REC-PDF'})...`);
  }
}
