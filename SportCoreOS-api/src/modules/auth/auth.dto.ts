import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class LoginDto {
  @ApiProperty({ example: 'carlos.valderrama@sportcore.com', description: 'Correo del usuario' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'sportcore2026', description: 'Contraseña de acceso' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Carlos' })
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Valderrama' })
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({ example: 'carlos.valderrama@sportcore.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'sportcore2026' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: Role, default: Role.ENTRENADOR_DT })
  @IsOptional()
  @IsEnum(Role)
  rol?: Role;

  @ApiPropertyOptional({ example: 'uuid-club-123' })
  @IsOptional()
  @IsString()
  clubId?: string;

  @ApiPropertyOptional({ example: '+57 310 123 4567' })
  @IsOptional()
  @IsString()
  telefono?: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: 'Carlos Alberto' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Valderrama Palacio' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiPropertyOptional({ example: '+57 310 987 6543' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'sportcore2026' })
  @IsString()
  @IsNotEmpty()
  passwordActual: string;

  @ApiProperty({ example: 'nuevoPassword2026' })
  @IsString()
  @MinLength(6)
  passwordNuevo: string;
}
