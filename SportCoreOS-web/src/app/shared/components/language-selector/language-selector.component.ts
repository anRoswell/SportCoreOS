import { Component, inject, signal, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, LanguageCode } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lang-selector-container">
      <button 
        type="button" 
        class="lang-current-btn" 
        (click)="toggleDropdown()" 
        [title]="'Idioma actual: ' + i18n.currentLanguageDetails().label"
        aria-haspopup="true"
        [attr.aria-expanded]="isOpen()">
        <span class="lang-flag">{{ i18n.currentLanguageDetails().flag }}</span>
        <span class="lang-code">{{ i18n.currentLang().toUpperCase() }}</span>
        <i class="fa-solid fa-chevron-down lang-chevron" [class.rotated]="isOpen()"></i>
      </button>

      @if (isOpen()) {
        <div class="lang-dropdown-card">
          <div class="dropdown-header">
            <span class="dropdown-title"><i class="fa-solid fa-globe"></i> Idioma / Language</span>
          </div>

          <div class="dropdown-options">
            @for (lang of i18n.availableLanguages(); track lang.code) {
              <button 
                type="button"
                class="lang-option-btn" 
                [class.active]="i18n.currentLang() === lang.code"
                (click)="selectLanguage(lang.code)">
                <span class="opt-flag">{{ lang.flag }}</span>
                <div class="opt-info">
                  <strong class="opt-label">{{ lang.label }}</strong>
                  <small class="opt-sub">{{ lang.region }}</small>
                </div>
                @if (i18n.currentLang() === lang.code) {
                  <i class="fa-solid fa-check check-icon"></i>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .lang-selector-container {
      position: relative;
      display: inline-block;
    }

    .lang-current-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.45rem 0.75rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary);
        background: var(--bg-card);
      }

      .lang-flag {
        font-size: 1.1rem;
        line-height: 1;
      }

      .lang-code {
        font-size: 0.775rem;
        letter-spacing: 0.05em;
      }

      .lang-chevron {
        font-size: 0.65rem;
        color: var(--text-muted);
        transition: transform 0.2s ease;

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .lang-dropdown-card {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 230px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-dropdown);
      padding: 0.5rem;
      z-index: 1000;
      animation: dropdownFadeIn 0.15s ease-out;

      .dropdown-header {
        padding: 0.4rem 0.6rem 0.5rem;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 0.35rem;

        .dropdown-title {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
      }

      .dropdown-options {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .lang-option-btn {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        width: 100%;
        padding: 0.5rem 0.65rem;
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--radius-md);
        color: var(--text-main);
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          background: var(--bg-surface);
        }

        &.active {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.3);
          color: var(--color-primary);

          .opt-label {
            color: var(--color-primary);
          }
        }

        .opt-flag {
          font-size: 1.2rem;
        }

        .opt-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.1rem;

          .opt-label {
            font-size: 0.85rem;
            font-weight: 700;
          }

          .opt-sub {
            font-size: 0.7rem;
            color: var(--text-muted);
          }
        }

        .check-icon {
          color: var(--color-primary);
          font-size: 0.8rem;
        }
      }
    }

    @keyframes dropdownFadeIn {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
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
