import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit {
  private api = inject(ApiService);

  readonly categorias = signal<any[]>([]);
  readonly entrenadores = signal<any[]>([]);
  readonly selectedRama = signal<string>('TODAS');
  readonly showCreateModal = signal<boolean>(false);
  readonly showEditModal = signal<boolean>(false);
  readonly selectedCategoryToEdit = signal<any | null>(null);
  readonly showPlantelModal = signal<boolean>(false);
  readonly selectedCategory = signal<any | null>(null);
  readonly plantelPlayers = signal<any[]>([]);
  readonly showDeleteModal = signal<boolean>(false);
  readonly categoryToDelete = signal<any | null>(null);
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
    director_tecnico_id: null as string | null,
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
    director_tecnico_id: null as string | null,
  };

  readonly filteredCategorias = computed(() => {
    const list = this.categorias();
    if (!list || !Array.isArray(list)) return [];
    const rama = this.selectedRama();
    if (rama === 'TODAS') return list;
    return list.filter((c) => c.rama === rama);
  });

  ngOnInit(): void {
    this.loadCategorias();
    this.loadEntrenadores();
  }

  loadCategorias(): void {
    this.api.getCategorias().subscribe((data) => {
      const rows = Array.isArray(data) ? data : ((data as any)?.data || []);
      this.categorias.set(rows);
    });
  }

  loadEntrenadores(): void {
    this.api.getUsersWithRoles().subscribe((users) => {
      const list = Array.isArray(users) ? users : ((users as any)?.data || []);
      // Filtrar usuarios con rol ENTRENADOR_DT o que sean técnicos/directores
      const dts = list.filter((u: any) => u.rol === 'ENTRENADOR_DT' || u.rol_club === 'ENTRENADOR_DT' || u.rol === 'DIRECTOR_DEPORTIVO');
      this.entrenadores.set(dts.length > 0 ? dts : list);
    });
  }

  openCreateModal(): void {
    this.newCat = {
      nombre: '',
      codigo_categoria: '',
      anio_nacimiento_min: 2011,
      anio_nacimiento_max: 2011,
      rama: 'MASCULINO',
      nivel_competencia: 'FORMATIVO',
      color_distintivo: '#10B981',
      cupo_maximo: 25,
      director_tecnico_id: null,
    };
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
      director_tecnico_id: cat.director_tecnico_id || cat.dt_id || null,
    };
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedCategoryToEdit.set(null);
  }

  submitCreateCategory(): void {
    if (!this.newCat.nombre?.trim()) {
      this.showToast('El nombre de la categoría es obligatorio (*)');
      return;
    }
    if (!this.newCat.codigo_categoria?.trim()) {
      this.showToast('El código o sigla de la categoría es obligatorio (*)');
      return;
    }
    if (this.newCat.anio_nacimiento_min > this.newCat.anio_nacimiento_max) {
      this.showToast('El año mínimo no puede ser mayor al año máximo.');
      return;
    }
    if (this.newCat.cupo_maximo && this.newCat.cupo_maximo < 1) {
      this.showToast('El cupo máximo debe ser de al menos 1 deportista.');
      return;
    }

    this.api.createCategoria(this.newCat).subscribe({
      next: () => {
        this.showToast('¡Categoría deportiva creada y DT asignado exitosamente!');
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
          director_tecnico_id: null,
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

    if (!this.editCat.nombre?.trim()) {
      this.showToast('El nombre de la categoría es obligatorio (*)');
      return;
    }
    if (!this.editCat.codigo_categoria?.trim()) {
      this.showToast('El código o sigla de la categoría es obligatorio (*)');
      return;
    }
    if (this.editCat.anio_nacimiento_min > this.editCat.anio_nacimiento_max) {
      this.showToast('El año mínimo no puede ser mayor al año máximo.');
      return;
    }
    if (this.editCat.cupo_maximo && this.editCat.cupo_maximo < 1) {
      this.showToast('El cupo máximo debe ser de al menos 1 deportista.');
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

  openDeleteModal(cat: any): void {
    this.categoryToDelete.set(cat);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.categoryToDelete.set(null);
  }

  confirmDeleteCategory(): void {
    const cat = this.categoryToDelete();
    if (!cat || !cat.id) return;

    this.api.deleteCategoria(cat.id).subscribe({
      next: () => {
        this.showToast(`Categoría "${cat.nombre}" desactivada exitosamente.`);
        this.closeDeleteModal();
        this.loadCategorias();
      },
      error: () => {
        this.showToast('Error al desactivar la categoría.');
      }
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
