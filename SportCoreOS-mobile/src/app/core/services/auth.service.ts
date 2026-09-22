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
  rol: 'SUPER_ADMIN' | 'DIRECTOR_DEPORTIVO' | 'ENTRENADOR_DT' | 'PADRE_ACUDIENTE' | 'ADMIN_FINANCIERO';
  clubId: string;
  clubNombre?: string;
  fotoUrl?: string;
}

export interface DemoPersona {
  id: string;
  label: string;
  email: string;
  password: string;
  rol: AuthUser['rol'];
  rolLabel: string;
  nombres: string;
  apellidos: string;
  avatar: string;
  badgeColor: string;
  icon: string;
  descripcion: string;
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

  // 5 Demo Personas idénticas a la versión Web conectadas al Seed Oficial
  readonly demoPersonas: DemoPersona[] = [
    {
      id: 'demo-superadmin',
      label: 'Super Admin',
      email: 'superadmin@sportcore.com',
      password: 'sportcore2026',
      rol: 'SUPER_ADMIN',
      rolLabel: 'Super Administrador Global SaaS',
      nombres: 'Super Administrador',
      apellidos: 'Global',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
      badgeColor: '#f43f5e',
      icon: 'fa-solid fa-crown',
      descripcion: 'Acceso global multi-tenant, gestión de clubes y auditoría',
    },
    {
      id: 'demo-dir',
      label: 'Director Deportivo',
      email: 'carlos.valderrama@sportcore.com',
      password: 'sportcore2026',
      rol: 'DIRECTOR_DEPORTIVO',
      rolLabel: 'Director Metodológico & Deportivo',
      nombres: 'Carlos',
      apellidos: 'Valderrama',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      badgeColor: '#10b981',
      icon: 'fa-solid fa-user-tie',
      descripcion: 'Control total de planteles, fixture y visorías',
    },
    {
      id: 'demo-dt',
      label: 'Entrenador / DT',
      email: 'mario.yepes@sportcore.com',
      password: 'sportcore2026',
      rol: 'ENTRENADOR_DT',
      rolLabel: 'Director Técnico Sub-15 & Sub-17',
      nombres: 'Mario',
      apellidos: 'Yepes',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
      badgeColor: '#3b82f6',
      icon: 'fa-solid fa-stopwatch',
      descripcion: 'Convocatorias, táctica en vivo y biometría',
    },
    {
      id: 'demo-padre',
      label: 'Padre / Acudiente',
      email: 'padre.diaz@sportcore.com',
      password: 'sportcore2026',
      rol: 'PADRE_ACUDIENTE',
      rolLabel: 'Acudiente (Jugador: Samuel Díaz #10)',
      nombres: 'Luis',
      apellidos: 'Díaz Padre',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
      badgeColor: '#a855f7',
      icon: 'fa-solid fa-people-roof',
      descripcion: 'Citaciones de partidos, pagos PSE y boletín IA',
    },
    {
      id: 'demo-finanzas',
      label: 'Admin Financiero',
      email: 'finanzas@sportcore.com',
      password: 'sportcore2026',
      rol: 'ADMIN_FINANCIERO',
      rolLabel: 'Coordinador de Cartera & PSE',
      nombres: 'Diana',
      apellidos: 'Morales',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120',
      badgeColor: '#f59e0b',
      icon: 'fa-solid fa-coins',
      descripcion: 'Conciliación Wompi/PSE, facturación y recaudos',
    },
  ];

  readonly currentUser = signal<AuthUser | null>(this.getStoredUser());
  readonly token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  readonly isAuthenticated = computed(() => !!this.token());

  readonly activeClub = signal<Club>(this.getStoredClub());

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        const payload = res?.data || res;
        const token = payload?.accessToken || payload?.token || payload?.access_token;
        const user = payload?.user || payload?.usuario;
        if (token) {
          this.setSession(token, user);
        }
      })
    );
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
        ciudad: 'Bogotá D.C.'
      };
      this.setActiveClub(club);
    }
  }

  setActiveClub(club: Club): void {
    localStorage.setItem(this.CLUB_KEY, JSON.stringify(club));
    this.activeClub.set(club);
  }

  private getStoredUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private getStoredClub(): Club {
    try {
      const stored = localStorage.getItem(this.CLUB_KEY);
      return stored
        ? JSON.parse(stored)
        : {
            id: '10000000-0000-0000-0000-000000000001',
            nombre: 'Club Deportivo Futuros Cracks FC',
            sigla: 'FCFC',
            ciudad: 'Bogotá D.C.'
          };
    } catch {
      return {
        id: '10000000-0000-0000-0000-000000000001',
        nombre: 'Club Deportivo Futuros Cracks FC',
        sigla: 'FCFC',
        ciudad: 'Bogotá D.C.'
      };
    }
  }
}
