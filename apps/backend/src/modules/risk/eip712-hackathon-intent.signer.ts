import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

const HACKATHON_RISK_ROUTER =
  '0xd6A6952545FF6E6E6681c2d15C59f9EB8F40FdBC';
const SEPOLIA_CHAIN_ID = 11155111;

const DOMAIN = {
  name: 'RiskRouter',
  version: '1',
  chainId: SEPOLIA_CHAIN_ID,
  verifyingContract: HACKATHON_RISK_ROUTER,
};

const TRADE_INTENT_TYPES = {
  TradeIntent: [
    { name: 'agentId', type: 'uint256' },
    { name: 'agentWallet', type: 'address' },
    { name: 'pair', type: 'string' },
    { name: 'action', type: 'string' },
    { name: 'amountUsdScaled', type: 'uint256' },
    { name: 'maxSlippageBps', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

export interface HackathonSignedIntent {
  intent: {
    agentId: bigint;
    agentWallet: string;
    pair: string;
    action: string;
    amountUsdScaled: bigint;
    maxSlippageBps: bigint;
    nonce: bigint;
    deadline: bigint;
  };
  signature: string;
  digest: string;
}

/**
 * Off-chain EIP-712 signer for hackathon RiskRouter on Sepolia.
 * Does not submit on-chain — use HackathonService.submitTradeIntent for that.
 */
@Injectable()
export class Eip712HackathonIntentSignerService {
  private readonly logger = new Logger(Eip712HackathonIntentSignerService.name);
  private signer: ethers.Wallet | null = null;

  constructor() {
    const pk = process.env.AGENT_PRIVATE_KEY?.trim();
    if (!pk || pk.length < 64) return;

    try {
      const normalizedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
      this.signer = new ethers.Wallet(normalizedPk);
      this.logger.log(`Eip712HackathonIntentSigner ready: ${this.signer.address}`);
    } catch (err) {
      this.logger.warn(`Eip712HackathonIntentSigner init failed: ${err}`);
    }
  }

  get isEnabled(): boolean {
    return this.signer !== null;
  }

  async signIntent(params: {
    agentId: string;
    pair: string;
    action: string;
    amountUsd: number;
    maxSlippageBps?: number;
    nonce: number;
  }): Promise<HackathonSignedIntent | null> {
    if (!this.signer) return null;

    try {
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      const intent = {
        agentId: BigInt(params.agentId),
        agentWallet: this.signer.address,
        pair: params.pair,
        action: params.action.toUpperCase(),
        amountUsdScaled: BigInt(Math.floor((params.amountUsd || 950) * 100)),
        maxSlippageBps: BigInt(params.maxSlippageBps ?? 100),
        nonce: BigInt(params.nonce),
        deadline,
      };

      const signature = await this.signer.signTypedData(
        DOMAIN,
        TRADE_INTENT_TYPES,
        intent,
      );
      const digest = ethers.TypedDataEncoder.hash(
        DOMAIN,
        TRADE_INTENT_TYPES,
        intent,
      );

      this.logger.log(
        `Signed hackathon intent: pair=${params.pair} action=${params.action} nonce=${params.nonce} digest=${digest.slice(0, 16)}…`,
      );

      return { intent, signature, digest };
    } catch (err) {
      this.logger.warn(`signIntent failed: ${err}`);
      return null;
    }
  }

  getSignerAddress(): string {
    return this.signer?.address ?? '';
  }
}
