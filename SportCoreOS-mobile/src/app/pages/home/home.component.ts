import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { MatchCardComponent } from '../../shared/components/match-card/match-card.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent, MatchCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  alert = inject(AlertService);
  private http = inject(HttpClient);

  readonly proximoPartido = signal<any | null>(null);

  getPrimerNombre(): string {
    const nombres = this.auth.currentUser()?.nombres;
    if (!nombres) return 'Deportista';
    return nombres.split(' ')[0] || 'Deportista';
  }

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/partidos`).subscribe({
      next: (res) => {
        const partidos = Array.isArray(res) ? res : (res?.data || []);
        if (partidos.length > 0) {
          this.proximoPartido.set(partidos[0]);
        } else {
          this.setFallbackMatch();
        }
      },
      error: () => {
        this.setFallbackMatch();
      }
    });
  }

  private setFallbackMatch(): void {
    this.proximoPartido.set({
      id: 'partido-demo-1',
      rival_nombre: 'Atlético Nacional Cantera',
      categoria_nombre: 'Sub-15 Élite',
      fecha_partido: '28 de Septiembre, 2026',
      hora_partido: '10:30 AM',
      hora_citacion: '09:30 AM',
      sede_cancha: 'Cancha Sintética Principal Los Arrayanes'
    });
  }

  openGps(cancha?: string): void {
    const query = encodeURIComponent(`Cancha ${cancha || 'Los Arrayanes'} Bogotá`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }

  onSupportClick(): void {
    this.alert.info('Conectando con la línea oficial de atención WhatsApp de tu club...', 'Atención al Deportista');
  }
}
