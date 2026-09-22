import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
  imports: [CommonModule, RouterModule, ScrollingModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="news-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Muro de Noticias & Circulares</h2>
      </div>
      <div class="subbar-right">
        <span class="count-badge">{{ displayedNoticias().length }} de {{ totalDisponibles }}</span>
        <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarNoticias()" title="Actualizar">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
      </div>
    </div>

    <main class="news-container">
      <!-- Cdk Virtual Scroll Viewport para máximo rendimiento en DOM -->
      <cdk-virtual-scroll-viewport 
        itemSize="330" 
        class="news-viewport"
        (scrolledIndexChange)="onScrollChange($event)">
        
        <div *cdkVirtualFor="let noticia of displayedNoticias(); trackBy: trackById" class="news-card-wrapper">
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
        </div>

        <!-- Indicador de Carga de Infinite Scroll -->
        @if (isLoadingMore()) {
          <div class="infinite-loading-box">
            <i class="fa-solid fa-circle-notch fa-spin text-primary"></i>
            <span>Cargando más publicaciones oficiales...</span>
          </div>
        } @else if (hasReachedEnd()) {
          <div class="infinite-end-box">
            <i class="fa-solid fa-check-double text-emerald"></i>
            <span>Has llegado al final de las circulares publicadas</span>
          </div>
        }
      </cdk-virtual-scroll-viewport>
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
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
      }

      .subbar-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .count-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #475569;
          background: #f1f5f9;
          padding: 3px 8px;
          border-radius: 9999px;
        }

        .btn-icon-refresh {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;

          &.spinning i {
            animation: spin 0.8s linear infinite;
          }
        }
      }
    }

    .news-container {
      height: calc(100vh - 135px - var(--safe-area-bottom));
      height: calc(100dvh - 135px - var(--safe-area-bottom));
      overflow: hidden;
    }

    .news-viewport {
      height: 100%;
      width: 100%;
      padding: 0.85rem 1rem;
      box-sizing: border-box;
    }

    .news-card-wrapper {
      height: 330px;
      padding-bottom: 1rem;
      box-sizing: border-box;
    }

    .news-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 1.25rem;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      height: 100%;
      display: flex;
      flex-direction: column;

      .news-image-wrap {
        position: relative;
        width: 100%;
        height: 140px;
        flex-shrink: 0;

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
        padding: 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        flex: 1;

        .news-date {
          font-size: 0.7rem;
          color: #64748b;
        }

        h3 {
          font-size: 0.98rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          line-height: 1.25;
        }

        p {
          font-size: 0.78rem;
          color: #475569;
          margin: 0;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sign-alert-banner {
          background: #fffbeb;
          border: 1px solid #fde68a;
          padding: 0.5rem;
          border-radius: 8px;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: auto;

          &.signed {
            background: #ecfdf5;
            border-color: #a7f3d0;
            color: #065f46;
          }
        }
      }
    }

    .infinite-loading-box, .infinite-end-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 1rem;
      font-size: 0.76rem;
      font-weight: 700;
      color: #64748b;
    }

    /* Modal Sheet */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 9999;
      display: flex;
      align-items: flex-end;
    }

    .modal-sheet {
      background: #fff;
      width: 100%;
      max-height: 85vh;
      border-radius: 1.5rem 1.5rem 0 0;
      overflow-y: auto;
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);

      .sheet-header {
        position: sticky;
        top: 0;
        background: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e2e8f0;

        h3 { font-size: 1rem; font-weight: 800; margin: 0; color: #0f172a; }
        .btn-close { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; }
      }

      .sheet-body {
        padding: 1.25rem;

        .modal-news-img {
          width: 100%;
          height: 180px;
          border-radius: 1rem;
          overflow: hidden;
          margin-bottom: 1rem;
          img { width: 100%; height: 100%; object-fit: cover; }
        }

        .modal-meta-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          .badge-cat { font-size: 0.68rem; font-weight: 800; background: #0f172a; color: #fff; padding: 2px 6px; border-radius: 4px; }
          .date-txt { font-size: 0.75rem; color: #64748b; }
        }

        h2 { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0 0 0.75rem; }
        .article-body { font-size: 0.88rem; color: #334155; line-height: 1.6; margin-bottom: 1.5rem; }

        .signature-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1rem;

          h4 { font-size: 0.9rem; font-weight: 800; color: #0f172a; margin: 0 0 0.4rem; display: flex; align-items: center; gap: 0.4rem; }
          p { font-size: 0.75rem; color: #64748b; margin: 0 0 0.75rem; line-height: 1.4; }

          .canvas-mock {
            height: 90px;
            background: #fff;
            border: 1.5px dashed #cbd5e1;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.75rem;

            .sig-placeholder { font-size: 0.72rem; color: #94a3b8; font-style: italic; }
          }

          .btn-sign-now {
            width: 100%;
            padding: 0.75rem;
            background: #047857;
            color: #fff;
            border: none;
            border-radius: 0.75rem;
            font-size: 0.82rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            cursor: pointer;
          }
        }
      }
    }

    @keyframes spin { 100% { transform: rotate(360deg); } }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  `]
})
export class NoticiasMobileComponent implements OnInit {
  auth = inject(AuthService);
  noticiaSeleccionada = signal<NoticiaClub | null>(null);
  isRefreshing = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasReachedEnd = signal<boolean>(false);

  // Buffer de datos para Infinite Scroll
  private allNoticias: NoticiaClub[] = [];
  displayedNoticias = signal<NoticiaClub[]>([]);
  totalDisponibles = 0;
  private pageSize = 5;
  private currentOffset = 0;

  ngOnInit(): void {
    this.generarCatalogoNoticias();
    this.cargarMasNoticias();
  }

  trackById(index: number, item: NoticiaClub): string {
    return item.id;
  }

  private generarCatalogoNoticias(): void {
    const baseList: NoticiaClub[] = [
      {
        id: 'news-1',
        titulo: 'Convocatoria y Viaje Oficial a Torneo Nacional Medellín 2026',
        categoria: 'viaje',
        fecha: '22 de Septiembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
        resumen: 'Se abre el proceso de inscripción y autorización para las categorías Sub-13, Sub-15 y Sub-17 para el torneo en Medellín.',
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
      },
      {
        id: 'news-3',
        titulo: 'Visoría Oficial Club Atlético Nacional & Detección de Talentos',
        categoria: 'torneo',
        fecha: '15 de Septiembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
        resumen: 'Veedores de primera división evaluarán a nuestros deportistas destacados de las categorías Sub-15 y Sub-17.',
        contenido: 'Jornada especial de evaluación técnica y física con presencia del departamento de scouting profesional. Los jugadores deben presentarse con indumentaria oficial completa.',
        requiereFirma: true,
        firmado: true
      },
      {
        id: 'news-4',
        titulo: 'Taller de Nutrición e Hidratación Deportiva para Acudientes',
        categoria: 'comunicado',
        fecha: '12 de Septiembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
        resumen: 'Aprende a estructurar la alimentación pre y post-competitiva para potenciar el rendimiento y recuperación.',
        contenido: 'Capacitación virtual y presencial dictada por la nutricionista deportiva del club. Se entregarán guías descargables con menús semanales de alta energía.',
        requiereFirma: false
      },
      {
        id: 'news-5',
        titulo: 'Entrega de Nuevos Kits de Entrenamiento Oficial 2026',
        categoria: 'sede',
        fecha: '08 de Septiembre, 2026',
        imagen: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&auto=format&fit=crop&q=80',
        resumen: 'Los kits de indumentaria deportiva ya se encuentran disponibles para reclamo en la sede administrativa.',
        contenido: 'Cada deportista recibirá camiseta de presentación, pantaloneta y medias. Verificar tallaje previamente con el coordinador de tienda.',
        requiereFirma: false
      }
    ];

    // Multiplicar elementos para simular histórico de 30 noticias con virtual scroll
    this.allNoticias = [];
    for (let i = 0; i < 6; i++) {
      baseList.forEach(item => {
        this.allNoticias.push({
          ...item,
          id: `${item.id}-${i}`,
          titulo: i === 0 ? item.titulo : `${item.titulo} (Edición ${2026 - i})`,
          fecha: `${Math.max(1, 22 - (i * 3))} de Agosto, 2026`
        });
      });
    }
    this.totalDisponibles = this.allNoticias.length;
  }

  cargarMasNoticias(): void {
    if (this.isLoadingMore() || this.hasReachedEnd()) return;

    this.isLoadingMore.set(true);
    setTimeout(() => {
      const nextBatch = this.allNoticias.slice(this.currentOffset, this.currentOffset + this.pageSize);
      if (nextBatch.length > 0) {
        this.displayedNoticias.update(current => [...current, ...nextBatch]);
        this.currentOffset += this.pageSize;
      }
      if (this.currentOffset >= this.allNoticias.length) {
        this.hasReachedEnd.set(true);
      }
      this.isLoadingMore.set(false);
    }, 400);
  }

  onScrollChange(index: number): void {
    const totalLoaded = this.displayedNoticias().length;
    // Si el usuario hace scroll cerca del final (a 2 elementos del límite cargado)
    if (index >= totalLoaded - 2 && !this.isLoadingMore() && !this.hasReachedEnd()) {
      this.cargarMasNoticias();
    }
  }

  recargarNoticias(): void {
    this.isRefreshing.set(true);
    this.currentOffset = 0;
    this.displayedNoticias.set([]);
    this.hasReachedEnd.set(false);

    setTimeout(() => {
      this.cargarMasNoticias();
      this.isRefreshing.set(false);
    }, 500);
  }

  verDetalle(noticia: NoticiaClub) {
    this.noticiaSeleccionada.set(noticia);
  }

  firmarDocumento() {
    const act = this.noticiaSeleccionada();
    if (!act) return;

    const list = this.displayedNoticias().map(n => n.id === act.id ? { ...n, firmado: true } : n);
    this.displayedNoticias.set(list);
    this.noticiaSeleccionada.set({ ...act, firmado: true });
    alert('¡Autorización y consentimiento firmado digitalmente con éxito!');
  }
}
