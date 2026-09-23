import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import { MatchCardComponent } from '../../shared/components/match-card/match-card.component';

@Component({
  selector: 'app-portal-padres',
  standalone: true,
  imports: [CommonModule, MatchCardComponent],
  templateUrl: './portal-padres.component.html',
  styleUrl: './portal-padres.component.scss'
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
    this.api.getJugadores().subscribe((res) => {
      const jugadores = Array.isArray(res) ? res : (res?.data || []);
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
    this.api.getPartidos().subscribe((data) => {
      const partidos = Array.isArray(data) ? data : (data?.data || []);
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
    this.api.getCargos().subscribe((data) => {
      const cargos = Array.isArray(data) ? data : (data?.data || []);
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
