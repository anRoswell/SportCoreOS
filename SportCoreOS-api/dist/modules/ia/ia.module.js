"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IaModule = void 0;
const common_1 = require("@nestjs/common");
const ia_controller_1 = require("./ia.controller");
const ia_service_1 = require("./ia.service");
const ia_repository_1 = require("./ia.repository");
const auth_module_1 = require("../auth/auth.module");
let IaModule = class IaModule {
};
exports.IaModule = IaModule;
exports.IaModule = IaModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [ia_controller_1.IaController],
        providers: [ia_service_1.IaService, ia_repository_1.IaRepository],
        exports: [ia_service_1.IaService],
    })
], IaModule);
//# sourceMappingURL=ia.module.js.map