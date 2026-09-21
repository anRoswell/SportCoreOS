import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  readonly toasts = signal<ToastMessage[]>([]);

  show(type: ToastType, message: string, title?: string, duration: number = 4500): string {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9) + Date.now();
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
      timestamp: Date.now(),
    };

    this.toasts.update((current) => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  success(message: string, title: string = 'Operación Exitosa'): string {
    return this.show('success', message, title);
  }

  error(message: string, title: string = 'Ha Ocurrido un Error'): string {
    return this.show('error', message, title, 6000);
  }

  warning(message: string, title: string = 'Advertencia'): string {
    return this.show('warning', message, title);
  }

  info(message: string, title: string = 'Información'): string {
    return this.show('info', message, title);
  }

  remove(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clearAll(): void {
    this.toasts.set([]);
  }
}
