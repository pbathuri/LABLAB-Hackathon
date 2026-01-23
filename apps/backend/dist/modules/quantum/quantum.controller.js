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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const class_validator_1 = require("class-validator");
const quantum_service_1 = require("./quantum.service");
const qrng_service_1 = require("./services/qrng.service");
const post_quantum_crypto_service_1 = require("./services/post-quantum-crypto.service");
class OptimizePortfolioDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], OptimizePortfolioDto.prototype, "holdings", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OptimizePortfolioDto.prototype, "riskTolerance", void 0);
class SignMessageDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignMessageDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignMessageDto.prototype, "secretKey", void 0);
let QuantumController = class QuantumController {
    constructor(quantumService, qrngService, postQuantumCrypto) {
        this.quantumService = quantumService;
        this.qrngService = qrngService;
        this.postQuantumCrypto = postQuantumCrypto;
    }
    async optimizePortfolio(dto) {
        return this.quantumService.optimizePortfolio(dto.holdings || { USDC: 600, ETH: 300, ARC: 100 }, dto.riskTolerance || 0.5);
    }
    async getRandomNumbers() {
        const numbers = await this.qrngService.generateRandomNumbers(10);
        const nonce = await this.qrngService.generateNonce(32);
        const uuid = await this.qrngService.generateQuantumUUID();
        return {
            randomNumbers: numbers,
            nonce,
            quantumUUID: uuid,
            source: 'QRNG Simulation',
        };
    }
    async generateKeyPair() {
        const keyPair = await this.postQuantumCrypto.generateKeyPair();
        return {
            publicKey: keyPair.publicKey,
            algorithm: 'CRYSTALS-Dilithium (simulated)',
            warning: 'This is a simulation. Do not use for production cryptography.',
        };
    }
    async signMessage(dto) {
        const signature = await this.postQuantumCrypto.sign(dto.message, dto.secretKey);
        return signature;
    }
};
exports.QuantumController = QuantumController;
__decorate([
    (0, common_1.Post)('optimize'),
    (0, swagger_1.ApiOperation)({ summary: 'Optimize portfolio using VQE algorithm (public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Optimization result' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [OptimizePortfolioDto]),
    __metadata("design:returntype", Promise)
], QuantumController.prototype, "optimizePortfolio", null);
__decorate([
    (0, common_1.Get)('random'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate quantum random numbers (public)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Random numbers generated' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuantumController.prototype, "getRandomNumbers", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('keypair'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate post-quantum key pair' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Key pair generated' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuantumController.prototype, "generateKeyPair", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('sign'),
    (0, swagger_1.ApiOperation)({ summary: 'Sign message with post-quantum signature' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Signature generated' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SignMessageDto]),
    __metadata("design:returntype", Promise)
], QuantumController.prototype, "signMessage", null);
exports.QuantumController = QuantumController = __decorate([
    (0, swagger_1.ApiTags)('quantum'),
    (0, common_1.Controller)('quantum'),
    __metadata("design:paramtypes", [quantum_service_1.QuantumService,
        qrng_service_1.QRNGService,
        post_quantum_crypto_service_1.PostQuantumCryptoService])
], QuantumController);
//# sourceMappingURL=quantum.controller.js.map