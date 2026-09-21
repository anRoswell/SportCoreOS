import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService, UserProfile } from './auth.service';
import { NotificationService } from './notification.service';

export interface UpdateProfileDto {
  nombres: string;
  apellidos: string;
  telefono?: string;
  avatar?: string;
  passwordActual?: string;
  passwordNuevo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  readonly isProfileModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);

  // Perfil actual reactivo
  readonly userProfile = computed(() => this.authService.currentUser());

  // Verificadores de permisos y capacidades por Rol
  readonly isSuperAdmin = computed(() => this.userProfile()?.rol === 'SUPER_ADMIN');
  readonly isDirector = computed(() => this.userProfile()?.rol === 'DIRECTOR_DEPORTIVO' || this.isSuperAdmin());
  readonly isEntrenador = computed(() => this.userProfile()?.rol === 'ENTRENADOR_DT' || this.isDirector());
  readonly isFinanzas = computed(() => this.userProfile()?.rol === 'ADMIN_FINANCIERO' || this.isDirector());
  readonly isPadre = computed(() => this.userProfile()?.rol === 'PADRE_ACUDIENTE');

  openProfileModal(): void {
    this.isProfileModalOpen.set(true);
  }

  closeProfileModal(): void {
    this.isProfileModalOpen.set(false);
  }

  hasRole(allowedRoles: string[]): boolean {
    const current = this.userProfile();
    if (!current) return false;
    // Super Admin tiene acceso total sin restricciones
    if (current.rol === 'SUPER_ADMIN') return true;
    return allowedRoles.includes(current.rol);
  }

  updateProfile(dto: UpdateProfileDto): Promise<boolean> {
    this.isSaving.set(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        const current = this.authService.currentUser();
        if (current) {
          const updated: UserProfile = {
            ...current,
            nombres: dto.nombres,
            apellidos: dto.apellidos,
            telefono: dto.telefono,
            avatar: dto.avatar || current.avatar,
          };

          this.authService.currentUser.set(updated);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('futcore_user', JSON.stringify(updated));
          }

          this.notificationService.success('Tu perfil deportivo ha sido actualizado exitosamente.', 'Perfil Guardado');
          this.closeProfileModal();
          this.isSaving.set(false);
          resolve(true);
        } else {
          this.isSaving.set(false);
          resolve(false);
        }
      }, 500);
    });
  }
}
