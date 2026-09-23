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
    path: 'pagos',
    loadComponent: () => import('./pages/pagos/pagos-mobile.component').then(m => m.PagosMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'tienda',
    loadComponent: () => import('./pages/tienda/tienda-mobile.component').then(m => m.TiendaMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'canchas',
    loadComponent: () => import('./pages/canchas/canchas-mobile.component').then(m => m.CanchasMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'servicios',
    loadComponent: () => import('./pages/servicios/servicios-mobile.component').then(m => m.ServiciosMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'notificaciones',
    loadComponent: () => import('./pages/notificaciones/notificaciones-mobile.component').then(m => m.NotificacionesMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'noticias',
    loadComponent: () => import('./pages/noticias/noticias-mobile.component').then(m => m.NoticiasMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'rendimiento',
    loadComponent: () => import('./pages/rendimiento/rendimiento-mobile.component').then(m => m.RendimientoMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'juego-carrera',
    loadComponent: () => import('./pages/juego-carrera/juego-carrera-mobile.component').then(m => m.JuegoCarreraMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil-mobile.component').then(m => m.PerfilMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil/carnet',
    loadComponent: () => import('./pages/perfil/carnet-mobile.component').then(m => m.CarnetMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'perfil/boletin-ia',
    loadComponent: () => import('./pages/perfil/boletin-ia-mobile.component').then(m => m.BoletinIaMobileComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
