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
   Rutas agrupadas: /deportivo/...
   ============================================================================= */
export const gestionDeportivaRoutes: Routes = [
  {
    path: 'deportivo',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'jugadores',
        pathMatch: 'full',
      },
      {
        path: 'jugadores',
        loadComponent: () =>
          import('./pages/jugadores/jugadores.component').then((m) => m.JugadoresComponent),
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
        data: { 
          module: 'DEPORTIVO_CATEGORIAS',
          roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
          title: 'Categorías & Divisiones'
        },
      },
    ],
  },
  // Retrocompatibilidad
  { path: 'jugadores', redirectTo: 'deportivo/jugadores', pathMatch: 'full' },
  { path: 'categorias', redirectTo: 'deportivo/categorias', pathMatch: 'full' },
];

/* =============================================================================
   4. MÓDULO DE COMPETICIÓN & CONVOCATORIAS
   Rutas agrupadas: /competicion/...
   ============================================================================= */
export const competicionRoutes: Routes = [
  {
    path: 'competicion',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'partidos',
        pathMatch: 'full',
      },
      {
        path: 'partidos',
        loadComponent: () =>
          import('./pages/partidos/partidos.component').then((m) => m.PartidosComponent),
        data: { 
          module: 'COMPETICION_PARTIDOS',
          roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
          title: 'Fixture & Partidos Oficiales'
        },
      },
      {
        path: 'partido',
        redirectTo: 'partidos',
        pathMatch: 'full',
      },
      {
        path: 'convocatorias',
        loadComponent: () =>
          import('./pages/convocatorias/convocatorias.component').then((m) => m.ConvocatoriasComponent),
        data: { 
          module: 'COMPETICION_CONVOCATORIAS',
          roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
          title: 'Convocatorias & Citaciones'
        },
      },
    ],
  },
  // Retrocompatibilidad
  { path: 'partidos', redirectTo: 'competicion/partidos', pathMatch: 'full' },
  { path: 'partido', redirectTo: 'competicion/partidos', pathMatch: 'full' },
  { path: 'convocatorias', redirectTo: 'competicion/convocatorias', pathMatch: 'full' },
];

/* =============================================================================
   5. MÓDULO DE CIENCIAS DEL DEPORTE & RENDIMIENTO
   Rutas agrupadas: /rendimiento/...
   ============================================================================= */
export const rendimientoRoutes: Routes = [
  {
    path: 'rendimiento',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'biometria',
        pathMatch: 'full',
      },
      {
        path: 'biometria',
        loadComponent: () =>
          import('./pages/biometria/biometria.component').then((m) => m.BiometriaComponent),
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
        data: { 
          module: 'RENDIMIENTO_RANKING_GAMIFICADO',
          roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT', 'SUPER_ADMIN', 'ADMIN_FINANCIERO'],
          title: 'Leaderboard & Ranking Gamificado XP'
        },
      },
    ],
  },
  // Retrocompatibilidad
  { path: 'biometria', redirectTo: 'rendimiento/biometria', pathMatch: 'full' },
  { path: 'telemetria', redirectTo: 'rendimiento/telemetria', pathMatch: 'full' },
  { path: 'scouting', redirectTo: 'rendimiento/scouting', pathMatch: 'full' },
  { path: 'ranking', redirectTo: 'rendimiento/ranking', pathMatch: 'full' },
];

/* =============================================================================
   6. MÓDULO DE INTELIGENCIA ARTIFICIAL (SPORTCORE AI)
   Rutas agrupadas: /ia/...
   ============================================================================= */
export const iaRoutes: Routes = [
  {
    path: 'ia',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'copiloto',
        pathMatch: 'full',
      },
      {
        path: 'copiloto',
        loadComponent: () =>
          import('./pages/ia/ia.component').then((m) => m.IaComponent),
        data: { 
          module: 'IA_COPILOTO',
          roles: ['DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT'],
          title: 'Copiloto Táctico AI (Gemini)'
        },
      },
    ],
  },
];

/* =============================================================================
   7. MÓDULO DE ADMINISTRACIÓN FINANCIERA & RECAUDO PSE
   Rutas agrupadas: /finanzas/...
   ============================================================================= */
export const finanzasRoutes: Routes = [
  {
    path: 'finanzas',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'recaudo',
        pathMatch: 'full',
      },
      {
        path: 'recaudo',
        loadComponent: () =>
          import('./pages/finanzas/finanzas.component').then((m) => m.FinanzasComponent),
        data: { 
          module: 'FINANZAS_RECAUDO',
          roles: ['DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO'],
          title: 'Cobranza, Pensiones & Recaudo PSE'
        },
      },
    ],
  },
];

/* =============================================================================
   8. MÓDULO DE INFRAESTRUCTURA, CANCHAS & TIENDA OFICIAL
   Rutas agrupadas: /infraestructura/...
   ============================================================================= */
export const infraestructuraRoutes: Routes = [
  {
    path: 'infraestructura',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'canchas',
        pathMatch: 'full',
      },
      {
        path: 'canchas',
        loadComponent: () =>
          import('./pages/canchas/canchas.component').then((m) => m.CanchasComponent),
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
        data: { 
          module: 'SERVICIOS_MASTERCLASSES',
          roles: ['DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO', 'ENTRENADOR_DT', 'SUPER_ADMIN'],
          title: 'Clínicas & Masterclasses Pro'
        },
      },
    ],
  },
  // Retrocompatibilidad
  { path: 'canchas', redirectTo: 'infraestructura/canchas', pathMatch: 'full' },
  { path: 'tienda', redirectTo: 'infraestructura/tienda', pathMatch: 'full' },
  { path: 'servicios', redirectTo: 'infraestructura/servicios', pathMatch: 'full' },
];

/* =============================================================================
   9. MÓDULO DE MARKETING, SLIDERS & CREADOR DE LANDINGS
   Rutas agrupadas: /marketing/...
   ============================================================================= */
export const marketingRoutes: Routes = [
  {
    path: 'marketing',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'sliders',
        pathMatch: 'full',
      },
      {
        path: 'sliders',
        loadComponent: () =>
          import('./pages/sliders-promocionales/sliders-promocionales.component').then((m) => m.SlidersPromocionalesComponent),
        data: { 
          module: 'MARKETING_SLIDERS',
          roles: ['SUPER_ADMIN', 'DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO'],
          title: 'Sliders Promocionales & Onboarding'
        },
      },
      {
        path: 'landings',
        loadComponent: () =>
          import('./pages/landing-builder/landing-builder.component').then((m) => m.LandingBuilderComponent),
        data: { 
          module: 'MARKETING_LANDINGS',
          roles: ['SUPER_ADMIN', 'DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO'],
          title: 'Creador de Landing Pages & Contenidos'
        },
      },
      {
        path: 'landing-builder',
        redirectTo: 'landings',
        pathMatch: 'full',
      },
      {
        path: 'sliders-promocionales',
        redirectTo: 'sliders',
        pathMatch: 'full',
      },
    ],
  },
  // Retrocompatibilidad
  { path: 'sliders-promocionales', redirectTo: 'marketing/sliders', pathMatch: 'full' },
  { path: 'landing-builder', redirectTo: 'marketing/landings', pathMatch: 'full' },
];

/* =============================================================================
   10. MÓDULO DE PORTAL MÓVIL DE FAMILIAS & PADRES
   Rutas agrupadas: /portal/...
   ============================================================================= */
export const portalPadresRoutes: Routes = [
  {
    path: 'portal',
    children: [
      {
        path: '',
        redirectTo: 'padres',
        pathMatch: 'full',
      },
      {
        path: 'padres',
        loadComponent: () =>
          import('./pages/portal-padres/portal-padres.component').then((m) => m.PortalPadresComponent),
        data: { 
          module: 'PORTAL_PADRES',
          title: 'Portal Móvil para Padres de Familia'
        },
      },
    ],
  },
  // Retrocompatibilidad
  { path: 'portal-padres', redirectTo: 'portal/padres', pathMatch: 'full' },
];

/* =============================================================================
   11. MÓDULO DE CONFIGURACIÓN SAAS, MULTI-TENANT & i18n
   Rutas agrupadas: /configuracion/...
   ============================================================================= */
export const configuracionSaaSRoutes: Routes = [
  {
    path: 'configuracion',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: '',
        redirectTo: 'modulos',
        pathMatch: 'full',
      },
      {
        path: 'modulos',
        loadComponent: () =>
          import('./pages/modulos-escuela/modulos-escuela.component').then((m) => m.ModulosEscuelaComponent),
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
        data: { 
          module: 'CONFIG_IDIOMAS',
          roles: ['SUPER_ADMIN', 'DIRECTOR_DEPORTIVO', 'ADMIN_FINANCIERO'],
          title: 'Centro de Idiomas & i18n'
        },
      },
    ],
  },
  // Retrocompatibilidad
  { path: 'modulos-escuela', redirectTo: 'configuracion/modulos', pathMatch: 'full' },
  { path: 'parametros', redirectTo: 'configuracion/parametros', pathMatch: 'full' },
  { path: 'roles-permisos', redirectTo: 'configuracion/roles-permisos', pathMatch: 'full' },
  { path: 'idiomas', redirectTo: 'configuracion/idiomas', pathMatch: 'full' },
];

/* =============================================================================
   12. RUTAS PÚBLICAS (LANDINGS & FORMULARIOS DE CAPTACIÓN)
   ============================================================================= */
export const publicRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/landing-public/landing-public.component').then((m) => m.LandingPublicComponent),
    data: { 
      module: 'PUBLIC_LANDING_PORTADA',
      title: 'Academia Deportiva • SportCoreOS'
    },
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/landing-public/landing-public.component').then((m) => m.LandingPublicComponent),
    data: { 
      module: 'PUBLIC_LANDING_PORTADA',
      title: 'Inicio • SportCoreOS'
    },
  },
  {
    path: 'p/:slug',
    loadComponent: () =>
      import('./pages/landing-public/landing-public.component').then((m) => m.LandingPublicComponent),
    data: { 
      module: 'PUBLIC_LANDING',
      title: 'Academia Deportiva • SportCoreOS'
    },
  },
  {
    path: 'landings/:slug',
    redirectTo: 'p/:slug',
    pathMatch: 'full',
  },
];

/* =============================================================================
   RUTAS PRINCIPALES DEL SISTEMA (COMPOSICIÓN DE MÓDULOS)
   ============================================================================= */
export const routes: Routes = [
  ...authRoutes,
  ...dashboardRoutes,
  ...gestionDeportivaRoutes,
  ...competicionRoutes,
  ...rendimientoRoutes,
  ...iaRoutes,
  ...finanzasRoutes,
  ...infraestructuraRoutes,
  ...marketingRoutes,
  ...portalPadresRoutes,
  ...configuracionSaaSRoutes,
  ...publicRoutes,
  {
    path: '**',
    redirectTo: '',
  },
];

