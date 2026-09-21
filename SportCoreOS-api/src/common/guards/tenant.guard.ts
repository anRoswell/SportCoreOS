import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../enums/role.enum';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestedClubId = request.clubId || request.headers['x-club-id'] || request.params.clubId || request.query.clubId;

    if (!user) {
      return true; // Si no hay usuario, el JwtAuthGuard se encargará
    }

    // SUPER_ADMIN tiene acceso a cualquier club
    if (user.rol === Role.SUPER_ADMIN) {
      return true;
    }

    // Si el endpoint requiere scope de club y el usuario intenta acceder a otro club
    if (requestedClubId && user.clubId && requestedClubId !== user.clubId) {
      throw new ForbiddenException(
        'Acceso multi-tenant denegado: No perteneces a la academia o club solicitado',
      );
    }

    return true;
  }
}
