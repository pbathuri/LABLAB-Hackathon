import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  constructor(private readonly configService: ConfigService) {}

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
}
