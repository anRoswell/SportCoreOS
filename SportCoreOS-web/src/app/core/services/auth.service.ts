import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: 'SUPER_ADMIN' | 'DIRECTOR_DEPORTIVO' | 'ENTRENADOR_DT' | 'PADRE_ACUDIENTE' | 'ADMIN_FINANCIERO';
  rolLabel: string;
  avatar: string;
  clubId?: string;
  clubNombre?: string;
  clubSlug?: string;
  clubLogo?: string;
  telefono?: string;
  jugadorAsociadoId?: string;
}

export interface DemoPersona {
  id: string;
  label: string;
  email: string;
  password: string;
  rol: UserProfile['rol'];
  rolLabel: string;
  nombres: string;
  apellidos: string;
  avatar: string;
  badgeColor: string;
  descripcion: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
    clubId?: string;
    clubNombre?: string;
    clubSlug?: string;
    clubLogo?: string;
  };
}

export interface OnboardingDto {
  clubNombre: string;
  sigla: string;
  ciudad: string;
  pais?: string;
  logoUrl?: string;
  adminNombre: string;
  adminApellido: string;
  adminEmail: string;
  adminPassword: string;
  adminTelefono?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = environment.tokenKey || 'futcore_token';
  private readonly USER_KEY = environment.userKey || 'futcore_user';
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3001/api/v1';

  // 5 Demo Personas conectadas al Seed Oficial del Backend
  readonly demoPersonas: DemoPersona[] = [
    {
      id: 'demo-superadmin',
      label: 'Super Admin SaaS',
      email: 'superadmin@sportcore.com',
      password: 'sportcore2026',
      rol: 'SUPER_ADMIN',
      rolLabel: 'Super Administrador Global SaaS',
      nombres: 'Super Administrador',
      apellidos: 'Global',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
      badgeColor: 'rose',
      descripcion: 'Acceso global multi-tenant, gestión de clubes, planes y auditoría',
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
      badgeColor: 'emerald',
      descripcion: 'Acceso total a planteles, fixture, finanzas y visorías',
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
      badgeColor: 'blue',
      descripcion: 'Convocatorias, actas en vivo, radar táctico y biometría',
    },
    {
      id: 'demo-padre',
      label: 'Padre de Familia',
      email: 'padre.diaz@sportcore.com',
      password: 'sportcore2026',
      rol: 'PADRE_ACUDIENTE',
      rolLabel: 'Acudiente (Jugador: Samuel Díaz #10)',
      nombres: 'Luis',
      apellidos: 'Díaz Padre',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
      badgeColor: 'purple',
      descripcion: 'Confirmación de citaciones, pago express PSE y boletines',
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
      badgeColor: 'amber',
      descripcion: 'Conciliación Wompi, facturación masiva y cobro de canchas',
    },
  ];

  // Estado reactivo con Signals
  readonly currentUser = signal<UserProfile | null>(this.getStoredUser());
  readonly token = signal<string | null>(this.getStoredToken());
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.token());

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private getStoredUser(): UserProfile | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = localStorage.getItem(this.USER_KEY);
      if (data) {
        try {
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  getRoleLabel(rol: string): string {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrador Global',
      DIRECTOR_DEPORTIVO: 'Director Deportivo',
      ENTRENADOR_DT: 'Director Técnico / Entrenador',
      PADRE_ACUDIENTE: 'Padre / Acudiente',
      ADMIN_FINANCIERO: 'Administrador Financiero',
    };
    return labels[rol] || rol;
  }

  /**
   * Autenticación Real contra el backend NestJS (POST /api/v1/auth/login)
   */
  login(email: string, pass: string, clubId: string = '10000000-0000-0000-0000-000000000001'): Observable<UserProfile> {
    const body = { email: email.trim().toLowerCase(), password: pass };

    return this.http.post<any>(`${this.apiUrl}/auth/login`, body).pipe(
      map((res) => {
        const data: LoginResponse = res.data ? res.data : res;
        
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          nombres: data.user.nombre,
          apellidos: data.user.apellido,
          rol: data.user.rol as any,
          rolLabel: this.getRoleLabel(data.user.rol),
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120`,
          clubId: data.user.clubId || clubId,
          clubNombre: data.user.clubNombre,
          clubSlug: data.user.clubSlug,
          clubLogo: data.user.clubLogo,
        };

        this.setSession(data.accessToken, userProfile);
        return userProfile;
      })
    );
  }

  /**
   * Onboarding & Registro de Nueva Escuela Deportiva con auto-login
   */
  registerClubOnboarding(dto: OnboardingDto): Observable<UserProfile> {
    return this.http.post<any>(`${this.apiUrl}/clubes/onboarding`, dto).pipe(
      map((res) => {
        const data = res.data ? res.data : res;
        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          nombres: data.user.nombre,
          apellidos: data.user.apellido,
          rol: data.user.rol as any,
          rolLabel: this.getRoleLabel(data.user.rol),
          avatar: data.user.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120`,
          clubId: data.user.clubId,
          clubNombre: data.user.clubNombre,
          clubSlug: data.user.clubSlug,
          clubLogo: data.user.clubLogo,
        };

        this.setSession(data.accessToken, userProfile);
        return userProfile;
      })
    );
  }

  loginWithPersona(personaId: string, clubId: string = '10000000-0000-0000-0000-000000000001'): Observable<UserProfile> {
    const persona = this.demoPersonas.find((p) => p.id === personaId) || this.demoPersonas[0];
    return this.login(persona.email, persona.password, clubId);
  }

  private setSession(token: string, user: UserProfile): void {
    this.token.set(token);
    this.currentUser.set(user);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    }

    this.router.navigate(['/login']);
  }
}
