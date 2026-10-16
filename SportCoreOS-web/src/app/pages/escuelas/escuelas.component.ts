import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, Club } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';

@Component({
  selector: 'app-escuelas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './escuelas.component.html',
  styleUrl: './escuelas.component.scss',
})
export class EscuelasComponent implements OnInit {
  api = inject(ApiService);
  catalogos = inject(CatalogosService);
  private router = inject(Router);

  // Estado de lista de escuelas
  clubs = signal<Club[]>([]);
  loading = signal<boolean>(false);
  searchQuery = signal<string>('');
  statusFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Catálogos
  readonly planesSuscripcion = this.catalogos.planesSuscripcion;
  readonly defaultLogoUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="gdef" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><polygon points="50,5 92,20 80,75 50,95 20,75 8,20" fill="url(%23gdef)" stroke="%2334d399" stroke-width="3"/><circle cx="50" cy="50" r="22" fill="%23ffffff"/><polygon points="50,38 59,45 56,56 44,56 41,45" fill="%23111827"/><circle cx="50" cy="50" r="21" fill="none" stroke="%23111827" stroke-width="2"/></svg>';

  // Filtros y KPIs reactivos
  readonly filteredClubs = computed<Club[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const filter = this.statusFilter();
    let list = this.clubs();

    if (filter === 'ACTIVE') {
      list = list.filter((c) => c.activo !== false);
    } else if (filter === 'INACTIVE') {
      list = list.filter((c) => c.activo === false);
    }

    if (!q) return list;

    return list.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.sigla.toLowerCase().includes(q) ||
        c.ciudad.toLowerCase().includes(q) ||
        (c.slug && c.slug.toLowerCase().includes(q))
    );
  });

  readonly totalCount = computed<number>(() => this.clubs().length);
  readonly activeCount = computed<number>(() => this.clubs().filter((c) => c.activo !== false).length);
  readonly inactiveCount = computed<number>(() => this.clubs().filter((c) => c.activo === false).length);

  // MODAL DE EDICIÓN
  showEditModal = signal<boolean>(false);
  savingClub = signal<boolean>(false);
  uploadingEditLogo = signal<boolean>(false);
  editLogoPreview = signal<string>('');
  editingClub = {
    id: '',
    nombre: '',
    sigla: '',
    ciudad: '',
    pais: 'Colombia',
    plan: 'PLAN_CLUB_ELITE_PRO',
    logoUrl: '',
    activo: true,
  };

  // MODAL DE CREACIÓN
  showCreateModal = signal<boolean>(false);
  creatingSchool = signal<boolean>(false);
  uploadingCreateLogo = signal<boolean>(false);
  createLogoPreview = signal<string>('');
  newSchoolData = {
    clubNombre: '',
    sigla: '',
    ciudad: 'Bogotá D.C.',
    pais: 'Colombia',
    plan: 'PLAN_CLUB_ELITE_PRO',
    logoUrl: '',
    adminNombre: '',
    adminApellido: '',
    adminEmail: '',
    adminPassword: '',
    adminTelefono: '',
  };

  // MODAL DE ELIMINACIÓN / DESACTIVACIÓN
  showDeleteModal = signal<boolean>(false);
  deletingClub = signal<boolean>(false);
  clubToDelete = signal<Club | null>(null);

  // Dropdown de ciudades para el formulario
  isCiudadDropdownOpen = signal<boolean>(false);
  ciudadSearchQuery = signal<string>('');
  readonly filteredCiudades = computed(() => {
    const q = this.ciudadSearchQuery().toLowerCase().trim();
    const list = this.catalogos.ciudadesSede();
    if (!q) return list.slice(0, 8);
    return list.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.linea && c.linea.toLowerCase().includes(q))
    );
  });

  // Notificaciones Toast
  toastMessage = signal<string>('');
  isToastError = signal<boolean>(false);

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs(): void {
    this.loading.set(true);
    this.api.getAllClubsAdmin(false).subscribe({
      next: (list) => {
        this.clubs.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.showToast('Error al consultar el catálogo de escuelas.', true);
      },
    });
  }

  // --- SELECCIÓN Y NAVEGACIÓN ---
  selectActiveClub(club: Club): void {
    this.api.selectClub(club.id);
    this.showToast(`Club activo cambiado a: '${club.nombre}'`);
  }

  irAModulos(club: Club): void {
    this.api.selectClub(club.id);
    this.router.navigate(['/configuracion/modulos']);
  }

  // --- MODAL DE EDICIÓN ---
  openEditModal(club: Club): void {
    this.editingClub = {
      id: club.id,
      nombre: club.nombre,
      sigla: club.sigla,
      ciudad: club.ciudad,
      pais: club.pais || 'Colombia',
      plan: club.plan || 'PLAN_CLUB_ELITE_PRO',
      logoUrl: club.logo || '',
      activo: club.activo !== false,
    };
    this.editLogoPreview.set(club.logo || '');
    this.uploadingEditLogo.set(false);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.uploadingEditLogo.set(false);
  }

  onEditLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadingEditLogo.set(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.uploadingEditLogo()) {
          this.editLogoPreview.set(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);

      const ident = this.editingClub.sigla || this.editingClub.nombre;
      this.api.uploadFile(file, 'clubes', 'CLUB', this.editingClub.id, 'ESCUDO', ident).subscribe({
        next: (res: any) => {
          this.uploadingEditLogo.set(false);
          const resolved = res.fullUrl || this.api.resolveFileUrl(res.url);
          if (resolved) {
            this.editingClub.logoUrl = resolved;
            this.editLogoPreview.set(resolved);
          }
          this.showToast('¡Escudo actualizado con éxito!');
        },
        error: () => {
          this.uploadingEditLogo.set(false);
          this.showToast('No se pudo subir la imagen al servidor, manteniendo previsualización.', true);
        },
      });
    }
  }

  submitEditClub(): void {
    if (!this.editingClub.nombre.trim() || !this.editingClub.sigla.trim()) {
      this.showToast('Nombre y sigla son campos obligatorios.', true);
      return;
    }

    this.savingClub.set(true);
    const payload = {
      nombre: this.editingClub.nombre.trim(),
      sigla: this.editingClub.sigla.toUpperCase().trim(),
      ciudad: this.editingClub.ciudad.trim(),
      pais: this.editingClub.pais.trim(),
      plan: this.editingClub.plan,
      logoUrl: this.editingClub.logoUrl || this.editLogoPreview() || this.defaultLogoUrl,
      activo: this.editingClub.activo,
    };

    this.api.updateClub(this.editingClub.id, payload).subscribe({
      next: () => {
        this.savingClub.set(false);
        this.closeEditModal();
        this.showToast('Escuela deportiva actualizada exitosamente.');
        this.loadClubs();
      },
      error: (err) => {
        this.savingClub.set(false);
        const msg = err.error?.message || 'Error al actualizar la escuela.';
        this.showToast(msg, true);
      },
    });
  }

  // --- MODAL DE ELIMINACIÓN / DESACTIVACIÓN ---
  openDeleteModal(club: Club): void {
    this.clubToDelete.set(club);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.clubToDelete.set(null);
  }

  confirmDeleteClub(): void {
    const club = this.clubToDelete();
    if (!club) return;

    this.deletingClub.set(true);
    this.api.deleteClub(club.id).subscribe({
      next: () => {
        this.deletingClub.set(false);
        this.closeDeleteModal();
        this.showToast(`La escuela '${club.nombre}' ha sido desactivada correctamente.`);
        this.loadClubs();
      },
      error: (err) => {
        this.deletingClub.set(false);
        const msg = err.error?.message || 'Error al desactivar la escuela.';
        this.showToast(msg, true);
      },
    });
  }

  reactivarClub(club: Club): void {
    this.api.updateClub(club.id, { activo: true }).subscribe({
      next: () => {
        this.showToast(`La escuela '${club.nombre}' ha sido reactivada.`);
        this.loadClubs();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al reactivar la escuela.';
        this.showToast(msg, true);
      },
    });
  }

  // --- MODAL DE CREACIÓN ---
  openCreateModal(): void {
    this.newSchoolData = {
      clubNombre: '',
      sigla: '',
      ciudad: 'Bogotá D.C.',
      pais: 'Colombia',
      plan: 'PLAN_CLUB_ELITE_PRO',
      logoUrl: '',
      adminNombre: '',
      adminApellido: '',
      adminEmail: '',
      adminPassword: '',
      adminTelefono: '',
    };
    this.createLogoPreview.set('');
    this.uploadingCreateLogo.set(false);
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onCreateLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.uploadingCreateLogo.set(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.uploadingCreateLogo()) {
          this.createLogoPreview.set(e.target?.result as string);
        }
      };
      reader.readAsDataURL(file);

      const ident = this.newSchoolData.sigla || this.newSchoolData.clubNombre;
      this.api.uploadFile(file, 'clubes', 'CLUB', undefined, 'ESCUDO', ident).subscribe({
        next: (res: any) => {
          this.uploadingCreateLogo.set(false);
          const resolved = res.fullUrl || this.api.resolveFileUrl(res.url);
          if (resolved) {
            this.newSchoolData.logoUrl = resolved;
            this.createLogoPreview.set(resolved);
          }
          this.showToast('¡Escudo cargado correctamente!');
        },
        error: () => {
          this.uploadingCreateLogo.set(false);
          this.showToast('Escudo vinculado temporalmente con previsualización.', true);
        },
      });
    }
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
      logoUrl: this.newSchoolData.logoUrl || this.createLogoPreview() || this.defaultLogoUrl,
    };

    this.api.createClubWithDirector(payload).subscribe({
      next: (res) => {
        this.creatingSchool.set(false);
        this.closeCreateModal();
        this.showToast(`¡Academia '${this.newSchoolData.clubNombre}' creada exitosamente!`);
        this.loadClubs();
        if (res.club?.id) {
          this.api.selectClub(res.club.id);
        }
      },
      error: (err) => {
        this.creatingSchool.set(false);
        const msg = err.error?.message || 'Error al crear la escuela deportiva.';
        this.showToast(msg, true);
      },
    });
  }

  resolveLogoDisplay(logo?: string): string {
    if (logo && logo.trim()) return this.api.resolveFileUrl(logo);
    return this.defaultLogoUrl;
  }

  formatPlan(plan?: string): string {
    return this.api.formatPlanNombre(plan || 'PLAN_CLUB_ELITE_PRO');
  }

  private showToast(msg: string, isError = false): void {
    this.toastMessage.set(msg);
    this.isToastError.set(isError);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
