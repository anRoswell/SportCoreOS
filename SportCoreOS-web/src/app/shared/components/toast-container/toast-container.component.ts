import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrapper">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type" role="alert">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <i class="fa-solid fa-circle-check"></i> }
              @case ('error') { <i class="fa-solid fa-circle-xmark"></i> }
              @case ('warning') { <i class="fa-solid fa-triangle-exclamation"></i> }
              @case ('info') { <i class="fa-solid fa-circle-info"></i> }
            }
          </div>

          <div class="toast-content">
            @if (toast.title) {
              <strong class="toast-title">{{ toast.title }}</strong>
            }
            <p class="toast-message">{{ toast.message }}</p>
          </div>

          <button class="toast-close-btn" (click)="notificationService.remove(toast.id)" aria-label="Cerrar notificación">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-wrapper {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 99990;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      max-width: 420px;
      width: calc(100vw - 3rem);
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.85rem 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      box-shadow: var(--shadow-dropdown);
      animation: toastSlideIn 0.25s ease-out;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 4px;
      }

      &.toast-success {
        border-color: rgba(16, 185, 129, 0.4);
        &::before { background: #10b981; }
        .toast-icon i { color: #10b981; }
      }

      &.toast-error {
        border-color: rgba(239, 68, 68, 0.4);
        &::before { background: #ef4444; }
        .toast-icon i { color: #ef4444; }
      }

      &.toast-warning {
        border-color: rgba(245, 158, 11, 0.4);
        &::before { background: #f59e0b; }
        .toast-icon i { color: #f59e0b; }
      }

      &.toast-info {
        border-color: rgba(59, 130, 246, 0.4);
        &::before { background: #3b82f6; }
        .toast-icon i { color: #3b82f6; }
      }
    }

    @keyframes toastSlideIn {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .toast-icon {
      font-size: 1.15rem;
      padding-top: 0.1rem;
      flex-shrink: 0;
    }

    .toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;

      .toast-title {
        font-size: 0.825rem;
        font-weight: 800;
        color: var(--text-heading);
      }

      .toast-message {
        font-size: 0.775rem;
        color: var(--text-body);
        line-height: 1.4;
      }
    }

    .toast-close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0.1rem;
      transition: color 0.15s ease;

      &:hover {
        color: var(--text-main);
      }
    }
  `]
})
export class ToastContainerComponent {
  notificationService = inject(NotificationService);
}
