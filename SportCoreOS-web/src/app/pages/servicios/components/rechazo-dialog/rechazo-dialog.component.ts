import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rechazo-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rechazo-dialog.component.html'
})
export class RechazoDialogComponent {
  @Input() visible = false;
  @Input() isApproving = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<string>();

  motivo = signal<string>('');

  confirmarRechazo() {
    this.confirmar.emit(this.motivo());
  }

  cerrar() {
    this.motivo.set('');
    this.close.emit();
  }
}
