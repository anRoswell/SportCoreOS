import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

interface ReciboMensualidad {
  id: string;
  mes: string;
  ano: number;
  concepto: string;
  valor: number;
  fechaVencimiento: string;
  estado: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
  referenciaPago?: string;
  fechaPago?: string;
}

@Component({
  selector: 'app-pagos-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ScrollingModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagos-mobile.component.html',
  styleUrl: './pagos-mobile.component.scss'
})
export class PagosMobileComponent implements OnInit {
  auth = inject(AuthService);
  alert = inject(AlertService);

  isRefreshing = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasReachedEnd = signal<boolean>(false);
  filter = signal<'TODOS' | 'PENDIENTES' | 'HISTORIAL'>('TODOS');

  modalPagoActivo = signal<boolean>(false);
  reciboSeleccionado = signal<ReciboMensualidad | null>(null);
  metodoSeleccionado = signal<'PSE' | 'CARD' | 'NEQUI'>('PSE');
  procesandoPago = signal<boolean>(false);

  private allRecibos: ReciboMensualidad[] = [];
  displayedRecibos = signal<ReciboMensualidad[]>([]);
  totalPendiente = signal<number>(220000);
  private pageSize = 6;
  private currentOffset = 0;

  ngOnInit(): void {
    this.generarCatalogoRecibos();
    this.cargarMas();
  }

  trackById(index: number, item: ReciboMensualidad): string {
    return item.id;
  }

  private generarCatalogoRecibos(): void {
    const meses = ['Septiembre', 'Agosto', 'Julio', 'Junio', 'Mayo', 'Abril', 'Marzo', 'Febrero', 'Enero'];
    const conceptos = ['Pensión Deportiva Mensual', 'Cuota de Arbitraje Oficial', 'Kit Indumentaria Alterna', 'Seguro Médico Póliza Deportiva'];
    
    this.allRecibos = [
      {
        id: 'rec-1',
        mes: 'Septiembre',
        ano: 2026,
        concepto: 'Pensión Deportiva Mensual',
        valor: 180000,
        fechaVencimiento: '30/09/2026',
        estado: 'PENDIENTE'
      },
      {
        id: 'rec-2',
        mes: 'Septiembre',
        ano: 2026,
        concepto: 'Cuota de Arbitraje Oficial',
        valor: 40000,
        fechaVencimiento: '25/09/2026',
        estado: 'PENDIENTE'
      }
    ];

    // Histórico de 36 mensualidades y conceptos
    for (let y = 2026; y >= 2024; y--) {
      meses.forEach((m, idx) => {
        if (y === 2026 && (m === 'Septiembre')) return; // Ya agregados arriba
        this.allRecibos.push({
          id: `rec-${y}-${idx}`,
          mes: m,
          ano: y,
          concepto: conceptos[idx % conceptos.length],
          valor: 180000,
          fechaVencimiento: `05/${idx + 1}/${y}`,
          estado: 'PAGADO',
          referenciaPago: `WMP-PSE-${y}${idx}-8923`,
          fechaPago: `03/${idx + 1}/${y}`
        });
      });
    }
  }

  cargarMas(): void {
    if (this.isLoadingMore() || this.hasReachedEnd()) return;

    this.isLoadingMore.set(true);
    setTimeout(() => {
      let filtered = this.allRecibos;
      if (this.filter() === 'PENDIENTES') {
        filtered = this.allRecibos.filter(r => r.estado !== 'PAGADO');
      } else if (this.filter() === 'HISTORIAL') {
        filtered = this.allRecibos.filter(r => r.estado === 'PAGADO');
      }

      const nextBatch = filtered.slice(this.currentOffset, this.currentOffset + this.pageSize);
      if (nextBatch.length > 0) {
        this.displayedRecibos.update(curr => [...curr, ...nextBatch]);
        this.currentOffset += this.pageSize;
      }
      if (this.currentOffset >= filtered.length) {
        this.hasReachedEnd.set(true);
      }
      this.isLoadingMore.set(false);
    }, 300);
  }

  onScrollChange(index: number): void {
    const total = this.displayedRecibos().length;
    if (index >= total - 2 && !this.isLoadingMore() && !this.hasReachedEnd()) {
      this.cargarMas();
    }
  }

  setFilter(filtro: 'TODOS' | 'PENDIENTES' | 'HISTORIAL'): void {
    this.filter.set(filtro);
    this.currentOffset = 0;
    this.displayedRecibos.set([]);
    this.hasReachedEnd.set(false);
    this.cargarMas();
  }

  recargarPagos(): void {
    this.isRefreshing.set(true);
    this.currentOffset = 0;
    this.displayedRecibos.set([]);
    this.hasReachedEnd.set(false);
    setTimeout(() => {
      this.cargarMas();
      this.isRefreshing.set(false);
    }, 450);
  }

  iniciarPago(recibo: ReciboMensualidad): void {
    this.reciboSeleccionado.set(recibo);
    this.modalPagoActivo.set(true);
  }

  cerrarModalPago(): void {
    this.modalPagoActivo.set(false);
    this.reciboSeleccionado.set(null);
  }

  procesarTransaccion(): void {
    const r = this.reciboSeleccionado();
    if (!r) return;

    this.procesandoPago.set(true);
    setTimeout(() => {
      this.procesandoPago.set(false);
      this.modalPagoActivo.set(false);
      
      // Actualizar estado a pagado
      this.allRecibos = this.allRecibos.map(item => item.id === r.id ? {
        ...item,
        estado: 'PAGADO',
        referenciaPago: `WMP-PSE-2026-ONLINE-${Math.floor(Math.random() * 9000 + 1000)}`,
        fechaPago: 'Hoy'
      } : item);

      this.totalPendiente.update(val => Math.max(0, val - r.valor));
      this.setFilter(this.filter());
      this.alert.success('¡Transacción aprobada! Recibo emitido correctamente.');
    }, 1200);
  }

  descargarComprobante(r: ReciboMensualidad): void {
    this.alert.info(`Descargando comprobante fiscal PDF para ${r.concepto} (${r.mes} ${r.ano})...`);
  }
}
