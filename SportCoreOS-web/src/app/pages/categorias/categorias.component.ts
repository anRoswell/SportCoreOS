import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="categorias-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Categorías por Edades (Sub-7 a Sub-20)</h1>
          <p class="page-subtitle">Estructuración deportiva, cuerpo técnico, cupos y planteles oficiales</p>
        </div>
        <div class="header-actions">
          <div class="filter-group">
            <label class="filter-label">Rama:</label>
            <select [ngModel]="selectedRama()" (ngModelChange)="selectedRama.set($event)" class="sport-select">
              <option value="TODAS">Todas las Ramas</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
              <option value="MIXTO">Mixto</option>
            </select>
          </div>
          <button class="btn-primary" (click)="openCreateModal()">
            <i class="fa-solid fa-plus"></i> Nueva Categoría
          </button>
        </div>
      </div>

      <!-- CARDS GRID -->
      <div class="cards-grid">
        @for (c of filteredCategorias(); track c.id) {
          <div class="fut-card cat-card">
            <div class="cat-header">
              <span class="cat-badge" [style.background-color]="c.color_distintivo || '#10b981'">{{ c.codigo_categoria }}</span>
              <span class="badge" [class.badge-success]="c.rama === 'MASCULINO'" [class.badge-purple]="c.rama === 'FEMENINO'" [class.badge-blue]="c.rama === 'MIXTO'">
                {{ c.rama }}
              </span>
            </div>

            <h3 class="cat-name">{{ c.nombre }}</h3>
            <p class="cat-years">Años de nacimiento: {{ c.anio_nacimiento_min }} - {{ c.anio_nacimiento_max }}</p>

            <div class="cat-details-row">
              <span class="level-pill"><i class="fa-solid fa-medal"></i> {{ c.nivel_competencia }}</span>
              <span class="quota-pill"><i class="fa-solid fa-users"></i> Cupo: {{ c.cupo_maximo || 25 }}</span>
            </div>

            <div class="cat-dt">
              <i class="fa-solid fa-user-tie"></i>
              <span><strong>DT:</strong> {{ c.dt_nombre || 'Sin Director Técnico Asignado' }}</span>
            </div>

            <div class="cat-footer">
              <div class="player-count">
                <strong>{{ c.total_jugadores }}</strong> jugadores inscritos
              </div>
              <div class="cat-card-actions">
                <button class="btn-secondary btn-sm btn-edit-cat" (click)="openEditModal(c)" title="Editar Categoría">
                  <i class="fa-solid fa-pen-to-square"></i> Editar
                </button>
                <button class="btn-secondary btn-sm" (click)="openPlantelModal(c)" title="Ver Plantel Oficial">
                  <i class="fa-solid fa-users-rectangle"></i> Ver Plantel
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state fut-card">
            <i class="fa-solid fa-folder-open"></i>
            <p>No se encontraron categorías para el filtro seleccionado.</p>
          </div>
        }
      </div>

      <!-- MODAL CREAR CATEGORÍA -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-layer-group"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Nueva Categoría Deportiva</h2>
                  <p class="modal-subtitle">Registra una división o grupo etario para entrenamientos y torneos</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeCreateModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitCreateCategory()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-tag"></i> Identificación</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-font"></i> Nombre de Categoría <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="newCat.nombre" name="nombre" placeholder="ej. Sub-16 Élite 2010" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-barcode"></i> Código / Sigla <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="newCat.codigo_categoria" name="codigo_categoria" placeholder="ej. SUB_16" class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-regular fa-calendar"></i> Rango de Años de Nacimiento</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-calendar-minus"></i> Año Nacimiento Mínimo <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="newCat.anio_nacimiento_min" name="anio_nacimiento_min" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-calendar-plus"></i> Año Nacimiento Máximo <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="newCat.anio_nacimiento_max" name="anio_nacimiento_max" class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-sliders"></i> Configuración Técnica</span>
                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-venus-mars"></i> Rama</label>
                    <select [(ngModel)]="newCat.rama" name="rama" class="sport-input">
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                      <option value="MIXTO">Mixto</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-trophy"></i> Nivel Competencia</label>
                    <select [(ngModel)]="newCat.nivel_competencia" name="nivel_competencia" class="sport-input">
                      <option value="FORMATIVO">Formativo</option>
                      <option value="COMPETITIVO">Competitivo</option>
                      <option value="ELITE">Élite Pro</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-users"></i> Cupo Máximo</label>
                    <input type="number" [(ngModel)]="newCat.cupo_maximo" name="cupo_maximo" class="sport-input" />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-palette"></i> Color Distintivo</label>
                    <input type="color" [(ngModel)]="newCat.color_distintivo" name="color_distintivo" class="color-picker-input" />
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeCreateModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-floppy-disk"></i> Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL EDITAR CATEGORÍA (CON BOTONES DE ACCIÓN) -->
      @if (showEditModal() && selectedCategoryToEdit()) {
        <div class="modal-overlay" (click)="closeEditModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-amber">
                  <i class="fa-solid fa-pen-to-square"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Editar Categoría Deportiva</h2>
                  <p class="modal-subtitle">Actualiza la división, años de nacimiento y cupos del grupo</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeEditModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitEditCategory()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-tag"></i> Identificación</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-font"></i> Nombre de Categoría <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="editCat.nombre" name="editNombre" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-barcode"></i> Código / Sigla <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="editCat.codigo_categoria" name="editCodigo" class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-regular fa-calendar"></i> Rango de Años de Nacimiento</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-calendar-minus"></i> Año Nacimiento Mínimo <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="editCat.anio_nacimiento_min" name="editAnioMin" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-calendar-plus"></i> Año Nacimiento Máximo <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="editCat.anio_nacimiento_max" name="editAnioMax" class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-sliders"></i> Configuración Técnica</span>
                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-venus-mars"></i> Rama</label>
                    <select [(ngModel)]="editCat.rama" name="editRama" class="sport-input">
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMENINO">Femenino</option>
                      <option value="MIXTO">Mixto</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-trophy"></i> Nivel Competencia</label>
                    <select [(ngModel)]="editCat.nivel_competencia" name="editNivel" class="sport-input">
                      <option value="FORMATIVO">Formativo</option>
                      <option value="COMPETITIVO">Competitivo</option>
                      <option value="ELITE">Élite Pro</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-users"></i> Cupo Máximo</label>
                    <input type="number" [(ngModel)]="editCat.cupo_maximo" name="editCupo" class="sport-input" />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-palette"></i> Color Distintivo</label>
                    <input type="color" [(ngModel)]="editCat.color_distintivo" name="editColor" class="color-picker-input" />
                  </div>
                </div>
              </div>

              <!-- BOTONES DE ACCIÓN (FOOTER) -->
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeEditModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-floppy-disk"></i> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL PLANTEL DE LA CATEGORÍA -->
      @if (showPlantelModal() && selectedCategory()) {
        <div class="modal-overlay" (click)="closePlantelModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-blue">
                  <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Plantel Oficial • {{ selectedCategory()?.nombre }}</h2>
                  <p class="modal-subtitle">Jugadores activos registrados y matriculados en esta categoría</p>
                </div>
              </div>
              <button class="btn-close" (click)="closePlantelModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="plantel-list-container modal-body-scroll">
              @if (plantelPlayers().length > 0) {
                <table class="fut-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Jugador</th>
                      <th>Posición</th>
                      <th>Documento</th>
                      <th>Biometría (Peso/Talla/IMC)</th>
                      <th>EPS</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (p of plantelPlayers(); track p.id) {
                      <tr>
                        <td>
                          <span class="dorsal-badge">#{{ p.numero_dorsal || '-' }}</span>
                        </td>
                        <td>
                          <div class="player-cell">
                            <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'" alt="Avatar" class="player-avatar-sm" />
                            <div>
                              <strong>{{ p.nombres }} {{ p.apellidos }}</strong>
                              <small>{{ p.fecha_nacimiento }}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge badge-blue">{{ p.posicion_principal }}</span>
                        </td>
                        <td>{{ p.numero_documento }}</td>
                        <td>
                          @if (p.peso_kg && p.talla_cm) {
                            <span>{{ p.peso_kg }} kg • {{ p.talla_cm }} cm (IMC: {{ p.imc }})</span>
                          } @else {
                            <span class="text-muted">Sin medición</span>
                          }
                        </td>
                        <td>{{ p.eps || 'No registrada' }}</td>
                        <td>
                          <span class="badge" [class.badge-success]="p.estado_matricula === 'ACTIVO'" [class.badge-warning]="p.estado_matricula === 'LESIONADO'">
                            {{ p.estado_matricula }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              } @else {
                <div class="empty-plantel">
                  <i class="fa-solid fa-user-xmark"></i>
                  <p>No hay jugadores registrados en esta categoría actualmente.</p>
                </div>
              }
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closePlantelModal()">
                <i class="fa-solid fa-xmark"></i> Cerrar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- TOAST -->
      @if (toastMessage()) {
        <div class="toast-floating-alert">
          <i class="fa-solid fa-circle-check"></i>
          <span>{{ toastMessage() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .categorias-page {
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

      .page-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-heading);
      }

      .page-subtitle {
        color: var(--text-body);
        font-size: 0.85rem;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .filter-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-muted);
      }
    }

    .sport-select {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 600;
      outline: none;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .cat-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .cat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .cat-badge {
          color: #FFFFFF;
          padding: 0.25rem 0.65rem;
          border-radius: 6px;
          font-weight: 800;
          font-size: 0.75rem;
        }
      }

      .cat-name {
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-heading);
      }

      .cat-years {
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .cat-details-row {
        display: flex;
        gap: 0.5rem;

        .level-pill, .quota-pill {
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          color: var(--text-body);
        }
      }

      .cat-dt {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--text-main);
        padding: 0.5rem 0;
        border-top: 1px solid var(--border-color);

        i {
          color: var(--color-primary);
        }
      }

      .cat-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.5rem;
        border-top: 1px solid var(--border-color);

        .player-count {
          font-size: 0.8rem;
          color: var(--text-muted);

          strong {
            color: var(--color-primary);
          }
        }

        .cat-card-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.4rem 0.75rem;
          font-size: 0.8rem;
        }
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      i { font-size: 2.5rem; }
    }

    /* MODAL (inherits from global _modals.scss) */
    .color-picker-input {
      height: 42px;
      width: 100%;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      cursor: pointer;
      background: transparent;
      padding: 2px;
    }

    .plantel-list-container {
      max-height: 480px;
      overflow-y: auto;
    }

    .plantel-list-container {
      max-height: 450px;
      overflow-y: auto;
    }

    .dorsal-badge {
      font-weight: 800;
      color: var(--color-primary);
      font-size: 0.85rem;
    }

    .player-cell {
      display: flex;
      align-items: center;
      gap: 0.65rem;

      .player-avatar-sm {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }

      div {
        display: flex;
        flex-direction: column;
        strong { font-size: 0.85rem; color: var(--text-main); }
        small { font-size: 0.7rem; color: var(--text-muted); }
      }
    }

    .badge-purple {
      background: rgba(168, 85, 247, 0.15);
      color: #a855f7;
    }

    .empty-plantel {
      padding: 2.5rem;
      text-align: center;
      color: var(--text-muted);
      i { font-size: 2rem; margin-bottom: 0.5rem; }
    }

    .toast-floating-alert {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: #ffffff;
      padding: 0.85rem 1.35rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-elevated);
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-weight: 700;
      z-index: 10000;
      animation: slideInUp 0.3s ease;
    }
  `]
})
export class CategoriasComponent implements OnInit {
  private api = inject(ApiService);

  readonly categorias = signal<any[]>([]);
  readonly selectedRama = signal<string>('TODAS');
  readonly showCreateModal = signal<boolean>(false);
  readonly showEditModal = signal<boolean>(false);
  readonly selectedCategoryToEdit = signal<any | null>(null);
  readonly showPlantelModal = signal<boolean>(false);
  readonly selectedCategory = signal<any | null>(null);
  readonly plantelPlayers = signal<any[]>([]);
  readonly toastMessage = signal<string>('');

  newCat = {
    nombre: '',
    codigo_categoria: '',
    anio_nacimiento_min: 2011,
    anio_nacimiento_max: 2011,
    rama: 'MASCULINO',
    nivel_competencia: 'FORMATIVO',
    color_distintivo: '#10B981',
    cupo_maximo: 25,
  };

  editCat = {
    nombre: '',
    codigo_categoria: '',
    anio_nacimiento_min: 2011,
    anio_nacimiento_max: 2011,
    rama: 'MASCULINO',
    nivel_competencia: 'FORMATIVO',
    color_distintivo: '#10B981',
    cupo_maximo: 25,
  };

  readonly filteredCategorias = computed(() => {
    const list = this.categorias();
    const rama = this.selectedRama();
    if (rama === 'TODAS') return list;
    return list.filter((c) => c.rama === rama);
  });

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.api.getCategorias().subscribe((data) => {
      this.categorias.set(data || []);
    });
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  openEditModal(cat: any): void {
    this.selectedCategoryToEdit.set(cat);
    this.editCat = {
      nombre: cat.nombre || '',
      codigo_categoria: cat.codigo_categoria || '',
      anio_nacimiento_min: cat.anio_nacimiento_min || 2011,
      anio_nacimiento_max: cat.anio_nacimiento_max || 2011,
      rama: cat.rama || 'MASCULINO',
      nivel_competencia: cat.nivel_competencia || 'FORMATIVO',
      color_distintivo: cat.color_distintivo || '#10B981',
      cupo_maximo: cat.cupo_maximo || 25,
    };
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedCategoryToEdit.set(null);
  }

  submitCreateCategory(): void {
    if (!this.newCat.nombre || !this.newCat.codigo_categoria) {
      this.showToast('Por favor completa los campos requeridos');
      return;
    }

    this.api.createCategoria(this.newCat).subscribe({
      next: () => {
        this.showToast('¡Categoría deportiva creada exitosamente!');
        this.closeCreateModal();
        this.loadCategorias();
        this.newCat = {
          nombre: '',
          codigo_categoria: '',
          anio_nacimiento_min: 2011,
          anio_nacimiento_max: 2011,
          rama: 'MASCULINO',
          nivel_competencia: 'FORMATIVO',
          color_distintivo: '#10B981',
          cupo_maximo: 25,
        };
      },
      error: () => {
        this.showToast('Error al crear categoría');
      },
    });
  }

  submitEditCategory(): void {
    const cat = this.selectedCategoryToEdit();
    if (!cat || !cat.id) return;

    if (!this.editCat.nombre || !this.editCat.codigo_categoria) {
      this.showToast('Por favor completa los campos requeridos');
      return;
    }

    this.api.updateCategoria(cat.id, this.editCat).subscribe({
      next: () => {
        this.showToast('¡Categoría deportiva actualizada exitosamente!');
        this.closeEditModal();
        this.loadCategorias();
      },
      error: () => {
        this.showToast('Error al actualizar categoría');
      },
    });
  }

  openPlantelModal(cat: any): void {
    this.selectedCategory.set(cat);
    this.showPlantelModal.set(true);
    this.api.getPlantelCategoria(cat.id).subscribe((players) => {
      this.plantelPlayers.set(players || []);
    });
  }

  closePlantelModal(): void {
    this.showPlantelModal.set(false);
    this.selectedCategory.set(null);
    this.plantelPlayers.set([]);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
