import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, AlertToast } from '../../core/services/alert.service';

@Component({
  selector: 'app-alert-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-toast.component.html',
  styleUrl: './alert-toast.component.scss'
})
export class AlertToastComponent {
  alertService = inject(AlertService);
}
