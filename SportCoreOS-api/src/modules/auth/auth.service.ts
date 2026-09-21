import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { LoginDto, RegisterDto, UpdateProfileDto, ChangePasswordDto } from './auth.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.authRepository.findByEmailWithClub(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último acceso
    await this.authRepository.updateLastAccess(user.id);

    const payload = {
      sub: user.id,
      email: user.email,
      nombre: `${user.nombre} ${user.apellido}`,
      rol: user.rol,
      clubId: user.club_id,
      clubNombre: user.club_nombre,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        clubId: user.club_id,
        clubNombre: user.club_nombre,
        clubSlug: user.club_slug,
        clubLogo: user.club_logo,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.authRepository.findByEmailWithClub(dto.email);

    if (existing) {
      throw new ConflictException('Ya existe un usuario registrado con este correo electrónico');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const rol = dto.rol || Role.ENTRENADOR_DT;

    const newUser = await this.authRepository.createUser(
      {
        nombre: dto.nombre.trim(),
        apellido: dto.apellido.trim(),
        email: dto.email.toLowerCase().trim(),
        password_hash: passwordHash,
        rol,
        telefono: dto.telefono,
      },
      dto.clubId,
    );

    return {
      message: 'Usuario registrado exitosamente',
      user: newUser,
    };
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findByIdWithClub(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.authRepository.updateProfile(userId, {
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      telefono: dto.telefono,
      avatar: dto.avatar,
    });

    if (!updated) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      message: 'Perfil actualizado exitosamente',
      user: updated,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.authRepository.findByIdWithClub(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const isMatch = await bcrypt.compare(dto.passwordActual, user.password_hash);
    if (!isMatch) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const newHash = await bcrypt.hash(dto.passwordNuevo, 10);
    await this.authRepository.updatePassword(userId, newHash);

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }
}
