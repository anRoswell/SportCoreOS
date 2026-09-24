import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsNumber, IsEmail } from 'class-validator';

export enum TipoContenidoLanding {
  LANDING_PAGE = 'LANDING_PAGE',
  PROMO_HERO = 'PROMO_HERO',
  STORIES_REEL = 'STORIES_REEL',
  BANNER_TOP = 'BANNER_TOP',
  POPUP_MODAL = 'POPUP_MODAL',
}

export enum EstadoLanding {
  PUBLICADO = 'PUBLICADO',
  BORRADOR = 'BORRADOR',
  ARCHIVADO = 'ARCHIVADO',
}

export interface BloqueSeccionLanding {
  id: string;
  tipo: 'HERO' | 'STATS' | 'PROGRAMAS' | 'FIXTURE' | 'PLANES' | 'TESTIMONIOS' | 'LEAD_FORM' | 'FAQ' | 'FOOTER' | 'CUSTOM_HTML' | 'STORIES' | 'VIDEO_BANNER';
  titulo?: string;
  subtitulo?: string;
  orden: number;
  visible: boolean;
  datos: Record<string, any>;
}

export class CreateLandingDto {
  @IsEnum(TipoContenidoLanding)
  @IsOptional()
  tipo_contenido?: TipoContenidoLanding = TipoContenidoLanding.LANDING_PAGE;

  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsOptional()
  subtitulo?: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsEnum(EstadoLanding)
  @IsOptional()
  estado?: EstadoLanding = EstadoLanding.PUBLICADO;

  @IsString()
  @IsOptional()
  tema_color?: string = '#10b981';

  @IsString()
  @IsOptional()
  tema_gradient?: string = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

  @IsString()
  @IsOptional()
  tema_modo?: 'DARK' | 'LIGHT' = 'DARK';

  @IsString()
  @IsOptional()
  meta_descripcion?: string;

  @IsString()
  @IsOptional()
  meta_keywords?: string;

  @IsString()
  @IsOptional()
  meta_og_imagen?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsString()
  @IsOptional()
  boton_contacto_whatsapp?: string;

  @IsString()
  @IsOptional()
  email_notificaciones?: string;

  @IsOptional()
  configuracion_json?: Record<string, any>;

  @IsArray()
  @IsOptional()
  secciones_json?: BloqueSeccionLanding[];
}

export class UpdateLandingDto extends CreateLandingDto {}

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  nombre_completo!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @IsString()
  @IsOptional()
  nombre_deportista?: string;

  @IsNumber()
  @IsOptional()
  edad_deportista?: number;

  @IsString()
  @IsOptional()
  categoria_interes?: string;

  @IsString()
  @IsOptional()
  mensaje?: string;
}
