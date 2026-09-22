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
  template: `
    <div class="idiomas-page">
      <!-- HEADER DE LA PÁGINA -->
      <div class="page-header">
        <div class="header-titles">
          <div class="header-badge">
            <i class="fa-solid fa-globe"></i>
            <span>{{ 'i18n.title' | translate }}</span>
          </div>
          <h1 class="page-title">{{ 'i18n.title' | translate }}</h1>
          <p class="page-subtitle">
            {{ 'i18n.subtitle' | translate }}
          </p>
        </div>
      </div>

      <!-- KPI METRICS ROW -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon emerald"><i class="fa-solid fa-language"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ i18n.currentLanguageDetails().flag }} {{ i18n.currentLanguageDetails().label }}</span>
            <span class="kpi-label">{{ 'i18n.activeLanguage' | translate }}</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="fa-solid fa-earth-americas"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ i18n.availableLanguages().length }}</span>
            <span class="kpi-label">{{ 'i18n.supportedLanguages' | translate }}</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon amber"><i class="fa-solid fa-book-bookmark"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ allEntries().length }}</span>
            <span class="kpi-label">{{ 'i18n.totalKeys' | translate }}</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon rose"><i class="fa-solid fa-shield-check"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">100%</span>
            <span class="kpi-label">{{ 'i18n.coverage' | translate }}</span>
          </div>
        </div>
      </div>

      <!-- SELECTOR DE IDIOMA ACTIVO -->
      <div class="section-card fut-card">
        <div class="card-header-clean">
          <div class="header-title-wrap">
            <i class="fa-solid fa-sliders text-emerald"></i>
            <div>
              <h3>{{ 'i18n.selectLanguage' | translate }}</h3>
              <p>Cambia el idioma de la aplicación en tiempo real con persistencia automática en el navegador</p>
            </div>
          </div>
        </div>

        <div class="languages-selection-grid">
          @for (lang of i18n.availableLanguages(); track lang.code) {
            <div 
              class="lang-choice-card" 
              [class.selected]="i18n.currentLang() === lang.code"
              (click)="changeLanguage(lang.code)">
              <div class="lang-flag-hero">{{ lang.flag }}</div>
              <div class="lang-choice-info">
                <h4>{{ lang.label }}</h4>
                <p class="native-name">{{ lang.nativeName }}</p>
                <span class="region-pill">{{ lang.region }}</span>
              </div>
              <div class="lang-status-indicator">
                @if (i18n.currentLang() === lang.code) {
                  <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Activo</span>
                } @else {
                  <button type="button" class="btn-select-lang">Activar</button>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- SANDBOX DE PREVISUALIZACIÓN EN VIVO -->
      <div class="section-card fut-card">
        <div class="card-header-clean">
          <div class="header-title-wrap">
            <i class="fa-solid fa-eye text-blue"></i>
            <div>
              <h3>{{ 'i18n.testSandbox' | translate }}</h3>
              <p>Comprueba cómo se adaptan los componentes de la interfaz al idioma seleccionado</p>
            </div>
          </div>
        </div>

        <div class="sandbox-preview-container">
          <!-- Botones de Acción -->
          <div class="sandbox-row">
            <span class="sandbox-label">Botones & Acciones:</span>
            <div class="sandbox-elements">
              <button class="btn-primary-preview"><i class="fa-solid fa-floppy-disk"></i> {{ 'action.save' | translate }}</button>
              <button class="btn-secondary-preview"><i class="fa-solid fa-xmark"></i> {{ 'action.cancel' | translate }}</button>
              <button class="btn-secondary-preview"><i class="fa-solid fa-pen-to-square"></i> {{ 'action.edit' | translate }}</button>
              <button class="btn-danger-preview"><i class="fa-solid fa-trash-can"></i> {{ 'action.delete' | translate }}</button>
              <button class="btn-primary-preview"><i class="fa-solid fa-credit-card"></i> {{ 'action.pay' | translate }}</button>
            </div>
          </div>

          <!-- Badges de Estado -->
          <div class="sandbox-row">
            <span class="sandbox-label">Estados & Badges:</span>
            <div class="sandbox-elements">
              <span class="badge badge-success">{{ 'status.active' | translate }}</span>
              <span class="badge badge-warning">{{ 'status.injured' | translate }}</span>
              <span class="badge badge-blue">{{ 'status.scheduled' | translate }}</span>
              <span class="badge badge-danger">{{ 'status.pending' | translate }}</span>
              <span class="badge badge-purple">{{ 'status.signing' | translate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- EXPLORADOR DEL DICCIONARIO DE TRADUCCIÓN -->
      <div class="section-card fut-card">
        <div class="card-header-clean">
          <div class="header-title-wrap">
            <i class="fa-solid fa-book-open text-amber"></i>
            <div>
              <h3>{{ 'i18n.dictionaryExplorer' | translate }}</h3>
              <p>Listado completo de claves y traducciones oficiales en español, inglés y portugués</p>
            </div>
          </div>

          <div class="dictionary-search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Buscar clave o texto..." 
              class="sport-input search-input" />
          </div>
        </div>

        <div class="category-filters-pills">
          <button 
            class="pill" 
            [class.active]="selectedCategory() === 'TODAS'"
            (click)="selectedCategory.set('TODAS')">
            Todas ({{ allEntries().length }})
          </button>
          @for (cat of categories(); track cat) {
            <button 
              class="pill" 
              [class.active]="selectedCategory() === cat"
              (click)="selectedCategory.set(cat)">
              {{ cat }} ({{ countByCategory(cat) }})
            </button>
          }
        </div>

        <div class="fut-table-container">
          <table class="fut-table">
            <thead>
              <tr>
                <th style="width: 220px;">Clave (Key)</th>
                <th style="width: 130px;">Categoría</th>
                <th>🇪🇸 Español (es)</th>
                <th>🇺🇸 English (en)</th>
                <th>🇧🇷 Português (pt)</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of filteredEntries(); track entry.key) {
                <tr class="entry-row">
                  <td>
                    <code class="key-code font-mono">{{ entry.key }}</code>
                  </td>
                  <td>
                    <span class="category-tag">{{ entry.category }}</span>
                  </td>
                  <td>
                    <span class="text-es" [class.highlight]="i18n.currentLang() === 'es'">{{ entry.es }}</span>
                  </td>
                  <td>
                    <span class="text-en" [class.highlight]="i18n.currentLang() === 'en'">{{ entry.en }}</span>
                  </td>
                  <td>
                    <span class="text-pt" [class.highlight]="i18n.currentLang() === 'pt'">{{ entry.pt }}</span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="empty-table-cell">
                    <p>No se encontraron términos para la búsqueda.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- TOAST DE NOTIFICACIÓN -->
      @if (toastMsg()) {
        <div class="toast-floating-alert">
          <i class="fa-solid fa-circle-check"></i>
          <span>{{ toastMsg() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .idiomas-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;

      .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        background: rgba(16, 185, 129, 0.12);
        color: var(--color-primary);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
      }

      .page-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-heading);
        margin: 0;
      }

      .page-subtitle {
        color: var(--text-body);
        font-size: 0.85rem;
        margin-top: 0.25rem;
      }
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.15rem;
    }

    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-card);

      .kpi-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;

        &.emerald { background: rgba(16, 185, 129, 0.12); color: var(--color-primary); }
        &.blue { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
        &.amber { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
        &.rose { background: rgba(244, 63, 94, 0.12); color: #f43f5e; }
      }

      .kpi-info {
        display: flex;
        flex-direction: column;

        .kpi-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-heading);
        }

        .kpi-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
      }
    }

    .section-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      box-shadow: var(--shadow-card);
    }

    .card-header-clean {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;

      .header-title-wrap {
        display: flex;
        align-items: center;
        gap: 0.85rem;

        i {
          font-size: 1.5rem;
        }

        h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-heading);
        }

        p {
          margin: 0.15rem 0 0;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      }
    }

    .languages-selection-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.15rem;
    }

    .lang-choice-card {
      background: var(--bg-surface);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary);
        transform: translateY(-2px);
      }

      &.selected {
        border-color: var(--color-primary);
        background: rgba(16, 185, 129, 0.06);
        box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
      }

      .lang-flag-hero {
        font-size: 2.5rem;
        line-height: 1;
      }

      .lang-choice-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        h4 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-heading);
        }

        .native-name {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-body);
        }

        .region-pill {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
        }
      }

      .btn-select-lang {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        padding: 0.4rem 0.85rem;
        border-radius: var(--radius-md);
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-main);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: var(--color-primary);
          color: #ffffff;
          border-color: var(--color-primary);
        }
      }
    }

    .sandbox-preview-container {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .sandbox-row {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        flex-wrap: wrap;

        .sandbox-label {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-muted);
          min-width: 140px;
          text-transform: uppercase;
        }

        .sandbox-elements {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
      }

      .btn-primary-preview {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
        color: #ffffff;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }

      .btn-secondary-preview {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        color: var(--text-main);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }

      .btn-danger-preview {
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: #ef4444;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.85rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }
    }

    .category-filters-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;

      .pill {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        padding: 0.35rem 0.85rem;
        border-radius: var(--radius-full);
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.2s;

        &.active {
          background: var(--color-primary);
          color: #ffffff;
          border-color: var(--color-primary);
        }
      }
    }

    .key-code {
      font-size: 0.78rem;
      background: var(--bg-surface);
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      border: 1px solid var(--border-color);
      color: var(--color-primary);
    }

    .category-tag {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--bg-surface);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-xs);
    }

    .highlight {
      font-weight: 700;
      color: var(--color-primary);
    }

    .empty-table-cell {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
    }
  `]
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
