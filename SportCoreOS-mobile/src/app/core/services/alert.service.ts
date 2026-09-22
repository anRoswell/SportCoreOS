import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertToast {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  readonly toasts = signal<AlertToast[]>([]);

  show(type: AlertType, message: string, title?: string, duration: number = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: AlertToast = {
      id,
      type,
      title: title || this.getDefaultTitle(type),
      message,
      duration
    };

    this.toasts.update((current) => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, title: string = 'Éxito'): void {
    this.show('success', message, title);
  }

  error(message: string, title: string = 'Error'): void {
    this.show('error', message, title, 5000);
  }

  warning(message: string, title: string = 'Atención'): void {
    this.show('warning', message, title);
  }

  info(message: string, title: string = 'Información'): void {
    this.show('info', message, title);
  }

  remove(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }

  private getDefaultTitle(type: AlertType): string {
    switch (type) {
      case 'success': return 'Operación Exitosa';
      case 'error': return 'Ha Ocurrido un Error';
      case 'warning': return 'Advertencia';
      case 'info': return 'Aviso';
    }
  }
}
