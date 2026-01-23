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
exports.MicropaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const micropayment_service_1 = require("./micropayment.service");
class CreatePaymentDto {
}
class CompletePaymentDto {
}
let MicropaymentController = class MicropaymentController {
    constructor(micropaymentService) {
        this.micropaymentService = micropaymentService;
    }
    async createPayment(req, dto) {
        const wallet = req.user.walletAddress || '0x0000000000000000000000000000000000000000';
        return this.micropaymentService.createPaymentRequest({
            userId: req.user.id,
            payer: wallet,
            payee: dto.payee,
            amount: dto.amount,
            apiEndpoint: dto.apiEndpoint,
            providerId: dto.providerId,
            model: dto.model,
            description: dto.description,
        });
    }
    async authorizePayment(id) {
        return this.micropaymentService.authorizePayment(id);
    }
    async completePayment(id, dto) {
        return this.micropaymentService.completePayment(id, dto.callResult);
    }
    async failPayment(id, body) {
        return this.micropaymentService.failPayment(id, body.reason);
    }
    async refundPayment(id) {
        return this.micropaymentService.refundPayment(id);
    }
    async getHistory(req) {
        return this.micropaymentService.getPaymentHistory(req.user.id);
    }
};
exports.MicropaymentController = MicropaymentController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new micropayment request (x402)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment request created' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], MicropaymentController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Post)(':id/authorize'),
    (0, swagger_1.ApiOperation)({ summary: 'Authorize a payment request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment authorized' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MicropaymentController.prototype, "authorizePayment", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete a payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment completed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CompletePaymentDto]),
    __metadata("design:returntype", Promise)
], MicropaymentController.prototype, "completePayment", null);
__decorate([
    (0, common_1.Post)(':id/fail'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark payment as failed' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment marked as failed' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MicropaymentController.prototype, "failPayment", null);
__decorate([
    (0, common_1.Post)(':id/refund'),
    (0, swagger_1.ApiOperation)({ summary: 'Refund a completed payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment refunded' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MicropaymentController.prototype, "refundPayment", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment history returned' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MicropaymentController.prototype, "getHistory", null);
exports.MicropaymentController = MicropaymentController = __decorate([
    (0, swagger_1.ApiTags)('micropayments'),
    (0, common_1.Controller)('micropayments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [micropayment_service_1.MicropaymentService])
], MicropaymentController);
//# sourceMappingURL=micropayment.controller.js.map