import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-jugador-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jugador-delete-dialog.component.html'
})
export class JugadorDeleteDialogComponent {
  private api = inject(ApiService);

  @Input() visible = false;
  @Input() jugador: any = null;

  @Output() close = new EventEmitter<void>();
  @Output() playerRetired = new EventEmitter<void>();

  deletingPlayer = signal<boolean>(false);

  resolvePhotoUrl(fotoUrl?: string, genero?: string): string {
    if (fotoUrl && fotoUrl.trim()) return fotoUrl;
    return genero === 'FEMENINO'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
  }

  confirmRetireJugador() {
    if (!this.jugador) return;
    this.deletingPlayer.set(true);
    this.api.deleteJugador(this.jugador.id).subscribe({
      next: () => {
        this.deletingPlayer.set(false);
        this.playerRetired.emit();
        this.close.emit();
      },
      error: (err: any) => {
        this.deletingPlayer.set(false);
        alert(err?.error?.message || 'Error al procesar la baja del jugador');
      }
    });
  }

  cerrar() {
    this.close.emit();
  }
}
