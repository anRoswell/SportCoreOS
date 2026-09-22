import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="finanzas-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión Financiera & Cobros PSE</h1>
          <p class="page-subtitle">Recaudo automático de mensualidades, pasarela de pagos Wompi y control de cartera morosa</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" (click)="onSendBulkReminders()">
            <i class="fa-solid fa-paper-plane"></i> Enviar Recordatorios WhatsApp
          </button>
          <button class="btn-primary" (click)="openGenerarModal()">
            <i class="fa-solid fa-file-invoice-dollar"></i> Generar Cobros del Mes
          </button>
        </div>
      </div>

      <!-- RESUMEN DE MÉTRICAS FINANCIERAS -->
      <div class="metrics-row">
        <div class="fut-card stat-box">
          <span class="stat-label">TOTAL FACTURADO</span>
          <span class="stat-value">$ {{ (resumen()?.total_facturado || 0) | number }} COP</span>
          <span class="stat-sub">Pensiones y matrículas emitidas</span>
        </div>
        <div class="fut-card stat-box">
          <span class="stat-label">TOTAL RECAUDADO (PSE / WOMPI)</span>
          <span class="stat-value text-emerald">$ {{ (resumen()?.total_recaudado || 0) | number }} COP</span>
          <span class="badge badge-success">
            {{ recaudoEfectividad() }}% Efectividad
          </span>
        </div>
        <div class="fut-card stat-box">
          <span class="stat-label">CARTERA EN MORA</span>
          <span class="stat-value text-amber">$ {{ (resumen()?.total_en_mora || 0) | number }} COP</span>
          <span class="stat-sub">{{ resumen()?.total_jugadores_en_mora || 0 }} jugadores con saldo</span>
        </div>
      </div>

      <!-- FILTROS -->
      <div class="filters-row fut-card">
        <div class="filter-item">
          <label>Categoría:</label>
          <select [ngModel]="selectedCategoriaId()" (ngModelChange)="selectedCategoriaId.set($event)" class="sport-select">
            <option value="TODAS">Todas las Categorías</option>
            @for (cat of categorias(); track cat.id) {
              <option [value]="cat.id">{{ cat.nombre }}</option>
            }
          </select>
        </div>
        <div class="filter-item">
          <label>Estado de Pago:</label>
          <select [ngModel]="selectedEstado()" (ngModelChange)="selectedEstado.set($event)" class="sport-select">
            <option value="TODOS">Todos los Estados</option>
            <option value="PAGADO">Al Día (Pagado Total)</option>
            <option value="MORA">En Mora (Con Saldo)</option>
          </select>
        </div>
      </div>

      <!-- TABLA DE ESTADOS DE CUENTA -->
      <div class="fut-table-container">
        <table class="fut-table">
          <thead>
            <tr>
              <th>Jugador / Documento</th>
              <th>Categoría</th>
              <th>Concepto de Cobro</th>
              <th>Monto Facturado</th>
              <th>Monto Pagado</th>
              <th>Saldo Pendiente</th>
              <th>Vencimiento</th>
              <th>Estado Pago</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            @for (c of filteredCargos(); track c.id) {
              <tr class="cargo-row">
                <td>
                  <div class="player-name-box">
                    <strong>{{ c.jugador_nombre }}</strong>
                    <small>{{ c.numero_documento }}</small>
                  </div>
                </td>
                <td><span class="badge badge-blue">{{ c.categoria_nombre }}</span></td>
                <td>{{ c.concepto_nombre }}</td>
                <td><strong>$ {{ c.monto_total | number }}</strong></td>
                <td>$ {{ (c.monto_pagado || 0) | number }}</td>
                <td>
                  <strong [class.text-danger]="c.saldo_pendiente > 0" [class.text-emerald]="c.saldo_pendiente == 0">
                    $ {{ c.saldo_pendiente | number }}
                  </strong>
                </td>
                <td>{{ c.fecha_limite_pago }}</td>
                <td>
                  <span class="badge" [class.badge-success]="c.saldo_pendiente == 0" [class.badge-warning]="c.saldo_pendiente > 0">
                    {{ c.saldo_pendiente == 0 ? 'PAGADO TOTAL' : 'EN MORA' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    @if (c.saldo_pendiente > 0) {
                      <button class="btn-pse" (click)="openPagarModal(c)">
                        <i class="fa-solid fa-credit-card"></i> Pagar PSE
                      </button>
                    } @else {
                      <button class="btn-receipt" (click)="onDownloadReceipt(c)">
                        <i class="fa-solid fa-receipt"></i> Recibo
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="9" class="empty-table-cell">
                  <i class="fa-solid fa-receipt"></i>
                  <p>No se encontraron cargos para los filtros seleccionados.</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- MODAL GENERAR COBROS DEL MES -->
      @if (showGenerarModal()) {
        <div class="modal-overlay" (click)="closeGenerarModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-amber">
                  <i class="fa-solid fa-file-invoice-dollar"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Generar Cobros Masivos</h2>
                  <p class="modal-subtitle">Emisión programada de pensiones con cálculo automático de becas</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeGenerarModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="modal-body">
              <div class="modal-info-alert">
                <i class="fa-solid fa-circle-info text-amber"></i>
                <span>Esta acción emitirá las pensiones del período seleccionado para todos los <strong>jugadores activos</strong> del club aplicando sus porcentajes de beca.</span>
              </div>
              
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-regular fa-calendar-check"></i> Período de Facturación</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-regular fa-calendar"></i> Mes <span class="required-star">*</span></label>
                    <select [(ngModel)]="genMes" name="genMes" class="sport-input">
                      <option [value]="1">Enero</option>
                      <option [value]="2">Febrero</option>
                      <option [value]="3">Marzo</option>
                      <option [value]="4">Abril</option>
                      <option [value]="5">Mayo</option>
                      <option [value]="6">Junio</option>
                      <option [value]="7">Julio</option>
                      <option [value]="8">Agosto</option>
                      <option [value]="9">Septiembre</option>
                      <option [value]="10">Octubre</option>
                      <option [value]="11">Noviembre</option>
                      <option [value]="12">Diciembre</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-hashtag"></i> Año <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="genAnio" name="genAnio" class="sport-input" />
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeGenerarModal()">
                <i class="fa-solid fa-xmark"></i> Cancelar
              </button>
              <button type="button" class="btn-primary" (click)="submitGenerarMensualidad()">
                <i class="fa-solid fa-bolt"></i> Confirmar y Generar Cargos
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL REGISTRAR PAGO PSE -->
      @if (showPagarModal() && selectedCargo()) {
        <div class="modal-overlay" (click)="closePagarModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-blue">
                  <i class="fa-solid fa-credit-card"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Pasarela de Pago PSE / Wompi</h2>
                  <p class="modal-subtitle">Liquidación y confirmación en tiempo real de obligaciones deportivas</p>
                </div>
              </div>
              <button class="btn-close" (click)="closePagarModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitPagar()" class="modal-form">
              <div class="payment-details-box">
                <div class="payment-row">
                  <span>Jugador:</span>
                  <strong>{{ selectedCargo()?.jugador_nombre }}</strong>
                </div>
                <div class="payment-row">
                  <span>Concepto:</span>
                  <strong>{{ selectedCargo()?.concepto_nombre }}</strong>
                </div>
                <div class="payment-row highlight">
                  <span>Saldo Pendiente:</span>
                  <strong class="text-danger">$ {{ selectedCargo()?.saldo_pendiente | number }} COP</strong>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-receipt"></i> Datos de Transacción</span>
                <div class="input-group">
                  <label><i class="fa-solid fa-money-bill-wave"></i> Monto a Pagar ($ COP) <span class="required-star">*</span></label>
                  <div class="currency-input-wrap">
                    <span class="currency-prefix">$</span>
                    <input type="number" [(ngModel)]="montoPago" name="montoPago" [max]="selectedCargo()?.saldo_pendiente" min="1000" class="sport-input" required />
                  </div>
                  <div class="currency-preview-badge">
                    <i class="fa-solid fa-receipt"></i> {{ formatCurrency(montoPago) }} COP
                  </div>
                </div>

                <div class="input-group">
                  <label><i class="fa-solid fa-building-columns"></i> Medio de Recaudo</label>
                  <select [(ngModel)]="metodoPago" name="metodoPago" class="sport-input">
                    <option value="PSE Bancolombia">PSE Bancolombia</option>
                    <option value="PSE Daviplata">PSE Daviplata</option>
                    <option value="PSE Nequi">PSE Nequi</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito Visa / Mastercard</option>
                    <option value="Efectivo / Recibo Caja">Efectivo / Recibo de Caja Directo</option>
                  </select>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closePagarModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-circle-check"></i> Procesar Pago Exitoso
                </button>
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
    .finanzas-page {
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

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .stat-box {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      padding: 1.25rem;

      .stat-label {
        font-size: 0.7rem;
        font-weight: 800;
        color: var(--text-muted);
        letter-spacing: 0.05em;
      }

      .stat-value {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-heading);
      }

      .stat-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .filters-row {
      display: flex;
      gap: 1.5rem;
      padding: 1rem 1.25rem;

      .filter-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
        }
      }
    }

    .sport-select {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.45rem 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      outline: none;
    }

    .player-name-box {
      display: flex;
      flex-direction: column;
      strong { color: var(--text-main); font-size: 0.85rem; }
      small { color: var(--text-muted); font-size: 0.75rem; }
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-pse {
      background: var(--color-primary-subtle);
      color: var(--color-primary-dark);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;

      &:hover {
        background: var(--color-primary);
        color: #FFFFFF;
      }
    }

    .btn-receipt {
      background: var(--bg-surface);
      color: var(--text-muted);
      border: 1px solid var(--border-color);
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        color: var(--text-main);
        background: var(--bg-card-hover);
      }
    }

    .text-emerald { color: var(--color-primary); }
    .text-amber { color: var(--color-warning); }
    .text-danger { color: var(--color-danger); }

    .empty-table-cell {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
      i { font-size: 2rem; margin-bottom: 0.5rem; }
    }

    /* MODAL (inherits from global _modals.scss) */
    .modal-info-alert {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      font-size: 0.825rem;
      color: var(--text-body);
      line-height: 1.4;

      i {
        font-size: 1.1rem;
        margin-top: 0.1rem;
      }
    }

    .payment-details-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      padding: 1.15rem;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      .payment-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.85rem;
        span { color: var(--text-muted); }
        strong { color: var(--text-main); }

        &.highlight {
          padding-top: 0.5rem;
          border-top: 1px dashed var(--border-color);
          font-size: 0.95rem;
        }
      }
    }

    .toast-floating-alert {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: #ffffff;
      padding: 0.85rem 1.35rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-elevated);
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-weight: 700;
      z-index: 10000;
    }
  `]
})
export class FinanzasComponent implements OnInit {
  private api = inject(ApiService);

  readonly resumen = signal<any | null>(null);
  readonly cargos = signal<any[]>([]);
  readonly categorias = signal<any[]>([]);
  readonly selectedCategoriaId = signal<string>('TODAS');
  readonly selectedEstado = signal<string>('TODOS');
  readonly showGenerarModal = signal<boolean>(false);
  readonly showPagarModal = signal<boolean>(false);
  readonly selectedCargo = signal<any | null>(null);
  readonly toastMessage = signal<string>('');

  genMes = new Date().getMonth() + 1;
  genAnio = new Date().getFullYear();
  montoPago = 180000;
  metodoPago = 'PSE Bancolombia';

  readonly filteredCargos = computed(() => {
    let list = this.cargos();
    const catId = this.selectedCategoriaId();
    const estado = this.selectedEstado();

    if (catId !== 'TODAS') {
      list = list.filter((c) => c.categoria_id === catId);
    }
    if (estado === 'PAGADO') {
      list = list.filter((c) => c.saldo_pendiente == 0);
    } else if (estado === 'MORA') {
      list = list.filter((c) => c.saldo_pendiente > 0);
    }
    return list;
  });

  readonly recaudoEfectividad = computed(() => {
    const res = this.resumen();
    if (!res || !res.total_facturado || parseFloat(res.total_facturado) === 0) return 0;
    const fact = parseFloat(res.total_facturado);
    const rec = parseFloat(res.total_recaudado || '0');
    return Math.round((rec / fact) * 100);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.getResumenFinanzas().subscribe((res) => {
      this.resumen.set(res);
    });

    this.api.getCargos().subscribe((data) => {
      const rows = Array.isArray(data) ? data : (data?.data || []);
      this.cargos.set(rows);
    });

    this.api.getCategorias().subscribe((cats) => {
      this.categorias.set(cats || []);
    });
  }

  openGenerarModal(): void {
    this.showGenerarModal.set(true);
  }

  closeGenerarModal(): void {
    this.showGenerarModal.set(false);
  }

  submitGenerarMensualidad(): void {
    this.api.generarMensualidad(this.genMes, this.genAnio).subscribe({
      next: (res) => {
        this.showToast(`¡Cargos generados exitosamente! (${res.cargosCreados} nuevas pensiones creadas)`);
        this.closeGenerarModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al generar mensualidades');
      },
    });
  }

  openPagarModal(cargo: any): void {
    this.selectedCargo.set(cargo);
    this.montoPago = parseFloat(cargo.saldo_pendiente);
    this.showPagarModal.set(true);
  }

  closePagarModal(): void {
    this.showPagarModal.set(false);
    this.selectedCargo.set(null);
  }

  submitPagar(): void {
    const cargo = this.selectedCargo();
    if (!cargo) return;

    this.api.registrarPago(cargo.id, this.montoPago).subscribe({
      next: () => {
        this.showToast(`¡Pago de $${this.montoPago.toLocaleString()} procesado exitosamente vía ${this.metodoPago}!`);
        this.closePagarModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al procesar el pago.');
      },
    });
  }

  formatCurrency(val: any): string {
    if (val === null || val === undefined || val === '') return '$ 0';
    const num = Number(val);
    if (isNaN(num)) return '$ 0';
    return '$ ' + Math.round(num).toLocaleString('es-CO');
  }

  onSendBulkReminders(): void {
    this.showToast('Recordatorios de cobro y links PSE enviados masivamente vía WhatsApp.');
  }

  onDownloadReceipt(cargo: any): void {
    this.showToast(`Descargando comprobante de pago oficial para ${cargo.jugador_nombre}...`);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
