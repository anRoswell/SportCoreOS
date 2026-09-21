import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentClubId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.clubId || request.user?.clubId;
  },
);
