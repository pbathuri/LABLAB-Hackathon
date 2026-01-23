"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumModule = void 0;
const common_1 = require("@nestjs/common");
const quantum_service_1 = require("./quantum.service");
const quantum_controller_1 = require("./quantum.controller");
const qrng_service_1 = require("./services/qrng.service");
const post_quantum_crypto_service_1 = require("./services/post-quantum-crypto.service");
let QuantumModule = class QuantumModule {
};
exports.QuantumModule = QuantumModule;
exports.QuantumModule = QuantumModule = __decorate([
    (0, common_1.Module)({
        controllers: [quantum_controller_1.QuantumController],
        providers: [quantum_service_1.QuantumService, qrng_service_1.QRNGService, post_quantum_crypto_service_1.PostQuantumCryptoService],
        exports: [quantum_service_1.QuantumService, qrng_service_1.QRNGService, post_quantum_crypto_service_1.PostQuantumCryptoService],
    })
], QuantumModule);
//# sourceMappingURL=quantum.module.js.map