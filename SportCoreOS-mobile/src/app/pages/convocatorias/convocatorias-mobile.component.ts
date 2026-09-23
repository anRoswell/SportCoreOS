import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ConvocadoTecnico {
  id: string;
  nombres: string;
  apellidos: string;
  dorsal: number;
  posicion: string;
  foto?: string;
  rol: 'TITULAR' | 'SUPLENTE' | 'RESERVA';
  estadoAsistencia: 'CONFIRMADO' | 'PENDIENTE' | 'EXCUSADO';
}

@Component({
  selector: 'app-convocatorias-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './convocatorias-mobile.component.html',
  styleUrl: './convocatorias-mobile.component.scss'
})
export class ConvocatoriasMobileComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  auth = inject(AuthService);

  @ViewChild('posterCanvas') posterCanvas?: ElementRef<HTMLCanvasElement>;

  activeTab = signal<'TITULARES' | 'SUPLENTES' | 'CITACION'>('TITULARES');
  isRefreshing = signal<boolean>(false);
  showPosterModal = signal<boolean>(false);
  mostrarModalConvocar = signal<boolean>(false);
  mostrarDialogoContinuar = signal<boolean>(false);
  miEstado = signal<'CONFIRMADO' | 'EXCUSADO' | 'PENDIENTE'>('CONFIRMADO');

  nuevoConvocado = {
    jugadorId: 'j-9',
    rol: 'TITULAR'
  };

  titulares = signal<ConvocadoTecnico[]>([
    { id: 'c-1', nombres: 'Sebastián', apellidos: 'Muñoz', dorsal: 1, posicion: 'Arquero', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-2', nombres: 'Andrés', apellidos: 'Salazar', dorsal: 2, posicion: 'Lateral Derecho', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-3', nombres: 'Alejandro', apellidos: 'Ochoa', dorsal: 3, posicion: 'Defensa Central', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-4', nombres: 'Nicolás', apellidos: 'Zapata', dorsal: 4, posicion: 'Defensa Central', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-5', nombres: 'Samuel', apellidos: 'Vásquez', dorsal: 6, posicion: 'Lateral Izquierdo', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-6', nombres: 'Santiago', apellidos: 'Restrepo', dorsal: 8, posicion: 'Mediocentro Defensivo', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-7', nombres: 'Mateo', apellidos: 'Gómez', dorsal: 10, posicion: 'Volante Ofensivo', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-8', nombres: 'Daniel', apellidos: 'Henao', dorsal: 7, posicion: 'Extremo Derecho', rol: 'TITULAR', estadoAsistencia: 'PENDIENTE' },
    { id: 'c-9', nombres: 'Carlos', apellidos: 'Londoño', dorsal: 9, posicion: 'Delantero Centro', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-10', nombres: 'Camilo', apellidos: 'Ríos', dorsal: 11, posicion: 'Extremo Izquierdo', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-11', nombres: 'Esteban', apellidos: 'Pérez', dorsal: 5, posicion: 'Volante Mixto', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' }
  ]);

  suplentes = signal<ConvocadoTecnico[]>([
    { id: 'c-12', nombres: 'David', apellidos: 'Herrera', dorsal: 12, posicion: 'Portero Suplente', rol: 'SUPLENTE', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-13', nombres: 'Tomás', apellidos: 'Giraldo', dorsal: 14, posicion: 'Defensa Central', rol: 'SUPLENTE', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-14', nombres: 'Lucas', apellidos: 'Mendoza', dorsal: 15, posicion: 'Mediocentro', rol: 'SUPLENTE', estadoAsistencia: 'EXCUSADO' },
    { id: 'c-15', nombres: 'Felipe', apellidos: 'Berrío', dorsal: 16, posicion: 'Extremo', rol: 'SUPLENTE', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-16', nombres: 'Jerónimo', apellidos: 'Cano', dorsal: 17, posicion: 'Delantero', rol: 'SUPLENTE', estadoAsistencia: 'PENDIENTE' }
  ]);

  ngOnInit(): void {}

  recargarDatos(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
      this.alertService.success('Convocatorias y nóminas actualizadas desde la base de datos.');
    }, 600);
  }

  cambiarRol(jugador: ConvocadoTecnico, nuevoRol: 'TITULAR' | 'SUPLENTE'): void {
    if (nuevoRol === 'TITULAR') {
      this.suplentes.update(l => l.filter(j => j.id !== jugador.id));
      this.titulares.update(l => [...l, { ...jugador, rol: 'TITULAR' }]);
      this.alertService.success(`${jugador.nombres} ${jugador.apellidos} ascendido al 11 Titular.`);
    } else {
      this.titulares.update(l => l.filter(j => j.id !== jugador.id));
      this.suplentes.update(l => [...l, { ...jugador, rol: 'SUPLENTE' }]);
      this.alertService.info(`${jugador.nombres} ${jugador.apellidos} pasado al Banco de Suplentes.`);
    }
  }

  responderMiCitacion(estado: 'CONFIRMADO' | 'EXCUSADO'): void {
    this.miEstado.set(estado);
    if (estado === 'CONFIRMADO') {
      this.alertService.success('¡Asistencia confirmada con éxito al cuerpo técnico!');
    } else {
      this.alertService.warning('Has notificado tu no asistencia al partido.');
    }
  }

  abrirModalConvocar(): void {
    this.mostrarModalConvocar.set(true);
  }

  guardarNuevoConvocado(): void {
    const nuevo: ConvocadoTecnico = {
      id: 'c-' + Date.now(),
      nombres: this.nuevoConvocado.jugadorId === 'j-9' ? 'Juan David' : (this.nuevoConvocado.jugadorId === 'j-10' ? 'Andrés Felipe' : 'Felipe'),
      apellidos: this.nuevoConvocado.jugadorId === 'j-9' ? 'Castro' : (this.nuevoConvocado.jugadorId === 'j-10' ? 'Marín' : 'Quintero'),
      dorsal: this.nuevoConvocado.jugadorId === 'j-9' ? 11 : (this.nuevoConvocado.jugadorId === 'j-10' ? 14 : 12),
      posicion: this.nuevoConvocado.jugadorId === 'j-9' ? 'Extremo' : (this.nuevoConvocado.jugadorId === 'j-10' ? 'Lateral' : 'Portero'),
      rol: this.nuevoConvocado.rol as any,
      estadoAsistencia: 'CONFIRMADO'
    };

    if (nuevo.rol === 'TITULAR') {
      this.titulares.update(l => [...l, nuevo]);
    } else {
      this.suplentes.update(l => [...l, nuevo]);
    }

    this.mostrarModalConvocar.set(false);
    this.mostrarDialogoContinuar.set(true);
  }

  continuarAgregando(): void {
    this.mostrarDialogoContinuar.set(false);
    this.mostrarModalConvocar.set(true);
  }

  cerrarYActualizar(): void {
    this.mostrarDialogoContinuar.set(false);
    this.recargarDatos();
  }

  abrirModalPoster(): void {
    this.showPosterModal.set(true);
    setTimeout(() => {
      this.renderPosterOnCanvas();
    }, 120);
  }

  cerrarModalPoster(): void {
    this.showPosterModal.set(false);
  }

  renderPosterOnCanvas(): void {
    if (!this.posterCanvas) return;
    const canvas = this.posterCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1350;

    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CONVOCATORIA OFICIAL', W / 2, 120);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '32px Arial';
    ctx.fillText(this.auth.activeClub().nombre.toUpperCase(), W / 2, 170);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('VS ATLÉTICO NACIONAL', W / 2, 260);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('11 TITULARES:', 120, 360);

    let y = 430;
    const lista = this.titulares();
    for (let i = 0; i < Math.min(lista.length, 11); i++) {
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 30px Arial';
      ctx.fillText(`#${lista[i].dorsal}`, 140, y);

      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Arial';
      ctx.fillText(`${lista[i].nombres} ${lista[i].apellidos} (${lista[i].posicion})`, 220, y);
      y += 55;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(80, H - 160, W - 160, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sede Deportiva Los Arrayanes • Sábado 09:30 AM', W / 2, H - 100);
  }

  descargarAfiche(): void {
    if (!this.posterCanvas) return;
    const link = document.createElement('a');
    link.download = `Convocatoria_${Date.now()}.png`;
    link.href = this.posterCanvas.nativeElement.toDataURL('image/png');
    link.click();
    this.alertService.success('Afiche HD descargado con éxito.');
  }

  compartirWhatsApp(): void {
    const text = encodeURIComponent(`🏆 Convocatoria Oficial ${this.auth.activeClub().nombre} para el partido del Sábado. ¡Todos a apoyar al equipo!`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
}
