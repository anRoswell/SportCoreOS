import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LandingLead, LandingPage } from '../../../../core/services/api.service';

@Component({
  selector: 'app-landing-leads-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing-leads-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingLeadsModalComponent {
  @Input({ required: true }) landing: LandingPage | null = null;
  @Input({ required: true }) leads: LandingLead[] = [];
  @Input() loading = false;
  @Input() searchQuery = '';
  @Input() totalCount = 0;

  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() contactWhatsApp = new EventEmitter<LandingLead>();
  @Output() close = new EventEmitter<void>();
}
