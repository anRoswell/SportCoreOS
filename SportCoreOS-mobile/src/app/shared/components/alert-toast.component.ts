import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, AlertToast } from '../../core/services/alert.service';

@Component({
  selector: 'app-alert-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack">
      @for (t of alertService.toasts(); track t.id) {
        <div class="mobile-toast" [class]="'toast-' + t.type" (click)="alertService.remove(t.id)">
          <div class="toast-icon">
            @switch (t.type) {
              @case ('success') { <i class="fa-solid fa-circle-check"></i> }
              @case ('error') { <i class="fa-solid fa-circle-exclamation"></i> }
              @case ('warning') { <i class="fa-solid fa-triangle-exclamation"></i> }
              @case ('info') { <i class="fa-solid fa-circle-info"></i> }
            }
          </div>
          <div class="toast-content">
            <h5 class="toast-title">{{ t.title }}</h5>
            <p class="toast-message">{{ t.message }}</p>
          </div>
          <button class="toast-close" (click)="alertService.remove(t.id); $event.stopPropagation()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      top: calc(var(--safe-area-top) + 1rem);
      left: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      z-index: 100000;
      pointer-events: none;
    }

    .mobile-toast {
      pointer-events: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      box-shadow: var(--shadow-elevated);
      animation: slideInDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;

      &.toast-success {
        border-left: 4px solid var(--color-primary);
        .toast-icon { color: var(--color-primary); }
      }

      &.toast-error {
        border-left: 4px solid var(--color-danger);
        .toast-icon { color: var(--color-danger); }
      }

      &.toast-warning {
        border-left: 4px solid var(--color-amber);
        .toast-icon { color: var(--color-amber); }
      }

      &.toast-info {
        border-left: 4px solid var(--color-blue);
        .toast-icon { color: var(--color-blue); }
      }
    }

    .toast-icon {
      font-size: 1.1rem;
      margin-top: 0.1rem;
    }

    .toast-content {
      flex: 1;

      .toast-title {
        font-size: 0.85rem;
        font-weight: 800;
        margin-bottom: 0.15rem;
      }

      .toast-message {
        font-size: 0.78rem;
        color: var(--text-muted);
        line-height: 1.35;
      }
    }

    .toast-close {
      background: transparent;
      border: none;
      color: var(--text-dim);
      font-size: 0.85rem;
      cursor: pointer;
      padding: 0.2rem;
    }

    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class AlertToastComponent {
  alertService = inject(AlertService);
}
