import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, UpdateProfileDto } from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (profileService.isProfileModalOpen()) {
      <div class="modal-overlay" (click)="profileService.closeProfileModal()">
        <div class="modal-dialog fut-card" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <i class="fa-regular fa-id-badge"></i>
              </div>
              <div class="modal-title-text">
                <h3>Mi Perfil Deportivo & Cuenta</h3>
                <p class="modal-subtitle">Gestiona tus credenciales, datos de contacto y avatar de acceso</p>
              </div>
            </div>
            <button class="modal-close-btn btn-close" (click)="profileService.closeProfileModal()" aria-label="Cerrar">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Body -->
          <form (ngSubmit)="onSave()" class="modal-form">
            <!-- User Info Card -->
            <div class="user-summary-box">
              <img [src]="formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'" alt="Avatar" class="avatar-preview" />
              <div class="summary-details">
                <span class="role-badge">{{ profileService.userProfile()?.rolLabel }}</span>
                <h4 class="name-heading">{{ profileService.userProfile()?.nombres }} {{ profileService.userProfile()?.apellidos }}</h4>
                <span class="email-sub"><i class="fa-regular fa-envelope"></i> {{ profileService.userProfile()?.email }}</span>
              </div>
            </div>

            <!-- Form Fields -->
            <div class="modal-section">
              <span class="modal-section-title"><i class="fa-solid fa-user-pen"></i> Datos Personales</span>
              <div class="form-row g2">
                <div class="input-group">
                  <label><i class="fa-solid fa-user"></i> Nombres <span class="required-star">*</span></label>
                  <input type="text" [(ngModel)]="formData.nombres" name="nombres" required class="sport-input" />
                </div>

                <div class="input-group">
                  <label><i class="fa-solid fa-user"></i> Apellidos <span class="required-star">*</span></label>
                  <input type="text" [(ngModel)]="formData.apellidos" name="apellidos" required class="sport-input" />
                </div>
              </div>

              <div class="form-row g2">
                <div class="input-group">
                  <label><i class="fa-brands fa-whatsapp"></i> Teléfono / WhatsApp</label>
                  <input type="tel" [(ngModel)]="formData.telefono" name="telefono" placeholder="+57 310 123 4567" class="sport-input" />
                </div>

                <div class="input-group">
                  <label><i class="fa-solid fa-image"></i> URL Avatar</label>
                  <input type="url" [(ngModel)]="formData.avatar" name="avatar" class="sport-input" />
                </div>
              </div>
            </div>

            <!-- Change Password Accordion -->
            <div class="modal-section">
              <span class="modal-section-title"><i class="fa-solid fa-lock"></i> Seguridad & Contraseña (Opcional)</span>
              <div class="password-box">
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-key"></i> Nueva Contraseña</label>
                    <input type="password" [(ngModel)]="formData.passwordNuevo" name="passwordNuevo" placeholder="••••••••••••" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-shield-halved"></i> Contraseña Actual</label>
                    <input type="password" [(ngModel)]="formData.passwordActual" name="passwordActual" placeholder="••••••••••••" class="sport-input" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="profileService.closeProfileModal()">
                <i class="fa-solid fa-xmark"></i> Cancelar
              </button>
              <button type="submit" class="btn-primary" [disabled]="profileService.isSaving()">
                @if (profileService.isSaving()) {
                  <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
                } @else {
                  <i class="fa-solid fa-check"></i> Guardar Cambios
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    /* Profile Modal (inherits from global _modals.scss) */
    .user-summary-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.15rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;

      .avatar-preview {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--color-primary);
        box-shadow: 0 0 10px var(--color-primary-glow);
      }

      .summary-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .role-badge {
          font-size: 0.68rem;
          font-weight: 800;
          background: rgba(16, 185, 129, 0.15);
          color: var(--color-primary);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          width: fit-content;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .name-heading {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-heading);
        }

        .email-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
      }
    }

    .password-box {
      background: var(--bg-surface);
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem;
    }
  `]
})
export class ProfileModalComponent {
  profileService = inject(ProfileService);

  formData: UpdateProfileDto = {
    nombres: '',
    apellidos: '',
    telefono: '+57 310 987 6543',
    avatar: '',
  };

  constructor() {
    effect(() => {
      const user = this.profileService.userProfile();
      if (user) {
        this.formData.nombres = user.nombres;
        this.formData.apellidos = user.apellidos;
        this.formData.telefono = user.telefono || '+57 310 987 6543';
        this.formData.avatar = user.avatar;
      }
    });
  }

  onSave(): void {
    this.profileService.updateProfile(this.formData);
  }
}
