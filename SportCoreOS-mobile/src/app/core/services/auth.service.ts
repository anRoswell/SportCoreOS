import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: 'DIRECTOR_DEPORTIVO' | 'ENTRENADOR' | 'PADRE_FAMILIA' | 'JUGADOR' | 'ADMIN';
  clubId: string;
  clubNombre?: string;
  fotoUrl?: string;
}

export interface Club {
  id: string;
  nombre: string;
  sigla: string;
  logo?: string;
  ciudad?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'sportcore_token';
  private readonly USER_KEY = 'sportcore_user';
  private readonly CLUB_KEY = 'sportcore_active_club';

  readonly currentUser = signal<AuthUser | null>(this.getStoredUser());
  readonly token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  readonly isAuthenticated = computed(() => !!this.token());

  readonly activeClub = signal<Club>(this.getStoredClub());

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        const token = res.token || res.access_token || res.accessToken;
        const user = res.user || res.usuario;
        if (token) {
          this.setSession(token, user);
        }
      })
    );
  }

  loginAsPersona(persona: 'DIRECTOR' | 'ENTRENADOR' | 'PADRE' | 'JUGADOR'): Observable<any> {
    const credentials: Record<string, { email: string; pass: string }> = {
      DIRECTOR: { email: 'director@futuroscracks.com', pass: 'Admin123*' },
      ENTRENADOR: { email: 'entrenador@futuroscracks.com', pass: 'Admin123*' },
      PADRE: { email: 'padre@futuroscracks.com', pass: 'Admin123*' },
      JUGADOR: { email: 'jugador@futuroscracks.com', pass: 'Admin123*' },
    };

    const cred = credentials[persona] || credentials['DIRECTOR'];
    return this.login(cred.email, cred.pass);
  }

  solicitarResetPassword(email: string): Observable<any> {
    return of({ success: true, message: 'Código de verificación enviado a tu correo' });
  }

  confirmarResetPassword(tokenOrCode: string, nuevaPassword: string): Observable<any> {
    return of({ success: true, message: 'Contraseña actualizada exitosamente' });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  setSession(token: string, user: AuthUser): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);

    if (user.clubId) {
      const club: Club = {
        id: user.clubId,
        nombre: user.clubNombre || 'Club Deportivo Futuros Cracks FC',
        sigla: 'FCFC',
        ciudad: 'Cartagena'
      };
      this.setActiveClub(club);
    }
  }

  setActiveClub(club: Club): void {
    localStorage.setItem(this.CLUB_KEY, JSON.stringify(club));
    this.activeClub.set(club);
  }

  private getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private getStoredClub(): Club {
    const raw = localStorage.getItem(this.CLUB_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {
      id: '10000000-0000-0000-0000-000000000001',
      nombre: 'Club Deportivo Futuros Cracks FC',
      sigla: 'FCFC',
      ciudad: 'Cartagena'
    };
  }
}
