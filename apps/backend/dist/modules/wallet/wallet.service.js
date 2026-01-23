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
var WalletService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ethers_1 = require("ethers");
const config_1 = require("@nestjs/config");
const wallet_entity_1 = require("./entities/wallet.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
let WalletService = WalletService_1 = class WalletService {
    constructor(walletRepository, transactionRepository, configService) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(WalletService_1.name);
        const rpcUrl = this.configService.get('ARC_RPC_URL', 'https://rpc.testnet.arc.dev');
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
    }
    async createWallet(userId) {
        const ethWallet = ethers_1.ethers.Wallet.createRandom();
        const wallet = this.walletRepository.create({
            userId,
            address: ethWallet.address,
            balances: {
                USDC: '0',
                ETH: '0',
            },
            network: 'arc-testnet',
        });
        await this.walletRepository.save(wallet);
        this.logger.log(`Created wallet ${wallet.address} for user ${userId}`);
        return wallet;
    }
    async getWallet(userId) {
        return this.walletRepository.findOne({ where: { userId } });
    }
    async getBalance(walletId) {
        const wallet = await this.walletRepository.findOne({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new common_1.BadRequestException('Wallet not found');
        }
        try {
            const ethBalance = await this.provider.getBalance(wallet.address);
            return {
                ...wallet.balances,
                ETH: ethers_1.ethers.formatEther(ethBalance),
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch balance:', error);
            return wallet.balances;
        }
    }
    async recordTransaction(walletId, type, asset, amount, metadata) {
        const wallet = await this.walletRepository.findOne({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new common_1.BadRequestException('Wallet not found');
        }
        const transaction = this.transactionRepository.create({
            walletId,
            type,
            asset,
            amount,
            fromAddress: wallet.address,
            metadata,
        });
        await this.transactionRepository.save(transaction);
        return transaction;
    }
    async getTransactionHistory(walletId, limit = 50) {
        return this.transactionRepository.find({
            where: { walletId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async executeSettlement(walletId, toAddress, amount, asset) {
        const wallet = await this.walletRepository.findOne({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new common_1.BadRequestException('Wallet not found');
        }
        const transaction = this.transactionRepository.create({
            walletId,
            type: transaction_entity_1.TransactionType.SETTLEMENT,
            asset,
            amount,
            fromAddress: wallet.address,
            toAddress,
            status: transaction_entity_1.TransactionStatus.PENDING,
        });
        await this.transactionRepository.save(transaction);
        transaction.status = transaction_entity_1.TransactionStatus.CONFIRMED;
        transaction.transactionHash = `0x${this.generateMockTxHash()}`;
        transaction.blockNumber = Math.floor(Math.random() * 1000000);
        await this.transactionRepository.save(transaction);
        this.logger.log(`Settlement executed: ${amount} ${asset} to ${toAddress}`);
        return transaction;
    }
    generateMockTxHash() {
        return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = WalletService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map