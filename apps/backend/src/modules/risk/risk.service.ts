import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { isValidHexPrivateKey } from '../../common/eth-key.util';

/** Mirrors RiskRouter.sol TradeIntent */
export interface TradeIntentStruct {
  agent: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  minAmountOut: bigint;
  deadline: bigint;
  strategyHash: string;
  portfolioNav: bigint;
}

const RISK_ROUTER_ABI = [
  'function validateIntent((address agent,address tokenIn,address tokenOut,uint256 amountIn,uint256 minAmountOut,uint256 deadline,bytes32 strategyHash,uint256 portfolioNav) intent) view returns (bool,string)',
  'function recordTradeExecution(address agent,uint256 amountIn,uint256 amountOut,bytes32 intentHash,uint256 portfolioNavAfter)',
  'function getAgentState(address) view returns (uint256,uint256,uint256,uint256,uint256,int256,bool)',
];

@Injectable()
export class RiskService {
  private readonly logger = new Logger(RiskService.name);
  private routerRead: ethers.Contract | null = null;
  private routerWrite: ethers.Contract | null = null;
  private hackathonRead: ethers.Contract | null = null;
  private hackathonWrite: ethers.Contract | null = null;

  constructor() {
    const rpc = process.env.BASE_SEPOLIA_RPC ?? 'https://sepolia.base.org';
    const provider = new ethers.JsonRpcProvider(rpc);
    const pk = process.env.AGENT_PRIVATE_KEY;
    let wallet: ethers.Wallet | null = null;
    if (pk && isValidHexPrivateKey(pk)) {
      wallet = new ethers.Wallet(pk.trim(), provider);
    } else if (pk) {
      this.logger.warn(
        'AGENT_PRIVATE_KEY is not valid hex — recordTradeExecution disabled (use 64 hex chars)',
      );
    }

    const addr = process.env.RISK_ROUTER_ADDRESS;
    if (addr) {
      this.routerRead = new ethers.Contract(addr, RISK_ROUTER_ABI, provider);
      if (wallet) {
        this.routerWrite = new ethers.Contract(addr, RISK_ROUTER_ABI, wallet);
      }
    } else {
      this.logger.warn('RISK_ROUTER_ADDRESS not set — on-chain risk checks skipped');
    }

    // Sepolia leaderboard RiskRouter uses submitTradeIntent + different ABI — use HackathonService only.
    // Base Sepolia Capital Sandbox (validateIntent / recordTradeExecution) uses this env:
    const sandbox =
      process.env.BASE_CAPITAL_SANDBOX_ROUTER?.trim() ||
      process.env.HACKATHON_LEGACY_BASE_ROUTER?.trim();
    if (sandbox) {
      this.hackathonRead = new ethers.Contract(sandbox, RISK_ROUTER_ABI, provider);
      if (wallet) {
        this.hackathonWrite = new ethers.Contract(sandbox, RISK_ROUTER_ABI, wallet);
      }
      this.logger.log(`Base Capital Sandbox RiskRouter: ${sandbox}`);
    }
    if (process.env.HACKATHON_RISK_ROUTER?.trim() && !sandbox) {
      this.logger.warn(
        'HACKATHON_RISK_ROUTER is set but ignored here (Sepolia leaderboard router ABI differs). ' +
        'Use HackathonModule for Sepolia intents. For Base validateIntent sandbox, set BASE_CAPITAL_SANDBOX_ROUTER.',
      );
    }
  }

  /** Keccak256 of packed TradeIntent fields (matches common intent hashing patterns). */
  hashTradeIntent(intent: TradeIntentStruct): string {
    return ethers.solidityPackedKeccak256(
      [
        'address',
        'address',
        'address',
        'uint256',
        'uint256',
        'uint256',
        'bytes32',
        'uint256',
      ],
      [
        intent.agent,
        intent.tokenIn,
        intent.tokenOut,
        intent.amountIn,
        intent.minAmountOut,
        intent.deadline,
        intent.strategyHash,
        intent.portfolioNav,
      ],
    );
  }

  isHackathonRouterConfigured(): boolean {
    return this.hackathonRead != null;
  }

  async validateIntent(
    intent: TradeIntentStruct,
  ): Promise<{ valid: boolean; reason: string }> {
    if (!this.routerRead) {
      return { valid: true, reason: 'router not configured' };
    }
    const [valid, reason] = await this.routerRead.validateIntent(intent);
    return { valid, reason: String(reason) };
  }

  /**
   * Validates against BASE_CAPITAL_SANDBOX_ROUTER on Base Sepolia (same ABI as RISK_ROUTER_ADDRESS).
   * Sepolia hackathon leaderboard router is not used here — see HackathonService.
   */
  async validateHackathonIntent(
    intent: TradeIntentStruct,
  ): Promise<{ valid: boolean; reason: string }> {
    if (!this.hackathonRead) {
      return { valid: true, reason: 'hackathon router not configured' };
    }
    const [valid, reason] = await this.hackathonRead.validateIntent(intent);
    return { valid, reason: String(reason) };
  }

  async recordTradeExecution(
    agent: string,
    amountIn: bigint,
    amountOut: bigint,
    intentHash: string,
    portfolioNavAfter: bigint,
  ): Promise<void> {
    if (!this.routerWrite) {
      this.logger.warn('recordTradeExecution skipped — no AGENT_PRIVATE_KEY or router');
      return;
    }
    const tx = await this.routerWrite.recordTradeExecution(
      agent,
      amountIn,
      amountOut,
      intentHash,
      portfolioNavAfter,
    );
    await tx.wait();
  }

  /**
   * Records execution on the hackathon router. Swallows errors (e.g. AGENT_ROLE not granted on sandbox yet).
   */
  async recordHackathonTradeExecution(
    agent: string,
    amountIn: bigint,
    amountOut: bigint,
    intentHash: string,
    portfolioNavAfter: bigint,
  ): Promise<void> {
    if (!this.hackathonWrite) {
      return;
    }
    try {
      const tx = await this.hackathonWrite.recordTradeExecution(
        agent,
        amountIn,
        amountOut,
        intentHash,
        portfolioNavAfter,
      );
      await tx.wait();
      this.logger.log(`Hackathon recordTradeExecution ok: ${tx.hash}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Hackathon recordTradeExecution failed: ${msg}`);
    }
  }
}
