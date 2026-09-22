import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { TenantModulesRepository, TenantModuleRow } from './tenant-modules.repository';
import { SPORTCORE_MODULE_CATALOG, TenantModuleDefinition } from './tenant-module-catalog';
import { UpsertTenantModuleAccessDto, BulkUpdateTenantModulesDto } from './tenant-modules.dto';

@Injectable()
export class TenantModulesService {
  private readonly logger = new Logger(TenantModulesService.name);

  constructor(private readonly repo: TenantModulesRepository) {}

  getCatalog() {
    return SPORTCORE_MODULE_CATALOG;
  }

  async getClubsList() {
    return this.repo.findAllClubs();
  }

  async getClubModules(clubId: string) {
    const club = await this.repo.findClubById(clubId);
    if (!club) {
      throw new NotFoundException(`Club con ID ${clubId} no encontrado`);
    }

    const rows = await this.repo.findModulesByClub(clubId);
    const rowMap = new Map<string, TenantModuleRow>();
    rows.forEach((r) => rowMap.set(r.modulo_codigo.toUpperCase(), r));

    // Si algún módulo del catálogo aún no está en la base de datos para este club, aseguramos su registro
    const missingModules = SPORTCORE_MODULE_CATALOG.filter((m) => !rowMap.has(m.code));
    for (const m of missingModules) {
      const created = await this.repo.upsertModule(clubId, m.code, {
        habilitado: m.defaultEnabled,
        esIndefinido: m.defaultIndefinite,
      });
      rowMap.set(m.code, created);
    }

    const today = new Date().toISOString().slice(0, 10);

    const modules = SPORTCORE_MODULE_CATALOG.map((def) => {
      const row = rowMap.get(def.code);
      const enabled = row ? row.habilitado : def.defaultEnabled;
      const isIndefinite = row ? row.es_indefinido : def.defaultIndefinite;
      const startDate = row ? row.fecha_inicio : null;
      const endDate = row ? row.fecha_fin : null;

      let isActive = enabled;
      if (enabled && !isIndefinite) {
        if (startDate && startDate > today) isActive = false;
        if (endDate && endDate < today) isActive = false;
      }

      return {
        code: def.code,
        name: def.name,
        description: def.description,
        category: def.category,
        order: def.order,
        icon: def.icon,
        enabled,
        isIndefinite,
        startDate,
        endDate,
        isActive,
        updatedAt: row?.updated_at || null,
      };
    });

    return {
      club,
      modules,
      summary: {
        total: modules.length,
        activos: modules.filter((m) => m.isActive).length,
        inactivos: modules.filter((m) => !m.isActive).length,
      },
    };
  }

  async upsertClubModule(
    clubId: string,
    moduleCode: string,
    dto: UpsertTenantModuleAccessDto,
    userId?: string,
  ) {
    const code = moduleCode.trim().toUpperCase();
    const def = SPORTCORE_MODULE_CATALOG.find((m) => m.code === code);
    if (!def) {
      throw new BadRequestException(`El código de módulo '${code}' no es válido en el catálogo.`);
    }

    if (!dto.esIndefinido && dto.fechaInicio && dto.fechaFin && dto.fechaFin < dto.fechaInicio) {
      throw new BadRequestException('La fecha de fin no puede ser anterior a la fecha de inicio.');
    }

    const saved = await this.repo.upsertModule(clubId, code, dto, userId);
    return {
      code: def.code,
      name: def.name,
      enabled: saved.habilitado,
      isIndefinido: saved.es_indefinido,
      startDate: saved.fecha_inicio,
      endDate: saved.fecha_fin,
      updatedAt: saved.updated_at,
    };
  }

  async bulkUpdateClubModules(clubId: string, dto: BulkUpdateTenantModulesDto, userId?: string) {
    const enabledSet = new Set(dto.modulosHabilitados.map((c) => c.trim().toUpperCase()));

    for (const def of SPORTCORE_MODULE_CATALOG) {
      const isEnabled = enabledSet.has(def.code);
      await this.repo.upsertModule(
        clubId,
        def.code,
        {
          habilitado: isEnabled,
          esIndefinido: true,
        },
        userId,
      );
    }

    return this.getClubModules(clubId);
  }

  async isModuleActiveForClub(clubId: string, moduleCode: string): Promise<boolean> {
    const code = moduleCode.trim().toUpperCase();
    const clubData = await this.getClubModules(clubId);
    const mod = clubData.modules.find((m) => m.code === code);
    return !!mod?.isActive;
  }
}
