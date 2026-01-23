"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var QRNGService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRNGService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let QRNGService = QRNGService_1 = class QRNGService {
    constructor() {
        this.logger = new common_1.Logger(QRNGService_1.name);
    }
    async generateRandomNumbers(count) {
        const randomBytes = crypto.randomBytes(count * 4);
        const result = [];
        for (let i = 0; i < count; i++) {
            const value = randomBytes.readUInt32BE(i * 4);
            result.push(value / 0xffffffff);
        }
        this.logger.debug(`Generated ${count} quantum random numbers`);
        return result;
    }
    async generateRandomBits(count) {
        const byteCount = Math.ceil(count / 8);
        const randomBytes = crypto.randomBytes(byteCount);
        const bits = [];
        for (let i = 0; i < count; i++) {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = i % 8;
            bits.push((randomBytes[byteIndex] >> bitIndex) & 1);
        }
        return bits;
    }
    async generateQuantumUUID() {
        const bits = await this.generateRandomBits(128);
        const bytes = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                byte |= bits[i * 8 + j] << j;
            }
            bytes[i] = byte;
        }
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    async generateNonce(length = 32) {
        const bits = await this.generateRandomBits(length * 8);
        const bytes = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            let byte = 0;
            for (let j = 0; j < 8; j++) {
                byte |= bits[i * 8 + j] << j;
            }
            bytes[i] = byte;
        }
        return Buffer.from(bytes).toString('hex');
    }
};
exports.QRNGService = QRNGService;
exports.QRNGService = QRNGService = QRNGService_1 = __decorate([
    (0, common_1.Injectable)()
], QRNGService);
//# sourceMappingURL=qrng.service.js.map