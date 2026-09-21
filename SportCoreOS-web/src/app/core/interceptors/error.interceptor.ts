import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si la petición tiene 'X-Skip-Error-Toast', dejamos pasar el error sin toast automático
      if (req.headers.has('X-Skip-Error-Toast')) {
        return throwError(() => error);
      }

      let errorMsg = 'Error inesperado en la comunicación con el servidor.';
      let errorTitle = 'Error de Servidor';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente / red
        errorMsg = error.error.message || 'Error de conexión en el navegador.';
        errorTitle = 'Error de Cliente';
      } else {
        // Error con código HTTP
        switch (error.status) {
          case 0:
            errorTitle = 'Sin Conexión';
            errorMsg = 'No es posible conectar con los servidores de SportCoreOS. Verifica tu conexión a internet.';
            break;
          case 400:
            errorTitle = 'Solicitud Incorrecta (400)';
            errorMsg = error.error?.message || error.error?.error || 'Los datos enviados no son válidos.';
            break;
          case 401:
            errorTitle = 'Sesión Expirada (401)';
            errorMsg = 'Tu sesión de autenticación ha vencido. Por favor inicia sesión nuevamente.';
            authService.logout();
            break;
          case 403:
            errorTitle = 'Acceso Denegado (403)';
            errorMsg = 'No tienes los permisos requeridos para acceder a este recurso deportivo.';
            break;
          case 404:
            errorTitle = 'Recurso No Encontrado (404)';
            errorMsg = error.error?.message || 'El elemento solicitado no existe en la academia.';
            break;
          case 409:
            errorTitle = 'Conflicto de Datos (409)';
            errorMsg = error.error?.message || 'Existe un conflicto (ej. dorsal duplicado o cancha ya ocupada).';
            break;
          case 422:
            errorTitle = 'Validación de Datos (422)';
            if (Array.isArray(error.error?.message)) {
              errorMsg = error.error.message.join(' • ');
            } else {
              errorMsg = error.error?.message || 'Error en los campos del formulario.';
            }
            break;
          case 500:
          case 502:
          case 503:
            errorTitle = 'Error Interno del Servidor (500)';
            errorMsg = error.error?.message || 'Ocurrió una anomalía en el motor SportCore. Nuestro equipo ha sido notificado.';
            break;
          default:
            errorMsg = error.error?.message || `Error del servidor (Código ${error.status})`;
        }
      }

      notificationService.error(errorMsg, errorTitle);
      return throwError(() => error);
    })
  );
};
