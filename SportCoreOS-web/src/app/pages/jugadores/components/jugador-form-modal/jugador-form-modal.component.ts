import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlatpickrDirective } from '../../../../shared/directives/flatpickr.directive';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-jugador-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  templateUrl: './jugador-form-modal.component.html'
})
export class JugadorFormModalComponent {
  private api = inject(ApiService);

  @Input() visible = false;
  @Input() mode: 'CREATE' | 'EDIT' = 'CREATE';
  @Input() categorias: any[] = [];
  @Input() tiposDocumento: any[] = [];
  @Input() epsList: any[] = [];
  @Input() piernasHabiles: any[] = [];
  @Input() parentescos: any[] = [];
  @Input() initialData: any = null;

  @Output() close = new EventEmitter<void>();
  @Output() playerSaved = new EventEmitter<void>();

  createStep = signal<number>(1);
  uploadingPhoto = signal<boolean>(false);
  savingPlayer = false;
  localPhotoPreview = signal<string | null>(null);

  formData: any = {
    categoriaId: '',
    nombres: '',
    apellidos: '',
    tipoDocumento: 'TI',
    numeroDocumento: '',
    fechaNacimiento: '2011-05-15',
    genero: 'MASCULINO',
    posicionPrincipal: 'Delantero Centro',
    posicionSecundaria: '',
    piernaHabil: 'DIESTRO',
    numeroDorsal: 9,
    eps: 'SURA EPS',
    estadoMatricula: 'ACTIVO',
    porcentajeBeca: 0,
    acudienteNombres: '',
    acudienteApellidos: '',
    acudienteTelefono: '',
    acudienteEmail: '',
    acudienteParentesco: 'PADRE',
    acudienteTipoDoc: 'CC',
    acudienteNumeroDoc: '',
    fotoUrl: '',
  };

  ngOnChanges(): void {
    if (this.visible) {
      this.createStep.set(1);
      this.localPhotoPreview.set(null);
      if (this.mode === 'EDIT' && this.initialData) {
        this.formData = {
          categoriaId: this.initialData.categoria_id || this.initialData.categoriaId || '',
          nombres: this.initialData.nombres || '',
          apellidos: this.initialData.apellidos || '',
          tipoDocumento: this.initialData.tipo_documento || this.initialData.tipoDocumento || 'TI',
          numeroDocumento: this.initialData.numero_documento || this.initialData.numeroDocumento || '',
          fechaNacimiento: this.initialData.fecha_nacimiento ? this.initialData.fecha_nacimiento.split('T')[0] : '2011-05-15',
          genero: this.initialData.genero || 'MASCULINO',
          posicionPrincipal: this.initialData.posicion_principal || this.initialData.posicionPrincipal || 'Delantero Centro',
          posicionSecundaria: this.initialData.posicion_secundaria || this.initialData.posicionSecundaria || '',
          piernaHabil: this.initialData.pierna_habil || this.initialData.piernaHabil || 'DIESTRO',
          numeroDorsal: this.initialData.numero_dorsal !== undefined ? this.initialData.numero_dorsal : 10,
          eps: this.initialData.eps || 'SURA EPS',
          estadoMatricula: this.initialData.estado_matricula || this.initialData.estadoMatricula || 'ACTIVO',
          porcentajeBeca: this.initialData.porcentaje_beca !== undefined ? this.initialData.porcentaje_beca : 0,
          fotoUrl: this.initialData.foto_url || this.initialData.fotoUrl || '',
        };
      } else if (this.mode === 'CREATE') {
        this.formData = {
          categoriaId: this.categorias.length > 0 ? this.categorias[0].id : '',
          nombres: '',
          apellidos: '',
          tipoDocumento: 'TI',
          numeroDocumento: '',
          fechaNacimiento: '2011-05-15',
          genero: 'MASCULINO',
          posicionPrincipal: 'Delantero Centro',
          posicionSecundaria: '',
          piernaHabil: 'DIESTRO',
          numeroDorsal: 9,
          eps: 'SURA EPS',
          estadoMatricula: 'ACTIVO',
          porcentajeBeca: 0,
          acudienteNombres: '',
          acudienteApellidos: '',
          acudienteTelefono: '',
          acudienteEmail: '',
          acudienteParentesco: 'PADRE',
          acudienteTipoDoc: 'CC',
          acudienteNumeroDoc: '',
          fotoUrl: '',
        };
      }
    }
  }

  setCreateStep(step: number) {
    this.createStep.set(step);
  }

  nextCreateStep() {
    this.createStep.update(s => Math.min(s + 1, 3));
  }

  prevCreateStep() {
    this.createStep.update(s => Math.max(s - 1, 1));
  }

  isStep1Valid(): boolean {
    return !!(this.formData.nombres?.trim() && this.formData.apellidos?.trim() && this.formData.numeroDocumento?.trim() && this.formData.fechaNacimiento);
  }

  isStep2Valid(): boolean {
    return !!(this.formData.categoriaId && this.formData.posicionPrincipal);
  }

  resolvePhotoUrl(fotoUrl?: string, genero?: string): string {
    const preview = this.localPhotoPreview();
    if (preview) return preview;
    if (fotoUrl && fotoUrl.trim()) return fotoUrl;
    return genero === 'FEMENINO'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
  }

  getEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const dob = new Date(fechaNacimiento);
    const diff = Date.now() - dob.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }

  getSelectedCategoryNameForId(id: string): string {
    const found = this.categorias.find(c => c.id === id);
    return found ? found.nombre : 'Categoría General';
  }

  onPhotoSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) this.uploadPhotoFile(file);
  }

  handlePhotoBoxDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.uploadPhotoFile(file);
    }
  }

  handlePhotoBoxPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            this.uploadPhotoFile(file);
            break;
          }
        }
      }
    }
  }

  uploadPhotoFile(file: File) {
    this.uploadingPhoto.set(true);
    const reader = new FileReader();
    reader.onload = (e) => this.localPhotoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    const docIdentidad = this.formData.numeroDocumento?.trim() || '';

    this.api
      .uploadFile(
        file,
        'jugadores',
        'JUGADOR',
        this.formData.id || undefined,
        'FOTO_PERFIL',
        docIdentidad || undefined,
      )
      .subscribe({
        next: (res: any) => {
          this.uploadingPhoto.set(false);
          this.formData.fotoUrl = res.url || res.fullUrl || res.fotoUrl;
          this.localPhotoPreview.set(null);
        },
        error: () => {
          this.uploadingPhoto.set(false);
        },
      });
  }

  removePhoto() {
    this.formData.fotoUrl = '';
    this.localPhotoPreview.set(null);
  }

  submitForm() {
    this.savingPlayer = true;
    if (this.mode === 'CREATE') {
      this.api.createJugador(this.formData).subscribe({
        next: () => {
          this.savingPlayer = false;
          this.playerSaved.emit();
          this.close.emit();
        },
        error: (err: any) => {
          this.savingPlayer = false;
          alert(err?.error?.message || 'Error al inscribir jugador');
        }
      });
    } else {
      const id = this.initialData.id;
      this.api.updateJugador(id, this.formData).subscribe({
        next: () => {
          this.savingPlayer = false;
          this.playerSaved.emit();
          this.close.emit();
        },
        error: (err: any) => {
          this.savingPlayer = false;
          alert(err?.error?.message || 'Error al actualizar jugador');
        }
      });
    }
  }

  cerrar() {
    this.close.emit();
  }
}
