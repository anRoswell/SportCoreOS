import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Club {
  id: string;
  nombre: string;
  slug: string;
  logo: string;
  plan: string;
  sigla: string;
  ciudad: string;
  pais?: string;
  activo?: boolean;
}

export interface KPIStats {
  jugadoresActivos: number;
  jugadoresLesionados: number;
  totalCategorias: number;
  proximosPartidos: any[];
  finanzas: {
    facturadoMes: number;
    recaudadoMes: number;
    carteraMora: number;
    porcentajeRecaudo: number;
  };
  distribucionPosiciones: any[];
}

export interface JugadorExpediente360 {
  jugador: any;
  acudientes: any[];
  historialBiometrico: any[];
  historialFinanciero: any[];
  clinicasInsignias?: any[];
  resumenFinanciero: {
    totalFacturado: number;
    totalPagado: number;
    saldoPendiente: number;
    estadoCuenta: 'AL_DIA' | 'EN_MORA';
  };
}

export const DEFAULT_CLUBS: Club[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    nombre: 'Club Deportivo Futuros Cracks FC',
    slug: 'futuros-cracks-fc',
    logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200',
    plan: 'Plan Club Élite Pro',
    sigla: 'FCFC',
    ciudad: 'Cartagena',
    pais: 'Colombia',
    activo: true,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    nombre: 'Academia Semillero Santa Fe',
    slug: 'semillero-santa-fe',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200',
    plan: 'Plan Semillero Oro',
    sigla: 'SSF',
    ciudad: 'Medellín',
    pais: 'Colombia',
    activo: true,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    nombre: 'Millonarios Cantera Norte',
    slug: 'millonarios-cantera-norte',
    logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=200',
    plan: 'Plan Élite Liga',
    sigla: 'MCN',
    ciudad: 'Cali',
    pais: 'Colombia',
    activo: true,
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    nombre: 'Academia Atlético Nacional Cantera',
    slug: 'atletico-nacional-cantera',
    logo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=200',
    plan: 'Plan Club Élite Pro',
    sigla: 'ANC',
    ciudad: 'Barranquilla',
    pais: 'Colombia',
    activo: true,
  },
];

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl || 'http://localhost:3001/api/v1';

  // Lista de Clubes Multi-Tenant (cargada dinámicamente desde la BD con fallback inmediato)
  readonly availableClubs = signal<Club[]>(DEFAULT_CLUBS);

  // Club Activo Seleccionado (recuperado de localStorage si existe)
  readonly activeClub = signal<Club>(this.getStoredActiveClub());

  // Control de Sidebar colapsable
  readonly sidebarCollapsed = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadClubs();
  }

  private getStoredActiveClub(): Club {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(environment.activeClubKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore error and fallback
        }
      }
    }
    return DEFAULT_CLUBS[0];
  }

  loadClubs(): void {
    this.http.get<any>(`${this.apiUrl}/clubes`).pipe(
      map(res => {
        const payload = res?.data !== undefined ? res.data : res;
        return Array.isArray(payload) ? payload : (payload?.data || []);
      }),
      catchError(() => of([]))
    ).subscribe((clubs) => {
      if (clubs && Array.isArray(clubs) && clubs.length > 0) {
        const mapped: Club[] = clubs.map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          slug: c.slug,
          logo: c.logo_url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200',
          plan: c.plan || 'Plan Élite Pro',
          sigla: c.sigla || 'SC',
          ciudad: c.ciudad || 'Colombia',
          pais: c.pais || 'Colombia',
          activo: c.activo !== false,
        }));
        this.availableClubs.set(mapped);
        const currentActive = this.activeClub();
        const found = mapped.find(c => c.id === currentActive.id);
        if (found) {
          this.activeClub.set(found);
        } else if (mapped.length > 0) {
          this.activeClub.set(mapped[0]);
        }
      }
    });
  }

  selectClub(clubId: string): void {
    const found = this.availableClubs().find((c) => c.id === clubId);
    if (found) {
      this.activeClub.set(found);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(environment.activeClubKey, JSON.stringify(found));
      }
    }
  }

  setClubFromUser(user: { clubId?: string; clubNombre?: string; clubSlug?: string; clubLogo?: string }): void {
    if (user.clubId) {
      const found = this.availableClubs().find((c) => c.id === user.clubId);
      if (found) {
        this.activeClub.set(found);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(environment.activeClubKey, JSON.stringify(found));
        }
      } else {
        const customClub: Club = {
          id: user.clubId,
          nombre: user.clubNombre || 'Academia Vinculada',
          slug: user.clubSlug || 'academia-vinculada',
          logo: user.clubLogo || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200',
          plan: 'Plan Élite Pro',
          sigla: 'SC',
          ciudad: 'Colombia',
          pais: 'Colombia',
          activo: true,
        };
        this.activeClub.set(customClub);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(environment.activeClubKey, JSON.stringify(customClub));
        }
      }
    }
  }

  createClubWithDirector(data: {
    clubNombre: string;
    sigla: string;
    ciudad: string;
    pais?: string;
    logoUrl?: string;
    plan?: string;
    adminNombre: string;
    adminApellido: string;
    adminEmail: string;
    adminPassword: string;
    adminTelefono?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/clubes/onboarding`, data).pipe(
      map((res) => res.data || res),
      tap(() => {
        this.loadClubs();
      })
    );
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((val) => !val);
  }

  getDashboardKPIs(): Observable<KPIStats> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/kpis`).pipe(
      map(res => res.data || res)
    );
  }

  getCategorias(options?: { page?: number; limit?: number; search?: string; rama?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (options?.page !== undefined) params = params.set('page', options.page);
    if (options?.limit !== undefined) params = params.set('limit', options.limit);
    if (options?.search && options.search.trim()) params = params.set('search', options.search.trim());
    if (options?.rama && options.rama !== 'TODAS') params = params.set('rama', options.rama);

    return this.http.get<any>(`${this.apiUrl}/categorias`, { params }).pipe(
      map(res => {
        const payload = res?.data !== undefined ? res.data : res;
        return Array.isArray(payload) ? payload : (payload?.data || []);
      }),
      catchError(() => of([])),
    );
  }

  getJugadores(
    optionsOrCatId?:
      | string
      | {
          page?: number;
          limit?: number;
          categoriaId?: string;
          search?: string;
          estado?: string;
          posicion?: string;
          genero?: string;
          sortBy?: string;
        },
    search?: string,
    estado?: string,
  ): Observable<any> {
    let params = new HttpParams();

    if (typeof optionsOrCatId === 'object' && optionsOrCatId !== null) {
      if (optionsOrCatId.page !== undefined) params = params.set('page', optionsOrCatId.page);
      if (optionsOrCatId.limit !== undefined) params = params.set('limit', optionsOrCatId.limit);
      if (optionsOrCatId.categoriaId && optionsOrCatId.categoriaId !== 'TODAS') params = params.set('categoriaId', optionsOrCatId.categoriaId);
      if (optionsOrCatId.search && optionsOrCatId.search.trim()) params = params.set('search', optionsOrCatId.search.trim());
      if (optionsOrCatId.estado && optionsOrCatId.estado !== 'TODOS') params = params.set('estado', optionsOrCatId.estado);
      if (optionsOrCatId.posicion && optionsOrCatId.posicion !== 'TODAS') params = params.set('posicion', optionsOrCatId.posicion);
      if (optionsOrCatId.genero && optionsOrCatId.genero !== 'TODOS') params = params.set('genero', optionsOrCatId.genero);
      if (optionsOrCatId.sortBy) params = params.set('sortBy', optionsOrCatId.sortBy);
    } else {
      if (optionsOrCatId && optionsOrCatId !== 'TODAS') params = params.set('categoriaId', optionsOrCatId);
      if (search && search.trim()) params = params.set('search', search.trim());
      if (estado && estado !== 'TODOS') params = params.set('estado', estado);
    }

    return this.http.get<any>(`${this.apiUrl}/jugadores`, { params }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
    );
  }

  getExpedienteJugador(id: string): Observable<JugadorExpediente360> {
    return this.http.get<any>(`${this.apiUrl}/jugadores/${id}/expediente`).pipe(
      map(res => res.data || res)
    );
  }

  createJugador(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jugadores`, data).pipe(
      map(res => res.data || res)
    );
  }

  updateJugador(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/jugadores/${id}`, data).pipe(
      map(res => res.data || res)
    );
  }

  deleteJugador(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/jugadores/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  getAssetBaseUrl(): string {
    try {
      const url = new URL(this.apiUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      return 'http://localhost:3001';
    }
  }

  resolveFileUrl(urlOrPath: string | null | undefined): string {
    if (!urlOrPath) return '';
    const trimmed = urlOrPath.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image')) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${this.getAssetBaseUrl()}${cleanPath}`;
  }

  uploadFile(file: File, folder: string = 'avatars', entidadTipo?: string, entidadId?: string, tipoDocumento?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    let params = new HttpParams().set('folder', folder);
    if (entidadTipo) params = params.set('entidadTipo', entidadTipo);
    if (entidadId) params = params.set('entidadId', entidadId);
    if (tipoDocumento) params = params.set('tipoDocumento', tipoDocumento);

    return this.http.post<any>(`${this.apiUrl}/storage/upload`, formData, { params }).pipe(
      map(res => {
        const data = res.data || res;
        if (data && data.url) {
          data.fullUrl = this.resolveFileUrl(data.url);
        }
        return data;
      })
    );
  }

  addAcudiente(jugadorId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jugadores/${jugadorId}/acudientes`, data).pipe(
      map(res => res.data || res)
    );
  }

  removeAcudiente(jugadorId: string, acudienteId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/jugadores/${jugadorId}/acudientes/${acudienteId}`).pipe(
      map(res => res.data || res)
    );
  }

  addBiometria(jugadorId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/jugadores/${jugadorId}/biometria`, data).pipe(
      map(res => res.data || res)
    );
  }

  // CATEGORÍAS
  createCategoria(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categorias`, data).pipe(
      map(res => res.data || res)
    );
  }

  updateCategoria(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categorias/${id}`, data).pipe(
      map(res => res.data || res)
    );
  }

  deleteCategoria(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categorias/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  getPlantelCategoria(id: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/categorias/${id}/plantel`).pipe(
      map(res => {
        const payload = res?.data !== undefined ? res.data : res;
        return Array.isArray(payload) ? payload : (payload?.data || []);
      }),
      catchError(() => of([])),
    );
  }

  // PARTIDOS & FIXTURE
  getPartidos(
    optionsOrCatId?:
      | string
      | {
          categoriaId?: string;
          search?: string;
          estado?: string;
          page?: number;
          limit?: number;
        },
  ): Observable<any> {
    let params = new HttpParams();
    if (typeof optionsOrCatId === 'object' && optionsOrCatId !== null) {
      if (optionsOrCatId.page !== undefined) params = params.set('page', optionsOrCatId.page);
      if (optionsOrCatId.limit !== undefined) params = params.set('limit', optionsOrCatId.limit);
      if (optionsOrCatId.categoriaId && optionsOrCatId.categoriaId !== 'TODAS') params = params.set('categoriaId', optionsOrCatId.categoriaId);
      if (optionsOrCatId.search && optionsOrCatId.search.trim()) params = params.set('search', optionsOrCatId.search.trim());
      if (optionsOrCatId.estado && optionsOrCatId.estado !== 'TODOS') params = params.set('estado', optionsOrCatId.estado);
    } else if (optionsOrCatId && optionsOrCatId !== 'TODAS') {
      params = params.set('categoriaId', optionsOrCatId);
    }

    return this.http.get<any>(`${this.apiUrl}/partidos`, { params }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
    );
  }

  getDetallePartido(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/partidos/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  createPartido(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/partidos`, data).pipe(
      map(res => res.data || res)
    );
  }

  updatePartido(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/partidos/${id}`, data).pipe(
      map(res => res.data || res)
    );
  }

  deletePartido(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/partidos/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  addEventoPartido(partidoId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/partidos/${partidoId}/eventos`, data).pipe(
      map(res => res.data || res)
    );
  }

  // CONVOCATORIAS
  getConvocatoria(partidoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/convocatorias/partido/${partidoId}`).pipe(
      map(res => res.data || res)
    );
  }

  responderConvocatoria(convocatoriaId: string, estado: string, motivoExcusa?: string, jugadorId?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/convocatorias/${convocatoriaId}/responder`, {
      estado,
      motivoExcusa,
      jugadorId,
    }).pipe(
      map(res => res.data || res)
    );
  }

  addJugadorConvocatoria(partidoId: string, jugadorId: string, rol: string = 'TITULAR', posicion?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/convocatorias/partido/${partidoId}/jugadores`, {
      jugadorId,
      rol,
      posicion,
    }).pipe(
      map(res => res.data || res)
    );
  }

  removeJugadorConvocatoria(partidoId: string, jugadorId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/convocatorias/partido/${partidoId}/jugadores/${jugadorId}/eliminar`, {}).pipe(
      map(res => res.data || res)
    );
  }

  cambiarRolConvocatoria(partidoId: string, jugadorId: string, rol: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/convocatorias/partido/${partidoId}/jugadores/${jugadorId}/rol`, { rol }).pipe(
      map(res => res.data || res)
    );
  }

  sugerirConvocatoria(partidoId: string, limiteTitulares?: number, limiteSuplentes?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/convocatorias/partido/${partidoId}/sugerir`, {
      limiteTitulares,
      limiteSuplentes,
    }).pipe(
      map(res => res.data || res)
    );
  }

  // FINANZAS & PAGOS PSE
  getResumenFinanzas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/finanzas/resumen`).pipe(
      map(res => res.data || res)
    );
  }

  getCargos(
    optionsOrCatId?:
      | string
      | {
          categoriaId?: string;
          search?: string;
          estadoPago?: string;
          page?: number;
          limit?: number;
        },
  ): Observable<any> {
    let params = new HttpParams();
    if (typeof optionsOrCatId === 'object' && optionsOrCatId !== null) {
      if (optionsOrCatId.page !== undefined) params = params.set('page', optionsOrCatId.page);
      if (optionsOrCatId.limit !== undefined) params = params.set('limit', optionsOrCatId.limit);
      if (optionsOrCatId.categoriaId && optionsOrCatId.categoriaId !== 'TODAS') params = params.set('categoriaId', optionsOrCatId.categoriaId);
      if (optionsOrCatId.search && optionsOrCatId.search.trim()) params = params.set('search', optionsOrCatId.search.trim());
      if (optionsOrCatId.estadoPago && optionsOrCatId.estadoPago !== 'TODOS') params = params.set('estadoPago', optionsOrCatId.estadoPago);
    } else if (optionsOrCatId && optionsOrCatId !== 'TODAS') {
      params = params.set('categoriaId', optionsOrCatId);
    }

    return this.http.get<any>(`${this.apiUrl}/finanzas/cargos`, { params }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
    );
  }

  generarMensualidad(mes?: number, anio?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/finanzas/cargos/generar-mensualidad`, { mes, anio }).pipe(
      map(res => res.data || res)
    );
  }

  registrarPago(cargoId: string, monto: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/finanzas/cargos/${cargoId}/pagar`, { monto }).pipe(
      map(res => res.data || res)
    );
  }

  // BIOMETRÍA & RENDIMIENTO
  getBiometria(
    page?: number,
    limit?: number,
    search?: string,
    categoriaId?: string,
    diagnostico?: string,
    sortBy?: string,
  ): Observable<any> {
    let params = new HttpParams();
    if (page !== undefined) params = params.set('page', page);
    if (limit !== undefined) params = params.set('limit', limit);
    if (search && search.trim()) params = params.set('search', search.trim());
    if (categoriaId && categoriaId !== 'TODAS') params = params.set('categoriaId', categoriaId);
    if (diagnostico && diagnostico !== 'TODOS') params = params.set('diagnostico', diagnostico);
    if (sortBy) params = params.set('sortBy', sortBy);

    return this.http.get<any>(`${this.apiUrl}/biometria`, { params }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
    );
  }

  registrarBiometria(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/biometria/evaluacion`, data).pipe(
      map(res => res.data || res)
    );
  }
  // ALQUILER DE CANCHAS & SEDES (MÓDULO 08)
  getCanchas(options?: { page?: number; limit?: number; search?: string; tipoSuperficie?: string }): Observable<any> {
    let params = new HttpParams();
    if (options?.page !== undefined) params = params.set('page', options.page);
    if (options?.limit !== undefined) params = params.set('limit', options.limit);
    if (options?.search && options.search.trim()) params = params.set('search', options.search.trim());
    if (options?.tipoSuperficie && options.tipoSuperficie !== 'TODAS') params = params.set('tipoSuperficie', options.tipoSuperficie);

    return this.http.get<any>(`${this.apiUrl}/canchas`, { params }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
    );
  }

  getCanchaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/canchas/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  createCancha(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/canchas`, data).pipe(
      map(res => res.data || res)
    );
  }

  updateCancha(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/canchas/${id}`, data).pipe(
      map(res => res.data || res)
    );
  }

  deleteCancha(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/canchas/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  getDisponibilidadCanchas(fecha: string): Observable<any> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<any>(`${this.apiUrl}/canchas/disponibilidad`, { params }).pipe(
      map(res => res.data || res)
    );
  }

  createReservaCancha(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/canchas/reservas`, data).pipe(
      map(res => res.data || res)
    );
  }

  pagarReservaCaja(reservaId: string, monto: number, metodoPago: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/canchas/reservas/${reservaId}/pago-caja`, { monto, metodo_pago: metodoPago }).pipe(
      map(res => res.data || res)
    );
  }

  cancelarReservaCancha(reservaId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/canchas/reservas/${reservaId}/cancelar`, {}).pipe(
      map(res => res.data || res)
    );
  }

  // TIENDA DE INDUMENTARIA & STOCK (MÓDULO 09)
  getCatalogoTienda(options?: { page?: number; limit?: number; search?: string; categoria?: string }): Observable<any> {
    let params = new HttpParams();
    if (options?.page !== undefined) params = params.set('page', options.page);
    if (options?.limit !== undefined) params = params.set('limit', options.limit);
    if (options?.search && options.search.trim()) params = params.set('search', options.search.trim());
    if (options?.categoria && options.categoria !== 'TODAS') params = params.set('categoria', options.categoria);

    return this.http.get<any>(`${this.apiUrl}/tienda/catalogo`, { params }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
    );
  }

  getProductoTiendaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tienda/productos/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  createProductoTienda(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tienda/productos`, data).pipe(
      map(res => res.data || res)
    );
  }

  updateProductoTienda(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tienda/productos/${id}`, data).pipe(
      map(res => res.data || res)
    );
  }

  deleteProductoTienda(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tienda/productos/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  ajustarStockVariante(varianteId: string, stockActual: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/tienda/variantes/${varianteId}/stock`, { stock_actual: stockActual }).pipe(
      map(res => res.data || res)
    );
  }

  getPedidosTienda(options?: { page?: number; limit?: number; search?: string; estadoDespacho?: string }): Observable<any> {
    let params = new HttpParams();
    if (options?.page !== undefined) params = params.set('page', options.page);
    if (options?.limit !== undefined) params = params.set('limit', options.limit);
    if (options?.search && options.search.trim()) params = params.set('search', options.search.trim());
    if (options?.estadoDespacho && options.estadoDespacho !== 'TODOS') params = params.set('estadoDespacho', options.estadoDespacho);

    return this.http.get<any>(`${this.apiUrl}/tienda/pedidos`, { params }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
    );
  }

  createPedidoTienda(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tienda/pedidos`, data).pipe(
      map(res => res.data || res)
    );
  }

  despacharPedidoTienda(pedidoId: string, recibidoPor: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/tienda/pedidos/${pedidoId}/despachar`, { recibido_por: recibidoPor }).pipe(
      map(res => res.data || res)
    );
  }

  // ==========================================
  // MÓDULO 10: SPORTCORE AI (ASISTENTE GEMINI)
  // ==========================================
  chatTacticoDt(data: any): Observable<any> {
    const payload = {
      consulta: data.consulta || data.mensaje || 'Consulta táctica general',
      sistema_base: data.sistema_base || data.formacion || '4-3-3',
      categoria_id: data.categoria_id,
    };
    return this.http.post<any>(`${this.apiUrl}/ia/chat-tactico-dt`, payload).pipe(
      map(res => res.data || res)
    );
  }

  generarBoletinAlumno(data: any): Observable<any> {
    const payload = {
      jugador_id: data.jugador_id,
      periodo: data.periodo || data.mes_periodo || '2026-03',
      enfoque_adicional: data.enfoque_adicional || data.observaciones_dt || 'Rendimiento general',
    };
    return this.http.post<any>(`${this.apiUrl}/ia/generar-boletin-alumno`, payload).pipe(
      map(res => res.data || res)
    );
  }

  getAnalisisFatiga(jugadorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ia/analisis-fatiga/${jugadorId}`).pipe(
      map(res => res.data || res)
    );
  }

  generarGraficaConvocatoriaIa(data: {
    partido_id: string;
    estilo_diseno?: string;
    tono_titular?: string;
    prompt_personalizado?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ia/generar-grafica-convocatoria`, data).pipe(
      map(res => res.data || res)
    );
  }

  // ==========================================
  // MÓDULO 11: SCOUTING, VISORÍA & CAPTACIÓN
  // ==========================================
  getProspectos(
    optionsOrSearch?:
      | string
      | {
          page?: number;
          limit?: number;
          search?: string;
          estado?: string;
          posicion?: string;
        },
    estado?: string,
    posicion?: string,
  ): Observable<any> {
    let params = new HttpParams();
    if (typeof optionsOrSearch === 'object' && optionsOrSearch !== null) {
      if (optionsOrSearch.page !== undefined) params = params.set('page', optionsOrSearch.page);
      if (optionsOrSearch.limit !== undefined) params = params.set('limit', optionsOrSearch.limit);
      if (optionsOrSearch.search && optionsOrSearch.search.trim()) params = params.set('search', optionsOrSearch.search.trim());
      if (optionsOrSearch.estado && optionsOrSearch.estado !== 'TODOS') params = params.set('estado', optionsOrSearch.estado);
      if (optionsOrSearch.posicion && optionsOrSearch.posicion !== 'TODAS') params = params.set('posicion', optionsOrSearch.posicion);
    } else {
      if (optionsOrSearch && optionsOrSearch.trim()) params = params.set('search', optionsOrSearch.trim());
      if (estado && estado !== 'TODOS') params = params.set('estado', estado);
      if (posicion && posicion !== 'TODAS') params = params.set('posicion', posicion);
    }

    return this.http.get<any>(`${this.apiUrl}/scouting/prospectos`, { params }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
    );
  }

  getProspectoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/scouting/prospectos/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  createProspecto(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scouting/prospectos`, data).pipe(
      map(res => res.data || res)
    );
  }

  updateProspecto(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/scouting/prospectos/${id}`, data).pipe(
      map(res => res.data || res)
    );
  }

  deleteProspecto(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/scouting/prospectos/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  createEvaluacionProspecto(prospectoId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scouting/prospectos/${prospectoId}/evaluaciones`, data).pipe(
      map(res => res.data || res)
    );
  }

  // ==========================================
  // MÓDULO 12: TELEMETRÍA GPS & HEATMAPS
  // ==========================================
  getSesionesTelemetria(options?: { page?: number; limit?: number; search?: string; tipoSesion?: string }): Observable<any> {
    let params = new HttpParams();
    if (options?.page !== undefined) params = params.set('page', options.page);
    if (options?.limit !== undefined) params = params.set('limit', options.limit);
    if (options?.search && options.search.trim()) params = params.set('search', options.search.trim());
    if (options?.tipoSesion && options.tipoSesion !== 'TODOS') params = params.set('tipoSesion', options.tipoSesion);

    return this.http.get<any>(`${this.apiUrl}/telemetria/sesiones`, { params }).pipe(
      map(res => res.data !== undefined ? res.data : res),
      catchError(() => of({ data: [], total: 0, page: 1, limit: 10, totalPages: 1 })),
    );
  }

  getSesionTelemetriaById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/telemetria/sesiones/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  createSesionTelemetria(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/telemetria/sesiones`, data).pipe(
      map(res => res.data || res)
    );
  }

  createMetricaGps(sesionId: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/telemetria/sesiones/${sesionId}/metricas`, data).pipe(
      map(res => res.data || res)
    );
  }

  getHistorialGpsJugador(jugadorId: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/telemetria/jugadores/${jugadorId}/historial`).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
    );
  }

  // ==========================================
  // MÓDULO 13: MÓDULOS HABILITADOS POR ESCUELA (LICENCIAS)
  // ==========================================
  getTenantModulesCatalog(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/tenant-modules/catalog`).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
    );
  }

  getClubsTenantModules(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/tenant-modules/clubes`).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
    );
  }

  getMyClubModules(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tenant-modules/me`).pipe(
      map(res => res.data || res)
    );
  }

  getClubModules(clubId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tenant-modules/${clubId}`).pipe(
      map(res => res.data || res)
    );
  }

  updateClubModule(clubId: string, moduleCode: string, dto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tenant-modules/${clubId}/${moduleCode}`, dto).pipe(
      map(res => res.data || res)
    );
  }

  bulkUpdateClubModules(clubId: string, modulosHabilitados: string[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tenant-modules/${clubId}/bulk`, { modulosHabilitados }).pipe(
      map(res => res.data || res)
    );
  }

  // ==========================================
  // MÓDULO 14: PARÁMETROS DEL SISTEMA
  // ==========================================
  getParametros(modulo?: string): Observable<any[]> {
    let params = new HttpParams();
    if (modulo) {
      params = params.set('modulo', modulo);
    }
    return this.http.get<any>(`${this.apiUrl}/parametros`, { params }).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
    );
  }

  getParametroByClave(clave: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/parametros/clave/${clave}`).pipe(
      map(res => res.data || res)
    );
  }

  createParametro(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/parametros`, data).pipe(
      map(res => res.data || res)
    );
  }

  updateParametro(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/parametros/${id}`, data).pipe(
      map(res => res.data || res)
    );
  }

  deleteParametro(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/parametros/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  // ==========================================
  // MÓDULO 15: ROLES, PERFILES & PERMISOS (RBAC)
  // ==========================================
  getRolesCatalog(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/roles/catalogo`).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
    );
  }

  getPermissionsMatrix(rol?: string): Observable<any> {
    let params = new HttpParams();
    if (rol) {
      params = params.set('rol', rol);
    }
    return this.http.get<any>(`${this.apiUrl}/roles/permisos`, { params }).pipe(
      map(res => res.data || res)
    );
  }

  updateRolePermissions(rol: string, permisos: any[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/roles/permisos`, { rol, permisos }).pipe(
      map(res => res.data || res)
    );
  }

  updateSinglePermission(rol: string, dto: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/roles/${rol}/permiso`, dto).pipe(
      map(res => res.data || res)
    );
  }

  resetRolePermissions(rol?: string): Observable<any> {
    let params = new HttpParams();
    if (rol) {
      params = params.set('rol', rol);
    }
    return this.http.post<any>(`${this.apiUrl}/roles/permisos/reset`, {}, { params }).pipe(
      map(res => res.data || res)
    );
  }

  getUsersWithRoles(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/roles/usuarios`).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
    );
  }

  assignUserRole(usuarioId: string, rol: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/roles/asignar-usuario`, { usuarioId, rol }).pipe(
      map(res => res.data || res)
    );
  }

  // ==========================================
  // MÓDULO 16: SERVICIOS ESPECIALIZADOS & MASTERCLASSES
  // ==========================================
  getServicios(options?: { categoria?: string; search?: string }): Observable<any[]> {
    let params = new HttpParams();
    if (options?.categoria && options.categoria !== 'TODAS') {
      params = params.set('categoria', options.categoria);
    }
    if (options?.search) {
      params = params.set('search', options.search);
    }
    return this.http.get<any>(`${this.apiUrl}/servicios`, { params }).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
    );
  }

  getServicioById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/servicios/${id}`).pipe(
      map(res => res.data || res)
    );
  }

  createServicio(dto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/servicios`, dto).pipe(
      map(res => res.data || res)
    );
  }

  inscribirServicio(servicioId: string, dto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/servicios/${servicioId}/inscribir`, dto).pipe(
      map(res => res.data || res)
    );
  }

  getInscripcionesServicio(servicioId: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/servicios/${servicioId}/inscripciones`).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
    );
  }
}



