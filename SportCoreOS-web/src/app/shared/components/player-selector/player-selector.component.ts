import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
  forwardRef,
  inject,
  signal,
  computed,
  model,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

export interface JugadorSelectorItem {
  id: string;
  nombres: string;
  apellidos: string;
  tipo_documento?: string;
  numero_documento?: string;
  genero?: string;
  posicion_principal?: string;
  posicion_secundaria?: string;
  numero_dorsal?: number | string;
  foto_url?: string;
  categoria_id?: string;
  categoria_nombre?: string;
  color_distintivo?: string;
  estado_matricula?: string;
  talla_cm?: number | string;
  peso_kg?: number | string;
  imc?: number | string;
}

@Component({
  selector: 'app-player-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlayerSelectorComponent),
      multi: true,
    },
  ],
  templateUrl: './player-selector.component.html',
  styleUrl: './player-selector.component.scss',
})
export class PlayerSelectorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private api = inject(ApiService);
  private hostEl = inject(ElementRef);

  // Model & Inputs
  selectedId = model<string>('');
  label = input<string>('');
  placeholder = input<string>('Buscar deportista por nombre, identificación o género...');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  players = input<any[] | null>(null);
  categoriaId = input<string>('TODAS');

  // Output
  playerSelected = output<JugadorSelectorItem>();

  // ControlValueAccessor Callbacks
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Internal Signals
  readonly isOpen = signal<boolean>(false);
  readonly hasInteracted = signal<boolean>(false);
  readonly internalPlayers = signal<JugadorSelectorItem[]>([]);
  readonly categoriesList = signal<any[]>([]);
  readonly loadingPlayers = signal<boolean>(false);

  // Search & Filters
  readonly searchQuery = signal<string>('');
  readonly selectedGender = signal<string>('TODOS');
  readonly selectedCatId = signal<string>('TODAS');
  readonly selectedPos = signal<string>('TODAS');

  readonly defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120';

  // ControlValueAccessor Implementation
  writeValue(value: string | null): void {
    this.selectedId.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Input disabled is managed reactively
  }

  // Effective players pool
  readonly allPlayers = computed(() => {
    const propList = this.players();
    if (propList && Array.isArray(propList) && propList.length > 0) {
      return propList;
    }
    return this.internalPlayers();
  });

  // Selected Player Object
  readonly selectedPlayerObj = computed<JugadorSelectorItem | null>(() => {
    const targetId = this.selectedId();
    if (!targetId) return null;
    return this.allPlayers().find((j) => j.id === targetId) || null;
  });

  // Filtered Players computed
  readonly filteredPlayers = computed(() => {
    const list = this.allPlayers();
    if (!list || !Array.isArray(list)) return [];

    const query = this.searchQuery().trim().toLowerCase();
    const gender = this.selectedGender();
    const catId = this.selectedCatId();
    const pos = this.selectedPos();

    return list.filter((j) => {
      // 1. Filtro de Género
      if (gender !== 'TODOS' && j.genero !== gender) {
        return false;
      }

      // 2. Filtro de Categoría
      if (catId !== 'TODAS' && j.categoria_id !== catId) {
        return false;
      }

      // 3. Filtro de Posición
      if (pos !== 'TODAS') {
        const p1 = (j.posicion_principal || '').toLowerCase();
        const p2 = (j.posicion_secundaria || '').toLowerCase();
        const targetPos = pos.toLowerCase();
        if (!p1.includes(targetPos) && !p2.includes(targetPos)) {
          return false;
        }
      }

      // 4. Búsqueda por Nombre, Apellidos, Número de Identificación, Dorsal
      if (query) {
        const nombres = (j.nombres || '').toLowerCase();
        const apellidos = (j.apellidos || '').toLowerCase();
        const fullName = `${nombres} ${apellidos}`.toLowerCase();
        const reverseName = `${apellidos} ${nombres}`.toLowerCase();
        const docNum = (j.numero_documento || '').toLowerCase();
        const docType = (j.tipo_documento || '').toLowerCase();
        const dorsal = String(j.numero_dorsal || '');
        const catName = (j.categoria_nombre || '').toLowerCase();

        const match =
          nombres.includes(query) ||
          apellidos.includes(query) ||
          fullName.includes(query) ||
          reverseName.includes(query) ||
          docNum.includes(query) ||
          `${docType} ${docNum}`.includes(query) ||
          dorsal === query ||
          `#${dorsal}` === query ||
          catName.includes(query);

        if (!match) return false;
      }

      return true;
    });
  });

  readonly hasActiveSearchOrFilters = computed(() => {
    return (
      this.searchQuery().trim() !== '' ||
      this.selectedGender() !== 'TODOS' ||
      this.selectedCatId() !== 'TODAS' ||
      this.selectedPos() !== 'TODAS'
    );
  });

  ngOnInit(): void {
    if (this.categoriaId() && this.categoriaId() !== 'TODAS') {
      this.selectedCatId.set(this.categoriaId()!);
    }
    this.loadCategories();
    if (!this.players() || (Array.isArray(this.players()) && this.players()!.length === 0)) {
      this.loadInternalPlayers();
    }
  }

  ngOnDestroy(): void {}

  loadCategories(): void {
    this.api.getCategorias().subscribe((cats) => {
      const rows = Array.isArray(cats) ? cats : ((cats as any)?.data || []);
      this.categoriesList.set(rows);
    });
  }

  loadInternalPlayers(): void {
    this.loadingPlayers.set(true);
    this.api.getJugadores({ limit: 100 }).subscribe({
      next: (res) => {
        const rows = Array.isArray(res) ? res : ((res as any)?.data || []);
        this.internalPlayers.set(rows);
        this.loadingPlayers.set(false);
      },
      error: () => {
        this.loadingPlayers.set(false);
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.hostEl.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDropdown();
  }

  toggleDropdown(): void {
    if (this.disabled()) return;
    this.hasInteracted.set(true);
    this.isOpen.update((v) => !v);
  }

  openDropdown(): void {
    if (this.disabled()) return;
    this.hasInteracted.set(true);
    this.isOpen.set(true);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  onSelectPlayer(player: JugadorSelectorItem): void {
    this.selectedId.set(player.id);
    this.onChange(player.id);
    this.onTouched();
    this.playerSelected.emit(player);
    this.closeDropdown();
  }

  clearSelection(): void {
    this.selectedId.set('');
    this.onChange('');
    this.onTouched();
  }

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  clearSearchQuery(): void {
    this.searchQuery.set('');
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedGender.set('TODOS');
    this.selectedCatId.set('TODAS');
    this.selectedPos.set('TODAS');
  }

  resolvePhoto(url?: string): string {
    if (!url || !url.trim()) return this.defaultAvatar;
    return this.api.resolveFileUrl(url);
  }
}
