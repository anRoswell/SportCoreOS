import { Injectable, signal, computed } from '@angular/core';

export type LanguageCode = 'es' | 'en' | 'pt';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
  region: string;
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly STORAGE_KEY = 'sportcore_lang';

  readonly availableLanguages = signal<LanguageOption[]>([
    { code: 'es', label: 'Español', nativeName: 'Español (Latinoamérica)', flag: '🇪🇸', region: 'Colombia / LATAM' },
    { code: 'en', label: 'English', nativeName: 'English (US & Global)', flag: '🇺🇸', region: 'International' },
    { code: 'pt', label: 'Português', nativeName: 'Português (Brasil)', flag: '🇧🇷', region: 'Brasil / Portugal' },
  ]);

  readonly currentLang = signal<LanguageCode>(this.getInitialLanguage());

  readonly currentLanguageDetails = computed(() => {
    return this.availableLanguages().find((l) => l.code === this.currentLang()) || this.availableLanguages()[0];
  });

  private readonly dictionaries: Record<LanguageCode, Record<string, string>> = {
    es: {
      // Navegación
      'nav.dashboard': 'Dashboard & KPIs',
      'nav.jugadores': 'Jugadores & Fichas',
      'nav.categorias': 'Categorías (Sub-7..20)',
      'nav.partidos': 'Partidos & Fixture',
      'nav.convocatorias': 'Convocatorias',
      'nav.biometria': 'Biometría & Tests',
      'nav.telemetria': 'Telemetría GPS & Carga',
      'nav.scouting': 'Scouting & Captación',
      'nav.ia': 'Copiloto Táctico AI',
      'nav.finanzas': 'Cobros PSE / Cartera',
      'nav.canchas': 'Alquiler Canchas & Sedes',
      'nav.tienda': 'Tienda & Kits Oficiales',
      'nav.portalPadres': 'Portal Móvil Padres',
      'nav.modulosEscuela': 'Módulos Escuela',
      'nav.parametros': 'Parámetros Sistema',
      'nav.rolesPermisos': 'Roles & Permisos',
      'nav.idiomas': 'Idiomas & Multiidioma',

      // Acciones Comunes
      'action.save': 'Guardar',
      'action.cancel': 'Cancelar',
      'action.edit': 'Editar',
      'action.delete': 'Eliminar',
      'action.create': 'Crear',
      'action.search': 'Buscar...',
      'action.filter': 'Filtrar',
      'action.close': 'Cerrar',
      'action.confirm': 'Confirmar',
      'action.export': 'Exportar',
      'action.download': 'Descargar',
      'action.reset': 'Restablecer',
      'action.pay': 'Pagar',
      'action.enroll': 'Inscribir',
      'action.enable': 'Habilitar',
      'action.disable': 'Deshabilitar',

      // Estados & Badges
      'status.active': 'Activo',
      'status.inactive': 'Inactivo',
      'status.injured': 'Lesionado',
      'status.suspended': 'Suspendido',
      'status.retired': 'Retirado',
      'status.scheduled': 'Programado',
      'status.finished': 'Finalizado',
      'status.paid': 'Pagado Total',
      'status.pending': 'En Mora / Pendiente',
      'status.observed': 'En Observación',
      'status.signing': 'Interés de Fichaje',
      'status.signed': 'Fichado / Incorporado',
      'status.discarded': 'Descartado',

      // Encabezados y Textos
      'common.welcome': 'Bienvenido a SportCoreOS',
      'common.totalPlayers': 'Total en Plantel',
      'common.activeMembers': 'Matrículas Activas',
      'common.loading': 'Cargando datos del club...',
      'common.noResults': 'No se encontraron registros coincidentes.',
      'common.requiredField': 'Campo obligatorio (*)',
      'common.currency': 'Moneda Oficial ($ COP)',
      'common.themeDark': 'Modo Oscuro (Dark Sport)',
      'common.themeLight': 'Modo Claro (Limpio)',
      'common.selectClub': 'Seleccionar Club',
      'common.profile': 'Mi Perfil Deportivo',
      'common.logout': 'Cerrar Sesión',

      // Módulo Idiomas
      'i18n.title': 'Centro de Idiomas & Internacionalización (i18n)',
      'i18n.subtitle': 'Configuración multiidioma nativa, catálogos de traducción y adaptación regional',
      'i18n.activeLanguage': 'Idioma Activo',
      'i18n.supportedLanguages': 'Idiomas Disponibles',
      'i18n.totalKeys': 'Términos Traducidos',
      'i18n.coverage': 'Cobertura Global',
      'i18n.selectLanguage': 'Selecciona el idioma de la interfaz:',
      'i18n.dictionaryExplorer': 'Explorador del Diccionario de Traducción',
      'i18n.searchKey': 'Buscar clave o término traducido...',
      'i18n.testSandbox': 'Sandbox de Previsualización en Vivo',
      'i18n.saveSuccess': '¡Idioma actualizado exitosamente a',
    },
    en: {
      // Navigation
      'nav.dashboard': 'Dashboard & KPIs',
      'nav.jugadores': 'Players & Rosters',
      'nav.categorias': 'Age Groups (U-7..20)',
      'nav.partidos': 'Matches & Fixtures',
      'nav.convocatorias': 'Lineups & Call-ups',
      'nav.biometria': 'Biometrics & Fitness',
      'nav.telemetria': 'GPS Telemetry & Heatmaps',
      'nav.scouting': 'Scouting & Talent Pipeline',
      'nav.ia': 'AI Tactical Copilot',
      'nav.finanzas': 'Finance & Invoicing',
      'nav.canchas': 'Pitch & Facility Rentals',
      'nav.tienda': 'Club Store & Kits',
      'nav.portalPadres': 'Parents Mobile Portal',
      'nav.modulosEscuela': 'Academy Modules',
      'nav.parametros': 'System Parameters',
      'nav.rolesPermisos': 'Roles & Permissions',
      'nav.idiomas': 'Languages & i18n',

      // Common Actions
      'action.save': 'Save',
      'action.cancel': 'Cancel',
      'action.edit': 'Edit',
      'action.delete': 'Delete',
      'action.create': 'Create',
      'action.search': 'Search...',
      'action.filter': 'Filter',
      'action.close': 'Close',
      'action.confirm': 'Confirm',
      'action.export': 'Export',
      'action.download': 'Download',
      'action.reset': 'Reset',
      'action.pay': 'Pay Now',
      'action.enroll': 'Register Player',
      'action.enable': 'Enable',
      'action.disable': 'Disable',

      // Statuses & Badges
      'status.active': 'Active',
      'status.inactive': 'Inactive',
      'status.injured': 'Injured',
      'status.suspended': 'Suspended',
      'status.retired': 'Retired',
      'status.scheduled': 'Scheduled',
      'status.finished': 'Completed',
      'status.paid': 'Fully Paid',
      'status.pending': 'Overdue / Pending',
      'status.observed': 'Under Scouting',
      'status.signing': 'Target Prospect',
      'status.signed': 'Signed & Registered',
      'status.discarded': 'Released',

      // Common Headers
      'common.welcome': 'Welcome to SportCoreOS',
      'common.totalPlayers': 'Total Squad Size',
      'common.activeMembers': 'Active Memberships',
      'common.loading': 'Loading club information...',
      'common.noResults': 'No matching records found.',
      'common.requiredField': 'Required Field (*)',
      'common.currency': 'Club Currency ($ COP)',
      'common.themeDark': 'Dark Sport Mode',
      'common.themeLight': 'Light Clean Mode',
      'common.selectClub': 'Select Academy',
      'common.profile': 'My Athletic Profile',
      'common.logout': 'Log Out',

      // Languages Module
      'i18n.title': 'Language & Internationalization Hub (i18n)',
      'i18n.subtitle': 'Multi-language management, translation dictionaries and localization',
      'i18n.activeLanguage': 'Active Language',
      'i18n.supportedLanguages': 'Supported Locales',
      'i18n.totalKeys': 'Translated Terms',
      'i18n.coverage': 'Coverage Rate',
      'i18n.selectLanguage': 'Choose interface language:',
      'i18n.dictionaryExplorer': 'Translation Dictionary Browser',
      'i18n.searchKey': 'Search key or translated text...',
      'i18n.testSandbox': 'Live Component Localization Preview',
      'i18n.saveSuccess': 'Language successfully updated to',
    },
    pt: {
      // Navegação
      'nav.dashboard': 'Painel & KPIs',
      'nav.jugadores': 'Jogadores & Fichas',
      'nav.categorias': 'Categorias (Sub-7..20)',
      'nav.partidos': 'Jogos & Calendário',
      'nav.convocatorias': 'Convocatórias',
      'nav.biometria': 'Biometria & Testes',
      'nav.telemetria': 'Telemetria GPS & Carga',
      'nav.scouting': 'Olheiro & Captação',
      'nav.ia': 'Copiloto Tático IA',
      'nav.finanzas': 'Financeiro & Cobrança',
      'nav.canchas': 'Campos & Aluguel',
      'nav.tienda': 'Loja Oficial & Equipamentos',
      'nav.portalPadres': 'Portal dos Pais',
      'nav.modulosEscuela': 'Módulos da Escola',
      'nav.parametros': 'Parâmetros do Sistema',
      'nav.rolesPermisos': 'Cargos & Permissões',
      'nav.idiomas': 'Idiomas & Tradução',

      // Ações Comuns
      'action.save': 'Salvar',
      'action.cancel': 'Cancelar',
      'action.edit': 'Editar',
      'action.delete': 'Excluir',
      'action.create': 'Criar',
      'action.search': 'Pesquisar...',
      'action.filter': 'Filtrar',
      'action.close': 'Fechar',
      'action.confirm': 'Confirmar',
      'action.export': 'Exportar',
      'action.download': 'Baixar',
      'action.reset': 'Redefinir',
      'action.pay': 'Pagar',
      'action.enroll': 'Inscrever',
      'action.enable': 'Habilitar',
      'action.disable': 'Desabilitar',

      // Estados & Badges
      'status.active': 'Ativo',
      'status.inactive': 'Inativo',
      'status.injured': 'Lesionado',
      'status.suspended': 'Suspenso',
      'status.retired': 'Aposentado',
      'status.scheduled': 'Agendado',
      'status.finished': 'Finalizado',
      'status.paid': 'Pago Total',
      'status.pending': 'Em Atraso / Pendente',
      'status.observed': 'Em Observação',
      'status.signing': 'Interesse em Contratar',
      'status.signed': 'Contratado / No Elenco',
      'status.discarded': 'Dispensado',

      // Cabeçalhos
      'common.welcome': 'Bem-vindo ao SportCoreOS',
      'common.totalPlayers': 'Total no Elenco',
      'common.activeMembers': 'Matrículas Ativas',
      'common.loading': 'Carregando dados do clube...',
      'common.noResults': 'Nenhum registro encontrado.',
      'common.requiredField': 'Campo obrigatório (*)',
      'common.currency': 'Moeda Oficial ($ COP)',
      'common.themeDark': 'Modo Escuro (Dark Sport)',
      'common.themeLight': 'Modo Claro (Limpo)',
      'common.selectClub': 'Selecionar Clube',
      'common.profile': 'Meu Perfil Esportivo',
      'common.logout': 'Encerrar Sessão',

      // Módulo Idiomas
      'i18n.title': 'Central de Idiomas & Internacionalização (i18n)',
      'i18n.subtitle': 'Configuração multilíngue nativa, catálogos de tradução e adaptação regional',
      'i18n.activeLanguage': 'Idioma Ativo',
      'i18n.supportedLanguages': 'Idiomas Disponíveis',
      'i18n.totalKeys': 'Termos Traduzidos',
      'i18n.coverage': 'Cobertura Global',
      'i18n.selectLanguage': 'Selecione o idioma da interface:',
      'i18n.dictionaryExplorer': 'Explorador do Dicionário de Tradução',
      'i18n.searchKey': 'Pesquisar chave ou termo traduzido...',
      'i18n.testSandbox': 'Sandbox de Visualização em Tempo Real',
      'i18n.saveSuccess': 'Idioma atualizado com sucesso para',
    },
  };

  constructor() {}

  private getInitialLanguage(): LanguageCode {
    const saved = localStorage.getItem(this.STORAGE_KEY) as LanguageCode;
    if (saved && (saved === 'es' || saved === 'en' || saved === 'pt')) {
      return saved;
    }
    return 'es';
  }

  setLanguage(lang: LanguageCode): void {
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const lang = this.currentLang();
    let text = this.dictionaries[lang]?.[key] || this.dictionaries['es']?.[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
      });
    }

    return text;
  }

  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }

  getAllKeys(): string[] {
    return Object.keys(this.dictionaries['es']);
  }

  getDictionary(lang?: LanguageCode): Record<string, string> {
    return this.dictionaries[lang || this.currentLang()] || this.dictionaries['es'];
  }
}
