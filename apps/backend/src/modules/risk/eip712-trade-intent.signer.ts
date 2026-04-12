import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { isValidHexPrivateKey } from '../../common/eth-key.util';

const DOMAIN_NAME = 'CaptainWhiskersRiskRouter';
const DOMAIN_VERSION = '1';

const TRADE_INTENT_TYPES = {
  TradeIntent: [
    { name: 'agent', type: 'address' },
    { name: 'tokenIn', type: 'address' },
    { name: 'tokenOut', type: 'address' },
    { name: 'amountIn', type: 'uint256' },
    { name: 'minAmountOut', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
    { name: 'strategyHash', type: 'bytes32' },
    { name: 'portfolioNav', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
};

/** Off-chain EIP-712 artifacts for trade intents (RiskRouter does not verify on-chain yet). */
@Injectable()
export class Eip712TradeIntentSignerService {
  private readonly logger = new Logger(Eip712TradeIntentSignerService.name);
  private wallet: ethers.Wallet | null = null;
  private nonceSeq = 0;

  constructor() {
    const pk = process.env.AGENT_PRIVATE_KEY?.trim();
    const router = process.env.RISK_ROUTER_ADDRESS?.trim();
    if (!pk || !router || !isValidHexPrivateKey(pk)) {
      return;
    }
    const rpc = process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
    const provider = new ethers.JsonRpcProvider(rpc);
    this.wallet = new ethers.Wallet(pk, provider);
  }

  isEnabled(): boolean {
    return (
      this.wallet != null && Boolean(process.env.RISK_ROUTER_ADDRESS?.trim())
    );
  }

  async signTradeIntent(intent: {
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    minAmountOut: bigint;
    deadline: bigint;
    strategyHash: string;
    portfolioNav: bigint;
  }): Promise<{ signature: string; digest: string; nonce: number } | null> {
    if (!this.wallet) return null;
    const router = process.env.RISK_ROUTER_ADDRESS!.trim();
    const chainId = Number(process.env.BASE_SEPOLIA_CHAIN_ID || 84532);
    const domain = {
      name: DOMAIN_NAME,
      version: DOMAIN_VERSION,
      chainId,
      verifyingContract: router,
    };
    const nonce = this.nonceSeq++;
    const value = {
      agent: this.wallet.address,
      tokenIn: intent.tokenIn,
      tokenOut: intent.tokenOut,
      amountIn: intent.amountIn,
      minAmountOut: intent.minAmountOut,
      deadline: intent.deadline,
      strategyHash: intent.strategyHash,
      portfolioNav: intent.portfolioNav,
      nonce: BigInt(nonce),
    };
    const signature = await this.wallet.signTypedData(
      domain,
      TRADE_INTENT_TYPES,
      value,
    );
    const digest = ethers.TypedDataEncoder.hash(
      domain,
      TRADE_INTENT_TYPES,
      value,
    );
    this.logger.log(
      `EIP-712 trade intent signed nonce=${nonce} digest=${digest.slice(0, 14)}…`,
    );
    return { signature, digest, nonce };
  }
}
