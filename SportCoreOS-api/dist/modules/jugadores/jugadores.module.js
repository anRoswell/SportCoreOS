"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JugadoresModule = void 0;
const common_1 = require("@nestjs/common");
const jugadores_service_1 = require("./jugadores.service");
const jugadores_repository_1 = require("./jugadores.repository");
const jugadores_controller_1 = require("./jugadores.controller");
const auth_module_1 = require("../auth/auth.module");
let JugadoresModule = class JugadoresModule {
};
exports.JugadoresModule = JugadoresModule;
exports.JugadoresModule = JugadoresModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [jugadores_controller_1.JugadoresController],
        providers: [jugadores_service_1.JugadoresService, jugadores_repository_1.JugadoresRepository],
        exports: [jugadores_service_1.JugadoresService, jugadores_repository_1.JugadoresRepository],
    })
], JugadoresModule);
//# sourceMappingURL=jugadores.module.js.map