import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export interface TenantRequest extends Request {
    clubId?: string;
    isSuperAdmin?: boolean;
}
export declare class TenantMiddleware implements NestMiddleware {
    use(req: TenantRequest, res: Response, next: NextFunction): void;
}
