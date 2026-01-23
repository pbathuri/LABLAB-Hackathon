import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CircleWallet, CircleWalletType } from './entities/circle-wallet.entity';
import { GatewayTransfer } from './entities/gateway-transfer.entity';
export interface CircleConfigStatus {
    consoleUrl: string;
    arc: {
        chainId: number;
        usdcContract?: string | null;
    };
    wallets: {
        enabled: boolean;
    };
    gateway: {
        enabled: boolean;
    };
    bridge: {
        enabled: boolean;
    };
    x402: {
        enabled: boolean;
    };
    appBuilder: {
        enabled: boolean;
    };
}
export declare class CircleService {
    private readonly configService;
    private readonly walletRepository;
    private readonly gatewayRepository;
    private readonly logger;
    constructor(configService: ConfigService, walletRepository: Repository<CircleWallet>, gatewayRepository: Repository<GatewayTransfer>);
    getConfigStatus(): CircleConfigStatus;
    getRequiredEnv(): {
        arc: string[];
        wallets: string[];
        gateway: string[];
        bridge: string[];
        x402: string[];
        appBuilder: string[];
    };
    createWallet(params: {
        userId: string;
        type?: CircleWalletType;
        label?: string;
    }): Promise<CircleWallet>;
    listWallets(userId: string): Promise<CircleWallet[]>;
    getWalletBalance(walletId: string): Promise<{
        walletId: string;
        address: string;
        balances: {
            USDC?: string;
            ARC?: string;
        };
    }>;
    createGatewayTransfer(params: {
        userId: string;
        amount: string;
        sourceChain: string;
        destinationChain: string;
        fromWalletId?: string;
        fromAddress?: string;
        toAddress?: string;
        referenceId?: string;
        notes?: string;
    }): Promise<GatewayTransfer>;
    listGatewayTransfers(userId: string, limit?: number): Promise<GatewayTransfer[]>;
}
