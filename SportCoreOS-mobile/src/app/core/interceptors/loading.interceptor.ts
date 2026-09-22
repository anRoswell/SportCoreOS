import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Evitar spinner en peticiones en segundo plano silenciosas si tienen el header X-Silent
  const isSilent = req.headers.has('X-Silent');
  if (!isSilent) {
    loadingService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!isSilent) {
        loadingService.hide();
      }
    })
  );
};
