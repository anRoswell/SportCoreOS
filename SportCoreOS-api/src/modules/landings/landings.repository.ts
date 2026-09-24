import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateLandingDto, UpdateLandingDto, CreateLeadDto, TipoContenidoLanding, EstadoLanding } from './landings.dto';

export interface LandingPageEntity {
  id: string;
  club_id: string | null;
  tipo_contenido: string;
  titulo: string;
  subtitulo: string;
  slug: string;
  estado: string;
  tema_color: string;
  tema_gradient: string;
  tema_modo: string;
  meta_descripcion: string;
  meta_keywords: string;
  meta_og_imagen: string;
  logo_url: string;
  boton_contacto_whatsapp: string;
  email_notificaciones: string;
  vistas_count: number;
  leads_count: number;
  configuracion_json: Record<string, any>;
  secciones_json: any[];
  created_at: Date;
  updated_at: Date;
}

export interface LandingLeadEntity {
  id: string;
  landing_id: string;
  club_id: string | null;
  nombre_completo: string;
  email: string;
  telefono: string;
  nombre_deportista?: string;
  edad_deportista?: number;
  categoria_interes?: string;
  mensaje?: string;
  estado: string;
  ip_origen?: string;
  created_at: Date;
}

@Injectable()
export class LandingsRepository {
  private readonly logger = new Logger(LandingsRepository.name);
  private memoryLandings: LandingPageEntity[] = [];
  private memoryLeads: LandingLeadEntity[] = [];

  constructor(private readonly db: DatabaseService) {
    this.seedDefaultLandings();
  }

  async findAll(clubId?: string, tipo?: string, estado?: string): Promise<LandingPageEntity[]> {
    try {
      let query = `
        SELECT * FROM core.landing_pages 
        WHERE 1=1
      `;
      const params: any[] = [];

      if (clubId) {
        params.push(clubId);
        query += ` AND (club_id = $${params.length} OR club_id IS NULL)`;
      }
      if (tipo && tipo !== 'TODOS') {
        params.push(tipo);
        query += ` AND tipo_contenido = $${params.length}`;
      }
      if (estado && estado !== 'TODOS') {
        params.push(estado);
        query += ` AND estado = $${params.length}`;
      }

      query += ` ORDER BY updated_at DESC`;
      const res = await this.db.query<LandingPageEntity>(query, params);
      
      if (res.rows.length === 0 && (!tipo || tipo === 'TODOS') && (!estado || estado === 'TODOS')) {
        // Seed default templates into PostgreSQL for immediate availability
        for (const item of this.memoryLandings) {
          try {
            await this.db.query(
              `INSERT INTO core.landing_pages (
                id, club_id, tipo_contenido, titulo, subtitulo, slug, estado,
                tema_color, tema_gradient, tema_modo, meta_descripcion, meta_keywords,
                meta_og_imagen, logo_url, boton_contacto_whatsapp, email_notificaciones,
                vistas_count, leads_count, configuracion_json, secciones_json
              ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
              ON CONFLICT (slug) DO NOTHING`,
              [
                item.id,
                clubId || item.club_id,
                item.tipo_contenido,
                item.titulo,
                item.subtitulo,
                item.slug,
                item.estado,
                item.tema_color,
                item.tema_gradient,
                item.tema_modo,
                item.meta_descripcion,
                item.meta_keywords,
                item.meta_og_imagen,
                item.logo_url,
                item.boton_contacto_whatsapp,
                item.email_notificaciones,
                item.vistas_count,
                item.leads_count,
                JSON.stringify(item.configuracion_json || {}),
                JSON.stringify(item.secciones_json || []),
              ]
            );
          } catch (insertErr) {
            // Ignore seed conflict
          }
        }
        const seededRes = await this.db.query<LandingPageEntity>(query, params);
        if (seededRes.rows.length > 0) {
          return seededRes.rows;
        }
      }

      return res.rows.length > 0 ? res.rows : this.memoryLandings;
    } catch (e: any) {
      this.logger.warn(`Postgres error en findAll landings (${e.message}), usando memoria.`);
      return this.memoryLandings.filter(l => {
        if (clubId && l.club_id && l.club_id !== clubId) return false;
        if (tipo && tipo !== 'TODOS' && l.tipo_contenido !== tipo) return false;
        if (estado && estado !== 'TODOS' && l.estado !== estado) return false;
        return true;
      });
    }
  }

  async findById(id: string): Promise<LandingPageEntity | null> {
    try {
      const res = await this.db.query<LandingPageEntity>(
        `SELECT * FROM core.landing_pages WHERE id = $1 LIMIT 1`,
        [id]
      );
      return res.rows[0] || null;
    } catch (e: any) {
      return this.memoryLandings.find(l => l.id === id) || null;
    }
  }

  async findBySlug(slug: string, incrementViews = false): Promise<LandingPageEntity | null> {
    const cleanSlug = (slug || '').trim().toLowerCase();
    try {
      if (incrementViews) {
        await this.db.query(
          `UPDATE core.landing_pages SET vistas_count = vistas_count + 1, updated_at = updated_at WHERE LOWER(slug) = $1`,
          [cleanSlug]
        );
      }
      const res = await this.db.query<LandingPageEntity>(
        `SELECT * FROM core.landing_pages WHERE LOWER(slug) = $1 LIMIT 1`,
        [cleanSlug]
      );
      if (res.rows[0]) {
        return res.rows[0];
      }
      return this.memoryLandings.find(l => l.slug.toLowerCase() === cleanSlug) || null;
    } catch (e: any) {
      const item = this.memoryLandings.find(l => l.slug.toLowerCase() === cleanSlug) || null;
      if (item && incrementViews) {
        item.vistas_count++;
      }
      return item;
    }
  }

  async create(dto: CreateLandingDto, clubId?: string): Promise<LandingPageEntity> {
    const id = `l-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date();

    try {
      const res = await this.db.query<LandingPageEntity>(
        `INSERT INTO core.landing_pages (
          club_id, tipo_contenido, titulo, subtitulo, slug, estado,
          tema_color, tema_gradient, tema_modo, meta_descripcion,
          meta_keywords, meta_og_imagen, logo_url, boton_contacto_whatsapp,
          email_notificaciones, vistas_count, leads_count, configuracion_json, secciones_json,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 0, 0, $16, $17, $18, $19
        ) RETURNING *`,
        [
          clubId || null,
          dto.tipo_contenido || TipoContenidoLanding.LANDING_PAGE,
          dto.titulo,
          dto.subtitulo || '',
          dto.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
          dto.estado || EstadoLanding.PUBLICADO,
          dto.tema_color || '#10b981',
          dto.tema_gradient || 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          dto.tema_modo || 'DARK',
          dto.meta_descripcion || '',
          dto.meta_keywords || '',
          dto.meta_og_imagen || '',
          dto.logo_url || '',
          dto.boton_contacto_whatsapp || '+573001234567',
          dto.email_notificaciones || 'admisiones@sportcore.com',
          JSON.stringify(dto.configuracion_json || {}),
          JSON.stringify(dto.secciones_json || []),
          now,
          now,
        ]
      );
      return res.rows[0];
    } catch (e: any) {
      this.logger.warn(`Postgres insert error (${e.message}), guardando en memoria.`);
      const item: LandingPageEntity = {
        id,
        club_id: clubId || null,
        tipo_contenido: dto.tipo_contenido || TipoContenidoLanding.LANDING_PAGE,
        titulo: dto.titulo,
        subtitulo: dto.subtitulo || '',
        slug: dto.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
        estado: dto.estado || EstadoLanding.PUBLICADO,
        tema_color: dto.tema_color || '#10b981',
        tema_gradient: dto.tema_gradient || 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        tema_modo: dto.tema_modo || 'DARK',
        meta_descripcion: dto.meta_descripcion || '',
        meta_keywords: dto.meta_keywords || '',
        meta_og_imagen: dto.meta_og_imagen || '',
        logo_url: dto.logo_url || '',
        boton_contacto_whatsapp: dto.boton_contacto_whatsapp || '+573001234567',
        email_notificaciones: dto.email_notificaciones || 'admisiones@sportcore.com',
        vistas_count: 0,
        leads_count: 0,
        configuracion_json: dto.configuracion_json || {},
        secciones_json: dto.secciones_json || [],
        created_at: now,
        updated_at: now,
      };
      this.memoryLandings.unshift(item);
      return item;
    }
  }

  async update(id: string, dto: UpdateLandingDto): Promise<LandingPageEntity | null> {
    const now = new Date();
    try {
      const res = await this.db.query<LandingPageEntity>(
        `UPDATE core.landing_pages SET
          tipo_contenido = COALESCE($1, tipo_contenido),
          titulo = COALESCE($2, titulo),
          subtitulo = COALESCE($3, subtitulo),
          slug = COALESCE($4, slug),
          estado = COALESCE($5, estado),
          tema_color = COALESCE($6, tema_color),
          tema_gradient = COALESCE($7, tema_gradient),
          tema_modo = COALESCE($8, tema_modo),
          meta_descripcion = COALESCE($9, meta_descripcion),
          meta_keywords = COALESCE($10, meta_keywords),
          meta_og_imagen = COALESCE($11, meta_og_imagen),
          logo_url = COALESCE($12, logo_url),
          boton_contacto_whatsapp = COALESCE($13, boton_contacto_whatsapp),
          email_notificaciones = COALESCE($14, email_notificaciones),
          configuracion_json = COALESCE($15, configuracion_json),
          secciones_json = COALESCE($16, secciones_json),
          updated_at = $17
        WHERE id = $18 RETURNING *`,
        [
          dto.tipo_contenido,
          dto.titulo,
          dto.subtitulo,
          dto.slug ? dto.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-') : undefined,
          dto.estado,
          dto.tema_color,
          dto.tema_gradient,
          dto.tema_modo,
          dto.meta_descripcion,
          dto.meta_keywords,
          dto.meta_og_imagen,
          dto.logo_url,
          dto.boton_contacto_whatsapp,
          dto.email_notificaciones,
          dto.configuracion_json ? JSON.stringify(dto.configuracion_json) : undefined,
          dto.secciones_json ? JSON.stringify(dto.secciones_json) : undefined,
          now,
          id,
        ]
      );
      return res.rows[0] || null;
    } catch (e: any) {
      const item = this.memoryLandings.find(l => l.id === id);
      if (!item) return null;
      Object.assign(item, {
        ...dto,
        slug: dto.slug ? dto.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-') : item.slug,
        updated_at: now,
      });
      return item;
    }
  }

  async toggleEstado(id: string): Promise<LandingPageEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const nuevoEstado = existing.estado === EstadoLanding.PUBLICADO ? EstadoLanding.BORRADOR : EstadoLanding.PUBLICADO;
    return this.update(id, {
      ...existing,
      tipo_contenido: existing.tipo_contenido as any,
      tema_modo: existing.tema_modo as any,
      estado: nuevoEstado as any,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      const res = await this.db.query(`DELETE FROM core.landing_pages WHERE id = $1`, [id]);
      return (res.rowCount || 0) > 0;
    } catch (e: any) {
      const idx = this.memoryLandings.findIndex(l => l.id === id);
      if (idx >= 0) {
        this.memoryLandings.splice(idx, 1);
        return true;
      }
      return false;
    }
  }

  async registerLead(landingId: string, dto: CreateLeadDto, ip?: string): Promise<LandingLeadEntity> {
    const leadId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date();

    try {
      await this.db.query(
        `UPDATE core.landing_pages SET leads_count = leads_count + 1 WHERE id = $1`,
        [landingId]
      );

      const res = await this.db.query<LandingLeadEntity>(
        `INSERT INTO core.landing_leads (
          landing_id, nombre_completo, email, telefono, nombre_deportista,
          edad_deportista, categoria_interes, mensaje, estado, ip_origen, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'NUEVO', $9, $10) RETURNING *`,
        [
          landingId,
          dto.nombre_completo,
          dto.email,
          dto.telefono,
          dto.nombre_deportista || null,
          dto.edad_deportista || null,
          dto.categoria_interes || null,
          dto.mensaje || null,
          ip || '127.0.0.1',
          now,
        ]
      );
      return res.rows[0];
    } catch (e: any) {
      const landing = this.memoryLandings.find(l => l.id === landingId);
      if (landing) landing.leads_count++;

      const lead: LandingLeadEntity = {
        id: leadId,
        landing_id: landingId,
        club_id: landing?.club_id || null,
        nombre_completo: dto.nombre_completo,
        email: dto.email,
        telefono: dto.telefono,
        nombre_deportista: dto.nombre_deportista,
        edad_deportista: dto.edad_deportista,
        categoria_interes: dto.categoria_interes,
        mensaje: dto.mensaje,
        estado: 'NUEVO',
        ip_origen: ip || '127.0.0.1',
        created_at: now,
      };
      this.memoryLeads.unshift(lead);
      return lead;
    }
  }

  async getLeadsByLanding(landingId: string): Promise<LandingLeadEntity[]> {
    try {
      const res = await this.db.query<LandingLeadEntity>(
        `SELECT * FROM core.landing_leads WHERE landing_id = $1 ORDER BY created_at DESC`,
        [landingId]
      );
      if (res.rows.length > 0) {
        return res.rows;
      }
      const mem = this.memoryLeads.filter(l => l.landing_id === landingId);
      if (mem.length > 0) {
        for (const ml of mem) {
          try {
            await this.db.query(
              `INSERT INTO core.landing_leads (
                id, landing_id, club_id, nombre_completo, email, telefono,
                nombre_deportista, edad_deportista, categoria_interes, mensaje, estado, ip_origen, created_at
              ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT DO NOTHING`,
              [
                ml.id, ml.landing_id, ml.club_id, ml.nombre_completo, ml.email, ml.telefono,
                ml.nombre_deportista, ml.edad_deportista, ml.categoria_interes, ml.mensaje, ml.estado, ml.ip_origen, ml.created_at
              ]
            );
          } catch (e) {}
        }
        const refreshed = await this.db.query<LandingLeadEntity>(
          `SELECT * FROM core.landing_leads WHERE landing_id = $1 ORDER BY created_at DESC`,
          [landingId]
        );
        return refreshed.rows.length > 0 ? refreshed.rows : mem;
      }
      return [];
    } catch (e: any) {
      return this.memoryLeads.filter(l => l.landing_id === landingId);
    }
  }

  // ===========================================================================
  // SEED DE PLANTILLAS OFICIALES DE LANDING & EXPERIENCIAS DE BIENVENIDA
  // ===========================================================================
  private seedDefaultLandings() {
    this.memoryLeads = [
      {
        id: '30000000-0000-0000-0000-000000000001',
        landing_id: '20000000-0000-0000-0000-000000000001',
        club_id: null,
        nombre_completo: 'Carlos Eduardo Montoya',
        email: 'carlos.montoya@ejemplo.com',
        telefono: '+573105559876',
        nombre_deportista: 'Santiago Montoya',
        edad_deportista: 10,
        categoria_interes: 'Sub-11 Formativa Avanzada',
        mensaje: 'Tiene 2 años de experiencia como volante creativo. Queremos iniciar la próxima semana.',
        estado: 'NUEVO',
        ip_origen: '186.84.90.12',
        created_at: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: '30000000-0000-0000-0000-000000000002',
        landing_id: '20000000-0000-0000-0000-000000000002',
        club_id: null,
        nombre_completo: 'Mariana Restrepo Gómez',
        email: 'mariana.restrepo@outlook.com',
        telefono: '+573004441122',
        nombre_deportista: 'Lucas Restrepo',
        edad_deportista: 14,
        categoria_interes: 'Clínica Neuro-Fútbol',
        mensaje: 'Interesados en el campamento intensivo de reacción y sensores Fitlight.',
        estado: 'CONTACTADO',
        ip_origen: '190.27.14.88',
        created_at: new Date(Date.now() - 3600000 * 24),
      },
      {
        id: '30000000-0000-0000-0000-000000000003',
        landing_id: '20000000-0000-0000-0000-000000000001',
        club_id: null,
        nombre_completo: 'Javier Enrique Pineda',
        email: 'javier.pineda@gmail.com',
        telefono: '+573183337788',
        nombre_deportista: 'Samuel Pineda',
        edad_deportista: 7,
        categoria_interes: 'Iniciación Sub-7',
        mensaje: 'Deseamos información sobre el transporte y uniforme de entrenamiento.',
        estado: 'CONVERTIDO',
        ip_origen: '181.54.120.4',
        created_at: new Date(Date.now() - 3600000 * 48),
      },
    ];
    this.memoryLandings = [
      {
        id: '20000000-0000-0000-0000-000000000001',
        club_id: null,
        tipo_contenido: TipoContenidoLanding.LANDING_PAGE,
        titulo: 'Academia Élite Fútbol 2026 — Formación & Alto Rendimiento',
        subtitulo: 'Desarrolla el máximo potencial deportivo de tu hijo con metodología europea, biometría con IA y visores profesionales.',
        slug: 'academia-elite-2026',
        estado: EstadoLanding.PUBLICADO,
        tema_color: '#10b981',
        tema_gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        tema_modo: 'DARK',
        meta_descripcion: 'Inscripciones abiertas para canteras formativas desde Sub-7 hasta Sub-20. Canchas sintéticas, preparación física y carnet digital.',
        meta_keywords: 'futbol, academia, inscripciones, bogota, formacion, cantera',
        meta_og_imagen: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&auto=format&fit=crop&q=80',
        logo_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80',
        boton_contacto_whatsapp: '+573104445555',
        email_notificaciones: 'admisiones@futuroscracksfc.com',
        vistas_count: 1420,
        leads_count: 86,
        configuracion_json: {
          navbar_logo: 'SportCoreOS FCFC',
          navbar_cta: '¡Inscríbete Ahora! ⚡',
          show_whatsapp_float: true,
        },
        secciones_json: [
          {
            id: 'sec-hero-1',
            tipo: 'HERO',
            titulo: 'El Camino del Futuro Crack Comienza Aquí ⚽',
            subtitulo: 'Entrenamiento táctico, seguimiento biométrico con IA y carnet digital oficial para cada deportista.',
            orden: 1,
            visible: true,
            datos: {
              badge: '🏆 Convocatorias 2026 Abiertas',
              cta_primary_text: 'Solicitar Prueba de Nivel',
              cta_primary_url: '#formulario-inscripcion',
              cta_secondary_text: 'Ver Categorías & Sedes',
              cta_secondary_url: '#programas',
              video_bg_url: '',
              banner_image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1000&auto=format&fit=crop&q=80',
            },
          },
          {
            id: 'sec-stats-1',
            tipo: 'STATS',
            titulo: 'Cifras que Respaldan Nuestra Cantera',
            subtitulo: 'Más de 10 años formando campeones dentro y fuera de la cancha.',
            orden: 2,
            visible: true,
            datos: {
              stats: [
                { numero: '450+', label: 'Deportistas Activos' },
                { numero: '18', label: 'Títulos Distritales' },
                { numero: '100%', label: 'DTs Licenciados UEFA/CONMEBOL' },
                { numero: '24', label: 'Becados en Alto Rendimiento' },
              ],
            },
          },
          {
            id: 'sec-prog-1',
            tipo: 'PROGRAMAS',
            titulo: 'Programas de Formación Deportiva',
            subtitulo: 'Categorías estructuradas por edades y niveles de alta competencia.',
            orden: 3,
            visible: true,
            datos: {
              programas: [
                {
                  nombre: 'Semillero Inicial (Sub-7 a Sub-11)',
                  descripcion: 'Desarrollo motriz, fundamentos de pase y diversión con enfoque táctico dinámico.',
                  horario: 'Sábados & Domingos 8:00 AM',
                  icono: 'fa-solid fa-child',
                  color: '#10b981',
                },
                {
                  nombre: 'Cantera Competitiva (Sub-13 a Sub-15)',
                  descripcion: 'Táctica aplicada, biometría periódica, microciclos y participación en torneos federados.',
                  horario: 'Mar - Jue 4:00 PM & Sáb 10:00 AM',
                  icono: 'fa-solid fa-bolt',
                  color: '#3b82f6',
                },
                {
                  nombre: 'Élite Alto Rendimiento (Sub-17 & Sub-20)',
                  descripcion: 'Proyección profesional, scouting con IA, GPS de rendimiento y preparación física avanzada.',
                  horario: 'Lunes a Viernes 5:00 PM',
                  icono: 'fa-solid fa-trophy',
                  color: '#f59e0b',
                },
              ],
            },
          },
          {
            id: 'sec-planes-1',
            tipo: 'PLANES',
            titulo: 'Planes de Inscripción & Mensualidad',
            subtitulo: 'Transparencia financiera, pasarela PSE integrada y paz y salvo instantáneo.',
            orden: 4,
            visible: true,
            datos: {
              planes: [
                {
                  nombre: 'Plan Formativo Base',
                  precio: '$180,000 COP',
                  periodo: '/mes',
                  destacado: false,
                  beneficios: ['2 Sesiones de Entrenamiento / Sem', 'Participación en Torneos Locales', 'Carnet Digital Básico', 'Seguro Médico de Cancha'],
                  cta_text: 'Inscribir Deportista',
                },
                {
                  nombre: 'Plan Élite Competitivo',
                  precio: '$260,000 COP',
                  periodo: '/mes',
                  destacado: true,
                  badge: 'MÁS ELEGIDO',
                  beneficios: ['3 a 4 Sesiones + Gimnasio', 'Kit Oficial Titular + Alterno', 'Evaluación Biométrica con IA', 'Carta FUT Digital con Atributos', 'Visorías con Scouts Pro'],
                  cta_text: '¡Empezar Ahora! ⚡',
                },
              ],
            },
          },
          {
            id: 'sec-lead-1',
            tipo: 'LEAD_FORM',
            titulo: 'Agenda una Clase de Prueba Gratuita ⚽',
            subtitulo: 'Déjanos tus datos y nuestro director deportivo te contactará por WhatsApp para coordinar la evaluación técnica.',
            orden: 5,
            visible: true,
            datos: {
              cta_button_text: 'Enviar Solicitud de Ingreso 🚀',
              success_message: '¡Gracias! Hemos recibido tus datos. Nos comunicaremos contigo en menos de 2 horas.',
            },
          },
        ],
        created_at: new Date('2026-01-15'),
        updated_at: new Date(),
      },
      {
        id: '20000000-0000-0000-0000-000000000002',
        club_id: null,
        tipo_contenido: TipoContenidoLanding.PROMO_HERO,
        titulo: 'Clínica de Neuro-Fútbol & Agilidad Fitlight',
        subtitulo: 'Campamento intensivo de velocidad de reacción, toma de decisiones bajo presión y sensores láser de campo.',
        slug: 'clinica-neurofutbol-2026',
        estado: EstadoLanding.PUBLICADO,
        tema_color: '#3b82f6',
        tema_gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        tema_modo: 'DARK',
        meta_descripcion: 'Mejora tu visión periférica y velocidad de respuesta con luces Fitlight.',
        meta_keywords: 'neurofutbol, fitlight, agilidad, clinica futbol',
        meta_og_imagen: '',
        logo_url: '',
        boton_contacto_whatsapp: '+573201112233',
        email_notificaciones: 'clinicas@sportcore.com',
        vistas_count: 830,
        leads_count: 42,
        configuracion_json: {},
        secciones_json: [
          {
            id: 'sec-hero-2',
            tipo: 'HERO',
            titulo: 'Entrena tu Mente a la Velocidad de la Élite ⚡',
            subtitulo: 'Sensores lumínicos, coordinación visual-motora y toma de decisiones en fracciones de segundo.',
            orden: 1,
            visible: true,
            datos: {
              badge: '🧠 Clínica Exclusiva • Cupos Limitados',
              cta_primary_text: 'Reservar Mi Cupo',
              cta_primary_url: '#formulario-inscripcion',
              banner_image: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=1000&auto=format&fit=crop&q=80',
            },
          },
          {
            id: 'sec-lead-2',
            tipo: 'LEAD_FORM',
            titulo: 'Reserva tu Lugar para la Clínica',
            subtitulo: 'Completa el formulario para recibir el calendario de microciclos y requisitos.',
            orden: 2,
            visible: true,
            datos: {
              cta_button_text: 'Confirmar Pre-Reserva',
            },
          },
        ],
        created_at: new Date('2026-02-01'),
        updated_at: new Date(),
      },
      {
        id: '20000000-0000-0000-0000-000000000003',
        club_id: null,
        tipo_contenido: TipoContenidoLanding.STORIES_REEL,
        titulo: 'Reels & Stories: Vida Deportiva en la Cantera',
        subtitulo: 'Microvideos y momentos destacados de goles, entrenamientos de arqueros y premiaciones.',
        slug: 'historias-cantera-fcfc',
        estado: EstadoLanding.PUBLICADO,
        tema_color: '#f59e0b',
        tema_gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        tema_modo: 'DARK',
        meta_descripcion: 'Conoce el día a día de nuestros deportistas.',
        meta_keywords: 'stories, goles, entrenamientos',
        meta_og_imagen: '',
        logo_url: '',
        boton_contacto_whatsapp: '+573157776666',
        email_notificaciones: 'comunicaciones@sportcore.com',
        vistas_count: 2100,
        leads_count: 115,
        configuracion_json: {},
        secciones_json: [
          {
            id: 'sec-stories-1',
            tipo: 'STORIES',
            titulo: 'Momentos Destacados de la Semana 🌟',
            subtitulo: 'Desliza para ver los mejores tiros libres, atajadas y celebraciones del fin de semana.',
            orden: 1,
            visible: true,
            datos: {
              stories: [
                {
                  autor: 'Sub-15 Élite',
                  titulo: 'Golazo de Tiro Libre al ángulo en la Final',
                  media_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80',
                  categoria: 'Partido Oficial',
                },
                {
                  autor: 'Academia de Arqueros',
                  titulo: 'Entrenamiento de reflejos con pelotas de reacción',
                  media_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
                  categoria: 'Microciclo',
                },
              ],
            },
          },
        ],
        created_at: new Date('2026-02-15'),
        updated_at: new Date(),
      },
    ];
  }
}
