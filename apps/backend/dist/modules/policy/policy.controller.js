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
exports.PolicyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const policy_service_1 = require("./policy.service");
class UpdatePolicyDto {
}
let PolicyController = class PolicyController {
    constructor(policyService) {
        this.policyService = policyService;
    }
    async getPolicy(req) {
        return this.policyService.getPolicyConfig(req.user.id);
    }
    async updatePolicy(req, dto) {
        return this.policyService.updatePolicyConfig(req.user.id, dto);
    }
};
exports.PolicyController = PolicyController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get policy configuration for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Policy config returned' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "getPolicy", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update policy configuration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Policy config updated' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdatePolicyDto]),
    __metadata("design:returntype", Promise)
], PolicyController.prototype, "updatePolicy", null);
exports.PolicyController = PolicyController = __decorate([
    (0, swagger_1.ApiTags)('policy'),
    (0, common_1.Controller)('policy'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [policy_service_1.PolicyService])
], PolicyController);
//# sourceMappingURL=policy.controller.js.map