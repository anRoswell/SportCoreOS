import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
  forwardRef,
  inject,
  signal,
  computed,
  model,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

export interface JugadorSelectorItem {
  id: string;
  nombres: string;
  apellidos: string;
  tipo_documento?: string;
  numero_documento?: string;
  genero?: string;
  posicion_principal?: string;
  posicion_secundaria?: string;
  numero_dorsal?: number | string;
  foto_url?: string;
  categoria_id?: string;
  categoria_nombre?: string;
  color_distintivo?: string;
  estado_matricula?: string;
  talla_cm?: number | string;
  peso_kg?: number | string;
  imc?: number | string;
}

@Component({
  selector: 'app-player-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlayerSelectorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="player-selector-container" [class.is-open]="isOpen()" [class.is-disabled]="disabled()">
      <!-- LABEL SI EXISTE -->
      @if (label()) {
        <label class="selector-label">
          <i class="fa-solid fa-user-ninja"></i>
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="required-star">*</span>
          }
        </label>
      }

      <!-- TRIGGER VIEW -->
      @if (selectedPlayerObj(); as p) {
        <!-- JUGADOR SELECCIONADO CARD -->
        <div class="selected-player-box" (click)="toggleDropdown()">
          <div class="player-avatar-wrap">
            <img [src]="resolvePhoto(p.foto_url)" [alt]="p.nombres" />
            @if (p.numero_dorsal) {
              <span class="dorsal-tag">#{{ p.numero_dorsal }}</span>
            }
          </div>

          <div class="player-summary-info">
            <div class="name-row">
              <strong class="player-full-name">{{ p.apellidos ? p.apellidos + ', ' + p.nombres : p.nombres }}</strong>
              @if (p.genero) {
                <span class="gender-pill" [class.male]="p.genero === 'MASCULINO'" [class.female]="p.genero === 'FEMENINO'">
                  <i class="fa-solid" [class.fa-mars]="p.genero === 'MASCULINO'" [class.fa-venus]="p.genero === 'FEMENINO'"></i>
                  {{ p.genero === 'MASCULINO' ? 'Masc' : 'Fem' }}
                </span>
              }
            </div>

            <div class="meta-row">
              @if (p.numero_documento) {
                <span class="doc-badge" title="Documento de Identificación">
                  <i class="fa-solid fa-id-card"></i>
                  {{ p.tipo_documento || 'DOC' }}: {{ p.numero_documento }}
                </span>
              }
              @if (p.categoria_nombre) {
                <span class="cat-badge" [style.background-color]="p.color_distintivo ? p.color_distintivo + '22' : 'rgba(16,185,129,0.15)'" [style.color]="p.color_distintivo || '#10B981'">
                  <span class="cat-dot" [style.background-color]="p.color_distintivo || '#10B981'"></span>
                  {{ p.categoria_nombre }}
                </span>
              }
              @if (p.posicion_principal) {
                <span class="pos-badge">{{ p.posicion_principal }}</span>
              }
            </div>
          </div>

          <div class="trigger-actions" (click)="$event.stopPropagation()">
            <button type="button" class="btn-action-search" (click)="openDropdown()" title="Buscar otro jugador">
              <i class="fa-solid fa-magnifying-glass"></i>
              <span>Cambiar</span>
            </button>
            <button type="button" class="btn-action-clear" (click)="clearSelection()" title="Quitar selección">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      } @else {
        <!-- PLACEHOLDER TRIGGER CON LUPA -->
        <div class="empty-trigger-box" (click)="toggleDropdown()" [class.has-error]="required() && hasInteracted() && !selectedId()">
          <div class="trigger-left">
            <div class="search-lens-icon">
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <span class="placeholder-text">{{ placeholder() }}</span>
          </div>
          <div class="trigger-right">
            <span class="quick-badge"><i class="fa-solid fa-id-card"></i> Doc / Nombre / Género</span>
            <i class="fa-solid fa-chevron-down chevron-icon"></i>
          </div>
        </div>
      }

      <!-- DROPDOWN SEARCH & FILTER PANEL -->
      @if (isOpen()) {
        <div class="search-dropdown-panel" (click)="$event.stopPropagation()">
          <!-- PANEL HEADER CON LUPA Y BUSCADOR -->
          <div class="panel-search-bar">
            <div class="search-input-wrap">
              <i class="fa-solid fa-magnifying-glass search-bar-lens"></i>
              <input
                #searchInputEl
                type="text"
                class="search-input-field"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Escribe nombre, apellido, cédula, tarjeta de identidad, dorsal..."
              />
              @if (searchQuery()) {
                <button type="button" class="btn-clear-input" (click)="clearSearchQuery()">
                  <i class="fa-solid fa-circle-xmark"></i>
                </button>
              }
            </div>
            <button type="button" class="btn-close-panel" (click)="closeDropdown()" title="Cerrar">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- QUICK FILTERS: GÉNERO, CATEGORÍA & POSICIÓN -->
          <div class="panel-filters-row">
            <!-- FILTRO DE GÉNERO -->
            <div class="gender-filter-pills">
              <span class="filter-mini-label"><i class="fa-solid fa-venus-mars"></i> Género:</span>
              <button
                type="button"
                class="pill-btn"
                [class.active]="selectedGender() === 'TODOS'"
                (click)="selectedGender.set('TODOS')"
              >
                Todos
              </button>
              <button
                type="button"
                class="pill-btn"
                [class.active]="selectedGender() === 'MASCULINO'"
                (click)="selectedGender.set('MASCULINO')"
              >
                <i class="fa-solid fa-mars text-blue"></i> Masc
              </button>
              <button
                type="button"
                class="pill-btn"
                [class.active]="selectedGender() === 'FEMENINO'"
                (click)="selectedGender.set('FEMENINO')"
              >
                <i class="fa-solid fa-venus text-pink"></i> Fem
              </button>
            </div>

            <!-- FILTRO DE CATEGORÍA -->
            <div class="select-filter-wrap">
              <select [ngModel]="selectedCatId()" (ngModelChange)="selectedCatId.set($event)" class="panel-filter-select">
                <option value="TODAS">📁 Todas las Categorías</option>
                @for (cat of categoriesList(); track cat.id) {
                  <option [value]="cat.id">{{ cat.nombre }}</option>
                }
              </select>
            </div>

            <!-- FILTRO DE POSICIÓN -->
            <div class="select-filter-wrap">
              <select [ngModel]="selectedPos()" (ngModelChange)="selectedPos.set($event)" class="panel-filter-select">
                <option value="TODAS">⚽ Todas las Posiciones</option>
                <option value="Portero">🧤 Portero</option>
                <option value="Defensa">🛡️ Defensa</option>
                <option value="Volante">⚡ Mediocampista / Volante</option>
                <option value="Delantero">🎯 Delantero / Extremo</option>
              </select>
            </div>
          </div>

          <!-- STATS BAR -->
          <div class="results-stats-bar">
            <span class="count-text">
              <i class="fa-solid fa-users"></i>
              Mostrando <strong>{{ filteredPlayers().length }}</strong> deportista(s)
            </span>
            @if (hasActiveSearchOrFilters()) {
              <button type="button" class="btn-reset-filters" (click)="resetFilters()">
                <i class="fa-solid fa-rotate-left"></i> Limpiar Filtros
              </button>
            }
          </div>

          <!-- LISTA DE JUGADORES FILTRADOS -->
          <div class="players-scroll-list">
            @if (loadingPlayers()) {
              <div class="list-loading-state">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p>Buscando deportistas...</p>
              </div>
            } @else if (filteredPlayers().length === 0) {
              <div class="list-empty-state">
                <div class="empty-icon"><i class="fa-solid fa-user-slash"></i></div>
                <p class="empty-title">No se encontraron deportistas</p>
                <small class="empty-sub">Intenta con otro nombre, número de documento o cambia los filtros de género/categoría.</small>
                <button type="button" class="btn-empty-reset" (click)="resetFilters()">
                  <i class="fa-solid fa-magnifying-glass"></i> Ver Todos los Jugadores
                </button>
              </div>
            } @else {
              @for (j of filteredPlayers(); track j.id) {
                <div
                  class="player-option-item"
                  [class.is-selected]="selectedId() === j.id"
                  (click)="onSelectPlayer(j)"
                >
                  <div class="item-avatar-col">
                    <img [src]="resolvePhoto(j.foto_url)" [alt]="j.nombres" />
                    @if (j.numero_dorsal) {
                      <span class="item-dorsal">#{{ j.numero_dorsal }}</span>
                    }
                  </div>

                  <div class="item-main-col">
                    <div class="item-top-row">
                      <span class="item-name">
                        {{ j.apellidos ? j.apellidos + ', ' + j.nombres : j.nombres }}
                      </span>
                      @if (j.genero) {
                        <span class="gender-mini-tag" [class.male]="j.genero === 'MASCULINO'" [class.female]="j.genero === 'FEMENINO'">
                          <i class="fa-solid" [class.fa-mars]="j.genero === 'MASCULINO'" [class.fa-venus]="j.genero === 'FEMENINO'"></i>
                          {{ j.genero === 'MASCULINO' ? 'Masc' : 'Fem' }}
                        </span>
                      }
                    </div>

                    <div class="item-details-row">
                      @if (j.numero_documento) {
                        <span class="doc-tag" title="Documento de Identificación">
                          <i class="fa-solid fa-id-card"></i>
                          {{ j.tipo_documento || 'DOC' }}: <strong>{{ j.numero_documento }}</strong>
                        </span>
                      }
                      @if (j.categoria_nombre) {
                        <span class="cat-pill" [style.color]="j.color_distintivo || '#10B981'">
                          <span class="cat-dot-sm" [style.background-color]="j.color_distintivo || '#10B981'"></span>
                          {{ j.categoria_nombre }}
                        </span>
                      }
                      @if (j.posicion_principal) {
                        <span class="pos-tag">{{ j.posicion_principal }}</span>
                      }
                    </div>
                  </div>

                  <div class="item-select-col">
                    @if (selectedId() === j.id) {
                      <span class="selected-check-badge">
                        <i class="fa-solid fa-check"></i> Seleccionado
                      </span>
                    } @else {
                      <span class="btn-choose-pill">
                        <i class="fa-solid fa-hand-pointer"></i> Elegir
                      </span>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .player-selector-container {
      position: relative;
      width: 100%;
      font-family: inherit;
    }

    .selector-label {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 0.35rem;

      i {
        color: var(--color-primary);
        font-size: 0.85rem;
      }

      .required-star {
        color: #ef4444;
      }
    }

    /* Selected Player Box */
    .selected-player-box {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.6rem 0.85rem;
      background: var(--bg-card);
      border: 1.5px solid var(--color-primary);
      border-radius: var(--radius-md);
      cursor: pointer;
      box-shadow: 0 0 0 3px var(--color-primary-glow, rgba(16, 185, 129, 0.15));
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary-hover, #059669);
        background: var(--bg-card-hover, var(--bg-card));
      }

      .player-avatar-wrap {
        position: relative;
        width: 44px;
        height: 44px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid var(--color-primary);
        }

        .dorsal-tag {
          position: absolute;
          bottom: -2px;
          right: -4px;
          background: #0f172a;
          color: #10b981;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.1rem 0.35rem;
          border-radius: 10px;
          border: 1px solid #10b981;
        }
      }

      .player-summary-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .name-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;

          .player-full-name {
            font-size: 0.925rem;
            font-weight: 800;
            color: var(--text-heading, var(--text-main));
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .gender-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.68rem;
            font-weight: 700;
            padding: 0.15rem 0.45rem;
            border-radius: 6px;

            &.male {
              background: rgba(59, 130, 246, 0.12);
              color: #3b82f6;
            }

            &.female {
              background: rgba(236, 72, 153, 0.12);
              color: #ec4899;
            }
          }
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;

          .doc-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.72rem;
            font-weight: 600;
            color: var(--text-muted);
            background: var(--bg-input);
            padding: 0.15rem 0.45rem;
            border-radius: 4px;
            border: 1px solid var(--border-color);

            i {
              color: var(--color-primary);
              font-size: 0.7rem;
            }
          }

          .cat-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 0.15rem 0.45rem;
            border-radius: 4px;

            .cat-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
            }
          }

          .pos-badge {
            font-size: 0.72rem;
            font-weight: 600;
            color: var(--text-muted);
          }
        }
      }

      .trigger-actions {
        display: flex;
        align-items: center;
        gap: 0.4rem;

        .btn-action-search {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: var(--color-primary);
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;

          &:hover {
            background: var(--color-primary);
            color: #ffffff;
          }
        }

        .btn-action-clear {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.35rem;
          font-size: 0.85rem;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;

          &:hover {
            background: rgba(239, 68, 68, 0.12);
            color: #ef4444;
          }
        }
      }
    }

    /* Empty Trigger Box con Lupa */
    .empty-trigger-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.7rem 0.95rem;
      background: var(--bg-input);
      border: 1.5px solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-glow, rgba(16, 185, 129, 0.1));
      }

      &.has-error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
      }

      .trigger-left {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        flex: 1;

        .search-lens-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.12);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .placeholder-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
      }

      .trigger-right {
        display: flex;
        align-items: center;
        gap: 0.6rem;

        .quick-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 0.2rem 0.45rem;
          border-radius: 4px;
        }

        .chevron-icon {
          font-size: 0.8rem;
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }
      }
    }

    .is-open .chevron-icon {
      transform: rotate(180deg);
    }

    /* Dropdown Popover Panel */
    .search-dropdown-panel {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      background: var(--bg-card, #ffffff);
      border: 1.5px solid var(--color-primary);
      border-radius: var(--radius-lg, 12px);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
      z-index: 1050;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 480px;
      animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes popIn {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Panel Search Bar */
    .panel-search-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 0.85rem;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);

      .search-input-wrap {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;

        .search-bar-lens {
          position: absolute;
          left: 0.85rem;
          color: var(--color-primary);
          font-size: 0.9rem;
          pointer-events: none;
        }

        .search-input-field {
          width: 100%;
          padding: 0.6rem 2.2rem 0.6rem 2.4rem;
          background: var(--bg-input);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-main);
          font-size: 0.875rem;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;

          &:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px var(--color-primary-glow, rgba(16, 185, 129, 0.15));
          }

          &::placeholder {
            color: var(--text-muted);
            font-weight: 400;
          }
        }

        .btn-clear-input {
          position: absolute;
          right: 0.65rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0.2rem;

          &:hover {
            color: var(--text-main);
          }
        }
      }

      .btn-close-panel {
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        color: var(--text-muted);
        width: 36px;
        height: 36px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.15s ease;

        &:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: #ef4444;
          color: #ef4444;
        }
      }
    }

    /* Filters Row */
    .panel-filters-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 0.85rem;
      background: var(--bg-input, rgba(0, 0, 0, 0.03));
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;

      .gender-filter-pills {
        display: flex;
        align-items: center;
        gap: 0.3rem;

        .filter-mini-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-right: 0.15rem;
        }

        .pill-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.55rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;

          &:hover {
            border-color: var(--color-primary);
            color: var(--text-main);
          }

          &.active {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: #ffffff;

            i { color: #ffffff !important; }
          }
        }
      }

      .select-filter-wrap {
        flex: 1;
        min-width: 140px;

        .panel-filter-select {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-main);
          outline: none;

          &:focus {
            border-color: var(--color-primary);
          }
        }
      }
    }

    /* Stats Bar */
    .results-stats-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4rem 0.85rem;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      font-size: 0.72rem;
      color: var(--text-muted);

      .count-text {
        i {
          color: var(--color-primary);
          margin-right: 0.25rem;
        }

        strong {
          color: var(--text-main);
        }
      }

      .btn-reset-filters {
        background: transparent;
        border: none;
        color: var(--color-primary);
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    /* Scrollable Players List */
    .players-scroll-list {
      flex: 1;
      overflow-y: auto;
      max-height: 290px;
      padding: 0.4rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      &::-webkit-scrollbar {
        width: 6px;
      }
      &::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 4px;
      }
    }

    .player-option-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.55rem 0.75rem;
      border-radius: var(--radius-md);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: var(--bg-card-hover, rgba(16, 185, 129, 0.08));
        border-color: rgba(16, 185, 129, 0.25);
      }

      &.is-selected {
        background: rgba(16, 185, 129, 0.12);
        border-color: var(--color-primary);
      }

      .item-avatar-col {
        position: relative;
        width: 40px;
        height: 40px;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 1.5px solid var(--border-color);
        }

        .item-dorsal {
          position: absolute;
          bottom: -2px;
          right: -4px;
          background: #0f172a;
          color: #10b981;
          font-size: 0.6rem;
          font-weight: 800;
          padding: 0.05rem 0.3rem;
          border-radius: 8px;
          border: 1px solid #10b981;
        }
      }

      .item-main-col {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .item-top-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;

          .item-name {
            font-size: 0.875rem;
            font-weight: 700;
            color: var(--text-heading, var(--text-main));
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .gender-mini-tag {
            font-size: 0.65rem;
            font-weight: 700;
            padding: 0.1rem 0.35rem;
            border-radius: 4px;

            &.male {
              background: rgba(59, 130, 246, 0.12);
              color: #3b82f6;
            }

            &.female {
              background: rgba(236, 72, 153, 0.12);
              color: #ec4899;
            }
          }
        }

        .item-details-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;

          .doc-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.72rem;
            color: var(--text-muted);

            i {
              color: var(--color-primary);
              font-size: 0.7rem;
            }

            strong {
              color: var(--text-main);
              font-weight: 700;
            }
          }

          .cat-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.72rem;
            font-weight: 700;

            .cat-dot-sm {
              width: 5px;
              height: 5px;
              border-radius: 50%;
            }
          }

          .pos-tag {
            font-size: 0.72rem;
            color: var(--text-muted);
            font-weight: 500;
          }
        }
      }

      .item-select-col {
        flex-shrink: 0;

        .selected-check-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: var(--color-primary);
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.3rem 0.6rem;
          border-radius: 20px;
        }

        .btn-choose-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.25rem 0.55rem;
          border-radius: 20px;
          transition: all 0.15s ease;

          &:hover {
            border-color: var(--color-primary);
            color: var(--color-primary);
          }
        }
      }
    }

    /* List States */
    .list-loading-state,
    .list-empty-state {
      padding: 1.75rem 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
    }

    .list-loading-state i {
      color: var(--color-primary);
    }

    .list-empty-state {
      .empty-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }

      .empty-title {
        font-size: 0.9rem;
        font-weight: 700;
        color: var(--text-heading, var(--text-main));
        margin: 0;
      }

      .empty-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
        max-width: 280px;
      }

      .btn-empty-reset {
        margin-top: 0.35rem;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: var(--color-primary);
        color: #ffffff;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
      }
    }

    .text-blue { color: #3b82f6; }
    .text-pink { color: #ec4899; }
  `],
})
export class PlayerSelectorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private api = inject(ApiService);
  private hostEl = inject(ElementRef);

  // Model & Inputs
  selectedId = model<string>('');
  label = input<string>('');
  placeholder = input<string>('Buscar deportista por nombre, identificación o género...');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  players = input<any[] | null>(null);
  categoriaId = input<string>('TODAS');

  // Output
  playerSelected = output<JugadorSelectorItem>();

  // ControlValueAccessor Callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Internal Signals
  readonly isOpen = signal<boolean>(false);
  readonly hasInteracted = signal<boolean>(false);
  readonly internalPlayers = signal<JugadorSelectorItem[]>([]);
  readonly categoriesList = signal<any[]>([]);
  readonly loadingPlayers = signal<boolean>(false);

  // Search & Filters
  readonly searchQuery = signal<string>('');
  readonly selectedGender = signal<string>('TODOS');
  readonly selectedCatId = signal<string>('TODAS');
  readonly selectedPos = signal<string>('TODAS');

  readonly defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120';

  // ControlValueAccessor Implementation
  writeValue(value: string | null): void {
    this.selectedId.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Input disabled is managed reactively
  }

  // Effective players pool
  readonly allPlayers = computed(() => {
    const propList = this.players();
    if (propList && Array.isArray(propList) && propList.length > 0) {
      return propList;
    }
    return this.internalPlayers();
  });

  // Selected Player Object
  readonly selectedPlayerObj = computed<JugadorSelectorItem | null>(() => {
    const targetId = this.selectedId();
    if (!targetId) return null;
    return this.allPlayers().find((j) => j.id === targetId) || null;
  });

  // Filtered Players computed
  readonly filteredPlayers = computed(() => {
    const list = this.allPlayers();
    if (!list || !Array.isArray(list)) return [];

    const query = this.searchQuery().trim().toLowerCase();
    const gender = this.selectedGender();
    const catId = this.selectedCatId();
    const pos = this.selectedPos();

    return list.filter((j) => {
      // 1. Filtro de Género
      if (gender !== 'TODOS' && j.genero !== gender) {
        return false;
      }

      // 2. Filtro de Categoría
      if (catId !== 'TODAS' && j.categoria_id !== catId) {
        return false;
      }

      // 3. Filtro de Posición
      if (pos !== 'TODAS') {
        const p1 = (j.posicion_principal || '').toLowerCase();
        const p2 = (j.posicion_secundaria || '').toLowerCase();
        const targetPos = pos.toLowerCase();
        if (!p1.includes(targetPos) && !p2.includes(targetPos)) {
          return false;
        }
      }

      // 4. Búsqueda por Nombre, Apellidos, Número de Identificación, Dorsal
      if (query) {
        const nombres = (j.nombres || '').toLowerCase();
        const apellidos = (j.apellidos || '').toLowerCase();
        const fullName = `${nombres} ${apellidos}`.toLowerCase();
        const reverseName = `${apellidos} ${nombres}`.toLowerCase();
        const docNum = (j.numero_documento || '').toLowerCase();
        const docType = (j.tipo_documento || '').toLowerCase();
        const dorsal = String(j.numero_dorsal || '');
        const catName = (j.categoria_nombre || '').toLowerCase();

        const match =
          nombres.includes(query) ||
          apellidos.includes(query) ||
          fullName.includes(query) ||
          reverseName.includes(query) ||
          docNum.includes(query) ||
          `${docType} ${docNum}`.includes(query) ||
          dorsal === query ||
          `#${dorsal}` === query ||
          catName.includes(query);

        if (!match) return false;
      }

      return true;
    });
  });

  readonly hasActiveSearchOrFilters = computed(() => {
    return (
      this.searchQuery().trim() !== '' ||
      this.selectedGender() !== 'TODOS' ||
      this.selectedCatId() !== 'TODAS' ||
      this.selectedPos() !== 'TODAS'
    );
  });

  ngOnInit(): void {
    if (this.categoriaId() && this.categoriaId() !== 'TODAS') {
      this.selectedCatId.set(this.categoriaId()!);
    }
    this.loadCategories();
    if (!this.players() || (Array.isArray(this.players()) && this.players()!.length === 0)) {
      this.loadInternalPlayers();
    }
  }

  ngOnDestroy(): void {}

  loadCategories(): void {
    this.api.getCategorias().subscribe((cats) => {
      const rows = Array.isArray(cats) ? cats : ((cats as any)?.data || []);
      this.categoriesList.set(rows);
    });
  }

  loadInternalPlayers(): void {
    this.loadingPlayers.set(true);
    this.api.getJugadores({ limit: 100 }).subscribe({
      next: (res) => {
        const rows = Array.isArray(res) ? res : ((res as any)?.data || []);
        this.internalPlayers.set(rows);
        this.loadingPlayers.set(false);
      },
      error: () => {
        this.loadingPlayers.set(false);
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.hostEl.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDropdown();
  }

  toggleDropdown(): void {
    if (this.disabled()) return;
    this.hasInteracted.set(true);
    this.isOpen.update((v) => !v);
  }

  openDropdown(): void {
    if (this.disabled()) return;
    this.hasInteracted.set(true);
    this.isOpen.set(true);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  onSelectPlayer(player: JugadorSelectorItem): void {
    this.selectedId.set(player.id);
    this.onChange(player.id);
    this.onTouched();
    this.playerSelected.emit(player);
    this.closeDropdown();
  }

  clearSelection(): void {
    this.selectedId.set('');
    this.onChange('');
    this.onTouched();
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  clearSearchQuery(): void {
    this.searchQuery.set('');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedGender.set('TODOS');
    this.selectedCatId.set('TODAS');
    this.selectedPos.set('TODAS');
  }

  resolvePhoto(url?: string): string {
    if (!url || !url.trim()) return this.defaultAvatar;
    return this.api.resolveFileUrl(url);
  }
}
