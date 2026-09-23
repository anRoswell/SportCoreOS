import { Component, inject, signal, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, LanguageCode } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss'
})
export class LanguageSelectorComponent {
  readonly i18n = inject(I18nService);
  private elementRef = inject(ElementRef);

  readonly isOpen = signal<boolean>(false);

  toggleDropdown(): void {
    this.isOpen.update((v) => !v);
  }

  selectLanguage(code: LanguageCode): void {
    this.i18n.setLanguage(code);
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
