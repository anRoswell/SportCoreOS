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
exports.CreateBiometriaDto = exports.CreateAcudienteDto = exports.UpdateJugadorDto = exports.CreateJugadorDto = exports.EstadoMatricula = exports.Genero = exports.PiernaHabil = exports.TipoDocumento = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var TipoDocumento;
(function (TipoDocumento) {
    TipoDocumento["TI"] = "TI";
    TipoDocumento["CC"] = "CC";
    TipoDocumento["RC"] = "RC";
    TipoDocumento["CE"] = "CE";
    TipoDocumento["PASAPORTE"] = "PASAPORTE";
    TipoDocumento["PPT"] = "PPT";
    TipoDocumento["NUIP"] = "NUIP";
})(TipoDocumento || (exports.TipoDocumento = TipoDocumento = {}));
var PiernaHabil;
(function (PiernaHabil) {
    PiernaHabil["DIESTRO"] = "DIESTRO";
    PiernaHabil["ZURDO"] = "ZURDO";
    PiernaHabil["AMBIDIESTRO"] = "AMBIDIESTRO";
})(PiernaHabil || (exports.PiernaHabil = PiernaHabil = {}));
var Genero;
(function (Genero) {
    Genero["MASCULINO"] = "MASCULINO";
    Genero["FEMENINO"] = "FEMENINO";
})(Genero || (exports.Genero = Genero = {}));
var EstadoMatricula;
(function (EstadoMatricula) {
    EstadoMatricula["ACTIVO"] = "ACTIVO";
    EstadoMatricula["SUSPENDIDO"] = "SUSPENDIDO";
    EstadoMatricula["LESIONADO"] = "LESIONADO";
    EstadoMatricula["RETIRADO"] = "RETIRADO";
})(EstadoMatricula || (exports.EstadoMatricula = EstadoMatricula = {}));
class CreateJugadorDto {
    categoriaId;
    nombres;
    apellidos;
    tipoDocumento;
    numeroDocumento;
    fechaNacimiento;
    genero;
    fotoUrl;
    posicionPrincipal;
    posicionSecundaria;
    piernaHabil;
    numeroDorsal;
    eps;
    estadoMatricula;
    porcentajeBeca;
    acudienteNombres;
    acudienteApellidos;
    acudienteTipoDoc;
    acudienteNumeroDoc;
    acudienteNumeroDocumento;
    acudienteTelefono;
    acudienteEmail;
    acudienteParentesco;
}
exports.CreateJugadorDto = CreateJugadorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '30000000-0000-0000-0000-000000000001', description: 'ID de la categoría a la que pertenece' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La categoría es obligatoria' }),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "categoriaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mateo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del jugador es obligatorio' }),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "nombres", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gómez Restrepo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Los apellidos son obligatorios' }),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "apellidos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TipoDocumento, default: TipoDocumento.TI }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TipoDocumento),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "tipoDocumento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1023456781' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El número de documento es obligatorio' }),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "numeroDocumento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2011-04-15' }),
    (0, class_validator_1.IsDateString)({}, { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: Genero, default: Genero.MASCULINO }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Genero),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "genero", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "fotoUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Extremo Derecho' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La posición principal es obligatoria' }),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "posicionPrincipal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Delantero Centro' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "posicionSecundaria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: PiernaHabil, default: PiernaHabil.DIESTRO }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PiernaHabil),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "piernaHabil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 7, minimum: 1, maximum: 99 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], CreateJugadorDto.prototype, "numeroDorsal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SURA EPS' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "eps", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: EstadoMatricula, default: EstadoMatricula.ACTIVO }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(EstadoMatricula),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "estadoMatricula", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0, description: 'Porcentaje de beca deportiva (0 a 100)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateJugadorDto.prototype, "porcentajeBeca", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Luis Manuel' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "acudienteNombres", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Gómez' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "acudienteApellidos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'CC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "acudienteTipoDoc", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '79845123' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "acudienteNumeroDoc", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '79845123' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "acudienteNumeroDocumento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+57 315 777 6666' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "acudienteTelefono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'padre.gomez@gmail.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateIf)((o) => !!o.acudienteEmail && o.acudienteEmail.trim().length > 0),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "acudienteEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'PADRE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJugadorDto.prototype, "acudienteParentesco", void 0);
class UpdateJugadorDto {
    categoriaId;
    nombres;
    apellidos;
    tipoDocumento;
    numeroDocumento;
    fechaNacimiento;
    genero;
    fotoUrl;
    posicionPrincipal;
    posicionSecundaria;
    piernaHabil;
    numeroDorsal;
    eps;
    estadoMatricula;
}
exports.UpdateJugadorDto = UpdateJugadorDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '30000000-0000-0000-0000-000000000001' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "categoriaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mateo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "nombres", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Gómez Restrepo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "apellidos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: TipoDocumento }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TipoDocumento),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "tipoDocumento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '1023456781' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "numeroDocumento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2011-04-15' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "fechaNacimiento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: Genero }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Genero),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "genero", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "fotoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Extremo Derecho' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "posicionPrincipal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Delantero Centro' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "posicionSecundaria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: PiernaHabil }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PiernaHabil),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "piernaHabil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 7 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(99),
    __metadata("design:type", Number)
], UpdateJugadorDto.prototype, "numeroDorsal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SURA EPS' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "eps", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: EstadoMatricula }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(EstadoMatricula),
    __metadata("design:type", String)
], UpdateJugadorDto.prototype, "estadoMatricula", void 0);
class CreateAcudienteDto {
    nombres;
    apellidos;
    tipoDocumento;
    numeroDocumento;
    telefonoMovil;
    email;
    parentesco;
    direccionResidencia;
    esContactoPrincipal;
    autorizadoRecoger;
}
exports.CreateAcudienteDto = CreateAcudienteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Luis Manuel' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del acudiente es obligatorio' }),
    __metadata("design:type", String)
], CreateAcudienteDto.prototype, "nombres", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gómez' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Los apellidos son obligatorios' }),
    __metadata("design:type", String)
], CreateAcudienteDto.prototype, "apellidos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'CC', default: 'CC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcudienteDto.prototype, "tipoDocumento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '79845123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El número de documento es obligatorio' }),
    __metadata("design:type", String)
], CreateAcudienteDto.prototype, "numeroDocumento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+57 315 777 6666' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El teléfono móvil es obligatorio' }),
    __metadata("design:type", String)
], CreateAcudienteDto.prototype, "telefonoMovil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'padre@sportcore.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateAcudienteDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'PADRE', default: 'PADRE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcudienteDto.prototype, "parentesco", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Calle 134 # 45-20, Bogotá D.C.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAcudienteDto.prototype, "direccionResidencia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAcudienteDto.prototype, "esContactoPrincipal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAcudienteDto.prototype, "autorizadoRecoger", void 0);
class CreateBiometriaDto {
    fechaEvaluacion;
    pesoKg;
    tallaCm;
    testCooperMetros;
    velocidad30mSeg;
    saltoVerticalCm;
    observaciones;
}
exports.CreateBiometriaDto = CreateBiometriaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-03-20' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBiometriaDto.prototype, "fechaEvaluacion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 56.4, description: 'Peso corporal en Kilogramos (Kg)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El peso es obligatorio' }),
    __metadata("design:type", Number)
], CreateBiometriaDto.prototype, "pesoKg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 167.5, description: 'Estatura/Talla en Centímetros (cm)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La talla es obligatoria' }),
    __metadata("design:type", Number)
], CreateBiometriaDto.prototype, "tallaCm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2850, description: 'Distancia recorrida en Test de Cooper (metros)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBiometriaDto.prototype, "testCooperMetros", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3.92, description: 'Tiempo en Sprint de 30 metros (segundos)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBiometriaDto.prototype, "velocidad30mSeg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 42.5, description: 'Altura en salto vertical (cm)' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBiometriaDto.prototype, "saltoVerticalCm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Excelente potencia aeróbica y visión de juego.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBiometriaDto.prototype, "observaciones", void 0);
//# sourceMappingURL=jugadores.dto.js.map