import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

export interface ParametroItem {
  id: string;
  club_id: string | null;
  modulo: string;
  clave: string;
  valor: string;
  tipo_valor: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  titulo: string;
  descripcion: string | null;
  estado: boolean;
  es_editable: boolean;
  updated_at?: string;
  // Local edit buffer
  editValor?: string;
  isModified?: boolean;
}

@Component({
  selector: 'app-parametros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parametros.component.html',
  styleUrl: './parametros.component.scss',
})
export class ParametrosComponent implements OnInit {
  api = inject(ApiService);

  parametrosList = signal<ParametroItem[]>([]);
  selectedModulo = signal<string>('TODOS');
  searchQuery = signal<string>('');
  saving = signal<boolean>(false);
  toastMessage = signal<string>('');
  isToastError = signal<boolean>(false);

  // Modales
  showCreateModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);
  selectedParam = signal<ParametroItem | null>(null);

  newParam = {
    modulo: 'GENERAL',
    clave: '',
    valor: '',
    tipoValor: 'STRING' as any,
    titulo: '',
    descripcion: '',
  };

  editDetailsForm = {
    titulo: '',
    valor: '',
    descripcion: '',
    estado: true,
  };

  modulos = computed(() => {
    const set = new Set<string>();
    this.parametrosList().forEach((p) => set.add(p.modulo));
    return Array.from(set);
  });

  filteredParametros = computed(() => {
    let list = this.parametrosList();
    if (this.selectedModulo() !== 'TODOS') {
      list = list.filter((p) => p.modulo === this.selectedModulo());
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.clave.toLowerCase().includes(q) ||
          p.titulo.toLowerCase().includes(q) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(q)),
      );
    }
    return list;
  });

  activeParamsCount = computed(() => this.parametrosList().filter((p) => p.estado).length);
  modulesCount = computed(() => this.modulos().length);
  modifiedCount = computed(() => this.parametrosList().filter((p) => p.isModified).length);

  ngOnInit(): void {
    this.loadParametros();
  }

  loadParametros(): void {
    this.api.getParametros().subscribe({
      next: (data) => {
        const list: ParametroItem[] = (data || []).map((p: any) => ({
          ...p,
          editValor: p.valor,
          isModified: false,
        }));
        this.parametrosList.set(list);
      },
      error: (err) => {
        console.error('Error cargando parámetros:', err);
        this.showToast('Error cargando parámetros del sistema.', true);
      },
    });
  }

  countByModulo(mod: string): number {
    return this.parametrosList().filter((p) => p.modulo === mod).length;
  }

  onValueChange(p: ParametroItem): void {
    p.isModified = p.editValor !== p.valor;
  }

  onBooleanChange(p: ParametroItem, event: any): void {
    p.editValor = event.target.checked ? 'true' : 'false';
    this.onValueChange(p);
    this.saveParametro(p);
  }

  saveParametro(p: ParametroItem): void {
    if (!p.editValor) {
      this.showToast('El valor no puede estar vacío.', true);
      return;
    }

    this.api
      .updateParametro(p.id, {
        valor: p.editValor,
        titulo: p.titulo,
        descripcion: p.descripcion,
        estado: p.estado,
      })
      .subscribe({
        next: (updated) => {
          p.valor = p.editValor!;
          p.isModified = false;
          this.showToast(`Parámetro '${p.clave}' guardado exitosamente.`);
        },
        error: (err) => {
          console.error(err);
          this.showToast(err.error?.message || 'Error al guardar el parámetro.', true);
        },
      });
  }

  openCreateModal(): void {
    this.newParam = {
      modulo: 'GENERAL',
      clave: '',
      valor: '',
      tipoValor: 'STRING',
      titulo: '',
      descripcion: '',
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitCreate(): void {
    if (!this.newParam.clave?.trim()) {
      this.showToast('La clave del parámetro es requerida (*)', true);
      return;
    }
    if (!this.newParam.titulo?.trim()) {
      this.showToast('El título del parámetro es requerido (*)', true);
      return;
    }
    if (this.newParam.valor === undefined || this.newParam.valor === null || this.newParam.valor === '') {
      this.showToast('El valor inicial del parámetro es requerido (*)', true);
      return;
    }
    if (this.newParam.tipoValor === 'NUMBER' && isNaN(Number(this.newParam.valor))) {
      this.showToast('El valor ingresado debe ser numérico.', true);
      return;
    }

    this.saving.set(true);
    this.api.createParametro(this.newParam).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeCreateModal();
        this.loadParametros();
        this.showToast(`Parámetro '${this.newParam.clave.toUpperCase()}' creado con éxito.`);
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast(err.error?.message || 'Error al crear el parámetro.', true);
      },
    });
  }

  openEditDetailsModal(p: ParametroItem): void {
    this.selectedParam.set(p);
    this.editDetailsForm = {
      titulo: p.titulo,
      valor: p.editValor || p.valor,
      descripcion: p.descripcion || '',
      estado: p.estado,
    };
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedParam.set(null);
  }

  submitEditDetails(): void {
    const p = this.selectedParam();
    if (!p) return;

    if (!this.editDetailsForm.titulo?.trim()) {
      this.showToast('El título no puede estar vacío (*)', true);
      return;
    }
    if (this.editDetailsForm.valor === undefined || this.editDetailsForm.valor === null || this.editDetailsForm.valor === '') {
      this.showToast('El valor no puede estar vacío (*)', true);
      return;
    }

    this.saving.set(true);
    this.api
      .updateParametro(p.id, this.editDetailsForm)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.closeEditModal();
          this.loadParametros();
          this.showToast(`Parámetro '${p.clave}' actualizado.`);
        },
        error: (err) => {
          this.saving.set(false);
          console.error(err);
          this.showToast(err.error?.message || 'Error al actualizar parámetro.', true);
        },
      });
  }

  confirmDelete(p: ParametroItem): void {
    this.selectedParam.set(p);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedParam.set(null);
  }

  executeDelete(): void {
    const p = this.selectedParam();
    if (!p) return;

    this.saving.set(true);
    this.api.deleteParametro(p.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDeleteModal();
        this.loadParametros();
        this.showToast(`Parámetro '${p.clave}' eliminado.`);
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast(err.error?.message || 'Error al eliminar parámetro.', true);
      },
    });
  }

  private showToast(msg: string, isError = false): void {
    this.toastMessage.set(msg);
    this.isToastError.set(isError);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
