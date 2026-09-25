import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlatpickrDirective } from '../../../../shared/directives/flatpickr.directive';
import { ProspectoFormData } from '../../data/scouting.constants';

@Component({
  selector: 'app-scouting-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  templateUrl: './scouting-form-modal.component.html',
  styleUrls: ['./scouting-form-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoutingFormModalComponent {
  @Input({ required: true }) posiciones: any[] = [];
  @Input({ required: true }) piernasHabiles: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ form: ProspectoFormData; file: File | null }>();

  prospectoForm: ProspectoFormData = {
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '2010-05-12',
    posicion_principal: 'delantero',
    pierna_habil: 'Derecha',
    club_origen: '',
    ciudad: 'Cali',
    telefono_contacto: '',
  };

  selectedFile: File | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (!this.prospectoForm.nombres || !this.prospectoForm.apellidos) return;
    this.save.emit({
      form: this.prospectoForm,
      file: this.selectedFile
    });
  }
}
