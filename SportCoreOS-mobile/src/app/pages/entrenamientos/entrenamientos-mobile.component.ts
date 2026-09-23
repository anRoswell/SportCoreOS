import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

export interface JugadorAsistencia {
  id: string;
  nombres: string;
  apellidos: string;
  dorsal: number;
  posicion: string;
  estado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA';
  calificacionRendimiento?: 'DESTACADO' | 'CUMPLIO' | 'BAJA_INTENSIDAD';
  observacion?: string;
  avatar?: string;
}

export interface CategoriaDeportivaItem {
  id: string;
  nombre: string;
  codigo_categoria: string;
  color_distintivo?: string;
  total_jugadores?: number;
  cancha?: string;
  enfoque?: string;
  plantel?: JugadorAsistencia[];
}

@Component({
  selector: 'app-entrenamientos-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './entrenamientos-mobile.component.html',
  styleUrl: './entrenamientos-mobile.component.scss'
})
export class EntrenamientosMobileComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  auth = inject(AuthService);

  isRefreshing = signal<boolean>(false);
  mostrarDialogoGuardado = signal<boolean>(false);
  mostrarModalConfirmacionDT = signal<boolean>(false);
  asistenciaConfirmadaPorDT = signal<boolean>(false);
  horaConfirmacionDT = signal<string>('16:45 PM');
  filtroEstado = signal<'TODOS' | 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'>('TODOS');

  // ESTRATEGIA 3: MODO DELEGADO (CAPITÁN DE CAMPO / ASISTENTE)
  modoDelegadoActivo = signal<boolean>(false);

  // ESTRATEGIA 2: DICTADO POR VOZ ASISTIDO POR IA (SPEECH-TO-TEXT)
  mostrarModalDictadoVoz = signal<boolean>(false);
  grabandoVoz = signal<boolean>(false);
  procesandoVoz = signal<boolean>(false);
  textoDictadoTranscrito = '';
  novedadesDetectadasVoz = signal<{ jugadorNombre: string; estado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'; rating?: string; obs?: string }[]>([]);

  // Estado del Código QR Dinámico de Cancha
  mostrarModalGeneradorQR = signal<boolean>(false);
  mostrarModalEscanerQR = signal<boolean>(false);
  qrTokenActual = signal<string>('SC-PITCH-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  qrTiempoRestante = signal<number>(45);
  escaneando = signal<boolean>(false);
  jugadorSeleccionadoScanId = '';
  private timerQRInterval: any = null;

  qrMatrixDots = computed(() => {
    const dots: { x: number; y: number }[] = [];
    const seed = this.qrTokenActual();
    for (let r = 2; r <= 17; r++) {
      for (let c = 2; c <= 17; c++) {
        // Excluir esquinas
        const inTopLeft = r <= 7 && c <= 7;
        const inTopRight = r <= 7 && c >= 12;
        const inBottomLeft = r >= 12 && c <= 7;
        const inCenter = r >= 8 && r <= 11 && c >= 8 && c <= 11;

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inCenter) {
          const charCode = seed.charCodeAt((r * c) % seed.length);
          if (charCode % 2 === 0 || (r + c) % 3 === 0) {
            dots.push({ x: c * 10, y: r * 10 });
          }
        }
      }
    }
    return dots;
  });

  // Categorías Asignadas y Selección
  categoriasAsignadas = signal<CategoriaDeportivaItem[]>([
    {
      id: '30000000-0000-0000-0000-000000000001',
      nombre: 'Sub-15 Élite A',
      codigo_categoria: 'SUB15-A',
      color_distintivo: '#10b981',
      total_jugadores: 11,
      cancha: 'Sede Norte #2',
      enfoque: 'Presión Alta & Definición',
      plantel: [
        { id: 'j-1', nombres: 'Santiago', apellidos: 'Restrepo', dorsal: 8, posicion: 'Mediocentro', estado: 'PRESENTE' },
        { id: 'j-2', nombres: 'Mateo', apellidos: 'Gómez', dorsal: 10, posicion: 'Enganche', estado: 'PRESENTE' },
        { id: 'j-3', nombres: 'Sebastián', apellidos: 'Muñoz', dorsal: 1, posicion: 'Portero', estado: 'PRESENTE' },
        { id: 'j-4', nombres: 'Nicolás', apellidos: 'Zapata', dorsal: 4, posicion: 'Defensa Central', estado: 'RETRASO', observacion: 'Tráfico vía Las Palmas' },
        { id: 'j-5', nombres: 'Carlos', apellidos: 'Londoño', dorsal: 9, posicion: 'Delantero', estado: 'EXCUSA', observacion: 'Fisioterapia rodilla izq.' },
        { id: 'j-6', nombres: 'Daniel', apellidos: 'Henao', dorsal: 7, posicion: 'Extremo Derecho', estado: 'PRESENTE' },
        { id: 'j-7', nombres: 'Samuel', apellidos: 'Vásquez', dorsal: 3, posicion: 'Lateral Izquierdo', estado: 'FALTA' },
        { id: 'j-8', nombres: 'Alejandro', apellidos: 'Ochoa', dorsal: 5, posicion: 'Defensa Central', estado: 'PRESENTE' },
        { id: 'j-9', nombres: 'Juan David', apellidos: 'Castro', dorsal: 11, posicion: 'Extremo Izquierdo', estado: 'PRESENTE' },
        { id: 'j-10', nombres: 'Andrés Felipe', apellidos: 'Marín', dorsal: 14, posicion: 'Lateral Derecho', estado: 'PRESENTE' },
        { id: 'j-11', nombres: 'David', apellidos: 'Herrera', dorsal: 12, posicion: 'Portero Suplente', estado: 'PRESENTE' }
      ]
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      nombre: 'Sub-17 Nacional Pro',
      codigo_categoria: 'SUB17-PRO',
      color_distintivo: '#3b82f6',
      total_jugadores: 9,
      cancha: 'Cancha Principal Sintética',
      enfoque: 'Fuerza, Salto & Transición Defensiva',
      plantel: [
        { id: 'u17-1', nombres: 'Esteban', apellidos: 'Pérez Salazar', dorsal: 4, posicion: 'Defensa Central', estado: 'PRESENTE' },
        { id: 'u17-2', nombres: 'Samuel', apellidos: 'Díaz Marín', dorsal: 10, posicion: 'Volante Ofensivo', estado: 'PRESENTE' },
        { id: 'u17-3', nombres: 'Jerónimo', apellidos: 'Cano', dorsal: 9, posicion: 'Delantero Centro', estado: 'PRESENTE' },
        { id: 'u17-4', nombres: 'Lucas', apellidos: 'Mendoza', dorsal: 8, posicion: 'Mediocentro', estado: 'RETRASO', observacion: 'Colegio salida tarde' },
        { id: 'u17-5', nombres: 'Felipe', apellidos: 'Berrío', dorsal: 11, posicion: 'Extremo Izquierdo', estado: 'PRESENTE' },
        { id: 'u17-6', nombres: 'Tomás', apellidos: 'Giraldo', dorsal: 2, posicion: 'Lateral Derecho', estado: 'PRESENTE' },
        { id: 'u17-7', nombres: 'David', apellidos: 'Gutiérrez', dorsal: 1, posicion: 'Arquero Titular', estado: 'PRESENTE' },
        { id: 'u17-8', nombres: 'Camilo', apellidos: 'Ríos', dorsal: 7, posicion: 'Extremo Derecho', estado: 'EXCUSA', observacion: 'Permiso académico' },
        { id: 'u17-9', nombres: 'Sebastián', apellidos: 'Álvarez', dorsal: 6, posicion: 'Volante de Marca', estado: 'PRESENTE' }
      ]
    }
  ]);

  categoriaSeleccionada = signal<CategoriaDeportivaItem | null>(null);

  // Estado para la observación modal
  jugadorEditandoObs = signal<JugadorAsistencia | null>(null);
  estadoTemporalObs = signal<'RETRASO' | 'EXCUSA'>('RETRASO');
  textoObsTemporal = '';

  jugadores = signal<JugadorAsistencia[]>([]);

  jugadoresFiltrados = computed(() => {
    const filtro = this.filtroEstado();
    const list = this.jugadores();
    if (filtro === 'TODOS') return list;
    return list.filter(j => j.estado === filtro);
  });

  porcentajeAsistencia = computed(() => {
    const list = this.jugadores();
    if (list.length === 0) return 0;
    const presentes = list.filter(j => j.estado === 'PRESENTE' || j.estado === 'RETRASO').length;
    return Math.round((presentes / list.length) * 100);
  });

  ngOnInit(): void {
    this.cargarCategoriasAsignadas();
  }

  cargarCategoriasAsignadas(): void {
    const defaultCat = this.categoriasAsignadas()[0];
    this.categoriaSeleccionada.set(defaultCat);
    this.jugadores.set(defaultCat.plantel || []);

    // Conectar a API para sincronizar categorías asignadas al usuario actual
    this.http.get<any>(`${environment.apiUrl}/categorias`).subscribe({
      next: (res) => {
        const rows = Array.isArray(res) ? res : (res?.data || []);
        if (rows && rows.length > 0) {
          const mapped: CategoriaDeportivaItem[] = rows.map((c: any, index: number) => ({
            id: c.id,
            nombre: c.nombre,
            codigo_categoria: c.codigo_categoria,
            color_distintivo: c.color_distintivo || '#10b981',
            total_jugadores: parseInt(c.total_jugadores || '0', 10),
            cancha: index % 2 === 0 ? 'Sede Norte #2' : 'Cancha Sintética #1',
            enfoque: index % 2 === 0 ? 'Fuerza & Presión Alta' : 'Táctica Fija & Transiciones',
            plantel: this.generarPlantelMock(c.id, c.nombre)
          }));
          this.categoriasAsignadas.set(mapped);
          this.seleccionarCategoria(mapped[0]);
        }
      },
      error: () => {
        // Fallback robusto usando los datos iniciales
      }
    });
  }

  seleccionarCategoria(cat: CategoriaDeportivaItem): void {
    this.categoriaSeleccionada.set(cat);
    this.jugadores.set(cat.plantel || []);
    this.filtroEstado.set('TODOS');
    this.alertService.info(`Categoría activa: ${cat.nombre}`);
  }

  generarPlantelMock(catId: string, catNombre: string): JugadorAsistencia[] {
    const existing = this.categoriasAsignadas().find(c => c.id === catId);
    if (existing && existing.plantel) return existing.plantel;

    return [
      { id: `${catId}-1`, nombres: 'Mateo', apellidos: 'Gómez Restrepo', dorsal: 10, posicion: 'Enganche', estado: 'PRESENTE' },
      { id: `${catId}-2`, nombres: 'Samuel', apellidos: 'Díaz Marín', dorsal: 7, posicion: 'Extremo', estado: 'PRESENTE' },
      { id: `${catId}-3`, nombres: 'Esteban', apellidos: 'Pérez Salazar', dorsal: 4, posicion: 'Defensa Central', estado: 'PRESENTE' },
      { id: `${catId}-4`, nombres: 'Sebastián', apellidos: 'Muñoz', dorsal: 1, posicion: 'Arquero', estado: 'RETRASO', observacion: 'Tráfico pesado' },
      { id: `${catId}-5`, nombres: 'Santiago', apellidos: 'Restrepo', dorsal: 8, posicion: 'Mediocentro', estado: 'PRESENTE' },
      { id: `${catId}-6`, nombres: 'Nicolás', apellidos: 'Zapata', dorsal: 3, posicion: 'Lateral Izquierdo', estado: 'EXCUSA', observacion: 'Cita médica' }
    ];
  }

  recargarAsistencia(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
      this.alertService.success(`Planilla de ${this.categoriaSeleccionada()?.nombre || 'Categoría'} sincronizada.`);
    }, 500);
  }

  setFiltro(estado: 'TODOS' | 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'): void {
    this.filtroEstado.set(estado);
  }

  contarPorEstado(estado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'): number {
    return this.jugadores().filter(j => j.estado === estado).length;
  }

  cambiarEstado(id: string, nuevoEstado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'): void {
    this.jugadores.update(list => list.map(j => {
      if (j.id === id) {
        return { 
          ...j, 
          estado: nuevoEstado,
          calificacionRendimiento: nuevoEstado === 'FALTA' || nuevoEstado === 'EXCUSA' ? undefined : j.calificacionRendimiento,
          observacion: (nuevoEstado === 'PRESENTE' || nuevoEstado === 'FALTA') ? undefined : j.observacion 
        };
      }
      return j;
    }));

    const jugador = this.jugadores().find(j => j.id === id);
    if (nuevoEstado === 'FALTA') {
      this.alertService.error(`${jugador?.nombres || 'Jugador'}: Inasistencia sin justificación (-30 XP de penalización).`);
    } else if (nuevoEstado === 'PRESENTE') {
      this.alertService.success(`${jugador?.nombres || 'Jugador'}: Marcado Presente (+50 XP).`);
    }
  }

  abrirDialogoObservacion(jugador: JugadorAsistencia, estado: 'RETRASO' | 'EXCUSA'): void {
    this.jugadorEditandoObs.set(jugador);
    this.estadoTemporalObs.set(estado);
    this.textoObsTemporal = jugador.observacion || '';
  }

  cerrarModalObs(): void {
    this.jugadorEditandoObs.set(null);
  }

  confirmarObservacion(): void {
    const jug = this.jugadorEditandoObs();
    if (!jug) return;
    const nuevoEstado = this.estadoTemporalObs();
    const observacion = this.textoObsTemporal.trim();

    this.jugadores.update(list => list.map(j => {
      if (j.id === jug.id) {
        return {
          ...j,
          estado: nuevoEstado,
          observacion: observacion.length > 0 ? observacion : undefined
        };
      }
      return j;
    }));

    this.cerrarModalObs();
    this.alertService.success(`Estado de ${jug.nombres} actualizado a ${nuevoEstado}.`);
  }

  marcarTodos(estado: 'PRESENTE'): void {
    this.jugadores.update(list => list.map(j => ({ ...j, estado, observacion: undefined })));
    this.alertService.success('Todos los jugadores marcados como PRESENTES (+50 XP).');
  }

  abrirModalConfirmacionDT(): void {
    this.mostrarModalConfirmacionDT.set(true);
  }

  ejecutarConfirmacionDT(): void {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.horaConfirmacionDT.set(formattedTime);
    this.asistenciaConfirmadaPorDT.set(true);
    this.mostrarModalConfirmacionDT.set(false);

    // Otorgar XP a los muchachos por asistencia y aplicar descuento por inasistencia injustificada
    const presentesCount = this.contarPorEstado('PRESENTE');
    const faltasCount = this.contarPorEstado('FALTA');
    
    let msg = `Planilla avalada por DT. ¡+50 XP asignados a ${presentesCount} jugadores!`;
    if (faltasCount > 0) {
      msg += ` (${faltasCount} jugadores con penalización de -30 XP por inasistencia)`;
    }
    this.alertService.success(msg);
  }

  // Métodos para el Código QR Dinámico
  abrirModalGeneradorQR(): void {
    this.mostrarModalGeneradorQR.set(true);
    this.iniciarTemporizadorQR();
  }

  regenerarTokenQR(): void {
    const randomCode = 'SC-PITCH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    this.qrTokenActual.set(randomCode);
    this.qrTiempoRestante.set(45);
    this.alertService.info('Nuevo Token QR generado para la cancha.');
  }

  private iniciarTemporizadorQR(): void {
    if (this.timerQRInterval) clearInterval(this.timerQRInterval);
    this.qrTiempoRestante.set(45);
    this.timerQRInterval = setInterval(() => {
      if (this.qrTiempoRestante() > 1) {
        this.qrTiempoRestante.update(t => t - 1);
      } else {
        this.regenerarTokenQR();
      }
    }, 1000);
  }

  abrirModalEscanerQR(): void {
    if (this.jugadores().length > 0 && !this.jugadorSeleccionadoScanId) {
      this.jugadorSeleccionadoScanId = this.jugadores()[0].id;
    }
    this.mostrarModalEscanerQR.set(true);
  }

  cerrarModalEscanerQR(): void {
    this.mostrarModalEscanerQR.set(false);
    this.escaneando.set(false);
  }

  procesarEscaneoQR(): void {
    if (this.escaneando()) return;
    this.escaneando.set(true);

    setTimeout(() => {
      const id = this.jugadorSeleccionadoScanId || (this.jugadores().length > 0 ? this.jugadores()[0].id : null);
      if (id) {
        this.cambiarEstado(id, 'PRESENTE');
        const jugador = this.jugadores().find(j => j.id === id);
        this.alertService.success(`¡Check-in exitoso vía QR para ${jugador?.nombres || 'Jugador'}! Marcado PRESENTE (+50 XP).`);
      }
      this.cerrarModalEscanerQR();
    }, 1200);
  }

  // --- ESTRATEGIA 1: CALIFICACIÓN RÁPIDA DE RENDIMIENTO/ACTITUD (1 TOQUE) ---
  calificarJugador(id: string, rating: 'DESTACADO' | 'CUMPLIO' | 'BAJA_INTENSIDAD'): void {
    this.jugadores.update(list => list.map(j => {
      if (j.id === id) {
        const nuevoRating = j.calificacionRendimiento === rating ? undefined : rating;
        return { ...j, calificacionRendimiento: nuevoRating };
      }
      return j;
    }));

    const jug = this.jugadores().find(j => j.id === id);
    const xpBonus = rating === 'DESTACADO' ? '+100 XP (Destacado)' : rating === 'CUMPLIO' ? '+50 XP (Cumplió)' : '+20 XP (Baja Intensidad)';
    this.alertService.info(`${jug?.nombres || 'Jugador'}: ${xpBonus}`);
  }

  // --- ESTRATEGIA 3: DELEGACIÓN AL CAPITÁN / ASISTENTE ---
  toggleModoDelegado(): void {
    const nuevo = !this.modoDelegadoActivo();
    this.modoDelegadoActivo.set(nuevo);
    if (nuevo) {
      this.alertService.success('Pase delegado activado: Mateo Gómez (#10) puede registrar presentes. El DT mantiene la firma oficial.');
    } else {
      this.alertService.info('Modo DT exclusivo restaurado.');
    }
  }

  // --- ESTRATEGIA 2: DICTADO POR VOZ ASISTIDO POR IA ---
  abrirModalDictadoVoz(): void {
    this.mostrarModalDictadoVoz.set(true);
    this.textoDictadoTranscrito = '';
    this.novedadesDetectadasVoz.set([]);
    this.grabandoVoz.set(false);
    this.procesandoVoz.set(false);
  }

  cerrarModalDictadoVoz(): void {
    this.mostrarModalDictadoVoz.set(false);
    this.grabandoVoz.set(false);
    this.procesandoVoz.set(false);
  }

  toggleGrabacionVoz(): void {
    if (this.grabandoVoz()) {
      // Detener grabación y simular interpretación IA
      this.grabandoVoz.set(false);
      if (!this.textoDictadoTranscrito) {
        this.usarEjemploDictado();
      }
    } else {
      this.grabandoVoz.set(true);
      this.textoDictadoTranscrito = '';
      this.novedadesDetectadasVoz.set([]);

      // Simular dictado en vivo tras 2.5s
      setTimeout(() => {
        if (this.grabandoVoz()) {
          this.grabandoVoz.set(false);
          this.usarEjemploDictado();
        }
      }, 2500);
    }
  }

  usarEjemploDictado(): void {
    this.textoDictadoTranscrito = 'Mateo Gómez destacado en remates, Nicolás Zapata retraso por tráfico, Carlos Londoño excusa médica y Samuel Vásquez falta.';
    
    // IA detecta entidades y las parsea automáticamente
    this.novedadesDetectadasVoz.set([
      { jugadorNombre: 'Mateo Gómez (#10)', estado: 'PRESENTE', rating: 'DESTACADO', obs: 'Destacado en remates (+100 XP)' },
      { jugadorNombre: 'Nicolás Zapata (#4)', estado: 'RETRASO', obs: 'Tráfico vía Las Palmas' },
      { jugadorNombre: 'Carlos Londoño (#9)', estado: 'EXCUSA', obs: 'Cita médica / fisioterapia' },
      { jugadorNombre: 'Samuel Vásquez (#3)', estado: 'FALTA', obs: 'Inasistencia injustificada' }
    ]);
  }

  aplicarNovedadesDictado(): void {
    this.procesandoVoz.set(true);

    setTimeout(() => {
      // Aplicar las novedades directamente al listado de jugadores
      this.jugadores.update(list => list.map(j => {
        if (j.nombres.includes('Mateo') || j.dorsal === 10) {
          return { ...j, estado: 'PRESENTE', calificacionRendimiento: 'DESTACADO' };
        }
        if (j.nombres.includes('Nicolás') || j.dorsal === 4) {
          return { ...j, estado: 'RETRASO', observacion: 'Tráfico vía Las Palmas' };
        }
        if (j.nombres.includes('Carlos') || j.dorsal === 9) {
          return { ...j, estado: 'EXCUSA', observacion: 'Cita médica / fisioterapia' };
        }
        if (j.nombres.includes('Samuel') || j.dorsal === 3) {
          return { ...j, estado: 'FALTA' };
        }
        return j;
      }));

      this.procesandoVoz.set(false);
      this.cerrarModalDictadoVoz();
      this.alertService.success('¡Novedades por voz aplicadas exitosamente a la planilla!');
    }, 600);
  }

  guardarAsistencia(): void {
    this.mostrarDialogoGuardado.set(true);
  }

  continuarEditando(): void {
    this.mostrarDialogoGuardado.set(false);
    this.alertService.info('Puedes seguir modificando la planilla.');
  }

  cerrarYActualizar(): void {
    this.mostrarDialogoGuardado.set(false);
    this.recargarAsistencia();
  }
}
