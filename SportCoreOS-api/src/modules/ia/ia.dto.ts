import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerarBoletinAlumnoDto {
  @ApiProperty({ description: 'ID único del jugador', example: 'e1e0691e-691e-4c92-9046-871955524534' })
  @IsString()
  @IsNotEmpty()
  jugador_id: string;

  @ApiPropertyOptional({ description: 'Mes del reporte (formato YYYY-MM)', example: '2026-03' })
  @IsString()
  @IsOptional()
  periodo?: string;

  @ApiPropertyOptional({ description: 'Enfoque especial para el boletín', example: 'Fase ofensiva y liderazgo' })
  @IsString()
  @IsOptional()
  enfoque_adicional?: string;
}

export class ChatTacticoDtDto {
  @ApiProperty({ description: 'Consulta o pregunta táctica del DT', example: '¿Qué formación y presión alta me recomiendas frente a un 4-3-3 con extremos rápidos?' })
  @IsString()
  @IsNotEmpty()
  consulta: string;

  @ApiPropertyOptional({ description: 'ID de la categoría a consultar', example: 'd1000000-0000-0000-0000-000000000001' })
  @IsUUID()
  @IsOptional()
  categoria_id?: string;

  @ApiPropertyOptional({ description: 'Sistema de juego base', example: '1-4-2-3-1' })
  @IsString()
  @IsOptional()
  sistema_base?: string;
}
