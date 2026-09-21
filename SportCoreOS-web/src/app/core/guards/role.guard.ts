import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { NotificationService } from '../services/notification.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const profileService = inject(ProfileService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (profileService.hasRole(allowedRoles)) {
    return true;
  }

  notificationService.error(
    `No posees el perfil necesario para ingresar al módulo "${route.routeConfig?.path}".`,
    'Acceso Restringido'
  );

  router.navigate(['/dashboard']);
  return false;
};
