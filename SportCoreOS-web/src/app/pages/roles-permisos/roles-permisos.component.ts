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
  showCreateUserModal = signal<boolean>(false);
  showEditUserModal = signal<boolean>(false);
  showDeleteUserModal = signal<boolean>(false);
  userToDelete = signal<UserRoleItem | null>(null);

  showNewPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  showEditPassword = signal<boolean>(false);
  showEditConfirmPassword = signal<boolean>(false);

  newUser = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    rol: 'ENTRENADOR_DT',
  };

  editUser = {
    id: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol: 'ENTRENADOR_DT',
    changePassword: false,
    password: '',
    confirmPassword: '',
  };


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

  checkPassword(pwd: string) {
    const val = pwd || '';
    const hasMinLength = val.length >= 8;
    const hasUpperCase = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val);

    let score = 0;
    if (hasMinLength) score++;
    if (hasUpperCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;

    let label = 'Muy Débil';
    let colorClass = 'strength-very-weak';
    let percent = 20;

    if (score === 2) {
      label = 'Regular';
      colorClass = 'strength-weak';
      percent = 50;
    } else if (score === 3) {
      label = 'Aceptable';
      colorClass = 'strength-medium';
      percent = 75;
    } else if (score === 4) {
      label = 'Segura / Fuerte';
      colorClass = 'strength-strong';
      percent = 100;
    } else if (score === 0) {
      label = 'Sin ingresar';
      percent = 0;
    }

    return {
      hasMinLength,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
      score,
      label,
      colorClass,
      percent,
      isValid: score === 4,
    };
  }

  isPasswordMatch(p1: string, p2: string): boolean {
    return !!p1 && !!p2 && p1 === p2;
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  toggleEditPassword(): void {
    this.showEditPassword.update((v) => !v);
  }

  toggleEditConfirmPassword(): void {
    this.showEditConfirmPassword.update((v) => !v);
  }

  formatPhone(val?: string): string {
    if (!val) return '';
    const trimmed = val.trim();
    if (!trimmed) return '';

    let digits = trimmed.replace(/\D/g, '');
    if (!digits) return '';

    // Si el usuario ingresó 57 al inicio y tiene más de 2 dígitos
    if (digits.startsWith('57') && digits.length > 2) {
      digits = digits.slice(2);
    }

    // Limitar a 10 dígitos (estándar nacional móvil)
    digits = digits.slice(0, 10);
    if (digits.length === 0) return '';

    if (digits.length <= 3) {
      return `+57 ${digits}`;
    }
    if (digits.length <= 6) {
      return `+57 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    return `+57 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  onPhoneInput(event: Event, target: 'new' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const digits = raw.replace(/\D/g, '');

    if (!digits || (digits === '57' && !raw.includes('57 '))) {
      if (target === 'new') this.newUser.telefono = '';
      else this.editUser.telefono = '';
      input.value = '';
      return;
    }

    const formatted = this.formatPhone(raw);
    if (target === 'new') {
      this.newUser.telefono = formatted;
    } else {
      this.editUser.telefono = formatted;
    }
    input.value = formatted;
  }

  openCreateUserModal(): void {
    this.newUser = {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
      telefono: '',
      rol: 'ENTRENADOR_DT',
    };
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
    this.showCreateUserModal.set(true);
  }

  closeCreateUserModal(): void {
    this.showCreateUserModal.set(false);
  }

  getRoleDesc(roleCode: string): string {
    const role = this.rolesCatalog().find((r) => r.code === roleCode);
    return role ? role.description : '';
  }

  submitCreateUser(): void {
    if (!this.newUser.nombre.trim() || !this.newUser.apellido.trim()) {
      this.showToast('Por favor ingrese nombres y apellidos del usuario.', true);
      return;
    }
    if (!this.newUser.email.trim() || !this.newUser.email.includes('@')) {
      this.showToast('Por favor ingrese un correo electrónico válido.', true);
      return;
    }

    const strength = this.checkPassword(this.newUser.password);
    if (!strength.isValid) {
      this.showToast('La contraseña debe cumplir con todos los requisitos de seguridad (mín. 8 caracteres, 1 mayúscula, 1 número y 1 símbolo).', true);
      return;
    }

    if (this.newUser.password !== this.newUser.confirmPassword) {
      this.showToast('Las contraseñas ingresadas no coinciden. Por favor verifíquelas.', true);
      return;
    }

    this.saving.set(true);
    const activeClub = this.api.activeClub();
    const payload = {
      nombre: this.newUser.nombre.trim(),
      apellido: this.newUser.apellido.trim(),
      email: this.newUser.email.trim().toLowerCase(),
      password: this.newUser.password,
      telefono: this.newUser.telefono.trim() || undefined,
      rol: this.newUser.rol,
      clubId: activeClub && activeClub.id ? activeClub.id : undefined,
    };

    this.api.registerUser(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeCreateUserModal();
        this.showToast(`Usuario '${payload.nombre} ${payload.apellido}' creado exitosamente con perfil ${payload.rol}.`);
        this.loadUsers();
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast(err.error?.message || 'Error al registrar el usuario.', true);
      },
    });
  }

  openEditUserModal(u: UserRoleItem): void {
    this.editUser = {
      id: u.id,
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      email: u.email || '',
      telefono: this.formatPhone(u.telefono || ''),
      rol: u.rol_club || 'ENTRENADOR_DT',
      changePassword: false,
      password: '',
      confirmPassword: '',
    };
    this.showEditPassword.set(false);
    this.showEditConfirmPassword.set(false);
    this.showEditUserModal.set(true);
  }

  closeEditUserModal(): void {
    this.showEditUserModal.set(false);
  }

  submitEditUser(): void {
    if (!this.editUser.nombre.trim() || !this.editUser.apellido.trim()) {
      this.showToast('Por favor ingrese nombres y apellidos.', true);
      return;
    }
    if (!this.editUser.email.trim() || !this.editUser.email.includes('@')) {
      this.showToast('Por favor ingrese un correo electrónico válido.', true);
      return;
    }

    if (this.editUser.changePassword) {
      const strength = this.checkPassword(this.editUser.password);
      if (!strength.isValid) {
        this.showToast('La nueva contraseña debe cumplir con todos los requisitos de seguridad.', true);
        return;
      }
      if (this.editUser.password !== this.editUser.confirmPassword) {
        this.showToast('Las contraseñas no coinciden.', true);
        return;
      }
    }

    this.saving.set(true);
    const payload: any = {
      nombre: this.editUser.nombre.trim(),
      apellido: this.editUser.apellido.trim(),
      email: this.editUser.email.trim().toLowerCase(),
      telefono: this.editUser.telefono.trim() || undefined,
      rol: this.editUser.rol,
    };

    if (this.editUser.changePassword && this.editUser.password.trim()) {
      payload.password = this.editUser.password;
    }

    this.api.updateUser(this.editUser.id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeEditUserModal();
        this.showToast(`Usuario '${payload.nombre} ${payload.apellido}' actualizado exitosamente.`);
        this.loadUsers();
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast(err.error?.message || 'Error al actualizar el usuario.', true);
      },
    });
  }

  confirmDeleteUser(u: UserRoleItem): void {
    this.userToDelete.set(u);
    this.showDeleteUserModal.set(true);
  }

  closeDeleteUserModal(): void {
    this.showDeleteUserModal.set(false);
    this.userToDelete.set(null);
  }

  executeDeleteUser(): void {
    const user = this.userToDelete();
    if (!user) return;

    this.saving.set(true);
    this.api.deleteUser(user.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDeleteUserModal();
        this.showToast(`Usuario '${user.nombre} ${user.apellido}' desvinculado del club exitosamente.`);
        this.loadUsers();
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast(err.error?.message || 'Error al desvincular al usuario.', true);
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

