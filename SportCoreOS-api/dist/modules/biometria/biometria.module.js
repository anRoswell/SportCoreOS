"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiometriaModule = void 0;
const common_1 = require("@nestjs/common");
const biometria_service_1 = require("./biometria.service");
const biometria_controller_1 = require("./biometria.controller");
const auth_module_1 = require("../auth/auth.module");
let BiometriaModule = class BiometriaModule {
};
exports.BiometriaModule = BiometriaModule;
exports.BiometriaModule = BiometriaModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [biometria_controller_1.BiometriaController],
        providers: [biometria_service_1.BiometriaService],
        exports: [biometria_service_1.BiometriaService],
    })
], BiometriaModule);
//# sourceMappingURL=biometria.module.js.map