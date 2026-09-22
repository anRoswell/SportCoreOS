import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./pages/auth/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'auth/reset-password',
    loadComponent: () => import('./pages/auth/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
  {
    path: 'partidos',
    loadComponent: () => import('./pages/partidos/partidos-mobile.component').then(m => m.PartidosMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'convocatorias',
    loadComponent: () => import('./pages/convocatorias/convocatorias-mobile.component').then(m => m.ConvocatoriasMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'entrenamientos',
    loadComponent: () => import('./pages/entrenamientos/entrenamientos-mobile.component').then(m => m.EntrenamientosMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil-mobile.component').then(m => m.PerfilMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
