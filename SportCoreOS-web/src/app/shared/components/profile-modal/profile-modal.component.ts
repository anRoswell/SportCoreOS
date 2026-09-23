import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, UpdateProfileDto } from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-modal.component.html',
  styleUrl: './profile-modal.component.scss'
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
