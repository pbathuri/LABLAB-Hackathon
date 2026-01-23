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
var AgentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gemini_service_1 = require("./services/gemini.service");
const agent_decision_entity_1 = require("./entities/agent-decision.entity");
const verification_service_1 = require("../verification/verification.service");
const quantum_service_1 = require("../quantum/quantum.service");
const policy_service_1 = require("../policy/policy.service");
let AgentService = AgentService_1 = class AgentService {
    constructor(decisionRepository, geminiService, verificationService, quantumService, policyService) {
        this.decisionRepository = decisionRepository;
        this.geminiService = geminiService;
        this.verificationService = verificationService;
        this.quantumService = quantumService;
        this.policyService = policyService;
        this.logger = new common_1.Logger(AgentService_1.name);
    }
    async makeDecision(context) {
        this.logger.log(`Making decision for user ${context.userId}`);
        const quantumAnalysis = await this.quantumService.optimizePortfolio(context.portfolioState, context.riskTolerance);
        const aiDecision = await this.geminiService.processInstruction(context.instruction, {
            portfolio: context.portfolioState,
            policy: { riskTolerance: context.riskTolerance },
            recentTransactions: [],
        });
        const decision = this.decisionRepository.create({
            userId: context.userId,
            type: this.mapActionToType(aiDecision.action),
            status: agent_decision_entity_1.DecisionStatus.PENDING,
            parameters: {
                asset: aiDecision.parameters.asset || 'USDC',
                quantity: aiDecision.parameters.amount || 0,
            },
            reasoning: aiDecision.reasoning,
            quantumAnalysis: {
                optimizedWeights: quantumAnalysis.weights,
                expectedReturn: quantumAnalysis.expectedReturn,
                riskMetrics: {
                    variance: quantumAnalysis.variance,
                    sharpeRatio: quantumAnalysis.sharpeRatio,
                },
            },
        });
        await this.decisionRepository.save(decision);
        const policyCheck = await this.policyService.validateDecision(context.userId, decision);
        if (!policyCheck.valid) {
            decision.status = agent_decision_entity_1.DecisionStatus.REJECTED;
            decision.reasoning += `\n\n⚠️ Policy violation: ${policyCheck.reason}`;
            await this.decisionRepository.save(decision);
            return decision;
        }
        decision.status = agent_decision_entity_1.DecisionStatus.VERIFYING;
        await this.decisionRepository.save(decision);
        const verificationResult = await this.verificationService.verifyTransaction({
            type: decision.type,
            userId: context.userId,
            amount: decision.parameters.quantity,
            parameters: decision.parameters,
        });
        decision.verificationResult = {
            totalSignatures: verificationResult.signatureCount,
            requiredSignatures: verificationResult.requiredSignatures,
            verifierAddresses: verificationResult.signatures.map(s => s.address),
            consensusReached: verificationResult.approved,
            timestamp: verificationResult.timestamp.toISOString(),
        };
        decision.status = verificationResult.approved
            ? agent_decision_entity_1.DecisionStatus.VERIFIED
            : agent_decision_entity_1.DecisionStatus.REJECTED;
        await this.decisionRepository.save(decision);
        return decision;
    }
    async executeDecision(decisionId) {
        const decision = await this.decisionRepository.findOne({
            where: { id: decisionId },
        });
        if (!decision) {
            throw new common_1.BadRequestException('Decision not found');
        }
        if (decision.status !== agent_decision_entity_1.DecisionStatus.VERIFIED) {
            throw new common_1.BadRequestException('Decision not verified');
        }
        decision.status = agent_decision_entity_1.DecisionStatus.EXECUTED;
        decision.transactionHash = `0x${this.generateMockTxHash()}`;
        await this.decisionRepository.save(decision);
        return decision;
    }
    async explainDecision(decisionId) {
        const decision = await this.decisionRepository.findOne({
            where: { id: decisionId },
        });
        if (!decision) {
            throw new common_1.BadRequestException('Decision not found');
        }
        const tradingDecision = {
            action: this.mapTypeToAction(decision.type),
            confidence: 0.8,
            reasoning: decision.reasoning,
            parameters: decision.parameters,
            functionCalls: [],
        };
        return this.geminiService.explainDecision(tradingDecision);
    }
    async getDecisionHistory(userId, limit = 20) {
        return this.decisionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    mapActionToType(action) {
        const normalizedAction = action.toLowerCase();
        const mapping = {
            buy: agent_decision_entity_1.DecisionType.BUY,
            sell: agent_decision_entity_1.DecisionType.SELL,
            hold: agent_decision_entity_1.DecisionType.HOLD,
            rebalance: agent_decision_entity_1.DecisionType.REBALANCE,
            transfer: agent_decision_entity_1.DecisionType.BUY,
            optimize: agent_decision_entity_1.DecisionType.REBALANCE,
            purchase_api: agent_decision_entity_1.DecisionType.PURCHASE_API,
        };
        return mapping[normalizedAction] || agent_decision_entity_1.DecisionType.HOLD;
    }
    mapTypeToAction(type) {
        const mapping = {
            [agent_decision_entity_1.DecisionType.BUY]: 'BUY',
            [agent_decision_entity_1.DecisionType.SELL]: 'SELL',
            [agent_decision_entity_1.DecisionType.HOLD]: 'HOLD',
            [agent_decision_entity_1.DecisionType.REBALANCE]: 'OPTIMIZE',
            [agent_decision_entity_1.DecisionType.PURCHASE_API]: 'BUY',
        };
        return mapping[type];
    }
    generateMockTxHash() {
        return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = AgentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_decision_entity_1.AgentDecision)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        gemini_service_1.GeminiService,
        verification_service_1.VerificationService,
        quantum_service_1.QuantumService,
        policy_service_1.PolicyService])
], AgentService);
//# sourceMappingURL=agent.service.js.map