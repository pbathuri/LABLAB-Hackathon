"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReliabilityModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reliability_service_1 = require("./reliability.service");
const reliability_controller_1 = require("./reliability.controller");
const provider_entity_1 = require("./entities/provider.entity");
let ReliabilityModule = class ReliabilityModule {
};
exports.ReliabilityModule = ReliabilityModule;
exports.ReliabilityModule = ReliabilityModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([provider_entity_1.Provider])],
        controllers: [reliability_controller_1.ReliabilityController],
        providers: [reliability_service_1.ReliabilityService],
        exports: [reliability_service_1.ReliabilityService],
    })
], ReliabilityModule);
//# sourceMappingURL=reliability.module.js.map