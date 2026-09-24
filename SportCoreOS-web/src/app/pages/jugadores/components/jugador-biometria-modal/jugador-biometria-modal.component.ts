import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-jugador-biometria-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jugador-biometria-modal.component.html'
})
export class JugadorBiometriaModalComponent {
  private api = inject(ApiService);

  @Input() visible = false;
  @Input() jugador: any = null;

  @Output() close = new EventEmitter<void>();
  @Output() biometriaSaved = new EventEmitter<void>();

  savingBio = false;

  newBioData = {
    pesoKg: 58.5,
    tallaCm: 168.0,
    testCooperMetros: 2850,
    velocidad30mSeg: 3.92,
    saltoVerticalCm: 44.0,
    observaciones: 'Buena potencia aeróbica y resistencia general.',
  };

  calculateLiveImc(): number {
    if (this.newBioData.tallaCm > 0 && this.newBioData.pesoKg > 0) {
      const estaturaMetros = this.newBioData.tallaCm / 100;
      const imc = this.newBioData.pesoKg / (estaturaMetros * estaturaMetros);
      return Number(imc.toFixed(2));
    }
    return 0;
  }

  getImcClass(imc: number | string | undefined): string {
    const val = Number(imc);
    if (!val || isNaN(val)) return '';
    if (val < 18.5) return 'imc-bajo';
    if (val <= 24.9) return 'imc-normal';
    if (val <= 29.9) return 'imc-sobrepeso';
    return 'imc-obesidad';
  }

  getImcLabel(imc: number | string | undefined): string {
    const val = Number(imc);
    if (!val || isNaN(val)) return '-';
    if (val < 18.5) return 'Bajo Peso';
    if (val <= 24.9) return 'Normopeso';
    if (val <= 29.9) return 'Sobrepeso';
    return 'Obesidad';
  }

  submitBiometria() {
    if (!this.jugador) return;
    this.savingBio = true;
    this.api.addBiometria(this.jugador.id, this.newBioData).subscribe({
      next: () => {
        this.savingBio = false;
        this.biometriaSaved.emit();
        this.close.emit();
      },
      error: (err: any) => {
        this.savingBio = false;
        alert(err?.error?.message || 'Error al registrar biometría');
      }
    });
  }

  cerrar() {
    this.close.emit();
  }
}
