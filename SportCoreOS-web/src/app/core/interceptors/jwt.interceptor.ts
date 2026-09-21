import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiService = inject(ApiService);

  const token = authService.token() || (typeof window !== 'undefined' ? localStorage.getItem(environment.tokenKey) : null);
  const activeClub = apiService.activeClub();

  let headersConfig: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (activeClub?.id) {
    headersConfig['X-Club-Id'] = activeClub.id;
  }

  if (token) {
    headersConfig['Authorization'] = `Bearer ${token}`;
  }

  const authReq = req.clone({
    setHeaders: headersConfig,
  });

  return next(authReq);
};
