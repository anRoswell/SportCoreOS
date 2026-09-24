import { Component, Input, Output, EventEmitter, inject, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { ServicioEspecializado } from '../../servicios.component';
import { TipoPlanServicio, MetodoPago } from '../../../../core/enums/domain.enums';
import { DigitalPassTicketComponent } from '../../../../shared/components/digital-pass-ticket/digital-pass-ticket.component';

@Component({
  selector: 'app-inscribir-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DigitalPassTicketComponent],
  templateUrl: './inscribir-modal.component.html'
})
export class InscribirModalComponent implements OnChanges {
  private api = inject(ApiService);

  readonly TipoPlanServicio = TipoPlanServicio;
  readonly MetodoPago = MetodoPago;

  @Input() visible = false;
  @Input() servicio: ServicioEspecializado | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() inscripcionExitosa = new EventEmitter<void>();

  // State
  tipoPlan = signal<TipoPlanServicio>(TipoPlanServicio.PAQUETE_MENSUAL);
  nombreJugador = signal<string>('');
  nombreAcudiente = signal<string>('');
  telefonoAcudiente = signal<string>('');
  emailAcudiente = signal<string>('');
  aplicaDescuentoHermano = signal<boolean>(false);
  metodoPago = signal<MetodoPago>(MetodoPago.WOMPI_PSE);
  comprobanteUrl = signal<string>('');
  comprobanteNombreArchivo = signal<string>('');
  referenciaManual = signal<string>('');

  isSubmitting = signal<boolean>(false);
  ticketGenerated = signal<boolean>(false);
  ticketData = signal<any>(null);

  montoFinalCalculado = computed(() => {
    const s = this.servicio;
    if (!s) return 0;
    let base = this.tipoPlan() === TipoPlanServicio.PAQUETE_MENSUAL
      ? Number(s.precio_paquete_mensual)
      : Number(s.precio_sesion_individual);

    if (this.aplicaDescuentoHermano() && s.descuento_hermanos_pct) {
      base = base * (1 - (s.descuento_hermanos_pct / 100));
    }
    return Math.round(base);
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.resetForm();
    }
  }

  resetForm() {
    this.tipoPlan.set(TipoPlanServicio.PAQUETE_MENSUAL);
    this.nombreJugador.set('');
    this.nombreAcudiente.set('');
    this.telefonoAcudiente.set('');
    this.emailAcudiente.set('');
    this.aplicaDescuentoHermano.set(false);
    this.metodoPago.set(MetodoPago.WOMPI_PSE);
    this.comprobanteUrl.set('');
    this.comprobanteNombreArchivo.set('');
    this.referenciaManual.set('');
    this.ticketGenerated.set(false);
    this.ticketData.set(null);
  }

  setPlanPaqueteMensual() {
    this.tipoPlan.set(TipoPlanServicio.PAQUETE_MENSUAL);
  }

  setPlanSesionIndividual() {
    this.tipoPlan.set(TipoPlanServicio.SESION_INDIVIDUAL);
  }

  formatNumber(val: any): string {
    if (!val) return '0';
    return Number(val).toLocaleString('es-CO');
  }

  copiarTexto(texto: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(texto);
      alert('Copiado al portapapeles: ' + texto);
    }
  }

  triggerFileInput() {
    const input = document.getElementById('comprobanteFileInput') as HTMLInputElement;
    if (input) input.click();
  }

  onFileSelected(event: any) {
    const file = event.target?.files?.[0];
    if (file) {
      this.comprobanteNombreArchivo.set(file.name);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.comprobanteUrl.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  usarComprobanteDemo() {
    this.comprobanteUrl.set('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    this.comprobanteNombreArchivo.set('comprobante_nequi_transferencia.png');
    if (!this.referenciaManual()) {
      this.referenciaManual.set('NQ-' + Math.floor(100000 + Math.random() * 900000));
    }
  }

  quitarComprobante() {
    this.comprobanteUrl.set('');
    this.comprobanteNombreArchivo.set('');
  }

  submitInscripcion() {
    const s = this.servicio;
    if (!s) return;

    this.isSubmitting.set(true);

    const dto: any = {
      nombre_jugador: this.nombreJugador(),
      nombre_acudiente: this.nombreAcudiente(),
      telefono_acudiente: this.telefonoAcudiente(),
      email_acudiente: this.emailAcudiente(),
      tipo_plan: this.tipoPlan(),
      monto_pagado: this.montoFinalCalculado(),
      metodo_pago: this.metodoPago(),
    };

    if (this.comprobanteUrl()) {
      dto.comprobante_url = this.comprobanteUrl();
    }
    if (this.referenciaManual()) {
      dto.referencia_transaccion = this.referenciaManual();
    }

    this.api.inscribirServicio(s.id, dto).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.ticketGenerated.set(true);
        this.ticketData.set(res.inscripcion || res);
        this.inscripcionExitosa.emit();
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        alert(err?.error?.message || 'Ocurrió un error al procesar la inscripción');
      }
    });
  }

  shareWhatsApp() {
    const s = this.servicio;
    const t = this.ticketData();
    if (!s || !t) return;

    const text = encodeURIComponent(
      '⚽ *Pase Digital SportCoreOS*\n' +
      'Clínica: *' + s.titulo + '*\n' +
      'Atleta: ' + t.nombre_jugador + '\n' +
      'Cancha: ' + s.cancha_nombre + '\n' +
      'Horario: ' + s.dias_semana + ' (' + s.horario_rango + ')\n' +
      'Ticket Pass: ' + t.codigo_qr_ticket + '\n' +
      'Estado: ' + (t.estado_pago || 'APROBADO') + '\n' +
      'Ref: ' + t.referencia_transaccion
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  cerrar() {
    this.close.emit();
  }
}
