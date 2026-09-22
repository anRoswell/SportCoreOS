import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ConvocatoriaItem {
  id: string;
  partido: {
    id: string;
    rival: string;
    fecha: string;
    hora: string;
    cancha: string;
    categoria: string;
    condicion: 'LOCAL' | 'VISITANTE';
  };
  jugador: {
    nombres: string;
    apellidos: string;
  };
  posicion: string;
  dorsal: number;
  esTitular: boolean;
  estadoAsistencia: 'PENDIENTE' | 'CONFIRMADO' | 'EXCUSADO';
}

@Component({
  selector: 'app-convocatorias-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-mobile-header title="Convocatorias & Citaciones" subtitle="Nómina y Afiche Oficial"></app-mobile-header>

    <main class="page-content">
      <!-- Barra Superior de Acciones Rápidas -->
      <div class="top-action-bar">
        <div class="filter-tabs">
          <button class="tab-btn" [class.active]="filter() === 'TODAS'" (click)="setFilter('TODAS')">Todas</button>
          <button class="tab-btn" [class.active]="filter() === 'PENDIENTES'" (click)="setFilter('PENDIENTES')">Pendientes</button>
          <button class="tab-btn" [class.active]="filter() === 'CONFIRMADAS'" (click)="setFilter('CONFIRMADAS')">Confirmadas</button>
        </div>

        <button class="btn-generate-poster" (click)="abrirModalPoster()">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <span>Afiche Redes (IA)</span>
        </button>
      </div>

      <!-- Lista de Convocatorias -->
      <div class="convocatorias-list">
        @for (c of filteredConvocatorias(); track c.id) {
          <div class="convocatoria-card">
            <div class="card-top">
              <div class="match-info">
                <span class="category-badge">{{ c.partido.categoria }}</span>
                <span class="time-tag"><i class="fa-regular fa-clock"></i> {{ c.partido.fecha }} • {{ c.partido.hora }}</span>
              </div>
              <span class="status-pill" [class]="c.estadoAsistencia.toLowerCase()">
                {{ c.estadoAsistencia }}
              </span>
            </div>

            <div class="match-rival">
              <span class="vs-label">{{ c.partido.condicion }} VS</span>
              <h3 class="rival-name">{{ c.partido.rival }}</h3>
            </div>

            <div class="meta-row">
              <div class="meta-item">
                <i class="fa-solid fa-location-dot text-amber"></i>
                <span>{{ c.partido.cancha }}</span>
              </div>
              <div class="meta-item">
                <i class="fa-solid fa-shirt text-emerald"></i>
                <span>Dorsal #{{ c.dorsal }} ({{ c.posicion }})</span>
              </div>
              <div class="meta-item">
                <span class="role-tag" [class.titular]="c.esTitular">
                  {{ c.esTitular ? '★ 11 TITULAR' : 'SUPLENTE' }}
                </span>
              </div>
            </div>

            <div class="card-actions">
              <button 
                class="btn-action confirm" 
                [class.selected]="c.estadoAsistencia === 'CONFIRMADO'"
                (click)="responderConvocatoria(c.id, 'CONFIRMADO')">
                <i class="fa-solid fa-circle-check"></i> Asistiré
              </button>
              <button 
                class="btn-action excuse" 
                [class.selected]="c.estadoAsistencia === 'EXCUSADO'"
                (click)="responderConvocatoria(c.id, 'EXCUSADO')">
                <i class="fa-solid fa-circle-xmark"></i> No podré ir
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <i class="fa-solid fa-clipboard-list empty-icon"></i>
            <p class="empty-title">No hay convocatorias en este filtro</p>
            <p class="empty-desc">Las convocatorias del cuerpo técnico aparecerán aquí automáticamente.</p>
          </div>
        }
      </div>
    </main>

    <!-- MODAL GENERADOR DE AFICHE OFICIAL IA -->
    @if (showPosterModal()) {
      <div class="poster-modal-backdrop" (click)="cerrarModalPoster()">
        <div class="poster-modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title"><i class="fa-solid fa-wand-magic-sparkles text-emerald"></i> Afiche Oficial con IA</h3>
              <p class="modal-subtitle">Generado automáticamente con colores de {{ auth.activeClub().nombre }}</p>
            </div>
            <button class="btn-close-modal" (click)="cerrarModalPoster()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Canvas Preview -->
          <div class="canvas-wrapper">
            <canvas #posterCanvas width="1080" height="1350" class="responsive-canvas"></canvas>
          </div>

          <!-- Botones de Descarga y Compartir -->
          <div class="modal-actions">
            <button class="btn-primary" (click)="descargarAfiche()">
              <i class="fa-solid fa-download"></i> Descargar Imagen HD
            </button>
            <button class="btn-secondary" (click)="compartirWhatsApp()">
              <i class="fa-brands fa-whatsapp text-emerald"></i> Compartir WhatsApp
            </button>
          </div>
        </div>
      </div>
    }

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .page-content {
      padding: 1rem;
      padding-bottom: calc(85px + var(--safe-area-bottom));
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .top-action-bar {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
    }

    .filter-tabs {
      display: flex;
      flex: 1;
      gap: 4px;
      background: #ffffff;
      padding: 4px;
      border-radius: 12px;
      border: 1.5px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .tab-btn {
      flex: 1;
      padding: 7px 8px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s ease;

      &.active {
        background: #10b981;
        color: #ffffff;
        box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
      }
    }

    .btn-generate-poster {
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      color: #ffffff;
      border: none;
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 0.76rem;
      font-weight: 900;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);

      &:active {
        transform: scale(0.96);
      }
    }

    .convocatorias-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .convocatoria-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .match-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-badge {
      font-size: 0.7rem;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.15);
      color: #064e3b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .time-tag {
      font-size: 0.74rem;
      font-weight: 700;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-pill {
      font-size: 0.7rem;
      font-weight: 900;
      padding: 3px 9px;
      border-radius: 20px;
      text-transform: uppercase;

      &.pendiente {
        background: rgba(245, 158, 11, 0.12);
        color: #b45309;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      &.confirmado {
        background: rgba(16, 185, 129, 0.15);
        color: #047857;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      &.excusado {
        background: rgba(239, 68, 68, 0.12);
        color: #b91c1c;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    }

    .match-rival {
      display: flex;
      align-items: center;
      gap: 8px;

      .vs-label {
        font-size: 0.72rem;
        font-weight: 900;
        color: #94a3b8;
      }

      .rival-name {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 900;
        color: #0f172a;
      }
    }

    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      background: #f8fafc;
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      font-size: 0.78rem;
      font-weight: 700;
      color: #334155;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .role-tag {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e2e8f0;
      color: #475569;

      &.titular {
        background: rgba(245, 158, 11, 0.2);
        color: #b45309;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }
    }

    .card-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 2px;
    }

    .btn-action {
      padding: 9px 12px;
      border-radius: 10px;
      border: 1.5px solid #e2e8f0;
      background: #f8fafc;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s ease;

      &.confirm {
        color: #047857;

        &.selected, &:hover {
          background: rgba(16, 185, 129, 0.15);
          border-color: #10b981;
        }
      }

      &.excuse {
        color: #b91c1c;

        &.selected, &:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      background: #ffffff;
      border-radius: 16px;
      border: 1.5px solid #e2e8f0;

      .empty-icon {
        font-size: 2.5rem;
        color: #cbd5e1;
        margin-bottom: 10px;
      }

      .empty-title {
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 4px;
      }

      .empty-desc {
        font-size: 0.8rem;
        color: #64748b;
        margin: 0;
      }
    }

    /* MODAL DE AFICHE IA */
    .poster-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .poster-modal-content {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.25rem;
      max-width: 480px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .modal-title {
        font-size: 1.1rem;
        font-weight: 900;
        color: #0f172a;
        margin: 0;
      }

      .modal-subtitle {
        font-size: 0.74rem;
        color: #64748b;
        margin: 2px 0 0;
      }

      .btn-close-modal {
        background: transparent;
        border: none;
        font-size: 1.2rem;
        color: #94a3b8;
        cursor: pointer;
      }
    }

    .canvas-wrapper {
      background: #0f172a;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;

      .responsive-canvas {
        width: 100%;
        height: auto;
        max-height: 48vh;
        object-fit: contain;
      }
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;

      button {
        width: 100%;
        padding: 0.85rem;
        font-size: 0.88rem;
        font-weight: 900;
        border-radius: 12px;
      }
    }
  `]
})
export class ConvocatoriasMobileComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  auth = inject(AuthService);

  @ViewChild('posterCanvas') posterCanvas?: ElementRef<HTMLCanvasElement>;

  filter = signal<'TODAS' | 'PENDIENTES' | 'CONFIRMADAS'>('TODAS');
  showPosterModal = signal<boolean>(false);
  
  convocatorias = signal<ConvocatoriaItem[]>([
    {
      id: 'conv-1',
      partido: {
        id: 'match-1',
        rival: 'Atlético Nacional Sub-17',
        fecha: '24 Sep',
        hora: '15:30',
        cancha: 'Sede Deportiva Norte #2',
        categoria: 'Sub-17 Élite',
        condicion: 'LOCAL'
      },
      jugador: { nombres: 'Santiago', apellidos: 'Restrepo' },
      posicion: 'Mediocentro Defensivo',
      dorsal: 8,
      esTitular: true,
      estadoAsistencia: 'PENDIENTE'
    },
    {
      id: 'conv-2',
      partido: {
        id: 'match-2',
        rival: 'Envigado Cantera FC',
        fecha: '28 Sep',
        hora: '10:00',
        cancha: 'Estadio Polideportivo Sur',
        categoria: 'Sub-17 Élite',
        condicion: 'VISITANTE'
      },
      jugador: { nombres: 'Santiago', apellidos: 'Restrepo' },
      posicion: 'Mediocentro Defensivo',
      dorsal: 8,
      esTitular: true,
      estadoAsistencia: 'CONFIRMADO'
    }
  ]);

  filteredConvocatorias = signal<ConvocatoriaItem[]>([]);

  ngOnInit(): void {
    this.updateFilterView();
  }

  setFilter(f: 'TODAS' | 'PENDIENTES' | 'CONFIRMADAS'): void {
    this.filter.set(f);
    this.updateFilterView();
  }

  updateFilterView(): void {
    const f = this.filter();
    const all = this.convocatorias();
    if (f === 'PENDIENTES') {
      this.filteredConvocatorias.set(all.filter(c => c.estadoAsistencia === 'PENDIENTE'));
    } else if (f === 'CONFIRMADAS') {
      this.filteredConvocatorias.set(all.filter(c => c.estadoAsistencia === 'CONFIRMADO'));
    } else {
      this.filteredConvocatorias.set(all);
    }
  }

  responderConvocatoria(id: string, estado: 'CONFIRMADO' | 'EXCUSADO'): void {
    this.convocatorias.update(list => list.map(item => {
      if (item.id === id) {
        return { ...item, estadoAsistencia: estado };
      }
      return item;
    }));
    this.updateFilterView();

    if (estado === 'CONFIRMADO') {
      this.alertService.success('¡Asistencia confirmada con éxito al cuerpo técnico!');
    } else {
      this.alertService.warning('Has notificado tu no asistencia al partido.');
    }
  }

  abrirModalPoster(): void {
    this.showPosterModal.set(true);
    setTimeout(() => {
      this.renderPosterOnCanvas();
    }, 100);
  }

  cerrarModalPoster(): void {
    this.showPosterModal.set(false);
  }

  renderPosterOnCanvas(): void {
    if (!this.posterCanvas) return;
    const canvas = this.posterCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    // 1. Fondo Deportivo Gradiente
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#064e3b');
    bgGrad.addColorStop(0.35, '#0b1510');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Líneas de Campo Geométricas
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 280, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Header del Club
    ctx.textAlign = 'center';
    ctx.fillStyle = '#10b981';
    ctx.font = '900 28px sans-serif';
    ctx.fillText('SPORTCORE CLUB DEPORTIVO', W / 2, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 52px sans-serif';
    ctx.fillText('CONVOCATORIA OFICIAL', W / 2, 160);

    // 4. Tarjeta del Partido
    const heroY = 220;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(60, heroY, W - 120, 240, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '800 26px sans-serif';
    ctx.fillText('SUB-17 ÉLITE • TORNEO NACIONAL', W / 2, heroY + 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px sans-serif';
    ctx.fillText('SPORTCORE FC   VS   ATL. NACIONAL', W / 2, heroY + 120);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 24px sans-serif';
    ctx.fillText('📅 Sábado 24 Sep  •  ⏰ 15:30 (Cit: 14:00)', W / 2, heroY + 175);
    ctx.fillText('📍 Sede Deportiva Norte #2', W / 2, heroY + 210);

    // 5. Lista de Once Titular y Suplentes
    ctx.textAlign = 'left';
    ctx.fillStyle = '#10b981';
    ctx.font = '900 30px sans-serif';
    ctx.fillText('★ ONCE TITULAR', 80, 520);

    const titulares = [
      '#1 Sebastián Muñoz (POR)',
      '#4 Nicolás Zapata (DFC)',
      '#5 Alejandro Ochoa (DFC)',
      '#3 Samuel Vásquez (LI)',
      '#2 Juan Esteban Ruiz (LD)',
      '#8 Santiago Restrepo (MCD)',
      '#10 Mateo Gómez (VOL)',
      '#6 Camilo Pérez (MC)',
      '#7 Daniel Henao (ED)',
      '#11 Felipe Castro (EI)',
      '#9 Carlos Londoño (DEL)'
    ];

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 25px sans-serif';
    titulares.forEach((p, idx) => {
      const y = 570 + (idx * 46);
      ctx.fillText(p, 80, y);
    });

    // Columna Suplentes
    ctx.fillStyle = '#f59e0b';
    ctx.font = '900 30px sans-serif';
    ctx.fillText('BANCO DE SUPLENTES', W / 2 + 30, 520);

    const suplentes = [
      '#12 David Arboleda (POR)',
      '#14 Tomás Botero (DEF)',
      '#16 Lucas Cardona (MED)',
      '#17 Andrés Villa (MED)',
      '#18 Emanuel Soto (DEL)'
    ];

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 25px sans-serif';
    suplentes.forEach((p, idx) => {
      const y = 570 + (idx * 46);
      ctx.fillText(p, W / 2 + 30, y);
    });

    // 6. Footer de la gráfica
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 20px sans-serif';
    ctx.fillText('Generado con SportCore AI • sportcore.club', W / 2, H - 50);
  }

  descargarAfiche(): void {
    if (!this.posterCanvas) return;
    const link = document.createElement('a');
    link.download = 'convocatoria-oficial-sportcore.png';
    link.href = this.posterCanvas.nativeElement.toDataURL('image/png');
    link.click();
    this.alertService.success('¡Afiche oficial descargado en alta resolución!');
  }

  compartirWhatsApp(): void {
    const text = encodeURIComponent('⚽ ¡Convocatoria Oficial SportCore FC para el próximo encuentro! Consulta la citación y nómina en la App.');
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }
}
