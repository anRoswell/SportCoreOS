import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProspectoItem, RubricaFormData } from '../../data/scouting.constants';

@Component({
  selector: 'app-scouting-rubrica-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scouting-rubrica-modal.component.html',
  styleUrls: ['./scouting-rubrica-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoutingRubricaModalComponent {
  @Input({ required: true }) prospecto: ProspectoItem | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<RubricaFormData>();

  rubricaForm: RubricaFormData = {
    nota_tecnica: 8.5,
    nota_tactica: 8.0,
    nota_fisica: 8.5,
    nota_mental: 9.0,
    comentarios: '',
  };

  onSubmit(): void {
    this.save.emit(this.rubricaForm);
  }
}
