import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="mobile-loading-bar"></div>
      <div class="mobile-loading-backdrop">
        <div class="spinner-card">
          <div class="spinner-pulse"></div>
          <p class="loading-label">Cargando datos...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .mobile-loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #10b981, #3b82f6, #10b981);
      background-size: 200% 100%;
      animation: gradientMove 1.2s linear infinite;
      z-index: 99999;
    }

    .mobile-loading-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(7, 11, 20, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99998;
    }

    .spinner-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      box-shadow: var(--shadow-elevated);
    }

    .spinner-pulse {
      width: 40px;
      height: 40px;
      border: 3px solid var(--color-primary-subtle);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-muted);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes gradientMove {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
  `]
})
export class LoadingSpinnerComponent {
  loadingService = inject(LoadingService);
}
