import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService, FootballQuote } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-bar.component.html',
  styleUrl: './loading-bar.component.scss'
})
export class LoadingBarComponent {
  loadingService = inject(LoadingService);

  currentQuote() {
    return this.loadingService.currentQuote();
  }

  selectTheme(theme: FootballQuote['theme']): void {
    this.loadingService.setTheme(theme);
  }

  getShortThemeName(theme: FootballQuote['theme']): string {
    switch (theme) {
      case 'BLUELOCK': return 'Blue Lock';
      case 'SUPERCAMPEONES': return 'Oliver Atom';
      case 'CR7': return 'CR7 (Siuuu)';
      case 'MESSI': return 'Leo Messi';
      case 'HYUGA': return 'Steve Hyuga';
      case 'BENJI': return 'Benji Price';
      default: return theme;
    }
  }
}
