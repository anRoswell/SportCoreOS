import { Injectable } from '@nestjs/common';
import { DashboardRepository, DashboardExecutiveKPIs } from './dashboard.repository';

export interface DashboardInitDataDto {
  kpis: DashboardExecutiveKPIs;
  categorias: any[];
  proximosPartidos: any[];
  pizarraTacticos: any[];
  ultimasTransacciones: any[];
  topBiometria: any[];
  clubLanding: any | null;
}

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepo: DashboardRepository) {}

  async getExecutiveKPIs(clubId: string): Promise<DashboardExecutiveKPIs> {
    const [jugCount, totalCategorias, proxPartidos, finanzasData, distribucionPosiciones] =
      await Promise.all([
        this.dashboardRepo.countJugadoresActivosYLesionados(clubId),
        this.dashboardRepo.countCategoriasActivas(clubId),
        this.dashboardRepo.findProximosPartidos(clubId, 5),
        this.dashboardRepo.findMetricasFinancieras(clubId),
        this.dashboardRepo.findDistribucionPosiciones(clubId),
      ]);

    const porcentajeRecaudo =
      finanzasData.facturado_mes > 0
        ? Math.round((finanzasData.recaudado_mes / finanzasData.facturado_mes) * 100)
        : 0;

    return {
      jugadoresActivos: jugCount.total_activos,
      jugadoresLesionados: jugCount.total_lesionados,
      totalCategorias,
      proximosPartidos: proxPartidos,
      finanzas: {
        facturadoMes: finanzasData.facturado_mes,
        recaudadoMes: finanzasData.recaudado_mes,
        carteraMora: finanzasData.cartera_mora,
        porcentajeRecaudo,
      },
      distribucionPosiciones,
    };
  }

  async getDashboardInitData(clubId: string): Promise<DashboardInitDataDto> {
    const [
      kpis,
      categorias,
      proximosPartidos,
      pizarraTacticos,
      ultimasTransacciones,
      topBiometria,
      clubLanding,
    ] = await Promise.all([
      this.getExecutiveKPIs(clubId),
      this.dashboardRepo.findCategoriasActivas(clubId),
      this.dashboardRepo.findProximosPartidos(clubId, 10),
      this.dashboardRepo.findJugadoresPizarra(clubId, 18),
      this.dashboardRepo.findUltimasTransacciones(clubId, 6),
      this.dashboardRepo.findTopBiometria(clubId, 3),
      this.dashboardRepo.findClubLanding(clubId),
    ]);

    return {
      kpis,
      categorias,
      proximosPartidos,
      pizarraTacticos,
      ultimasTransacciones,
      topBiometria,
      clubLanding,
    };
  }
}
