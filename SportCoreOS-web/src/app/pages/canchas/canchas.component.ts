import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

@Component({
  selector: 'app-canchas',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  template: `
    <div class="canchas-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Alquiler de Canchas & Escenarios Deportivos</h1>
          <p class="page-subtitle">Matriz de disponibilidad horaria, control de iluminación y liquidación de turnos</p>
        </div>
        <div class="header-actions">
          <div class="date-picker-wrap">
            <label class="date-label"><i class="fa-regular fa-calendar"></i> Fecha:</label>
            <input
              type="text"
              appFlatpickr
              placeholder="dd/mm/aaaa"
              [ngModel]="selectedFecha()"
              (ngModelChange)="onFechaChange($event)"
              class="sport-input date-input"
            />
          </div>
          <button class="btn-secondary" (click)="openCanchasListModal()">
            <i class="fa-solid fa-list-check"></i> Gestionar Canchas
          </button>
          <button class="btn-primary" (click)="openNuevaReservaModal()">
            <i class="fa-solid fa-plus"></i> Nueva Reserva
          </button>
        </div>
      </div>

      <!-- KPI METRICS ROW -->
      <div class="kpi-row">
        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-emerald-glow">
            <i class="fa-solid fa-chart-pie"></i>
          </div>
          <div>
            <div class="kpi-val">{{ disponibilidadData()?.porcentaje_ocupacion || 0 }}%</div>
            <div class="kpi-label">Ocupación del Día</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-blue-glow">
            <i class="fa-solid fa-futbol"></i>
          </div>
          <div>
            <div class="kpi-val">{{ canchasList().length }}</div>
            <div class="kpi-label">Canchas Habilitadas</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-amber-glow">
            <i class="fa-solid fa-clock"></i>
          </div>
          <div>
            <div class="kpi-val">{{ disponibilidadData()?.slots_ocupados || 0 }} / {{ disponibilidadData()?.total_slots || 0 }}</div>
            <div class="kpi-label">Turnos Ocupados Hoy</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-purple-glow">
            <i class="fa-solid fa-lightbulb"></i>
          </div>
          <div>
            <div class="kpi-val">18:00 - 23:00</div>
            <div class="kpi-label">Tarifa Nocturna Activa</div>
          </div>
        </div>
      </div>

      <!-- MATRIZ HORARIA DE CANCHAS -->
      <div class="matriz-container fut-card">
        <div class="matriz-header">
          <div class="matriz-title">
            <i class="fa-solid fa-calendar-days"></i>
            <span>Cuadrícula de Horarios • {{ selectedFecha() }}</span>
          </div>
          <div class="legend-wrap">
            <span class="legend-item"><span class="dot dot-disponible"></span> Disponible</span>
            <span class="legend-item"><span class="dot dot-club"></span> Bloqueo Formativo / Club</span>
            <span class="legend-item"><span class="dot dot-alquiler"></span> Alquiler Particular</span>
            <span class="legend-item"><span class="dot dot-mantenimiento"></span> Mantenimiento</span>
          </div>
        </div>

        @if (disponibilidadData()?.canchas && disponibilidadData()!.canchas.length > 0) {
          <div class="grid-table-scroll">
            <table class="matriz-table">
              <thead>
                <tr>
                  <th class="th-hora">Franja Horaria</th>
                  @for (c of disponibilidadData()!.canchas; track c.id) {
                    <th class="th-cancha">
                      <div class="cancha-title-th">
                        <strong>{{ c.nombre }}</strong>
                        <span class="badge-surface">{{ formatSuperficie(c.tipo_superficie) }}</span>
                      </div>
                      <div class="cancha-prices-th">
                        <span>☀️ Diurna: \${{ c.precio_hora_diurna | number }}</span>
                        <span>🌙 Noct: \${{ c.precio_hora_nocturna | number }}</span>
                      </div>
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (h of horasSlots; track h.inicio) {
                  <tr>
                    <td class="td-hora">
                      <strong>{{ h.inicio }} - {{ h.fin }}</strong>
                      @if (h.esNocturno) {
                        <span class="luz-tag"><i class="fa-solid fa-lightbulb"></i> Nocturno</span>
                      }
                    </td>
                    @for (c of disponibilidadData()!.canchas; track c.id) {
                      @let slot = getSlotForCancha(c, h.inicio);
                      <td class="td-slot">
                        @if (slot) {
                          <div
                            class="slot-card"
                            [class.slot-disponible]="slot.estado === 'disponible'"
                            [class.slot-club]="slot.estado === 'bloqueado_club'"
                            [class.slot-alquiler]="slot.estado === 'ocupado_particular'"
                            [class.slot-mantenimiento]="slot.estado === 'mantenimiento'"
                            (click)="onSlotClick(c, slot)"
                          >
                            <div class="slot-header">
                              <span class="slot-badge">{{ getSlotBadgeText(slot.estado) }}</span>
                              @if (slot.estado === 'disponible') {
                                <span class="slot-price">\${{ slot.tarifa | number }}</span>
                              }
                            </div>
                            <div class="slot-main-text">
                              {{ slot.estado_label }}
                            </div>
                            @if (slot.estado === 'ocupado_particular') {
                              <div class="slot-footer-info">
                                <span class="badge-pago" [class.pago-completo]="slot.estado_pago === 'completado'" [class.pago-parcial]="slot.estado_pago === 'parcial'">
                                  {{ slot.estado_pago | uppercase }}
                                </span>
                                @if (slot.estado_pago !== 'completado') {
                                  <button class="btn-xs-pay" (click)="openPagoCajaModal(slot, $event)" title="Pagar en Recepción">
                                    <i class="fa-solid fa-cash-register"></i> Cobrar
                                  </button>
                                }
                                <button class="btn-xs-cancel" (click)="cancelarReserva(slot, $event)" title="Cancelar Reserva">
                                  <i class="fa-solid fa-ban"></i>
                                </button>
                              </div>
                            }
                          </div>
                        }
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty-state">
            <i class="fa-solid fa-futbol"></i>
            <p>No se encontraron escenarios deportivos registrados para este club.</p>
            <button class="btn-primary btn-sm" (click)="openCreateCanchaModal()">Crear Primera Cancha</button>
          </div>
        }
      </div>

      <!-- MODAL NUEVA RESERVA -->
      @if (showReservaModal()) {
        <div class="modal-overlay" (click)="closeReservaModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-calendar-plus"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Nueva Reserva de Escenario</h2>
                  <p class="modal-subtitle">Aparta un turno para alquiler particular, entrenamiento o mantenimiento</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeReservaModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitReserva()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-futbol"></i> Escenario & Horario</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label>Cancha / Escenario <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="reservaForm.cancha_id" name="cancha_id" class="sport-input" required>
                        @for (c of canchasList(); track c.id) {
                          <option [value]="c.id">{{ c.nombre }} ({{ formatSuperficie(c.tipo_superficie) }})</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label>Fecha de Turno <span class="required-star">*</span></label>
                    <input type="text" appFlatpickr placeholder="dd/mm/aaaa" [(ngModel)]="reservaForm.fecha_reserva" name="fecha_reserva" class="sport-input" required />
                  </div>
                </div>

                <div class="form-row g3">
                  <div class="input-group">
                    <label>Hora Inicio <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="reservaForm.hora_inicio" name="hora_inicio" class="sport-input" required>
                        @for (h of horasSlots; track h.inicio) {
                          <option [value]="h.inicio">{{ h.inicio }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label>Hora Fin <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="reservaForm.hora_fin" name="hora_fin" class="sport-input" required>
                        @for (h of horasSlots; track h.fin) {
                          <option [value]="h.fin">{{ h.fin }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label>Tipo de Reserva <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="reservaForm.tipo_reserva" name="tipo_reserva" class="sport-input" required>
                        <option value="alquiler_particular">Alquiler Particular</option>
                        <option value="entrenamiento_club">Entrenamiento Club (Exonerado)</option>
                        <option value="partido_oficial">Partido Oficial Liga</option>
                        <option value="mantenimiento">Mantenimiento de Césped/Luz</option>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-user"></i> Datos del Cliente & Abono</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label>Nombre del Cliente / Empresa</label>
                    <input type="text" [(ngModel)]="reservaForm.cliente_nombre" name="cliente_nombre" placeholder="ej. Andrés Pérez" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label>WhatsApp de Contacto</label>
                    <input type="text" [(ngModel)]="reservaForm.cliente_telefono" name="cliente_telefono" placeholder="+57 310..." class="sport-input" />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label>Seña / Anticipo Abonado ($ COP)</label>
                    <div class="currency-input-wrap">
                      <span class="currency-prefix">$</span>
                      <input type="number" [(ngModel)]="reservaForm.monto_anticipo" name="monto_anticipo" min="0" class="sport-input" placeholder="0" />
                    </div>
                    <div class="currency-preview-badge">
                      <i class="fa-solid fa-money-bill-wave"></i> {{ formatCurrency(reservaForm.monto_anticipo) }} COP
                    </div>
                  </div>
                  <div class="input-group">
                    <label>Medio de Pago <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="reservaForm.metodo_pago" name="metodo_pago" class="sport-input" required>
                        <option value="WOMPI_PSE">Pasarela Wompi / PSE</option>
                        <option value="EFECTIVO_CAJA">Efectivo en Caja</option>
                        <option value="TRANSFERENCIA">Transferencia Bancolombia/Nequi</option>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeReservaModal()">Cancelar</button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-floppy-disk"></i> Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL COBRO EN CAJA -->
      @if (showPagoModal() && selectedSlotForPay()) {
        <div class="modal-overlay" (click)="closePagoModal()">
          <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-emerald">
                  <i class="fa-solid fa-cash-register"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Cobro en Recepción</h2>
                  <p class="modal-subtitle">{{ selectedSlotForPay()?.estado_label }}</p>
                </div>
              </div>
              <button class="btn-close" (click)="closePagoModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="pago-details-card">
              <div class="pago-row">
                <span>Valor Total Turno:</span>
                <strong>\${{ selectedSlotForPay()?.monto_total | number }}</strong>
              </div>
              <div class="pago-row">
                <span>Anticipo Previo:</span>
                <span class="text-success">-\${{ selectedSlotForPay()?.monto_anticipo | number }}</span>
              </div>
              <div class="pago-row total-highlight">
                <span>Saldo Pendiente:</span>
                <strong>\${{ (selectedSlotForPay()?.monto_total - selectedSlotForPay()?.monto_anticipo) | number }}</strong>
              </div>
            </div>

            <form (ngSubmit)="submitPagoCaja()" class="modal-form">
              <div class="input-group">
                <label>Monto a Recibir ($ COP) <span class="required-star">*</span></label>
                <div class="currency-input-wrap">
                  <span class="currency-prefix">$</span>
                  <input type="number" [(ngModel)]="pagoCajaMonto" name="pagoMonto" min="0" class="sport-input" required placeholder="0" />
                </div>
                <div class="currency-preview-badge">
                  <i class="fa-solid fa-receipt"></i> {{ formatCurrency(pagoCajaMonto) }} COP
                </div>
              </div>
              <div class="input-group">
                <label>Método de Pago <span class="required-star">*</span></label>
                <div class="sport-select-wrapper">
                  <select [(ngModel)]="pagoCajaMetodo" name="pagoMetodo" class="sport-input">
                    <option value="EFECTIVO_CAJA">Efectivo (Caja)</option>
                    <option value="DATAFONO">Datáfono / Tarjeta</option>
                    <option value="TRANSFERENCIA">Nequi / Daviplata</option>
                  </select>
                  <i class="fa-solid fa-chevron-down select-chevron"></i>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closePagoModal()">Cancelar</button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-receipt"></i> Registrar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL GESTIÓN DE CANCHAS -->
      @if (showCanchasListModal()) {
        <div class="modal-overlay" (click)="closeCanchasListModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-blue">
                  <i class="fa-solid fa-gear"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Configuración de Escenarios Deportivos</h2>
                  <p class="modal-subtitle">Administra los predios, tipos de superficie y tarifas horarias</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeCanchasListModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="canchas-crud-table-wrap">
              <table class="fut-table">
                <thead>
                  <tr>
                    <th>Escenario</th>
                    <th>Superficie</th>
                    <th>Tarifa Diurna</th>
                    <th>Tarifa Nocturna (Luz)</th>
                    <th>Horario Operativo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of canchasList(); track c.id) {
                    <tr>
                      <td><strong>{{ c.nombre }}</strong></td>
                      <td><span class="badge badge-blue">{{ formatSuperficie(c.tipo_superficie) }}</span></td>
                      <td>\${{ c.precio_hora_diurna | number }}</td>
                      <td>\${{ c.precio_hora_nocturna | number }}</td>
                      <td>{{ c.hora_apertura }} - {{ c.hora_cierre }}</td>
                      <td><span class="badge badge-success">Activa</span></td>
                      <td>
                        <div style="display:flex;gap:0.4rem;">
                          <button class="btn-secondary btn-sm" (click)="openEditCanchaModal(c)">
                            <i class="fa-solid fa-pen-to-square"></i> Editar
                          </button>
                          <button class="btn-secondary btn-sm" style="color:#ef4444;" (click)="openDeleteCanchaModal(c)" title="Desactivar Cancha">
                            <i class="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeCanchasListModal()">Cerrar</button>
              <button class="btn-primary" (click)="openCreateCanchaModal()">
                <i class="fa-solid fa-plus"></i> Añadir Nueva Cancha
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL CREAR / EDITAR CANCHA -->
      @if (showCreateCanchaModal() || showEditCanchaModal()) {
        <div class="modal-overlay" (click)="closeCanchaFormModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-emerald">
                  <i class="fa-solid" [class.fa-plus]="!isEditingCancha" [class.fa-pen-to-square]="isEditingCancha"></i>
                </div>
                <div class="modal-title-text">
                  <h2>{{ isEditingCancha ? 'Editar Cancha / Escenario' : 'Nueva Cancha / Escenario' }}</h2>
                  <p class="modal-subtitle">Parametriza los valores por hora y características de la superficie</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeCanchaFormModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitCanchaForm()" class="modal-form">
              <div class="modal-section">
                <div class="form-row g2">
                  <div class="input-group">
                    <label>Nombre de la Cancha <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="canchaForm.nombre" name="cNombre" placeholder="ej. Cancha Sintética 8 Norte" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label>Tipo de Superficie <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="canchaForm.tipo_superficie" name="cSuperficie" class="sport-input" required>
                        @for (sup of tiposSuperficie(); track sup.codigo) {
                          <option [value]="sup.codigo">{{ sup.nombre }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label>Tarifa Hora Diurna ($ COP) <span class="required-star">*</span></label>
                    <div class="currency-input-wrap">
                      <span class="currency-prefix">$</span>
                      <input type="number" [(ngModel)]="canchaForm.precio_hora_diurna" name="cDiurna" min="0" class="sport-input" required />
                    </div>
                    <div class="currency-preview-badge">
                      <i class="fa-solid fa-sun"></i> {{ formatCurrency(canchaForm.precio_hora_diurna) }} / hora
                    </div>
                  </div>
                  <div class="input-group">
                    <label>Tarifa Hora Nocturna con Luz ($ COP) <span class="required-star">*</span></label>
                    <div class="currency-input-wrap">
                      <span class="currency-prefix">$</span>
                      <input type="number" [(ngModel)]="canchaForm.precio_hora_nocturna" name="cNocturna" min="0" class="sport-input" required />
                    </div>
                    <div class="currency-preview-badge">
                      <i class="fa-solid fa-moon"></i> {{ formatCurrency(canchaForm.precio_hora_nocturna) }} / hora
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeCanchaFormModal()">Cancelar</button>
                <button type="submit" class="btn-primary">{{ isEditingCancha ? 'Actualizar Cancha' : 'Guardar Cancha' }}</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL CONFIRMAR CANCELACIÓN DE RESERVA -->
      @if (showCancelConfirmModal() && slotToCancel()) {
        <div class="modal-overlay" (click)="closeCancelConfirmModal()">
          <div class="delete-confirm-modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header header-danger">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-danger-glow">
                  <i class="fa-solid fa-ban"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Cancelar Reserva de Turno</h2>
                  <p class="modal-subtitle">Liberación de franja horaria y anulación del turno</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeCancelConfirmModal()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="delete-confirm-body">
              <div class="player-retire-card">
                <div class="retire-avatar-wrap" style="display:flex;align-items:center;justify-content:center;background:rgba(239,68,68,0.1);">
                  <i class="fa-solid fa-futbol" style="font-size:1.5rem;color:#ef4444;"></i>
                </div>
                <div class="retire-player-details">
                  <div class="retire-name-row">
                    <span class="retire-player-name">{{ slotToCancel()?.estado_label || 'Turno Reservado' }}</span>
                  </div>
                  <div class="retire-meta-row">
                    <span class="meta-tag"><i class="fa-solid fa-clock"></i> {{ slotToCancel()?.hora_inicio }} - {{ slotToCancel()?.hora_fin }}</span>
                    <span class="meta-tag"><i class="fa-solid fa-dollar-sign"></i> Total: \${{ slotToCancel()?.monto_total | number }}</span>
                    @if (slotToCancel()?.monto_anticipo > 0) {
                      <span class="meta-tag"><i class="fa-solid fa-receipt"></i> Abono: \${{ slotToCancel()?.monto_anticipo | number }}</span>
                    }
                  </div>
                </div>
              </div>

              <div class="warning-callout">
                <i class="fa-solid fa-triangle-exclamation warning-callout-icon"></i>
                <div class="warning-callout-content">
                  <h4>Consecuencias de la Cancelación:</h4>
                  <ul>
                    <li>El turno pasará de inmediato a estado <strong>Disponible</strong> en la cuadrícula.</li>
                    <li>Cualquier abono o seña registrada deberá ser gestionada o transferida en caja.</li>
                    <li>Esta acción se registrará en la auditoría del sistema de reservas.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeCancelConfirmModal()">
                <i class="fa-solid fa-arrow-left"></i> Conservar Turno
              </button>
              <button type="button" class="btn-confirm-delete" (click)="confirmarCancelarReserva()">
                <i class="fa-solid fa-ban"></i> Sí, Cancelar Turno
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL CONFIRMAR ELIMINACIÓN DE CANCHA -->
      @if (showDeleteCanchaModal() && canchaToDelete()) {
        <div class="modal-overlay" (click)="closeDeleteCanchaModal()">
          <div class="delete-confirm-modal-card" (click)="$event.stopPropagation()">
            <div class="delete-confirm-header">
              <div class="delete-confirm-icon-wrap">
                <i class="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div class="delete-confirm-title-wrap">
                <h3>¿Desactivar Escenario Deportivo?</h3>
                <p>Estás a punto de deshabilitar esta cancha del catálogo de alquileres</p>
              </div>
              <button class="btn-close" (click)="closeDeleteCanchaModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="delete-confirm-body">
              <div class="player-retire-preview">
                <div class="cancha-type-tag" style="background:rgba(16,185,129,0.12);color:#10b981;padding:0.75rem;border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
                  <i class="fa-solid fa-futbol" style="font-size:1.5rem;"></i>
                </div>
                <div class="player-retire-info">
                  <span class="retire-player-name">{{ canchaToDelete()?.nombre }}</span>
                  <div class="retire-player-tags">
                    <span class="meta-tag"><i class="fa-solid fa-layer-group"></i> {{ formatSuperficie(canchaToDelete()?.tipo_superficie) }}</span>
                    <span class="meta-tag"><i class="fa-regular fa-clock"></i> {{ canchaToDelete()?.hora_apertura }} - {{ canchaToDelete()?.hora_cierre }}</span>
                    <span class="meta-tag"><i class="fa-solid fa-tag"></i> Diurna: \${{ canchaToDelete()?.precio_hora_diurna | number }}</span>
                  </div>
                </div>
              </div>

              <div class="warning-callout">
                <i class="fa-solid fa-triangle-exclamation warning-callout-icon"></i>
                <div class="warning-callout-content">
                  <h4>Consecuencias de la Operación:</h4>
                  <ul>
                    <li>La cancha no aparecerá disponible para nuevos turnos ni reservas públicas.</li>
                    <li>Las reservas pasadas y facturación histórica se mantendrán intactas en auditoría.</li>
                    <li>Podrás reactivar este escenario en cualquier momento modificando su estado.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeDeleteCanchaModal()">
                <i class="fa-solid fa-arrow-left"></i> Conservar Cancha
              </button>
              <button type="button" class="btn-confirm-delete" (click)="confirmDeleteCancha()">
                <i class="fa-solid fa-trash-can"></i> Sí, Desactivar Cancha
              </button>
            </div>
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
    .canchas-page {
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

    .date-picker-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-md);

      .date-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .date-input {
        border: none;
        background: transparent;
        padding: 0.35rem 0;
        font-weight: 700;
        color: var(--text-main);
        outline: none;
      }
    }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .kpi-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;

      .kpi-icon-wrap {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }

      .bg-emerald-glow { background: rgba(16, 185, 129, 0.15); color: #10b981; }
      .bg-blue-glow { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
      .bg-amber-glow { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
      .bg-purple-glow { background: rgba(168, 85, 247, 0.15); color: #a855f7; }

      .kpi-val {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--text-heading);
      }

      .kpi-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 600;
      }
    }

    .matriz-container {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .matriz-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;

      .matriz-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-heading);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        i { color: var(--color-primary); }
      }

      .legend-wrap {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;

        .legend-item {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-body);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-disponible { background: #10b981; }
        .dot-club { background: #3b82f6; }
        .dot-alquiler { background: #f59e0b; }
        .dot-mantenimiento { background: #ef4444; }
      }
    }

    .grid-table-scroll {
      overflow-x: auto;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }

    .matriz-table {
      width: 100%;
      border-collapse: collapse;

      th, td {
        padding: 0.85rem;
        border: 1px solid var(--border-color);
        vertical-align: top;
      }

      th {
        background: var(--bg-hover);
      }

      .th-hora {
        width: 130px;
        min-width: 130px;
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .th-cancha {
        min-width: 220px;

        .cancha-title-th {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;
          strong { font-size: 0.9rem; color: var(--text-heading); }
        }

        .badge-surface {
          background: rgba(59, 130, 246, 0.12);
          color: #3b82f6;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .cancha-prices-th {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-muted);
        }
      }

      .td-hora {
        background: var(--bg-card);
        font-size: 0.85rem;
        color: var(--text-main);

        .luz-tag {
          display: block;
          font-size: 0.65rem;
          color: #f59e0b;
          font-weight: 700;
          margin-top: 0.25rem;
        }
      }

      .td-slot {
        background: var(--bg-card);
      }
    }

    .slot-card {
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .slot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .slot-badge {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .slot-price {
          font-size: 0.75rem;
          font-weight: 800;
        }
      }

      .slot-main-text {
        font-size: 0.8rem;
        font-weight: 700;
      }

      .slot-footer-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.25rem;

        .badge-pago {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }

        .pago-completo { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .pago-parcial { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }

        .btn-xs-pay {
          background: #10b981;
          color: #fff;
          border: none;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-xs-cancel {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #ef4444;
            color: #fff;
          }
        }
      }
    }

    .slot-disponible {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
    }

    .slot-club {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #3b82f6;
    }

    .slot-alquiler {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f59e0b;
    }

    .slot-mantenimiento {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }

    .pago-details-card {
      background: var(--bg-hover);
      border-radius: var(--radius-md);
      padding: 1rem;
      margin-bottom: 1rem;

      .pago-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        margin-bottom: 0.35rem;
      }

      .total-highlight {
        border-top: 1px solid var(--border-color);
        padding-top: 0.5rem;
        margin-top: 0.5rem;
        font-size: 1rem;
        font-weight: 800;
        color: var(--color-primary);
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
export class CanchasComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  readonly tiposSuperficie = this.catalogos.tiposSuperficie;
  readonly selectedFecha = signal<string>(new Date().toISOString().split('T')[0]);
  readonly canchasList = signal<any[]>([]);
  readonly disponibilidadData = signal<any | null>(null);

  readonly showReservaModal = signal<boolean>(false);
  readonly showPagoModal = signal<boolean>(false);
  readonly showCanchasListModal = signal<boolean>(false);
  readonly showCreateCanchaModal = signal<boolean>(false);
  readonly showEditCanchaModal = signal<boolean>(false);
  readonly showCancelConfirmModal = signal<boolean>(false);
  readonly showDeleteCanchaModal = signal<boolean>(false);
  readonly selectedSlotForPay = signal<any | null>(null);
  readonly slotToCancel = signal<any | null>(null);
  readonly canchaToDelete = signal<any | null>(null);
  readonly toastMessage = signal<string>('');

  isEditingCancha: boolean = false;
  editingCanchaId: string | null = null;

  pagoCajaMonto: number = 0;
  pagoCajaMetodo: string = 'EFECTIVO_CAJA';

  readonly horasSlots = [
    { inicio: '06:00', fin: '07:00', esNocturno: false },
    { inicio: '07:00', fin: '08:00', esNocturno: false },
    { inicio: '08:00', fin: '09:00', esNocturno: false },
    { inicio: '09:00', fin: '10:00', esNocturno: false },
    { inicio: '10:00', fin: '11:00', esNocturno: false },
    { inicio: '11:00', fin: '12:00', esNocturno: false },
    { inicio: '12:00', fin: '13:00', esNocturno: false },
    { inicio: '13:00', fin: '14:00', esNocturno: false },
    { inicio: '14:00', fin: '15:00', esNocturno: false },
    { inicio: '15:00', fin: '16:00', esNocturno: false },
    { inicio: '16:00', fin: '17:00', esNocturno: false },
    { inicio: '17:00', fin: '18:00', esNocturno: false },
    { inicio: '18:00', fin: '19:00', esNocturno: true },
    { inicio: '19:00', fin: '20:00', esNocturno: true },
    { inicio: '20:00', fin: '21:00', esNocturno: true },
    { inicio: '21:00', fin: '22:00', esNocturno: true },
    { inicio: '22:00', fin: '23:00', esNocturno: true },
  ];

  reservaForm = {
    cancha_id: '',
    fecha_reserva: new Date().toISOString().split('T')[0],
    hora_inicio: '18:00',
    hora_fin: '19:00',
    tipo_reserva: 'alquiler_particular',
    cliente_nombre: '',
    cliente_telefono: '',
    monto_anticipo: 0,
    metodo_pago: 'WOMPI_PSE',
  };

  canchaForm = {
    nombre: '',
    tipo_superficie: 'sintetica_f8',
    precio_hora_diurna: 80000,
    precio_hora_nocturna: 120000,
    hora_apertura: '06:00',
    hora_cierre: '23:00',
  };

  ngOnInit(): void {
    this.loadCanchas();
    this.loadDisponibilidad();
  }

  loadCanchas(): void {
    this.api.getCanchas().subscribe((data) => {
      const canchas = Array.isArray(data) ? data : (data?.data || []);
      this.canchasList.set(canchas);
      if (canchas && canchas.length > 0 && !this.reservaForm.cancha_id) {
        this.reservaForm.cancha_id = canchas[0].id;
      }
    });
  }

  loadDisponibilidad(): void {
    this.api.getDisponibilidadCanchas(this.selectedFecha()).subscribe((res) => {
      this.disponibilidadData.set(res);
    });
  }

  onFechaChange(nuevaFecha: string): void {
    this.selectedFecha.set(nuevaFecha);
    this.reservaForm.fecha_reserva = nuevaFecha;
    this.loadDisponibilidad();
  }

  getSlotForCancha(cancha: any, horaInicio: string): any {
    return cancha.slots?.find((s: any) => s.hora_inicio === horaInicio);
  }

  getSlotBadgeText(estado: string): string {
    switch (estado) {
      case 'disponible': return 'Libre';
      case 'bloqueado_club': return 'Club';
      case 'ocupado_particular': return 'Alquiler';
      case 'mantenimiento': return 'Cerrado';
      default: return estado;
    }
  }

  formatSuperficie(sup: string): string {
    switch (sup) {
      case 'sintetica_f5': return 'Sintética F5';
      case 'sintetica_f8': return 'Sintética F8';
      case 'natural_f11': return 'Grama Natural F11';
      case 'futsal_madera': return 'Futsal Madera';
      default: return sup || 'Cancha';
    }
  }

  formatCurrency(val: any): string {
    if (val === null || val === undefined || val === '') return '$ 0';
    const num = Number(val);
    if (isNaN(num)) return '$ 0';
    return '$ ' + Math.round(num).toLocaleString('es-CO');
  }

  onSlotClick(cancha: any, slot: any): void {
    if (slot.estado === 'disponible') {
      this.reservaForm.cancha_id = cancha.id;
      this.reservaForm.fecha_reserva = this.selectedFecha();
      this.reservaForm.hora_inicio = slot.hora_inicio;
      this.reservaForm.hora_fin = slot.hora_fin;
      this.reservaForm.monto_anticipo = slot.tarifa / 2;
      this.showReservaModal.set(true);
    }
  }

  openNuevaReservaModal(): void {
    this.showReservaModal.set(true);
  }

  closeReservaModal(): void {
    this.showReservaModal.set(false);
  }

  submitReserva(): void {
    if (!this.reservaForm.cancha_id || !this.reservaForm.fecha_reserva) {
      this.showToast('Por favor selecciona la cancha y fecha de reserva', true);
      return;
    }
    if (!this.reservaForm.cliente_nombre) {
      this.showToast('Ingresa el nombre del cliente para la reserva', true);
      return;
    }
    if (this.reservaForm.monto_anticipo < 0) {
      this.showToast('El monto de anticipo no puede ser negativo', true);
      return;
    }

    this.api.createReservaCancha(this.reservaForm).subscribe({
      next: () => {
        this.showToast('¡Turno reservado exitosamente!');
        this.closeReservaModal();
        this.loadDisponibilidad();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al reservar cancha (Verifica conflictos)';
        this.showToast(msg);
      }
    });
  }

  cancelarReserva(slot: any, event: Event): void {
    event.stopPropagation();
    if (!slot || !slot.reserva_id) return;
    this.slotToCancel.set(slot);
    this.showCancelConfirmModal.set(true);
  }

  closeCancelConfirmModal(): void {
    this.showCancelConfirmModal.set(false);
    this.slotToCancel.set(null);
  }

  confirmarCancelarReserva(): void {
    const slot = this.slotToCancel();
    if (!slot || !slot.reserva_id) return;

    this.api.cancelarReservaCancha(slot.reserva_id).subscribe({
      next: () => {
        this.showToast('Reserva cancelada y turno liberado exitosamente.');
        this.closeCancelConfirmModal();
        this.loadDisponibilidad();
      },
      error: () => {
        this.showToast('Error al cancelar reserva.');
      }
    });
  }

  openPagoCajaModal(slot: any, event: Event): void {
    event.stopPropagation();
    this.selectedSlotForPay.set(slot);
    this.pagoCajaMonto = (slot.monto_total || 0) - (slot.monto_anticipo || 0);
    this.showPagoModal.set(true);
  }

  closePagoModal(): void {
    this.showPagoModal.set(false);
    this.selectedSlotForPay.set(null);
  }

  submitPagoCaja(): void {
    const slot = this.selectedSlotForPay();
    if (!slot || !slot.reserva_id) return;

    this.api.pagarReservaCaja(slot.reserva_id, this.pagoCajaMonto, this.pagoCajaMetodo).subscribe({
      next: () => {
        this.showToast('¡Pago registrado y turno liquidado con éxito!');
        this.closePagoModal();
        this.loadDisponibilidad();
      },
      error: () => {
        this.showToast('Error al registrar pago en caja');
      }
    });
  }

  openCanchasListModal(): void {
    this.showCanchasListModal.set(true);
  }

  closeCanchasListModal(): void {
    this.showCanchasListModal.set(false);
  }

  openCreateCanchaModal(): void {
    this.isEditingCancha = false;
    this.editingCanchaId = null;
    this.canchaForm = {
      nombre: '',
      tipo_superficie: 'sintetica_f8',
      precio_hora_diurna: 80000,
      precio_hora_nocturna: 120000,
      hora_apertura: '06:00',
      hora_cierre: '23:00',
    };
    this.showCreateCanchaModal.set(true);
    this.showEditCanchaModal.set(false);
  }

  openEditCanchaModal(cancha: any): void {
    this.isEditingCancha = true;
    this.editingCanchaId = cancha.id;
    this.canchaForm = {
      nombre: cancha.nombre,
      tipo_superficie: cancha.tipo_superficie || 'sintetica_f8',
      precio_hora_diurna: Number(cancha.precio_hora_diurna) || 80000,
      precio_hora_nocturna: Number(cancha.precio_hora_nocturna) || 120000,
      hora_apertura: cancha.hora_apertura || '06:00',
      hora_cierre: cancha.hora_cierre || '23:00',
    };
    this.showEditCanchaModal.set(true);
    this.showCreateCanchaModal.set(false);
  }

  closeCanchaFormModal(): void {
    this.showCreateCanchaModal.set(false);
    this.showEditCanchaModal.set(false);
    this.isEditingCancha = false;
    this.editingCanchaId = null;
  }

  submitCanchaForm(): void {
    if (!this.canchaForm.nombre) {
      this.showToast('Ingresa el nombre del escenario');
      return;
    }

    if (this.isEditingCancha && this.editingCanchaId) {
      this.api.updateCancha(this.editingCanchaId, this.canchaForm).subscribe({
        next: () => {
          this.showToast('¡Cancha deportiva actualizada exitosamente!');
          this.closeCanchaFormModal();
          this.loadCanchas();
          this.loadDisponibilidad();
        },
        error: () => {
          this.showToast('Error al actualizar cancha');
        }
      });
    } else {
      this.api.createCancha(this.canchaForm).subscribe({
        next: () => {
          this.showToast('¡Cancha deportiva registrada exitosamente!');
          this.closeCanchaFormModal();
          this.loadCanchas();
          this.loadDisponibilidad();
        },
        error: () => {
          this.showToast('Error al crear cancha');
        }
      });
    }
  }

  openDeleteCanchaModal(cancha: any): void {
    this.canchaToDelete.set(cancha);
    this.showDeleteCanchaModal.set(true);
  }

  closeDeleteCanchaModal(): void {
    this.showDeleteCanchaModal.set(false);
    this.canchaToDelete.set(null);
  }

  confirmDeleteCancha(): void {
    const cancha = this.canchaToDelete();
    if (!cancha || !cancha.id) return;

    this.api.deleteCancha(cancha.id).subscribe({
      next: () => {
        this.showToast(`Cancha "${cancha.nombre}" desactivada exitosamente.`);
        this.closeDeleteCanchaModal();
        this.loadCanchas();
        this.loadDisponibilidad();
      },
      error: () => {
        this.showToast('Error al desactivar cancha');
      }
    });
  }

  private showToast(msg: string, isError: boolean = false): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
