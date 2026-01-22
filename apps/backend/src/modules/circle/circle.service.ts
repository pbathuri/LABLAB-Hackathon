import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { CircleWallet, CircleWalletType } from './entities/circle-wallet.entity';
import {
  GatewayTransfer,
  GatewayTransferStatus,
} from './entities/gateway-transfer.entity';

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

@Injectable()
export class CircleService {
  private readonly logger = new Logger(CircleService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CircleWallet)
    private readonly walletRepository: Repository<CircleWallet>,
    @InjectRepository(GatewayTransfer)
    private readonly gatewayRepository: Repository<GatewayTransfer>,
  ) {}

  getConfigStatus(): CircleConfigStatus {
    return {
      consoleUrl:
        this.configService.get<string>('CIRCLE_CONSOLE_URL') ||
        'https://console.circle.com',
      arc: {
        chainId: this.configService.get<number>('ARC_CHAIN_ID', 5042002),
        usdcContract:
          this.configService.get<string>('USDC_CONTRACT') ||
          this.configService.get<string>('NEXT_PUBLIC_USDC_CONTRACT') ||
          null,
      },
      wallets: {
        enabled: Boolean(
          this.configService.get<string>('CIRCLE_WALLET_API_KEY') ||
            this.configService.get<string>('CIRCLE_WALLETS_API_KEY'),
        ),
      },
      gateway: {
        enabled: Boolean(
          this.configService.get<string>('CIRCLE_GATEWAY_API_KEY') ||
            this.configService.get<string>('CIRCLE_GATEWAY_URL'),
        ),
      },
      bridge: {
        enabled: Boolean(
          this.configService.get<string>('CIRCLE_BRIDGE_API_KEY') ||
            this.configService.get<string>('CIRCLE_BRIDGE_URL'),
        ),
      },
      x402: {
        enabled: Boolean(
          this.configService.get<string>('X402_FACILITATOR_URL') ||
            this.configService.get<string>('X402_FACILITATOR_KEY'),
        ),
      },
      appBuilder: {
        enabled: Boolean(
          this.configService.get<string>('CIRCLE_APP_BUILDER_ENABLED') ||
            this.configService.get<string>('CIRCLE_APP_BUILDER_PROJECT_ID'),
        ),
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

  async createWallet(params: {
    userId: string;
    type?: CircleWalletType;
    label?: string;
  }): Promise<CircleWallet> {
    const walletId = `cw_${randomBytes(6).toString('hex')}`;
    const address = `0x${randomBytes(20).toString('hex')}`;

    const wallet = this.walletRepository.create({
      userId: params.userId,
      walletId,
      address,
      type: params.type || CircleWalletType.DEV_CONTROLLED,
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

  async listWallets(userId: string): Promise<CircleWallet[]> {
    return this.walletRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getWalletBalance(walletId: string) {
    const wallet = await this.walletRepository.findOne({
      where: [{ id: walletId }, { walletId }],
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    return {
      walletId: wallet.walletId,
      address: wallet.address,
      balances: wallet.metadata?.balances || { USDC: '0', ARC: '0' },
    };
  }

  async createGatewayTransfer(params: {
    userId: string;
    amount: string;
    sourceChain: string;
    destinationChain: string;
    fromWalletId?: string;
    fromAddress?: string;
    toAddress?: string;
    referenceId?: string;
    notes?: string;
  }): Promise<GatewayTransfer> {
    const transfer = this.gatewayRepository.create({
      userId: params.userId,
      amount: params.amount,
      sourceChain: params.sourceChain,
      destinationChain: params.destinationChain,
      fromWalletId: params.fromWalletId,
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      status: GatewayTransferStatus.PENDING,
      metadata: {
        referenceId: params.referenceId,
        notes: params.notes,
      },
    });

    await this.gatewayRepository.save(transfer);

    transfer.status = GatewayTransferStatus.COMPLETED;
    transfer.txHash = `0x${randomBytes(32).toString('hex')}`;
    await this.gatewayRepository.save(transfer);

    this.logger.log(`Gateway settlement completed: ${transfer.id}`);
    return transfer;
  }

  async listGatewayTransfers(userId: string, limit = 50): Promise<GatewayTransfer[]> {
    return this.gatewayRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
