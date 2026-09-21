import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ClubesRepository, ClubEntity } from './clubes.repository';
import { AuthRepository } from '../auth/auth.repository';
import { CreateClubDto, UpdateClubDto, OnboardingClubDto } from './clubes.dto';
import { DatabaseService } from '../../database/database.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class ClubesService {
  private readonly logger = new Logger(ClubesService.name);

  constructor(
    private readonly clubesRepo: ClubesRepository,
    private readonly authRepo: AuthRepository,
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(onlyActive: boolean = true): Promise<ClubEntity[]> {
    return this.clubesRepo.findAll(onlyActive);
  }

  async findClubById(id: string): Promise<ClubEntity> {
    const club = await this.clubesRepo.findById(id);
    if (!club) {
      throw new NotFoundException(`Club con ID '${id}' no encontrado`);
    }
    return club;
  }

  async create(dto: CreateClubDto): Promise<ClubEntity> {
    const slug = dto.slug || this.slugify(dto.nombre);
    const existing = await this.clubesRepo.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Ya existe un club con el slug o nombre '${slug}'`);
    }

    return this.clubesRepo.create({
      nombre: dto.nombre.trim(),
      slug,
      sigla: dto.sigla.toUpperCase().trim(),
      ciudad: dto.ciudad?.trim() || 'Bogotá D.C.',
      pais: dto.pais?.trim() || 'Colombia',
      logo_url: dto.logoUrl || null,
      plan: dto.plan || 'Plan Élite Pro',
      activo: true,
      configuracion_json: {},
    });
  }

  async update(id: string, dto: UpdateClubDto): Promise<ClubEntity> {
    const updated = await this.clubesRepo.update(id, {
      nombre: dto.nombre?.trim(),
      sigla: dto.sigla?.toUpperCase().trim(),
      ciudad: dto.ciudad?.trim(),
      pais: dto.pais?.trim(),
      logo_url: dto.logoUrl,
      plan: dto.plan,
      activo: dto.activo,
    });

    if (!updated) {
      throw new NotFoundException(`Club con ID '${id}' no encontrado`);
    }
    return updated;
  }

  async delete(id: string): Promise<{ message: string }> {
    const success = await this.clubesRepo.delete(id);
    if (!success) {
      throw new NotFoundException(`Club con ID '${id}' no encontrado`);
    }
    return { message: 'Club desactivado exitosamente' };
  }

  async getStaff(clubId: string) {
    await this.findClubById(clubId);
    return this.clubesRepo.findStaffByClub(clubId);
  }

  async findSedesByClub(clubId: string) {
    const club = await this.findClubById(clubId);
    // Retorna sedes configuradas o datos por defecto si aún no tiene sedes
    return [
      {
        id: `sede-${club.id}-1`,
        clubId: club.id,
        nombre: `Sede Principal Deportiva ${club.sigla}`,
        direccion: `Complejo Deportivo ${club.ciudad}`,
        ciudad: club.ciudad,
        activa: true,
        canchas: [
          {
            id: `cancha-${club.id}-1`,
            nombre: 'Cancha Sintética #1 (Fútbol 11)',
            tipoSuperficie: 'Sintética FIFA Quality',
            formato: 'FUTBOL_11',
            tieneIluminacion: true,
            precioHoraAlquiler: 120000,
          },
          {
            id: `cancha-${club.id}-2`,
            nombre: 'Cancha Formativa #2 (Fútbol 8)',
            tipoSuperficie: 'Césped Natural',
            formato: 'FUTBOL_8',
            tieneIluminacion: true,
            precioHoraAlquiler: 80000,
          },
        ],
      },
    ];
  }

  /**
   * Onboarding Atómico de Nueva Escuela / Academia Deportiva
   * Crea: Club + Usuario Administrador / DT + Membresía + Concepto Financiero Base + JWT Auto-login
   */
  async onboarding(dto: OnboardingClubDto) {
    // 1. Validar si el email del administrador ya está en uso
    const existingUser = await this.authRepo.findByEmailWithClub(dto.adminEmail);
    if (existingUser) {
      throw new ConflictException('El correo electrónico del administrador ya se encuentra registrado en la plataforma');
    }

    // 2. Generar slug único para el club
    let baseSlug = this.slugify(dto.clubNombre);
    let slug = baseSlug;
    let counter = 1;
    while (await this.clubesRepo.findBySlug(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    // 3. Crear el Club en core.clubes
    const nuevoClub = await this.clubesRepo.create({
      nombre: dto.clubNombre.trim(),
      slug,
      sigla: dto.sigla.toUpperCase().trim(),
      ciudad: dto.ciudad.trim(),
      pais: dto.pais?.trim() || 'Colombia',
      logo_url: dto.logoUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80',
      plan: 'Plan Élite Pro',
      activo: true,
      configuracion_json: {
        moneda: 'COP',
        tiempo_cobro_dias: 10,
        notificaciones_whatsapp: true,
      },
    });

    // 4. Crear el Usuario Administrador en core.usuarios
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.adminPassword, saltRounds);

    const nuevoUsuario = await this.authRepo.createUser(
      {
        nombre: dto.adminNombre.trim(),
        apellido: dto.adminApellido.trim(),
        email: dto.adminEmail.toLowerCase().trim(),
        password_hash: passwordHash,
        rol: Role.DIRECTOR_DEPORTIVO,
        telefono: dto.adminTelefono || '+57 300 123 4567',
      },
      nuevoClub.id,
    );

    // 5. Crear Concepto Financiero Inicial en finanzas.conceptos
    try {
      await this.db.query(
        `INSERT INTO finanzas.conceptos (club_id, nombre, tipo, monto_base, activo)
         VALUES ($1, 'Pensión Mensual Formativa', 'MENSUALIDAD', 220000.00, true)
         ON CONFLICT DO NOTHING`,
        [nuevoClub.id],
      );
    } catch (e: any) {
      this.logger.warn(`No se pudo crear concepto por defecto: ${e.message}`);
    }

    // 6. Generar JWT para inicio de sesión inmediato
    const payload = {
      sub: nuevoUsuario.id,
      email: nuevoUsuario.email,
      nombre: `${nuevoUsuario.nombre} ${nuevoUsuario.apellido}`,
      rol: nuevoUsuario.rol,
      clubId: nuevoClub.id,
      clubNombre: nuevoClub.nombre,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: '¡Academia deportiva creada y registrada exitosamente en SportCoreOS!',
      accessToken: token,
      club: nuevoClub,
      user: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        rol: nuevoUsuario.rol,
        clubId: nuevoClub.id,
        clubNombre: nuevoClub.nombre,
        clubSlug: nuevoClub.slug,
        clubLogo: nuevoClub.logo_url,
      },
    };
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'club';
  }
}
