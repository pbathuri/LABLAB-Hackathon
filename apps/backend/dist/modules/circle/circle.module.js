"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircleModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const circle_controller_1 = require("./circle.controller");
const circle_service_1 = require("./circle.service");
const circle_wallet_entity_1 = require("./entities/circle-wallet.entity");
const gateway_transfer_entity_1 = require("./entities/gateway-transfer.entity");
let CircleModule = class CircleModule {
};
exports.CircleModule = CircleModule;
exports.CircleModule = CircleModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, typeorm_1.TypeOrmModule.forFeature([circle_wallet_entity_1.CircleWallet, gateway_transfer_entity_1.GatewayTransfer])],
        controllers: [circle_controller_1.CircleController],
        providers: [circle_service_1.CircleService],
        exports: [circle_service_1.CircleService],
    })
], CircleModule);
//# sourceMappingURL=circle.module.js.map