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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const database_service_1 = require("../../database/database.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    db;
    constructor(db, config) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET') || 'SportCoreOS_SecretKey_QA_2026_UltraSecureJWT_Sectic',
        });
        this.db = db;
    }
    async validate(payload) {
        const userResult = await this.db.query(`SELECT id, email, nombre, apellido, rol, activo
       FROM core.usuarios
       WHERE id = $1`, [payload.sub]);
        if (userResult.rows.length === 0) {
            throw new common_1.UnauthorizedException('Token inválido o usuario inexistente');
        }
        const user = userResult.rows[0];
        if (!user.activo) {
            throw new common_1.UnauthorizedException('Usuario inactivo');
        }
        return {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            rol: user.rol,
            clubId: payload.clubId,
            clubNombre: payload.clubNombre,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map