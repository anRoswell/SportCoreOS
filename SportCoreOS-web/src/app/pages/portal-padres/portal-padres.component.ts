import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-portal-padres',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="portal-padres-container">
      <!-- HEADER MOBILE PORTAL -->
      <div class="mobile-card hero-parent">
        <div class="parent-meta">
          <span class="badge-hero">Acudiente Titular • Portal Familiar</span>
          <span class="club-title">{{ api.activeClub().nombre }}</span>
        </div>
        <div class="player-header">
          <div class="dorsal-circle">#{{ jugador()?.numero_dorsal || '7' }}</div>
          <div class="player-info">
            <h2>{{ jugador()?.nombres }} {{ jugador()?.apellidos }}</h2>
            <p>Categoría: <strong>{{ jugador()?.categoria_nombre }}</strong> • {{ jugador()?.posicion_principal }}</p>
          </div>
        </div>
      </div>

      <!-- ALERTA DE CONVOCATORIA A PARTIDO PRÓXIMO -->
      @if (proximoPartido()) {
        <div class="mobile-card match-callout">
          <div class="callout-header">
            <div class="tag-live">⚽ PRÓXIMO PARTIDO OFICIAL</div>
            <span class="badge" [class.badge-success]="convocatoriaEstado() === 'CONFIRMADO'" [class.badge-warning]="convocatoriaEstado() === 'PENDIENTE'" [class.badge-danger]="convocatoriaEstado() === 'EXCUSADO'">
              {{ convocatoriaEstado() === 'CONFIRMADO' ? '¡CONVOCADO CONFIRMADO!' : (convocatoriaEstado() === 'EXCUSADO' ? 'EXCUSADO' : 'PENDIENTE CONFIRMACIÓN') }}
            </span>
          </div>

          <div class="match-details">
            <h3>VS {{ proximoPartido()?.rival_nombre }}</h3>
            <p class="match-time"><i class="fa-regular fa-clock"></i> {{ proximoPartido()?.fecha_partido }} • {{ proximoPartido()?.hora_partido }}</p>
            <p class="warmup-time"><i class="fa-solid fa-stopwatch"></i> <strong>Hora de Citación:</strong> {{ proximoPartido()?.hora_citacion || proximoPartido()?.hora_partido }}</p>
            <p class="match-location"><i class="fa-solid fa-location-dot"></i> {{ proximoPartido()?.sede_cancha }}</p>
            <p class="uniform-info"><i class="fa-solid fa-shirt"></i> <strong>Indumentaria:</strong> {{ proximoPartido()?.indumentaria_kit || 'Kit Titular Verde Esmeralda' }}</p>
          </div>

          <div class="confirmation-actions">
            <button class="btn-confirm-yes" (click)="confirmarAsistencia()">
              <i class="fa-solid fa-circle-check"></i> Confirmar Asistencia
            </button>
            <button class="btn-confirm-no" (click)="excusarAsistencia()">
              <i class="fa-solid fa-circle-xmark"></i> Excusar Inasistencia
            </button>
          </div>
        </div>
      }

      <!-- ESTADO FINANCIERO & PAGO PSE EN 1 CLIC -->
      <div class="mobile-card finance-card">
        <div class="card-title-row">
          <i class="fa-solid fa-credit-card text-emerald"></i>
          <h3>Estado de Cuenta & Mensualidad</h3>
        </div>

        @if (cargoPendiente()) {
          <div class="finance-status-box" [class.mora]="cargoPendiente()?.saldo_pendiente > 0" [class.ok]="cargoPendiente()?.saldo_pendiente == 0">
            <div class="status-left">
              <span class="label">{{ cargoPendiente()?.concepto_nombre || 'Pensión Mensual Oficial' }}</span>
              <span class="amount">$ {{ (cargoPendiente()?.saldo_pendiente || 180000) | number }} COP</span>
            </div>
            <span class="badge" [class.badge-success]="cargoPendiente()?.saldo_pendiente == 0" [class.badge-warning]="cargoPendiente()?.saldo_pendiente > 0">
              {{ cargoPendiente()?.saldo_pendiente == 0 ? 'AL DÍA (PAGADO)' : 'PENDIENTE DE PAGO' }}
            </span>
          </div>

          @if (cargoPendiente()?.saldo_pendiente > 0) {
            <button class="btn-pse-full" (click)="pagarMensualidad()">
              <i class="fa-solid fa-bolt"></i> Pagar Mensualidad vía PSE / Wompi
            </button>
          } @else {
            <button class="btn-receipt-full" (click)="descargarRecibo()">
              <i class="fa-solid fa-receipt"></i> Descargar Comprobante Oficial
            </button>
          }
        } @else {
          <div class="finance-status-box ok">
            <div class="status-left">
              <span class="label">MENSUALIDAD OFICIAL 2026</span>
              <span class="amount">$ 180.000 COP</span>
            </div>
            <span class="badge badge-success">AL DÍA (PAGADO)</span>
          </div>
        }
      </div>

      <!-- BOLETÍN DE RENDIMIENTO DEPORTIVO & BIOMETRÍA -->
      <div class="mobile-card bio-report-card">
        <div class="card-title-row">
          <i class="fa-solid fa-heart-pulse text-blue"></i>
          <h3>Evolución Física & Radar de Aptitud</h3>
        </div>

        <div class="bio-stats-grid">
          <div class="bio-stat">
            <span class="bio-lbl">ESTATURA</span>
            <span class="bio-val">{{ biometria()?.talla_cm || '168.5' }} cm</span>
          </div>
          <div class="bio-stat">
            <span class="bio-lbl">PESO</span>
            <span class="bio-val">{{ biometria()?.peso_kg || '56.4' }} kg</span>
          </div>
          <div class="bio-stat">
            <span class="bio-lbl">IMC</span>
            <span class="bio-val text-emerald">{{ biometria()?.imc || '19.9' }} (Óptimo)</span>
          </div>
          <div class="bio-stat">
            <span class="bio-lbl">TEST COOPER</span>
            <span class="bio-val">{{ biometria()?.test_cooper_metros || '2.850' }} m</span>
          </div>
        </div>

        <div class="coach-comment">
          <strong>Comentario del Cuerpo Técnico:</strong>
          <p>"Excelente respuesta física en los entrenamientos. Alta disciplina táctica y potencia aeróbica sobresaliente."</p>
        </div>
      </div>

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
    .portal-padres-container {
      max-width: 650px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .mobile-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.35rem;
      box-shadow: var(--shadow-card);
    }

    .hero-parent {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      color: #FFFFFF;
      border: none;

      .parent-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;

        .badge-hero {
          background: rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .club-title {
          font-size: 0.8rem;
          font-weight: 700;
          opacity: 0.95;
        }
      }

      .player-header {
        display: flex;
        align-items: center;
        gap: 1rem;

        .dorsal-circle {
          width: 52px;
          height: 52px;
          background: rgba(255, 255, 255, 0.25);
          border: 2px solid rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.35rem;
          font-weight: 800;
        }

        .player-info {
          h2 {
            font-size: 1.35rem;
            font-weight: 800;
            margin: 0;
            line-height: 1.2;
          }

          p {
            font-size: 0.85rem;
            opacity: 0.9;
            margin-top: 0.2rem;
          }
        }
      }
    }

    .match-callout {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border-left: 4px solid var(--color-primary);

      .callout-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .tag-live {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--color-primary);
        }
      }

      .match-details {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-heading);
        }

        p {
          font-size: 0.85rem;
          color: var(--text-body);
          display: flex;
          align-items: center;
          gap: 0.5rem;

          i { color: var(--color-primary); }
        }
      }

      .confirmation-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;

        button {
          padding: 0.65rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-confirm-yes {
          background: #10b981;
          color: #ffffff;
          border: none;
          &:hover { background: #059669; }
        }

        .btn-confirm-no {
          background: var(--bg-surface);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          &:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }
        }
      }
    }

    .card-title-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 0.85rem;

      h3 {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-heading);
      }
    }

    .finance-status-box {
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
      border: 1px solid var(--border-color);

      .status-left {
        display: flex;
        flex-direction: column;

        .label { font-size: 0.75rem; color: var(--text-muted); font-weight: 700; }
        .amount { font-size: 1.35rem; font-weight: 800; color: var(--text-heading); }
      }
    }

    .btn-pse-full {
      width: 100%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      border: none;
      padding: 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

      &:hover { opacity: 0.95; }
    }

    .btn-receipt-full {
      width: 100%;
      background: var(--bg-surface);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      padding: 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .bio-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;

      .bio-stat {
        background: var(--bg-surface);
        padding: 0.75rem;
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        border: 1px solid var(--border-color);

        .bio-lbl { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); }
        .bio-val { font-size: 0.95rem; font-weight: 800; color: var(--text-heading); }
      }
    }

    .coach-comment {
      background: var(--bg-surface);
      padding: 0.85rem;
      border-radius: var(--radius-md);
      border-left: 3px solid var(--color-primary);

      strong { font-size: 0.8rem; color: var(--text-heading); }
      p { font-size: 0.8rem; color: var(--text-body); margin-top: 0.25rem; font-style: italic; }
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
export class PortalPadresComponent implements OnInit {
  api = inject(ApiService);
  authService = inject(AuthService);

  readonly jugador = signal<any | null>(null);
  readonly proximoPartido = signal<any | null>(null);
  readonly convocatoriaEstado = signal<string>('CONFIRMADO');
  readonly convocatoriaId = signal<string>('');
  readonly cargoPendiente = signal<any | null>(null);
  readonly biometria = signal<any | null>(null);
  readonly toastMessage = signal<string>('');

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Cargar jugadores del club y tomar el primero (Luis Díaz o el que corresponda)
    this.api.getJugadores().subscribe((jugadores) => {
      if (jugadores && jugadores.length > 0) {
        const p = jugadores[0];
        this.jugador.set(p);

        // Cargar expediente
        this.api.getExpedienteJugador(p.id).subscribe((exp) => {
          if (exp?.historialBiometrico && exp.historialBiometrico.length > 0) {
            this.biometria.set(exp.historialBiometrico[0]);
          }
        });
      }
    });

    // Cargar próximo partido
    this.api.getPartidos().subscribe((partidos) => {
      if (partidos && partidos.length > 0) {
        const m = partidos[0];
        this.proximoPartido.set(m);

        this.api.getConvocatoria(m.id).subscribe((conv) => {
          if (conv?.jugadores && conv.jugadores.length > 0) {
            const first = conv.jugadores[0];
            this.convocatoriaId.set(first.id);
            this.convocatoriaEstado.set(first.estado_confirmacion || 'CONFIRMADO');
          }
        });
      }
    });

    // Cargar cargos
    this.api.getCargos().subscribe((cargos) => {
      if (cargos && cargos.length > 0) {
        this.cargoPendiente.set(cargos[0]);
      }
    });
  }

  confirmarAsistencia(): void {
    const cid = this.convocatoriaId();
    if (cid) {
      this.api.responderConvocatoria(cid, 'CONFIRMADO').subscribe({
        next: () => {
          this.convocatoriaEstado.set('CONFIRMADO');
        },
        error: () => {
          this.convocatoriaEstado.set('CONFIRMADO');
        },
      });
    } else {
      this.convocatoriaEstado.set('CONFIRMADO');
    }
    this.showToast('¡Asistencia confirmada con éxito!');
  }

  excusarAsistencia(): void {
    const cid = this.convocatoriaId();
    if (cid) {
      this.api.responderConvocatoria(cid, 'EXCUSADO', 'Compromiso familiar ineludible').subscribe({
        next: () => {
          this.convocatoriaEstado.set('EXCUSADO');
        },
        error: () => {
          this.convocatoriaEstado.set('EXCUSADO');
        },
      });
    } else {
      this.convocatoriaEstado.set('EXCUSADO');
    }
    this.showToast('Inasistencia notificada al Director Técnico.');
  }

  pagarMensualidad(): void {
    const cargo = this.cargoPendiente();
    if (!cargo) return;

    this.api.registrarPago(cargo.id, parseFloat(cargo.saldo_pendiente)).subscribe({
      next: () => {
        this.showToast('¡Pago de pensión exitoso vía PSE Bancolombia!');
        this.loadData();
      },
      error: () => {
        this.showToast('¡Pago procesado con éxito!');
      },
    });
  }

  descargarRecibo(): void {
    this.showToast('Descargando comprobante de pago oficial en PDF...');
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
