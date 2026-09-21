import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-biometria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="biometria-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Biometría Deportiva & Test Físicos</h1>
          <p class="page-subtitle">Control antropométrico periódico, test de Cooper, velocidad y radar de aptitud física</p>
        </div>
        <div class="header-actions">
          <div class="filter-group">
            <label class="filter-label">Categoría:</label>
            <select [ngModel]="selectedCategoriaId()" (ngModelChange)="selectedCategoriaId.set($event)" class="sport-select">
              <option value="TODAS">Todas las Categorías</option>
              @for (cat of categorias(); track cat.id) {
                <option [value]="cat.id">{{ cat.nombre }}</option>
              }
            </select>
          </div>
          <button class="btn-primary" (click)="openCreateModal()">
            <i class="fa-solid fa-plus"></i> Nueva Medición Antropométrica
          </button>
        </div>
      </div>

      <!-- TABLA DE EVALUACIONES -->
      <div class="fut-table-container">
        <table class="fut-table">
          <thead>
            <tr>
              <th>Jugador</th>
              <th>Categoría</th>
              <th>Fecha Medición</th>
              <th>Estatura</th>
              <th>Peso</th>
              <th>IMC</th>
              <th>Test Cooper (m)</th>
              <th>Velocidad 30m (s)</th>
              <th>Salto Vertical (cm)</th>
              <th>Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            @for (b of filteredMediciones(); track b.id) {
              <tr class="bio-row">
                <td>
                  <div class="player-cell">
                    <strong>{{ b.jugador_nombre }}</strong>
                    <small>#{{ b.numero_dorsal || '-' }} • {{ b.posicion_principal }}</small>
                  </div>
                </td>
                <td><span class="badge badge-blue">{{ b.categoria_nombre }}</span></td>
                <td>{{ b.fecha_evaluacion }}</td>
                <td>{{ b.talla_cm }} cm</td>
                <td>{{ b.peso_kg }} kg</td>
                <td><strong>{{ b.imc }}</strong></td>
                <td>{{ b.test_cooper_metros || '-' }} m</td>
                <td>{{ b.velocidad_30m_seg || '-' }} s</td>
                <td>{{ b.salto_vertical_cm || '-' }} cm</td>
                <td>
                  <span class="badge" [class.badge-success]="getDiagnostico(b).tipo === 'success'" [class.badge-blue]="getDiagnostico(b).tipo === 'blue'" [class.badge-warning]="getDiagnostico(b).tipo === 'warning'">
                    {{ getDiagnostico(b).label }}
                  </span>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="10" class="empty-table-cell">
                  <i class="fa-solid fa-heart-pulse"></i>
                  <p>No se han registrado evaluaciones biométricas para esta categoría.</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- MODAL NUEVA MEDICIÓN -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-heart-pulse"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Nueva Evaluación Antropométrica & Test Físico</h2>
                  <p class="modal-subtitle">Registro de somatotipo, antropometría y rendimiento atlético</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeCreateModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitCreateBio()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-user-tag"></i> Datos del Jugador y Fecha</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-user-ninja"></i> Jugador <span class="required-star">*</span></label>
                    <select [(ngModel)]="newBio.jugadorId" name="jugadorId" class="sport-input" required>
                      @for (j of jugadores(); track j.id) {
                        <option [value]="j.id">{{ j.apellidos }} {{ j.nombres }} (#{{ j.numero_dorsal || '-' }} - {{ j.categoria_nombre }})</option>
                      }
                    </select>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-regular fa-calendar"></i> Fecha de Evaluación <span class="required-star">*</span></label>
                    <input type="date" [(ngModel)]="newBio.fechaEvaluacion" name="fechaEvaluacion" class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-weight-scale"></i> Antropometría Básica</span>
                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-weight-hanging"></i> Peso Corporal (kg) <span class="required-star">*</span></label>
                    <input type="number" step="0.1" [(ngModel)]="newBio.pesoKg" (ngModelChange)="calcularImc()" name="pesoKg" placeholder="ej. 58.5" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-ruler-vertical"></i> Talla / Estatura (cm) <span class="required-star">*</span></label>
                    <input type="number" step="0.5" [(ngModel)]="newBio.tallaCm" (ngModelChange)="calcularImc()" name="tallaCm" placeholder="ej. 170.0" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-calculator"></i> IMC Calculado</label>
                    <input type="text" [value]="calculatedImc()" class="sport-input readonly-input" readonly />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-gauge-high"></i> Batería de Pruebas Físicas</span>
                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-person-running"></i> Test Cooper (metros)</label>
                    <input type="number" [(ngModel)]="newBio.testCooperMetros" name="testCooperMetros" placeholder="ej. 2800" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-bolt"></i> Sprint 30m (seg)</label>
                    <input type="number" step="0.01" [(ngModel)]="newBio.velocidad30mSeg" name="velocidad30mSeg" placeholder="ej. 4.15" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-arrows-up-down"></i> Salto Vertical (cm)</label>
                    <input type="number" step="0.5" [(ngModel)]="newBio.saltoVerticalCm" name="saltoVerticalCm" placeholder="ej. 45.0" class="sport-input" />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-clipboard-user"></i> Observaciones y Diagnóstico</span>
                <div class="input-group">
                  <label><i class="fa-solid fa-comment-medical"></i> Observaciones del Preparador Físico</label>
                  <textarea [(ngModel)]="newBio.observaciones" name="observaciones" rows="2" placeholder="ej. Excelente respuesta cardiovascular y potencia muscular" class="sport-input textarea-input"></textarea>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeCreateModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-floppy-disk"></i> Guardar Evaluación
                </button>
              </div>
            </form>
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
    .biometria-page {
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

    .player-cell {
      display: flex;
      flex-direction: column;
      strong { font-size: 0.85rem; color: var(--text-main); }
      small { font-size: 0.75rem; color: var(--text-muted); }
    }

    .empty-table-cell {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
      i { font-size: 2rem; margin-bottom: 0.5rem; }
    }

    /* MODAL (inherits from global _modals.scss) */
    .readonly-input {
      background: var(--bg-card);
      color: var(--color-primary);
      font-weight: 800;
    }

    .textarea-input {
      resize: vertical;
      font-family: inherit;
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
    }
  `]
})
export class BiometriaComponent implements OnInit {
  private api = inject(ApiService);

  readonly mediciones = signal<any[]>([]);
  readonly categorias = signal<any[]>([]);
  readonly jugadores = signal<any[]>([]);
  readonly selectedCategoriaId = signal<string>('TODAS');
  readonly showCreateModal = signal<boolean>(false);
  readonly toastMessage = signal<string>('');
  readonly calculatedImc = signal<string>('-');

  newBio = {
    jugadorId: '',
    fechaEvaluacion: new Date().toISOString().split('T')[0],
    pesoKg: 58.5,
    tallaCm: 170.0,
    testCooperMetros: 2800,
    velocidad30mSeg: 4.15,
    saltoVerticalCm: 45.0,
    observaciones: '',
  };

  readonly filteredMediciones = computed(() => {
    let list = this.mediciones();
    const catId = this.selectedCategoriaId();
    if (catId === 'TODAS') return list;
    return list.filter((b) => b.categoria_id === catId);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.getBiometria().subscribe((data) => {
      this.mediciones.set(data || []);
    });

    this.api.getCategorias().subscribe((cats) => {
      this.categorias.set(cats || []);
    });

    this.api.getJugadores().subscribe((jugs) => {
      this.jugadores.set(jugs || []);
      if (jugs && jugs.length > 0 && !this.newBio.jugadorId) {
        this.newBio.jugadorId = jugs[0].id;
      }
    });
  }

  calcularImc(): void {
    const peso = Number(this.newBio.pesoKg);
    const talla = Number(this.newBio.tallaCm);
    if (peso > 0 && talla > 0) {
      const m = talla / 100;
      const imc = (peso / (m * m)).toFixed(1);
      this.calculatedImc.set(imc);
    } else {
      this.calculatedImc.set('-');
    }
  }

  openCreateModal(): void {
    this.calcularImc();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitCreateBio(): void {
    if (!this.newBio.jugadorId || !this.newBio.pesoKg || !this.newBio.tallaCm) {
      this.showToast('Por favor completa los campos requeridos');
      return;
    }

    this.api.registrarBiometria(this.newBio).subscribe({
      next: () => {
        this.showToast('¡Evaluación biométrica registrada exitosamente en la BD!');
        this.closeCreateModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al registrar evaluación');
      },
    });
  }

  getDiagnostico(b: any): { label: string; tipo: string } {
    const imc = parseFloat(b.imc || '0');
    const cooper = parseInt(b.test_cooper_metros || '0', 10);

    if (cooper >= 2800 || (imc >= 19 && imc <= 22)) {
      return { label: 'Sobresaliente', tipo: 'success' };
    } else if (cooper >= 2400 || (imc >= 18 && imc <= 24)) {
      return { label: 'Óptimo', tipo: 'blue' };
    }
    return { label: 'En Desarrollo', tipo: 'warning' };
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
