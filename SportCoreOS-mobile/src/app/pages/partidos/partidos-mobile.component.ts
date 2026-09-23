import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { environment } from '../../../environments/environment';

export interface PartidoItem {
  id: string;
  rival_nombre: string;
  categoria_nombre: string;
  fecha_partido: string;
  hora_partido: string;
  hora_citacion: string;
  sede_cancha: string;
  condicion_juego: string;
  indumentaria_kit?: string;
  estado_partido?: string;
  goles_club?: number;
  goles_rival?: number;
}

@Component({
  selector: 'app-partidos-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollingModule, MobileHeaderComponent, BottomNavComponent],
  templateUrl: './partidos-mobile.component.html',
  styleUrl: './partidos-mobile.component.scss'
})
export class PartidosMobileComponent implements OnInit {
  auth = inject(AuthService);
  alert = inject(AlertService);
  http = inject(HttpClient);

  isRefreshing = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasReachedEnd = signal<boolean>(false);
  filtroEstado = signal<'TODOS' | 'PROGRAMADO' | 'FINALIZADO'>('TODOS');

  allMatches: PartidoItem[] = [];
  displayedMatches = signal<PartidoItem[]>([]);
  private pageSize = 6;
  private currentOffset = 0;

  ngOnInit(): void {
    this.generarFixtureData();
    this.cargarMas();
  }

  trackById(index: number, item: PartidoItem): string {
    return item.id;
  }

  private generarFixtureData(): void {
    const rivales = [
      'Academia Millonarios FC',
      'Santa Fe Divisiones Menores',
      'Deportivo Cali Filial Bogotá',
      'Envigado FC Cantera de Héroes',
      'Junior Barranquilla Sub-17',
      'Atlético Nacional Filial Sabana',
      'Fortaleza CEIF Semillero',
      'La Equidad Cantera Seguros'
    ];

    const canchas = [
      'Cancha Sintética 1 - Sede Principal',
      'Complejo Arrayanes Cancha 2',
      'Estadio Olaya Herrera',
      'Club Deportivo Compensar Cancha 4',
      'Sede Deportiva Maracaná Suba'
    ];

    this.allMatches = [];
    for (let i = 1; i <= 32; i++) {
      const isPast = i <= 6;
      this.allMatches.push({
        id: `match-fix-${i}`,
        rival_nombre: rivales[(i - 1) % rivales.length],
        categoria_nombre: i % 2 === 0 ? 'Sub-15 Élite' : 'Sub-17 Talentos',
        fecha_partido: `${(i % 28) + 1}/10/2026`,
        hora_partido: '09:30 AM',
        hora_citacion: '08:30 AM',
        sede_cancha: canchas[(i - 1) % canchas.length],
        condicion_juego: i % 2 === 0 ? 'LOCAL' : 'VISITANTE',
        estado_partido: isPast ? 'FINALIZADO' : 'PROGRAMADO',
        goles_club: isPast ? Math.floor(Math.random() * 4) : 0,
        goles_rival: isPast ? Math.floor(Math.random() * 3) : 0
      });
    }
  }

  cargarMas(): void {
    if (this.isLoadingMore() || this.hasReachedEnd()) return;

    this.isLoadingMore.set(true);
    setTimeout(() => {
      let filtered = this.allMatches;
      if (this.filtroEstado() !== 'TODOS') {
        filtered = this.allMatches.filter(m => m.estado_partido === this.filtroEstado());
      }

      const nextBatch = filtered.slice(this.currentOffset, this.currentOffset + this.pageSize);
      if (nextBatch.length > 0) {
        this.displayedMatches.update(curr => [...curr, ...nextBatch]);
        this.currentOffset += this.pageSize;
      }
      if (this.currentOffset >= filtered.length) {
        this.hasReachedEnd.set(true);
      }
      this.isLoadingMore.set(false);
    }, 250);
  }

  onScrollChange(index: number): void {
    const total = this.displayedMatches().length;
    if (index >= total - 2 && !this.isLoadingMore() && !this.hasReachedEnd()) {
      this.cargarMas();
    }
  }

  setFiltro(estado: 'TODOS' | 'PROGRAMADO' | 'FINALIZADO'): void {
    this.filtroEstado.set(estado);
    this.currentOffset = 0;
    this.displayedMatches.set([]);
    this.hasReachedEnd.set(false);
    this.cargarMas();
  }

  recargarPartidos(): void {
    this.isRefreshing.set(true);
    this.currentOffset = 0;
    this.displayedMatches.set([]);
    this.hasReachedEnd.set(false);
    setTimeout(() => {
      this.cargarMas();
      this.isRefreshing.set(false);
    }, 400);
  }

  openGps(cancha: string): void {
    const query = encodeURIComponent(`Cancha ${cancha} Bogotá`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }
}
