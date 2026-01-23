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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDecision = exports.DecisionStatus = exports.DecisionType = void 0;
const typeorm_1 = require("typeorm");
var DecisionType;
(function (DecisionType) {
    DecisionType["BUY"] = "buy";
    DecisionType["SELL"] = "sell";
    DecisionType["HOLD"] = "hold";
    DecisionType["REBALANCE"] = "rebalance";
    DecisionType["PURCHASE_API"] = "purchase_api";
})(DecisionType || (exports.DecisionType = DecisionType = {}));
var DecisionStatus;
(function (DecisionStatus) {
    DecisionStatus["PENDING"] = "pending";
    DecisionStatus["VERIFYING"] = "verifying";
    DecisionStatus["VERIFIED"] = "verified";
    DecisionStatus["REJECTED"] = "rejected";
    DecisionStatus["EXECUTED"] = "executed";
    DecisionStatus["FAILED"] = "failed";
})(DecisionStatus || (exports.DecisionStatus = DecisionStatus = {}));
let AgentDecision = class AgentDecision {
};
exports.AgentDecision = AgentDecision;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AgentDecision.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AgentDecision.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], AgentDecision.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: DecisionStatus.PENDING }),
    __metadata("design:type", String)
], AgentDecision.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json' }),
    __metadata("design:type", Object)
], AgentDecision.prototype, "parameters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], AgentDecision.prototype, "reasoning", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], AgentDecision.prototype, "quantumAnalysis", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], AgentDecision.prototype, "verificationResult", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgentDecision.prototype, "transactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AgentDecision.prototype, "postQuantumSignature", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AgentDecision.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AgentDecision.prototype, "updatedAt", void 0);
exports.AgentDecision = AgentDecision = __decorate([
    (0, typeorm_1.Entity)('agent_decisions')
], AgentDecision);
//# sourceMappingURL=agent-decision.entity.js.map