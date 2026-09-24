import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jugador-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jugador-card.component.html'
})
export class JugadorCardComponent {
  @Input({ required: true }) jugador!: any;

  @Output() openExpediente = new EventEmitter<string>();
  @Output() openBiometria = new EventEmitter<any>();
  @Output() openEdit = new EventEmitter<any>();
  @Output() openDelete = new EventEmitter<any>();

  resolvePhotoUrl(fotoUrl?: string, genero?: string): string {
    if (fotoUrl && fotoUrl.trim()) return fotoUrl;
    return genero === 'FEMENINO'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
  }

  getEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const dob = new Date(fechaNacimiento);
    const diff = Date.now() - dob.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }

  getImcClass(imc: number | string | undefined): string {
    const val = Number(imc);
    if (!val || isNaN(val)) return '';
    if (val < 18.5) return 'imc-bajo';
    if (val <= 24.9) return 'imc-normal';
    if (val <= 29.9) return 'imc-sobrepeso';
    return 'imc-obesidad';
  }
}
