import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface DeportistaCarnet {
  nombre: string;
  posicion: string;
  categoria: string;
  dorsal: number;
  socioId: string;
  vigencia: string;
  foto: string;
  eps: string;
  tipoSangre: string;
  contactoEmergencia: string;
  telefonoEmergencia: string;
  alergias: string;
  estadoMedico: 'Apto para Competencia' | 'En Observación' | 'Incapacitado';
}

@Component({
  selector: 'app-carnet-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="carnet-subbar">
      <a routerLink="/perfil" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
      <h2>Socio Pass Digital</h2>
    </div>

    <main class="carnet-container">
      <!-- Selector de Vista: Carnet vs Ficha Médica SOS -->
      <div class="view-switch">
        <button 
          [class.active]="vistaActiva() === 'carnet'"
          (click)="vistaActiva.set('carnet')">
          <i class="fa-solid fa-id-card"></i> Carnet Oficial
        </button>
        <button 
          [class.active]="vistaActiva() === 'medica'"
          (click)="vistaActiva.set('medica')">
          <i class="fa-solid fa-heart-pulse"></i> Ficha Médica SOS
        </button>
      </div>

      @if (vistaActiva() === 'carnet') {
        <!-- Tarjeta Holográfica de Carnet -->
        <div class="digital-pass-card">
          <div class="card-glow"></div>
          
          <div class="pass-header">
            <div class="brand">
              <div class="logo-shield">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <div class="brand-text">
                <h3>SPORTCORE OS</h3>
                <span>ACADEMIA OFICIAL</span>
              </div>
            </div>
            <span class="badge-status">ACTIVO 2026</span>
          </div>

          <div class="pass-body">
            <div class="athlete-avatar">
              <img [src]="deportista.foto" [alt]="deportista.nombre" />
              <span class="dorsal-tag">#{{ deportista.dorsal }}</span>
            </div>

            <div class="athlete-meta">
              <h2 class="name">{{ deportista.nombre }}</h2>
              <p class="role-cat">{{ deportista.posicion }} &bull; {{ deportista.categoria }}</p>
              
              <div class="meta-row">
                <div class="meta-item">
                  <span class="label">ID SOCIO</span>
                  <span class="val">{{ deportista.socioId }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">VIGENCIA</span>
                  <span class="val">{{ deportista.vigencia }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Código QR Dinámico de Validación de Acceso -->
          <div class="pass-qr-section">
            <div class="qr-box">
              <img 
                [src]="'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SPORTCORE_VALID_MEMBER_' + deportista.socioId" 
                alt="QR Validación" />
            </div>
            <div class="qr-info">
              <p class="scan-note">Presenta este código en portería para validación de entrada a entrenamientos y torneos oficiales.</p>
              <div class="live-counter">
                <span class="pulsing-dot"></span> Código Verificado en Línea
              </div>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-action" (click)="guardarEnBilletera()">
            <i class="fa-brands fa-apple"></i> / <i class="fa-brands fa-google-wallet"></i> Guardar en Billetera
          </button>
        </div>
      } @else {
        <!-- Ficha Médica SOS -->
        <div class="medical-sheet-card">
          <div class="med-status-banner" [class.apto]="deportista.estadoMedico === 'Apto para Competencia'">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <h4>{{ deportista.estadoMedico }}</h4>
              <p>Certificado médico al día emitido por Medicina Deportiva.</p>
            </div>
          </div>

          <div class="med-info-grid">
            <div class="med-card">
              <span class="label">TIPO DE SANGRE</span>
              <span class="value blood">{{ deportista.tipoSangre }}</span>
            </div>

            <div class="med-card">
              <span class="label">EPS / SEGURO</span>
              <span class="value">{{ deportista.eps }}</span>
            </div>

            <div class="med-card full">
              <span class="label">ALERGIAS & ANTECEDENTES</span>
              <span class="value text-warning">{{ deportista.alergias }}</span>
            </div>

            <div class="med-card full emergency-box">
              <span class="label text-danger"><i class="fa-solid fa-phone-volume"></i> CONTACTO DE EMERGENCIA</span>
              <div class="contact-details">
                <strong>{{ deportista.contactoEmergencia }}</strong>
                <a [href]="'tel:' + deportista.telefonoEmergencia" class="btn-call-sos">
                  <i class="fa-solid fa-phone"></i> {{ deportista.telefonoEmergencia }}
                </a>
              </div>
            </div>
          </div>
        </div>
      }
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .carnet-subbar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background: #fff;
      border-bottom: 1px solid var(--border-color, #e2e8f0);

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

    .carnet-container {
      padding: 1.25rem;
      padding-bottom: calc(75px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .view-switch {
      display: flex;
      background: #e2e8f0;
      padding: 0.25rem;
      border-radius: 12px;
      gap: 0.25rem;

      button {
        flex: 1;
        background: none;
        border: none;
        padding: 0.65rem;
        border-radius: 10px;
        font-size: 0.82rem;
        font-weight: 700;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        transition: all 0.2s ease;

        &.active {
          background: #fff;
          color: #0f172a;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }
      }
    }

    /* Tarjeta Carnet Pro */
    .digital-pass-card {
      position: relative;
      background: linear-gradient(145deg, #093322 0%, #064e3b 50%, #022c22 100%);
      border-radius: 1.5rem;
      padding: 1.5rem;
      color: #fff;
      box-shadow: 0 16px 32px -8px rgba(6, 78, 59, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .card-glow {
        position: absolute;
        top: -60px;
        right: -60px;
        width: 160px;
        height: 160px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
        pointer-events: none;
      }
    }

    .pass-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .brand {
        display: flex;
        align-items: center;
        gap: 0.6rem;

        .logo-shield {
          width: 34px;
          height: 34px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          color: #10b981;
        }

        .brand-text {
          h3 {
            font-size: 0.95rem;
            font-weight: 800;
            margin: 0;
            letter-spacing: 0.5px;
          }
          span {
            font-size: 0.6rem;
            opacity: 0.75;
            letter-spacing: 1px;
          }
        }
      }

      .badge-status {
        background: rgba(16, 185, 129, 0.25);
        color: #6ee7b7;
        border: 1px solid rgba(110, 231, 183, 0.3);
        padding: 0.2rem 0.55rem;
        border-radius: 20px;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.5px;
      }
    }

    .pass-body {
      display: flex;
      align-items: center;
      gap: 1rem;

      .athlete-avatar {
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: 1rem;
        overflow: hidden;
        border: 2px solid #10b981;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dorsal-tag {
          position: absolute;
          bottom: 0;
          right: 0;
          left: 0;
          background: rgba(0, 0, 0, 0.75);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 800;
          text-align: center;
          padding: 1px 0;
        }
      }

      .athlete-meta {
        flex: 1;

        .name {
          font-size: 1.15rem;
          font-weight: 800;
          margin: 0 0 0.2rem 0;
          line-height: 1.2;
        }

        .role-cat {
          font-size: 0.75rem;
          color: #a7f3d0;
          margin: 0 0 0.6rem 0;
        }

        .meta-row {
          display: flex;
          gap: 1rem;

          .meta-item {
            display: flex;
            flex-direction: column;

            .label {
              font-size: 0.55rem;
              color: rgba(255, 255, 255, 0.6);
              letter-spacing: 0.5px;
            }

            .val {
              font-size: 0.75rem;
              font-weight: 700;
            }
          }
        }
      }
    }

    .pass-qr-section {
      background: #fff;
      border-radius: 1rem;
      padding: 1rem;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 1rem;

      .qr-box {
        width: 80px;
        height: 80px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          border-radius: 6px;
        }
      }

      .qr-info {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .scan-note {
          font-size: 0.72rem;
          color: #64748b;
          margin: 0;
          line-height: 1.35;
        }

        .live-counter {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          font-weight: 700;
          color: #047857;

          .pulsing-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 1.5s infinite;
          }
        }
      }
    }

    .card-actions {
      .btn-action {
        width: 100%;
        background: #0f172a;
        color: #fff;
        border: none;
        padding: 0.85rem;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
      }
    }

    /* Ficha Médica SOS */
    .medical-sheet-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .med-status-banner {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 1rem;
        padding: 1rem;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        color: #166534;

        i { font-size: 1.5rem; color: #16a34a; }

        h4 {
          font-size: 0.95rem;
          font-weight: 800;
          margin: 0 0 0.2rem 0;
        }

        p {
          font-size: 0.75rem;
          margin: 0;
          color: #4b5563;
        }
      }

      .med-info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;

        .med-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0.85rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          &.full {
            grid-column: span 2;
          }

          .label {
            font-size: 0.65rem;
            font-weight: 800;
            color: #64748b;
            letter-spacing: 0.5px;
          }

          .value {
            font-size: 0.85rem;
            font-weight: 700;
            color: #0f172a;

            &.blood {
              font-size: 1.15rem;
              color: #dc2626;
            }

            &.text-warning {
              color: #b45309;
            }
          }

          &.emergency-box {
            background: #fef2f2;
            border-color: #fecaca;

            .contact-details {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 0.4rem;

              strong {
                font-size: 0.9rem;
                color: #991b1b;
              }

              .btn-call-sos {
                background: #dc2626;
                color: #fff;
                text-decoration: none;
                padding: 0.45rem 0.85rem;
                border-radius: 8px;
                font-size: 0.8rem;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 0.4rem;
              }
            }
          }
        }
      }
    }

    @keyframes pulse {
      0% { transform: scale(0.95); opacity: 0.7; }
      50% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(0.95); opacity: 0.7; }
    }
  `]
})
export class CarnetMobileComponent {
  auth = inject(AuthService);
  vistaActiva = signal<'carnet' | 'medica'>('carnet');

  deportista: DeportistaCarnet = {
    nombre: 'Mateo Morales Silva',
    posicion: 'Delantero Extremo',
    categoria: 'Sub-15 A',
    dorsal: 10,
    socioId: 'SC-2026-9482',
    vigencia: '31/DIC/2026',
    foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    eps: 'Sura EPS / Poliza Allianz',
    tipoSangre: 'O Positivo (O+)',
    contactoEmergencia: 'Claudia Silva (Madre)',
    telefonoEmergencia: '+57 312 450 8899',
    alergias: 'Ninguna conocida / Apto sin restricciones cardiorrespiratorias.',
    estadoMedico: 'Apto para Competencia'
  };

  guardarEnBilletera() {
    alert('Pase digital exportado y sincronizado con Apple Wallet / Google Wallet.');
  }
}
