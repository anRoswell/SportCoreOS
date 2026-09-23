import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { I18nService, LanguageCode, LanguageOption } from '../../core/services/i18n.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

interface TranslationEntry {
  key: string;
  category: string;
  es: string;
  en: string;
  pt: string;
}

@Component({
  selector: 'app-idiomas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './idiomas.component.html',
  styleUrl: './idiomas.component.scss'
})
export class IdiomasComponent implements OnInit {
  readonly i18n = inject(I18nService);

  searchQuery = '';
  readonly selectedCategory = signal<string>('TODAS');
  readonly toastMsg = signal<string>('');

  readonly categories = signal<string[]>(['Navegación', 'Acciones', 'Estados', 'Común', 'Idiomas']);

  readonly allEntries = signal<TranslationEntry[]>([
    { key: 'nav.dashboard', category: 'Navegación', es: 'Dashboard & KPIs', en: 'Dashboard & KPIs', pt: 'Painel & KPIs' },
    { key: 'nav.jugadores', category: 'Navegación', es: 'Jugadores & Fichas', en: 'Players & Rosters', pt: 'Jogadores & Fichas' },
    { key: 'nav.categorias', category: 'Navegación', es: 'Categorías (Sub-7..20)', en: 'Age Groups (U-7..20)', pt: 'Categorias (Sub-7..20)' },
    { key: 'nav.partidos', category: 'Navegación', es: 'Partidos & Fixture', en: 'Matches & Fixtures', pt: 'Jogos & Calendário' },
    { key: 'nav.convocatorias', category: 'Navegación', es: 'Convocatorias', en: 'Lineups & Call-ups', pt: 'Convocatórias' },
    { key: 'nav.biometria', category: 'Navegación', es: 'Biometría & Tests', en: 'Biometrics & Fitness', pt: 'Biometria & Testes' },
    { key: 'nav.telemetria', category: 'Navegación', es: 'Telemetría GPS & Carga', en: 'GPS Telemetry & Heatmaps', pt: 'Telemetria GPS & Carga' },
    { key: 'nav.scouting', category: 'Navegación', es: 'Scouting & Captación', en: 'Scouting & Talent Pipeline', pt: 'Olheiro & Captação' },
    { key: 'nav.ia', category: 'Navegación', es: 'Copiloto Táctico AI', en: 'AI Tactical Copilot', pt: 'Copiloto Tático IA' },
    { key: 'nav.finanzas', category: 'Navegación', es: 'Cobros PSE / Cartera', en: 'Finance & Invoicing', pt: 'Financeiro & Cobrança' },
    { key: 'nav.canchas', category: 'Navegación', es: 'Alquiler Canchas & Sedes', en: 'Pitch & Facility Rentals', pt: 'Campos & Aluguel' },
    { key: 'nav.tienda', category: 'Navegación', es: 'Tienda & Kits Oficiales', en: 'Club Store & Kits', pt: 'Loja Oficial & Equipamentos' },
    { key: 'nav.portalPadres', category: 'Navegación', es: 'Portal Móvil Padres', en: 'Parents Mobile Portal', pt: 'Portal dos Pais' },
    { key: 'nav.modulosEscuela', category: 'Navegación', es: 'Módulos Escuela', en: 'Academy Modules', pt: 'Módulos da Escola' },
    { key: 'nav.parametros', category: 'Navegación', es: 'Parámetros Sistema', en: 'System Parameters', pt: 'Parâmetros do Sistema' },
    { key: 'nav.rolesPermisos', category: 'Navegación', es: 'Roles & Permisos', en: 'Roles & Permissions', pt: 'Cargos & Permissões' },
    { key: 'nav.idiomas', category: 'Navegación', es: 'Idiomas & Multiidioma', en: 'Languages & i18n', pt: 'Idiomas & Tradução' },

    { key: 'action.save', category: 'Acciones', es: 'Guardar', en: 'Save', pt: 'Salvar' },
    { key: 'action.cancel', category: 'Acciones', es: 'Cancelar', en: 'Cancel', pt: 'Cancelar' },
    { key: 'action.edit', category: 'Acciones', es: 'Editar', en: 'Edit', pt: 'Editar' },
    { key: 'action.delete', category: 'Acciones', es: 'Eliminar', en: 'Delete', pt: 'Excluir' },
    { key: 'action.create', category: 'Acciones', es: 'Crear', en: 'Create', pt: 'Criar' },
    { key: 'action.search', category: 'Acciones', es: 'Buscar...', en: 'Search...', pt: 'Pesquisar...' },
    { key: 'action.filter', category: 'Acciones', es: 'Filtrar', en: 'Filter', pt: 'Filtrar' },
    { key: 'action.close', category: 'Acciones', es: 'Cerrar', en: 'Close', pt: 'Fechar' },
    { key: 'action.confirm', category: 'Acciones', es: 'Confirmar', en: 'Confirm', pt: 'Confirmar' },
    { key: 'action.export', category: 'Acciones', es: 'Exportar', en: 'Export', pt: 'Exportar' },
    { key: 'action.download', category: 'Acciones', es: 'Descargar', en: 'Download', pt: 'Baixar' },
    { key: 'action.reset', category: 'Acciones', es: 'Restablecer', en: 'Reset', pt: 'Redefinir' },
    { key: 'action.pay', category: 'Acciones', es: 'Pagar', en: 'Pay Now', pt: 'Pagar' },
    { key: 'action.enroll', category: 'Acciones', es: 'Inscribir', en: 'Register Player', pt: 'Inscrever' },

    { key: 'status.active', category: 'Estados', es: 'Activo', en: 'Active', pt: 'Ativo' },
    { key: 'status.inactive', category: 'Estados', es: 'Inactivo', en: 'Inactive', pt: 'Inativo' },
    { key: 'status.injured', category: 'Estados', es: 'Lesionado', en: 'Injured', pt: 'Lesionado' },
    { key: 'status.suspended', category: 'Estados', es: 'Suspendido', en: 'Suspended', pt: 'Suspenso' },
    { key: 'status.retired', category: 'Estados', es: 'Retirado', en: 'Retired', pt: 'Aposentado' },
    { key: 'status.scheduled', category: 'Estados', es: 'Programado', en: 'Scheduled', pt: 'Agendado' },
    { key: 'status.finished', category: 'Estados', es: 'Finalizado', en: 'Completed', pt: 'Finalizado' },
    { key: 'status.paid', category: 'Estados', es: 'Pagado Total', en: 'Fully Paid', pt: 'Pago Total' },
    { key: 'status.pending', category: 'Estados', es: 'En Mora / Pendiente', en: 'Overdue / Pending', pt: 'Em Atraso / Pendente' },
    { key: 'status.signing', category: 'Estados', es: 'Interés de Fichaje', en: 'Target Prospect', pt: 'Interesse em Contratar' },

    { key: 'common.welcome', category: 'Común', es: 'Bienvenido a SportCoreOS', en: 'Welcome to SportCoreOS', pt: 'Bem-vindo ao SportCoreOS' },
    { key: 'common.totalPlayers', category: 'Común', es: 'Total en Plantel', en: 'Total Squad Size', pt: 'Total no Elenco' },
    { key: 'common.activeMembers', category: 'Común', es: 'Matrículas Activas', en: 'Active Memberships', pt: 'Matrículas Ativas' },
    { key: 'common.loading', category: 'Común', es: 'Cargando datos del club...', en: 'Loading club information...', pt: 'Carregando dados do clube...' },
    { key: 'common.currency', category: 'Común', es: 'Moneda Oficial ($ COP)', en: 'Club Currency ($ COP)', pt: 'Moeda Oficial ($ COP)' },

    { key: 'i18n.title', category: 'Idiomas', es: 'Centro de Idiomas & Internacionalización (i18n)', en: 'Language & Internationalization Hub (i18n)', pt: 'Central de Idiomas & Internacionalização (i18n)' },
    { key: 'i18n.subtitle', category: 'Idiomas', es: 'Configuración multiidioma nativa, catálogos de traducción y adaptación regional', en: 'Multi-language management, translation dictionaries and localization', pt: 'Configuração multilíngue nativa, catálogos de tradução e adaptação regional' },
  ]);

  readonly filteredEntries = computed(() => {
    let list = this.allEntries();
    const cat = this.selectedCategory();
    if (cat !== 'TODAS') {
      list = list.filter(e => e.category === cat);
    }
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(e => 
        e.key.toLowerCase().includes(q) || 
        e.es.toLowerCase().includes(q) || 
        e.en.toLowerCase().includes(q) || 
        e.pt.toLowerCase().includes(q)
      );
    }
    return list;
  });

  ngOnInit(): void {}

  countByCategory(cat: string): number {
    return this.allEntries().filter(e => e.category === cat).length;
  }

  changeLanguage(code: LanguageCode): void {
    this.i18n.setLanguage(code);
    const details = this.i18n.currentLanguageDetails();
    this.showToast(`${this.i18n.t('i18n.saveSuccess')} ${details.flag} ${details.label}`);
  }

  private showToast(msg: string): void {
    this.toastMsg.set(msg);
    setTimeout(() => {
      this.toastMsg.set('');
    }, 4000);
  }
}
