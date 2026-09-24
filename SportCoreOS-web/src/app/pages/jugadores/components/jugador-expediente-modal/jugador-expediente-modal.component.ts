import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { JugadorExpediente360 } from '../../../../core/services/api.service';
import { 
  TabExpedienteJugador, 
  TipoDocumentoIdentidad, 
  ParentescoAcudiente, 
  RangoImcClasificacion, 
  RangoImcCssClass,
  RamaDeporte 
} from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-jugador-expediente-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './jugador-expediente-modal.component.html'
})
export class JugadorExpedienteModalComponent {
  @Input() visible = false;
  @Input() expediente: JugadorExpediente360 | null = null;
  @Input() parentescos: any[] = [];
  @Input() savingAcudiente = false;

  @Output() close = new EventEmitter<void>();
  @Output() openEdit = new EventEmitter<any>();
  @Output() openBiometria = new EventEmitter<any>();
  @Output() agregarAcudiente = new EventEmitter<any>();
  @Output() eliminarAcudiente = new EventEmitter<string>();

  readonly TabEnum = TabExpedienteJugador;
  activeExpTab = signal<TabExpedienteJugador>(TabExpedienteJugador.DEPORTIVO);
  showAddAcudienteForm = false;

  newAcudiente = {
    nombres: '',
    apellidos: '',
    tipoDocumento: TipoDocumentoIdentidad.CC,
    numeroDocumento: '',
    telefonoMovil: '',
    email: '',
    parentesco: ParentescoAcudiente.PADRE,
    esContactoPrincipal: false,
    autorizadoRecoger: true,
  };

  resolvePhotoUrl(fotoUrl?: string, genero?: string): string {
    if (fotoUrl && fotoUrl.trim()) return fotoUrl;
    return genero === RamaDeporte.FEMENINO
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
  }

  getEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const dob = new Date(fechaNacimiento);
    const diff = Date.now() - dob.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }

  getImcClass(imc: number | string | undefined): string {
    const val = Number(imc);
    if (!val || isNaN(val)) return '';
    if (val < 18.5) return RangoImcCssClass.IMC_BAJO;
    if (val <= 24.9) return RangoImcCssClass.IMC_NORMAL;
    if (val <= 29.9) return RangoImcCssClass.IMC_SOBREPESO;
    return RangoImcCssClass.IMC_OBESIDAD;
  }

  getImcLabel(imc: number | string | undefined): string {
    const val = Number(imc);
    if (!val || isNaN(val)) return '';
    if (val < 18.5) return RangoImcClasificacion.BAJO_PESO;
    if (val <= 24.9) return RangoImcClasificacion.PESO_NORMAL;
    if (val <= 29.9) return RangoImcClasificacion.SOBREPESO;
    return RangoImcClasificacion.OBESIDAD;
  }

  cleanPhone(phone?: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }

  toggleAddAcudienteForm(): void {
    this.showAddAcudienteForm = !this.showAddAcudienteForm;
  }

  submitAddAcudiente(): void {
    if (!this.newAcudiente.nombres || !this.newAcudiente.apellidos || !this.newAcudiente.telefonoMovil) return;
    this.agregarAcudiente.emit({
      ...this.newAcudiente,
      jugadorId: this.expediente?.jugador.id,
    });
    this.newAcudiente = {
      nombres: '',
      apellidos: '',
      tipoDocumento: TipoDocumentoIdentidad.CC,
      numeroDocumento: '',
      telefonoMovil: '',
      email: '',
      parentesco: ParentescoAcudiente.PADRE,
      esContactoPrincipal: false,
      autorizadoRecoger: true,
    };
    this.showAddAcudienteForm = false;
  }

  cerrar(): void {
    this.close.emit();
  }
}
