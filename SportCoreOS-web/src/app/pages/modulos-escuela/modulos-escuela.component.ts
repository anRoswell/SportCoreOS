import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

export interface TenantModuleItem {
  code: string;
  name: string;
  description: string;
  category: string;
  order: number;
  icon: string;
  enabled: boolean;
  isIndefinite: boolean;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  updatedAt: string | null;
}

@Component({
  selector: 'app-modulos-escuela',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  templateUrl: './modulos-escuela.component.html',
  styleUrl: './modulos-escuela.component.scss',
})
export class ModulosEscuelaComponent implements OnInit {
  api = inject(ApiService);

  modulesList = signal<TenantModuleItem[]>([]);
  clubInfo = signal<any>(null);
  selectedCategory = signal<string>('TODOS');
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  selectedModule = signal<TenantModuleItem | null>(null);
  saving = signal<boolean>(false);
  toastMessage = signal<string>('');
  isToastError = signal<boolean>(false);

  // Modal para que el Super Administrador cree nuevas escuelas
  showCreateSchoolModal = signal<boolean>(false);
  creatingSchool = signal<boolean>(false);

  newSchoolData = {
    clubNombre: '',
    sigla: '',
    ciudad: 'Bogotá D.C.',
    pais: 'Colombia',
    plan: 'Plan Club Élite Pro',
    adminNombre: '',
    adminApellido: '',
    adminEmail: '',
    adminPassword: '',
    adminTelefono: '',
  };

  editForm = {
    habilitado: true,
    esIndefinido: true,
    fechaInicio: '',
    fechaFin: '',
  };

  categories = computed(() => {
    const set = new Set<string>();
    this.modulesList().forEach((m) => set.add(m.category));
    return Array.from(set);
  });

  filteredModules = computed(() => {
    let list = this.modulesList();
    if (this.selectedCategory() !== 'TODOS') {
      list = list.filter((m) => m.category === this.selectedCategory());
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q),
      );
    }
    return list;
  });

  activeModulesCount = computed(() => this.modulesList().filter((m) => m.enabled).length);
  inactiveModulesCount = computed(() => this.modulesList().filter((m) => !m.enabled).length);
  activePercentage = computed(() => {
    const total = this.modulesList().length;
    if (total === 0) return 100;
    return Math.round((this.activeModulesCount() / total) * 100);
  });

  ngOnInit(): void {
    this.api.loadClubs();
    this.loadModules();
  }

  onClubSwitch(clubId: string): void {
    this.api.selectClub(clubId);
    this.loadModules();
  }

  loadModules(): void {
    const clubId = this.api.activeClub().id;
    this.api.getClubModules(clubId).subscribe({
      next: (res) => {
        const data = res.data || res;
        this.clubInfo.set(data.club);
        this.modulesList.set(data.modules || []);
      },
      error: (err) => {
        console.error('Error cargando módulos de escuela:', err);
        this.showToast('Error cargando módulos de la escuela.', true);
      },
    });
  }

  countByCategory(cat: string): number {
    return this.modulesList().filter((m) => m.category === cat).length;
  }

  toggleModule(mod: TenantModuleItem): void {
    const nextState = !mod.enabled;
    mod.enabled = nextState;
    mod.isActive = nextState;

    const clubId = this.api.activeClub().id;
    this.api
      .updateClubModule(clubId, mod.code, {
        habilitado: nextState,
        esIndefinido: mod.isIndefinite,
        fechaInicio: mod.startDate,
        fechaFin: mod.endDate,
      })
      .subscribe({
        next: () => {
          this.showToast(`Módulo '${mod.name}' ${nextState ? 'activado' : 'desactivado'} con éxito.`);
        },
        error: (err) => {
          console.error(err);
          mod.enabled = !nextState; // revert
          this.showToast(`Error al actualizar estado del módulo.`, true);
        },
      });
  }

  enableAllModules(enabled: boolean): void {
    const updated = this.modulesList().map((m) => ({
      ...m,
      enabled,
      isActive: enabled,
    }));
    this.modulesList.set(updated);

    const clubId = this.api.activeClub().id;
    const codes = enabled ? updated.map((m) => m.code) : [];
    this.api.bulkUpdateClubModules(clubId, codes).subscribe({
      next: () => {
        this.showToast(
          enabled
            ? 'Todos los módulos han sido habilitados para la escuela.'
            : 'Todos los módulos han sido deshabilitados.',
        );
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al actualizar módulos en bloque.', true);
      },
    });
  }

  saveBulkState(): void {
    const clubId = this.api.activeClub().id;
    const activeCodes = this.modulesList()
      .filter((m) => m.enabled)
      .map((m) => m.code);

    this.api.bulkUpdateClubModules(clubId, activeCodes).subscribe({
      next: () => {
        this.showToast('Configuración de módulos de la escuela guardada con éxito.');
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error guardando configuración.', true);
      },
    });
  }

  openEditModal(mod: TenantModuleItem): void {
    this.selectedModule.set(mod);
    this.editForm = {
      habilitado: mod.enabled,
      esIndefinido: mod.isIndefinite,
      fechaInicio: mod.startDate ? mod.startDate.slice(0, 10) : '',
      fechaFin: mod.endDate ? mod.endDate.slice(0, 10) : '',
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedModule.set(null);
  }

  saveModuleConfig(): void {
    const mod = this.selectedModule();
    if (!mod) return;

    if (!this.editForm.esIndefinido && this.editForm.fechaInicio && this.editForm.fechaFin && this.editForm.fechaInicio > this.editForm.fechaFin) {
      this.showToast('La fecha de vencimiento no puede ser anterior a la fecha de inicio.', true);
      return;
    }

    this.saving.set(true);
    const clubId = this.api.activeClub().id;

    this.api
      .updateClubModule(clubId, mod.code, {
        habilitado: this.editForm.habilitado,
        esIndefinido: this.editForm.esIndefinido,
        fechaInicio: this.editForm.esIndefinido ? null : this.editForm.fechaInicio || null,
        fechaFin: this.editForm.esIndefinido ? null : this.editForm.fechaFin || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadModules();
          this.showToast(`Licencia de '${mod.name}' actualizada exitosamente.`);
        },
        error: (err) => {
          this.saving.set(false);
          console.error(err);
          this.showToast(err.error?.message || 'Error al guardar vigencia de la licencia.', true);
        },
      });
  }

  openCreateSchoolModal(): void {
    this.newSchoolData = {
      clubNombre: '',
      sigla: '',
      ciudad: 'Bogotá D.C.',
      pais: 'Colombia',
      plan: 'Plan Club Élite Pro',
      adminNombre: '',
      adminApellido: '',
      adminEmail: '',
      adminPassword: '',
      adminTelefono: '',
    };
    this.showCreateSchoolModal.set(true);
  }

  closeCreateSchoolModal(): void {
    this.showCreateSchoolModal.set(false);
  }

  submitCreateSchool(): void {
    if (
      !this.newSchoolData.clubNombre ||
      !this.newSchoolData.sigla ||
      !this.newSchoolData.ciudad ||
      !this.newSchoolData.adminNombre ||
      !this.newSchoolData.adminApellido ||
      !this.newSchoolData.adminEmail ||
      !this.newSchoolData.adminPassword
    ) {
      this.showToast('Por favor completa todos los campos requeridos (*).', true);
      return;
    }

    if (this.newSchoolData.adminPassword.length < 6) {
      this.showToast('La contraseña debe tener mínimo 6 caracteres.', true);
      return;
    }

    this.creatingSchool.set(true);

    this.api.createClubWithDirector(this.newSchoolData).subscribe({
      next: (res) => {
        this.creatingSchool.set(false);
        this.closeCreateSchoolModal();
        this.showToast(`¡Academia '${this.newSchoolData.clubNombre}' creada exitosamente por el Super Administrador!`);
        
        // Recargar escuelas y seleccionar la nueva
        if (res.club?.id) {
          this.api.selectClub(res.club.id);
          setTimeout(() => {
            this.loadModules();
          }, 300);
        } else {
          this.api.loadClubs();
          this.loadModules();
        }
      },
      error: (err) => {
        this.creatingSchool.set(false);
        const errorMsg = err.error?.message || 'Error al crear la escuela deportiva.';
        this.showToast(errorMsg, true);
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
