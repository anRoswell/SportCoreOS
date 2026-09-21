import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="global-loading-container">
        <div class="loading-bar-track">
          <div class="loading-bar-pulse"></div>
        </div>
      </div>
    }
  `,
  styles: [`
    .global-loading-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 99999;
      pointer-events: none;
    }

    .loading-bar-track {
      width: 100%;
      height: 100%;
      background: rgba(16, 185, 129, 0.2);
      position: relative;
      overflow: hidden;
    }

    .loading-bar-pulse {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #2563eb 100%);
      box-shadow: 0 0 10px #10b981;
      animation: loadingSlide 1.2s infinite ease-in-out;
    }

    @keyframes loadingSlide {
      0% {
        left: -30%;
        width: 30%;
      }
      50% {
        left: 20%;
        width: 60%;
      }
      100% {
        left: 100%;
        width: 30%;
      }
    }
  `]
})
export class LoadingBarComponent {
  loadingService = inject(LoadingService);
}
