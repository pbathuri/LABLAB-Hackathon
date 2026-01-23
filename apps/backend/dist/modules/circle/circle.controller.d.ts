import { CircleService } from './circle.service';
import { CircleWalletType } from './entities/circle-wallet.entity';
export declare class CircleController {
    private readonly circleService;
    constructor(circleService: CircleService);
    getConfig(): import("./circle.service").CircleConfigStatus;
    getRequirements(): {
        arc: string[];
        wallets: string[];
        gateway: string[];
        bridge: string[];
        x402: string[];
        appBuilder: string[];
    };
    createWallet(req: any, body: {
        type?: CircleWalletType;
        label?: string;
    }): Promise<import("./entities/circle-wallet.entity").CircleWallet>;
    listWallets(req: any): Promise<import("./entities/circle-wallet.entity").CircleWallet[]>;
    getWalletBalance(walletId: string): Promise<{
        walletId: string;
        address: string;
        balances: {
            USDC?: string;
            ARC?: string;
        };
    }>;
    createGatewaySettlement(req: any, body: {
        amount: string;
        sourceChain: string;
        destinationChain: string;
        fromWalletId?: string;
        fromAddress?: string;
        toAddress?: string;
        referenceId?: string;
        notes?: string;
    }): Promise<import("./entities/gateway-transfer.entity").GatewayTransfer>;
    listGatewayTransfers(req: any): Promise<import("./entities/gateway-transfer.entity").GatewayTransfer[]>;
}
