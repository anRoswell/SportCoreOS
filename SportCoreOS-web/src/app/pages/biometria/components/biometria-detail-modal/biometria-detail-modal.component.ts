import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluacionBiometrica } from '../../data/biometria.helpers';
import { obtenerEtiquetaImc, calcularDiagnosticoBiometrico } from '../../data/biometria.helpers';

@Component({
  selector: 'app-biometria-detail-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './biometria-detail-modal.component.html',
  styleUrl: './biometria-detail-modal.component.scss',
})
export class BiometriaDetailModalComponent {
  @Input({ required: true }) medicion!: EvaluacionBiometrica;
  @Output() close = new EventEmitter<void>();

  getImcLabel(imc: string | number | undefined): string {
    return obtenerEtiquetaImc(imc);
  }

  getDiagnostico(m: EvaluacionBiometrica) {
    return calcularDiagnosticoBiometrico(m);
  }

  onClose(): void {
    this.close.emit();
  }
}
