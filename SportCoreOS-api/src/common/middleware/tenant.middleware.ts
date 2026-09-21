import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  clubId?: string;
  isSuperAdmin?: boolean;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    const clubIdHeader = req.headers['x-club-id'] as string | undefined;

    if (clubIdHeader) {
      req.clubId = clubIdHeader.trim();
    }

    next();
  }
}
