import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';

export interface JwtPayload {
  sub: string;
  email: string;
  nombre: string;
  rol: string;
  clubId?: string;
  clubNombre?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly db: DatabaseService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'SportCoreOS_SecretKey_QA_2026_UltraSecureJWT_Sectic',
    });
  }

  async validate(payload: JwtPayload) {
    const userResult = await this.db.query(
      `SELECT id, email, nombre, apellido, rol, activo
       FROM core.usuarios
       WHERE id = $1`,
      [payload.sub],
    );

    if (userResult.rows.length === 0) {
      throw new UnauthorizedException('Token inválido o usuario inexistente');
    }

    const user = userResult.rows[0];
    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      rol: user.rol,
      clubId: payload.clubId,
      clubNombre: payload.clubNombre,
    };
  }
}
