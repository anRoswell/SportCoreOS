import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConvocadoItem } from '../../data/convocatorias.constants';
import { RolConvocatoria, EstadoConfirmacionConvocatoria } from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-convocatoria-squad-column',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './convocatoria-squad-column.component.html',
  styleUrls: ['./convocatoria-squad-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvocatoriaSquadColumnComponent {
  readonly RolConvocatoria = RolConvocatoria;
  readonly EstadoConfirmacionConvocatoria = EstadoConfirmacionConvocatoria;

  @Input({ required: true }) title: string = '';
  @Input({ required: true }) roleType!: RolConvocatoria;
  @Input({ required: true }) players: ConvocadoItem[] = [];
  @Input({ required: true }) confirmedCount: number = 0;
  @Input() iconClass: string = 'fa-solid fa-futbol text-emerald';

  @Output() addPlayer = new EventEmitter<RolConvocatoria>();
  @Output() toggleStatus = new EventEmitter<ConvocadoItem>();
  @Output() switchRole = new EventEmitter<{ player: ConvocadoItem; newRole: RolConvocatoria }>();
  @Output() removePlayer = new EventEmitter<ConvocadoItem>();

  onAdd(): void {
    this.addPlayer.emit(this.roleType);
  }

  onToggleStatus(p: ConvocadoItem): void {
    this.toggleStatus.emit(p);
  }

  onSwitchRole(p: ConvocadoItem): void {
    const targetRole = this.roleType === RolConvocatoria.TITULAR ? RolConvocatoria.SUPLENTE : RolConvocatoria.TITULAR;
    this.switchRole.emit({ player: p, newRole: targetRole });
  }

  onRemove(p: ConvocadoItem): void {
    this.removePlayer.emit(p);
  }
}
