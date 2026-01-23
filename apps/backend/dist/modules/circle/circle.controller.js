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
exports.CircleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const circle_service_1 = require("./circle.service");
let CircleController = class CircleController {
    constructor(circleService) {
        this.circleService = circleService;
    }
    getConfig() {
        return this.circleService.getConfigStatus();
    }
    getRequirements() {
        return this.circleService.getRequiredEnv();
    }
    createWallet(req, body) {
        return this.circleService.createWallet({
            userId: req.user.id,
            type: body.type,
            label: body.label,
        });
    }
    listWallets(req) {
        return this.circleService.listWallets(req.user.id);
    }
    getWalletBalance(walletId) {
        return this.circleService.getWalletBalance(walletId);
    }
    createGatewaySettlement(req, body) {
        return this.circleService.createGatewayTransfer({
            userId: req.user.id,
            amount: body.amount,
            sourceChain: body.sourceChain,
            destinationChain: body.destinationChain,
            fromWalletId: body.fromWalletId,
            fromAddress: body.fromAddress,
            toAddress: body.toAddress,
            referenceId: body.referenceId,
            notes: body.notes,
        });
    }
    listGatewayTransfers(req) {
        return this.circleService.listGatewayTransfers(req.user.id);
    }
};
exports.CircleController = CircleController;
__decorate([
    (0, common_1.Get)('config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Circle integration configuration status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration status returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CircleController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('requirements'),
    (0, swagger_1.ApiOperation)({ summary: 'Get required environment variables for Circle services' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Requirements returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CircleController.prototype, "getRequirements", null);
__decorate([
    (0, common_1.Post)('wallets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Circle wallet (dev or user controlled)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Wallet created' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CircleController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Get)('wallets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'List Circle wallets for the current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet list returned' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CircleController.prototype, "listWallets", null);
__decorate([
    (0, common_1.Get)('wallets/:walletId/balance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Get Circle wallet balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet balance returned' }),
    __param(0, (0, common_1.Param)('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CircleController.prototype, "getWalletBalance", null);
__decorate([
    (0, common_1.Post)('gateway/settle'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'Create a Gateway settlement transfer' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Gateway settlement created' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CircleController.prototype, "createGatewaySettlement", null);
__decorate([
    (0, common_1.Get)('gateway/transfers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, swagger_1.ApiOperation)({ summary: 'List Gateway settlement transfers' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Gateway transfers returned' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CircleController.prototype, "listGatewayTransfers", null);
exports.CircleController = CircleController = __decorate([
    (0, swagger_1.ApiTags)('circle'),
    (0, common_1.Controller)('circle'),
    __metadata("design:paramtypes", [circle_service_1.CircleService])
], CircleController);
//# sourceMappingURL=circle.controller.js.map