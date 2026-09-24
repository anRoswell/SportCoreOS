import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateSliderDto, UpdateSliderDto } from './sliders.dto';

export interface SliderPromocionalEntity {
  id: string;
  club_id?: string | null;
  titulo: string;
  subtitulo?: string | null;
  tag: string;
  tag_icono?: string | null;
  badge_color?: string | null;
  accent_gradient?: string | null;
  icono?: string | null;
  stat_numero?: string | null;
  stat_label?: string | null;
  card_preview_titulo?: string | null;
  card_preview_desc?: string | null;
  highlights_json?: any;
  boton_cta_texto?: string | null;
  boton_cta_url?: string | null;
  imagen_url?: string | null;
  orden: number;
  activo: boolean;
  plataforma_destino: 'TODAS' | 'MOBILE_APP' | 'WEB_PORTAL';
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  created_at: Date;
  updated_at: Date;
}

const DEFAULT_SLIDERS: SliderPromocionalEntity[] = [
  {
    id: 's0000000-0000-0000-0000-000000000001',
    club_id: null,
    titulo: 'Gestión Integral de Clubes',
    subtitulo: 'Conecta a directores técnicos, deportistas y directivos con métricas en tiempo real y cero fricción operativa.',
    tag: 'Ecosistema Cloud 360°',
    tag_icono: '🏆',
    badge_color: '#10b981',
    accent_gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icono: 'fa-solid fa-chart-line',
    stat_numero: '100% Cloud',
    stat_label: 'Sincronización en vivo',
    card_preview_titulo: 'Panel Directivo & Metas',
    card_preview_desc: 'Visión consolidada de canteras, asistencias y alertas del club.',
    highlights_json: [
      { icon: '⚡', text: 'Dashboard con KPIs en Vivo', subtext: 'Métricas deportivas y operativas' },
      { icon: '👥', text: 'Multi-Sede & Categorías', subtext: 'Desde Sub-7 hasta Primera Élite' },
      { icon: '🔒', text: 'Perfiles Blindados SSL', subtext: 'Director DT, Deportista, Tutor' }
    ],
    boton_cta_texto: 'Siguiente',
    boton_cta_url: '/auth/login',
    imagen_url: '',
    orden: 1,
    activo: true,
    plataforma_destino: 'TODAS',
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
  },
  {
    id: 's0000000-0000-0000-0000-000000000002',
    club_id: null,
    titulo: 'Pase de Lista con Código QR',
    subtitulo: 'Controla entrenamientos con check-in táctil o QR en cancha. Registra puntualidad, novedades y microciclos.',
    tag: 'Planilla de Campo',
    tag_icono: '📋',
    badge_color: '#3b82f6',
    accent_gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    icono: 'fa-solid fa-qrcode',
    stat_numero: 'Check-in QR',
    stat_label: 'Registro en segundos',
    card_preview_titulo: 'Control de Asistencia DT',
    card_preview_desc: '8 Presentes, 1 Retraso justificado, 1 Novedad médica.',
    highlights_json: [
      { icon: '📲', text: 'Pase Táctil & Escáner QR', subtext: 'Sin planillas ni hojas de papel' },
      { icon: '⏱️', text: 'Puntualidad & Retrasos', subtext: 'Monitoreo de disciplina' },
      { icon: '💪', text: 'Microciclos & Cargas Físicas', subtext: 'Control de intensidad técnica' }
    ],
    boton_cta_texto: 'Siguiente',
    boton_cta_url: '/auth/login',
    imagen_url: '',
    orden: 2,
    activo: true,
    plataforma_destino: 'TODAS',
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
  },
  {
    id: 's0000000-0000-0000-0000-000000000003',
    club_id: null,
    titulo: 'Pagos Online PSE & Wompi',
    subtitulo: 'Automatiza el recaudo de pensiones, matrículas y arbitrajes con pasarela segura y paz y salvo instantáneo.',
    tag: 'Finanzas & Recaudos',
    tag_icono: '💳',
    badge_color: '#10b981',
    accent_gradient: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
    icono: 'fa-solid fa-credit-card',
    stat_numero: '$220,000 COP',
    stat_label: 'Cartera & extractos claros',
    card_preview_titulo: 'Estado de Cuenta & Cartera',
    card_preview_desc: 'Pensión Mensual, Arbitrajes y Poliza con pago integrado.',
    highlights_json: [
      { icon: '💰', text: 'Pasarela PSE & Tarjetas', subtext: 'Pago directo sin desplazamientos' },
      { icon: '📄', text: 'Paz y Salvo Instantáneo', subtext: 'Certificado digital verificable' },
      { icon: '📊', text: 'Recibos & Trazabilidad', subtext: 'Historial bancario por familia' }
    ],
    boton_cta_texto: 'Siguiente',
    boton_cta_url: '/auth/login',
    imagen_url: '',
    orden: 3,
    activo: true,
    plataforma_destino: 'TODAS',
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
  },
  {
    id: 's0000000-0000-0000-0000-000000000004',
    club_id: null,
    titulo: 'Modo Carrera & Carta FUT',
    subtitulo: 'Motiva el talento con cartas digitales interactivas, retos físicos en cancha validados por el DT y niveles XP.',
    tag: 'Gamificación & Retos',
    tag_icono: '🎮',
    badge_color: '#f59e0b',
    accent_gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icono: 'fa-solid fa-trophy',
    stat_numero: 'Nivel 7 • Oro',
    stat_label: 'XP acumulada en cancha',
    card_preview_titulo: 'Modo Carrera: Evolution',
    card_preview_desc: 'Carlos • Extremo 84 (RIT 87, TIR 82, PAS 85, REG 86).',
    highlights_json: [
      { icon: '🌟', text: 'Carta FUT de Atributos', subtext: 'Ritmo, tiro, pase, regate y físico' },
      { icon: '🎯', text: 'Retos Físicos & Técnicos', subtext: 'Flexiones, tiros libres y sprint' },
      { icon: '🏆', text: 'Leaderboard del Club', subtext: 'Trivias tácticas y medallas pro' }
    ],
    boton_cta_texto: 'Siguiente',
    boton_cta_url: '/auth/login',
    imagen_url: '',
    orden: 4,
    activo: true,
    plataforma_destino: 'TODAS',
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
  },
  {
    id: 's0000000-0000-0000-0000-000000000005',
    club_id: null,
    titulo: 'Clínicas Pro, Canchas & Tienda',
    subtitulo: 'Reserva escenarios deportivos con iluminación nocturna, adquiere uniformes oficiales y participa en clínicas.',
    tag: 'Escenarios & Especialización',
    tag_icono: '🏟️',
    badge_color: '#ec4899',
    accent_gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    icono: 'fa-solid fa-futbol',
    stat_numero: 'Todo en Uno',
    stat_label: 'Canchas, kits y clínicas',
    card_preview_titulo: 'Infraestructura & Tienda',
    card_preview_desc: 'Canchas sintéticas, neuro-agilidad Fitlight y uniformes.',
    highlights_json: [
      { icon: '🏟️', text: 'Alquiler de Canchas & Luces', subtext: 'Disponibilidad horaria en tiempo real' },
      { icon: '🧠', text: 'Clínicas de Micro-Habilidades', subtext: 'Sensores láser y luces Fitlight' },
      { icon: '👕', text: 'Tienda Oficial de Indumentaria', subtext: 'Kits y dorsales personalizados' }
    ],
    boton_cta_texto: '¡Entrar a la Cancha! ⚡',
    boton_cta_url: '/auth/login',
    imagen_url: '',
    orden: 5,
    activo: true,
    plataforma_destino: 'TODAS',
    created_at: new Date('2026-01-01'),
    updated_at: new Date('2026-01-01'),
  },
];

@Injectable()
export class SlidersRepository {
  private inMemorySliders: SliderPromocionalEntity[] = [...DEFAULT_SLIDERS];

  constructor(private readonly db: DatabaseService) {}

  async findAll(clubId?: string | null, plataforma?: string, soloActivos = false): Promise<SliderPromocionalEntity[]> {
    try {
      let query = `
        SELECT * FROM core.sliders_promocionales
        WHERE 1=1
      `;
      const params: any[] = [];

      if (clubId) {
        params.push(clubId);
        query += ` AND (club_id = $${params.length} OR club_id IS NULL)`;
      }

      if (plataforma && plataforma !== 'TODAS') {
        params.push(plataforma);
        query += ` AND (plataforma_destino = $${params.length} OR plataforma_destino = 'TODAS')`;
      }

      if (soloActivos) {
        query += ` AND activo = TRUE`;
      }

      query += ` ORDER BY orden ASC, created_at ASC`;

      const result = await this.db.query<SliderPromocionalEntity>(query, params);
      if (result.rows && result.rows.length > 0) {
        return result.rows.map(r => ({
          ...r,
          highlights_json: typeof r.highlights_json === 'string' ? JSON.parse(r.highlights_json) : (r.highlights_json || [])
        }));
      }
    } catch {
      // Fallback a almacenamiento en memoria
    }

    let items = [...this.inMemorySliders];
    if (soloActivos) {
      items = items.filter(i => i.activo);
    }
    if (plataforma && plataforma !== 'TODAS') {
      items = items.filter(i => i.plataforma_destino === 'TODAS' || i.plataforma_destino === plataforma);
    }
    return items.sort((a, b) => a.orden - b.orden);
  }

  async findById(id: string): Promise<SliderPromocionalEntity | null> {
    try {
      const res = await this.db.query<SliderPromocionalEntity>(
        `SELECT * FROM core.sliders_promocionales WHERE id = $1`,
        [id]
      );
      if (res.rows.length > 0) {
        const r = res.rows[0];
        return {
          ...r,
          highlights_json: typeof r.highlights_json === 'string' ? JSON.parse(r.highlights_json) : (r.highlights_json || [])
        };
      }
    } catch {
      // fallback
    }

    const found = this.inMemorySliders.find(s => s.id === id);
    return found || null;
  }

  async create(clubId: string | null, dto: CreateSliderDto): Promise<SliderPromocionalEntity> {
    const newId = `s-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const slider: SliderPromocionalEntity = {
      id: newId,
      club_id: clubId,
      titulo: dto.titulo,
      subtitulo: dto.subtitulo || null,
      tag: dto.tag || 'Ecosistema Cloud',
      tag_icono: dto.tag_icono || '🏆',
      badge_color: dto.badge_color || '#10b981',
      accent_gradient: dto.accent_gradient || 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icono: dto.icono || 'fa-solid fa-chart-line',
      stat_numero: dto.stat_numero || '',
      stat_label: dto.stat_label || '',
      card_preview_titulo: dto.card_preview_titulo || dto.titulo,
      card_preview_desc: dto.card_preview_desc || dto.subtitulo || '',
      highlights_json: dto.highlights || [],
      boton_cta_texto: dto.boton_cta_texto || 'Siguiente',
      boton_cta_url: dto.boton_cta_url || '/auth/login',
      imagen_url: dto.imagen_url || '',
      orden: dto.orden || this.inMemorySliders.length + 1,
      activo: dto.activo !== undefined ? dto.activo : true,
      plataforma_destino: dto.plataforma_destino || 'TODAS',
      fecha_inicio: dto.fecha_inicio || null,
      fecha_fin: dto.fecha_fin || null,
      created_at: now,
      updated_at: now,
    };

    try {
      const query = `
        INSERT INTO core.sliders_promocionales (
          id, club_id, titulo, subtitulo, tag, tag_icono, badge_color,
          accent_gradient, icono, stat_numero, stat_label,
          card_preview_titulo, card_preview_desc, highlights_json,
          boton_cta_texto, boton_cta_url, imagen_url, orden, activo,
          plataforma_destino, fecha_inicio, fecha_fin, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11,
          $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24
        ) RETURNING *
      `;
      const values = [
        slider.id, slider.club_id, slider.titulo, slider.subtitulo, slider.tag, slider.tag_icono, slider.badge_color,
        slider.accent_gradient, slider.icono, slider.stat_numero, slider.stat_label,
        slider.card_preview_titulo, slider.card_preview_desc, JSON.stringify(slider.highlights_json),
        slider.boton_cta_texto, slider.boton_cta_url, slider.imagen_url, slider.orden, slider.activo,
        slider.plataforma_destino, slider.fecha_inicio, slider.fecha_fin, slider.created_at, slider.updated_at
      ];
      const res = await this.db.query<SliderPromocionalEntity>(query, values);
      if (res.rows.length > 0) {
        const created = res.rows[0];
        this.inMemorySliders.push(created);
        return created;
      }
    } catch {
      // fallback
    }

    this.inMemorySliders.push(slider);
    return slider;
  }

  async update(id: string, dto: UpdateSliderDto): Promise<SliderPromocionalEntity | null> {
    const now = new Date();

    try {
      const query = `
        UPDATE core.sliders_promocionales SET
          titulo = COALESCE($1, titulo),
          subtitulo = COALESCE($2, subtitulo),
          tag = COALESCE($3, tag),
          tag_icono = COALESCE($4, tag_icono),
          badge_color = COALESCE($5, badge_color),
          accent_gradient = COALESCE($6, accent_gradient),
          icono = COALESCE($7, icono),
          stat_numero = COALESCE($8, stat_numero),
          stat_label = COALESCE($9, stat_label),
          card_preview_titulo = COALESCE($10, card_preview_titulo),
          card_preview_desc = COALESCE($11, card_preview_desc),
          highlights_json = COALESCE($12, highlights_json),
          boton_cta_texto = COALESCE($13, boton_cta_texto),
          boton_cta_url = COALESCE($14, boton_cta_url),
          imagen_url = COALESCE($15, imagen_url),
          orden = COALESCE($16, orden),
          activo = COALESCE($17, activo),
          plataforma_destino = COALESCE($18, plataforma_destino),
          fecha_inicio = COALESCE($19, fecha_inicio),
          fecha_fin = COALESCE($20, fecha_fin),
          updated_at = $21
        WHERE id = $22
        RETURNING *
      `;
      const values = [
        dto.titulo, dto.subtitulo, dto.tag, dto.tag_icono, dto.badge_color,
        dto.accent_gradient, dto.icono, dto.stat_numero, dto.stat_label,
        dto.card_preview_titulo, dto.card_preview_desc, dto.highlights ? JSON.stringify(dto.highlights) : null,
        dto.boton_cta_texto, dto.boton_cta_url, dto.imagen_url, dto.orden, dto.activo,
        dto.plataforma_destino, dto.fecha_inicio, dto.fecha_fin, now, id
      ];
      const res = await this.db.query<SliderPromocionalEntity>(query, values);
      if (res.rows.length > 0) {
        const updated = res.rows[0];
        const idx = this.inMemorySliders.findIndex(s => s.id === id);
        if (idx !== -1) this.inMemorySliders[idx] = updated;
        return updated;
      }
    } catch {
      // fallback
    }

    const idx = this.inMemorySliders.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.inMemorySliders[idx] = {
        ...this.inMemorySliders[idx],
        ...dto,
        highlights_json: dto.highlights || this.inMemorySliders[idx].highlights_json,
        updated_at: now,
      };
      return this.inMemorySliders[idx];
    }
    return null;
  }

  async toggleActivo(id: string): Promise<SliderPromocionalEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    const nextState = !existing.activo;

    try {
      const res = await this.db.query<SliderPromocionalEntity>(
        `UPDATE core.sliders_promocionales SET activo = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [nextState, id]
      );
      if (res.rows.length > 0) {
        const item = res.rows[0];
        const idx = this.inMemorySliders.findIndex(s => s.id === id);
        if (idx !== -1) this.inMemorySliders[idx] = item;
        return item;
      }
    } catch {
      // fallback
    }

    const idx = this.inMemorySliders.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.inMemorySliders[idx].activo = nextState;
      this.inMemorySliders[idx].updated_at = new Date();
      return this.inMemorySliders[idx];
    }
    return null;
  }

  async reorder(ids: string[]): Promise<boolean> {
    try {
      for (let i = 0; i < ids.length; i++) {
        await this.db.query(
          `UPDATE core.sliders_promocionales SET orden = $1, updated_at = NOW() WHERE id = $2`,
          [i + 1, ids[i]]
        );
      }
    } catch {
      // fallback
    }

    ids.forEach((id, index) => {
      const item = this.inMemorySliders.find(s => s.id === id);
      if (item) item.orden = index + 1;
    });
    return true;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.query(`DELETE FROM core.sliders_promocionales WHERE id = $1`, [id]);
    } catch {
      // fallback
    }

    const idx = this.inMemorySliders.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.inMemorySliders.splice(idx, 1);
      return true;
    }
    return false;
  }
}
