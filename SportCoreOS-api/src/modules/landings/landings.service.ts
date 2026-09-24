import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LandingsRepository, LandingPageEntity, LandingLeadEntity } from './landings.repository';
import { CreateLandingDto, UpdateLandingDto, CreateLeadDto } from './landings.dto';

@Injectable()
export class LandingsService {
  constructor(private readonly repo: LandingsRepository) {}

  async getLandings(clubId?: string, tipo?: string, estado?: string): Promise<{ items: LandingPageEntity[]; resumen: Record<string, number> }> {
    const items = await this.repo.findAll(clubId, tipo, estado);
    const total = items.length;
    const publicadas = items.filter(i => i.estado === 'PUBLICADO').length;
    const borradores = items.filter(i => i.estado === 'BORRADOR').length;
    const totalVistas = items.reduce((sum, i) => sum + (i.vistas_count || 0), 0);
    const totalLeads = items.reduce((sum, i) => sum + (i.leads_count || 0), 0);

    return {
      items,
      resumen: {
        total,
        publicadas,
        borradores,
        totalVistas,
        totalLeads,
        conversionRate: totalVistas > 0 ? parseFloat(((totalLeads / totalVistas) * 100).toFixed(1)) : 0,
      },
    };
  }

  async getLandingById(id: string): Promise<LandingPageEntity> {
    const landing = await this.repo.findById(id);
    if (!landing) {
      throw new NotFoundException(`Landing o experiencia de contenido con ID ${id} no encontrada`);
    }
    return landing;
  }

  async getPublicLandingBySlug(slug: string): Promise<LandingPageEntity> {
    const landing = await this.repo.findBySlug(slug, true);
    if (!landing) {
      throw new NotFoundException(`La página o contenido '${slug}' no existe o fue despublicado.`);
    }
    return landing;
  }

  async createLanding(dto: CreateLandingDto, clubId?: string): Promise<LandingPageEntity> {
    const existing = await this.repo.findBySlug(dto.slug);
    if (existing) {
      dto.slug = `${dto.slug}-${Math.floor(Math.random() * 1000)}`;
    }
    return this.repo.create(dto, clubId);
  }

  async updateLanding(id: string, dto: UpdateLandingDto): Promise<LandingPageEntity> {
    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`Landing con ID ${id} no encontrada`);
    }
    return updated;
  }

  async toggleEstado(id: string): Promise<LandingPageEntity> {
    const toggled = await this.repo.toggleEstado(id);
    if (!toggled) {
      throw new NotFoundException(`Landing con ID ${id} no encontrada`);
    }
    return toggled;
  }

  async duplicateLanding(id: string): Promise<LandingPageEntity> {
    const original = await this.getLandingById(id);
    const newSlug = `${original.slug}-copia-${Date.now().toString().slice(-4)}`;
    const duplicateDto: CreateLandingDto = {
      tipo_contenido: original.tipo_contenido as any,
      titulo: `${original.titulo} (Copia)`,
      subtitulo: original.subtitulo,
      slug: newSlug,
      estado: 'BORRADOR' as any,
      tema_color: original.tema_color,
      tema_gradient: original.tema_gradient,
      tema_modo: original.tema_modo as any,
      meta_descripcion: original.meta_descripcion,
      meta_keywords: original.meta_keywords,
      meta_og_imagen: original.meta_og_imagen,
      logo_url: original.logo_url,
      boton_contacto_whatsapp: original.boton_contacto_whatsapp,
      email_notificaciones: original.email_notificaciones,
      configuracion_json: original.configuracion_json,
      secciones_json: original.secciones_json,
    };
    return this.repo.create(duplicateDto, original.club_id || undefined);
  }

  async deleteLanding(id: string): Promise<{ success: boolean; message: string }> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Landing con ID ${id} no encontrada`);
    }
    return { success: true, message: 'Landing eliminada correctamente.' };
  }

  async registerLead(slug: string, dto: CreateLeadDto, ip?: string): Promise<LandingLeadEntity> {
    const landing = await this.repo.findBySlug(slug, false);
    if (!landing) {
      throw new NotFoundException(`Página con slug '${slug}' no encontrada.`);
    }
    return this.repo.registerLead(landing.id, dto, ip);
  }

  async getLeadsByLanding(id: string): Promise<LandingLeadEntity[]> {
    await this.getLandingById(id);
    return this.repo.getLeadsByLanding(id);
  }
}
