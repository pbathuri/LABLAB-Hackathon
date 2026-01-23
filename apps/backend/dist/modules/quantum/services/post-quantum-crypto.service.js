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
var PostQuantumCryptoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostQuantumCryptoService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
const qrng_service_1 = require("./qrng.service");
let PostQuantumCryptoService = PostQuantumCryptoService_1 = class PostQuantumCryptoService {
    constructor(qrngService) {
        this.qrngService = qrngService;
        this.logger = new common_1.Logger(PostQuantumCryptoService_1.name);
        this.ALGORITHM = 'CRYSTALS-Dilithium-simulated';
    }
    async generateKeyPair() {
        const seed = await this.qrngService.generateNonce(64);
        const publicKey = crypto
            .createHmac('sha512', seed)
            .update('public')
            .digest('hex');
        const secretKey = crypto
            .createHmac('sha512', seed)
            .update('secret')
            .digest('hex');
        this.logger.debug('Generated post-quantum key pair');
        return {
            publicKey: `dilithium_pk_${publicKey}`,
            secretKey: `dilithium_sk_${secretKey}`,
        };
    }
    async sign(message, secretKey) {
        const nonce = await this.qrngService.generateNonce(32);
        const commitment = crypto
            .createHash('sha256')
            .update(nonce)
            .update(secretKey)
            .digest('hex');
        const challenge = crypto
            .createHash('sha256')
            .update(message)
            .update(commitment)
            .digest('hex');
        const response = crypto
            .createHmac('sha512', secretKey)
            .update(challenge)
            .update(nonce)
            .digest('hex');
        const signature = `${commitment}:${challenge}:${response}`;
        return {
            signature: Buffer.from(signature).toString('base64'),
            algorithm: this.ALGORITHM,
            timestamp: new Date().toISOString(),
        };
    }
    async verify(message, signature, publicKey) {
        try {
            const decoded = Buffer.from(signature.signature, 'base64').toString();
            const [commitment, challenge, response] = decoded.split(':');
            const expectedChallenge = crypto
                .createHash('sha256')
                .update(message)
                .update(commitment)
                .digest('hex');
            if (expectedChallenge !== challenge) {
                return false;
            }
            return response.length === 128 && commitment.length === 64;
        }
        catch (error) {
            this.logger.error('Signature verification failed:', error);
            return false;
        }
    }
    async signTypedData(typedData, secretKey) {
        const encoded = JSON.stringify({
            domain: typedData.domain,
            types: typedData.types,
            message: typedData.message,
        });
        const hash = crypto.createHash('sha256').update(encoded).digest('hex');
        return this.sign(hash, secretKey);
    }
};
exports.PostQuantumCryptoService = PostQuantumCryptoService;
exports.PostQuantumCryptoService = PostQuantumCryptoService = PostQuantumCryptoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [qrng_service_1.QRNGService])
], PostQuantumCryptoService);
//# sourceMappingURL=post-quantum-crypto.service.js.map