import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Omitir loading si el header 'X-Skip-Loading' está presente
  if (req.headers.has('X-Skip-Loading')) {
    const cleanReq = req.clone({ headers: req.headers.delete('X-Skip-Loading') });
    return next(cleanReq);
  }

  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};
