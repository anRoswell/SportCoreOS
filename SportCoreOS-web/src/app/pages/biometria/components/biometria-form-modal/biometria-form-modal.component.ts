import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerSelectorComponent } from '../../../../shared/components/player-selector/player-selector.component';
import { FlatpickrDirective } from '../../../../shared/directives/flatpickr.directive';
import { calcularValorImc } from '../../data/biometria.helpers';

export interface NewBiometriaForm {
  jugadorId: string;
  fechaEvaluacion: string;
  pesoKg: number;
  tallaCm: number;
  testCooperMetros?: number;
  velocidad30mSeg?: number;
  saltoVerticalCm?: number;
  observaciones?: string;
}

@Component({
  selector: 'app-biometria-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSelectorComponent, FlatpickrDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './biometria-form-modal.component.html',
  styleUrl: './biometria-form-modal.component.scss',
})
export class BiometriaFormModalComponent {
  @Input({ required: true }) jugadores: any[] = [];
  @Input() saving: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<NewBiometriaForm>();

  form: NewBiometriaForm = {
    jugadorId: '',
    fechaEvaluacion: new Date().toISOString().split('T')[0],
    pesoKg: 58.5,
    tallaCm: 170.0,
    testCooperMetros: 2800,
    velocidad30mSeg: 4.15,
    saltoVerticalCm: 45.0,
    observaciones: '',
  };

  calculatedImc = signal<string>('20.2');

  ngOnInit(): void {
    if (this.jugadores && this.jugadores.length > 0 && !this.form.jugadorId) {
      this.form.jugadorId = this.jugadores[0].id;
    }
    this.calcularImc();
  }

  calcularImc(): void {
    this.calculatedImc.set(calcularValorImc(Number(this.form.pesoKg), Number(this.form.tallaCm)));
  }

  onSubmit(): void {
    this.save.emit(this.form);
  }

  onClose(): void {
    this.close.emit();
  }
}
