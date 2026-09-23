import { IsNotEmpty, IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClubDto {
  @ApiProperty({ example: 'Club Atlético Bogotá FC', description: 'Nombre oficial de la escuela o club' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del club es obligatorio' })
  nombre: string;

  @ApiPropertyOptional({ example: 'club-atletico-bogota-fc', description: 'Slug único para URL' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ example: 'CABFC', description: 'Sigla o abreviatura del club (máx 10 caracteres)' })
  @IsString()
  @IsNotEmpty({ message: 'La sigla del club es obligatoria' })
  @MaxLength(10, { message: 'La sigla no puede exceder 10 caracteres' })
  sigla: string;

  @ApiPropertyOptional({ example: 'Bogotá D.C.', default: 'Bogotá D.C.' })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiPropertyOptional({ example: 'Colombia', default: 'Colombia' })
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Plan Élite Pro', default: 'Plan Élite Pro' })
  @IsOptional()
  @IsString()
  plan?: string;
}

export class UpdateClubDto {
  @ApiPropertyOptional({ example: 'Club Atlético Bogotá FC' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'CABFC' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  sigla?: string;

  @ApiPropertyOptional({ example: 'Bogotá D.C.' })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiPropertyOptional({ example: 'Colombia' })
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Plan Élite Pro' })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  activo?: boolean;
}

export class OnboardingClubDto {
  @ApiProperty({ example: 'Academia Leones de Oro FC', description: 'Nombre de la nueva academia de fútbol' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la academia es obligatorio' })
  clubNombre: string;

  @ApiProperty({ example: 'LDFC', description: 'Sigla o código corto de la academia' })
  @IsString()
  @IsNotEmpty({ message: 'La sigla es obligatoria' })
  @MaxLength(10)
  sigla: string;

  @ApiProperty({ example: 'Medellín', description: 'Ciudad sede principal' })
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  ciudad: string;

  @ApiPropertyOptional({ example: 'Colombia', default: 'Colombia' })
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  // Datos del Usuario Administrador / Director Deportivo Inicial
  @ApiProperty({ example: 'Andrés', description: 'Nombre del Director / Administrador' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del administrador es obligatorio' })
  adminNombre: string;

  @ApiProperty({ example: 'Escobar', description: 'Apellido del Director / Administrador' })
  @IsString()
  @IsNotEmpty({ message: 'El apellido del administrador es obligatorio' })
  adminApellido: string;

  @ApiProperty({ example: 'andres.escobar@sportcore.com', description: 'Correo para inicio de sesión' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo del administrador es obligatorio' })
  adminEmail: string;

  @ApiProperty({ example: 'sportcore2026', description: 'Contraseña para acceder a la plataforma' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  adminPassword: string;

  @ApiPropertyOptional({ example: '+57 311 987 6543' })
  @IsOptional()
  @IsString()
  adminTelefono?: string;
}
