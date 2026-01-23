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
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const wallet_service_1 = require("./wallet.service");
class SettlementDto {
}
let WalletController = class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    async createWallet(req) {
        return this.walletService.createWallet(req.user.id);
    }
    async getWallet(req) {
        return this.walletService.getWallet(req.user.id);
    }
    async getBalance(req) {
        const wallet = await this.walletService.getWallet(req.user.id);
        if (!wallet) {
            return { error: 'Wallet not found' };
        }
        return this.walletService.getBalance(wallet.id);
    }
    async getTransactions(req) {
        const wallet = await this.walletService.getWallet(req.user.id);
        if (!wallet) {
            return [];
        }
        return this.walletService.getTransactionHistory(wallet.id);
    }
    async executeSettlement(req, dto) {
        const wallet = await this.walletService.getWallet(req.user.id);
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        return this.walletService.executeSettlement(wallet.id, dto.toAddress, dto.amount, dto.asset);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new wallet for current user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Wallet created' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "createWallet", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user wallet' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Wallet returned' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getWallet", null);
__decorate([
    (0, common_1.Get)('balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get wallet balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Balance returned' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getBalance", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions returned' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('settle'),
    (0, swagger_1.ApiOperation)({ summary: 'Execute a settlement transaction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Settlement executed' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, SettlementDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "executeSettlement", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('wallet'),
    (0, common_1.Controller)('wallet'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
//# sourceMappingURL=wallet.controller.js.map