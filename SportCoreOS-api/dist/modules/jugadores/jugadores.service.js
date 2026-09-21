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
var JugadoresService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JugadoresService = void 0;
const common_1 = require("@nestjs/common");
const jugadores_repository_1 = require("./jugadores.repository");
let JugadoresService = JugadoresService_1 = class JugadoresService {
    jugadoresRepository;
    logger = new common_1.Logger(JugadoresService_1.name);
    constructor(jugadoresRepository) {
        this.jugadoresRepository = jugadoresRepository;
    }
    async findAllByClub(clubId, search, categoriaId, estado) {
        return this.jugadoresRepository.findJugadoresByClub(clubId, search, categoriaId, estado);
    }
    async findById(id, clubId) {
        const jugador = await this.jugadoresRepository.findById(id, clubId);
        if (!jugador) {
            throw new common_1.NotFoundException(`Jugador con ID '${id}' no encontrado en el club`);
        }
        return jugador;
    }
    async findExpedienteCompleto(id, clubId) {
        const expediente = await this.jugadoresRepository.findExpediente(id, clubId);
        if (!expediente) {
            throw new common_1.NotFoundException(`Expediente del jugador con ID '${id}' no encontrado`);
        }
        return expediente;
    }
    async create(clubId, dto) {
        const docExistente = await this.jugadoresRepository.findByDocumento(clubId, dto.numeroDocumento);
        if (docExistente) {
            throw new common_1.ConflictException(`Ya existe un jugador registrado con el documento ${dto.numeroDocumento} (${docExistente.nombres} ${docExistente.apellidos})`);
        }
        if (dto.numeroDorsal) {
            const dorsalExistente = await this.jugadoresRepository.findByDorsal(clubId, dto.categoriaId, dto.numeroDorsal);
            if (dorsalExistente) {
                throw new common_1.ConflictException(`El dorsal #${dto.numeroDorsal} ya está asignado al jugador ${dorsalExistente.nombres} ${dorsalExistente.apellidos} en esta categoría`);
            }
        }
        const nuevoJugador = await this.jugadoresRepository.createJugador({
            clubId,
            categoriaId: dto.categoriaId,
            nombres: dto.nombres,
            apellidos: dto.apellidos,
            tipoDocumento: dto.tipoDocumento || 'TI',
            numeroDocumento: dto.numeroDocumento,
            fechaNacimiento: dto.fechaNacimiento,
            genero: dto.genero || 'MASCULINO',
            fotoUrl: dto.fotoUrl,
            posicionPrincipal: dto.posicionPrincipal,
            posicionSecundaria: dto.posicionSecundaria,
            piernaHabil: dto.piernaHabil || 'DIESTRO',
            numeroDorsal: dto.numeroDorsal,
            eps: dto.eps,
            estadoMatricula: dto.estadoMatricula || 'ACTIVO',
        });
        let acudienteCreado = null;
        if (dto.acudienteNombres && dto.acudienteNumeroDocumento && dto.acudienteTelefono) {
            try {
                acudienteCreado = await this.jugadoresRepository.createAcudiente({
                    nombres: dto.acudienteNombres,
                    apellidos: dto.acudienteApellidos || '',
                    tipoDocumento: 'CC',
                    numeroDocumento: dto.acudienteNumeroDocumento,
                    telefonoMovil: dto.acudienteTelefono,
                    email: dto.acudienteEmail,
                    parentesco: dto.acudienteParentesco || 'PADRE',
                });
                await this.jugadoresRepository.linkJugadorAcudiente(nuevoJugador.id, acudienteCreado.id, true, true);
            }
            catch (err) {
                this.logger.warn(`Nota al registrar acudiente inicial: ${err.message}`);
            }
        }
        return {
            message: 'Jugador inscrito y registrado exitosamente en el plantel',
            jugador: nuevoJugador,
            acudiente: acudienteCreado,
        };
    }
    async update(id, clubId, dto) {
        const actual = await this.findById(id, clubId);
        if (dto.numeroDocumento && dto.numeroDocumento !== actual.numero_documento) {
            const docExistente = await this.jugadoresRepository.findByDocumento(clubId, dto.numeroDocumento, id);
            if (docExistente) {
                throw new common_1.ConflictException(`Ya existe otro jugador con el documento ${dto.numeroDocumento}`);
            }
        }
        const targetCategoria = dto.categoriaId || actual.categoria_id;
        const targetDorsal = dto.numeroDorsal !== undefined ? dto.numeroDorsal : actual.numero_dorsal;
        if (targetDorsal && (dto.numeroDorsal !== undefined || dto.categoriaId !== undefined)) {
            const dorsalExistente = await this.jugadoresRepository.findByDorsal(clubId, targetCategoria, targetDorsal, id);
            if (dorsalExistente) {
                throw new common_1.ConflictException(`El dorsal #${targetDorsal} ya está ocupado en la categoría seleccionada por ${dorsalExistente.nombres} ${dorsalExistente.apellidos}`);
            }
        }
        const actualizado = await this.jugadoresRepository.updateJugador(id, clubId, dto);
        return {
            message: 'Ficha del jugador actualizada exitosamente',
            jugador: actualizado,
        };
    }
    async delete(id, clubId) {
        await this.findById(id, clubId);
        await this.jugadoresRepository.deleteJugador(id, clubId);
        return { message: 'Jugador dado de baja / retirado del club' };
    }
    async addAcudiente(jugadorId, clubId, dto) {
        await this.findById(jugadorId, clubId);
        const acudiente = await this.jugadoresRepository.createAcudiente({
            nombres: dto.nombres,
            apellidos: dto.apellidos,
            tipoDocumento: dto.tipoDocumento || 'CC',
            numeroDocumento: dto.numeroDocumento,
            telefonoMovil: dto.telefonoMovil,
            email: dto.email,
            parentesco: dto.parentesco || 'PADRE',
            direccionResidencia: dto.direccionResidencia,
        });
        await this.jugadoresRepository.linkJugadorAcudiente(jugadorId, acudiente.id, dto.esContactoPrincipal !== undefined ? dto.esContactoPrincipal : true, dto.autorizadoRecoger !== undefined ? dto.autorizadoRecoger : true);
        return {
            message: 'Familiar / Acudiente vinculado exitosamente',
            acudiente,
        };
    }
    async removeAcudiente(jugadorId, clubId, acudienteId) {
        await this.findById(jugadorId, clubId);
        const deleted = await this.jugadoresRepository.removeJugadorAcudiente(jugadorId, acudienteId);
        if (!deleted) {
            throw new common_1.NotFoundException('Vínculo con acudiente no encontrado');
        }
        return { message: 'Vínculo de acudiente removido exitosamente' };
    }
    async addEvaluacionBiometrica(jugadorId, clubId, evaluadorId, dto) {
        await this.findById(jugadorId, clubId);
        if (dto.pesoKg <= 0 || dto.tallaCm <= 0) {
            throw new common_1.BadRequestException('El peso y la talla deben ser valores numéricos positivos mayores a 0');
        }
        const tallaMetros = dto.tallaCm / 100;
        const imcCalculado = parseFloat((dto.pesoKg / (tallaMetros * tallaMetros)).toFixed(1));
        const fecha = dto.fechaEvaluacion || new Date().toISOString().split('T')[0];
        const evaluacion = await this.jugadoresRepository.createEvaluacionBiometrica({
            jugadorId,
            evaluadorId,
            fechaEvaluacion: fecha,
            pesoKg: dto.pesoKg,
            tallaCm: dto.tallaCm,
            imc: imcCalculado,
            testCooperMetros: dto.testCooperMetros,
            velocidad30mSeg: dto.velocidad30mSeg,
            saltoVerticalCm: dto.saltoVerticalCm,
            observaciones: dto.observaciones,
        });
        return {
            message: 'Evaluación biométrica registrada exitosamente',
            evaluacion,
        };
    }
};
exports.JugadoresService = JugadoresService;
exports.JugadoresService = JugadoresService = JugadoresService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jugadores_repository_1.JugadoresRepository])
], JugadoresService);
//# sourceMappingURL=jugadores.service.js.map