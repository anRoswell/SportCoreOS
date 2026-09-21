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
exports.OnboardingClubDto = exports.UpdateClubDto = exports.CreateClubDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateClubDto {
    nombre;
    slug;
    sigla;
    ciudad;
    pais;
    logoUrl;
    plan;
}
exports.CreateClubDto = CreateClubDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Club Atlético Bogotá FC', description: 'Nombre oficial de la escuela o club' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del club es obligatorio' }),
    __metadata("design:type", String)
], CreateClubDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'club-atletico-bogota-fc', description: 'Slug único para URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CABFC', description: 'Sigla o abreviatura del club (máx 10 caracteres)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La sigla del club es obligatoria' }),
    (0, class_validator_1.MaxLength)(10, { message: 'La sigla no puede exceder 10 caracteres' }),
    __metadata("design:type", String)
], CreateClubDto.prototype, "sigla", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bogotá D.C.', default: 'Bogotá D.C.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "ciudad", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Colombia', default: 'Colombia' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "pais", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Plan Élite Pro', default: 'Plan Élite Pro' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClubDto.prototype, "plan", void 0);
class UpdateClubDto {
    nombre;
    sigla;
    ciudad;
    pais;
    logoUrl;
    plan;
    activo;
}
exports.UpdateClubDto = UpdateClubDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Club Atlético Bogotá FC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClubDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'CABFC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], UpdateClubDto.prototype, "sigla", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bogotá D.C.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClubDto.prototype, "ciudad", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Colombia' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClubDto.prototype, "pais", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClubDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Plan Élite Pro' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateClubDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateClubDto.prototype, "activo", void 0);
class OnboardingClubDto {
    clubNombre;
    sigla;
    ciudad;
    pais;
    logoUrl;
    adminNombre;
    adminApellido;
    adminEmail;
    adminPassword;
    adminTelefono;
}
exports.OnboardingClubDto = OnboardingClubDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Academia Leones de Oro FC', description: 'Nombre de la nueva academia de fútbol' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre de la academia es obligatorio' }),
    __metadata("design:type", String)
], OnboardingClubDto.prototype, "clubNombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'LDFC', description: 'Sigla o código corto de la academia' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La sigla es obligatoria' }),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], OnboardingClubDto.prototype, "sigla", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Medellín', description: 'Ciudad sede principal' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La ciudad es obligatoria' }),
    __metadata("design:type", String)
], OnboardingClubDto.prototype, "ciudad", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Colombia', default: 'Colombia' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingClubDto.prototype, "pais", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingClubDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Andrés', description: 'Nombre del Director / Administrador' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del administrador es obligatorio' }),
    __metadata("design:type", String)
], OnboardingClubDto.prototype, "adminNombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Escobar', description: 'Apellido del Director / Administrador' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El apellido del administrador es obligatorio' }),
    __metadata("design:type", String)
], OnboardingClubDto.prototype, "adminApellido", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'andres.escobar@sportcore.com', description: 'Correo para inicio de sesión' }),
    (0, class_validator_1.IsEmail)({}, { message: 'El correo electrónico no es válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El correo del administrador es obligatorio' }),
    __metadata("design:type", String)
], OnboardingClubDto.prototype, "adminEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'sportcore2026', description: 'Contraseña para acceder a la plataforma' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'La contraseña debe tener mínimo 6 caracteres' }),
    __metadata("design:type", String)
], OnboardingClubDto.prototype, "adminPassword", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+57 311 987 6543' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingClubDto.prototype, "adminTelefono", void 0);
//# sourceMappingURL=clubes.dto.js.map