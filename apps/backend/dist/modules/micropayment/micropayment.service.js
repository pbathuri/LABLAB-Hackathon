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
var MicropaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicropaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const payment_request_entity_1 = require("./entities/payment-request.entity");
const post_quantum_crypto_service_1 = require("../quantum/services/post-quantum-crypto.service");
const qrng_service_1 = require("../quantum/services/qrng.service");
const reliability_service_1 = require("../reliability/reliability.service");
const circle_service_1 = require("../circle/circle.service");
let MicropaymentService = MicropaymentService_1 = class MicropaymentService {
    constructor(paymentRepository, postQuantumCrypto, qrngService, reliabilityService, circleService, configService) {
        this.paymentRepository = paymentRepository;
        this.postQuantumCrypto = postQuantumCrypto;
        this.qrngService = qrngService;
        this.reliabilityService = reliabilityService;
        this.circleService = circleService;
        this.configService = configService;
        this.logger = new common_1.Logger(MicropaymentService_1.name);
        this.domain = {
            name: 'CaptainWhiskers',
            version: '1',
            chainId: this.configService.get('ARC_CHAIN_ID', 5042002),
            verifyingContract: this.configService.get('GATEWAY_CONTRACT', '0x0000000000000000000000000000000000000000'),
        };
    }
    async createPaymentRequest(params) {
        const nonce = await this.qrngService.generateNonce(32);
        const expiry = Math.floor(Date.now() / 1000) + 3600;
        const typedData = this.buildTypedData(params, nonce, expiry);
        const keyPair = await this.postQuantumCrypto.generateKeyPair();
        const signature = await this.postQuantumCrypto.signTypedData(typedData, keyPair.secretKey);
        const paymentRequest = this.paymentRepository.create({
            userId: params.userId,
            payer: params.payer,
            payee: params.payee,
            amount: params.amount,
            nonce,
            expiry,
            model: params.model || payment_request_entity_1.PaymentModel.PAY_PER_CALL,
            apiEndpoint: params.apiEndpoint,
            providerId: params.providerId,
            signature: signature.signature,
            eip712TypedData: JSON.stringify(typedData),
            status: payment_request_entity_1.PaymentStatus.PENDING,
            metadata: {
                description: params.description,
            },
        });
        await this.paymentRepository.save(paymentRequest);
        this.logger.log(`Created payment request ${paymentRequest.id}`);
        return paymentRequest;
    }
    async authorizePayment(requestId) {
        const request = await this.paymentRepository.findOne({
            where: { id: requestId },
        });
        if (!request) {
            throw new common_1.BadRequestException('Payment request not found');
        }
        if (request.status !== payment_request_entity_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException('Payment already processed');
        }
        if (Date.now() / 1000 > request.expiry) {
            request.status = payment_request_entity_1.PaymentStatus.FAILED;
            request.metadata = {
                ...request.metadata,
                errorMessage: 'Payment request expired',
            };
            await this.paymentRepository.save(request);
            throw new common_1.BadRequestException('Payment request expired');
        }
        request.status = payment_request_entity_1.PaymentStatus.AUTHORIZED;
        await this.paymentRepository.save(request);
        return request;
    }
    async completePayment(requestId, callResult) {
        const request = await this.paymentRepository.findOne({
            where: { id: requestId },
        });
        if (!request) {
            throw new common_1.BadRequestException('Payment request not found');
        }
        if (request.status !== payment_request_entity_1.PaymentStatus.AUTHORIZED) {
            throw new common_1.BadRequestException('Payment not authorized');
        }
        if (request.model === payment_request_entity_1.PaymentModel.PAY_ON_SUCCESS && !callResult) {
            request.status = payment_request_entity_1.PaymentStatus.FAILED;
            await this.paymentRepository.save(request);
            throw new common_1.BadRequestException('Pay-on-success requires valid result');
        }
        try {
            const transfer = await this.circleService.createGatewayTransfer({
                userId: request.userId,
                amount: request.amount,
                sourceChain: 'Arc Testnet',
                destinationChain: 'Arc Testnet',
                fromAddress: request.payer,
                toAddress: request.payee,
                referenceId: request.id,
                notes: request.metadata?.description,
            });
            request.metadata = {
                ...request.metadata,
                gatewayTransferId: transfer.id,
                gatewayTxHash: transfer.txHash,
            };
        }
        catch (error) {
            this.logger.warn(`Gateway settlement failed: ${error.message || error}`);
        }
        request.status = payment_request_entity_1.PaymentStatus.COMPLETED;
        request.metadata = {
            ...request.metadata,
            callResult,
        };
        await this.paymentRepository.save(request);
        if (request.providerId) {
            await this.reliabilityService.recordSuccess(request.providerId, 100);
        }
        this.logger.log(`Payment ${requestId} completed`);
        return request;
    }
    async failPayment(requestId, reason) {
        const request = await this.paymentRepository.findOne({
            where: { id: requestId },
        });
        if (!request) {
            throw new common_1.BadRequestException('Payment request not found');
        }
        request.status = payment_request_entity_1.PaymentStatus.FAILED;
        request.metadata = {
            ...request.metadata,
            errorMessage: reason,
        };
        await this.paymentRepository.save(request);
        if (request.providerId) {
            await this.reliabilityService.recordFailure(request.providerId);
        }
        return request;
    }
    async refundPayment(requestId) {
        const request = await this.paymentRepository.findOne({
            where: { id: requestId },
        });
        if (!request) {
            throw new common_1.BadRequestException('Payment request not found');
        }
        if (request.status !== payment_request_entity_1.PaymentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Can only refund completed payments');
        }
        request.status = payment_request_entity_1.PaymentStatus.REFUNDED;
        await this.paymentRepository.save(request);
        return request;
    }
    async getPaymentHistory(userId, limit = 50) {
        return this.paymentRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    buildTypedData(params, nonce, expiry) {
        return {
            domain: this.domain,
            types: {
                EIP712Domain: [
                    { name: 'name', type: 'string' },
                    { name: 'version', type: 'string' },
                    { name: 'chainId', type: 'uint256' },
                    { name: 'verifyingContract', type: 'address' },
                ],
                PaymentRequest: [
                    { name: 'payer', type: 'address' },
                    { name: 'payee', type: 'address' },
                    { name: 'amount', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'expiry', type: 'uint256' },
                ],
            },
            message: {
                payer: params.payer,
                payee: params.payee,
                amount: params.amount,
                nonce: `0x${nonce}`,
                expiry: expiry.toString(),
            },
        };
    }
};
exports.MicropaymentService = MicropaymentService;
exports.MicropaymentService = MicropaymentService = MicropaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_request_entity_1.PaymentRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        post_quantum_crypto_service_1.PostQuantumCryptoService,
        qrng_service_1.QRNGService,
        reliability_service_1.ReliabilityService,
        circle_service_1.CircleService,
        config_1.ConfigService])
], MicropaymentService);
//# sourceMappingURL=micropayment.service.js.map