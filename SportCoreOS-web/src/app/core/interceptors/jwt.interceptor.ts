import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;
  let activeClubId: string | null = null;

  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem(environment.tokenKey);
    const storedClub = localStorage.getItem(environment.activeClubKey);
    if (storedClub) {
      try {
        const parsed = JSON.parse(storedClub);
        activeClubId = parsed.id || null;
      } catch {
        // ignore JSON parse error
      }
    }
  }

  let headersConfig: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (activeClubId) {
    headersConfig['X-Club-Id'] = activeClubId;
  }

  if (token) {
    headersConfig['Authorization'] = `Bearer ${token}`;
  }

  const authReq = req.clone({
    setHeaders: headersConfig,
  });

  return next(authReq);
};
