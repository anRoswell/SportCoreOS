import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación no proporcionado (Bearer requerido)');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'FutCoreOS_Super_Secret_Jwt_Key_2026_SECTIC_SAS',
      });
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Token JWT inválido o expirado');
    }
  }
}
