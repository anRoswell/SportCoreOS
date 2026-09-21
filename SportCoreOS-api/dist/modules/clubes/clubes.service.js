"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ClubesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubesService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const clubes_repository_1 = require("./clubes.repository");
const auth_repository_1 = require("../auth/auth.repository");
const database_service_1 = require("../../database/database.service");
const role_enum_1 = require("../../common/enums/role.enum");
let ClubesService = ClubesService_1 = class ClubesService {
    clubesRepo;
    authRepo;
    db;
    jwtService;
    logger = new common_1.Logger(ClubesService_1.name);
    constructor(clubesRepo, authRepo, db, jwtService) {
        this.clubesRepo = clubesRepo;
        this.authRepo = authRepo;
        this.db = db;
        this.jwtService = jwtService;
    }
    async findAll(onlyActive = true) {
        return this.clubesRepo.findAll(onlyActive);
    }
    async findClubById(id) {
        const club = await this.clubesRepo.findById(id);
        if (!club) {
            throw new common_1.NotFoundException(`Club con ID '${id}' no encontrado`);
        }
        return club;
    }
    async create(dto) {
        const slug = dto.slug || this.slugify(dto.nombre);
        const existing = await this.clubesRepo.findBySlug(slug);
        if (existing) {
            throw new common_1.ConflictException(`Ya existe un club con el slug o nombre '${slug}'`);
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
    async update(id, dto) {
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
            throw new common_1.NotFoundException(`Club con ID '${id}' no encontrado`);
        }
        return updated;
    }
    async delete(id) {
        const success = await this.clubesRepo.delete(id);
        if (!success) {
            throw new common_1.NotFoundException(`Club con ID '${id}' no encontrado`);
        }
        return { message: 'Club desactivado exitosamente' };
    }
    async getStaff(clubId) {
        await this.findClubById(clubId);
        return this.clubesRepo.findStaffByClub(clubId);
    }
    async findSedesByClub(clubId) {
        const club = await this.findClubById(clubId);
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
    async onboarding(dto) {
        const existingUser = await this.authRepo.findByEmailWithClub(dto.adminEmail);
        if (existingUser) {
            throw new common_1.ConflictException('El correo electrónico del administrador ya se encuentra registrado en la plataforma');
        }
        let baseSlug = this.slugify(dto.clubNombre);
        let slug = baseSlug;
        let counter = 1;
        while (await this.clubesRepo.findBySlug(slug)) {
            slug = `${baseSlug}-${counter++}`;
        }
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
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(dto.adminPassword, saltRounds);
        const nuevoUsuario = await this.authRepo.createUser({
            nombre: dto.adminNombre.trim(),
            apellido: dto.adminApellido.trim(),
            email: dto.adminEmail.toLowerCase().trim(),
            password_hash: passwordHash,
            rol: role_enum_1.Role.DIRECTOR_DEPORTIVO,
            telefono: dto.adminTelefono || '+57 300 123 4567',
        }, nuevoClub.id);
        try {
            await this.db.query(`INSERT INTO finanzas.conceptos (club_id, nombre, tipo, monto_base, activo)
         VALUES ($1, 'Pensión Mensual Formativa', 'MENSUALIDAD', 220000.00, true)
         ON CONFLICT DO NOTHING`, [nuevoClub.id]);
        }
        catch (e) {
            this.logger.warn(`No se pudo crear concepto por defecto: ${e.message}`);
        }
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
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') || 'club';
    }
};
exports.ClubesService = ClubesService;
exports.ClubesService = ClubesService = ClubesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clubes_repository_1.ClubesRepository,
        auth_repository_1.AuthRepository,
        database_service_1.DatabaseService,
        jwt_1.JwtService])
], ClubesService);
//# sourceMappingURL=clubes.service.js.map