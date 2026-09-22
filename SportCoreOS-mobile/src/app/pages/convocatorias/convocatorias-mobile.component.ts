import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AlertService } from '../../core/services/alert.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ConvocatoriaItem {
  id: string;
  partido: {
    rival: string;
    fecha: string;
    hora: string;
    cancha: string;
    categoria: string;
  };
  posicion: string;
  dorsal: number;
  esTitular: boolean;
  estadoAsistencia: 'PENDIENTE' | 'CONFIRMADO' | 'EXCUSADO';
}

@Component({
  selector: 'app-convocatorias-mobile',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-mobile-header title="Mis Convocatorias" subtitle="Confirma tu asistencia a partidos"></app-mobile-header>

    <main class="page-content">
      <div class="filter-tabs">
        <button class="tab-btn" [class.active]="filter() === 'TODAS'" (click)="filter.set('TODAS')">Todas</button>
        <button class="tab-btn" [class.active]="filter() === 'PENDIENTES'" (click)="filter.set('PENDIENTES')">Pendientes</button>
        <button class="tab-btn" [class.active]="filter() === 'CONFIRMADAS'" (click)="filter.set('CONFIRMADAS')">Confirmadas</button>
      </div>

      <div class="convocatorias-list">
        @for (c of filteredConvocatorias(); track c.id) {
          <div class="convocatoria-card">
            <div class="card-top">
              <div class="match-info">
                <span class="category-badge">{{ c.partido.categoria }}</span>
                <span class="time-tag"><i class="fas fa-clock"></i> {{ c.partido.fecha }} • {{ c.partido.hora }}</span>
              </div>
              <span class="status-pill" [class]="c.estadoAsistencia.toLowerCase()">
                {{ c.estadoAsistencia }}
              </span>
            </div>

            <div class="match-rival">
              <span class="vs-label">VS</span>
              <h3 class="rival-name">{{ c.partido.rival }}</h3>
            </div>

            <div class="meta-row">
              <div class="meta-item">
                <i class="fas fa-map-pin"></i>
                <span>{{ c.partido.cancha }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-tshirt"></i>
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
                <i class="fas fa-check-circle"></i> Asistiré
              </button>
              <button 
                class="btn-action excuse" 
                [class.selected]="c.estadoAsistencia === 'EXCUSADO'"
                (click)="responderConvocatoria(c.id, 'EXCUSADO')">
                <i class="fas fa-times-circle"></i> No podré ir
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <i class="fas fa-clipboard-list empty-icon"></i>
            <p class="empty-title">No hay convocatorias en este filtro</p>
            <p class="empty-desc">Las convocatorias del cuerpo técnico aparecerán aquí automáticamente.</p>
          </div>
        }
      </div>
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .page-content {
      padding: 16px;
      padding-bottom: 96px;
      max-width: 600px;
      margin: 0 auto;
    }

    .filter-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      background: var(--bg-card);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }

    .tab-btn {
      flex: 1;
      padding: 8px 12px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &.active {
        background: var(--primary);
        color: #022c22;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      }
    }

    .convocatorias-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .convocatoria-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
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
      font-size: 0.72rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.15);
      color: var(--primary);
      text-transform: uppercase;
    }

    .time-tag {
      font-size: 0.75rem;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-pill {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;

      &.pendiente {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      &.confirmado {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      &.excusado {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    }

    .match-rival {
      display: flex;
      align-items: center;
      gap: 8px;

      .vs-label {
        font-size: 0.75rem;
        font-weight: 900;
        color: var(--text-muted);
      }

      .rival-name {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary);
      }
    }

    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      background: rgba(0, 0, 0, 0.2);
      padding: 10px 12px;
      border-radius: 10px;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;

      i {
        color: var(--primary);
      }
    }

    .role-tag {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-secondary);

      &.titular {
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
      }
    }

    .card-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 4px;
    }

    .btn-action {
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: rgba(255, 255, 255, 0.05);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;

      &.confirm {
        color: #10b981;

        &.selected, &:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
        }
      }

      &.excuse {
        color: #ef4444;

        &.selected, &:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      background: var(--bg-card);
      border-radius: 16px;
      border: 1px solid var(--border-color);

      .empty-icon {
        font-size: 2.5rem;
        color: var(--text-muted);
        margin-bottom: 12px;
      }

      .empty-title {
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 6px 0;
      }

      .empty-desc {
        font-size: 0.85rem;
        color: var(--text-secondary);
        margin: 0;
      }
    }
  `]
})
export class ConvocatoriasMobileComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);

  filter = signal<'TODAS' | 'PENDIENTES' | 'CONFIRMADAS'>('TODAS');
  
  convocatorias = signal<ConvocatoriaItem[]>([
    {
      id: 'conv-1',
      partido: {
        rival: 'Atlético Nacional Sub-17',
        fecha: '24 Sep',
        hora: '15:30',
        cancha: 'Sede Deportiva Norte #2',
        categoria: 'Sub-17 Élite'
      },
      posicion: 'Mediocentro Defensivo',
      dorsal: 8,
      esTitular: true,
      estadoAsistencia: 'PENDIENTE'
    },
    {
      id: 'conv-2',
      partido: {
        rival: 'Envigado Cantera FC',
        fecha: '28 Sep',
        hora: '10:00',
        cancha: 'Estadio Polideportivo Sur',
        categoria: 'Sub-17 Élite'
      },
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
}
