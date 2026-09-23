import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

export interface RoleCatalogItem {
  code: string;
  label: string;
  description: string;
}

export interface PermissionMatrixRow {
  modulo: string;
  accion: string;
  descripcion: string;
  roles: Record<string, { permitido: boolean; nivelAcceso: string }>;
}

export interface UserRoleItem {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  avatar_url?: string;
  telefono?: string;
  rol_club: string;
  miembro_desde?: string;
}

@Component({
  selector: 'app-roles-permisos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles-permisos.component.html',
  styleUrl: './roles-permisos.component.scss',
})
export class RolesPermisosComponent implements OnInit {
  api = inject(ApiService);

  activeTab = signal<'matriz' | 'usuarios' | 'catalogo'>('matriz');
  rolesCatalog = signal<RoleCatalogItem[]>([]);
  selectedRole = signal<string>('DIRECTOR_DEPORTIVO');
  selectedModulo = signal<string>('TODOS');
  searchQuery = signal<string>('');
  matrixRows = signal<PermissionMatrixRow[]>([]);
  usersList = signal<UserRoleItem[]>([]);
  saving = signal<boolean>(false);
  toastMessage = signal<string>('');
  isToastError = signal<boolean>(false);
  showResetModal = signal<boolean>(false);

  modulos = computed(() => {
    const set = new Set<string>();
    this.matrixRows().forEach((r) => set.add(r.modulo));
    return Array.from(set);
  });

  filteredMatrix = computed(() => {
    let list = this.matrixRows();
    if (this.selectedModulo() !== 'TODOS') {
      list = list.filter((r) => r.modulo === this.selectedModulo());
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (r) =>
          r.modulo.toLowerCase().includes(q) ||
          r.accion.toLowerCase().includes(q) ||
          r.descripcion.toLowerCase().includes(q),
      );
    }
    return list;
  });

  selectedRoleLabel = computed(() => {
    const r = this.rolesCatalog().find((x) => x.code === this.selectedRole());
    return r ? r.label : this.selectedRole();
  });

  currentRolePermittedCount = computed(() => {
    const r = this.selectedRole();
    return this.matrixRows().filter((row) => row.roles[r]?.permitido).length;
  });

  modulosCount = computed(() => this.modulos().length);

  usersCountWithSelectedRole = computed(() => {
    const r = this.selectedRole();
    return this.usersList().filter((u) => u.rol_club === r).length;
  });

  ngOnInit(): void {
    this.loadCatalog();
    this.loadMatrix();
    this.loadUsers();
  }

  loadCatalog(): void {
    this.api.getRolesCatalog().subscribe({
      next: (roles) => {
        const rows = Array.isArray(roles) ? roles : ((roles as any)?.data || []);
        this.rolesCatalog.set(rows);
      },
      error: (err) => console.error(err),
    });
  }

  loadMatrix(): void {
    this.api.getPermissionsMatrix().subscribe({
      next: (res) => {
        const data = res?.data || res;
        this.matrixRows.set(data?.matrix || (Array.isArray(data) ? data : []));
      },
      error: (err) => {
        console.error('Error cargando matriz de permisos:', err);
        this.showToast('Error cargando permisos.', true);
      },
    });
  }

  loadUsers(): void {
    this.api.getUsersWithRoles().subscribe({
      next: (users) => {
        const rows = Array.isArray(users) ? users : ((users as any)?.data || []);
        this.usersList.set(rows);
      },
      error: (err) => console.error(err),
    });
  }

  onRoleSelect(roleCode: string): void {
    this.selectedRole.set(roleCode);
  }

  selectRoleFromCatalog(roleCode: string): void {
    this.selectedRole.set(roleCode);
    this.activeTab.set('matriz');
  }

  countByModulo(mod: string): number {
    return this.matrixRows().filter((r) => r.modulo === mod).length;
  }

  getRolePerm(row: PermissionMatrixRow): { permitido: boolean; nivelAcceso: string } {
    const r = this.selectedRole();
    if (!row.roles[r]) {
      row.roles[r] = { permitido: false, nivelAcceso: 'NONE' };
    }
    return row.roles[r];
  }

  togglePermission(row: PermissionMatrixRow): void {
    const perm = this.getRolePerm(row);
    perm.permitido = !perm.permitido;
    if (perm.permitido && perm.nivelAcceso === 'NONE') {
      perm.nivelAcceso = 'ALL';
    } else if (!perm.permitido) {
      perm.nivelAcceso = 'NONE';
    }
  }

  toggleAllForCurrentRole(permitido: boolean): void {
    const r = this.selectedRole();
    this.matrixRows().forEach((row) => {
      if (!row.roles[r]) {
        row.roles[r] = { permitido, nivelAcceso: permitido ? 'ALL' : 'NONE' };
      } else {
        row.roles[r].permitido = permitido;
        row.roles[r].nivelAcceso = permitido ? 'ALL' : 'NONE';
      }
    });
    this.showToast(
      permitido
        ? `Todas las acciones han sido habilitadas para ${this.selectedRoleLabel()}.`
        : `Todas las acciones han sido revocadas.`,
    );
  }

  saveCurrentRoleMatrix(): void {
    const r = this.selectedRole();
    this.saving.set(true);

    const permisos = this.matrixRows().map((row) => ({
      modulo: row.modulo,
      accion: row.accion,
      permitido: row.roles[r]?.permitido ?? false,
      nivelAcceso: row.roles[r]?.nivelAcceso ?? 'NONE',
    }));

    this.api.updateRolePermissions(r, permisos).subscribe({
      next: () => {
        this.saving.set(false);
        this.showToast(`Permisos del rol '${this.selectedRoleLabel()}' guardados exitosamente.`);
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast(err.error?.message || 'Error al guardar permisos del rol.', true);
      },
    });
  }

  confirmResetRole(): void {
    this.showResetModal.set(true);
  }

  closeResetModal(): void {
    this.showResetModal.set(false);
  }

  executeResetRole(): void {
    const r = this.selectedRole();
    this.saving.set(true);

    this.api.resetRolePermissions(r).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeResetModal();
        this.loadMatrix();
        this.showToast(`Permisos de '${this.selectedRoleLabel()}' restablecidos a los valores predeterminados.`);
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast('Error al restablecer permisos.', true);
      },
    });
  }

  onUserRoleChange(u: UserRoleItem): void {
    this.saveUserRole(u);
  }

  saveUserRole(u: UserRoleItem): void {
    this.api.assignUserRole(u.id, u.rol_club).subscribe({
      next: () => {
        this.showToast(`Rol de '${u.nombre} ${u.apellido}' actualizado a '${u.rol_club}'.`);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al actualizar rol del usuario.', true);
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
