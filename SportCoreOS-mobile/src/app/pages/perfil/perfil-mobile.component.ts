import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

export interface InsigniaDeportista {
  id: string;
  nombre: string;
  clinica_titulo: string;
  categoria: string;
  icono: string;
  color_tema: string;
  fecha_obtencion?: string;
  entrenador_nombre: string;
  cancha_nombre: string;
  nivel: string; // 'Oro', 'Plata', 'Diamante', 'Élite'
  desbloqueada: boolean;
  puntaje_evaluacion?: number;
  metrica_clave?: string;
  descripcion: string;
}

@Component({
  selector: 'app-perfil-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-mobile-header title="Mi Perfil" subtitle="Ficha del Atleta, Carnet & Insignias"></app-mobile-header>

    <main class="page-content">
      <!-- DIGITAL ID CARD HERO -->
      <div class="digital-card">
        <div class="card-glass">
          <div class="card-header">
            <div class="club-brand">
              <i class="fa-solid fa-shield-halved brand-icon"></i>
              <span class="club-title">SPORTCORE CLUB</span>
            </div>
            <span class="id-badge">SOCIO ACTIVO</span>
          </div>

          <div class="card-body">
            <div class="avatar-box">
              <img [src]="authService.demoPersonas[3].avatar" alt="Foto Atleta" class="avatar-img" />
              <span class="dorsal-tag">#10</span>
            </div>
            <div class="player-info">
              <h2 class="user-fullname">{{ currentUser()?.nombres || 'Mateo Valderrama' }}</h2>
              <p class="user-role-label">{{ currentUser()?.rol || 'ATLETA ÉLITE SUB-15' }}</p>
              <div class="sub-tags">
                <span class="tag"><i class="fa-solid fa-id-card"></i> CC 1047495812</span>
                <span class="tag"><i class="fa-solid fa-shirt"></i> Volante Ofensivo</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="qr-preview">
              <i class="fa-solid fa-qrcode"></i>
            </div>
            <div class="validity-info">
              <span class="val-label">Vigencia Carnet:</span>
              <span class="val-date">Temporada 2026 • Al Día</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ -->
      <!-- VITRINA DE INSIGNIAS & MASTERCLASSES PRO (TROPHY SHOWCASE)     -->
      <!-- ============================================================ -->
      <section class="trophy-showcase-section">
        <div class="showcase-header">
          <div class="header-titles">
            <div class="badge-tag-pill">
              <i class="fa-solid fa-award"></i> GAMIFICACIÓN ÉLITE
            </div>
            <h3 class="section-title-main">
              <i class="fa-solid fa-trophy text-amber"></i> Vitrina de Insignias Pro
            </h3>
            <p class="section-sub-desc">
              Medallas y certificaciones oficiales ganadas en Clínicas de Alto Rendimiento.
            </p>
          </div>
          <div class="trophy-counter-badge">
            <span class="count-num">{{ insigniasDesbloqueadas().length }}</span>
            <span class="count-total">/ {{ insigniasList().length }}</span>
          </div>
        </div>

        <!-- MASTERY LEVEL PROGRESS -->
        <div class="mastery-level-card">
          <div class="mastery-top">
            <div class="level-info">
              <span class="level-icon">👑</span>
              <div>
                <span class="level-title">Rango Actual: <strong>Maestro Élite Oro</strong></span>
                <span class="level-desc">{{ insigniasDesbloqueadas().length }} de {{ insigniasList().length }} micro-habilidades conquistadas</span>
              </div>
            </div>
            <span class="level-pct">{{ porcentajeMaestria() }}%</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" [style.width.%]="porcentajeMaestria()"></div>
          </div>
        </div>

        <!-- FILTER TABS FOR TROPHIES -->
        <div class="trophy-filter-chips">
          <button
            class="filter-chip"
            [class.active]="filtroInsignias() === 'TODAS'"
            (click)="filtroInsignias.set('TODAS')"
          >
            Todas ({{ insigniasList().length }})
          </button>
          <button
            class="filter-chip chip-emerald"
            [class.active]="filtroInsignias() === 'DESBLOQUEADAS'"
            (click)="filtroInsignias.set('DESBLOQUEADAS')"
          >
            <i class="fa-solid fa-circle-check"></i> Obtenidas ({{ insigniasDesbloqueadas().length }})
          </button>
          <button
            class="filter-chip chip-locked"
            [class.active]="filtroInsignias() === 'BLOQUEADAS'"
            (click)="filtroInsignias.set('BLOQUEADAS')"
          >
            <i class="fa-solid fa-lock"></i> Por Conquistar ({{ insigniasBloqueadas().length }})
          </button>
        </div>

        <!-- TROPHIES GRID -->
        <div class="trophies-grid">
          @for (ins of filteredInsignias(); track ins.id) {
            <div
              class="trophy-card"
              [class.unlocked]="ins.desbloqueada"
              [class.locked]="!ins.desbloqueada"
              (click)="abrirDetalleInsignia(ins)"
            >
              @if (ins.desbloqueada) {
                <div class="trophy-glow-halo" [style.background]="ins.color_tema + '25'"></div>
              }

              <!-- CARD TOP -->
              <div class="trophy-card-top">
                <span
                  class="trophy-badge-pill"
                  [style.color]="ins.desbloqueada ? ins.color_tema : '#94a3b8'"
                  [style.background]="ins.desbloqueada ? (ins.color_tema + '18') : 'rgba(255,255,255,0.05)'"
                >
                  <i class="fa-solid" [ngClass]="ins.desbloqueada ? 'fa-circle-check' : 'fa-lock'"></i>
                  {{ ins.desbloqueada ? ins.nivel : 'Bloqueada' }}
                </span>
                <span class="trophy-cat-pill">{{ ins.categoria }}</span>
              </div>

              <!-- ICON -->
              <div
                class="trophy-icon-box"
                [style.background]="ins.desbloqueada ? (ins.color_tema + '20') : 'rgba(255,255,255,0.04)'"
                [style.border-color]="ins.desbloqueada ? (ins.color_tema + '60') : 'rgba(255,255,255,0.08)'"
                [style.color]="ins.desbloqueada ? ins.color_tema : '#64748b'"
              >
                <i class="fa-solid" [ngClass]="ins.icono"></i>
              </div>

              <!-- INFO -->
              <div class="trophy-info">
                <h4 class="trophy-name" [style.color]="ins.desbloqueada ? '#ffffff' : '#94a3b8'">
                  {{ ins.nombre }}
                </h4>
                <p class="trophy-clinic">{{ ins.clinica_titulo }}</p>
              </div>

              <!-- FOOTER -->
              <div class="trophy-card-bottom">
                @if (ins.desbloqueada) {
                  <span class="metric-highlight text-emerald">
                    <i class="fa-solid fa-chart-line"></i> {{ ins.metrica_clave }}
                  </span>
                } @else {
                  <span class="unlock-hint">
                    <i class="fa-solid fa-arrow-right"></i> Ver Clínica Pro
                  </span>
                }
              </div>
            </div>
          }
        </div>

        <!-- CTA TO EXPLORE MORE CLINICS -->
        <div class="explore-clinics-banner">
          <div class="explore-content">
            <h4><i class="fa-solid fa-fire text-amber"></i> ¿Listo para tu siguiente Insignia?</h4>
            <p>Inscríbete en las próximas clínicas de micro-habilidades en Cartagena.</p>
          </div>
          <a routerLink="/servicios" class="btn-explore-link">
            Explorar Clínicas <i class="fa-solid fa-chevron-right"></i>
          </a>
        </div>
      </section>

      <!-- ACCESOS RÁPIDOS PRO DEPORTISTA -->
      <div class="menu-section">
        <h4 class="section-title">Módulos del Deportista & Club</h4>
        <div class="info-list">
          <a routerLink="/perfil/carnet" class="action-row">
            <div class="info-left">
              <i class="fa-solid fa-id-badge text-emerald"></i>
              <span>Carnet Digital & Ficha Médica SOS</span>
            </div>
            <i class="fa-solid fa-chevron-right arrow"></i>
          </a>
          <a routerLink="/perfil/boletin-ia" class="action-row">
            <div class="info-left">
              <i class="fa-solid fa-wand-magic-sparkles text-cyan"></i>
              <span>Boletín de Rendimiento IA (Gemini)</span>
            </div>
            <span class="status-toggle">NUEVO</span>
          </a>
          <a routerLink="/servicios" class="action-row">
            <div class="info-left">
              <i class="fa-solid fa-graduation-cap text-amber"></i>
              <span>Clínicas & Masterclasses Especializadas</span>
            </div>
            <span class="status-toggle bg-amber-soft">PRO</span>
          </a>
          <a routerLink="/pagos" class="action-row">
            <div class="info-left">
              <i class="fa-solid fa-credit-card text-purple"></i>
              <span>Estado de Pagos & Mensualidades</span>
            </div>
            <i class="fa-solid fa-chevron-right arrow"></i>
          </a>
          <a routerLink="/tienda" class="action-row">
            <div class="info-left">
              <i class="fa-solid fa-bag-shopping text-pink"></i>
              <span>Tienda Oficial de Indumentaria</span>
            </div>
            <i class="fa-solid fa-chevron-right arrow"></i>
          </a>
        </div>
      </div>

      <!-- DATOS PERSONALES -->
      <div class="menu-section">
        <h4 class="section-title">Datos Personales & Ficha</h4>
        <div class="info-list">
          <div class="info-item">
            <div class="info-left">
              <i class="fa-solid fa-envelope text-blue"></i>
              <span>Correo Electrónico</span>
            </div>
            <span class="info-val">{{ currentUser()?.email || 'mateo.valderrama@gmail.com' }}</span>
          </div>
          <div class="info-item">
            <div class="info-left">
              <i class="fa-solid fa-phone text-emerald"></i>
              <span>Teléfono Acudiente</span>
            </div>
            <span class="info-val">+57 300 123 4567</span>
          </div>
          <div class="info-item">
            <div class="info-left">
              <i class="fa-solid fa-heart-pulse text-rose"></i>
              <span>EPS / Seguro Médico</span>
            </div>
            <span class="info-val">SURA EPS (Póliza Deportiva Activa)</span>
          </div>
          <div class="info-item">
            <div class="info-left">
              <i class="fa-solid fa-location-dot text-amber"></i>
              <span>Sede de Entrenamiento</span>
            </div>
            <span class="info-val">Alameda La Victoria (Cartagena)</span>
          </div>
        </div>
      </div>

      <!-- AJUSTES DE SEGURIDAD -->
      <div class="menu-section">
        <h4 class="section-title">Ajustes de Seguridad</h4>
        <div class="info-list">
          <button class="action-row" (click)="cambiarClave()">
            <div class="info-left">
              <i class="fa-solid fa-key text-amber"></i>
              <span>Cambiar Contraseña</span>
            </div>
            <i class="fa-solid fa-chevron-right arrow"></i>
          </button>
          <button class="action-row" (click)="toggleNotificaciones()">
            <div class="info-left">
              <i class="fa-solid fa-bell text-emerald"></i>
              <span>Notificaciones Push de Clínicas & Convocatorias</span>
            </div>
            <span class="status-toggle">ACTIVADO</span>
          </button>
        </div>
      </div>

      <div class="logout-section">
        <button class="btn-logout" (click)="logout()">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          Cerrar Sesión Segura
        </button>
      </div>
    </main>

    <!-- ============================================================ -->
    <!-- BOTTOM SHEET: DETALLE MODAL DE INSIGNIA CON DIPLOMA DIGITAL   -->
    <!-- ============================================================ -->
    @if (selectedInsignia()) {
      <div class="sheet-overlay" (click)="cerrarDetalleInsignia()">
        <div class="sheet-content" (click)="$event.stopPropagation()">
          <div class="sheet-handle"></div>

          <div class="insignia-modal-header" [style.background]="'radial-gradient(circle, ' + selectedInsignia()?.color_tema + '30 0%, #0f172a 80%)'">
            <div
              class="modal-badge-large"
              [style.background]="selectedInsignia()?.color_tema + '25'"
              [style.border-color]="selectedInsignia()?.color_tema"
              [style.color]="selectedInsignia()?.color_tema"
            >
              <i class="fa-solid" [ngClass]="selectedInsignia()?.icono"></i>
            </div>
            <span class="modal-level-tag" [style.background]="selectedInsignia()?.color_tema" [style.color]="'#0f172a'">
              {{ selectedInsignia()?.desbloqueada ? selectedInsignia()?.nivel : 'Bloqueada 🔒' }}
            </span>
            <h3 class="modal-insignia-title">{{ selectedInsignia()?.nombre }}</h3>
            <p class="modal-clinic-subtitle">{{ selectedInsignia()?.clinica_titulo }}</p>
          </div>

          <div class="insignia-modal-body">
            <!-- STATUS DESCRIPTION -->
            <p class="insignia-desc-text">{{ selectedInsignia()?.descripcion }}</p>

            <!-- STATS & DETAILS GRID -->
            <div class="insignia-details-box">
              <div class="detail-row">
                <span class="d-label"><i class="fa-solid fa-user-tie text-emerald"></i> Evaluador Oficial:</span>
                <span class="d-val">{{ selectedInsignia()?.entrenador_nombre }}</span>
              </div>
              <div class="detail-row">
                <span class="d-label"><i class="fa-solid fa-location-dot text-cyan"></i> Sede Cartagena:</span>
                <span class="d-val">{{ selectedInsignia()?.cancha_nombre }}</span>
              </div>
              <div class="detail-row">
                <span class="d-label"><i class="fa-solid fa-calendar-check text-amber"></i> Fecha Acreditación:</span>
                <span class="d-val">{{ selectedInsignia()?.fecha_obtencion || 'Pendiente por Conquistar' }}</span>
              </div>
              <div class="detail-row">
                <span class="d-label"><i class="fa-solid fa-bolt text-rose"></i> Métrica Clave Obtenida:</span>
                <span class="d-val text-emerald font-bold">{{ selectedInsignia()?.metrica_clave || 'Requiere Aprobación' }}</span>
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="modal-actions-box">
              @if (selectedInsignia()?.desbloqueada) {
                <button class="btn-share-whatsapp" (click)="compartirInsigniaWhatsApp()">
                  <i class="fa-brands fa-whatsapp"></i> Presumir en WhatsApp & Redes
                </button>
                <button class="btn-cert-download" (click)="descargarCertificado()">
                  <i class="fa-solid fa-certificate"></i> Ver Diploma Digital
                </button>
              } @else {
                <a routerLink="/servicios" (click)="cerrarDetalleInsignia()" class="btn-go-clinic">
                  <i class="fa-solid fa-ticket"></i> Inscribirme en esta Clínica Pro
                </a>
              }
              <button class="btn-sheet-close" (click)="cerrarDetalleInsignia()">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .page-content {
      padding: 1rem;
      padding-bottom: 96px;
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    /* DIGITAL CARD HERO */
    .digital-card {
      background: linear-gradient(135deg, #064e3b 0%, #022c22 60%, #0f172a 100%);
      border-radius: 20px;
      padding: 2px;
      box-shadow: 0 10px 25px -5px rgba(6, 78, 59, 0.5);
    }

    .card-glass {
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(10px);
      border-radius: 18px;
      padding: 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .club-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #10b981;

      .brand-icon {
        font-size: 1.2rem;
      }

      .club-title {
        font-weight: 900;
        letter-spacing: 0.05em;
        font-size: 0.95rem;
      }
    }

    .id-badge {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.4);
    }

    .card-body {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .avatar-box {
      position: relative;
      width: 64px;
      height: 64px;
      min-width: 64px;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 16px;
      object-fit: cover;
      border: 2px solid #10b981;
    }

    .dorsal-tag {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: #10b981;
      color: #ffffff;
      font-weight: 900;
      font-size: 0.7rem;
      padding: 1px 5px;
      border-radius: 6px;
      border: 1px solid #0f172a;
    }

    .player-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .user-fullname {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 800;
        color: #fff;
      }

      .user-role-label {
        margin: 0;
        font-size: 0.8rem;
        font-weight: 700;
        color: #10b981;
      }

      .sub-tags {
        display: flex;
        gap: 6px;
        margin-top: 4px;
        flex-wrap: wrap;

        .tag {
          font-size: 0.72rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          color: #cbd5e1;
        }
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 0.75rem;

      .qr-preview {
        font-size: 1.8rem;
        color: #fff;
      }

      .validity-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .val-label {
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .val-date {
          font-size: 0.78rem;
          font-weight: 700;
          color: #fff;
        }
      }
    }

    /* ============================================================ */
    /* VITRINA DE INSIGNIAS SECTION                                 */
    /* ============================================================ */
    .trophy-showcase-section {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }

    .showcase-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .badge-tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(245, 158, 11, 0.15);
      color: #f59e0b;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      margin-bottom: 0.35rem;
      letter-spacing: 0.05em;
    }

    .section-title-main {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .section-sub-desc {
      font-size: 0.78rem;
      color: #94a3b8;
      margin: 0.25rem 0 0 0;
      line-height: 1.35;
    }

    .trophy-counter-badge {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.4rem 0.75rem;
      border-radius: 12px;
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
      white-space: nowrap;
    }

    .count-num {
      font-size: 1.25rem;
      font-weight: 900;
      color: #10b981;
    }

    .count-total {
      font-size: 0.75rem;
      font-weight: 700;
      color: #94a3b8;
    }

    /* MASTERY PROGRESS */
    .mastery-level-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .mastery-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .level-info {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .level-icon {
      font-size: 1.5rem;
    }

    .level-title {
      font-size: 0.82rem;
      color: #ffffff;
      display: block;
    }

    .level-title strong {
      color: #f59e0b;
    }

    .level-desc {
      font-size: 0.72rem;
      color: #94a3b8;
      display: block;
    }

    .level-pct {
      font-size: 1.1rem;
      font-weight: 900;
      color: #10b981;
    }

    .progress-bar-track {
      height: 8px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #06b6d4);
      border-radius: 9999px;
      transition: width 0.4s ease;
    }

    /* FILTER CHIPS */
    .trophy-filter-chips {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .filter-chip {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s ease;
    }

    .filter-chip.active {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.2);
    }

    .filter-chip.chip-emerald.active {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #10b981;
    }

    .filter-chip.chip-locked.active {
      background: rgba(245, 158, 11, 0.2);
      border-color: #f59e0b;
      color: #f59e0b;
    }

    /* TROPHIES GRID */
    .trophies-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    @media (max-width: 380px) {
      .trophies-grid {
        grid-template-columns: 1fr;
      }
    }

    .trophy-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.6rem;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .trophy-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .trophy-card.unlocked {
      background: rgba(15, 23, 42, 0.7);
      border-color: rgba(255, 255, 255, 0.12);
    }

    .trophy-card.locked {
      opacity: 0.65;
      background: rgba(255, 255, 255, 0.02);
      border-style: dashed;
    }

    .trophy-glow-halo {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 100px;
      border-radius: 50%;
      filter: blur(20px);
      pointer-events: none;
    }

    .trophy-card-top {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.65rem;
    }

    .trophy-badge-pill {
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .trophy-cat-pill {
      color: #64748b;
      font-weight: 600;
      font-size: 0.62rem;
    }

    .trophy-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      border: 1.5px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.45rem;
      margin: 0.2rem 0;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
    }

    .trophy-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .trophy-name {
      font-size: 0.85rem;
      font-weight: 800;
      margin: 0;
      line-height: 1.25;
    }

    .trophy-clinic {
      font-size: 0.72rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .trophy-card-bottom {
      width: 100%;
      margin-top: auto;
      padding-top: 0.4rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.7rem;
    }

    .metric-highlight {
      font-weight: 700;
      font-size: 0.72rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .unlock-hint {
      color: #f59e0b;
      font-weight: 700;
      font-size: 0.72rem;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* EXPLORE CLINICS BANNER */
    .explore-clinics-banner {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(16, 185, 129, 0.08));
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 14px;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
    }

    .explore-content h4 {
      font-size: 0.88rem;
      font-weight: 800;
      margin: 0 0 0.2rem 0;
      color: #ffffff;
    }

    .explore-content p {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0;
    }

    .btn-explore-link {
      background: #f59e0b;
      color: #0f172a;
      font-weight: 800;
      font-size: 0.78rem;
      padding: 0.55rem 0.85rem;
      border-radius: 8px;
      text-decoration: none;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s ease;
    }

    .btn-explore-link:hover {
      background: #fbbf24;
      transform: translateY(-1px);
    }

    /* MENU SECTION */
    .menu-section {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1rem;
    }

    .section-title {
      margin: 0 0 10px 0;
      font-size: 0.82rem;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .info-item, .action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    .action-row {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: inherit;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      text-decoration: none;
    }

    .info-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.88rem;
      color: #ffffff;

      i {
        width: 16px;
      }
    }

    .info-val {
      font-size: 0.82rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .arrow {
      color: #64748b;
      font-size: 0.8rem;
    }

    .status-toggle {
      font-size: 0.7rem;
      font-weight: 800;
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .bg-amber-soft {
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.15);
    }

    .logout-section {
      margin-top: 4px;
    }

    .btn-logout {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: 1px solid rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.2);
      }
    }

    /* ============================================================ */
    /* BOTTOM SHEET MODAL (INSIGNIA DETAIL & DIPLOMA)               */
    /* ============================================================ */
    .sheet-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .sheet-content {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px 24px 0 0;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .sheet-handle {
      width: 44px;
      height: 5px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 9999px;
      margin: 10px auto 4px auto;
    }

    .insignia-modal-header {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .modal-badge-large {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      border: 2px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    }

    .modal-level-tag {
      font-size: 0.72rem;
      font-weight: 900;
      padding: 2px 10px;
      border-radius: 9999px;
      letter-spacing: 0.05em;
    }

    .modal-insignia-title {
      font-size: 1.35rem;
      font-weight: 900;
      color: #ffffff;
      margin: 0;
    }

    .modal-clinic-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
    }

    .insignia-modal-body {
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .insignia-desc-text {
      font-size: 0.85rem;
      color: #cbd5e1;
      line-height: 1.45;
      margin: 0;
      text-align: center;
    }

    .insignia-details-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      padding-bottom: 0.5rem;
    }

    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .d-label {
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .d-val {
      font-weight: 700;
      color: #ffffff;
    }

    .modal-actions-box {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .btn-share-whatsapp {
      background: #25d366;
      color: #ffffff;
      border: none;
      padding: 0.85rem;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
    }

    .btn-cert-download {
      background: rgba(16, 185, 129, 0.15);
      border: 1.5px solid #10b981;
      color: #10b981;
      padding: 0.8rem;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-go-clinic {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #ffffff;
      padding: 0.85rem;
      border-radius: 12px;
      font-weight: 800;
      font-size: 0.9rem;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
    }

    .btn-sheet-close {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
      padding: 0.75rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .text-emerald { color: #10b981; }
    .text-cyan { color: #06b6d4; }
    .text-amber { color: #f59e0b; }
    .text-blue { color: #3b82f6; }
    .text-pink { color: #ec4899; }
    .text-purple { color: #8b5cf6; }
    .text-rose { color: #f43f5e; }
    .font-bold { font-weight: 700; }
  `]
})
export class PerfilMobileComponent implements OnInit {
  authService = inject(AuthService);
  private alertService = inject(AlertService);

  currentUser = this.authService.currentUser;

  // Signal filter state
  filtroInsignias = signal<'TODAS' | 'DESBLOQUEADAS' | 'BLOQUEADAS'>('TODAS');
  selectedInsignia = signal<InsigniaDeportista | null>(null);

  // List of official specialized clinic badges
  insigniasList = signal<InsigniaDeportista[]>([
    {
      id: 'ins-1',
      nombre: '⚡ Rayo de 5 Metros',
      clinica_titulo: 'Explosividad & Sprint Pura para Niños',
      categoria: 'VELOCIDAD',
      icono: 'fa-bolt',
      color_tema: '#10b981',
      fecha_obtencion: '15 Sep 2026',
      entrenador_nombre: 'Prof. Reinaldo Rueda',
      cancha_nombre: 'Cancha de Fútbol Alameda La Victoria',
      nivel: '🥇 Nivel Oro',
      desbloqueada: true,
      puntaje_evaluacion: 96,
      metrica_clave: '1.12s en 5m (Top 5% Academia)',
      descripcion: 'Dominio absoluto de salida explosiva, centro de gravedad bajo y aceleración inicial medida por sensores láser Doppler.'
    },
    {
      id: 'ins-2',
      nombre: '🧠 Mente de Gran Maestro',
      clinica_titulo: 'Coordinación & Neuro-Agilidad Fitlight',
      categoria: 'NEURO-AGILIDAD',
      icono: 'fa-brain',
      color_tema: '#06b6d4',
      fecha_obtencion: '08 Sep 2026',
      entrenador_nombre: 'Dra. Marcela Gómez (Neuro-Deporte)',
      cancha_nombre: 'Complejo Deportivo Los Calamares',
      nivel: '💎 Nivel Platino',
      desbloqueada: true,
      puntaje_evaluacion: 98,
      metrica_clave: '0.24s tiempo de reacción visual',
      descripcion: 'Agilidad mental y toma de decisiones de alta velocidad con estímulos lumínicos Fitlight bajo fatiga inducida.'
    },
    {
      id: 'ins-3',
      nombre: '🪄 Maestro del Engaño 1v1',
      clinica_titulo: 'Técnica de Regate & Duelos 1v1 Vinicius Jr',
      categoria: 'REGATE & DUELOS',
      icono: 'fa-wand-magic-sparkles',
      color_tema: '#f59e0b',
      fecha_obtencion: '28 Ago 2026',
      entrenador_nombre: 'Prof. Faustino Asprilla',
      cancha_nombre: 'Cancha Sintética Pie de la Popa',
      nivel: '🥇 Nivel Oro',
      desbloqueada: true,
      puntaje_evaluacion: 94,
      metrica_clave: '88% duelos 1v1 ganados',
      descripcion: 'Fintas de cuerpo, cambio de ritmo y cambio de dirección con regate en velocidad y salida por ambos perfiles.'
    },
    {
      id: 'ins-4',
      nombre: '🎯 Francotirador de Élite',
      clinica_titulo: 'Definición Quirúrgica & Efecto Messi',
      categoria: 'DEFINICIÓN & TIRO',
      icono: 'fa-bullseye',
      color_tema: '#8b5cf6',
      fecha_obtencion: '12 Ago 2026',
      entrenador_nombre: 'Prof. Víctor Danilo Pacheco',
      cancha_nombre: 'Cancha Bombonera Bocagrande',
      nivel: '👑 Nivel Diamante',
      desbloqueada: true,
      puntaje_evaluacion: 97,
      metrica_clave: '92% efectividad en remate colocado',
      descripcion: 'Golpeo con rosca interna, colocación en ángulos imposibles y serenidad bajo presión en el área chica.'
    },
    {
      id: 'ins-5',
      nombre: '🧤 Muralla Imbatible',
      clinica_titulo: 'Arqueros de Élite & Guante de Oro',
      categoria: 'ARQUEROS',
      icono: 'fa-mitten',
      color_tema: '#ec4899',
      entrenador_nombre: 'Prof. Óscar Córdoba',
      cancha_nombre: 'Estadio San Fernando Cancha Sintética',
      nivel: 'Por Conquistar 🔒',
      desbloqueada: false,
      descripcion: 'Bloqueos aéreos, achiques 1v1 y reflejos felinos con disparos a quemarropa y juego de pies moderno.'
    },
    {
      id: 'ins-6',
      nombre: '👁️ Radar 360° Visionario',
      clinica_titulo: 'Visión Periférica & Pases Filtrados De Bruyne',
      categoria: 'VISIÓN & PASE',
      icono: 'fa-eye',
      color_tema: '#06b6d4',
      entrenador_nombre: 'Prof. Macnelly Torres',
      cancha_nombre: 'Cancha Maracaná Crespo',
      nivel: 'Por Conquistar 🔒',
      desbloqueada: false,
      descripcion: 'Escaneo constante de espacios libres antes de recibir y pases filtrados de primera intención rompiendo líneas.'
    },
    {
      id: 'ins-7',
      nombre: '🛡️ Fortaleza Infranqueable',
      clinica_titulo: 'Blindaje Defensivo & Duelos Aéreos Van Dijk',
      categoria: 'DEFENSA',
      icono: 'fa-shield-halved',
      color_tema: '#10b981',
      entrenador_nombre: 'Prof. Mario Alberto Yepes',
      cancha_nombre: 'Cancha Sintética Pie de la Popa',
      nivel: 'Por Conquistar 🔒',
      desbloqueada: false,
      descripcion: 'Temporización defensiva, anticipación táctica y timming de cabeceo ganando el 100% de los duelos.'
    },
    {
      id: 'ins-8',
      nombre: '🚀 Despegue Vertical CR7',
      clinica_titulo: 'Salto Explosivo & Remate de Cabeza Suspendido',
      categoria: 'POTENCIA & SALTO',
      icono: 'fa-jet-fighter-up',
      color_tema: '#f59e0b',
      entrenador_nombre: 'Prof. Iván Ramiro Córdoba',
      cancha_nombre: 'Complejo Deportivo Los Calamares',
      nivel: 'Por Conquistar 🔒',
      desbloqueada: false,
      descripcion: 'Potencia de salto pliométrico con suspensión en el aire y técnica de cabeceo martillado hacia abajo.'
    }
  ]);

  // Computed signals
  insigniasDesbloqueadas = computed(() => {
    return this.insigniasList().filter(i => i.desbloqueada);
  });

  insigniasBloqueadas = computed(() => {
    return this.insigniasList().filter(i => !i.desbloqueada);
  });

  porcentajeMaestria = computed(() => {
    const total = this.insigniasList().length;
    if (total === 0) return 0;
    return Math.round((this.insigniasDesbloqueadas().length / total) * 100);
  });

  filteredInsignias = computed(() => {
    const filter = this.filtroInsignias();
    if (filter === 'DESBLOQUEADAS') {
      return this.insigniasDesbloqueadas();
    }
    if (filter === 'BLOQUEADAS') {
      return this.insigniasBloqueadas();
    }
    return this.insigniasList();
  });

  ngOnInit(): void {}

  abrirDetalleInsignia(insignia: InsigniaDeportista): void {
    this.selectedInsignia.set(insignia);
  }

  cerrarDetalleInsignia(): void {
    this.selectedInsignia.set(null);
  }

  compartirInsigniaWhatsApp(): void {
    const ins = this.selectedInsignia();
    if (!ins) return;

    const text = encodeURIComponent(
      `🏆 *¡Logro Desbloqueado en SportCoreOS!*\n` +
      `Insignia Oficial: *${ins.nombre}* (${ins.nivel})\n` +
      `Clínica: ${ins.clinica_titulo}\n` +
      `Evaluador: ${ins.entrenador_nombre}\n` +
      `Métrica: ${ins.metrica_clave}\n` +
      `Sede: ${ins.cancha_nombre} (Cartagena)\n` +
      `¡Orgullo de Atleta SportCoreOS!`
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  descargarCertificado(): void {
    const ins = this.selectedInsignia();
    if (!ins) return;
    this.alertService.success(`¡Diploma Oficial de "${ins.nombre}" generado y listo para guardar!`);
  }

  cambiarClave(): void {
    this.alertService.info('Se ha enviado un enlace de cambio de contraseña a tu correo registrado.');
  }

  toggleNotificaciones(): void {
    this.alertService.success('Preferencias de notificaciones actualizadas.');
  }

  logout(): void {
    this.authService.logout();
  }
}
