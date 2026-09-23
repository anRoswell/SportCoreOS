import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

export interface ServicioEspecializado {
  id: string;
  club_id: string;
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
  destacado?: boolean;
  activo?: boolean;
}

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="servicios-page">
      <!-- HEADER & PROMO HERO -->
      <div class="page-hero">
        <div class="hero-content">
          <div class="hero-badge">
            <i class="fa-solid fa-fire-flame-curved"></i>
            <span>PROGRAMAS DE ALTO RENDIMIENTO & UPSKILLING</span>
          </div>
          <h1 class="page-title">Clínicas Especializadas & Masterclasses Pro</h1>
          <p class="page-subtitle">
            Entrenamientos intensivos de micro-habilidades con metodologías de cantera europea, tecnología láser Doppler,
            neuro-motricidad y entrenadores certificados. Cupos limitados por grupo.
          </p>
          <div class="hero-tags">
            <span class="hero-tag"><i class="fa-solid fa-bolt text-emerald"></i> Explosividad 5m</span>
            <span class="hero-tag"><i class="fa-solid fa-brain text-cyan"></i> Neuro-Agilidad Fitlight</span>
            <span class="hero-tag"><i class="fa-solid fa-wand-magic-sparkles text-amber"></i> Regate 1v1 Vinicius</span>
            <span class="hero-tag"><i class="fa-solid fa-mitten text-pink"></i> Guante de Oro</span>
            <span class="hero-tag"><i class="fa-solid fa-bullseye text-purple"></i> Tiros Libres Messi</span>
          </div>
        </div>
        <div class="hero-actions">
          <button class="btn-create" (click)="openCrearModal()">
            <i class="fa-solid fa-plus-circle"></i> Crear Nueva Clínica
          </button>
        </div>
      </div>

      <!-- KPIS ROW -->
      <div class="kpi-grid">
        <div class="kpi-card fut-card">
          <div class="kpi-icon bg-emerald-glow">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div class="kpi-info">
            <div class="kpi-num">{{ servicios().length }}</div>
            <div class="kpi-label">Clínicas Especializadas Activas</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon bg-amber-glow">
            <i class="fa-solid fa-user-group"></i>
          </div>
          <div class="kpi-info">
            <div class="kpi-num">{{ totalCuposOcupados() }} / {{ totalCuposDisponibles() }}</div>
            <div class="kpi-label">Cupos Ocupados ({{ porcentajeOcupacion() }}%)</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon bg-blue-glow">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div class="kpi-info">
            <div class="kpi-num">Cartagena</div>
            <div class="kpi-label">Sedes con GPS & Waze Integrado</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon bg-purple-glow">
            <i class="fa-solid fa-qrcode"></i>
          </div>
          <div class="kpi-info">
            <div class="kpi-num">100% Digital</div>
            <div class="kpi-label">Pases QR & Recaudo PSE/Wompi</div>
          </div>
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="filters-container fut-card">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="Buscar por clínica, habilidad, entrenador o cancha..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            class="sport-input search-input"
          />
          <button *ngIf="searchQuery()" class="btn-clear" (click)="searchQuery.set('')" aria-label="Limpiar búsqueda">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- CATEGORY CHIPS -->
        <div class="category-chips">
          <button
            class="chip-btn"
            [class.active]="selectedCategoria() === 'TODAS'"
            (click)="selectedCategoria.set('TODAS')"
          >
            <i class="fa-solid fa-grid-2"></i> Todas ({{ servicios().length }})
          </button>
          <button
            class="chip-btn chip-emerald"
            [class.active]="selectedCategoria() === 'VELOCIDAD_EXPLOSIVIDAD'"
            (click)="selectedCategoria.set('VELOCIDAD_EXPLOSIVIDAD')"
          >
            <i class="fa-solid fa-bolt"></i> ⚡ Explosividad & Sprint
          </button>
          <button
            class="chip-btn chip-cyan"
            [class.active]="selectedCategoria() === 'COORDINACION_AGILIDAD'"
            (click)="selectedCategoria.set('COORDINACION_AGILIDAD')"
          >
            <i class="fa-solid fa-brain"></i> 🧠 Neuro-Motricidad
          </button>
          <button
            class="chip-btn chip-amber"
            [class.active]="selectedCategoria() === 'TECNICA_REGATE'"
            (click)="selectedCategoria.set('TECNICA_REGATE')"
          >
            <i class="fa-solid fa-wand-magic-sparkles"></i> 🪄 Regate 1v1 Pro
          </button>
          <button
            class="chip-btn chip-pink"
            [class.active]="selectedCategoria() === 'ARQUEROS_ELITE'"
            (click)="selectedCategoria.set('ARQUEROS_ELITE')"
          >
            <i class="fa-solid fa-mitten"></i> 🧤 Guante de Oro
          </button>
          <button
            class="chip-btn chip-purple"
            [class.active]="selectedCategoria() === 'DEFINICION_TIRO'"
            (click)="selectedCategoria.set('DEFINICION_TIRO')"
          >
            <i class="fa-solid fa-bullseye"></i> 🎯 Definición Quirúrgica
          </button>
        </div>
      </div>

      <!-- SERVICIOS GRID -->
      <div class="servicios-grid" *ngIf="filteredServicios().length > 0; else noServicios">
        <div
          *ngFor="let s of filteredServicios()"
          class="servicio-card fut-card"
          [style.border-top-color]="s.color_tema || '#10b981'"
        >
          <!-- CARD TOP BADGE -->
          <div class="card-top-bar">
            <div class="cat-badge" [style.color]="s.color_tema || '#10b981'" [style.background-color]="(s.color_tema || '#10b981') + '1a'">
              <i class="fa-solid" [ngClass]="s.icono || 'fa-bolt'"></i>
              <span>{{ getCategoriaLabel(s.categoria_servicio) }}</span>
            </div>
            <div class="badge-edad">
              <i class="fa-solid fa-user-tag"></i> {{ s.edad_min }}-{{ s.edad_max }} Años
            </div>
          </div>

          <!-- TITLE & SUBTITLE -->
          <h3 class="servicio-title">{{ s.titulo }}</h3>
          <p class="servicio-sub">{{ s.subtitulo }}</p>

          <!-- COACH PROFILE -->
          <div class="coach-box">
            <img [src]="s.entrenador_avatar || defaultAvatar" [alt]="s.entrenador_nombre" class="coach-avatar" />
            <div class="coach-details">
              <div class="coach-name">{{ s.entrenador_nombre }}</div>
              <div class="coach-badge">
                <i class="fa-solid fa-certificate"></i> {{ s.entrenador_badge || 'Entrenador Certificado' }}
              </div>
            </div>
          </div>

          <!-- VENUE & SCHEDULE -->
          <div class="venue-info">
            <div class="venue-item">
              <i class="fa-solid fa-location-dot venue-icon text-emerald"></i>
              <div class="venue-text">
                <span class="venue-name">{{ s.cancha_nombre }}</span>
                <span class="venue-dir">{{ s.cancha_direccion }}</span>
              </div>
              <a
                *ngIf="s.cancha_gps_url"
                [href]="s.cancha_gps_url"
                target="_blank"
                rel="noopener"
                class="btn-gps"
                title="Abrir ubicación en Google Maps / Waze"
              >
                <i class="fa-solid fa-diamond-turn-right"></i> GPS
              </a>
            </div>

            <div class="schedule-item">
              <i class="fa-solid fa-clock schedule-icon text-amber"></i>
              <div>
                <span class="schedule-days">{{ s.dias_semana }}</span>
                <span class="schedule-time">{{ s.horario_rango }} ({{ s.duracion_minutos }} min)</span>
              </div>
            </div>
          </div>

          <!-- CUPOS PROGRESS -->
          <div class="cupos-section">
            <div class="cupos-header">
              <span class="cupos-text">
                <strong>{{ s.cupos_ocupados }}</strong> de {{ s.cupos_totales }} cupos inscritos
              </span>
              <span
                class="cupos-badge"
                [class.cupos-low]="(s.cupos_totales - s.cupos_ocupados) <= 3"
              >
                {{ (s.cupos_totales - s.cupos_ocupados) === 0 ? '¡AGOTADO!' : '¡Solo ' + (s.cupos_totales - s.cupos_ocupados) + ' cupos!' }}
              </span>
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                [style.width.%]="(s.cupos_ocupados / s.cupos_totales) * 100"
                [style.background-color]="s.color_tema || '#10b981'"
              ></div>
            </div>
          </div>

          <!-- INSIGNIA BADGE REWARD -->
          <div class="reward-box">
            <div class="reward-title">
              <i class="fa-solid fa-award text-amber"></i> Desbloquea en Ficha 360°:
            </div>
            <div class="reward-pill">{{ s.insignia_obtenida }}</div>
          </div>

          <!-- BENEFITS LIST -->
          <ul class="benefits-list" *ngIf="s.beneficios && s.beneficios.length > 0">
            <li *ngFor="let b of s.beneficios | slice:0:3">
              <i class="fa-solid fa-check-circle text-emerald"></i> {{ b }}
            </li>
          </ul>

          <!-- PRICING & CTA -->
          <div class="card-footer">
            <div class="pricing-box">
              <div class="price-single">
                <span class="p-label">Sesión Individual:</span>
                <span class="p-val">\${{ formatNumber(s.precio_sesion_individual) }}</span>
              </div>
              <div class="price-bundle">
                <span class="p-label">Paquete Mensual (Mes Completo):</span>
                <span class="p-val-big">\${{ formatNumber(s.precio_paquete_mensual) }}</span>
                <span class="p-discount" *ngIf="s.descuento_hermanos_pct">
                  -{{ s.descuento_hermanos_pct }}% dto 2do hermano
                </span>
              </div>
            </div>

            <div class="card-actions">
              <button
                class="btn-inscribir"
                [disabled]="s.cupos_ocupados >= s.cupos_totales"
                (click)="openInscribirModal(s)"
              >
                <i class="fa-solid fa-ticket"></i>
                {{ s.cupos_ocupados >= s.cupos_totales ? 'Cupos Agotados' : 'Inscribirse / Pago PSE' }}
              </button>
              <button class="btn-participantes" (click)="openParticipantesModal(s)" title="Ver inscritos">
                <i class="fa-solid fa-users"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- EMPTY STATE -->
      <ng-template #noServicios>
        <div class="empty-state fut-card">
          <i class="fa-solid fa-graduation-cap empty-icon"></i>
          <h3>No se encontraron clínicas o servicios</h3>
          <p>Prueba cambiando los filtros o el término de búsqueda.</p>
          <button class="btn-secondary" (click)="resetFilters()">Restablecer Filtros</button>
        </div>
      </ng-template>

      <!-- ============================================================ -->
      <!-- MODAL 1: INSCRIBIRSE & CHECKOUT PSE / WOMPI                   -->
      <!-- ============================================================ -->
      <div class="modal-overlay modal-backdrop" *ngIf="showInscribirModal()" (click)="closeInscribirModal()">
        <div class="modal-dialog modal-card fut-card modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-group modal-title-wrap">
              <div class="modal-badge-icon modal-icon-badge" [style.background]="(selectedServicio()?.color_tema || '#10b981') + '1a'" [style.color]="selectedServicio()?.color_tema || '#10b981'" [style.border-color]="(selectedServicio()?.color_tema || '#10b981') + '33'">
                <i class="fa-solid" [ngClass]="selectedServicio()?.icono || 'fa-ticket'"></i>
              </div>
              <div class="modal-title-text">
                <h2 class="modal-title">Inscripción & Pase Digital</h2>
                <p class="modal-sub modal-subtitle">
                  Clínica: <strong>{{ selectedServicio()?.titulo }}</strong> • Sede: <strong>{{ selectedServicio()?.cancha_nombre }}</strong>
                </p>
              </div>
            </div>
            <button class="btn-close-modal modal-close-btn btn-close" (click)="closeInscribirModal()" aria-label="Cerrar">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- SUCCESS STATE: DIGITAL PASS TICKET -->
          <div class="ticket-pass-container" *ngIf="ticketGenerated(); else formInscripcion">
            <div class="ticket-card">
              <div class="ticket-header" [style.background-color]="selectedServicio()?.color_tema || '#10b981'">
                <div class="ticket-brand">⚽ SportCoreOS • Pass Oficial</div>
                <div class="ticket-status"><i class="fa-solid fa-circle-check"></i> INSCRIPCIÓN CONFIRMADA</div>
              </div>
              <div class="ticket-body">
                <h3 class="ticket-title">{{ selectedServicio()?.titulo }}</h3>
                <div class="ticket-meta-grid">
                  <div class="meta-cell">
                    <span class="t-label">Atleta / Alumno:</span>
                    <span class="t-val">{{ ticketData()?.nombre_jugador }}</span>
                  </div>
                  <div class="meta-cell">
                    <span class="t-label">Acudiente / Contacto:</span>
                    <span class="t-val">{{ ticketData()?.nombre_acudiente }} ({{ ticketData()?.telefono_acudiente }})</span>
                  </div>
                  <div class="meta-cell">
                    <span class="t-label">Plan Adquirido:</span>
                    <span class="t-val">{{ ticketData()?.tipo_plan === 'PAQUETE_MENSUAL' ? 'Paquete Mensual Completo' : 'Sesión Individual' }}</span>
                  </div>
                  <div class="meta-cell">
                    <span class="t-label">Total Liquidado:</span>
                    <span class="t-val text-emerald font-bold">\${{ formatNumber(ticketData()?.monto_pagado) }}</span>
                  </div>
                  <div class="meta-cell">
                    <span class="t-label">Cancha / Sede Cartagena:</span>
                    <span class="t-val">{{ selectedServicio()?.cancha_nombre }}</span>
                  </div>
                  <div class="meta-cell">
                    <span class="t-label">Horario:</span>
                    <span class="t-val">{{ selectedServicio()?.dias_semana }} ({{ selectedServicio()?.horario_rango }})</span>
                  </div>
                </div>

                <div class="qr-box">
                  <div class="qr-mock">
                    <i class="fa-solid fa-qrcode qr-large-icon"></i>
                  </div>
                  <div class="qr-info">
                    <div class="qr-code-text">{{ ticketData()?.codigo_qr_ticket }}</div>
                    <div class="qr-ref">Ref: {{ ticketData()?.referencia_transaccion }}</div>
                    <p class="qr-note">Presenta este pase QR digital al profesor el primer día de entrenamiento.</p>
                  </div>
                </div>
              </div>
              <div class="ticket-footer">
                <button class="btn-primary" (click)="closeInscribirModal()">
                  <i class="fa-solid fa-check"></i> Finalizar
                </button>
                <button class="btn-whatsapp" (click)="shareWhatsApp()">
                  <i class="fa-brands fa-whatsapp"></i> Compartir por WhatsApp
                </button>
              </div>
            </div>
          </div>

          <!-- FORM INSCRIBIRSE -->
          <ng-template #formInscripcion>
            <div class="modal-body">
              <!-- PLAN SELECTOR -->
              <div class="plan-selector">
                <div
                  class="plan-option"
                  [class.selected]="tipoPlan() === 'PAQUETE_MENSUAL'"
                  (click)="tipoPlan.set('PAQUETE_MENSUAL')"
                >
                  <div class="plan-radio">
                    <i class="fa-solid fa-circle-check text-emerald" *ngIf="tipoPlan() === 'PAQUETE_MENSUAL'"></i>
                    <i class="fa-regular fa-circle text-muted" *ngIf="tipoPlan() !== 'PAQUETE_MENSUAL'"></i>
                  </div>
                  <div class="plan-details">
                    <div class="plan-header-row">
                      <span class="plan-name">Paquete Mensual Completo</span>
                      <span class="plan-badge-popular"><i class="fa-solid fa-star"></i> Más Recomendado</span>
                    </div>
                    <div class="plan-desc">Incluye todas las sesiones del mes + kit de seguimiento, seguro y evaluación biomecánica final</div>
                  </div>
                  <div class="plan-price-wrap">
                    <span class="plan-price">\${{ formatNumber(selectedServicio()?.precio_paquete_mensual) }}</span>
                    <span class="plan-period">/ mes completo</span>
                  </div>
                </div>

                <div
                  class="plan-option"
                  [class.selected]="tipoPlan() === 'SESION_INDIVIDUAL'"
                  (click)="tipoPlan.set('SESION_INDIVIDUAL')"
                >
                  <div class="plan-radio">
                    <i class="fa-solid fa-circle-check text-emerald" *ngIf="tipoPlan() === 'SESION_INDIVIDUAL'"></i>
                    <i class="fa-regular fa-circle text-muted" *ngIf="tipoPlan() !== 'SESION_INDIVIDUAL'"></i>
                  </div>
                  <div class="plan-details">
                    <div class="plan-header-row">
                      <span class="plan-name">Sesión Individual de Prueba</span>
                    </div>
                    <div class="plan-desc">Acceso a 1 sesión intensiva de 90 minutos con test técnico</div>
                  </div>
                  <div class="plan-price-wrap">
                    <span class="plan-price">\${{ formatNumber(selectedServicio()?.precio_sesion_individual) }}</span>
                    <span class="plan-period">/ sesión única</span>
                  </div>
                </div>
              </div>

              <!-- FORM FIELDS -->
              <div class="form-grid">
                <div class="form-group">
                  <label class="sport-label">
                    <i class="fa-solid fa-child-reaching text-emerald"></i> Nombre del Atleta / Niño <span class="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    [ngModel]="nombreJugador()"
                    (ngModelChange)="nombreJugador.set($event)"
                    placeholder="ej. Mateo Valderrama"
                    class="sport-input"
                  />
                </div>

                <div class="form-group">
                  <label class="sport-label">
                    <i class="fa-solid fa-user-shield text-cyan"></i> Nombre del Acudiente / Padre <span class="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    [ngModel]="nombreAcudiente()"
                    (ngModelChange)="nombreAcudiente.set($event)"
                    placeholder="ej. Carlos Valderrama"
                    class="sport-input"
                  />
                </div>

                <div class="form-group">
                  <label class="sport-label">
                    <i class="fa-brands fa-whatsapp text-emerald"></i> Teléfono WhatsApp de Contacto <span class="required-star">*</span>
                  </label>
                  <input
                    type="tel"
                    [ngModel]="telefonoAcudiente()"
                    (ngModelChange)="telefonoAcudiente.set($event)"
                    placeholder="ej. +57 300 123 4567"
                    class="sport-input"
                  />
                </div>

                <div class="form-group">
                  <label class="sport-label">
                    <i class="fa-solid fa-envelope text-amber"></i> Correo Electrónico (Envío de Ticket QR) <span class="required-star">*</span>
                  </label>
                  <input
                    type="email"
                    [ngModel]="emailAcudiente()"
                    (ngModelChange)="emailAcudiente.set($event)"
                    placeholder="ej. carlos.valderrama@gmail.com"
                    class="sport-input"
                  />
                </div>
              </div>

              <!-- BROTHER DISCOUNT TOGGLE -->
              <div class="discount-toggle" [class.active]="aplicaDescuentoHermano()">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [ngModel]="aplicaDescuentoHermano()"
                    (ngModelChange)="aplicaDescuentoHermano.set($event)"
                  />
                  <div class="discount-info">
                    <div class="discount-title">
                      <i class="fa-solid fa-people-roof text-amber"></i> ¿Inscribes a 2 o más hermanos?
                      <span class="discount-pill">-{{ selectedServicio()?.descuento_hermanos_pct || 15 }}% DTO</span>
                    </div>
                    <p class="discount-desc">Activa el beneficio familiar SportCoreOS y obtén tarifa especial en el valor liquidado.</p>
                  </div>
                </label>
              </div>

              <!-- PAYMENT METHOD SELECTOR -->
              <div class="payment-method-section">
                <label class="sport-label">
                  <i class="fa-solid fa-lock text-emerald"></i> Pasarela de Pago Instantáneo Seguro:
                </label>
                <div class="pay-methods-grid">
                  <div
                    class="pay-method-card"
                    [class.active]="metodoPago() === 'WOMPI_PSE'"
                    (click)="metodoPago.set('WOMPI_PSE')"
                  >
                    <div class="pay-icon bg-emerald-glow"><i class="fa-solid fa-building-columns"></i></div>
                    <div class="pay-text">
                      <span class="pay-title">PSE / Wompi</span>
                      <span class="pay-sub">Débito bancario en línea</span>
                    </div>
                    <i class="fa-solid fa-circle-check pay-check" *ngIf="metodoPago() === 'WOMPI_PSE'"></i>
                  </div>
                  <div
                    class="pay-method-card"
                    [class.active]="metodoPago() === 'NEQUI'"
                    (click)="metodoPago.set('NEQUI')"
                  >
                    <div class="pay-icon bg-purple-glow"><i class="fa-solid fa-mobile-screen-button"></i></div>
                    <div class="pay-text">
                      <span class="pay-title">Nequi</span>
                      <span class="pay-sub">Transferencia directa</span>
                    </div>
                    <i class="fa-solid fa-circle-check pay-check" *ngIf="metodoPago() === 'NEQUI'"></i>
                  </div>
                  <div
                    class="pay-method-card"
                    [class.active]="metodoPago() === 'DAVIPLATA'"
                    (click)="metodoPago.set('DAVIPLATA')"
                  >
                    <div class="pay-icon bg-amber-glow"><i class="fa-solid fa-wallet"></i></div>
                    <div class="pay-text">
                      <span class="pay-title">DaviPlata</span>
                      <span class="pay-sub">Billetera Davivienda</span>
                    </div>
                    <i class="fa-solid fa-circle-check pay-check" *ngIf="metodoPago() === 'DAVIPLATA'"></i>
                  </div>
                  <div
                    class="pay-method-card"
                    [class.active]="metodoPago() === 'TARJETA_CREDITO'"
                    (click)="metodoPago.set('TARJETA_CREDITO')"
                  >
                    <div class="pay-icon bg-blue-glow"><i class="fa-solid fa-credit-card"></i></div>
                    <div class="pay-text">
                      <span class="pay-title">Tarjeta de Crédito</span>
                      <span class="pay-sub">Visa, Mastercard, Amex</span>
                    </div>
                    <i class="fa-solid fa-circle-check pay-check" *ngIf="metodoPago() === 'TARJETA_CREDITO'"></i>
                  </div>
                </div>
              </div>

              <!-- TOTAL SUMMARY -->
              <div class="total-bar">
                <div class="total-text">
                  <span class="total-label">Total a Liquidar:</span>
                  <span class="total-sub"><i class="fa-solid fa-shield-halved text-emerald"></i> Sin costos ocultos • Incluye póliza de entrenamiento y ficha digital</span>
                </div>
                <div class="total-amount">
                  \${{ formatNumber(montoFinalCalculado()) }}
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-secondary" (click)="closeInscribirModal()">Cancelar</button>
              <button
                class="btn-primary"
                [disabled]="isSubmitting() || !nombreJugador() || !nombreAcudiente() || !telefonoAcudiente()"
                (click)="submitInscripcion()"
              >
                <i class="fa-solid fa-shield-check" *ngIf="!isSubmitting()"></i>
                <i class="fa-solid fa-spinner fa-spin" *ngIf="isSubmitting()"></i>
                {{ isSubmitting() ? 'Procesando Pago Seguro...' : 'Confirmar & Pagar $' + formatNumber(montoFinalCalculado()) }}
              </button>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- MODAL 2: VER PARTICIPANTES INSCRITOS                         -->
      <!-- ============================================================ -->
      <div class="modal-overlay modal-backdrop" *ngIf="showParticipantesModal()" (click)="closeParticipantesModal()">
        <div class="modal-dialog modal-card fut-card modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-group modal-title-wrap">
              <div class="modal-badge-icon modal-icon-badge bg-blue-glow">
                <i class="fa-solid fa-users"></i>
              </div>
              <div class="modal-title-text">
                <h2 class="modal-title">Participantes Inscritos</h2>
                <p class="modal-sub modal-subtitle">
                  Clínica: <strong>{{ selectedServicio()?.titulo }}</strong> • <strong>{{ inscripcionesList().length }}</strong> inscritos confirmados
                </p>
              </div>
            </div>
            <button class="btn-close-modal modal-close-btn btn-close" (click)="closeParticipantesModal()" aria-label="Cerrar">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body">
            <div *ngIf="inscripcionesList().length > 0; else noInscritos" class="fut-table-container">
              <table class="fut-table">
                <thead>
                  <tr>
                    <th>Atleta</th>
                    <th>Acudiente / Contacto</th>
                    <th>Plan</th>
                    <th>Monto Pagado</th>
                    <th>Método de Pago</th>
                    <th>Ticket / Pase QR</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let inc of inscripcionesList()">
                    <td>
                      <div class="player-cell">
                        <i class="fa-solid fa-circle-user text-emerald player-cell-icon"></i>
                        <strong class="player-cell-name">{{ inc.nombre_jugador }}</strong>
                      </div>
                    </td>
                    <td>
                      <div class="guardian-name">{{ inc.nombre_acudiente }}</div>
                      <small class="text-muted"><i class="fa-brands fa-whatsapp text-emerald"></i> {{ inc.telefono_acudiente }}</small>
                    </td>
                    <td>
                      <span class="badge-plan" [class.badge-plan-bundle]="inc.tipo_plan === 'PAQUETE_MENSUAL'">
                        {{ inc.tipo_plan === 'PAQUETE_MENSUAL' ? 'Paquete Mes' : 'Sesión Única' }}
                      </span>
                    </td>
                    <td>
                      <span class="text-emerald font-bold text-base">\${{ formatNumber(inc.monto_pagado) }}</span>
                    </td>
                    <td>
                      <span class="badge-payment">{{ inc.metodo_pago }}</span>
                    </td>
                    <td>
                      <span class="qr-token"><i class="fa-solid fa-qrcode"></i> {{ inc.codigo_qr_ticket?.substring(0, 14) }}...</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ng-template #noInscritos>
              <div class="empty-state-mini">
                <i class="fa-solid fa-user-plus empty-mini-icon"></i>
                <h4>Aún no hay participantes registrados</h4>
                <p>Comparte la clínica en WhatsApp para abrir las primeras inscripciones.</p>
              </div>
            </ng-template>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeParticipantesModal()">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- MODAL 3: CREAR NUEVA CLÍNICA O PROGRAMA                      -->
      <!-- ============================================================ -->
      <div class="modal-overlay modal-backdrop" *ngIf="showCrearModal()" (click)="closeCrearModal()">
        <div class="modal-dialog modal-card fut-card modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="modal-title-group modal-title-wrap">
              <div class="modal-badge-icon modal-icon-badge bg-emerald-glow">
                <i class="fa-solid fa-plus-circle"></i>
              </div>
              <div class="modal-title-text">
                <h2 class="modal-title">Crear Nueva Clínica Especializada</h2>
                <p class="modal-sub modal-subtitle">Diseña un programa intensivo de micro-habilidades y monetiza las tardes/fines de semana</p>
              </div>
            </div>
            <button class="btn-close-modal modal-close-btn btn-close" (click)="closeCrearModal()" aria-label="Cerrar">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group full-width">
                <label class="sport-label">
                  <i class="fa-solid fa-heading text-emerald"></i> Título del Programa / Masterclass <span class="required-star">*</span>
                </label>
                <input
                  type="text"
                  [ngModel]="nuevoTitulo()"
                  (ngModelChange)="nuevoTitulo.set($event)"
                  placeholder="ej. Potencia de Salto & Cabezazo Defensivo"
                  class="sport-input"
                />
              </div>

              <div class="form-group full-width">
                <label class="sport-label">
                  <i class="fa-solid fa-bullseye text-cyan"></i> Subtítulo / Objetivo Central <span class="required-star">*</span>
                </label>
                <input
                  type="text"
                  [ngModel]="nuevoSubtitulo()"
                  (ngModelChange)="nuevoSubtitulo.set($event)"
                  placeholder="ej. Técnica de salto vertical con timming y despejes aéreos"
                  class="sport-input"
                />
              </div>

              <div class="form-group">
                <label class="sport-label">
                  <i class="fa-solid fa-layer-group text-amber"></i> Categoría Especializada <span class="required-star">*</span>
                </label>
                <select
                  [ngModel]="nuevaCategoria()"
                  (ngModelChange)="nuevaCategoria.set($event)"
                  class="sport-input sport-select"
                >
                  <option value="VELOCIDAD_EXPLOSIVIDAD">⚡ Velocidad & Explosividad</option>
                  <option value="COORDINACION_AGILIDAD">🧠 Coordinación & Neuro-Motricidad</option>
                  <option value="TECNICA_REGATE">🪄 Técnica de Regate & 1v1</option>
                  <option value="ARQUEROS_ELITE">🧤 Arqueros de Élite</option>
                  <option value="DEFINICION_TIRO">🎯 Definición & Tiro Libre</option>
                  <option value="PREVENCION_FISICA">🛡️ Fuerza & Prevención de Lesiones</option>
                </select>
              </div>

              <div class="form-group">
                <label class="sport-label">
                  <i class="fa-solid fa-chalkboard-user text-purple"></i> Entrenador Responsable <span class="required-star">*</span>
                </label>
                <input
                  type="text"
                  [ngModel]="nuevoEntrenador()"
                  (ngModelChange)="nuevoEntrenador.set($event)"
                  placeholder="ej. Prof. Iván Ramiro Córdoba"
                  class="sport-input"
                />
              </div>

              <div class="form-group">
                <label class="sport-label">
                  <i class="fa-solid fa-location-dot text-emerald"></i> Cancha / Escenario Cartagena <span class="required-star">*</span>
                </label>
                <input
                  type="text"
                  [ngModel]="nuevaCanchaNombre()"
                  (ngModelChange)="nuevaCanchaNombre.set($event)"
                  placeholder="ej. Cancha Sintética Pie de la Popa"
                  class="sport-input"
                />
              </div>

              <div class="form-group">
                <label class="sport-label">
                  <i class="fa-solid fa-map-location-dot text-cyan"></i> Dirección en Cartagena <span class="required-star">*</span>
                </label>
                <input
                  type="text"
                  [ngModel]="nuevaCanchaDireccion()"
                  (ngModelChange)="nuevaCanchaDireccion.set($event)"
                  placeholder="ej. Calle 30 con Carrera 21, Pie de la Popa"
                  class="sport-input"
                />
              </div>

              <div class="form-group">
                <label class="sport-label">
                  <i class="fa-solid fa-calendar-days text-amber"></i> Días de Entrenamiento <span class="required-star">*</span>
                </label>
                <input
                  type="text"
                  [ngModel]="nuevosDias()"
                  (ngModelChange)="nuevosDias.set($event)"
                  placeholder="ej. Martes y Jueves"
                  class="sport-input"
                />
              </div>

              <div class="form-group">
                <label class="sport-label">
                  <i class="fa-solid fa-clock text-pink"></i> Horario <span class="required-star">*</span>
                </label>
                <input
                  type="text"
                  [ngModel]="nuevoHorario()"
                  (ngModelChange)="nuevoHorario.set($event)"
                  placeholder="ej. 05:00 PM - 06:30 PM"
                  class="sport-input"
                />
              </div>

              <div class="form-group">
                <label class="sport-label">
                  <i class="fa-solid fa-users text-emerald"></i> Cupos Máximos <span class="required-star">*</span>
                </label>
                <input
                  type="number"
                  [ngModel]="nuevosCupos()"
                  (ngModelChange)="nuevosCupos.set($event)"
                  placeholder="15"
                  class="sport-input"
                />
              </div>

              <div class="form-group">
                <label class="sport-label">
                  <i class="fa-solid fa-award text-amber"></i> Insignia Digital al Graduarse <span class="required-star">*</span>
                </label>
                <input
                  type="text"
                  [ngModel]="nuevaInsignia()"
                  (ngModelChange)="nuevaInsignia.set($event)"
                  placeholder="ej. 🛡️ Torre Aérea Infranqueable"
                  class="sport-input"
                />
              </div>

              <div class="form-group">
                <label class="sport-label">
                  <i class="fa-solid fa-tag text-cyan"></i> Precio Sesión Individual ($ COP) <span class="required-star">*</span>
                </label>
                <input
                  type="number"
                  [ngModel]="nuevoPrecioIndividual()"
                  (ngModelChange)="nuevoPrecioIndividual.set($event)"
                  placeholder="38000"
                  class="sport-input"
                />
              </div>

              <div class="form-group">
                <label class="sport-label">
                  <i class="fa-solid fa-box-archive text-emerald"></i> Precio Paquete Mensual ($ COP) <span class="required-star">*</span>
                </label>
                <input
                  type="number"
                  [ngModel]="nuevoPrecioMensual()"
                  (ngModelChange)="nuevoPrecioMensual.set($event)"
                  placeholder="145000"
                  class="sport-input"
                />
              </div>

              <div class="form-group full-width">
                <label class="sport-label">
                  <i class="fa-solid fa-align-left text-purple"></i> Descripción Detallada <span class="required-star">*</span>
                </label>
                <textarea
                  [ngModel]="nuevaDescripcion()"
                  (ngModelChange)="nuevaDescripcion.set($event)"
                  rows="3"
                  placeholder="Describe la metodología, tecnología a usar y dinámica de las sesiones..."
                  class="sport-input sport-textarea"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeCrearModal()">Cancelar</button>
            <button
              class="btn-primary"
              [disabled]="isSaving() || !nuevoTitulo() || !nuevoEntrenador() || !nuevaCanchaNombre()"
              (click)="submitCrearServicio()"
            >
              <i class="fa-solid fa-check" *ngIf="!isSaving()"></i>
              <i class="fa-solid fa-spinner fa-spin" *ngIf="isSaving()"></i>
              {{ isSaving() ? 'Creando Programa...' : 'Publicar Clínica Especializada' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .servicios-page {
      padding: 1.5rem;
      max-width: 1440px;
      margin: 0 auto;
      color: var(--text-main, #0f172a);
    }

    /* PROMO HERO */
    .page-hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08));
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.2);
      color: #059669;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    [data-theme="dark"] .hero-badge,
    body.dark-theme .hero-badge {
      color: #10b981;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin: 0 0 0.5rem 0;
      color: var(--text-heading, #0f172a);
    }

    .page-subtitle {
      font-size: 0.95rem;
      color: var(--text-muted, #64748b);
      max-width: 800px;
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }

    .hero-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .hero-tag {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      color: var(--text-heading, #0f172a);
      padding: 0.35rem 0.75rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }

    .btn-create {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      padding: 0.85rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-create:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
    }

    /* KPIS GRID */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .kpi-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;
      border-radius: 14px;
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      box-shadow: var(--shadow-card, 0 1px 3px rgba(0, 0, 0, 0.05));
    }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
    }

    .bg-emerald-glow { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .bg-amber-glow { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .bg-blue-glow { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
    .bg-purple-glow { background: rgba(168, 85, 247, 0.15); color: #a855f7; }

    .kpi-num {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-heading, #0f172a);
    }

    .kpi-label {
      font-size: 0.8rem;
      color: var(--text-muted, #64748b);
      font-weight: 600;
    }

    /* FILTERS */
    .filters-container {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 14px;
      padding: 1.25rem;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: var(--shadow-card, 0 1px 3px rgba(0, 0, 0, 0.05));
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-muted, #94a3b8);
      pointer-events: none;
    }

    .search-box input.search-input {
      padding-left: 2.75rem;
      padding-right: 2.5rem;
      width: 100%;
      height: 44px;
    }

    .btn-clear {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      color: var(--text-muted, #94a3b8);
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
    }

    .category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .chip-btn {
      background: var(--bg-surface, #f1f5f9);
      border: 1px solid var(--border-color, #e2e8f0);
      color: var(--text-muted, #64748b);
      padding: 0.5rem 1rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
    }

    .chip-btn:hover {
      background: var(--bg-card-hover, #e2e8f0);
      color: var(--text-heading, #0f172a);
    }

    .chip-btn.active {
      background: rgba(16, 185, 129, 0.15);
      border-color: #10b981;
      color: #047857;
      font-weight: 700;
    }

    [data-theme="dark"] .chip-btn.active,
    body.dark-theme .chip-btn.active {
      color: #10b981;
    }

    .chip-btn.chip-cyan.active {
      background: rgba(6, 182, 212, 0.15);
      border-color: #06b6d4;
      color: #0e7490;
    }

    .chip-btn.chip-amber.active {
      background: rgba(245, 158, 11, 0.15);
      border-color: #f59e0b;
      color: #b45309;
    }

    .chip-btn.chip-pink.active {
      background: rgba(236, 72, 153, 0.15);
      border-color: #ec4899;
      color: #be185d;
    }

    .chip-btn.chip-purple.active {
      background: rgba(139, 92, 246, 0.15);
      border-color: #8b5cf6;
      color: #6d28d9;
    }

    /* SERVICIOS GRID */
    .servicios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }

    .servicio-card {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-top: 4px solid #10b981;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: var(--shadow-card, 0 1px 3px rgba(0, 0, 0, 0.05));
    }

    .servicio-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
    }

    .card-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cat-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.75rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-edad {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted, #64748b);
      background: var(--bg-surface, #f1f5f9);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
    }

    .servicio-title {
      font-size: 1.25rem;
      font-weight: 800;
      line-height: 1.3;
      margin: 0;
      color: var(--text-heading, #0f172a);
    }

    .servicio-sub {
      font-size: 0.88rem;
      color: var(--text-muted, #64748b);
      line-height: 1.45;
      margin: 0;
    }

    /* COACH BOX */
    .coach-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--bg-surface, #f8fafc);
      padding: 0.6rem 0.85rem;
      border-radius: 10px;
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .coach-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(16, 185, 129, 0.3);
    }

    .coach-name {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--text-heading, #0f172a);
    }

    .coach-badge {
      font-size: 0.75rem;
      color: var(--text-muted, #64748b);
    }

    /* VENUE */
    .venue-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.82rem;
    }

    .venue-item, .schedule-item {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
    }

    .venue-icon, .schedule-icon {
      margin-top: 0.2rem;
      font-size: 0.95rem;
    }

    .venue-text {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .venue-name {
      font-weight: 700;
      color: var(--text-heading, #0f172a);
    }

    .venue-dir {
      font-size: 0.75rem;
      color: var(--text-muted, #64748b);
    }

    .btn-gps {
      background: rgba(16, 185, 129, 0.15);
      color: #059669;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    [data-theme="dark"] .btn-gps,
    body.dark-theme .btn-gps {
      color: #10b981;
    }

    .schedule-days {
      font-weight: 700;
      color: var(--text-heading, #0f172a);
      margin-right: 0.4rem;
    }

    .schedule-time {
      color: var(--text-muted, #64748b);
    }

    /* CUPOS */
    .cupos-section {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .cupos-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
    }

    .cupos-text {
      color: var(--text-muted, #64748b);
    }

    .cupos-badge {
      background: rgba(16, 185, 129, 0.15);
      color: #047857;
      font-weight: 700;
      font-size: 0.72rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    [data-theme="dark"] .cupos-badge,
    body.dark-theme .cupos-badge {
      color: #10b981;
    }

    .cupos-badge.cupos-low {
      background: rgba(239, 68, 68, 0.15);
      color: #dc2626;
      animation: pulse 2s infinite;
    }

    .progress-track {
      height: 6px;
      background: var(--bg-surface, #e2e8f0);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    /* REWARD */
    .reward-box {
      background: rgba(245, 158, 11, 0.08);
      border: 1px dashed rgba(245, 158, 11, 0.35);
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
    }

    .reward-title {
      font-size: 0.75rem;
      color: var(--text-muted, #64748b);
      margin-bottom: 0.25rem;
    }

    .reward-pill {
      font-weight: 700;
      font-size: 0.82rem;
      color: #b45309;
    }

    [data-theme="dark"] .reward-pill,
    body.dark-theme .reward-pill {
      color: #f59e0b;
    }

    /* BENEFITS */
    .benefits-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.8rem;
      color: var(--text-muted, #64748b);
    }

    .benefits-list li {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    /* PRICING & ACTIONS */
    .card-footer {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color, #e2e8f0);
    }

    .pricing-box {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .price-single {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--text-muted, #64748b);
    }

    .price-bundle {
      display: flex;
      flex-direction: column;
    }

    .p-label {
      font-size: 0.78rem;
      color: var(--text-muted, #64748b);
      font-weight: 500;
    }

    .p-val-big {
      font-size: 1.35rem;
      font-weight: 800;
      color: #10b981;
    }

    .p-discount {
      font-size: 0.72rem;
      color: #d97706;
      font-weight: 700;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-inscribir {
      flex: 1;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      padding: 0.75rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }

    .btn-inscribir:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
    }

    .btn-inscribir:disabled {
      background: var(--bg-surface, #e2e8f0);
      color: var(--text-muted, #94a3b8);
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-participantes {
      background: var(--bg-surface, #f1f5f9);
      border: 1px solid var(--border-color, #cbd5e1);
      color: var(--text-heading, #0f172a);
      padding: 0.75rem 0.9rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-participantes:hover {
      background: var(--bg-card-hover, #e2e8f0);
    }

    /* ============================================================ */
    /* MODAL SYSTEM (LUXURY SPORTS SAAS HIGH-CONTRAST DESIGN)       */
    /* ============================================================ */
    .modal-overlay,
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-dialog,
    .modal-card {
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: 20px;
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      position: relative;
    }

    .modal-header {
      padding: 1.25rem 1.75rem;
      background: var(--bg-surface, #f8fafc);
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .modal-title-group,
    .modal-title-wrap {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 0;
      flex: 1;
    }

    .modal-badge-icon,
    .modal-icon-badge {
      width: 46px;
      height: 46px;
      min-width: 46px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .modal-title-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
      flex: 1;
    }

    .modal-title {
      font-size: 1.3rem;
      font-weight: 800;
      margin: 0;
      color: var(--text-heading, #0f172a);
      letter-spacing: -0.02em;
      line-height: 1.25;
    }

    .modal-sub,
    .modal-subtitle {
      font-size: 0.85rem;
      color: var(--text-muted, #64748b);
      margin: 0;
      font-weight: 500;
      line-height: 1.35;
    }

    .modal-sub strong,
    .modal-subtitle strong {
      color: var(--text-heading, #0f172a);
      font-weight: 700;
    }

    .btn-close-modal,
    .modal-close-btn {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: 10px;
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-color, #e2e8f0);
      color: var(--text-muted, #64748b);
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-close-modal:hover,
    .modal-close-btn:hover {
      background: var(--bg-card-hover, #f1f5f9);
      color: var(--text-heading, #0f172a);
    }

    .modal-body {
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: var(--bg-card, #ffffff);
      overflow-y: auto;
      max-height: calc(85vh - 140px);
    }

    .modal-footer {
      padding: 1.25rem 1.75rem;
      background: var(--bg-surface, #f8fafc);
      border-top: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    /* ============================================================ */
    /* PLAN SELECTOR (RADIO CARDS)                                  */
    /* ============================================================ */
    .plan-selector {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .plan-option {
      background: var(--bg-surface, #f8fafc);
      border: 2px solid var(--border-color, #e2e8f0);
      border-radius: 14px;
      padding: 1.15rem 1.35rem;
      display: flex;
      align-items: center;
      gap: 1.15rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .plan-option:hover {
      border-color: #10b981;
      background: var(--bg-card, #ffffff);
      transform: translateY(-1px);
    }

    .plan-option.selected {
      background: rgba(16, 185, 129, 0.06);
      border-color: #10b981;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
    }

    .plan-radio {
      font-size: 1.35rem;
      display: flex;
      align-items: center;
    }

    .plan-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .plan-header-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .plan-name {
      font-weight: 800;
      font-size: 1rem;
      color: var(--text-heading, #0f172a);
    }

    .plan-badge-popular {
      background: rgba(245, 158, 11, 0.15);
      color: #b45309;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    [data-theme="dark"] .plan-badge-popular,
    body.dark-theme .plan-badge-popular {
      color: #f59e0b;
    }

    .plan-desc {
      font-size: 0.82rem;
      color: var(--text-muted, #64748b);
      line-height: 1.4;
    }

    .plan-price-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .plan-price {
      font-size: 1.35rem;
      font-weight: 900;
      color: #10b981;
      letter-spacing: -0.02em;
    }

    .plan-period {
      font-size: 0.72rem;
      color: var(--text-muted, #64748b);
      font-weight: 600;
    }

    /* ============================================================ */
    /* FORM GRID & CONTROLS                                         */
    /* ============================================================ */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.15rem;
    }

    @media (max-width: 640px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .sport-label {
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--text-heading, #0f172a);
      margin-bottom: 0.45rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .required-star {
      color: #dc2626;
      font-weight: 800;
    }

    .sport-input {
      width: 100%;
      height: 44px;
      min-height: 44px;
      background: var(--bg-input, #f8fafc);
      border: 1.5px solid var(--border-color, #cbd5e1);
      border-radius: 10px;
      padding: 0.6rem 0.95rem;
      color: var(--text-main, #0f172a);
      font-size: 0.9rem;
      font-weight: 500;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
      display: block;
    }

    .sport-input:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      background: var(--bg-card, #ffffff);
    }

    .sport-input::placeholder {
      color: var(--text-dim, #94a3b8);
      font-weight: 400;
    }

    .sport-select {
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      padding-right: 2.25rem;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.85rem center;
      background-size: 1rem 1rem;
    }

    .sport-textarea {
      height: auto;
      min-height: 90px;
      resize: vertical;
      font-family: inherit;
      line-height: 1.45;
    }

    /* ============================================================ */
    /* BROTHER DISCOUNT BANNER                                      */
    /* ============================================================ */
    .discount-toggle {
      background: rgba(245, 158, 11, 0.08);
      border: 1.5px solid rgba(245, 158, 11, 0.35);
      padding: 0.9rem 1.15rem;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .discount-toggle.active {
      background: rgba(245, 158, 11, 0.15);
      border-color: #f59e0b;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin-top: 0.2rem;
      accent-color: #f59e0b;
      cursor: pointer;
    }

    .discount-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .discount-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #92400e;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    [data-theme="dark"] .discount-title,
    body.dark-theme .discount-title {
      color: #fbbf24;
    }

    .discount-pill {
      background: #f59e0b;
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    .discount-desc {
      font-size: 0.78rem;
      color: #78350f;
      margin: 0;
      line-height: 1.35;
    }

    [data-theme="dark"] .discount-desc,
    body.dark-theme .discount-desc {
      color: #fcd34d;
    }

    /* ============================================================ */
    /* PAYMENT METHODS GRID                                         */
    /* ============================================================ */
    .payment-method-section {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .pay-methods-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    @media (max-width: 540px) {
      .pay-methods-grid {
        grid-template-columns: 1fr;
      }
    }

    .pay-method-card {
      background: var(--bg-surface, #f8fafc);
      border: 1.5px solid var(--border-color, #e2e8f0);
      border-radius: 12px;
      padding: 0.85rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .pay-method-card:hover {
      border-color: #10b981;
      background: var(--bg-card, #ffffff);
    }

    .pay-method-card.active {
      background: rgba(16, 185, 129, 0.12);
      border-color: #10b981;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    }

    .pay-icon {
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .pay-text {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .pay-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-heading, #0f172a);
    }

    .pay-sub {
      font-size: 0.72rem;
      color: var(--text-muted, #64748b);
    }

    .pay-check {
      color: #10b981;
      font-size: 1.1rem;
    }

    /* ============================================================ */
    /* TOTAL BAR                                                    */
    /* ============================================================ */
    .total-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-surface, #f8fafc);
      padding: 1.15rem 1.4rem;
      border-radius: 14px;
      border: 1.5px solid var(--border-color, #e2e8f0);
    }

    .total-text {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .total-label {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--text-heading, #0f172a);
    }

    .total-sub {
      font-size: 0.76rem;
      color: var(--text-muted, #64748b);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .total-amount {
      font-size: 1.75rem;
      font-weight: 900;
      color: #10b981;
      letter-spacing: -0.02em;
    }

    /* ============================================================ */
    /* BUTTONS                                                      */
    /* ============================================================ */
    .btn-primary {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      padding: 0.75rem 1.4rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
      transition: all 0.2s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-secondary {
      background: var(--bg-surface, #f1f5f9);
      border: 1px solid var(--border-color, #cbd5e1);
      color: var(--text-heading, #0f172a);
      padding: 0.75rem 1.4rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      background: var(--bg-card-hover, #e2e8f0);
    }

    .btn-whatsapp {
      background: #25d366;
      color: #ffffff;
      border: none;
      padding: 0.75rem 1.4rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.3);
      transition: all 0.2s ease;
    }

    .btn-whatsapp:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
    }

    /* ============================================================ */
    /* DIGITAL PASS TICKET (SUCCESS STATE)                          */
    /* ============================================================ */
    .ticket-pass-container {
      padding: 1.5rem;
    }

    .ticket-card {
      background: var(--bg-card, #ffffff);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--border-color, #e2e8f0);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .ticket-header {
      padding: 1.15rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #ffffff;
      font-weight: 800;
      font-size: 0.88rem;
    }

    .ticket-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .ticket-title {
      font-size: 1.35rem;
      font-weight: 800;
      margin: 0;
      color: var(--text-heading, #0f172a);
    }

    .ticket-meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      background: var(--bg-surface, #f8fafc);
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .meta-cell {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .t-label {
      font-size: 0.75rem;
      color: var(--text-muted, #64748b);
      font-weight: 600;
    }

    .t-val {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--text-heading, #0f172a);
    }

    .qr-box {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: var(--bg-surface, #f8fafc);
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px dashed var(--border-color, #cbd5e1);
    }

    .qr-mock {
      width: 80px;
      height: 80px;
      min-width: 80px;
      background: #0f172a;
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.8rem;
    }

    .qr-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .qr-code-text {
      font-family: monospace;
      font-size: 1rem;
      font-weight: 800;
      color: #059669;
    }

    [data-theme="dark"] .qr-code-text,
    body.dark-theme .qr-code-text {
      color: #10b981;
    }

    .qr-ref {
      font-size: 0.78rem;
      color: var(--text-muted, #64748b);
      font-weight: 600;
    }

    .qr-note {
      font-size: 0.75rem;
      color: var(--text-muted, #64748b);
      margin: 0.35rem 0 0 0;
    }

    .ticket-footer {
      padding: 1.15rem 1.5rem;
      background: var(--bg-surface, #f8fafc);
      border-top: 1px solid var(--border-color, #e2e8f0);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    /* ============================================================ */
    /* PARTICIPANTS TABLE & LIST                                    */
    /* ============================================================ */
    .fut-table-container {
      width: 100%;
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid var(--border-color, #e2e8f0);
      background: var(--bg-card, #ffffff);
    }

    .fut-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    .fut-table th {
      background: var(--bg-surface, #f8fafc);
      color: var(--text-muted, #64748b);
      font-weight: 700;
      padding: 0.85rem 1.15rem;
      border-bottom: 1px solid var(--border-color, #e2e8f0);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .fut-table td {
      padding: 0.95rem 1.15rem;
      border-bottom: 1px solid var(--border-color, #f1f5f9);
      color: var(--text-main, #0f172a);
      vertical-align: middle;
    }

    .fut-table tbody tr:last-child td {
      border-bottom: none;
    }

    .fut-table tbody tr:hover {
      background: var(--bg-surface, #f8fafc);
    }

    .player-cell {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .player-cell-icon {
      font-size: 1.25rem;
    }

    .player-cell-name {
      font-weight: 700;
      color: var(--text-heading, #0f172a);
    }

    .guardian-name {
      font-weight: 600;
      color: var(--text-heading, #0f172a);
    }

    .badge-plan {
      background: rgba(59, 130, 246, 0.12);
      color: #2563eb;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      display: inline-block;
    }

    .badge-plan-bundle {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
    }

    .badge-payment {
      background: var(--bg-surface, #f1f5f9);
      border: 1px solid var(--border-color, #e2e8f0);
      color: var(--text-muted, #64748b);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .qr-token {
      font-family: monospace;
      font-size: 0.78rem;
      font-weight: 700;
      background: var(--bg-surface, #f1f5f9);
      color: #059669;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      border: 1px solid var(--border-color, #e2e8f0);
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    [data-theme="dark"] .qr-token,
    body.dark-theme .qr-token {
      color: #10b981;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--bg-card, #ffffff);
      border-radius: 16px;
      border: 1px solid var(--border-color, #e2e8f0);
    }

    .empty-icon {
      font-size: 3rem;
      color: var(--text-muted, #94a3b8);
      margin-bottom: 1rem;
    }

    .empty-state-mini {
      text-align: center;
      padding: 3rem 1.5rem;
      color: var(--text-muted, #64748b);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .empty-mini-icon {
      font-size: 2.5rem;
      color: var(--text-dim, #94a3b8);
      margin-bottom: 0.5rem;
    }

    .empty-state-mini h4 {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-heading, #0f172a);
    }

    .empty-state-mini p {
      font-size: 0.85rem;
      margin: 0;
      max-width: 400px;
    }

    .text-emerald { color: #10b981; }
    .text-cyan { color: #06b6d4; }
    .text-amber { color: #f59e0b; }
    .text-pink { color: #ec4899; }
    .text-purple { color: #8b5cf6; }
    .text-muted { color: var(--text-muted, #64748b); }
    .font-bold { font-weight: 700; }
  `]
})
export class ServiciosComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face';

  // Signals
  servicios = signal<ServicioEspecializado[]>([]);
  searchQuery = signal<string>('');
  selectedCategoria = signal<string>('TODAS');

  // Modal States
  showInscribirModal = signal<boolean>(false);
  showParticipantesModal = signal<boolean>(false);
  showCrearModal = signal<boolean>(false);
  selectedServicio = signal<ServicioEspecializado | null>(null);
  inscripcionesList = signal<any[]>([]);

  // Checkout Form State
  tipoPlan = signal<'PAQUETE_MENSUAL' | 'SESION_INDIVIDUAL'>('PAQUETE_MENSUAL');
  nombreJugador = signal<string>('');
  nombreAcudiente = signal<string>('');
  telefonoAcudiente = signal<string>('');
  emailAcudiente = signal<string>('');
  aplicaDescuentoHermano = signal<boolean>(false);
  metodoPago = signal<string>('WOMPI_PSE');
  isSubmitting = signal<boolean>(false);
  ticketGenerated = signal<boolean>(false);
  ticketData = signal<any>(null);

  // New Clinic Form State
  nuevoTitulo = signal<string>('');
  nuevoSubtitulo = signal<string>('');
  nuevaCategoria = signal<string>('VELOCIDAD_EXPLOSIVIDAD');
  nuevoEntrenador = signal<string>('');
  nuevaCanchaNombre = signal<string>('');
  nuevaCanchaDireccion = signal<string>('');
  nuevosDias = signal<string>('Martes y Jueves');
  nuevoHorario = signal<string>('04:30 PM - 06:00 PM');
  nuevosCupos = signal<number>(15);
  nuevaInsignia = signal<string>('');
  nuevoPrecioIndividual = signal<number>(38000);
  nuevoPrecioMensual = signal<number>(145000);
  nuevaDescripcion = signal<string>('');
  isSaving = signal<boolean>(false);

  // Computed
  filteredServicios = computed(() => {
    let list = this.servicios();
    const cat = this.selectedCategoria();
    const query = this.searchQuery().toLowerCase().trim();

    if (cat !== 'TODAS') {
      list = list.filter(s => s.categoria_servicio === cat);
    }

    if (query) {
      list = list.filter(s =>
        s.titulo.toLowerCase().includes(query) ||
        s.subtitulo.toLowerCase().includes(query) ||
        s.entrenador_nombre.toLowerCase().includes(query) ||
        s.cancha_nombre.toLowerCase().includes(query)
      );
    }

    return list;
  });

  totalCuposOcupados = computed(() => {
    return this.servicios().reduce((acc, s) => acc + Number(s.cupos_ocupados || 0), 0);
  });

  totalCuposDisponibles = computed(() => {
    return this.servicios().reduce((acc, s) => acc + Number(s.cupos_totales || 0), 0);
  });

  porcentajeOcupacion = computed(() => {
    const tot = this.totalCuposDisponibles();
    if (tot === 0) return 0;
    return Math.round((this.totalCuposOcupados() / tot) * 100);
  });

  montoFinalCalculado = computed(() => {
    const s = this.selectedServicio();
    if (!s) return 0;
    let base = this.tipoPlan() === 'PAQUETE_MENSUAL'
      ? Number(s.precio_paquete_mensual)
      : Number(s.precio_sesion_individual);

    if (this.aplicaDescuentoHermano() && s.descuento_hermanos_pct) {
      base = base * (1 - (s.descuento_hermanos_pct / 100));
    }
    return Math.round(base);
  });

  ngOnInit() {
    this.cargarServicios();
  }

  cargarServicios() {
    this.api.getServicios().subscribe({
      next: (data) => {
        this.servicios.set(data || []);
      },
      error: (err) => {
        console.error('Error al cargar servicios especializados:', err);
      }
    });
  }

  getCategoriaLabel(cat: string): string {
    switch (cat) {
      case 'VELOCIDAD_EXPLOSIVIDAD': return '⚡ Velocidad & Sprint';
      case 'COORDINACION_AGILIDAD': return '🧠 Neuro-Motricidad';
      case 'TECNICA_REGATE': return '🪄 Regate 1v1 Pro';
      case 'ARQUEROS_ELITE': return '🧤 Guante de Oro';
      case 'DEFINICION_TIRO': return '🎯 Definición & Gol';
      case 'PREVENCION_FISICA': return '🛡️ Fuerza & Prevención';
      default: return 'Clínica Pro';
    }
  }

  formatNumber(val: any): string {
    if (!val) return '0';
    return Number(val).toLocaleString('es-CO');
  }

  resetFilters() {
    this.selectedCategoria.set('TODAS');
    this.searchQuery.set('');
  }

  // --- MODAL INSCRIBIRSE ---
  openInscribirModal(servicio: ServicioEspecializado) {
    this.selectedServicio.set(servicio);
    this.tipoPlan.set('PAQUETE_MENSUAL');
    this.nombreJugador.set('');
    this.nombreAcudiente.set('');
    this.telefonoAcudiente.set('');
    this.emailAcudiente.set('');
    this.aplicaDescuentoHermano.set(false);
    this.ticketGenerated.set(false);
    this.ticketData.set(null);
    this.showInscribirModal.set(true);
  }

  closeInscribirModal() {
    this.showInscribirModal.set(false);
    this.selectedServicio.set(null);
    this.ticketGenerated.set(false);
    this.ticketData.set(null);
  }

  submitInscripcion() {
    const s = this.selectedServicio();
    if (!s) return;

    this.isSubmitting.set(true);

    const dto = {
      nombre_jugador: this.nombreJugador(),
      nombre_acudiente: this.nombreAcudiente(),
      telefono_acudiente: this.telefonoAcudiente(),
      email_acudiente: this.emailAcudiente(),
      tipo_plan: this.tipoPlan(),
      monto_pagado: this.montoFinalCalculado(),
      metodo_pago: this.metodoPago(),
    };

    this.api.inscribirServicio(s.id, dto).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.ticketGenerated.set(true);
        this.ticketData.set(res.inscripcion || res);
        this.cargarServicios(); // Refrescar cupos
      },
      error: (err) => {
        this.isSubmitting.set(false);
        alert(err?.error?.message || 'Ocurrió un error al procesar la inscripción');
      }
    });
  }

  shareWhatsApp() {
    const s = this.selectedServicio();
    const t = this.ticketData();
    if (!s || !t) return;

    const text = encodeURIComponent(
      `⚽ *Pase Digital SportCoreOS*\n` +
      `Clínica: *${s.titulo}*\n` +
      `Atleta: ${t.nombre_jugador}\n` +
      `Cancha: ${s.cancha_nombre}\n` +
      `Horario: ${s.dias_semana} (${s.horario_rango})\n` +
      `Ticket Pass: ${t.codigo_qr_ticket}\n` +
      `Ref: ${t.referencia_transaccion}`
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  // --- MODAL PARTICIPANTES ---
  openParticipantesModal(servicio: ServicioEspecializado) {
    this.selectedServicio.set(servicio);
    this.api.getInscripcionesServicio(servicio.id).subscribe({
      next: (data) => {
        this.inscripcionesList.set(data || []);
        this.showParticipantesModal.set(true);
      },
      error: (err) => {
        console.error('Error al cargar inscripciones:', err);
        this.inscripcionesList.set([]);
        this.showParticipantesModal.set(true);
      }
    });
  }

  closeParticipantesModal() {
    this.showParticipantesModal.set(false);
    this.selectedServicio.set(null);
    this.inscripcionesList.set([]);
  }

  // --- MODAL CREAR ---
  openCrearModal() {
    this.nuevoTitulo.set('');
    this.nuevoSubtitulo.set('');
    this.nuevaCategoria.set('VELOCIDAD_EXPLOSIVIDAD');
    this.nuevoEntrenador.set('');
    this.nuevaCanchaNombre.set('');
    this.nuevaCanchaDireccion.set('');
    this.nuevosDias.set('Martes y Jueves');
    this.nuevoHorario.set('04:30 PM - 06:00 PM');
    this.nuevosCupos.set(15);
    this.nuevaInsignia.set('');
    this.nuevoPrecioIndividual.set(38000);
    this.nuevoPrecioMensual.set(145000);
    this.nuevaDescripcion.set('');
    this.showCrearModal.set(true);
  }

  closeCrearModal() {
    this.showCrearModal.set(false);
  }

  submitCrearServicio() {
    if (!this.nuevoTitulo() || !this.nuevoEntrenador() || !this.nuevaCanchaNombre()) {
      alert('Por favor completa todos los campos requeridos (*)');
      return;
    }

    this.isSaving.set(true);

    const dto = {
      titulo: this.nuevoTitulo(),
      subtitulo: this.nuevoSubtitulo(),
      categoria_servicio: this.nuevaCategoria(),
      entrenador_nombre: this.nuevoEntrenador(),
      cancha_nombre: this.nuevaCanchaNombre(),
      cancha_direccion: this.nuevaCanchaDireccion(),
      dias_semana: this.nuevosDias(),
      horario_rango: this.nuevoHorario(),
      cupos_totales: Number(this.nuevosCupos()) || 15,
      insignia_obtenida: this.nuevaInsignia() || '🏅 Atleta Élite Graduado',
      precio_sesion_individual: Number(this.nuevoPrecioIndividual()) || 35000,
      precio_paquete_mensual: Number(this.nuevoPrecioMensual()) || 140000,
      descripcion: this.nuevaDescripcion() || this.nuevoSubtitulo(),
      beneficios: [
        'Metodología de alto impacto',
        'Evaluación biomecánica continua',
        'Certificado e insignia para el perfil del atleta'
      ]
    };

    this.api.createServicio(dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeCrearModal();
        this.cargarServicios();
      },
      error: (err) => {
        this.isSaving.set(false);
        alert(err?.error?.message || 'Error al crear la clínica');
      }
    });
  }
}
