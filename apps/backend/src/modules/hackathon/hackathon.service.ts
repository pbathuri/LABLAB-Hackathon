import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

const AGENT_REGISTRY_ADDRESS =
  '0x97b07dDc405B0c28B17559aFFE63BdB3632d0ca3';
const HACKATHON_VAULT_ADDRESS =
  '0x0E7CD8ef9743FEcf94f9103033a044caBD45fC90';
const RISK_ROUTER_ADDRESS =
  '0xd6A6952545FF6E6E6681c2d15C59f9EB8F40FdBC';
const REPUTATION_REGISTRY_ADDRESS =
  '0x423a9904e39537a9997fbaF0f220d79D7d545763';
const VALIDATION_REGISTRY_ADDRESS =
  '0x92bF63E5C7Ac6980f237a7164Ab413BE226187F1';

const CHAIN_ID = 11155111;

const HACKATHON_DOMAIN = {
  name: 'RiskRouter',
  version: '1',
  chainId: CHAIN_ID,
  verifyingContract: RISK_ROUTER_ADDRESS,
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

const HEARTBEAT_TYPES = {
  Heartbeat: [
    { name: 'agentId', type: 'uint256' },
    { name: 'action', type: 'string' },
    { name: 'reason', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
  ],
};

const AGENT_REGISTRY_ABI = [
  'function register(address agentWallet, string name, string description, string[] capabilities, string agentURI) external returns (uint256 agentId)',
  'function isRegistered(uint256 agentId) external view returns (bool)',
  'event AgentRegistered(uint256 indexed agentId, address indexed operatorWallet, address indexed agentWallet, string name)',
];

const VAULT_ABI = [
  'function claimAllocation(uint256 agentId) external',
  'function hasClaimed(uint256 agentId) external view returns (bool)',
];

const RISK_ROUTER_ABI = [
  'function submitTradeIntent((uint256 agentId, address agentWallet, string pair, string action, uint256 amountUsdScaled, uint256 maxSlippageBps, uint256 nonce, uint256 deadline) intent, bytes signature) external',
  'function getIntentNonce(uint256 agentId) external view returns (uint256)',
];

const REPUTATION_REGISTRY_ABI = [
  'function submitFeedback(uint256 agentId, uint8 score, bytes32 outcomeRef, string comment, uint8 feedbackType) external',
];

const VALIDATION_REGISTRY_ABI = [
  'function postEIP712Attestation(uint256 agentId, bytes32 checkpointHash, uint8 score, string comment) external',
];

export interface HackathonTradeIntentParams {
  agentId: string;
  pair: string;
  action: string;
  amountUsd: number;
  maxSlippageBps?: number;
  reasoningText: string;
  confidenceScore: number;
  pnlSnapshot?: number;
}

@Injectable()
export class HackathonService implements OnModuleInit {
  private readonly logger = new Logger(HackathonService.name);

  private provider?: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;
  private agentRegistry?: ethers.Contract;
  private vault?: ethers.Contract;
  private riskRouter?: ethers.Contract;
  private reputationRegistry?: ethers.Contract;
  private validationRegistry?: ethers.Contract;

  private _agentId: string | null = null;
  private _vaultClaimed = false;
  private _configured = false;

  async onModuleInit(): Promise<void> {
    const rpc =
      process.env.SEPOLIA_RPC_URL?.trim() ||
      process.env.SEPOLIA_RPC?.trim() ||
      'https://ethereum-sepolia-rpc.publicnode.com';

    const pk =
      process.env.AGENT_PRIVATE_KEY?.trim() ||
      process.env.SEPOLIA_PRIVATE_KEY?.trim();

    if (!pk || pk.length < 64) {
      this.logger.warn(
        'HackathonService: AGENT_PRIVATE_KEY not set or invalid — hackathon calls disabled. ' +
        'Set AGENT_PRIVATE_KEY (Sepolia wallet).',
      );
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(rpc);
      this.signer = new ethers.Wallet(
        pk.startsWith('0x') ? pk : `0x${pk}`,
        this.provider,
      );

      this.agentRegistry = new ethers.Contract(
        AGENT_REGISTRY_ADDRESS,
        AGENT_REGISTRY_ABI,
        this.signer,
      );
      this.vault = new ethers.Contract(
        HACKATHON_VAULT_ADDRESS,
        VAULT_ABI,
        this.signer,
      );
      this.riskRouter = new ethers.Contract(
        RISK_ROUTER_ADDRESS,
        RISK_ROUTER_ABI,
        this.signer,
      );
      this.reputationRegistry = new ethers.Contract(
        REPUTATION_REGISTRY_ADDRESS,
        REPUTATION_REGISTRY_ABI,
        this.signer,
      );
      this.validationRegistry = new ethers.Contract(
        VALIDATION_REGISTRY_ADDRESS,
        VALIDATION_REGISTRY_ABI,
        this.signer,
      );

      this._configured = true;
      this.logger.log(`HackathonService ready. Signer: ${this.signer.address}`);

      const hid = process.env.HACKATHON_AGENT_ID?.trim();
      if (hid) {
        this._agentId = hid;
        this.logger.log(`Restored agentId from env: ${this._agentId}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`HackathonService init failed: ${msg}`);
    }
  }

  get isConfigured(): boolean {
    return this._configured;
  }

  get agentId(): string | null {
    return this._agentId;
  }

  get signerAddress(): string {
    return this.signer?.address ?? '';
  }

  private requireConfigured(): void {
    if (!this._configured || !this.signer || !this.riskRouter) {
      throw new Error(
        'HackathonService not configured — check AGENT_PRIVATE_KEY and SEPOLIA_RPC_URL',
      );
    }
  }

  async registerAgent(): Promise<string> {
    this.requireConfigured();
    if (this._agentId) {
      this.logger.log(`Already registered with agentId=${this._agentId}`);
      return this._agentId;
    }

    this.logger.log('Registering Captain Whiskers on Sepolia AgentRegistry…');

    try {
      const tx = await this.agentRegistry!.register(
        this.signer!.address,
        'Captain Whiskers V2',
        'Quantum-aware autonomous AI trading agent. ERC-8004 identity, Gemini-powered decisions, EIP-712 signed intents, Byzantine fault-tolerant verification. Risk-adjusted position sizing with multi-layer drawdown protection.',
        [
          'trading',
          'eip712-signing',
          'btc-analysis',
          'eth-analysis',
          'sol-analysis',
          'risk-management',
        ],
        'https://raw.githubusercontent.com/pbathuri/LABLAB-Hackathon/main/docs/agent-card.json',
      );
      this.logger.log(`Register TX: ${tx.hash}`);
      const receipt = await tx.wait();
      const agentId = this._parseAgentRegisteredEvent(receipt!);
      if (agentId) {
        this._agentId = agentId;
        this.logger.log(`Agent registered! ID=${agentId}`);
        return agentId;
      }
      throw new Error('AgentRegistered event not found in receipt');
    } catch (err: unknown) {
      const msg = String((err as { message?: string })?.message || err);
      if (msg.includes('already registered') || msg.includes('AlreadyRegistered')) {
        this.logger.log('Already registered on-chain. Recovering agentId from logs…');
        const recovered = await this._recoverAgentIdFromLogs();
        if (recovered) {
          this._agentId = recovered;
          return recovered;
        }
      }
      this.logger.error(`registerAgent failed: ${msg}`);
      throw err;
    }
  }

  private _parseAgentRegisteredEvent(
    receipt: ethers.TransactionReceipt,
  ): string | null {
    for (const log of receipt.logs) {
      try {
        const parsed = this.agentRegistry!.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsed?.name === 'AgentRegistered') {
          return parsed.args.agentId.toString();
        }
      } catch {
        /* not this event */
      }
    }
    return null;
  }

  private async _recoverAgentIdFromLogs(): Promise<string | null> {
    try {
      const eventSig = ethers.id(
        'AgentRegistered(uint256,address,address,string)',
      );
      const currentBlock = await this.provider!.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 50000);
      const logs = await this.provider!.getLogs({
        address: AGENT_REGISTRY_ADDRESS,
        fromBlock,
        toBlock: 'latest',
        topics: [eventSig],
      });
      for (const log of logs) {
        try {
          const parsed = this.agentRegistry!.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          if (
            parsed?.name === 'AgentRegistered' &&
            parsed.args.agentWallet.toLowerCase() ===
            this.signer!.address.toLowerCase()
          ) {
            return parsed.args.agentId.toString();
          }
        } catch {
          /* skip */
        }
      }
    } catch (err) {
      this.logger.warn(`Log recovery failed: ${err}`);
    }
    return null;
  }

  async isRegistered(agentId: string): Promise<boolean> {
    this.requireConfigured();
    try {
      return await this.agentRegistry!.isRegistered(BigInt(agentId));
    } catch {
      return false;
    }
  }

  async claimAllocation(agentId: string): Promise<boolean> {
    this.requireConfigured();

    if (this._vaultClaimed) {
      this.logger.log('Vault already claimed this session.');
      return true;
    }

    try {
      const claimed = await this.vault!.hasClaimed(BigInt(agentId));
      if (claimed) {
        this._vaultClaimed = true;
        this.logger.log(`Vault already claimed for agentId=${agentId}`);
        return true;
      }
    } catch {
      /* non-blocking */
    }

    try {
      const tx = await this.vault!.claimAllocation(BigInt(agentId));
      this.logger.log(`Claim TX: ${tx.hash}`);
      await tx.wait();
      this._vaultClaimed = true;
      this.logger.log(`Vault allocation claimed for agentId=${agentId}`);
      return true;
    } catch (err: unknown) {
      const msg = String((err as { message?: string })?.message || err);
      if (msg.includes('already claimed') || msg.includes('AlreadyClaimed')) {
        this._vaultClaimed = true;
        return true;
      }
      this.logger.error(`claimAllocation failed: ${msg}`);
      return false;
    }
  }

  async submitTradeIntent(params: HackathonTradeIntentParams): Promise<{
    hash: string;
    signature: string;
    nonce: string;
  } | null> {
    this.requireConfigured();

    if (!this._agentId) {
      this.logger.warn(
        'submitTradeIntent skipped — agentId not set. Call registerAgent() first.',
      );
      return null;
    }

    try {
      const nonce = await this.riskRouter!.getIntentNonce(BigInt(this._agentId));
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

      const intent = {
        agentId: BigInt(this._agentId),
        agentWallet: this.signer!.address,
        pair: params.pair || 'BTC/USD',
        action: params.action.toUpperCase(),
        amountUsdScaled: BigInt(
          Math.floor((params.amountUsd || 950) * 100),
        ),
        maxSlippageBps: BigInt(params.maxSlippageBps ?? 100),
        nonce: BigInt(nonce),
        deadline,
      };

      const signature = await this.signer!.signTypedData(
        HACKATHON_DOMAIN,
        TRADE_INTENT_TYPES,
        intent,
      );

      const tx = await this.riskRouter!.submitTradeIntent(intent, signature);
      this.logger.log(
        `TradeIntent TX: ${tx.hash} | pair=${params.pair} action=${params.action}`,
      );

      return { hash: tx.hash, signature, nonce: nonce.toString() };
    } catch (err: unknown) {
      const msg = String((err as { message?: string })?.message || err);
      this.logger.warn(`submitTradeIntent failed: ${msg}`);
      return null;
    }
  }

  async getIntentNonce(agentId: string): Promise<string> {
    this.requireConfigured();
    const nonce = await this.riskRouter!.getIntentNonce(BigInt(agentId));
    return nonce.toString();
  }

  async submitFeedback(
    agentId: string,
    score: number,
    outcomeData: {
      action: string;
      pnlPercent: number;
      executed: boolean;
      pair: string;
      reason: string;
    },
    feedbackType = 0,
  ): Promise<string | null> {
    this.requireConfigured();

    try {
      const outcomeRef = ethers.keccak256(
        ethers.toUtf8Bytes(
          JSON.stringify({
            timestamp: Date.now(),
            action: outcomeData.action,
            pnl: outcomeData.pnlPercent,
            executed: outcomeData.executed,
            pair: outcomeData.pair,
          }),
        ),
      );

      const comment = `Captain Whiskers V2 | ${outcomeData.action.toUpperCase()} ${outcomeData.pair} | PnL: ${outcomeData.pnlPercent.toFixed(3)}% | ${outcomeData.reason.slice(0, 120)}`.slice(
        0,
        200,
      );

      const tx = await this.reputationRegistry!.submitFeedback(
        BigInt(agentId),
        Math.min(100, Math.max(0, Math.floor(score))),
        outcomeRef,
        comment,
        feedbackType,
      );
      this.logger.log(`Reputation TX: ${tx.hash}`);
      return tx.hash;
    } catch (err: unknown) {
      const msg = String((err as { message?: string })?.message || err);
      if (msg.includes('self-rate') || msg.includes('already rated')) {
        this.logger.log('Reputation skipped (self-rate or duplicate)');
        return null;
      }
      this.logger.warn(`submitFeedback failed: ${msg}`);
      return null;
    }
  }

  async postCheckpoint(
    agentId: string,
    decision: {
      action: string;
      pair: string;
      price?: number;
      reasoning: string;
    },
    confidenceScore: number,
    _pnlSnapshot: number,
  ): Promise<string | null> {
    this.requireConfigured();
    void _pnlSnapshot;

    try {
      const checkpointHash = ethers.solidityPackedKeccak256(
        ['uint256', 'string', 'string', 'uint256', 'bytes32'],
        [
          BigInt(agentId),
          decision.action,
          decision.pair,
          BigInt(Math.floor(Date.now() / 1000)),
          ethers.keccak256(ethers.toUtf8Bytes(decision.reasoning)),
        ],
      );

      const score = Math.min(
        100,
        Math.max(0, Math.floor(confidenceScore * 100)),
      );
      const comment = decision.reasoning.slice(0, 200);

      const tx = await this.validationRegistry!.postEIP712Attestation(
        BigInt(agentId),
        checkpointHash,
        score,
        comment,
      );
      this.logger.log(`Checkpoint TX: ${tx.hash} | score=${score}`);
      return tx.hash;
    } catch (err: unknown) {
      const msg = String((err as { message?: string })?.message || err);
      if (msg.includes('already rated') || msg.includes('duplicate')) {
        this.logger.log('Checkpoint skipped (duplicate)');
        return null;
      }
      this.logger.warn(`postCheckpoint failed: ${msg}`);
      return null;
    }
  }

  async signHeartbeat(
    agentId: string,
    action: string,
    reason: string,
    timestamp: number,
  ): Promise<string | null> {
    if (!this._configured || !this.signer) return null;

    try {
      const heartbeat = {
        agentId: BigInt(agentId),
        action: action.toUpperCase(),
        reason: reason.slice(0, 200),
        timestamp: BigInt(timestamp),
      };
      return await this.signer.signTypedData(
        HACKATHON_DOMAIN,
        HEARTBEAT_TYPES,
        heartbeat,
      );
    } catch (err) {
      this.logger.warn(`signHeartbeat failed: ${err}`);
      return null;
    }
  }

  getStatus(): {
    configured: boolean;
    agentId: string | null;
    vaultClaimed: boolean;
    signerAddress: string;
    contracts: Record<string, string>;
  } {
    return {
      configured: this._configured,
      agentId: this._agentId,
      vaultClaimed: this._vaultClaimed,
      signerAddress: this.signer?.address ?? '',
      contracts: {
        agentRegistry: AGENT_REGISTRY_ADDRESS,
        hackathonVault: HACKATHON_VAULT_ADDRESS,
        riskRouter: RISK_ROUTER_ADDRESS,
        reputationRegistry: REPUTATION_REGISTRY_ADDRESS,
        validationRegistry: VALIDATION_REGISTRY_ADDRESS,
      },
    };
  }

  async initializeAgent(): Promise<string | null> {
    if (!this._configured) return null;

    try {
      const agentId = await this.registerAgent();
      await this.claimAllocation(agentId);
      this._agentId = agentId;
      this.logger.log(`Agent initialized: ID=${agentId}, vault claimed`);
      return agentId;
    } catch (err) {
      this.logger.error(`initializeAgent failed: ${err}`);
      return null;
    }
  }
}
