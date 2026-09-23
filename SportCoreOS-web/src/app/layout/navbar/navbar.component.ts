import { Component, inject, signal, computed, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService, Club } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, LanguageSelectorComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  api = inject(ApiService);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  readonly showDropdown = signal<boolean>(false);
  readonly isOpenClubDropdown = signal<boolean>(false);
  readonly searchClubQuery = signal<string>('');
  readonly isRefreshing = signal<boolean>(false);

  readonly filteredClubs = computed<Club[]>(() => {
    const query = this.searchClubQuery().toLowerCase().trim();
    const list = this.api.availableClubs();
    if (!query) return list;
    return list.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.ciudad.toLowerCase().includes(query) ||
        c.sigla.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.api.loadClubs();
  }

  toggleClubDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isOpenClubDropdown.update((val) => !val);
    if (this.isOpenClubDropdown()) {
      this.showDropdown.set(false);
      this.searchClubQuery.set('');
    }
  }

  closeClubDropdown(): void {
    this.isOpenClubDropdown.set(false);
    this.searchClubQuery.set('');
  }

  selectClubFromDropdown(clubId: string): void {
    this.api.selectClub(clubId);
    this.closeClubDropdown();
  }

  onClubChange(clubIdOrEvent: string | Event): void {
    const clubId = typeof clubIdOrEvent === 'string' 
      ? clubIdOrEvent 
      : (clubIdOrEvent.target as HTMLSelectElement).value;
    this.api.selectClub(clubId);
  }

  refreshClubs(event: Event): void {
    event.stopPropagation();
    this.isRefreshing.set(true);
    this.api.loadClubs();
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  goToSchoolManagement(event: Event): void {
    event.stopPropagation();
    this.closeClubDropdown();
    this.closeDropdown();
    this.router.navigate(['/modulos-escuela']);
  }

  toggleUserDropdown(): void {
    this.showDropdown.update((val) => !val);
    if (this.showDropdown()) {
      this.isOpenClubDropdown.set(false);
    }
  }

  closeDropdown(): void {
    this.showDropdown.set(false);
  }

  onOpenProfile(): void {
    this.closeDropdown();
    this.profileService.openProfileModal();
  }

  onLogout(): void {
    this.closeDropdown();
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeClubDropdown();
      this.closeDropdown();
    }
  }
}

