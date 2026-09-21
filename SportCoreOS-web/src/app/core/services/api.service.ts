import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
  resumenFinanciero: {
    totalFacturado: number;
    totalPagado: number;
    saldoPendiente: number;
    estadoCuenta: 'AL_DIA' | 'EN_MORA';
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl || 'http://localhost:3001/api/v1';

  // Lista de Clubes Multi-Tenant (cargada dinámicamente desde la BD)
  readonly availableClubs = signal<Club[]>([]);

  // Club Activo Seleccionado
  readonly activeClub = signal<Club>({
    id: '10000000-0000-0000-0000-000000000001',
    nombre: 'Club Deportivo Futuros Cracks FC',
    slug: 'futuros-cracks-fc',
    logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200',
    plan: 'Plan Club Élite Pro',
    sigla: 'FCFC',
    ciudad: 'Bogotá D.C.',
  });

  // Control de Sidebar colapsable
  readonly sidebarCollapsed = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadClubs();
  }

  loadClubs(): void {
    this.http.get<any>(`${this.apiUrl}/clubes`).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
    ).subscribe((clubs) => {
      if (clubs && clubs.length > 0) {
        const mapped: Club[] = clubs.map((c: any) => ({
          id: c.id,
          nombre: c.nombre,
          slug: c.slug,
          logo: c.logo_url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200',
          plan: c.plan || 'Plan Élite Pro',
          sigla: c.sigla || 'SC',
          ciudad: c.ciudad || 'Colombia',
          pais: c.pais,
          activo: c.activo,
        }));
        this.availableClubs.set(mapped);
        if (!this.availableClubs().some(c => c.id === this.activeClub().id)) {
          this.activeClub.set(mapped[0]);
        }
      }
    });
  }

  selectClub(clubId: string): void {
    const found = this.availableClubs().find((c) => c.id === clubId);
    if (found) {
      this.activeClub.set(found);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((val) => !val);
  }

  getDashboardKPIs(): Observable<KPIStats> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/kpis`).pipe(
      map(res => res.data || res)
    );
  }

  getCategorias(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/categorias`).pipe(
      map(res => res.data || res)
    );
  }

  getJugadores(categoriaId?: string, search?: string, estado?: string): Observable<any[]> {
    let params = new HttpParams();
    if (categoriaId && categoriaId !== 'TODAS') params = params.set('categoriaId', categoriaId);
    if (search && search.trim()) params = params.set('search', search.trim());
    if (estado && estado !== 'TODOS') params = params.set('estado', estado);

    return this.http.get<any>(`${this.apiUrl}/jugadores`, { params }).pipe(
      map(res => res.data || res),
      catchError(() => of([])),
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

  uploadFile(file: File, folder: string = 'avatars'): Observable<{ url: string; filename: string; originalName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/storage/upload?folder=${folder}`, formData).pipe(
      map(res => res.data || res)
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
      map(res => res.data || res)
    );
  }

  // PARTIDOS & FIXTURE
  getPartidos(categoriaId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (categoriaId && categoriaId !== 'TODAS') params = params.set('categoriaId', categoriaId);
    return this.http.get<any>(`${this.apiUrl}/partidos`, { params }).pipe(
      map(res => res.data || res)
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

  // FINANZAS & PAGOS PSE
  getResumenFinanzas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/finanzas/resumen`).pipe(
      map(res => res.data || res)
    );
  }

  getCargos(categoriaId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (categoriaId && categoriaId !== 'TODAS') params = params.set('categoriaId', categoriaId);
    return this.http.get<any>(`${this.apiUrl}/finanzas/cargos`, { params }).pipe(
      map(res => res.data || res)
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
  getBiometria(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/biometria`).pipe(
      map(res => res.data || res)
    );
  }

  registrarBiometria(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/biometria/evaluacion`, data).pipe(
      map(res => res.data || res)
    );
  }

  // ALQUILER DE CANCHAS & SEDES (MÓDULO 08)
  getCanchas(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/canchas`).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
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
  getCatalogoTienda(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/tienda/catalogo`).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
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

  getPedidosTienda(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/tienda/pedidos`).pipe(
      map(res => res.data || res),
      catchError(() => of([]))
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
}

