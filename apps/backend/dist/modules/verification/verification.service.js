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
var VerificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const ethers_1 = require("ethers");
const verification_log_entity_1 = require("./entities/verification-log.entity");
const verifier_node_entity_1 = require("./entities/verifier-node.entity");
let VerificationService = VerificationService_1 = class VerificationService {
    constructor(verificationLogRepository, verifierNodeRepository) {
        this.verificationLogRepository = verificationLogRepository;
        this.verifierNodeRepository = verifierNodeRepository;
        this.logger = new common_1.Logger(VerificationService_1.name);
        this.TOTAL_VERIFIERS = 11;
        this.FAULT_TOLERANCE = 3;
        this.REQUIRED_SIGNATURES = 7;
        this.verifierNodes = new Map();
        this.initializeVerifierNodes();
    }
    initializeVerifierNodes() {
        for (let i = 0; i < this.TOTAL_VERIFIERS; i++) {
            const wallet = ethers_1.Wallet.createRandom();
            this.verifierNodes.set(`verifier-${i + 1}`, {
                wallet,
                reliability: 0.9 + Math.random() * 0.1,
                avgLatencyMs: 30 + Math.random() * 50,
            });
        }
        this.logger.log(`Initialized ${this.TOTAL_VERIFIERS} verifier nodes`);
        this.logger.log(`Fault tolerance: ${this.FAULT_TOLERANCE} nodes`);
        this.logger.log(`Required signatures: ${this.REQUIRED_SIGNATURES}`);
    }
    async verifyTransaction(request) {
        const startTime = Date.now();
        const verificationId = this.generateVerificationId();
        const requestHash = this.hashRequest(request);
        this.logger.log(`Starting BFT verification: ${verificationId}`);
        const signaturePromises = Array.from(this.verifierNodes.entries()).map(([id, node]) => this.collectSignature(id, node, requestHash));
        const signatureResults = await Promise.all(signaturePromises);
        const validSignatures = signatureResults.filter((s) => s !== null);
        const consensusReached = validSignatures.length >= this.REQUIRED_SIGNATURES;
        const consensusLatencyMs = Date.now() - startTime;
        const log = this.verificationLogRepository.create({
            verificationId,
            requestHash,
            requestType: request.type,
            userId: request.userId,
            signatureCount: validSignatures.length,
            requiredSignatures: this.REQUIRED_SIGNATURES,
            consensusReached,
            consensusLatencyMs,
            signatures: JSON.stringify(validSignatures),
        });
        await this.verificationLogRepository.save(log);
        this.logger.log(`Verification ${verificationId}: ${validSignatures.length}/${this.REQUIRED_SIGNATURES} signatures, ` +
            `consensus ${consensusReached ? 'REACHED' : 'FAILED'}, latency ${consensusLatencyMs}ms`);
        return {
            verificationId,
            requestHash,
            approved: consensusReached,
            signatureCount: validSignatures.length,
            requiredSignatures: this.REQUIRED_SIGNATURES,
            signatures: validSignatures,
            timestamp: new Date(),
            consensusLatencyMs,
        };
    }
    async collectSignature(verifierId, node, requestHash) {
        const startTime = Date.now();
        await this.simulateLatency(node.avgLatencyMs);
        if (Math.random() > node.reliability) {
            this.logger.warn(`Verifier ${verifierId} failed to respond`);
            return null;
        }
        try {
            const signature = await node.wallet.signMessage(requestHash);
            return {
                verifierId,
                address: node.wallet.address,
                signature,
                latencyMs: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error(`Verifier ${verifierId} signing error: ${error.message}`);
            return null;
        }
    }
    aggregateSignatures(signatures) {
        const sortedSigs = signatures.sort((a, b) => a.address.localeCompare(b.address));
        return sortedSigs.map((s) => s.signature).join('');
    }
    async getVerifierStatus() {
        const nodes = Array.from(this.verifierNodes.entries()).map(([id, node]) => ({
            id,
            address: node.wallet.address,
            reliability: Math.round(node.reliability * 100) / 100,
            avgLatencyMs: Math.round(node.avgLatencyMs),
        }));
        return {
            totalNodes: this.TOTAL_VERIFIERS,
            activeNodes: nodes.length,
            faultTolerance: this.FAULT_TOLERANCE,
            requiredSignatures: this.REQUIRED_SIGNATURES,
            nodes,
        };
    }
    async getRecentVerifications(limit = 10) {
        return this.verificationLogRepository.find({
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async checkVerification(verificationId) {
        const log = await this.verificationLogRepository.findOne({
            where: { verificationId },
        });
        if (!log) {
            return { valid: false };
        }
        return {
            valid: log.consensusReached,
            verificationLog: log,
        };
    }
    generateVerificationId() {
        return `vrf_${(0, crypto_1.randomBytes)(16).toString('hex')}`;
    }
    hashRequest(request) {
        const data = JSON.stringify({
            type: request.type,
            userId: request.userId,
            amount: request.amount,
            recipient: request.recipient,
            parameters: request.parameters,
            timestamp: Date.now(),
        });
        return (0, crypto_1.createHash)('sha256').update(data).digest('hex');
    }
    simulateLatency(avgMs) {
        const latency = avgMs * (0.5 + Math.random());
        return new Promise((resolve) => setTimeout(resolve, latency));
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = VerificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(verification_log_entity_1.VerificationLog)),
    __param(1, (0, typeorm_1.InjectRepository)(verifier_node_entity_1.VerifierNode)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], VerificationService);
//# sourceMappingURL=verification.service.js.map