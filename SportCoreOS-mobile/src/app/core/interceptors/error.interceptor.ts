import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const alertService = inject(AlertService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado al conectar con el servidor.';

      if (error.error?.message) {
        errorMessage = Array.isArray(error.error.message)
          ? error.error.message.join(', ')
          : error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      switch (error.status) {
        case 401:
          alertService.error('Tu sesión ha expirado o las credenciales son incorrectas.', 'Acceso No Autorizado');
          authService.logout();
          break;
        case 403:
          alertService.warning('No tienes permisos suficientes para realizar esta acción en tu club.', 'Permisos Insuficientes');
          break;
        case 404:
          alertService.warning('El recurso solicitado no fue encontrado.', 'No Encontrado');
          break;
        case 500:
        case 502:
        case 503:
          alertService.error(errorMessage, 'Error del Servidor');
          break;
        default:
          if (error.status !== 0) {
            alertService.error(errorMessage);
          }
          break;
      }

      return throwError(() => error);
    })
  );
};
