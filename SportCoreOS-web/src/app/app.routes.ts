import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    canActivate: [loginGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'jugadores',
    loadComponent: () =>
      import('./pages/jugadores/jugadores.component').then((m) => m.JugadoresComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT', 'ADMIN_FINANCIERO'] },
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./pages/categorias/categorias.component').then((m) => m.CategoriasComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'] },
  },
  {
    path: 'partidos',
    loadComponent: () =>
      import('./pages/partidos/partidos.component').then((m) => m.PartidosComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'] },
  },
  {
    path: 'convocatorias',
    loadComponent: () =>
      import('./pages/convocatorias/convocatorias.component').then((m) => m.ConvocatoriasComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'] },
  },
  {
    path: 'biometria',
    loadComponent: () =>
      import('./pages/biometria/biometria.component').then((m) => m.BiometriaComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'] },
  },
  {
    path: 'finanzas',
    loadComponent: () =>
      import('./pages/finanzas/finanzas.component').then((m) => m.FinanzasComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO'] },
  },
  {
    path: 'canchas',
    loadComponent: () =>
      import('./pages/canchas/canchas.component').then((m) => m.CanchasComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO', 'ENTRENADOR_DT'] },
  },
  {
    path: 'tienda',
    loadComponent: () =>
      import('./pages/tienda/tienda.component').then((m) => m.TiendaComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO', 'ENTRENADOR_DT'] },
  },
  {
    path: 'portal-padres',
    loadComponent: () =>
      import('./pages/portal-padres/portal-padres.component').then((m) => m.PortalPadresComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
