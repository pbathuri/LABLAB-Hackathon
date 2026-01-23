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
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const class_validator_1 = require("class-validator");
const agent_service_1 = require("./agent.service");
class MakeDecisionDto {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MakeDecisionDto.prototype, "instruction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], MakeDecisionDto.prototype, "portfolioState", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], MakeDecisionDto.prototype, "marketData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MakeDecisionDto.prototype, "riskTolerance", void 0);
let AgentController = class AgentController {
    constructor(agentService) {
        this.agentService = agentService;
    }
    async makeDecision(req, dto) {
        const context = {
            userId: req.user.id,
            instruction: dto.instruction || 'Optimize portfolio based on current market conditions',
            portfolioState: dto.portfolioState || { USDC: 1000, BTC: 0.01, ETH: 0.5 },
            marketData: dto.marketData || {},
            riskTolerance: dto.riskTolerance || 0.5,
        };
        return this.agentService.makeDecision(context);
    }
    async executeDecision(id) {
        return this.agentService.executeDecision(id);
    }
    async explainDecision(id) {
        const explanation = await this.agentService.explainDecision(id);
        return { explanation };
    }
    async getHistory(req) {
        return this.agentService.getDecisionHistory(req.user.id);
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Post)('decide'),
    (0, swagger_1.ApiOperation)({ summary: 'Request AI agent to make a trading decision' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Decision created and verification initiated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, MakeDecisionDto]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "makeDecision", null);
__decorate([
    (0, common_1.Post)('execute/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a verified decision' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Decision executed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Decision not verified or not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "executeDecision", null);
__decorate([
    (0, common_1.Get)('explain/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Captain Whiskers explanation for a decision' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Explanation returned' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "explainDecision", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get decision history for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Decision history returned' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentController.prototype, "getHistory", null);
exports.AgentController = AgentController = __decorate([
    (0, swagger_1.ApiTags)('agent'),
    (0, common_1.Controller)('agent'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
//# sourceMappingURL=agent.controller.js.map