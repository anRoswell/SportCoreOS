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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const auth_repository_1 = require("./auth.repository");
const role_enum_1 = require("../../common/enums/role.enum");
let AuthService = class AuthService {
    authRepository;
    jwtService;
    constructor(authRepository, jwtService) {
        this.authRepository = authRepository;
        this.jwtService = jwtService;
    }
    async login(email, pass) {
        const user = await this.authRepository.findByEmailWithClub(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (!user.activo) {
            throw new common_1.UnauthorizedException('El usuario se encuentra inactivo');
        }
        const isMatch = await bcrypt.compare(pass, user.password_hash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        await this.authRepository.updateLastAccess(user.id);
        const payload = {
            sub: user.id,
            email: user.email,
            nombre: `${user.nombre} ${user.apellido}`,
            rol: user.rol,
            clubId: user.club_id,
            clubNombre: user.club_nombre,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                rol: user.rol,
                clubId: user.club_id,
                clubNombre: user.club_nombre,
                clubSlug: user.club_slug,
                clubLogo: user.club_logo,
            },
        };
    }
    async register(dto) {
        const existing = await this.authRepository.findByEmailWithClub(dto.email);
        if (existing) {
            throw new common_1.ConflictException('Ya existe un usuario registrado con este correo electrónico');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(dto.password, saltRounds);
        const rol = dto.rol || role_enum_1.Role.ENTRENADOR_DT;
        const newUser = await this.authRepository.createUser({
            nombre: dto.nombre.trim(),
            apellido: dto.apellido.trim(),
            email: dto.email.toLowerCase().trim(),
            password_hash: passwordHash,
            rol,
            telefono: dto.telefono,
        }, dto.clubId);
        return {
            message: 'Usuario registrado exitosamente',
            user: newUser,
        };
    }
    async getMe(userId) {
        const user = await this.authRepository.findByIdWithClub(userId);
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return user;
    }
    async updateProfile(userId, dto) {
        const updated = await this.authRepository.updateProfile(userId, {
            nombre: dto.nombre.trim(),
            apellido: dto.apellido.trim(),
            telefono: dto.telefono,
            avatar: dto.avatar,
        });
        if (!updated) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        return {
            message: 'Perfil actualizado exitosamente',
            user: updated,
        };
    }
    async changePassword(userId, dto) {
        const user = await this.authRepository.findByIdWithClub(userId);
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const isMatch = await bcrypt.compare(dto.passwordActual, user.password_hash);
        if (!isMatch) {
            throw new common_1.BadRequestException('La contraseña actual es incorrecta');
        }
        const newHash = await bcrypt.hash(dto.passwordNuevo, 10);
        await this.authRepository.updatePassword(userId, newHash);
        return {
            message: 'Contraseña actualizada exitosamente',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map