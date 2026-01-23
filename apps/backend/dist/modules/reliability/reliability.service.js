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
var ReliabilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReliabilityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const provider_entity_1 = require("./entities/provider.entity");
let ReliabilityService = ReliabilityService_1 = class ReliabilityService {
    constructor(providerRepository) {
        this.providerRepository = providerRepository;
        this.logger = new common_1.Logger(ReliabilityService_1.name);
        this.GAMMA = 0.8;
        this.BLACKLIST_THRESHOLD = 0.3;
    }
    async registerProvider(name, endpoint, description, costPerCall) {
        const existing = await this.providerRepository.findOne({
            where: { endpoint },
        });
        if (existing) {
            return existing;
        }
        const provider = this.providerRepository.create({
            name,
            endpoint,
            description,
            costPerCall,
            successRate: '1',
            averageLatencyMs: '100',
            reliabilityScore: '1',
        });
        await this.providerRepository.save(provider);
        this.logger.log(`Registered provider: ${name}`);
        return provider;
    }
    async recordSuccess(providerId, latencyMs) {
        const provider = await this.providerRepository.findOne({
            where: { id: providerId },
        });
        if (!provider) {
            return;
        }
        provider.totalCalls += 1;
        provider.successfulCalls += 1;
        provider.successRate = (provider.successfulCalls / provider.totalCalls).toFixed(4);
        const alpha = 0.1;
        const currentAvg = parseFloat(provider.averageLatencyMs);
        provider.averageLatencyMs = (alpha * latencyMs +
            (1 - alpha) * currentAvg).toFixed(2);
        provider.reliabilityScore = this.calculateReliabilityScore(provider);
        if (parseFloat(provider.reliabilityScore) < this.BLACKLIST_THRESHOLD) {
            provider.isBlacklisted = true;
            this.logger.warn(`Provider ${provider.name} blacklisted due to low reliability`);
        }
        await this.providerRepository.save(provider);
    }
    async recordFailure(providerId) {
        const provider = await this.providerRepository.findOne({
            where: { id: providerId },
        });
        if (!provider) {
            return;
        }
        provider.totalCalls += 1;
        provider.successRate = (provider.successfulCalls / provider.totalCalls).toFixed(4);
        provider.reliabilityScore = this.calculateReliabilityScore(provider);
        if (parseFloat(provider.reliabilityScore) < this.BLACKLIST_THRESHOLD) {
            provider.isBlacklisted = true;
            this.logger.warn(`Provider ${provider.name} blacklisted due to low reliability`);
        }
        await this.providerRepository.save(provider);
    }
    async getProvidersByReliability(excludeBlacklisted = true) {
        const query = this.providerRepository.createQueryBuilder('provider');
        if (excludeBlacklisted) {
            query.where('provider.isBlacklisted = :blacklisted', {
                blacklisted: false,
            });
        }
        return query
            .orderBy('provider.reliabilityScore', 'DESC')
            .getMany();
    }
    async selectBestProvider() {
        const providers = await this.getProvidersByReliability(true);
        return providers[0] || null;
    }
    calculateReliabilityScore(provider) {
        const successRate = parseFloat(provider.successRate);
        const latencySeconds = parseFloat(provider.averageLatencyMs) / 1000;
        const latencyComponent = 1 / (1 + latencySeconds);
        const score = this.GAMMA * successRate + (1 - this.GAMMA) * latencyComponent;
        return score.toFixed(4);
    }
    async getProviderStats() {
        const providers = await this.providerRepository.find();
        const active = providers.filter((p) => !p.isBlacklisted);
        const blacklisted = providers.filter((p) => p.isBlacklisted);
        const avgReliability = providers.length > 0
            ? providers.reduce((sum, p) => sum + parseFloat(p.reliabilityScore), 0) / providers.length
            : 0;
        return {
            totalProviders: providers.length,
            activeProviders: active.length,
            blacklistedProviders: blacklisted.length,
            averageReliability: Math.round(avgReliability * 10000) / 10000,
        };
    }
};
exports.ReliabilityService = ReliabilityService;
exports.ReliabilityService = ReliabilityService = ReliabilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(provider_entity_1.Provider)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReliabilityService);
//# sourceMappingURL=reliability.service.js.map