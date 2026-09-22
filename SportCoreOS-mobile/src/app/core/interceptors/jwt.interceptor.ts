import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();
  const activeClub = authService.activeClub();

  let headers = req.headers;

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  if (activeClub?.id) {
    headers = headers.set('x-club-id', activeClub.id);
  }

  const clonedReq = req.clone({ headers });
  return next(clonedReq);
};
