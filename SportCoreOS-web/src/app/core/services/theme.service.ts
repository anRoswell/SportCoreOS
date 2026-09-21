import { Injectable, signal, effect } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly STORAGE_KEY = 'futcore_theme';
  
  // Clean Light theme by default
  readonly currentTheme = signal<AppTheme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
    });
  }

  private getInitialTheme(): AppTheme {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as AppTheme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    }
    // Clean light theme by default
    return 'light';
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.STORAGE_KEY, theme);
      }
    }
  }

  toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.currentTheme.set(nextTheme);
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
  }

  isDark(): boolean {
    return this.currentTheme() === 'dark';
  }
}
