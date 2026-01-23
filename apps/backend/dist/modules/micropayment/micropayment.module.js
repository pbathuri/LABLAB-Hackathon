"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicropaymentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const micropayment_service_1 = require("./micropayment.service");
const micropayment_controller_1 = require("./micropayment.controller");
const payment_request_entity_1 = require("./entities/payment-request.entity");
const quantum_module_1 = require("../quantum/quantum.module");
const reliability_module_1 = require("../reliability/reliability.module");
const circle_module_1 = require("../circle/circle.module");
let MicropaymentModule = class MicropaymentModule {
};
exports.MicropaymentModule = MicropaymentModule;
exports.MicropaymentModule = MicropaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payment_request_entity_1.PaymentRequest]),
            quantum_module_1.QuantumModule,
            reliability_module_1.ReliabilityModule,
            circle_module_1.CircleModule,
        ],
        controllers: [micropayment_controller_1.MicropaymentController],
        providers: [micropayment_service_1.MicropaymentService],
        exports: [micropayment_service_1.MicropaymentService],
    })
], MicropaymentModule);
//# sourceMappingURL=micropayment.module.js.map