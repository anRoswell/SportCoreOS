import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FutPlayerStats {
  ritmo?: number;
  tiro?: number;
  pase?: number;
  regate?: number;
  defensa?: number;
  fisico?: number;
}

export interface FutPlayerData {
  nombres?: string;
  apellidos?: string;
  dorsal?: number;
  posicionCampo?: string;
  posicion_principal?: string;
  categoriaNombre?: string;
  categoria_nombre?: string;
  fotoUrl?: string;
  tier?: 'DIAMANTE' | 'ORO' | 'PLATA' | 'BRONCE' | string;
  overallRating?: number;
  stats?: FutPlayerStats;
  clubNombre?: string;
}

@Component({
  selector: 'app-fut-player-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fut-player-card" [ngClass]="'tier-' + (player.tier?.toLowerCase() || 'oro')" [class.compact]="compact">
      <div class="card-glow-fx"></div>
      
      <div class="card-top-section">
        <div class="ovr-badge-column">
          <span class="player-ovr">{{ player.overallRating || 82 }}</span>
          <span class="player-pos">{{ (player.posicionCampo || player.posicion_principal || 'VOL').substring(0, 3).toUpperCase() }}</span>
          <span class="player-tier-badge" *ngIf="!compact">{{ player.tier || 'ORO' }}</span>
        </div>

        <div class="player-avatar-box">
          <img [src]="player.fotoUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200'" [alt]="player.nombres" />
        </div>
      </div>

      <div class="player-name-banner">
        <h4>{{ player.nombres }} {{ player.apellidos }}</h4>
        <span class="club-cat-sub">{{ player.clubNombre || 'SPORTCORE ACADEMY' }} • {{ player.categoriaNombre || player.categoria_nombre || 'Sub-15' }}</span>
      </div>

      <!-- 6 ATRIBUTOS EA SPORTS / FIFA -->
      <div class="attributes-grid" *ngIf="showStats">
        <div class="attr-item">
          <span class="attr-val">{{ player.stats?.ritmo || 82 }}</span>
          <span class="attr-lbl">RIT</span>
        </div>
        <div class="attr-item">
          <span class="attr-val">{{ player.stats?.tiro || 76 }}</span>
          <span class="attr-lbl">TIR</span>
        </div>
        <div class="attr-item">
          <span class="attr-val">{{ player.stats?.pase || 84 }}</span>
          <span class="attr-lbl">PAS</span>
        </div>
        <div class="attr-item">
          <span class="attr-val">{{ player.stats?.regate || 83 }}</span>
          <span class="attr-lbl">REG</span>
        </div>
        <div class="attr-item">
          <span class="attr-val">{{ player.stats?.defensa || 64 }}</span>
          <span class="attr-lbl">DEF</span>
        </div>
        <div class="attr-item">
          <span class="attr-val">{{ player.stats?.fisico || 75 }}</span>
          <span class="attr-lbl">FIS</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fut-player-card {
      position: relative;
      width: 100%;
      max-width: 320px;
      margin: 0 auto;
      border-radius: 20px;
      padding: 1.5rem 1.25rem 1.25rem;
      color: #ffffff;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .fut-player-card:hover {
      transform: translateY(-4px) scale(1.02);
    }

    .fut-player-card.compact {
      max-width: 240px;
      padding: 1rem 0.85rem 0.85rem;
      border-radius: 14px;
    }

    /* TIERS THEMING */
    .tier-diamante {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 40%, #075985 100%);
      border: 2px solid #7dd3fc;
    }
    .tier-oro {
      background: linear-gradient(135deg, #d97706 0%, #b45309 40%, #78350f 100%);
      border: 2px solid #fde047;
    }
    .tier-plata {
      background: linear-gradient(135deg, #64748b 0%, #475569 40%, #334155 100%);
      border: 2px solid #cbd5e1;
    }
    .tier-bronce {
      background: linear-gradient(135deg, #9a3412 0%, #7c2d12 40%, #431407 100%);
      border: 2px solid #fdba74;
    }

    .card-glow-fx {
      position: absolute;
      top: -30%;
      right: -20%;
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.2);
      filter: blur(40px);
      border-radius: 50%;
      pointer-events: none;
    }

    .card-top-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .ovr-badge-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
    }

    .player-ovr {
      font-size: 2.4rem;
      font-weight: 900;
      line-height: 1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    }

    .compact .player-ovr {
      font-size: 1.8rem;
    }

    .player-pos {
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .player-tier-badge {
      font-size: 0.65rem;
      font-weight: 800;
      background: rgba(0, 0, 0, 0.35);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      margin-top: 0.2rem;
    }

    .player-avatar-box {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.4);
      overflow: hidden;
      background: rgba(0, 0, 0, 0.2);
    }

    .compact .player-avatar-box {
      width: 70px;
      height: 70px;
    }

    .player-avatar-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .player-name-banner {
      text-align: center;
      padding: 0.5rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      margin-bottom: 0.75rem;
    }

    .player-name-banner h4 {
      font-size: 1.1rem;
      font-weight: 800;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .compact .player-name-banner h4 {
      font-size: 0.95rem;
    }

    .club-cat-sub {
      font-size: 0.65rem;
      opacity: 0.85;
      font-weight: 600;
    }

    .attributes-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.2);
      padding: 0.65rem 0.5rem;
      border-radius: 10px;
    }

    .attr-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.1rem;
    }

    .attr-val {
      font-size: 1.05rem;
      font-weight: 800;
      line-height: 1;
    }

    .compact .attr-val {
      font-size: 0.9rem;
    }

    .attr-lbl {
      font-size: 0.65rem;
      font-weight: 700;
      opacity: 0.8;
    }
  `]
})
export class FutPlayerCardComponent {
  @Input({ required: true }) player!: FutPlayerData;
  @Input() showStats: boolean = true;
  @Input() compact: boolean = false;
}
