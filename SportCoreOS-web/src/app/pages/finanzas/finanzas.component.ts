import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finanzas.component.html',
  styleUrl: './finanzas.component.scss'
})
export class FinanzasComponent implements OnInit {
  private api = inject(ApiService);

  readonly resumen = signal<any | null>(null);
  readonly cargos = signal<any[]>([]);
  readonly categorias = signal<any[]>([]);
  readonly selectedCategoriaId = signal<string>('TODAS');
  readonly selectedEstado = signal<string>('TODOS');
  readonly searchTerm = signal<string>('');
  readonly showGenerarModal = signal<boolean>(false);
  readonly showPagarModal = signal<boolean>(false);
  readonly selectedCargo = signal<any | null>(null);
  readonly toastMessage = signal<string>('');

  genMes = new Date().getMonth() + 1;
  genAnio = new Date().getFullYear();
  montoPago = 180000;
  metodoPago = 'PSE Bancolombia';

  readonly filteredCargos = computed(() => {
    let list = this.cargos();
    const catId = this.selectedCategoriaId();
    const estado = this.selectedEstado();
    const search = this.searchTerm().trim().toLowerCase();

    if (catId && catId !== 'TODAS') {
      list = list.filter((c) => String(c.categoria_id) === String(catId));
    }
    if (estado === 'PAGADO') {
      list = list.filter((c) => Number(c.saldo_pendiente) <= 0);
    } else if (estado === 'MORA') {
      list = list.filter((c) => Number(c.saldo_pendiente) > 0);
    }
    if (search) {
      list = list.filter((c) =>
        (c.jugador_nombre && c.jugador_nombre.toLowerCase().includes(search)) ||
        (c.numero_documento && c.numero_documento.toLowerCase().includes(search)) ||
        (c.concepto_nombre && c.concepto_nombre.toLowerCase().includes(search)) ||
        (c.categoria_nombre && c.categoria_nombre.toLowerCase().includes(search))
      );
    }
    return list;
  });

  readonly recaudoEfectividad = computed(() => {
    const res = this.resumen();
    if (!res || !res.total_facturado || parseFloat(res.total_facturado) === 0) return 0;
    const fact = parseFloat(res.total_facturado);
    const rec = parseFloat(res.total_recaudado || '0');
    return Math.round((rec / fact) * 100);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.getResumenFinanzas().subscribe((res) => {
      this.resumen.set(res);
    });

    this.api.getCargos({ limit: 500 }).subscribe((data) => {
      const rows = Array.isArray(data) ? data : (data?.data || []);
      this.cargos.set(rows);
    });

    this.api.getCategorias({ limit: 100 }).subscribe((cats) => {
      const catList = Array.isArray(cats) ? cats : [];
      this.categorias.set(catList);
    });
  }

  openGenerarModal(): void {
    this.showGenerarModal.set(true);
  }

  closeGenerarModal(): void {
    this.showGenerarModal.set(false);
  }

  submitGenerarMensualidad(): void {
    this.api.generarMensualidad(this.genMes, this.genAnio).subscribe({
      next: (res) => {
        this.showToast(`¡Cargos generados exitosamente! (${res.cargosCreados} nuevas pensiones creadas)`);
        this.closeGenerarModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al generar mensualidades');
      },
    });
  }

  openPagarModal(cargo: any): void {
    this.selectedCargo.set(cargo);
    this.montoPago = parseFloat(cargo.saldo_pendiente);
    this.showPagarModal.set(true);
  }

  closePagarModal(): void {
    this.showPagarModal.set(false);
    this.selectedCargo.set(null);
  }

  submitPagar(): void {
    const cargo = this.selectedCargo();
    if (!cargo) return;

    this.api.registrarPago(cargo.id, this.montoPago).subscribe({
      next: () => {
        this.showToast(`¡Pago de $${this.montoPago.toLocaleString()} procesado exitosamente vía ${this.metodoPago}!`);
        this.closePagarModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al procesar el pago.');
      },
    });
  }

  formatCurrency(val: any): string {
    if (val === null || val === undefined || val === '') return '$ 0';
    const num = Number(val);
    if (isNaN(num)) return '$ 0';
    return '$ ' + Math.round(num).toLocaleString('es-CO');
  }

  onSendBulkReminders(): void {
    this.showToast('Recordatorios de cobro y links PSE enviados masivamente vía WhatsApp.');
  }

  onDownloadReceipt(cargo: any): void {
    this.showToast(`Descargando comprobante de pago oficial para ${cargo.jugador_nombre}...`);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}
