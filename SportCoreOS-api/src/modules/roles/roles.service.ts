import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { SPORTCORE_ROLES, SPORTCORE_PERMISSION_TEMPLATE, SportCoreRole } from './roles.constants';
import { BulkUpdateRolePermissionsDto, UpdateSinglePermissionDto, AssignUserRoleDto } from './roles.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly repo: RolesRepository) {}

  getAvailableRoles() {
    return SPORTCORE_ROLES.map((role) => ({
      code: role,
      label: this.formatRoleLabel(role),
      description: this.getRoleDescription(role),
    }));
  }

  getPermissionTemplate() {
    return SPORTCORE_PERMISSION_TEMPLATE;
  }

  async getPermissionsMatrix(clubId: string, rol?: string) {
    const customRows = await this.repo.findPermissionsByClubAndRole(clubId, rol);
    const customMap = new Map<string, { permitido: boolean; nivel_acceso: string }>();

    customRows.forEach((r) => {
      customMap.set(`${r.rol}:${r.modulo}:${r.accion}`, {
        permitido: r.permitido,
        nivel_acceso: r.nivel_acceso,
      });
    });

    // Construir la matriz completa para todos los roles seleccionados
    const targetRoles = rol ? [rol as SportCoreRole] : [...SPORTCORE_ROLES];

    const matrix = SPORTCORE_PERMISSION_TEMPLATE.map((tpl) => {
      const roleMap: Record<string, { permitido: boolean; nivelAcceso: string }> = {};

      targetRoles.forEach((r) => {
        const custom = customMap.get(`${r}:${tpl.modulo}:${tpl.accion}`);
        if (custom) {
          roleMap[r] = {
            permitido: custom.permitido,
            nivelAcceso: custom.nivel_acceso,
          };
        } else {
          const defaultVal = tpl.roles[r];
          const permitido = !!defaultVal;
          const nivelAcceso = typeof defaultVal === 'string' ? defaultVal : permitido ? 'ALL' : 'NONE';
          roleMap[r] = {
            permitido,
            nivelAcceso,
          };
        }
      });

      return {
        modulo: tpl.modulo,
        accion: tpl.accion,
        descripcion: tpl.descripcion,
        roles: roleMap,
      };
    });

    return {
      roles: this.getAvailableRoles(),
      matrix,
    };
  }

  async updateRolePermissions(clubId: string, dto: BulkUpdateRolePermissionsDto) {
    const rol = dto.rol.toUpperCase();
    if (!SPORTCORE_ROLES.includes(rol as SportCoreRole)) {
      throw new BadRequestException(`El rol '${rol}' no es válido.`);
    }

    const saved: any[] = [];
    for (const p of dto.permisos) {
      const res = await this.repo.upsertPermission(
        clubId,
        rol,
        p.modulo.toUpperCase(),
        p.accion.toUpperCase(),
        p.permitido,
        p.nivelAcceso || (p.permitido ? 'ALL' : 'NONE'),
      );
      saved.push(res);
    }

    return {
      rol,
      totalActualizados: saved.length,
      permisos: saved,
    };
  }

  async updateSinglePermission(clubId: string, rol: string, dto: UpdateSinglePermissionDto) {
    const r = rol.toUpperCase();
    if (!SPORTCORE_ROLES.includes(r as SportCoreRole)) {
      throw new BadRequestException(`El rol '${r}' no es válido.`);
    }

    const res = await this.repo.upsertPermission(
      clubId,
      r,
      dto.modulo.toUpperCase(),
      dto.accion.toUpperCase(),
      dto.permitido,
      dto.nivelAcceso || (dto.permitido ? 'ALL' : 'NONE'),
    );

    return res;
  }

  async resetRolePermissions(clubId: string, rol?: string) {
    await this.repo.resetRolePermissionsToTemplate(clubId, rol);
    return {
      success: true,
      message: rol
        ? `Permisos del rol '${rol}' restablecidos a los valores predeterminados.`
        : 'Todos los permisos de la escuela han sido restablecidos.',
    };
  }

  async getUsers(clubId: string) {
    return this.repo.findUsersWithRoles(clubId);
  }

  async assignUserRole(clubId: string, dto: AssignUserRoleDto) {
    const rol = dto.rol.toUpperCase();
    if (!SPORTCORE_ROLES.includes(rol as SportCoreRole)) {
      throw new BadRequestException(`El rol '${rol}' no es válido.`);
    }

    const updated = await this.repo.updateUserClubRole(clubId, dto.usuarioId, rol);
    if (!updated) {
      throw new NotFoundException('Membresía del usuario no encontrada en el club.');
    }

    return {
      success: true,
      usuarioId: dto.usuarioId,
      nuevoRol: rol,
    };
  }

  private formatRoleLabel(role: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'Super Administrador',
      DIRECTOR_DEPORTIVO: 'Director Deportivo / Gerente',
      ENTRENADOR_DT: 'Director Técnico (DT)',
      PREPARADOR_FISICO: 'Preparador Físico (PF)',
      MEDICO_FISIO: 'Médico / Fisioterapeuta',
      ADMIN_FINANCIERO: 'Contador / Tesorero',
      RECEPCION_LOGISTICA: 'Recepción & Logística Canchas',
      PADRE_ACUDIENTE: 'Padre / Acudiente Familiar',
      JUGADOR: 'Jugador / Futbolista',
    };
    return map[role] || role;
  }

  private getRoleDescription(role: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'Control total sobre todos los módulos, escuelas, finanzas y configuraciones.',
      DIRECTOR_DEPORTIVO: 'Gestión técnica deportiva, categorías, entrenadores, scouting y reportes globales.',
      ENTRENADOR_DT: 'Gestión de convocatorias, actas de partidos, valoraciones y entrenamientos.',
      PREPARADOR_FISICO: 'Control de cargas de entrenamiento, telemetría GPS, ACWR y tests físicos.',
      MEDICO_FISIO: 'Historial médico, evaluaciones antropométricas, bioimpedancia y aptitud física.',
      ADMIN_FINANCIERO: 'Control de matrículas, pensiones, pagos en caja, compras en tienda y becas.',
      RECEPCION_LOGISTICA: 'Control de canchas sintéticas, reservas, alquileres y venta de uniformes.',
      PADRE_ACUDIENTE: 'Consulta de evolución del hijo, confirmación de convocatorias y pagos.',
      JUGADOR: 'Ficha propia, citaciones a partidos, estadísticas de juego y telemetría personal.',
    };
    return map[role] || '';
  }
}
