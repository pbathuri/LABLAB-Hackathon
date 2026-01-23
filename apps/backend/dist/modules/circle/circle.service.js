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
var CircleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircleService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const circle_wallet_entity_1 = require("./entities/circle-wallet.entity");
const gateway_transfer_entity_1 = require("./entities/gateway-transfer.entity");
let CircleService = CircleService_1 = class CircleService {
    constructor(configService, walletRepository, gatewayRepository) {
        this.configService = configService;
        this.walletRepository = walletRepository;
        this.gatewayRepository = gatewayRepository;
        this.logger = new common_1.Logger(CircleService_1.name);
    }
    getConfigStatus() {
        return {
            consoleUrl: this.configService.get('CIRCLE_CONSOLE_URL') ||
                'https://console.circle.com',
            arc: {
                chainId: this.configService.get('ARC_CHAIN_ID', 5042002),
                usdcContract: this.configService.get('USDC_CONTRACT') ||
                    this.configService.get('NEXT_PUBLIC_USDC_CONTRACT') ||
                    null,
            },
            wallets: {
                enabled: Boolean(this.configService.get('CIRCLE_WALLET_API_KEY') ||
                    this.configService.get('CIRCLE_WALLETS_API_KEY')),
            },
            gateway: {
                enabled: Boolean(this.configService.get('CIRCLE_GATEWAY_API_KEY') ||
                    this.configService.get('CIRCLE_GATEWAY_URL')),
            },
            bridge: {
                enabled: Boolean(this.configService.get('CIRCLE_BRIDGE_API_KEY') ||
                    this.configService.get('CIRCLE_BRIDGE_URL')),
            },
            x402: {
                enabled: Boolean(this.configService.get('X402_FACILITATOR_URL') ||
                    this.configService.get('X402_FACILITATOR_KEY')),
            },
            appBuilder: {
                enabled: Boolean(this.configService.get('CIRCLE_APP_BUILDER_ENABLED') ||
                    this.configService.get('CIRCLE_APP_BUILDER_PROJECT_ID')),
            },
        };
    }
    getRequiredEnv() {
        return {
            arc: ['ARC_CHAIN_ID', 'USDC_CONTRACT'],
            wallets: ['CIRCLE_WALLET_API_KEY'],
            gateway: ['CIRCLE_GATEWAY_API_KEY', 'CIRCLE_GATEWAY_URL'],
            bridge: ['CIRCLE_BRIDGE_API_KEY', 'CIRCLE_BRIDGE_URL'],
            x402: ['X402_FACILITATOR_URL'],
            appBuilder: ['CIRCLE_APP_BUILDER_ENABLED'],
        };
    }
    async createWallet(params) {
        const walletId = `cw_${(0, crypto_1.randomBytes)(6).toString('hex')}`;
        const address = `0x${(0, crypto_1.randomBytes)(20).toString('hex')}`;
        const wallet = this.walletRepository.create({
            userId: params.userId,
            walletId,
            address,
            type: params.type || circle_wallet_entity_1.CircleWalletType.DEV_CONTROLLED,
            status: 'active',
            metadata: {
                label: params.label,
                balances: {
                    USDC: '1000.00',
                    ARC: '5.00',
                },
            },
        });
        await this.walletRepository.save(wallet);
        this.logger.log(`Created Circle wallet ${wallet.walletId} for ${wallet.userId}`);
        return wallet;
    }
    async listWallets(userId) {
        return this.walletRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getWalletBalance(walletId) {
        const wallet = await this.walletRepository.findOne({
            where: [{ id: walletId }, { walletId }],
        });
        if (!wallet) {
            throw new common_1.BadRequestException('Wallet not found');
        }
        return {
            walletId: wallet.walletId,
            address: wallet.address,
            balances: wallet.metadata?.balances || { USDC: '0', ARC: '0' },
        };
    }
    async createGatewayTransfer(params) {
        const transfer = this.gatewayRepository.create({
            userId: params.userId,
            amount: params.amount,
            sourceChain: params.sourceChain,
            destinationChain: params.destinationChain,
            fromWalletId: params.fromWalletId,
            fromAddress: params.fromAddress,
            toAddress: params.toAddress,
            status: gateway_transfer_entity_1.GatewayTransferStatus.PENDING,
            metadata: {
                referenceId: params.referenceId,
                notes: params.notes,
            },
        });
        await this.gatewayRepository.save(transfer);
        transfer.status = gateway_transfer_entity_1.GatewayTransferStatus.COMPLETED;
        transfer.txHash = `0x${(0, crypto_1.randomBytes)(32).toString('hex')}`;
        await this.gatewayRepository.save(transfer);
        this.logger.log(`Gateway settlement completed: ${transfer.id}`);
        return transfer;
    }
    async listGatewayTransfers(userId, limit = 50) {
        return this.gatewayRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
};
exports.CircleService = CircleService;
exports.CircleService = CircleService = CircleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(circle_wallet_entity_1.CircleWallet)),
    __param(2, (0, typeorm_1.InjectRepository)(gateway_transfer_entity_1.GatewayTransfer)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CircleService);
//# sourceMappingURL=circle.service.js.map