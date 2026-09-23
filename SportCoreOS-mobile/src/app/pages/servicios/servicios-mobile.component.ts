import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

export interface ServicioMobile {
  id: string;
  titulo: string;
  subtitulo: string;
  categoria_servicio: string;
  icono?: string;
  color_tema?: string;
  entrenador_nombre: string;
  entrenador_avatar?: string;
  entrenador_badge?: string;
  cancha_nombre: string;
  cancha_direccion: string;
  cancha_gps_url?: string;
  dias_semana: string;
  horario_rango: string;
  duracion_minutos?: number;
  edad_min?: number;
  edad_max?: number;
  cupos_totales: number;
  cupos_ocupados: number;
  precio_sesion_individual: number | string;
  precio_paquete_mensual: number | string;
  descuento_hermanos_pct?: number;
  insignia_obtenida: string;
  descripcion: string;
  beneficios?: string[];
}

@Component({
  selector: 'app-servicios-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="servicios-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Clínicas & Masterclasses</h2>
      </div>
      <div class="subbar-right">
        <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarServicios()" title="Actualizar">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
        <button class="btn-mis-pases" (click)="abrirMisPases()" title="Mis Pases QR">
          <i class="fa-solid fa-qrcode"></i>
          @if (misPases().length > 0) {
            <span class="badge-count">{{ misPases().length }}</span>
          }
        </button>
      </div>
    </div>

    <main class="servicios-container">
      <!-- BANNER PROMO HERO -->
      <section class="promo-hero-card">
        <div class="hero-tag-pill">
          <i class="fa-solid fa-fire-flame-curved"></i> ESPECIALIZACIÓN PRO
        </div>
        <h3 class="hero-title">Clínicas de Micro-Habilidades</h3>
        <p class="hero-desc">
          Entrena explosividad, neuro-agilidad, regate 1v1 y tiros libres con preparadores profesionales en canchas de Cartagena.
        </p>
        <div class="hero-features">
          <span><i class="fa-solid fa-bolt text-emerald"></i> Sensores Láser</span>
          <span><i class="fa-solid fa-brain text-cyan"></i> Luces Fitlight</span>
          <span><i class="fa-solid fa-award text-amber"></i> Insignia Digital</span>
        </div>
      </section>

      <!-- CATEGORY CHIPS SCROLLER -->
      <section class="chips-scroller">
        <button
          class="chip-item"
          [class.active]="selectedCategoria() === 'TODAS'"
          (click)="selectedCategoria.set('TODAS')"
        >
          <i class="fa-solid fa-grid-2"></i> Todas
        </button>
        <button
          class="chip-item chip-emerald"
          [class.active]="selectedCategoria() === 'VELOCIDAD_EXPLOSIVIDAD'"
          (click)="selectedCategoria.set('VELOCIDAD_EXPLOSIVIDAD')"
        >
          <i class="fa-solid fa-bolt"></i> ⚡ Explosividad
        </button>
        <button
          class="chip-item chip-cyan"
          [class.active]="selectedCategoria() === 'COORDINACION_AGILIDAD'"
          (click)="selectedCategoria.set('COORDINACION_AGILIDAD')"
        >
          <i class="fa-solid fa-brain"></i> 🧠 Neuro-Agilidad
        </button>
        <button
          class="chip-item chip-amber"
          [class.active]="selectedCategoria() === 'TECNICA_REGATE'"
          (click)="selectedCategoria.set('TECNICA_REGATE')"
        >
          <i class="fa-solid fa-wand-magic-sparkles"></i> 🪄 Regate 1v1
        </button>
        <button
          class="chip-item chip-pink"
          [class.active]="selectedCategoria() === 'ARQUEROS_ELITE'"
          (click)="selectedCategoria.set('ARQUEROS_ELITE')"
        >
          <i class="fa-solid fa-mitten"></i> 🧤 Porteros
        </button>
        <button
          class="chip-item chip-purple"
          [class.active]="selectedCategoria() === 'DEFINICION_TIRO'"
          (click)="selectedCategoria.set('DEFINICION_TIRO')"
        >
          <i class="fa-solid fa-bullseye"></i> 🎯 Definición
        </button>
      </section>

      <!-- SEARCH BAR -->
      <section class="search-section">
        <div class="search-input-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Buscar clínica, profe o cancha..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
          />
          @if (searchQuery()) {
            <button class="btn-clear-search" (click)="searchQuery.set('')">
              <i class="fa-solid fa-xmark"></i>
            </button>
          }
        </div>
      </section>

      <!-- LISTA DE CLÍNICAS -->
      <section class="clinicas-list">
        @for (s of filteredServicios(); track s.id) {
          <div class="clinica-card" [style.border-top-color]="s.color_tema || '#10b981'">
            <!-- CARD HEADER -->
            <div class="card-head">
              <span class="cat-pill" [style.color]="s.color_tema" [style.background]="(s.color_tema || '#10b981') + '20'">
                <i class="fa-solid" [ngClass]="s.icono || 'fa-bolt'"></i>
                {{ getCategoriaLabel(s.categoria_servicio) }}
              </span>
              <span class="age-pill">
                <i class="fa-solid fa-user-tag"></i> {{ s.edad_min }}-{{ s.edad_max }} Años
              </span>
            </div>

            <!-- TITLE & SUBTITLE -->
            <h3 class="clinica-title">{{ s.titulo }}</h3>
            <p class="clinica-sub">{{ s.subtitulo }}</p>

            <!-- COACH & FIELD -->
            <div class="coach-row">
              <img [src]="s.entrenador_avatar || defaultAvatar" [alt]="s.entrenador_nombre" class="coach-avatar" />
              <div class="coach-meta">
                <span class="coach-name">{{ s.entrenador_nombre }}</span>
                <span class="coach-badge">{{ s.entrenador_badge }}</span>
              </div>
            </div>

            <div class="venue-block">
              <div class="venue-line">
                <i class="fa-solid fa-location-dot text-emerald"></i>
                <span>{{ s.cancha_nombre }} (Cartagena)</span>
                @if (s.cancha_gps_url) {
                  <a [href]="s.cancha_gps_url" target="_blank" rel="noopener" class="gps-link">
                    <i class="fa-solid fa-diamond-turn-right"></i> GPS
                  </a>
                }
              </div>
              <div class="schedule-line">
                <i class="fa-solid fa-clock text-amber"></i>
                <span>{{ s.dias_semana }} • {{ s.horario_rango }}</span>
              </div>
            </div>

            <!-- CUPOS PROGRESS -->
            <div class="cupos-box">
              <div class="cupos-labels">
                <span>{{ s.cupos_ocupados }}/{{ s.cupos_totales }} cupos tomados</span>
                <span class="urgency-badge" [class.danger]="(s.cupos_totales - s.cupos_ocupados) <= 3">
                  {{ (s.cupos_totales - s.cupos_ocupados) === 0 ? '¡AGOTADO!' : '¡Quedan ' + (s.cupos_totales - s.cupos_ocupados) + '!' }}
                </span>
              </div>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  [style.width.%]="(s.cupos_ocupados / s.cupos_totales) * 100"
                  [style.background]="s.color_tema || '#10b981'"
                ></div>
              </div>
            </div>

            <!-- REWARD -->
            <div class="reward-tag">
              <i class="fa-solid fa-award text-amber"></i> Insignia Ficha: <strong>{{ s.insignia_obtenida }}</strong>
            </div>

            <!-- FOOTER PRICING & ACTION -->
            <div class="card-bottom">
              <div class="price-info">
                <span class="price-sub">Paquete Mensual:</span>
                <span class="price-main">\${{ formatNumber(s.precio_paquete_mensual) }}</span>
                <span class="price-single">o \${{ formatNumber(s.precio_sesion_individual) }} / sesión</span>
              </div>

              <button
                class="btn-book"
                [disabled]="s.cupos_ocupados >= s.cupos_totales"
                (click)="abrirModalInscripcion(s)"
              >
                <i class="fa-solid fa-ticket"></i>
                {{ s.cupos_ocupados >= s.cupos_totales ? 'Agotado' : 'Reservar' }}
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <i class="fa-solid fa-graduation-cap"></i>
            <p>No se encontraron clínicas en esta categoría.</p>
            <button class="btn-reset" (click)="resetFiltros()">Ver Todas</button>
          </div>
        }
      </section>
    </main>

    <!-- ============================================================ -->
    <!-- BOTTOM SHEET MODAL: CHECKOUT & INSCRIPCIÓN                   -->
    <!-- ============================================================ -->
    @if (modalInscripcion()) {
      <div class="sheet-overlay" (click)="cerrarModalInscripcion()">
        <div class="sheet-content" (click)="$event.stopPropagation()">
          <div class="sheet-handle"></div>

          <!-- SUCCESS TICKET STATE -->
          @if (ticketGenerado()) {
            <div class="ticket-view">
              <div class="ticket-header-success" [style.background]="ticketData()?.estado_pago === 'PENDIENTE_APROBACION' ? '#d97706' : (selectedServicio()?.color_tema || '#10b981')">
                <i class="fa-solid" [ngClass]="ticketData()?.estado_pago === 'PENDIENTE_APROBACION' ? 'fa-clock' : 'fa-circle-check'"></i>
                <h3>{{ ticketData()?.estado_pago === 'PENDIENTE_APROBACION' ? 'Inscripción en Revisión' : '¡Inscripción Exitosa!' }}</h3>
                <span>{{ ticketData()?.estado_pago === 'PENDIENTE_APROBACION' ? 'Comprobante Nequi enviado a Tesorería' : 'Pase QR Digital Oficial SportCoreOS' }}</span>
              </div>
              @if (ticketData()?.estado_pago === 'PENDIENTE_APROBACION') {
                <div class="mobile-pending-banner">
                  <i class="fa-solid fa-vault"></i>
                  <span>Cupo reservado. Tu pase QR definitivo se activará cuando la tesorera valide el abono.</span>
                </div>
              }
              <div class="ticket-details">
                <h4 class="ticket-program">{{ selectedServicio()?.titulo }}</h4>
                <div class="t-row">
                  <span class="t-k">Atleta:</span>
                  <span class="t-v">{{ ticketData()?.nombre_jugador }}</span>
                </div>
                <div class="t-row">
                  <span class="t-k">Plan:</span>
                  <span class="t-v">{{ ticketData()?.tipo_plan }}</span>
                </div>
                <div class="t-row">
                  <span class="t-k">Total Pagado:</span>
                  <span class="t-v text-emerald font-bold">\${{ formatNumber(ticketData()?.monto_pagado) }}</span>
                </div>
                <div class="t-row">
                  <span class="t-k">Sede Cartagena:</span>
                  <span class="t-v">{{ selectedServicio()?.cancha_nombre }}</span>
                </div>
                <div class="t-row">
                  <span class="t-k">Horario:</span>
                  <span class="t-v">{{ selectedServicio()?.dias_semana }} ({{ selectedServicio()?.horario_rango }})</span>
                </div>

                <div class="qr-ticket-box">
                  <div class="qr-icon-holder">
                    <i class="fa-solid fa-qrcode"></i>
                  </div>
                  <div class="qr-codes">
                    <span class="qr-token-str">{{ ticketData()?.codigo_qr_ticket }}</span>
                    <span class="qr-ref-str">Ref: {{ ticketData()?.referencia_transaccion }}</span>
                  </div>
                </div>
              </div>

              <div class="ticket-actions">
                <button class="btn-whatsapp-share" (click)="compartirWhatsApp()">
                  <i class="fa-brands fa-whatsapp"></i> Compartir Pase por WhatsApp
                </button>
                <button class="btn-close-sheet" (click)="cerrarModalInscripcion()">
                  Cerrar
                </button>
              </div>
            </div>
          } @else {
            <!-- CHECKOUT FORM -->
            <div class="sheet-form">
              <div class="sheet-header">
                <h3>Inscribirse a Clínica</h3>
                <p>{{ selectedServicio()?.titulo }}</p>
              </div>

              <!-- SELECTOR PLAN -->
              <div class="plan-options">
                <div
                  class="plan-card"
                  [class.active]="tipoPlan() === 'PAQUETE_MENSUAL'"
                  (click)="tipoPlan.set('PAQUETE_MENSUAL')"
                >
                  <div class="p-radio">
                    <i class="fa-solid fa-circle-dot" *ngIf="tipoPlan() === 'PAQUETE_MENSUAL'"></i>
                    <i class="fa-regular fa-circle" *ngIf="tipoPlan() !== 'PAQUETE_MENSUAL'"></i>
                  </div>
                  <div class="p-text">
                    <span class="p-name">Mes Completo (Recomendado)</span>
                    <span class="p-sub">Todas las sesiones del mes + evaluación</span>
                  </div>
                  <span class="p-cost">\${{ formatNumber(selectedServicio()?.precio_paquete_mensual) }}</span>
                </div>

                <div
                  class="plan-card"
                  [class.active]="tipoPlan() === 'SESION_INDIVIDUAL'"
                  (click)="tipoPlan.set('SESION_INDIVIDUAL')"
                >
                  <div class="p-radio">
                    <i class="fa-solid fa-circle-dot" *ngIf="tipoPlan() === 'SESION_INDIVIDUAL'"></i>
                    <i class="fa-regular fa-circle" *ngIf="tipoPlan() !== 'SESION_INDIVIDUAL'"></i>
                  </div>
                  <div class="p-text">
                    <span class="p-name">Sesión Individual</span>
                    <span class="p-sub">1 sesión intensiva de 90 min</span>
                  </div>
                  <span class="p-cost">\${{ formatNumber(selectedServicio()?.precio_sesion_individual) }}</span>
                </div>
              </div>

              <!-- INPUTS -->
              <div class="input-fields">
                <div class="input-wrap">
                  <label>Nombre del Atleta / Niño:</label>
                  <input type="text" [(ngModel)]="nombreJugador" placeholder="ej. Mateo Valderrama" />
                </div>
                <div class="input-wrap">
                  <label>Nombre del Padre / Acudiente:</label>
                  <input type="text" [(ngModel)]="nombreAcudiente" placeholder="ej. Carlos Valderrama" />
                </div>
                <div class="input-wrap">
                  <label>WhatsApp del Acudiente:</label>
                  <input type="tel" [(ngModel)]="telefonoAcudiente" placeholder="ej. 3001234567" />
                </div>
              </div>

              <!-- DESCUENTO HERMANO -->
              <div class="discount-check">
                <label>
                  <input type="checkbox" [(ngModel)]="aplicaDescuentoHermano" />
                  <span>Aplica descuento 2do hermano (-{{ selectedServicio()?.descuento_hermanos_pct || 15 }}%)</span>
                </label>
              </div>

              <!-- MÉTODO DE PAGO -->
              <div class="pay-selector">
                <label>Método de Pago:</label>
                <div class="pay-chips">
                  <button
                    class="pay-btn"
                    [class.active]="metodoPago() === 'WOMPI_PSE'"
                    (click)="metodoPago.set('WOMPI_PSE')"
                  >
                    <i class="fa-solid fa-building-columns"></i> PSE
                  </button>
                  <button
                    class="pay-btn"
                    [class.active]="metodoPago() === 'NEQUI'"
                    (click)="metodoPago.set('NEQUI')"
                  >
                    <i class="fa-solid fa-mobile-screen-button"></i> Nequi
                  </button>
                  <button
                    class="pay-btn"
                    [class.active]="metodoPago() === 'DAVIPLATA'"
                    (click)="metodoPago.set('DAVIPLATA')"
                  >
                    <i class="fa-solid fa-wallet"></i> DaviPlata
                  </button>
                </div>
              </div>

              @if (metodoPago() === 'NEQUI' || metodoPago() === 'DAVIPLATA') {
                <div class="nequi-card-mobile">
                  <div class="nequi-top">
                    <span class="n-title"><i class="fa-solid fa-mobile-screen-button"></i> Transferir a Nequi / DaviPlata</span>
                    <button type="button" class="btn-copy-mini" (click)="copiarNumero('3109876543')">Copiar</button>
                  </div>
                  <div class="n-acc">310 987 6543</div>
                  <div class="n-holder">SportCore Academy SAS • NIT 901.458.772-1</div>

                  <div class="voucher-box-mobile">
                    <label class="lbl-voucher"><i class="fa-solid fa-receipt text-emerald"></i> Comprobante de Pago:</label>
                    <div class="voucher-actions-row">
                      <button type="button" class="btn-attach-voucher" (click)="usarComprobanteDemoMobile()">
                        <i class="fa-solid" [ngClass]="comprobanteUrl() ? 'fa-check text-emerald' : 'fa-wand-magic-sparkles'"></i>
                        {{ comprobanteUrl() ? 'Soporte Adjuntado ✓' : 'Adjuntar Soporte Demo' }}
                      </button>
                    </div>
                    <input
                      type="text"
                      [(ngModel)]="referenciaTransaccion"
                      placeholder="Ref / # Aprobación (ej. NQ-918231)"
                      class="ref-input-mobile"
                    />
                  </div>
                </div>
              }

              <!-- TOTAL BAR -->
              <div class="total-strip">
                <div>
                  <span class="tot-label">Total a Pagar:</span>
                  <span class="tot-note">Sin cobros adicionales</span>
                </div>
                <div class="tot-val">&#36;{{ formatNumber(montoCalculado()) }}</div>
              </div>

              <!-- ACTION -->
              <div class="sheet-actions">
                <button
                  class="btn-pay-now"
                  [disabled]="isSubmitting() || !nombreJugador || !nombreAcudiente || !telefonoAcudiente"
                  (click)="confirmarInscripcion()"
                >
                  <i class="fa-solid fa-shield-check" *ngIf="!isSubmitting()"></i>
                  <i class="fa-solid fa-spinner fa-spin" *ngIf="isSubmitting()"></i>
                  {{ isSubmitting() ? 'Procesando...' : (metodoPago() === 'WOMPI_PSE' ? 'Pagar $' + formatNumber(montoCalculado()) + ' (PSE)' : 'Confirmar & Enviar Soporte') }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- ============================================================ -->
    <!-- MODAL: MIS PASES QR                                          -->
    <!-- ============================================================ -->
    @if (modalMisPases()) {
      <div class="sheet-overlay" (click)="cerrarMisPases()">
        <div class="sheet-content" (click)="$event.stopPropagation()">
          <div class="sheet-handle"></div>
          <div class="sheet-header">
            <h3><i class="fa-solid fa-qrcode text-emerald"></i> Mis Pases QR Activos</h3>
            <p>Pases digitales para acceso a clínicas especializadas</p>
          </div>

          <div class="pases-list">
            @for (p of misPases(); track p.id) {
              <div class="pase-item">
                <div class="pase-item-top">
                  <span class="pase-title">{{ p.servicio_titulo || p.titulo }}</span>
                  <span class="pase-badge" [class.pase-pending]="p.estado_pago === 'PENDIENTE_APROBACION'">{{ p.estado_pago === 'PENDIENTE_APROBACION' ? 'EN REVISIÓN' : 'ACTIVO' }}</span>
                </div>
                <div class="pase-meta">
                  <span><i class="fa-solid fa-user"></i> {{ p.nombre_jugador }}</span>
                  <span><i class="fa-solid fa-clock"></i> {{ p.horario_rango }}</span>
                </div>
                <div class="pase-qr-row">
                  <i class="fa-solid fa-qrcode"></i>
                  <span class="qr-str">{{ p.codigo_qr_ticket }}</span>
                </div>
              </div>
            } @empty {
              <div class="empty-state-pases">
                <i class="fa-solid fa-ticket"></i>
                <p>Aún no tienes pases para clínicas. ¡Inscríbete en una arriba!</p>
              </div>
            }
          </div>

          <button class="btn-close-sheet" (click)="cerrarMisPases()">Cerrar</button>
        </div>
      </div>
    }

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .servicios-subbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #0f172a;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 56px;
      z-index: 40;
    }

    .subbar-left {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .subbar-left h2 {
      font-size: 1.1rem;
      font-weight: 800;
      margin: 0;
      color: #ffffff;
    }

    .btn-back {
      color: #94a3b8;
      font-size: 1.1rem;
      text-decoration: none;
    }

    .subbar-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-icon-refresh, .btn-mis-pases {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
    }

    .badge-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #10b981;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinning i {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .servicios-container {
      padding: 1rem;
      padding-bottom: 80px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* PROMO HERO */
    .promo-hero-card {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.1));
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      padding: 1.25rem;
      position: relative;
    }

    .hero-tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      margin-bottom: 0.5rem;
    }

    .hero-title {
      font-size: 1.2rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.4rem 0;
    }

    .hero-desc {
      font-size: 0.8rem;
      color: #94a3b8;
      line-height: 1.4;
      margin: 0 0 0.75rem 0;
    }

    .hero-features {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .hero-features span {
      background: rgba(15, 23, 42, 0.6);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* CHIPS */
    .chips-scroller {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
      scrollbar-width: none;
    }

    .chips-scroller::-webkit-scrollbar {
      display: none;
    }

    .chip-item {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      padding: 0.45rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .chip-item.active {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #10b981;
    }

    .chip-item.chip-cyan.active {
      background: rgba(6, 182, 212, 0.2);
      border-color: #06b6d4;
      color: #06b6d4;
    }

    .chip-item.chip-amber.active {
      background: rgba(245, 158, 11, 0.2);
      border-color: #f59e0b;
      color: #f59e0b;
    }

    .chip-item.chip-pink.active {
      background: rgba(236, 72, 153, 0.2);
      border-color: #ec4899;
      color: #ec4899;
    }

    .chip-item.chip-purple.active {
      background: rgba(139, 92, 246, 0.2);
      border-color: #8b5cf6;
      color: #8b5cf6;
    }

    /* SEARCH */
    .search-section {
      position: relative;
    }

    .search-input-box {
      display: flex;
      align-items: center;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.55rem 0.85rem;
      gap: 0.5rem;
    }

    .search-input-box i {
      color: #64748b;
      font-size: 0.9rem;
    }

    .search-input-box input {
      background: none;
      border: none;
      color: #ffffff;
      font-size: 0.85rem;
      outline: none;
      width: 100%;
    }

    .btn-clear-search {
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
    }

    /* CLINICAS LIST */
    .clinicas-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .clinica-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-top: 3.5px solid #10b981;
      border-radius: 14px;
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cat-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .age-pill {
      font-size: 0.72rem;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.04);
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
    }

    .clinica-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      line-height: 1.3;
    }

    .clinica-sub {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.4;
    }

    .coach-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255, 255, 255, 0.03);
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
    }

    .coach-avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
    }

    .coach-meta {
      display: flex;
      flex-direction: column;
    }

    .coach-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: #ffffff;
    }

    .coach-badge {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    .venue-block {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.78rem;
      color: #cbd5e1;
    }

    .venue-line, .schedule-line {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .gps-link {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      text-decoration: none;
      margin-left: auto;
    }

    /* CUPOS */
    .cupos-box {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .cupos-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .urgency-badge {
      color: #10b981;
      font-weight: 700;
    }

    .urgency-badge.danger {
      color: #ef4444;
    }

    .bar-track {
      height: 5px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 9999px;
    }

    .reward-tag {
      font-size: 0.75rem;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.08);
      border: 1px dashed rgba(245, 158, 11, 0.25);
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
    }

    .card-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.6rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .price-info {
      display: flex;
      flex-direction: column;
    }

    .price-sub {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    .price-main {
      font-size: 1.15rem;
      font-weight: 800;
      color: #10b981;
    }

    .price-single {
      font-size: 0.7rem;
      color: #64748b;
    }

    .btn-book {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.1rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-book:disabled {
      background: rgba(255, 255, 255, 0.1);
      color: #64748b;
      cursor: not-allowed;
    }

    /* SHEET MODAL */
    .sheet-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(4px);
      z-index: 1100;
      display: flex;
      align-items: flex-end;
    }

    .sheet-content {
      background: #0f172a;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px 20px 0 0;
      width: 100%;
      max-height: 85vh;
      overflow-y: auto;
      padding: 1.25rem 1.25rem 3.5rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .sheet-handle {
      width: 40px;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 9999px;
      margin: 0 auto;
    }

    .sheet-header h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.2rem 0;
    }

    .sheet-header p {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0;
    }

    .plan-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .plan-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }

    .plan-card.active {
      background: rgba(16, 185, 129, 0.1);
      border-color: #10b981;
    }

    .p-radio {
      color: #10b981;
      font-size: 1rem;
    }

    .p-text {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .p-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #ffffff;
    }

    .p-sub {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .p-cost {
      font-size: 0.95rem;
      font-weight: 800;
      color: #10b981;
    }

    .input-fields {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .input-wrap label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 0.25rem;
      display: block;
    }

    .input-wrap input {
      width: 100%;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 0.6rem 0.75rem;
      color: #ffffff;
      font-size: 0.85rem;
      outline: none;
      box-sizing: border-box;
    }

    .discount-check {
      background: rgba(245, 158, 11, 0.08);
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      font-size: 0.78rem;
      color: #f59e0b;
      font-weight: 600;
    }

    .discount-check label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .pay-selector label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      margin-bottom: 0.4rem;
      display: block;
    }

    .pay-chips {
      display: flex;
      gap: 0.5rem;
    }

    .pay-btn {
      flex: 1;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      padding: 0.5rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }

    .pay-btn.active {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #10b981;
    }

    .total-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.04);
      padding: 0.75rem 1rem;
      border-radius: 10px;
    }

    .tot-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #ffffff;
      display: block;
    }

    .tot-note {
      font-size: 0.7rem;
      color: #64748b;
    }

    .tot-val {
      font-size: 1.3rem;
      font-weight: 800;
      color: #10b981;
    }

    .btn-pay-now {
      width: 100%;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      padding: 0.8rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-pay-now:disabled {
      background: rgba(255, 255, 255, 0.1);
      color: #64748b;
      cursor: not-allowed;
    }

    /* TICKET SUCCESS */
    .ticket-view {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ticket-header-success {
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      color: #ffffff;
    }

    .ticket-header-success i {
      font-size: 2rem;
      margin-bottom: 0.35rem;
    }

    .ticket-header-success h3 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 800;
    }

    .ticket-header-success span {
      font-size: 0.75rem;
      opacity: 0.9;
    }

    .ticket-details {
      background: #1e293b;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .ticket-program {
      font-size: 1rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .t-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
    }

    .t-k { color: #94a3b8; }
    .t-v { color: #ffffff; font-weight: 600; }

    .qr-ticket-box {
      margin-top: 0.75rem;
      background: rgba(15, 23, 42, 0.6);
      padding: 0.75rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .qr-icon-holder {
      font-size: 2.2rem;
      color: #10b981;
    }

    .qr-codes {
      display: flex;
      flex-direction: column;
    }

    .qr-token-str {
      font-family: monospace;
      font-size: 0.75rem;
      font-weight: 700;
      color: #10b981;
    }

    .qr-ref-str {
      font-size: 0.7rem;
      color: #64748b;
    }

    .btn-whatsapp-share {
      width: 100%;
      background: #25d366;
      color: #ffffff;
      border: none;
      padding: 0.75rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
    }

    .btn-close-sheet {
      width: 100%;
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: none;
      padding: 0.7rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      margin-top: 0.5rem;
    }

    /* MIS PASES */
    .pases-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .pase-item {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-left: 3px solid #10b981;
      border-radius: 10px;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .pase-item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .pase-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: #ffffff;
    }

    .pase-badge {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }

    .pase-meta {
      display: flex;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .pase-qr-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.75rem;
      color: #10b981;
      font-family: monospace;
      margin-top: 0.2rem;
    }

    .empty-state, .empty-state-pases {
      text-align: center;
      padding: 2.5rem 1rem;
      color: #64748b;
    }

    .empty-state i, .empty-state-pases i {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .btn-reset {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .text-emerald { color: #10b981; }
    .text-cyan { color: #06b6d4; }
    .text-amber { color: #f59e0b; }
    .text-pink { color: #ec4899; }
    .text-purple { color: #8b5cf6; }
    .font-bold { font-weight: 700; }

    .mobile-pending-banner {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin: 0.75rem 1rem 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.75rem;
      color: #fde68a;
    }

    .mobile-pending-banner i {
      font-size: 1.2rem;
      color: #f59e0b;
      flex-shrink: 0;
    }

    .nequi-card-mobile {
      background: #1e1b4b;
      border: 1px solid rgba(167, 139, 250, 0.3);
      border-radius: 12px;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .nequi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .n-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #a78bfa;
    }

    .btn-copy-mini {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #ffffff;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      cursor: pointer;
    }

    .n-acc {
      font-size: 1.15rem;
      font-weight: 900;
      color: #ffffff;
      font-family: monospace;
      letter-spacing: 0.05em;
    }

    .n-holder {
      font-size: 0.68rem;
      color: #94a3b8;
    }

    .voucher-box-mobile {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 0.5rem;
    }

    .lbl-voucher {
      font-size: 0.75rem;
      font-weight: 700;
      color: #cbd5e1;
    }

    .btn-attach-voucher {
      background: rgba(16, 185, 129, 0.15);
      border: 1px dashed rgba(16, 185, 129, 0.4);
      color: #10b981;
      padding: 0.5rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
    }

    .ref-input-mobile {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 0.45rem 0.65rem;
      font-size: 0.78rem;
      color: #ffffff;
      outline: none;
    }

    .pase-badge.pase-pending {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
  `]
})
export class ServiciosMobileComponent implements OnInit {
  private http = inject(HttpClient);
  public auth = inject(AuthService);
  private alert = inject(AlertService);

  private apiUrl = environment.apiUrl;
  defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face';

  // Signals
  servicios = signal<ServicioMobile[]>([]);
  misPases = signal<any[]>([]);
  searchQuery = signal<string>('');
  selectedCategoria = signal<string>('TODAS');
  isRefreshing = signal<boolean>(false);

  // Modal States
  modalInscripcion = signal<boolean>(false);
  modalMisPases = signal<boolean>(false);
  selectedServicio = signal<ServicioMobile | null>(null);

  // Form
  tipoPlan = signal<'PAQUETE_MENSUAL' | 'SESION_INDIVIDUAL'>('PAQUETE_MENSUAL');
  nombreJugador = 'Samuel Díaz Restrepo';
  nombreAcudiente = 'Carlos Díaz';
  telefonoAcudiente = '+57 310 987 6543';
  aplicaDescuentoHermano = false;
  metodoPago = signal<string>('WOMPI_PSE');
  comprobanteUrl = signal<string>('');
  referenciaTransaccion = 'NQ-849201';
  isSubmitting = signal<boolean>(false);
  ticketGenerado = signal<boolean>(false);
  ticketData = signal<any>(null);

  filteredServicios = computed(() => {
    let list = this.servicios();
    const cat = this.selectedCategoria();
    const q = this.searchQuery().toLowerCase().trim();

    if (cat !== 'TODAS') {
      list = list.filter(s => s.categoria_servicio === cat);
    }

    if (q) {
      list = list.filter(s =>
        s.titulo.toLowerCase().includes(q) ||
        s.subtitulo.toLowerCase().includes(q) ||
        s.entrenador_nombre.toLowerCase().includes(q) ||
        s.cancha_nombre.toLowerCase().includes(q)
      );
    }

    return list;
  });

  montoCalculado = computed(() => {
    const s = this.selectedServicio();
    if (!s) return 0;
    let base = this.tipoPlan() === 'PAQUETE_MENSUAL'
      ? Number(s.precio_paquete_mensual)
      : Number(s.precio_sesion_individual);

    if (this.aplicaDescuentoHermano && s.descuento_hermanos_pct) {
      base = base * (1 - (s.descuento_hermanos_pct / 100));
    }
    return Math.round(base);
  });

  ngOnInit() {
    this.recargarServicios();
  }

  recargarServicios() {
    this.isRefreshing.set(true);
    this.http.get<any>(`${this.apiUrl}/servicios`).subscribe({
      next: (res) => {
        this.servicios.set(res.data || res || []);
        this.isRefreshing.set(false);
      },
      error: (err) => {
        this.isRefreshing.set(false);
        console.error('Error cargando servicios:', err);
      }
    });
  }

  getCategoriaLabel(cat: string): string {
    switch (cat) {
      case 'VELOCIDAD_EXPLOSIVIDAD': return '⚡ Explosividad';
      case 'COORDINACION_AGILIDAD': return '🧠 Neuro-Agilidad';
      case 'TECNICA_REGATE': return '🪄 Regate 1v1';
      case 'ARQUEROS_ELITE': return '🧤 Porteros';
      case 'DEFINICION_TIRO': return '🎯 Definición';
      case 'PREVENCION_FISICA': return '🛡️ Fuerza';
      default: return 'Clínica Pro';
    }
  }

  formatNumber(val: any): string {
    if (!val) return '0';
    return Number(val).toLocaleString('es-CO');
  }

  resetFiltros() {
    this.selectedCategoria.set('TODAS');
    this.searchQuery.set('');
  }

  usarComprobanteDemoMobile() {
    this.comprobanteUrl.set('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    if (!this.referenciaTransaccion) {
      this.referenciaTransaccion = 'NQ-' + Math.floor(100000 + Math.random() * 900000);
    }
    this.alert.info('Comprobante Nequi adjuntado correctamente');
  }

  copiarNumero(num: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num);
      this.alert.success(`Número ${num} copiado`);
    }
  }

  abrirModalInscripcion(servicio: ServicioMobile) {
    this.selectedServicio.set(servicio);
    this.tipoPlan.set('PAQUETE_MENSUAL');
    this.ticketGenerado.set(false);
    this.ticketData.set(null);
    this.comprobanteUrl.set('');
    this.modalInscripcion.set(true);
  }

  cerrarModalInscripcion() {
    this.modalInscripcion.set(false);
    this.selectedServicio.set(null);
    this.ticketGenerado.set(false);
    this.ticketData.set(null);
    this.comprobanteUrl.set('');
  }

  confirmarInscripcion() {
    const s = this.selectedServicio();
    if (!s) return;

    this.isSubmitting.set(true);

    const dto: any = {
      nombre_jugador: this.nombreJugador,
      nombre_acudiente: this.nombreAcudiente,
      telefono_acudiente: this.telefonoAcudiente,
      tipo_plan: this.tipoPlan(),
      monto_pagado: this.montoCalculado(),
      metodo_pago: this.metodoPago(),
      comprobante_url: (this.metodoPago() === 'NEQUI' || this.metodoPago() === 'DAVIPLATA' || this.metodoPago() === 'TRANSFERENCIA') ? (this.comprobanteUrl() || undefined) : undefined,
      referencia_transaccion: this.referenciaTransaccion || undefined
    };

    this.http.post<any>(`${this.apiUrl}/servicios/${s.id}/inscribir`, dto).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.ticketGenerado.set(true);
        const data = res.data?.inscripcion || res.inscripcion || res;
        this.ticketData.set(data);
        
        // Agregar a mis pases
        const currentPases = this.misPases();
        this.misPases.set([
          {
            ...data,
            servicio_titulo: s.titulo,
            horario_rango: `${s.dias_semana} (${s.horario_rango})`
          },
          ...currentPases
        ]);

        this.alert.success('¡Inscripción exitosa! Pase digital generado.');
        this.recargarServicios();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.alert.error(err?.error?.message || 'Error al procesar inscripción');
      }
    });
  }

  compartirWhatsApp() {
    const s = this.selectedServicio();
    const t = this.ticketData();
    if (!s || !t) return;

    const text = encodeURIComponent(
      `⚽ *Pase Digital SportCoreOS*\n` +
      `Clínica: *${s.titulo}*\n` +
      `Atleta: ${t.nombre_jugador}\n` +
      `Sede Cartagena: ${s.cancha_nombre}\n` +
      `Horario: ${s.dias_semana} (${s.horario_rango})\n` +
      `Pass Token: ${t.codigo_qr_ticket}`
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  abrirMisPases() {
    this.modalMisPases.set(true);
  }

  cerrarMisPases() {
    this.modalMisPases.set(false);
  }
}
