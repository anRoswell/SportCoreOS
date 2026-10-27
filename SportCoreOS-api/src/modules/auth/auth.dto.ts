import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class LoginDto {
  @ApiProperty({ example: 'carlos.valderrama@sportcore.com', description: 'Correo del usuario' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'SportCore@2026', description: 'Contraseña de acceso' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: 'cap_abc123', description: 'Token de reto captcha' })
  @IsOptional()
  @IsString()
  captchaToken?: string;

  @ApiPropertyOptional({ example: '7X9KM', description: 'Respuesta ingresada por el usuario para el captcha' })
  @IsOptional()
  @IsString()
  captchaAnswer?: string;
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

  @ApiProperty({ example: 'SportCore@2026', description: 'Mínimo 8 caracteres, al menos 1 mayúscula y 1 carácter especial' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, {
    message: 'La contraseña debe contener al menos 8 caracteres, una letra mayúscula y un carácter especial',
  })
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

  @ApiProperty({ example: 'SportCore@2026', description: 'Mínimo 8 caracteres, al menos 1 mayúscula y 1 carácter especial' })
  @IsString()
  @MinLength(8, { message: 'La contraseña nueva debe tener mínimo 8 caracteres' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/, {
    message: 'La contraseña nueva debe contener al menos 8 caracteres, una letra mayúscula y un carácter especial',
  })
  passwordNuevo: string;
}
