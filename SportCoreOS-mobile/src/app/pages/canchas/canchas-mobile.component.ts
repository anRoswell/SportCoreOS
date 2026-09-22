import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface CanchaSede {
  id: string;
  nombre: string;
  tipo: 'Fútbol 11' | 'Fútbol 8' | 'Fútbol 5';
  superficie: 'Sintética Pro' | 'Césped Natural' | 'Coliseo Duela';
  precioHora: number;
  imagen: string;
  iluminacion: boolean;
  sede: string;
  horariosDisponibles: string[];
}

export interface ReservaActiva {
  id: string;
  canchaNombre: string;
  sede: string;
  fecha: string;
  hora: string;
  duracion: number;
  total: number;
  estado: 'CONFIRMADA' | 'PENDIENTE_PAGO';
  codigoAcceso: string;
}

@Component({
  selector: 'app-canchas-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="canchas-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Alquiler de Canchas</h2>
      </div>
      <button class="btn-mis-reservas" (click)="abrirMisReservas()">
        <i class="fa-solid fa-calendar-check"></i>
        @if (misReservas().length > 0) {
          <span class="badge-count">{{ misReservas().length }}</span>
        }
      </button>
    </div>

    <main class="canchas-container">
      <!-- Selector de Sede & Filtro -->
      <section class="filter-card">
        <div class="filter-header">
          <i class="fa-solid fa-location-dot text-success"></i>
          <span>Sede Principal: <strong>Complejo Deportivo El Prado</strong></span>
        </div>
        
        <div class="type-chips">
          <button 
            class="chip" 
            [class.active]="filtroTipo() === 'todos'"
            (click)="filtroTipo.set('todos')">
            Todas ({{ canchas().length }})
          </button>
          <button 
            class="chip" 
            [class.active]="filtroTipo() === 'Fútbol 11'"
            (click)="filtroTipo.set('Fútbol 11')">
            Fútbol 11
          </button>
          <button 
            class="chip" 
            [class.active]="filtroTipo() === 'Fútbol 8'"
            (click)="filtroTipo.set('Fútbol 8')">
            Fútbol 8
          </button>
          <button 
            class="chip" 
            [class.active]="filtroTipo() === 'Fútbol 5'"
            (click)="filtroTipo.set('Fútbol 5')">
            Fútbol 5
          </button>
        </div>
      </section>

      <!-- Selector de Fecha de Reserva -->
      <section class="date-selector">
        <label><i class="fa-solid fa-calendar-day"></i> Selecciona la Fecha:</label>
        <div class="days-scroll">
          @for (dia of proximosDias; track dia.fechaStr) {
            <button 
              class="day-card" 
              [class.active]="fechaSeleccionada() === dia.fechaStr"
              (click)="fechaSeleccionada.set(dia.fechaStr)">
              <span class="day-name">{{ dia.nombreDia }}</span>
              <span class="day-num">{{ dia.numDia }}</span>
              <span class="day-month">{{ dia.mes }}</span>
            </button>
          }
        </div>
      </section>

      <!-- Grid de Canchas Disponibles -->
      <div class="canchas-list">
        @for (cancha of canchasFiltradas(); track cancha.id) {
          <div class="cancha-card">
            <div class="cancha-image-wrap">
              <img [src]="cancha.imagen" [alt]="cancha.nombre" loading="lazy" />
              <div class="card-tags">
                <span class="tag-type">{{ cancha.tipo }}</span>
                <span class="tag-surface">{{ cancha.superficie }}</span>
              </div>
              <div class="price-pill">
                \${{ cancha.precioHora | number }} <small>/ hora</small>
              </div>
            </div>

            <div class="cancha-details">
              <div class="title-row">
                <h3>{{ cancha.nombre }}</h3>
                @if (cancha.iluminacion) {
                  <span class="tag-light" title="Iluminación LED Profesional">
                    <i class="fa-solid fa-lightbulb"></i> LED
                  </span>
                }
              </div>
              <p class="sede-text"><i class="fa-solid fa-map-pin"></i> {{ cancha.sede }}</p>

              <!-- Horarios Disponibles -->
              <div class="slots-section">
                <label>Horarios Disponibles:</label>
                <div class="slots-grid">
                  @for (hora of cancha.horariosDisponibles; track hora) {
                    <button 
                      class="slot-btn"
                      (click)="seleccionarHorario(cancha, hora)">
                      <i class="fa-regular fa-clock"></i> {{ hora }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </main>

    <!-- Modal de Reserva & Checkout -->
    @if (reservaModal()) {
      <div class="modal-backdrop" (click)="reservaModal.set(null)">
        <div class="modal-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3>Confirmar Alquiler de Cancha</h3>
            <button class="btn-close" (click)="reservaModal.set(null)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="sheet-body">
            <div class="booking-summary-card">
              <div class="summary-top">
                <h4>{{ reservaModal()!.cancha.nombre }}</h4>
                <span class="booking-type">{{ reservaModal()!.cancha.tipo }}</span>
              </div>
              
              <div class="booking-details-grid">
                <div class="detail-item">
                  <span class="lbl">FECHA</span>
                  <span class="val">{{ fechaSeleccionada() }}</span>
                </div>
                <div class="detail-item">
                  <span class="lbl">HORARIO</span>
                  <span class="val text-success">{{ reservaModal()!.hora }}</span>
                </div>
                <div class="detail-item">
                  <span class="lbl">DURACIÓN</span>
                  <span class="val">60 Minutos</span>
                </div>
                <div class="detail-item">
                  <span class="lbl">SEDE</span>
                  <span class="val">{{ reservaModal()!.cancha.sede }}</span>
                </div>
              </div>
            </div>

            <!-- Métodos de Pago Disponibles -->
            <div class="payment-selection">
              <label>Selecciona tu Método de Pago:</label>
              
              <div class="methods-list">
                <label class="method-option" [class.selected]="metodoPago() === 'PSE'">
                  <input type="radio" name="metodo" value="PSE" [(ngModel)]="metodoPago" />
                  <div class="method-info">
                    <i class="fa-solid fa-building-columns text-primary"></i>
                    <div>
                      <strong>PSE / Débito Bancario</strong>
                      <p>Transferencia instantánea desde cualquier banco</p>
                    </div>
                  </div>
                </label>

                <label class="method-option" [class.selected]="metodoPago() === 'NEQUI'">
                  <input type="radio" name="metodo" value="NEQUI" [(ngModel)]="metodoPago" />
                  <div class="method-info">
                    <i class="fa-solid fa-mobile-screen-button text-info"></i>
                    <div>
                      <strong>Nequi / Daviplata</strong>
                      <p>Aprobación directa con notificación push</p>
                    </div>
                  </div>
                </label>

                <label class="method-option" [class.selected]="metodoPago() === 'SEDE'">
                  <input type="radio" name="metodo" value="SEDE" [(ngModel)]="metodoPago" />
                  <div class="method-info">
                    <i class="fa-solid fa-money-bill-wave text-success"></i>
                    <div>
                      <strong>Pagar en Portería de Sede</strong>
                      <p>Efectivo o datáfono antes de iniciar tu partido</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div class="price-breakdown">
              <div class="breakdown-row">
                <span>Alquiler Cancha (1 Hora)</span>
                <span>\${{ reservaModal()!.cancha.precioHora | number }}</span>
              </div>
              <div class="breakdown-row">
                <span>Iluminación Nocturna & Petos</span>
                <span class="text-success">INCLUIDO</span>
              </div>
              <div class="breakdown-total">
                <span>Total a Pagar:</span>
                <span class="total-amount">\${{ reservaModal()!.cancha.precioHora | number }}</span>
              </div>
            </div>
          </div>

          <div class="sheet-footer">
            <button class="btn-confirm-booking" (click)="confirmarReserva()">
              <i class="fa-solid fa-lock"></i> Confirmar & Reservar Ahora
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Drawer de Mis Reservas Activas -->
    @if (mostrarMisReservas()) {
      <div class="modal-backdrop" (click)="mostrarMisReservas.set(false)">
        <div class="modal-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3>Mis Reservas Activas ({{ misReservas().length }})</h3>
            <button class="btn-close" (click)="mostrarMisReservas.set(false)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="sheet-body">
            @for (res of misReservas(); track res.id) {
              <div class="my-booking-card">
                <div class="my-booking-top">
                  <span class="badge-status-confirmed"><i class="fa-solid fa-circle-check"></i> {{ res.estado }}</span>
                  <span class="code-access">CÓDIGO: <strong>{{ res.codigoAcceso }}</strong></span>
                </div>
                <h4>{{ res.canchaNombre }}</h4>
                <p class="booking-meta">
                  <i class="fa-solid fa-calendar"></i> {{ res.fecha }} &bull; <i class="fa-solid fa-clock"></i> {{ res.hora }}
                </p>
                <p class="booking-sede"><i class="fa-solid fa-map-location-dot"></i> {{ res.sede }}</p>
                
                <div class="my-booking-actions">
                  <button class="btn-cancel" (click)="cancelarReserva(res.id)">Cancelar</button>
                  <a [href]="'https://www.google.com/maps/search/?api=1&query=' + res.sede" target="_blank" class="btn-maps">
                    <i class="fa-solid fa-diamond-turn-right"></i> Cómo llegar
                  </a>
                </div>
              </div>
            } @empty {
              <div class="empty-reservas">
                <i class="fa-solid fa-calendar-xmark"></i>
                <p>No tienes reservas activas por el momento.</p>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Pantalla de Éxito -->
    @if (reservaExitosa()) {
      <div class="modal-backdrop">
        <div class="success-card">
          <div class="icon-success-pulse">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3>¡Cancha Reservada!</h3>
          <p>Tu código de acceso en portería es <strong>#{{ codigoGenerado }}</strong></p>
          <div class="order-tips">
            <i class="fa-solid fa-futbol"></i> Preséntate 10 minutos antes en la sede con tu calzado adecuado.
          </div>
          <button class="btn-confirm-booking" (click)="reservaExitosa.set(false)">
            Ver en Mis Reservas
          </button>
        </div>
      </div>
    }

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .canchas-subbar {
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

      .btn-mis-reservas {
        position: relative;
        background: #f1f5f9;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        color: #0f172a;
        font-size: 1.05rem;
        cursor: pointer;

        .badge-count {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #10b981;
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
    }

    .canchas-container {
      padding: 1rem;
      padding-bottom: calc(75px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .filter-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      padding: 0.85rem;
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .filter-header {
        font-size: 0.8rem;
        color: #475569;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .type-chips {
        display: flex;
        gap: 0.4rem;
        overflow-x: auto;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }

        .chip {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.4rem 0.85rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          white-space: nowrap;
          cursor: pointer;

          &.active {
            background: #047857;
            color: #fff;
            border-color: #047857;
          }
        }
      }
    }

    .date-selector {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-size: 0.8rem;
        font-weight: 700;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .days-scroll {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        padding-bottom: 0.25rem;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }

        .day-card {
          min-width: 65px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.65rem 0.4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
          cursor: pointer;
          transition: all 0.2s ease;

          .day-name { font-size: 0.65rem; font-weight: 700; color: #64748b; }
          .day-num { font-size: 1.15rem; font-weight: 800; color: #0f172a; }
          .day-month { font-size: 0.65rem; color: #94a3b8; }

          &.active {
            background: #0f172a;
            border-color: #0f172a;
            color: #fff;

            .day-name, .day-num, .day-month { color: #fff; }
          }
        }
      }
    }

    .canchas-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cancha-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 1.25rem;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

      .cancha-image-wrap {
        position: relative;
        width: 100%;
        height: 160px;

        img { width: 100%; height: 100%; object-fit: cover; }

        .card-tags {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          gap: 0.35rem;

          span {
            font-size: 0.65rem;
            font-weight: 800;
            padding: 0.25rem 0.55rem;
            border-radius: 6px;
            color: #fff;
          }

          .tag-type { background: rgba(15, 23, 42, 0.85); }
          .tag-surface { background: rgba(4, 120, 87, 0.9); }
        }

        .price-pill {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(4px);
          color: #fff;
          padding: 0.35rem 0.65rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 800;

          small { font-size: 0.68rem; opacity: 0.8; }
        }
      }

      .cancha-details {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;

        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          h3 { font-size: 1.05rem; font-weight: 800; margin: 0; color: #0f172a; }
          .tag-light {
            background: #fef3c7;
            color: #b45309;
            font-size: 0.65rem;
            font-weight: 800;
            padding: 0.2rem 0.45rem;
            border-radius: 6px;
          }
        }

        .sede-text {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        .slots-section {
          margin-top: 0.35rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;

          label { font-size: 0.75rem; font-weight: 700; color: #334155; }

          .slots-grid {
            display: flex;
            gap: 0.4rem;
            flex-wrap: wrap;

            .slot-btn {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              padding: 0.45rem 0.75rem;
              border-radius: 8px;
              font-size: 0.78rem;
              font-weight: 700;
              color: #1e293b;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.35rem;
              transition: all 0.2s ease;

              &:hover {
                background: #047857;
                color: #fff;
                border-color: #047857;
              }
            }
          }
        }
      }
    }

    /* Modals & Checkout */
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

    .modal-sheet {
      background: #fff;
      width: 100%;
      max-width: 480px;
      border-radius: 1.5rem 1.5rem 0 0;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sheet-header {
      padding: 1.15rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;

      h3 { font-size: 1.05rem; font-weight: 800; margin: 0; color: #0f172a; }
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

    .sheet-body {
      padding: 1.25rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .booking-summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;

      .summary-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.65rem;

        h4 { font-size: 1rem; font-weight: 800; margin: 0; color: #0f172a; }
        .booking-type {
          background: #0f172a;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
      }

      .booking-details-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;

          .lbl { font-size: 0.62rem; font-weight: 800; color: #64748b; }
          .val { font-size: 0.82rem; font-weight: 700; color: #0f172a; }
        }
      }
    }

    .payment-selection {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;

      label { font-size: 0.8rem; font-weight: 700; color: #1e293b; }

      .methods-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .method-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.75rem;
          cursor: pointer;

          &.selected {
            border-color: #047857;
            background: #f0fdf4;
          }

          .method-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            i { font-size: 1.3rem; }

            strong { font-size: 0.85rem; color: #0f172a; display: block; }
            p { font-size: 0.72rem; color: #64748b; margin: 0; }
          }
        }
      }
    }

    .price-breakdown {
      background: #f8fafc;
      padding: 0.85rem;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .breakdown-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #64748b;
      }

      .breakdown-total {
        display: flex;
        justify-content: space-between;
        border-top: 1px dashed #cbd5e1;
        padding-top: 0.5rem;
        margin-top: 0.35rem;
        font-size: 1rem;
        font-weight: 800;
        color: #0f172a;

        .total-amount { color: #047857; }
      }
    }

    .sheet-footer {
      padding: 1rem 1.25rem calc(1rem + var(--safe-area-bottom));
      border-top: 1px solid #f1f5f9;
    }

    .btn-confirm-booking {
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

    /* Mis Reservas */
    .my-booking-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      .my-booking-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .badge-status-confirmed {
          background: #dcfce7;
          color: #15803d;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 20px;
        }

        .code-access {
          font-size: 0.72rem;
          color: #64748b;
          strong { color: #0f172a; }
        }
      }

      h4 { font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0.2rem 0 0 0; }
      .booking-meta { font-size: 0.78rem; font-weight: 600; color: #334155; margin: 0; }
      .booking-sede { font-size: 0.72rem; color: #64748b; margin: 0; }

      .my-booking-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;

        .btn-cancel {
          flex: 1;
          background: #fee2e2;
          color: #b91c1c;
          border: none;
          padding: 0.45rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-maps {
          flex: 1;
          background: #0f172a;
          color: #fff;
          text-decoration: none;
          padding: 0.45rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }
      }
    }

    .empty-reservas {
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

      .icon-success-pulse { font-size: 3.5rem; color: #10b981; }
      h3 { font-size: 1.25rem; font-weight: 800; margin: 0; color: #0f172a; }
      p { font-size: 0.85rem; color: #64748b; margin: 0; }

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

    .text-success { color: #059669; }
    .text-primary { color: #2563eb; }
    .text-info { color: #0284c7; }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `]
})
export class CanchasMobileComponent {
  auth = inject(AuthService);

  filtroTipo = signal<string>('todos');
  fechaSeleccionada = signal<string>('2026-09-23');
  metodoPago = signal<string>('PSE');

  reservaModal = signal<{ cancha: CanchaSede; hora: string } | null>(null);
  mostrarMisReservas = signal<boolean>(false);
  reservaExitosa = signal<boolean>(false);
  codigoGenerado = '';

  proximosDias = [
    { fechaStr: '2026-09-23', nombreDia: 'MIE', numDia: '23', mes: 'SEP' },
    { fechaStr: '2026-09-24', nombreDia: 'JUE', numDia: '24', mes: 'SEP' },
    { fechaStr: '2026-09-25', nombreDia: 'VIE', numDia: '25', mes: 'SEP' },
    { fechaStr: '2026-09-26', nombreDia: 'SAB', numDia: '26', mes: 'SEP' },
    { fechaStr: '2026-09-27', nombreDia: 'DOM', numDia: '27', mes: 'SEP' }
  ];

  canchas = signal<CanchaSede[]>([
    {
      id: 'c1',
      nombre: 'Cancha Estadio El Prado (F11)',
      tipo: 'Fútbol 11',
      superficie: 'Césped Natural',
      precioHora: 190000,
      imagen: 'https://images.unsplash.com/photo-1529900245534-47fbfb57836a?w=600&auto=format&fit=crop&q=80',
      iluminacion: true,
      sede: 'Sede Principal - Campo A',
      horariosDisponibles: ['06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM']
    },
    {
      id: 'c2',
      nombre: 'Cancha Sintética Champions (F8)',
      tipo: 'Fútbol 8',
      superficie: 'Sintética Pro',
      precioHora: 140000,
      imagen: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&auto=format&fit=crop&q=80',
      iluminacion: true,
      sede: 'Sede Principal - Campo B',
      horariosDisponibles: ['05:00 PM', '06:00 PM', '07:00 PM', '09:00 PM']
    },
    {
      id: 'c3',
      nombre: 'Cancha Sintética Maracaná (F5)',
      tipo: 'Fútbol 5',
      superficie: 'Sintética Pro',
      precioHora: 95000,
      imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
      iluminacion: true,
      sede: 'Sede Norte - Cancha 1',
      horariosDisponibles: ['04:00 PM', '05:00 PM', '08:00 PM', '10:00 PM']
    },
    {
      id: 'c4',
      nombre: 'Coliseo Cubierto Futsal',
      tipo: 'Fútbol 5',
      superficie: 'Coliseo Duela',
      precioHora: 85000,
      imagen: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600&auto=format&fit=crop&q=80',
      iluminacion: true,
      sede: 'Sede Principal - Coliseo',
      horariosDisponibles: ['03:00 PM', '04:00 PM', '06:00 PM', '07:00 PM']
    }
  ]);

  misReservas = signal<ReservaActiva[]>([
    {
      id: 'r-101',
      canchaNombre: 'Cancha Sintética Champions (F8)',
      sede: 'Sede Principal - Campo B',
      fecha: '2026-09-24',
      hora: '07:00 PM',
      duracion: 60,
      total: 140000,
      estado: 'CONFIRMADA',
      codigoAcceso: 'RES-8491'
    }
  ]);

  canchasFiltradas = computed(() => {
    const f = this.filtroTipo();
    if (f === 'todos') return this.canchas();
    return this.canchas().filter(c => c.tipo === f);
  });

  seleccionarHorario(cancha: CanchaSede, hora: string) {
    this.reservaModal.set({ cancha, hora });
  }

  abrirMisReservas() {
    this.mostrarMisReservas.set(true);
  }

  confirmarReserva() {
    const r = this.reservaModal();
    if (!r) return;

    this.codigoGenerado = 'RES-' + Math.floor(1000 + Math.random() * 9000);

    const nuevaReserva: ReservaActiva = {
      id: 'r-' + Date.now(),
      canchaNombre: r.cancha.nombre,
      sede: r.cancha.sede,
      fecha: this.fechaSeleccionada(),
      hora: r.hora,
      duracion: 60,
      total: r.cancha.precioHora,
      estado: 'CONFIRMADA',
      codigoAcceso: this.codigoGenerado
    };

    this.misReservas.set([nuevaReserva, ...this.misReservas()]);
    this.reservaModal.set(null);
    this.reservaExitosa.set(true);
  }

  cancelarReserva(id: string) {
    if (confirm('¿Deseas cancelar esta reserva de cancha?')) {
      this.misReservas.set(this.misReservas().filter(r => r.id !== id));
    }
  }
}
