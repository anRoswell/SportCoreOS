import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface CatalogoItem {
  codigo: string;
  nombre: string;
  tipo?: string;
  icono?: string;
  linea?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogosService {
  private api = inject(ApiService);

  // 1. Entidades EPS / Seguros Médicos
  readonly epsList = signal<CatalogoItem[]>([
    { codigo: 'SURA EPS', nombre: 'SURA EPS', tipo: 'EPS_CONTRIBUTIVO' },
    { codigo: 'Sanitas EPS', nombre: 'Sanitas EPS', tipo: 'EPS_CONTRIBUTIVO' },
    { codigo: 'Compensar EPS', nombre: 'Compensar EPS', tipo: 'EPS_CONTRIBUTIVO' },
    { codigo: 'Salud Total EPS', nombre: 'Salud Total EPS', tipo: 'EPS_CONTRIBUTIVO' },
    { codigo: 'Nueva EPS', nombre: 'Nueva EPS', tipo: 'EPS_MIXTO' },
    { codigo: 'Famisanar EPS', nombre: 'Famisanar EPS', tipo: 'EPS_CONTRIBUTIVO' },
    { codigo: 'EPS S.O.S', nombre: 'EPS S.O.S', tipo: 'EPS_CONTRIBUTIVO' },
    { codigo: 'Coosalud EPS', nombre: 'Coosalud EPS', tipo: 'EPS_SUBSIDIADO' },
    { codigo: 'Mutual Ser', nombre: 'Mutual Ser', tipo: 'EPS_SUBSIDIADO' },
    { codigo: 'Capital Salud EPS', nombre: 'Capital Salud EPS', tipo: 'EPS_SUBSIDIADO' },
    { codigo: 'Asmet Salud EPS', nombre: 'Asmet Salud EPS', tipo: 'EPS_SUBSIDIADO' },
    { codigo: 'Savia Salud EPS', nombre: 'Savia Salud EPS', tipo: 'EPS_SUBSIDIADO' },
    { codigo: 'Póliza Médica Privada / Prepagada', nombre: 'Póliza Médica Privada / Prepagada', tipo: 'POLIZA_PRIVADA' },
    { codigo: 'Particular / Otra EPS', nombre: 'Particular / Otra EPS no listada', tipo: 'OTRO' },
  ]);

  // 2. Tipos de Documento de Identidad
  readonly tiposDocumento = signal<CatalogoItem[]>([
    { codigo: 'TI', nombre: 'Tarjeta de Identidad (TI)', icono: '🪪' },
    { codigo: 'RC', nombre: 'Registro Civil (RC)', icono: '📄' },
    { codigo: 'CC', nombre: 'Cédula de Ciudadanía (CC)', icono: '💳' },
    { codigo: 'CE', nombre: 'Cédula de Extranjería (CE)', icono: '🌍' },
    { codigo: 'PASAPORTE', nombre: 'Pasaporte Oficial', icono: '✈️' },
    { codigo: 'PEP', nombre: 'Permiso Especial Permanencia (PEP)', icono: '📜' },
    { codigo: 'PPT', nombre: 'Permiso Protección Temporal (PPT)', icono: '📑' },
  ]);

  // 3. Parentesco del Acudiente / Familiar
  readonly parentescos = signal<CatalogoItem[]>([
    { codigo: 'PADRE', nombre: 'Padre' },
    { codigo: 'MADRE', nombre: 'Madre' },
    { codigo: 'TUTOR', nombre: 'Tutor Legal' },
    { codigo: 'ABUELO', nombre: 'Abuelo / Abuela' },
    { codigo: 'TIO', nombre: 'Tío / Tía' },
    { codigo: 'HERMANO', nombre: 'Hermano / Hermana' },
    { codigo: 'OTRO', nombre: 'Otro Familiar / Acudiente' },
  ]);

  // 4. Perfil de Pierna Hábil
  readonly piernasHabiles = signal<CatalogoItem[]>([
    { codigo: 'DIESTRO', nombre: 'Diestro (Pie Derecho)' },
    { codigo: 'ZURDO', nombre: 'Zurdo (Pie Izquierdo)' },
    { codigo: 'AMBIDIESTRO', nombre: 'Ambidiestro (Ambos Pies)' },
  ]);

  // 5. Posiciones Tácticas en Cancha
  readonly posiciones = signal<CatalogoItem[]>([
    { codigo: 'Portero', nombre: 'Portero / Guardameta (POR)', linea: 'ARQUERO' },
    { codigo: 'Lateral Derecho', nombre: 'Lateral Derecho (LD)', linea: 'DEFENSA' },
    { codigo: 'Defensa Central', nombre: 'Defensa Central (DFC)', linea: 'DEFENSA' },
    { codigo: 'Lateral Izquierdo', nombre: 'Lateral Izquierdo (LI)', linea: 'DEFENSA' },
    { codigo: 'Volante de Marca', nombre: 'Volante de Marca / Pivote (MCD)', linea: 'MEDIOCAMPO' },
    { codigo: 'Volante Mixto', nombre: 'Volante Mixto / Interior (MC)', linea: 'MEDIOCAMPO' },
    { codigo: 'Volante Ofensivo (10)', nombre: 'Volante Creativo / Enganche (10)', linea: 'MEDIOCAMPO' },
    { codigo: 'Extremo Derecho', nombre: 'Extremo Derecho (ED)', linea: 'ATAQUE' },
    { codigo: 'Extremo Izquierdo', nombre: 'Extremo Izquierdo (EI)', linea: 'ATAQUE' },
    { codigo: 'Delantero Centro', nombre: 'Delantero Centro / 9 (DC)', linea: 'ATAQUE' },
    { codigo: 'Segundo Delantero', nombre: 'Segundo Delantero (SD)', linea: 'ATAQUE' },
  ]);

  // 6. Kits de Indumentaria / Uniformes
  readonly kitsIndumentaria = signal<CatalogoItem[]>([
    { codigo: 'Kit Titular (Esmeralda)', nombre: 'Kit Titular (Esmeralda Pro)' },
    { codigo: 'Kit Alterno (Blanco)', nombre: 'Kit Alterno (Blanco Élite)' },
    { codigo: 'Kit Tercero (Negro/Dorado)', nombre: 'Kit Tercero (Negro / Dorado)' },
    { codigo: 'Kit Portero (Amarillo Neón)', nombre: 'Kit Portero (Amarillo Neón)' },
    { codigo: 'Peto Entrenamiento', nombre: 'Peto de Entrenamiento Fluo' },
  ]);

  // 7. Dispositivos / Sensores GPS
  readonly dispositivosGps = signal<CatalogoItem[]>([
    { codigo: 'CATAPULT_10HZ', nombre: 'Catapult Vector / ClearSky (10Hz)' },
    { codigo: 'POLAR_TEAM_PRO', nombre: 'Polar Team Pro (10Hz)' },
    { codigo: 'STATSPORTS_APEX', nombre: 'STATSports Apex Pro' },
    { codigo: 'K_SPORT_10HZ', nombre: 'K-Sport Live Tracking' },
    { codigo: 'WIMU_PRO', nombre: 'RealTrack WIMU PRO' },
    { codigo: 'GPS_GENERICO', nombre: 'Sensor GPS / Wearable Genérico' },
  ]);

  // 8. Tipos de Superficie de Cancha
  readonly tiposSuperficie = signal<CatalogoItem[]>([
    { codigo: 'sintetica_f5', nombre: 'Sintética Fútbol 5' },
    { codigo: 'sintetica_f8', nombre: 'Sintética Fútbol 8' },
    { codigo: 'natural_f11', nombre: 'Grama Natural Fútbol 11' },
    { codigo: 'futsal_madera', nombre: 'Coliseo Madera Futsal' },
    { codigo: 'arena_futbol', nombre: 'Cancha de Arena / Playa' },
  ]);

  private loaded = false;

  constructor() {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    if (this.loaded) return;
    this.api.getParametros().subscribe({
      next: (params: any[]) => {
        if (!params || !params.length) return;
        this.loaded = true;

        for (const p of params) {
          if (!p.valor) continue;
          try {
            if (p.clave === 'CATALOGO_EPS') {
              const parsed = typeof p.valor === 'string' ? JSON.parse(p.valor) : p.valor;
              if (Array.isArray(parsed) && parsed.length) {
                // Map to { codigo: item.nombre || item.codigo, nombre: item.nombre }
                const formatted = parsed.map((item: any) => ({
                  codigo: item.nombre || item.codigo,
                  nombre: item.nombre || item.codigo,
                  tipo: item.tipo,
                }));
                this.epsList.set(formatted);
              }
            } else if (p.clave === 'TIPOS_DOCUMENTO') {
              const parsed = typeof p.valor === 'string' ? JSON.parse(p.valor) : p.valor;
              if (Array.isArray(parsed) && parsed.length) this.tiposDocumento.set(parsed);
            } else if (p.clave === 'PARENTESCOS_ACUDIENTE') {
              const parsed = typeof p.valor === 'string' ? JSON.parse(p.valor) : p.valor;
              if (Array.isArray(parsed) && parsed.length) this.parentescos.set(parsed);
            } else if (p.clave === 'POSICIONES_JUGADOR') {
              const parsed = typeof p.valor === 'string' ? JSON.parse(p.valor) : p.valor;
              if (Array.isArray(parsed) && parsed.length) this.posiciones.set(parsed);
            } else if (p.clave === 'PIERNAS_HABILES') {
              const parsed = typeof p.valor === 'string' ? JSON.parse(p.valor) : p.valor;
              if (Array.isArray(parsed) && parsed.length) this.piernasHabiles.set(parsed);
            } else if (p.clave === 'KITS_INDUMENTARIA') {
              const parsed = typeof p.valor === 'string' ? JSON.parse(p.valor) : p.valor;
              if (Array.isArray(parsed) && parsed.length) this.kitsIndumentaria.set(parsed);
            } else if (p.clave === 'DISPOSITIVOS_GPS') {
              const parsed = typeof p.valor === 'string' ? JSON.parse(p.valor) : p.valor;
              if (Array.isArray(parsed) && parsed.length) this.dispositivosGps.set(parsed);
            } else if (p.clave === 'TIPOS_SUPERFICIE_CANCHA') {
              const parsed = typeof p.valor === 'string' ? JSON.parse(p.valor) : p.valor;
              if (Array.isArray(parsed) && parsed.length) this.tiposSuperficie.set(parsed);
            }
          } catch (e) {
            console.warn(`Error parseando catálogo ${p.clave}:`, e);
          }
        }
      },
      error: (err) => {
        console.warn('No se pudieron cargar catálogos dinámicos, usando predeterminados:', err);
      },
    });
  }
}
