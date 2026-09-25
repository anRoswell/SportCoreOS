import { Component, OnInit, inject, signal, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
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
  catalogos = inject(CatalogosService);
  private elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isCiudadDropdownOpen()) return;
    const target = event.target as HTMLElement;
    const isInside = this.elementRef.nativeElement.querySelector('.searchable-dropdown-wrap')?.contains(target);
    if (!isInside) {
      this.isCiudadDropdownOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isCiudadDropdownOpen()) {
      event.stopPropagation();
      this.isCiudadDropdownOpen.set(false);
    }
  }

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

  // Buscador y lista desplegable de Ciudad Sede
  ciudadSearchQuery = signal<string>('');
  isCiudadDropdownOpen = signal<boolean>(false);

  ciudadesFiltradas = computed(() => {
    const q = this.ciudadSearchQuery().toLowerCase().trim();
    const list = this.catalogos.ciudadesSede();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.linea && c.linea.toLowerCase().includes(q))
    );
  });

  // Escudo y Logo de la Escuela
  readonly defaultLogoUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="gdef" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><polygon points="50,5 92,20 80,75 50,95 20,75 8,20" fill="url(%23gdef)" stroke="%2334d399" stroke-width="3"/><circle cx="50" cy="50" r="22" fill="%23ffffff"/><polygon points="50,38 59,45 56,56 44,56 41,45" fill="%23111827"/><circle cx="50" cy="50" r="21" fill="none" stroke="%23111827" stroke-width="2"/></svg>';

  presetLogos = [
    {
      nombre: 'Leones Pro',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233b82f6"/><stop offset="100%" stop-color="%231d4ed8"/></linearGradient></defs><polygon points="50,5 92,20 80,75 50,95 20,75 8,20" fill="url(%23g3)" stroke="%2360a5fa" stroke-width="3"/><text x="50" y="60" font-size="34" text-anchor="middle" fill="%23ffffff">🦁</text></svg>',
    },
    {
      nombre: 'Águilas Doradas',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><polygon points="50,5 92,20 80,75 50,95 20,75 8,20" fill="url(%23g2)" stroke="%23fbbf24" stroke-width="3"/><text x="50" y="60" font-size="34" text-anchor="middle" fill="%23ffffff">🦅</text></svg>',
    },
    {
      nombre: 'Fútbol Élite',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><polygon points="50,5 92,20 80,75 50,95 20,75 8,20" fill="url(%23g1)" stroke="%2334d399" stroke-width="3"/><text x="50" y="60" font-size="34" text-anchor="middle" fill="%23ffffff">⚽</text></svg>',
    },
    {
      nombre: 'Rayo Veloz',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ef4444"/><stop offset="100%" stop-color="%23b91c1c"/></linearGradient></defs><polygon points="50,5 92,20 80,75 50,95 20,75 8,20" fill="url(%23g4)" stroke="%23f87171" stroke-width="3"/><text x="50" y="60" font-size="34" text-anchor="middle" fill="%23ffffff">⚡</text></svg>',
    },
    {
      nombre: 'Estrella Real',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%236d28d9"/></linearGradient></defs><polygon points="50,5 92,20 80,75 50,95 20,75 8,20" fill="url(%23g5)" stroke="%23a78bfa" stroke-width="3"/><text x="50" y="60" font-size="34" text-anchor="middle" fill="%23ffffff">⭐</text></svg>',
    },
  ];

  uploadingLogo = signal<boolean>(false);
  localLogoPreview = signal<string>('');

  newSchoolData = {
    clubNombre: '',
    sigla: '',
    ciudad: 'Bogotá D.C.',
    pais: 'Colombia',
    plan: 'Plan Club Élite Pro',
    logoUrl: '',
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

  toggleCiudadDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isCiudadDropdownOpen.update((v) => !v);
  }

  openCiudadDropdown(): void {
    this.isCiudadDropdownOpen.set(true);
  }

  closeCiudadDropdown(): void {
    this.isCiudadDropdownOpen.set(false);
  }

  seleccionarCiudad(ciudad: string): void {
    this.newSchoolData.ciudad = ciudad;
    this.ciudadSearchQuery.set('');
    this.isCiudadDropdownOpen.set(false);
  }

  onCiudadInput(value: string): void {
    this.newSchoolData.ciudad = value;
    this.ciudadSearchQuery.set(value);
    this.isCiudadDropdownOpen.set(true);
  }

  resolveSchoolLogoUrl(): string {
    if (this.localLogoPreview()) return this.localLogoPreview();
    if (this.newSchoolData.logoUrl && this.newSchoolData.logoUrl.trim()) return this.newSchoolData.logoUrl;
    return this.defaultLogoUrl;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadLogoFile(file);
    }
  }

  uploadLogoFile(file: File): void {
    this.uploadingLogo.set(true);
    const reader = new FileReader();
    reader.onload = (e) => this.localLogoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    const identEscuela = this.newSchoolData.sigla?.trim() || this.newSchoolData.clubNombre?.trim() || '';

    this.api.uploadFile(file, 'clubes', 'CLUB', undefined, 'ESCUDO', identEscuela || undefined).subscribe({
      next: (res: any) => {
        this.uploadingLogo.set(false);
        const url = res.url || res.fullUrl || res.fileUrl;
        if (url) {
          this.newSchoolData.logoUrl = url;
          this.localLogoPreview.set(res.fullUrl || url);
        }
        this.showToast('¡Escudo cargado correctamente!');
      },
      error: (err) => {
        this.uploadingLogo.set(false);
        console.warn('Servicio de almacenamiento no disponible, usando previsualización local:', err);
        if (this.localLogoPreview()) {
          this.newSchoolData.logoUrl = this.localLogoPreview();
        }
        this.showToast('Escudo vinculado con éxito.');
      },
    });
  }

  handleLogoDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadLogoFile(file);
    }
  }

  selectPresetLogo(url: string): void {
    this.newSchoolData.logoUrl = url;
    this.localLogoPreview.set(url);
  }

  removeLogo(): void {
    this.newSchoolData.logoUrl = '';
    this.localLogoPreview.set('');
  }

  openCreateSchoolModal(): void {
    this.newSchoolData = {
      clubNombre: '',
      sigla: '',
      ciudad: 'Bogotá D.C.',
      pais: 'Colombia',
      plan: 'Plan Club Élite Pro',
      logoUrl: '',
      adminNombre: '',
      adminApellido: '',
      adminEmail: '',
      adminPassword: '',
      adminTelefono: '',
    };
    this.ciudadSearchQuery.set('');
    this.localLogoPreview.set('');
    this.uploadingLogo.set(false);
    this.isCiudadDropdownOpen.set(false);
    this.showCreateSchoolModal.set(true);
  }

  closeCreateSchoolModal(): void {
    this.showCreateSchoolModal.set(false);
    this.isCiudadDropdownOpen.set(false);
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

    const payload = {
      ...this.newSchoolData,
      logoUrl: this.newSchoolData.logoUrl || this.localLogoPreview() || this.defaultLogoUrl,
    };

    this.api.createClubWithDirector(payload).subscribe({
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
