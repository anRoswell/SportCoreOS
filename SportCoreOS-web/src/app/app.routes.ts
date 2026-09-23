import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

/* =============================================================================
   1. MÓDULO DE AUTENTICACIÓN & ACCESO
   ============================================================================= */
export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    canActivate: [loginGuard],
    data: { module: 'AUTH', title: 'Iniciar Sesión • SportCoreOS' },
  },
];

/* =============================================================================
   2. MÓDULO DE DASHBOARD & KPIS GENERALES
   ============================================================================= */
export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
    data: { module: 'DASHBOARD', title: 'Dashboard Principal • SportCoreOS' },
  },
];

/* =============================================================================
   3. MÓDULO DE GESTIÓN DEPORTIVA (PLANTELES & ATLETAS)
   ============================================================================= */
export const gestionDeportivaRoutes: Routes = [
  {
    path: 'jugadores',
    loadComponent: () =>
      import('./pages/jugadores/jugadores.component').then((m) => m.JugadoresComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'DEPORTIVO_JUGADORES',
      roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT', 'ADMIN_FINANCIERO'],
      title: 'Jugadores & Fichas 360°'
    },
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./pages/categorias/categorias.component').then((m) => m.CategoriasComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'DEPORTIVO_CATEGORIAS',
      roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
      title: 'Categorías & Divisiones'
    },
  },
];

/* =============================================================================
   4. MÓDULO DE COMPETICIÓN & CONVOCATORIAS
   ============================================================================= */
export const competicionRoutes: Routes = [
  {
    path: 'partidos',
    loadComponent: () =>
      import('./pages/partidos/partidos.component').then((m) => m.PartidosComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'COMPETICION_PARTIDOS',
      roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
      title: 'Fixture & Partidos Oficiales'
    },
  },
  {
    path: 'convocatorias',
    loadComponent: () =>
      import('./pages/convocatorias/convocatorias.component').then((m) => m.ConvocatoriasComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'COMPETICION_CONVOCATORIAS',
      roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
      title: 'Convocatorias & Citaciones'
    },
  },
];

/* =============================================================================
   5. MÓDULO DE CIENCIAS DEL DEPORTE & RENDIMIENTO
   ============================================================================= */
export const rendimientoRoutes: Routes = [
  {
    path: 'biometria',
    loadComponent: () =>
      import('./pages/biometria/biometria.component').then((m) => m.BiometriaComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'RENDIMIENTO_BIOMETRIA',
      roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
      title: 'Biometría & Tests Antropométricos'
    },
  },
  {
    path: 'telemetria',
    loadComponent: () =>
      import('./pages/telemetria/telemetria.component').then((m) => m.TelemetriaComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'RENDIMIENTO_TELEMETRIA',
      roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
      title: 'Telemetría GPS & Carga Cinemática'
    },
  },
  {
    path: 'scouting',
    loadComponent: () =>
      import('./pages/scouting/scouting.component').then((m) => m.ScoutingComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'RENDIMIENTO_SCOUTING',
      roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
      title: 'Scouting, Visorías & Captación'
    },
  },
  {
    path: 'ranking',
    loadComponent: () =>
      import('./pages/ranking-gamificado/ranking-gamificado.component').then((m) => m.RankingGamificadoComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'RENDIMIENTO_RANKING_GAMIFICADO',
      roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT', 'SUPER_ADMIN', 'ADMIN_FINANCIERO'],
      title: 'Leaderboard & Ranking Gamificado XP'
    },
  },
];

/* =============================================================================
   6. MÓDULO DE INTELIGENCIA ARTIFICIAL (SPORTCORE AI)
   ============================================================================= */
export const iaRoutes: Routes = [
  {
    path: 'ia',
    loadComponent: () =>
      import('./pages/ia/ia.component').then((m) => m.IaComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'IA_COPILOTO',
      roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
      title: 'Copiloto Táctico AI (Gemini)'
    },
  },
];

/* =============================================================================
   7. MÓDULO DE ADMINISTRACIÓN FINANCIERA & RECAUDO PSE
   ============================================================================= */
export const finanzasRoutes: Routes = [
  {
    path: 'finanzas',
    loadComponent: () =>
      import('./pages/finanzas/finanzas.component').then((m) => m.FinanzasComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'FINANZAS_RECAUDO',
      roles: ['DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO'],
      title: 'Cobranza, Pensiones & Recaudo PSE'
    },
  },
];

/* =============================================================================
   8. MÓDULO DE INFRAESTRUCTURA, CANCHAS & TIENDA OFICIAL
   ============================================================================= */
export const infraestructuraRoutes: Routes = [
  {
    path: 'canchas',
    loadComponent: () =>
      import('./pages/canchas/canchas.component').then((m) => m.CanchasComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'INFRAESTRUCTURA_CANCHAS',
      roles: ['DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO', 'ENTRENADOR_DT'],
      title: 'Alquiler de Canchas & Escenarios'
    },
  },
  {
    path: 'tienda',
    loadComponent: () =>
      import('./pages/tienda/tienda.component').then((m) => m.TiendaComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'INFRAESTRUCTURA_TIENDA',
      roles: ['DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO', 'ENTRENADOR_DT'],
      title: 'Tienda Oficial & Kits Deportivos'
    },
  },
  {
    path: 'servicios',
    loadComponent: () =>
      import('./pages/servicios/servicios.component').then((m) => m.ServiciosComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'SERVICIOS_MASTERCLASSES',
      roles: ['DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO', 'ENTRENADOR_DT', 'SUPER_ADMIN'],
      title: 'Clínicas & Masterclasses Pro'
    },
  },
];

/* =============================================================================
   9. MÓDULO DE PORTAL MÓVIL DE FAMILIAS & PADRES
   ============================================================================= */
export const portalPadresRoutes: Routes = [
  {
    path: 'portal-padres',
    loadComponent: () =>
      import('./pages/portal-padres/portal-padres.component').then((m) => m.PortalPadresComponent),
    data: { 
      module: 'PORTAL_PADRES',
      title: 'Portal Móvil para Padres de Familia'
    },
  },
];

/* =============================================================================
   10. MÓDULO DE CONFIGURACIÓN SAAS, MULTI-TENANT & i18n
   ============================================================================= */
export const configuracionSaaSRoutes: Routes = [
  {
    path: 'modulos-escuela',
    loadComponent: () =>
      import('./pages/modulos-escuela/modulos-escuela.component').then((m) => m.ModulosEscuelaComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'CONFIG_MODULOS_ESCUELA',
      roles: ['SUPER_ADMIN', 'DIRECTOR_DEPORTIVO'],
      title: 'Gestión de Módulos por Escuela'
    },
  },
  {
    path: 'parametros',
    loadComponent: () =>
      import('./pages/parametros/parametros.component').then((m) => m.ParametrosComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'CONFIG_PARAMETROS',
      roles: ['SUPER_ADMIN', 'DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO'],
      title: 'Parámetros Globales del Sistema'
    },
  },
  {
    path: 'roles-permisos',
    loadComponent: () =>
      import('./pages/roles-permisos/roles-permisos.component').then((m) => m.RolesPermisosComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'CONFIG_ROLES_PERMISOS',
      roles: ['SUPER_ADMIN', 'DIRECTOR_DEPORTIVO'],
      title: 'Matriz de Roles & Permisos RBAC'
    },
  },
  {
    path: 'idiomas',
    loadComponent: () =>
      import('./pages/idiomas/idiomas.component').then((m) => m.IdiomasComponent),
    canActivate: [authGuard, roleGuard],
    data: { 
      module: 'CONFIG_IDIOMAS',
      roles: ['SUPER_ADMIN', 'DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO'],
      title: 'Centro de Idiomas & i18n'
    },
  },
];

/* =============================================================================
   RUTAS PRINCIPALES DEL SISTEMA (COMPOSICIÓN DE MÓDULOS)
   ============================================================================= */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  ...authRoutes,
  ...dashboardRoutes,
  ...gestionDeportivaRoutes,
  ...competicionRoutes,
  ...rendimientoRoutes,
  ...iaRoutes,
  ...finanzasRoutes,
  ...infraestructuraRoutes,
  ...portalPadresRoutes,
  ...configuracionSaaSRoutes,
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
