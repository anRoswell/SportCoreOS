import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface NoticiaClub {
  id: string;
  titulo: string;
  categoria: 'comunicado' | 'torneo' | 'viaje' | 'sede';
  fecha: string;
  imagen: string;
  resumen: string;
  contenido: string;
  requiereFirma?: boolean;
  firmado?: boolean;
}

@Component({
  selector: 'app-noticias-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="news-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Muro de Noticias & Circulares</h2>
      </div>
    </div>

    <main class="news-container">
      @for (noticia of noticias(); track noticia.id) {
        <article class="news-card" (click)="verDetalle(noticia)">
          <div class="news-image-wrap">
            <img [src]="noticia.imagen" [alt]="noticia.titulo" loading="lazy" />
            <span class="badge-cat" [class]="'cat-' + noticia.categoria">
              {{ noticia.categoria | uppercase }}
            </span>
          </div>

          <div class="news-content">
            <div class="news-date"><i class="fa-regular fa-calendar"></i> {{ noticia.fecha }}</div>
            <h3>{{ noticia.titulo }}</h3>
            <p>{{ noticia.resumen }}</p>

            @if (noticia.requiereFirma) {
              <div class="sign-alert-banner" [class.signed]="noticia.firmado">
                @if (noticia.firmado) {
                  <i class="fa-solid fa-circle-check text-success"></i>
                  <span>Consentimiento y Autorización Firmada</span>
                } @else {
                  <i class="fa-solid fa-signature text-warning"></i>
                  <span><strong>Requiere Firma de Acudiente</strong> (Toque para autorizar)</span>
                }
              </div>
            }
          </div>
        </article>
      }
    </main>

    <!-- Modal Detalle & Firma Digital Táctil -->
    @if (noticiaSeleccionada()) {
      <div class="modal-backdrop" (click)="noticiaSeleccionada.set(null)">
        <div class="modal-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3>Circular Oficial</h3>
            <button class="btn-close" (click)="noticiaSeleccionada.set(null)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="sheet-body">
            <div class="modal-news-img">
              <img [src]="noticiaSeleccionada()!.imagen" [alt]="noticiaSeleccionada()!.titulo" />
            </div>

            <div class="modal-meta-row">
              <span class="badge-cat">{{ noticiaSeleccionada()!.categoria | uppercase }}</span>
              <span class="date-txt">{{ noticiaSeleccionada()!.fecha }}</span>
            </div>

            <h2>{{ noticiaSeleccionada()!.titulo }}</h2>
            <p class="article-body">{{ noticiaSeleccionada()!.contenido }}</p>

            @if (noticiaSeleccionada()!.requiereFirma && !noticiaSeleccionada()!.firmado) {
              <div class="signature-box">
                <h4><i class="fa-solid fa-pen-nib"></i> Firma Digital de Consentimiento</h4>
                <p>Yo, como acudiente legal, autorizo la participación del deportista en el evento descrito bajo los protocolos del club.</p>
                
                <div class="canvas-mock">
                  <span class="sig-placeholder">Área táctil de firma del acudiente</span>
                </div>

                <button class="btn-sign-now" (click)="firmarDocumento()">
                  <i class="fa-solid fa-fingerprint"></i> Autorizar y Firmar Digitalmente
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .news-subbar {
      display: flex;
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
    }

    .news-container {
      padding: 1rem;
      padding-bottom: calc(75px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .news-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 1.25rem;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);

      .news-image-wrap {
        position: relative;
        width: 100%;
        height: 160px;

        img { width: 100%; height: 100%; object-fit: cover; }

        .badge-cat {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          color: #fff;

          &.cat-comunicado { background: #0f172a; }
          &.cat-torneo { background: #047857; }
          &.cat-viaje { background: #d97706; }
          &.cat-sede { background: #2563eb; }
        }
      }

      .news-content {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .news-date {
          font-size: 0.72rem;
          color: #64748b;
        }

        h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.3;
        }

        p {
          font-size: 0.82rem;
          color: #475569;
          margin: 0;
          line-height: 1.45;
        }

        .sign-alert-banner {
          background: #fffbeb;
          border: 1px solid #fde68a;
          padding: 0.65rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: #92400e;
          margin-top: 0.4rem;

          &.signed {
            background: #f0fdf4;
            border-color: #bbf7d0;
            color: #166534;
          }
        }
      }
    }

    /* Modal */
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
      gap: 0.85rem;

      .modal-news-img {
        width: 100%;
        height: 180px;
        border-radius: 12px;
        overflow: hidden;
        img { width: 100%; height: 100%; object-fit: cover; }
      }

      .modal-meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;

        .badge-cat {
          background: #047857;
          color: #fff;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 700;
        }
        .date-txt { color: #64748b; }
      }

      h2 {
        font-size: 1.2rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        line-height: 1.25;
      }

      .article-body {
        font-size: 0.88rem;
        line-height: 1.55;
        color: #334155;
        margin: 0;
      }

      .signature-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.5rem;

        h4 { font-size: 0.92rem; font-weight: 800; margin: 0; color: #0f172a; }
        p { font-size: 0.78rem; color: #64748b; margin: 0; }

        .canvas-mock {
          background: #fff;
          border: 1.5px dashed #cbd5e1;
          height: 90px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 0.78rem;
          font-style: italic;
        }

        .btn-sign-now {
          background: #047857;
          color: #fff;
          border: none;
          padding: 0.75rem;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          cursor: pointer;
        }
      }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `]
})
export class NoticiasMobileComponent {
  auth = inject(AuthService);
  noticiaSeleccionada = signal<NoticiaClub | null>(null);

  noticias = signal<NoticiaClub[]>([
    {
      id: 'news-1',
      titulo: 'Convocatoria y Viaje Oficial a Torneo Nacional Medellín 2026',
      categoria: 'viaje',
      fecha: '22 de Septiembre, 2026',
      imagen: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
      resumen: 'Se abre el proceso de inscripción y autorización para las categorías Sub-13, Sub-15 y Sub-17 para el torneo en la ciudad de Medellín.',
      contenido: 'El club participará en la Copa Nacional Élite de Fútbol Formativo. El desplazamiento se realizará el 15 de Octubre con póliza médica todo riesgo y cuerpo técnico completo. Todos los acudientes deben firmar la autorización digital antes del 30 de Septiembre.',
      requiereFirma: true,
      firmado: false
    },
    {
      id: 'news-2',
      titulo: 'Inauguración de Nuevas Luminarias LED en Campo Sintético',
      categoria: 'sede',
      fecha: '18 de Septiembre, 2026',
      imagen: 'https://images.unsplash.com/photo-1529900245534-47fbfb57836a?w=600&auto=format&fit=crop&q=80',
      resumen: 'A partir de este lunes contaremos con iluminación profesional en todas las canchas para entrenamientos nocturnos seguros.',
      contenido: 'La directiva del club culminó la instalación de las nuevas torres de iluminación de 500 Lux, permitiendo extender los horarios de entrenamiento y partidos nocturnos en condiciones óptimas de visibilidad.',
      requiereFirma: false
    }
  ]);

  verDetalle(noticia: NoticiaClub) {
    this.noticiaSeleccionada.set(noticia);
  }

  firmarDocumento() {
    const act = this.noticiaSeleccionada();
    if (!act) return;

    const list = this.noticias().map(n => n.id === act.id ? { ...n, firmado: true } : n);
    this.noticias.set(list);
    this.noticiaSeleccionada.set({ ...act, firmado: true });
    alert('¡Autorización y consentimiento firmado digitalmente con éxito!');
  }
}
