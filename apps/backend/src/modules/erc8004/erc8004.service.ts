import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { AgentIdentity } from './entities/agent-identity.entity';
import { isValidHexPrivateKey } from '../../common/eth-key.util';

const IDENTITY_REGISTRY_ABI = [
  'function register(string agentURI) external returns (uint256 agentId)',
  'function setAgentURI(uint256 agentId, string newURI) external',
  'function setMetadata(uint256 agentId, string key, bytes value) external',
  'function getMetadata(uint256 agentId, string key) external view returns (bytes)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
];

const REPUTATION_REGISTRY_ABI = [
  'function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external',
  'event FeedbackGiven(uint256 indexed agentId, address indexed client, int128 value, uint8 valueDecimals, string tag1, string tag2)',
];

@Injectable()
export class ERC8004Service implements OnModuleInit {
  private readonly logger = new Logger(ERC8004Service.name);
  private provider?: ethers.JsonRpcProvider;
  private wallet?: ethers.Wallet;
  private identityRegistry?: ethers.Contract;
  private reputationRegistry?: ethers.Contract;

  constructor(
    @InjectRepository(AgentIdentity)
    private readonly identityRepo: Repository<AgentIdentity>,
  ) { }

  async onModuleInit(): Promise<void> {
    const rpc = process.env.BASE_SEPOLIA_RPC ?? 'https://sepolia.base.org';
    const pk = process.env.AGENT_PRIVATE_KEY;
    const idAddr = process.env.ERC8004_IDENTITY_REGISTRY;
    const repAddr = process.env.ERC8004_REPUTATION_REGISTRY;
    if (!pk || !idAddr || !repAddr) {
      this.logger.warn(
        'ERC8004: missing AGENT_PRIVATE_KEY or registry addresses — identity calls disabled',
      );
      return;
    }
    if (!isValidHexPrivateKey(pk)) {
      this.logger.warn(
        'ERC8004: AGENT_PRIVATE_KEY is not a valid hex key (expect 64 hex chars, optional 0x). Do not use Kraken/Base64 secrets here — generate a wallet and fund it on Base Sepolia. Identity calls disabled.',
      );
      return;
    }
    try {
      this.provider = new ethers.JsonRpcProvider(rpc);
      this.wallet = new ethers.Wallet(pk.trim(), this.provider);
      this.identityRegistry = new ethers.Contract(
        idAddr,
        IDENTITY_REGISTRY_ABI,
        this.wallet,
      );
      this.reputationRegistry = new ethers.Contract(
        repAddr,
        REPUTATION_REGISTRY_ABI,
        this.wallet,
      );
      this.logger.log(`ERC8004 wallet: ${this.wallet.address}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(
        `ERC8004: failed to initialize wallet (${msg}) — identity calls disabled`,
      );
    }
  }

  private ensureContracts(): void {
    if (!this.identityRegistry || !this.wallet) {
      throw new Error('ERC8004 not configured');
    }
  }

  async loadPersistedAgentId(): Promise<number | null> {
    const row =
      (await this.identityRepo.findOne({ where: { id: 'singleton' } })) ??
      null;
    return row?.agentId ?? null;
  }

  async persistAgentId(agentId: number, agentURI: string): Promise<void> {
    await this.identityRepo.save({
      id: 'singleton',
      agentId,
      agentURI,
    });
  }

  /** Register agent on ERC-8004 Identity Registry */
  async registerAgent(
    agentURI: string,
  ): Promise<{ agentId: number; txHash?: string }> {
    this.ensureContracts();
    const existing = await this.loadPersistedAgentId();
    if (existing != null) {
      this.logger.log(`Using persisted agent id ${existing}`);
      return { agentId: existing };
    }
    const tx = await this.identityRegistry!.register(agentURI);
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error('registerAgent: no receipt');
    }
    const txHash = receipt.hash;
    const iface = new ethers.Interface([
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    ]);
    let agentId: number | undefined;
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsed?.name === 'Transfer') {
          const id = parsed.args.tokenId;
          agentId = Number(id);
          break;
        }
      } catch {
        /* not this log */
      }
    }
    if (agentId == null) {
      throw new Error('Could not parse agent id from Transfer event');
    }
    await this.persistAgentId(agentId, agentURI);
    this.logger.log(`Agent registered with ID: ${agentId}`);
    return { agentId, txHash };
  }

  async getAgentId(): Promise<number | null> {
    const persisted = await this.loadPersistedAgentId();
    return persisted;
  }

  async postPerformanceFeedback(metrics: {
    pnlPercent: number;
    sharpeRatio: number;
    maxDrawdownBps: number;
    winRate: number;
  }): Promise<void> {
    this.ensureContracts();
    const agentId = await this.getAgentId();
    if (agentId == null) {
      throw new Error('Agent not registered');
    }
    const pnlValue = BigInt(Math.round(metrics.pnlPercent * 10));
    const tx1 = await this.reputationRegistry!.giveFeedback(
      agentId,
      pnlValue,
      1,
      'tradingYield',
      'day',
      '',
      '',
      ethers.ZeroHash,
    );
    await tx1.wait();
    const tx2 = await this.reputationRegistry!.giveFeedback(
      agentId,
      BigInt(Math.round(metrics.winRate)),
      0,
      'successRate',
      'trades',
      '',
      '',
      ethers.ZeroHash,
    );
    await tx2.wait();
    this.logger.log(
      `Performance feedback posted: PnL=${metrics.pnlPercent}% winRate=${metrics.winRate}`,
    );
  }

  async setMetadataKey(key: string, value: string): Promise<void> {
    this.ensureContracts();
    const agentId = await this.getAgentId();
    if (agentId == null) {
      throw new Error('Agent not registered');
    }
    const tx = await this.identityRegistry!.setMetadata(
      agentId,
      key,
      ethers.toUtf8Bytes(value),
    );
    await tx.wait();
  }

  async getStatus(): Promise<{
    agentId: number | null;
    registered: boolean;
    wallet: string;
    identityRegistry: string;
    reputationRegistry: string;
    configured: boolean;
  }> {
    const agentId = await this.getAgentId();
    return {
      agentId,
      registered: agentId != null,
      wallet: this.wallet?.address ?? '',
      identityRegistry: process.env.ERC8004_IDENTITY_REGISTRY ?? '',
      reputationRegistry: process.env.ERC8004_REPUTATION_REGISTRY ?? '',
      configured: Boolean(this.wallet && this.identityRegistry),
    };
  }
}
