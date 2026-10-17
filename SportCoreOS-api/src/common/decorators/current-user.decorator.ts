import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return undefined;

    // Priorizar el tenant/club activo enviado en headers (X-Club-Id), request.clubId o query params
    const activeClubId =
      request.headers?.['x-club-id'] ||
      request.clubId ||
      request.query?.clubId ||
      user.clubId;

    if (activeClubId && typeof activeClubId === 'string' && activeClubId.trim()) {
      return {
        ...user,
        clubId: activeClubId.trim(),
      };
    }

    return user;
  },
);

