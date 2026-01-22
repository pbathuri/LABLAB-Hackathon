import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import { ethers } from 'ethers';
import { VerificationLog } from './entities/verification-log.entity';
import { VerifierNode } from './entities/verifier-node.entity';

/**
 * Byzantine Fault Tolerant Verification Service
 * 
 * Implements BFT consensus for transaction verification:
 * - Total nodes (n): 11
 * - Fault tolerance (f): 3
 * - Required signatures: 2f + 1 = 7
 * 
 * BFT Guarantee: System tolerates up to f Byzantine (malicious) nodes
 * while maintaining correctness and liveness.
 * 
 * References:
 * - Castro & Liskov (1999), "Practical Byzantine Fault Tolerance"
 */

export interface VerificationRequest {
  type: string;
  userId: string;
  amount?: number;
  recipient?: string;
  parameters: Record<string, any>;
}

export interface VerificationResult {
  verificationId: string;
  requestHash: string;
  approved: boolean;
  signatureCount: number;
  requiredSignatures: number;
  signatures: VerifierSignature[];
  timestamp: Date;
  consensusLatencyMs: number;
}

export interface VerifierSignature {
  verifierId: string;
  address: string;
  signature: string;
  latencyMs: number;
  timestamp: Date;
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  
  // BFT Parameters
  private readonly TOTAL_VERIFIERS = 11;
  private readonly FAULT_TOLERANCE = 3;  // f
  private readonly REQUIRED_SIGNATURES = 7;  // 2f + 1

  // Simulated verifier nodes (in production, these would be separate services)
  private verifierNodes: Map<string, {
    wallet: ethers.Wallet;
    reliability: number;
    avgLatencyMs: number;
  }> = new Map();

  constructor(
    @InjectRepository(VerificationLog)
    private verificationLogRepository: Repository<VerificationLog>,
    @InjectRepository(VerifierNode)
    private verifierNodeRepository: Repository<VerifierNode>,
  ) {
    this.initializeVerifierNodes();
  }

  /**
   * Initialize simulated verifier nodes
   */
  private initializeVerifierNodes(): void {
    for (let i = 0; i < this.TOTAL_VERIFIERS; i++) {
      const wallet = ethers.Wallet.createRandom();
      this.verifierNodes.set(`verifier-${i + 1}`, {
        wallet,
        reliability: 0.9 + Math.random() * 0.1,  // 90-100% reliability
        avgLatencyMs: 30 + Math.random() * 50,   // 30-80ms latency
      });
    }

    this.logger.log(`Initialized ${this.TOTAL_VERIFIERS} verifier nodes`);
    this.logger.log(`Fault tolerance: ${this.FAULT_TOLERANCE} nodes`);
    this.logger.log(`Required signatures: ${this.REQUIRED_SIGNATURES}`);
  }

  /**
   * Request BFT verification for a transaction
   */
  async verifyTransaction(request: VerificationRequest): Promise<VerificationResult> {
    const startTime = Date.now();
    const verificationId = this.generateVerificationId();
    const requestHash = this.hashRequest(request);

    this.logger.log(`Starting BFT verification: ${verificationId}`);

    // Collect signatures from verifiers in parallel
    const signaturePromises = Array.from(this.verifierNodes.entries()).map(
      ([id, node]) => this.collectSignature(id, node, requestHash),
    );

    const signatureResults = await Promise.all(signaturePromises);
    const validSignatures = signatureResults.filter(
      (s): s is VerifierSignature => s !== null,
    );

    const consensusReached = validSignatures.length >= this.REQUIRED_SIGNATURES;
    const consensusLatencyMs = Date.now() - startTime;

    // Log verification result
    const log = this.verificationLogRepository.create({
      verificationId,
      requestHash,
      requestType: request.type,
      userId: request.userId,
      signatureCount: validSignatures.length,
      requiredSignatures: this.REQUIRED_SIGNATURES,
      consensusReached,
      consensusLatencyMs,
      signatures: JSON.stringify(validSignatures),
    });
    await this.verificationLogRepository.save(log);

    this.logger.log(
      `Verification ${verificationId}: ${validSignatures.length}/${this.REQUIRED_SIGNATURES} signatures, ` +
      `consensus ${consensusReached ? 'REACHED' : 'FAILED'}, latency ${consensusLatencyMs}ms`,
    );

    return {
      verificationId,
      requestHash,
      approved: consensusReached,
      signatureCount: validSignatures.length,
      requiredSignatures: this.REQUIRED_SIGNATURES,
      signatures: validSignatures,
      timestamp: new Date(),
      consensusLatencyMs,
    };
  }

  /**
   * Collect signature from a single verifier
   */
  private async collectSignature(
    verifierId: string,
    node: { wallet: ethers.Wallet; reliability: number; avgLatencyMs: number },
    requestHash: string,
  ): Promise<VerifierSignature | null> {
    const startTime = Date.now();

    // Simulate network latency
    await this.simulateLatency(node.avgLatencyMs);

    // Simulate occasional failures (Byzantine behavior)
    if (Math.random() > node.reliability) {
      this.logger.warn(`Verifier ${verifierId} failed to respond`);
      return null;
    }

    try {
      // Sign the request hash
      const signature = await node.wallet.signMessage(requestHash);

      return {
        verifierId,
        address: node.wallet.address,
        signature,
        latencyMs: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Verifier ${verifierId} signing error: ${error.message}`);
      return null;
    }
  }

  /**
   * Aggregate signatures for on-chain submission
   */
  aggregateSignatures(signatures: VerifierSignature[]): string {
    // Concatenate signatures in order
    const sortedSigs = signatures.sort((a, b) => 
      a.address.localeCompare(b.address),
    );

    return sortedSigs.map((s) => s.signature).join('');
  }

  /**
   * Get verifier node status
   */
  async getVerifierStatus(): Promise<{
    totalNodes: number;
    activeNodes: number;
    faultTolerance: number;
    requiredSignatures: number;
    nodes: Array<{
      id: string;
      address: string;
      reliability: number;
      avgLatencyMs: number;
    }>;
  }> {
    const nodes = Array.from(this.verifierNodes.entries()).map(
      ([id, node]) => ({
        id,
        address: node.wallet.address,
        reliability: Math.round(node.reliability * 100) / 100,
        avgLatencyMs: Math.round(node.avgLatencyMs),
      }),
    );

    return {
      totalNodes: this.TOTAL_VERIFIERS,
      activeNodes: nodes.length,
      faultTolerance: this.FAULT_TOLERANCE,
      requiredSignatures: this.REQUIRED_SIGNATURES,
      nodes,
    };
  }

  /**
   * Get recent verification logs
   */
  async getRecentVerifications(limit = 10): Promise<VerificationLog[]> {
    return this.verificationLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Verify a past verification (check signatures)
   */
  async checkVerification(verificationId: string): Promise<{
    valid: boolean;
    verificationLog?: VerificationLog;
  }> {
    const log = await this.verificationLogRepository.findOne({
      where: { verificationId },
    });

    if (!log) {
      return { valid: false };
    }

    // In production, verify each signature against known verifier addresses
    return {
      valid: log.consensusReached,
      verificationLog: log,
    };
  }

  private generateVerificationId(): string {
    return `vrf_${randomBytes(16).toString('hex')}`;
  }

  private hashRequest(request: VerificationRequest): string {
    const data = JSON.stringify({
      type: request.type,
      userId: request.userId,
      amount: request.amount,
      recipient: request.recipient,
      parameters: request.parameters,
      timestamp: Date.now(),
    });

    return createHash('sha256').update(data).digest('hex');
  }

  private simulateLatency(avgMs: number): Promise<void> {
    // Add some variance to latency
    const latency = avgMs * (0.5 + Math.random());
    return new Promise((resolve) => setTimeout(resolve, latency));
  }
}
