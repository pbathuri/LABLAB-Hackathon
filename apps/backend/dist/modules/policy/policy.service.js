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
var PolicyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const policy_config_entity_1 = require("./entities/policy-config.entity");
let PolicyService = PolicyService_1 = class PolicyService {
    constructor(policyRepository) {
        this.policyRepository = policyRepository;
        this.logger = new common_1.Logger(PolicyService_1.name);
    }
    async getPolicyConfig(userId) {
        let config = await this.policyRepository.findOne({
            where: { userId },
        });
        if (!config) {
            config = this.policyRepository.create({
                userId,
                maxTransactionAmount: '50',
                dailySpendingCap: '500',
                currentDailySpend: '0',
                cooldownPeriodSeconds: 60,
                maxPriceDeviationPercent: '5',
                allowedAddresses: [],
                riskTolerance: '0.5',
            });
            await this.policyRepository.save(config);
        }
        await this.resetDailySpendIfNeeded(config);
        return config;
    }
    async updatePolicyConfig(userId, updates) {
        let config = await this.getPolicyConfig(userId);
        Object.assign(config, updates);
        await this.policyRepository.save(config);
        this.logger.log(`Updated policy config for user ${userId}`);
        return config;
    }
    async validateDecision(userId, decision) {
        const config = await this.getPolicyConfig(userId);
        const checks = [];
        const amount = decision.parameters.amount || decision.parameters.quantity || 0;
        const maxTx = parseFloat(config.maxTransactionAmount);
        const txLimitCheck = amount <= maxTx;
        checks.push({
            name: 'per_transaction_limit',
            passed: txLimitCheck,
            message: txLimitCheck
                ? undefined
                : `Amount ${amount} exceeds limit ${maxTx} USDC`,
        });
        const currentSpend = parseFloat(config.currentDailySpend);
        const dailyCap = parseFloat(config.dailySpendingCap);
        const newTotal = currentSpend + amount;
        const dailyCapCheck = newTotal <= dailyCap;
        checks.push({
            name: 'daily_spending_cap',
            passed: dailyCapCheck,
            message: dailyCapCheck
                ? undefined
                : `Daily spend ${newTotal} would exceed cap ${dailyCap} USDC`,
        });
        const cooldownCheck = this.checkCooldown(config);
        checks.push({
            name: 'cooldown_period',
            passed: cooldownCheck.passed,
            message: cooldownCheck.message,
        });
        if (decision.parameters.targetAddress) {
            const allowlistCheck = this.checkAllowlist(config, decision.parameters.targetAddress);
            checks.push({
                name: 'allowlist',
                passed: allowlistCheck.passed,
                message: allowlistCheck.message,
            });
        }
        if (decision.parameters.price) {
            const priceCheck = this.checkPriceDeviation(config, decision.parameters.price);
            checks.push({
                name: 'price_deviation',
                passed: priceCheck.passed,
                message: priceCheck.message,
            });
        }
        const allPassed = checks.every((c) => c.passed);
        const failedChecks = checks.filter((c) => !c.passed);
        return {
            valid: allPassed,
            reason: allPassed
                ? undefined
                : failedChecks.map((c) => c.message).join('; '),
            checks,
        };
    }
    async recordTransaction(userId, amount) {
        const config = await this.getPolicyConfig(userId);
        config.currentDailySpend = (parseFloat(config.currentDailySpend) + amount).toString();
        config.lastTradeTimestamp = new Date();
        await this.policyRepository.save(config);
    }
    checkCooldown(config) {
        if (!config.lastTradeTimestamp) {
            return { passed: true };
        }
        const lastTrade = new Date(config.lastTradeTimestamp).getTime();
        const now = Date.now();
        const elapsed = (now - lastTrade) / 1000;
        if (elapsed < config.cooldownPeriodSeconds) {
            const remaining = Math.ceil(config.cooldownPeriodSeconds - elapsed);
            return {
                passed: false,
                message: `Cooldown active: ${remaining}s remaining`,
            };
        }
        return { passed: true };
    }
    checkAllowlist(config, address) {
        if (config.allowedAddresses.length === 0) {
            return { passed: true };
        }
        const isAllowed = config.allowedAddresses.some((a) => a.toLowerCase() === address.toLowerCase());
        return {
            passed: isAllowed,
            message: isAllowed ? undefined : `Address ${address} not in allowlist`,
        };
    }
    checkPriceDeviation(config, proposedPrice) {
        const medianPrice = 1.0;
        const maxDeviation = parseFloat(config.maxPriceDeviationPercent) / 100;
        const deviation = Math.abs(proposedPrice - medianPrice) / medianPrice;
        if (deviation > maxDeviation) {
            return {
                passed: false,
                message: `Price deviation ${(deviation * 100).toFixed(2)}% exceeds max ${config.maxPriceDeviationPercent}%`,
            };
        }
        return { passed: true };
    }
    async resetDailySpendIfNeeded(config) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastReset = config.lastSpendResetDate
            ? new Date(config.lastSpendResetDate)
            : null;
        if (!lastReset || lastReset < today) {
            config.currentDailySpend = '0';
            config.lastSpendResetDate = today;
            await this.policyRepository.save(config);
            this.logger.log(`Reset daily spend for user ${config.userId}`);
        }
    }
};
exports.PolicyService = PolicyService;
exports.PolicyService = PolicyService = PolicyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(policy_config_entity_1.PolicyConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PolicyService);
//# sourceMappingURL=policy.service.js.map