import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerSelectorComponent } from '../../../../shared/components/player-selector/player-selector.component';
import { RolConvocatoria } from '../../../../core/enums/domain.enums';
import { PartidoConvocatoria } from '../../data/convocatorias.constants';

@Component({
  selector: 'app-convocatoria-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSelectorComponent],
  templateUrl: './convocatoria-add-modal.component.html',
  styleUrls: ['./convocatoria-add-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvocatoriaAddModalComponent {
  readonly RolConvocatoria = RolConvocatoria;

  @Input({ required: true }) match: PartidoConvocatoria | null = null;
  @Input() initialRole: RolConvocatoria = RolConvocatoria.TITULAR;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ jugadorId: string; rol: RolConvocatoria; posicion: string }>();

  selectedPlayerId = signal<string>('');
  selectedRole: RolConvocatoria = RolConvocatoria.TITULAR;
  selectedPos: string = '';

  ngOnInit(): void {
    this.selectedRole = this.initialRole;
  }

  onPlayerSelected(playerOrId: any): void {
    if (!playerOrId) {
      this.selectedPlayerId.set('');
      return;
    }
    const id = typeof playerOrId === 'string' ? playerOrId : playerOrId?.id;
    if (id) {
      this.selectedPlayerId.set(id);
      if (typeof playerOrId === 'object' && playerOrId?.posicion_principal && !this.selectedPos) {
        this.selectedPos = playerOrId.posicion_principal;
      }
    }
  }

  onSubmit(): void {
    const jugadorId = this.selectedPlayerId();
    if (!jugadorId) return;

    this.confirm.emit({
      jugadorId,
      rol: this.selectedRole,
      posicion: this.selectedPos
    });
  }
}
