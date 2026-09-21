"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClubesModule = void 0;
const common_1 = require("@nestjs/common");
const clubes_service_1 = require("./clubes.service");
const clubes_repository_1 = require("./clubes.repository");
const clubes_controller_1 = require("./clubes.controller");
const auth_module_1 = require("../auth/auth.module");
let ClubesModule = class ClubesModule {
};
exports.ClubesModule = ClubesModule;
exports.ClubesModule = ClubesModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [clubes_controller_1.ClubesController],
        providers: [clubes_service_1.ClubesService, clubes_repository_1.ClubesRepository],
        exports: [clubes_service_1.ClubesService, clubes_repository_1.ClubesRepository],
    })
], ClubesModule);
//# sourceMappingURL=clubes.module.js.map