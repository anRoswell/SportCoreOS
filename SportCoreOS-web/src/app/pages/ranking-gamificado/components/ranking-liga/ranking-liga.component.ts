import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';

interface CapturaJugadorLiga {
  jugadorId: string;
  nombre: string;
  dorsal: number;
  minutos: number;
  goles: number;
  asistencias: number;
  remates: number;
  rematesAPuerta: number;
  pasesClave: number;
  regatesExitosos: number;
  recuperaciones: number;
  intercepciones: number;
  duelosGanados: number;
  atajadas: number;
}

@Component({
  selector: 'app-ranking-liga',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ranking-liga.component.html',
  styleUrl: './ranking-liga.component.scss',
})
export class RankingLigaComponent implements OnInit {
  private readonly api = inject(ApiService);

  categorias: any[] = [];
  jugadoresDisponibles: any[] = [];
  partidos: any[] = [];
  ranking: any[] = [];
  categoriaId = '';
  temporadaFiltro = `${new Date().getFullYear()}`;
  modoCarga: 'MANUAL' | 'CSV' = 'MANUAL';
  cargando = false;
  guardando = false;
  mensaje = '';
  tipoMensaje: 'success' | 'error' | 'info' = 'info';
  csvNombre = '';
  csvContenido = '';
  csvFilas = 0;
  csvError = '';
  manualJugadores: CapturaJugadorLiga[] = [];

  partido = {
    competenciaNombre: '',
    temporada: `${new Date().getFullYear()}`,
    fechaPartido: new Date().toISOString().slice(0, 10),
    rivalNombre: '',
    golesClub: 0,
    golesRival: 0,
  };

  jugadorForm: CapturaJugadorLiga = this.nuevaFilaJugador();

  get partidosPendientesCount(): number {
    return this.partidos.filter((partido) => partido.estado === 'PENDIENTE').length;
  }

  ngOnInit(): void {
    this.api.getCategorias({ limit: 100 }).subscribe({
      next: (response: any) => {
        this.categorias = Array.isArray(response) ? response : (response?.data || []);
        if (!this.categoriaId && this.categorias.length) {
          this.categoriaId = this.categorias[0].id;
          this.onCategoriaChange();
        } else {
          this.cargarDatos();
        }
      },
      error: () => this.mostrarMensaje('No fue posible cargar las categorías de la escuela.', 'error'),
    });
  }

  onCategoriaChange(): void {
    this.manualJugadores = [];
    this.jugadorForm = this.nuevaFilaJugador();
    if (!this.categoriaId) {
      this.jugadoresDisponibles = [];
      this.cargarDatos();
      return;
    }
    this.api.getJugadores({ categoriaId: this.categoriaId, estado: 'ACTIVO', limit: 100 }).subscribe({
      next: (response: any) => {
        this.jugadoresDisponibles = Array.isArray(response) ? response : (response?.data || []);
      },
      error: () => this.mostrarMensaje('No fue posible cargar los jugadores de esta categoría.', 'error'),
    });
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.api.getLigaEstadisticas({
      categoriaId: this.categoriaId || undefined,
      temporada: this.temporadaFiltro || undefined,
    }).subscribe({
      next: (payload: any) => {
        this.partidos = payload?.partidos || [];
        this.ranking = payload?.ranking || [];
        this.cargando = false;
      },
      error: () => {
        this.partidos = [];
        this.ranking = [];
        this.cargando = false;
        this.mostrarMensaje('No fue posible consultar las estadísticas de liga.', 'error');
      },
    });
  }

  seleccionarModo(modo: 'MANUAL' | 'CSV'): void {
    this.modoCarga = modo;
    this.mensaje = '';
    if (modo === 'MANUAL') {
      this.csvNombre = '';
      this.csvContenido = '';
      this.csvFilas = 0;
      this.csvError = '';
    } else {
      this.manualJugadores = [];
      this.jugadorForm = this.nuevaFilaJugador();
    }
  }

  seleccionarJugador(): void {
    const found = this.jugadoresDisponibles.find((player) => player.id === this.jugadorForm.jugadorId);
    if (found) {
      this.jugadorForm = {
        ...this.nuevaFilaJugador(),
        jugadorId: found.id,
        nombre: `${found.nombres || ''} ${found.apellidos || ''}`.trim(),
        dorsal: Number(found.numero_dorsal) || 0,
      };
    }
  }

  agregarJugadorManual(): void {
    if (!this.jugadorForm.jugadorId) {
      this.mostrarMensaje('Selecciona un jugador antes de agregar sus estadísticas.', 'error');
      return;
    }
    if (this.manualJugadores.some((row) => row.jugadorId === this.jugadorForm.jugadorId)) {
      this.mostrarMensaje('Ese jugador ya está agregado al acta.', 'error');
      return;
    }
    if (this.jugadorForm.rematesAPuerta > this.jugadorForm.remates) {
      this.mostrarMensaje('Los remates a puerta no pueden superar los remates totales.', 'error');
      return;
    }
    this.manualJugadores = [...this.manualJugadores, { ...this.jugadorForm }];
    this.jugadorForm = this.nuevaFilaJugador();
    this.mostrarMensaje('Jugador agregado al acta pendiente.', 'success');
  }

  quitarJugadorManual(jugadorId: string): void {
    this.manualJugadores = this.manualJugadores.filter((row) => row.jugadorId !== jugadorId);
  }

  async onCsvSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.csvError = '';
    this.csvContenido = '';
    this.csvFilas = 0;
    this.csvNombre = '';
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.csvError = 'Selecciona un archivo con extensión .csv.';
      input.value = '';
      return;
    }
    if (file.size > 1_000_000) {
      this.csvError = 'El archivo supera el tamaño máximo de 1 MB.';
      input.value = '';
      return;
    }
    const contents = await file.text();
    const lines = contents.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
    const expected = 'dorsal,minutos,goles,asistencias,remates,remates_a_puerta,pases_clave,regates_exitosos,recuperaciones,intercepciones,duelos_ganados,atajadas';
    if (lines.length < 2 || lines[0].replace(/\s/g, '').toLowerCase() !== expected) {
      this.csvError = `El archivo debe incluir encabezados válidos y filas de jugadores. Descarga la plantilla para ver el formato.`;
      input.value = '';
      return;
    }
    this.csvNombre = file.name;
    this.csvContenido = contents;
    this.csvFilas = lines.length - 1;
  }

  descargarPlantilla(): void {
    const content = [
      'dorsal,minutos,goles,asistencias,remates,remates_a_puerta,pases_clave,regates_exitosos,recuperaciones,intercepciones,duelos_ganados,atajadas',
      '10,70,1,1,4,2,3,2,4,1,5,0',
      '1,70,0,0,0,0,0,0,1,0,0,4',
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'plantilla-estadisticas-liga.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    this.mostrarMensaje('Plantilla CSV descargada.', 'info');
  }

  registrarManual(): void {
    if (!this.validarMetadata() || !this.manualJugadores.length) {
      this.mostrarMensaje('Completa los datos del partido y agrega al menos un jugador.', 'error');
      return;
    }
    const payload = this.payloadBase();
    this.guardando = true;
    this.api.registrarPartidoLigaManual({
      ...payload,
      jugadores: this.manualJugadores.map(({ nombre, dorsal, ...stats }) => stats),
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.manualJugadores = [];
        this.limpiarMetadataPartido();
        this.mostrarMensaje('Acta guardada. Un entrenador debe validarla para acreditar XP.', 'success');
        this.cargarDatos();
      },
      error: (error: any) => {
        this.guardando = false;
        this.mostrarMensaje(error?.error?.message || 'No se pudo guardar el acta.', 'error');
      },
    });
  }

  importarCsv(): void {
    if (!this.validarMetadata() || !this.csvContenido || this.csvError) {
      this.mostrarMensaje('Completa los datos del partido y selecciona un CSV válido.', 'error');
      return;
    }
    this.guardando = true;
    this.api.importarPartidoLigaCsv({ ...this.payloadBase(), csvContenido: this.csvContenido }).subscribe({
      next: () => {
        this.guardando = false;
        this.csvNombre = '';
        this.csvContenido = '';
        this.csvFilas = 0;
        this.limpiarMetadataPartido();
        this.mostrarMensaje('CSV importado. El acta quedó pendiente de validación para acreditar XP.', 'success');
        this.cargarDatos();
      },
      error: (error: any) => {
        this.guardando = false;
        this.mostrarMensaje(error?.error?.message || 'No se pudo importar el CSV.', 'error');
      },
    });
  }

  validarPartido(match: any): void {
    this.api.validarPartidoLiga(match.id).subscribe({
      next: (result: any) => {
        this.mostrarMensaje(`Acta validada: ${Number(result?.xpAcreditado) || 0} XP acreditados.`, 'success');
        this.cargarDatos();
      },
      error: (error: any) => this.mostrarMensaje(error?.error?.message || 'No se pudo validar el acta.', 'error'),
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error' | 'info'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
  }

  private validarMetadata(): boolean {
    return Boolean(this.categoriaId && this.partido.competenciaNombre.trim() && this.partido.temporada.trim()
      && this.partido.fechaPartido && this.partido.rivalNombre.trim());
  }

  private payloadBase(): any {
    return {
      categoriaId: this.categoriaId,
      competenciaNombre: this.partido.competenciaNombre.trim(),
      temporada: this.partido.temporada.trim(),
      fechaPartido: this.partido.fechaPartido,
      rivalNombre: this.partido.rivalNombre.trim(),
      golesClub: Number(this.partido.golesClub) || 0,
      golesRival: Number(this.partido.golesRival) || 0,
    };
  }

  private limpiarMetadataPartido(): void {
    this.partido = {
      competenciaNombre: '',
      temporada: `${new Date().getFullYear()}`,
      fechaPartido: new Date().toISOString().slice(0, 10),
      rivalNombre: '',
      golesClub: 0,
      golesRival: 0,
    };
  }

  private nuevaFilaJugador(): CapturaJugadorLiga {
    return {
      jugadorId: '', nombre: '', dorsal: 0, minutos: 0, goles: 0, asistencias: 0,
      remates: 0, rematesAPuerta: 0, pasesClave: 0, regatesExitosos: 0,
      recuperaciones: 0, intercepciones: 0, duelosGanados: 0, atajadas: 0,
    };
  }
}
