import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner.component';
import { AlertToastComponent } from './shared/components/alert-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoadingSpinnerComponent,
    AlertToastComponent
  ],
  template: `
    <!-- Top global loading bar & overlay -->
    <app-loading-spinner></app-loading-spinner>

    <!-- Global alert toasts -->
    <app-alert-toast></app-alert-toast>

    <!-- Mobile view routing outlet -->
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--bg-main);
      color: var(--text-primary);
    }
  `]
})
export class AppComponent {}
