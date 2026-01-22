import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  PaymentRequest,
  PaymentStatus,
  PaymentModel,
} from './entities/payment-request.entity';
import { PostQuantumCryptoService } from '../quantum/services/post-quantum-crypto.service';
import { QRNGService } from '../quantum/services/qrng.service';
import { ReliabilityService } from '../reliability/reliability.service';

/**
 * x402 Micropayment Service
 * 
 * Implements HTTP 402 Payment Required protocol for API micropayments.
 * Supports:
 * - Pay-per-call: Payment before each API call
 * - Pay-on-success: Payment only if API returns valid response
 * - Bundled: Multiple micro-transactions aggregated
 * 
 * Uses EIP-712 typed data for payment authorization:
 * PaymentRequest {
 *   address payer;
 *   address payee;
 *   uint256 amount;
 *   uint256 nonce;
 *   uint256 expiry;
 * }
 */

export interface PaymentRequestParams {
  userId: string;
  payer: string;
  payee: string;
  amount: string;
  apiEndpoint?: string;
  providerId?: string;
  model?: PaymentModel;
  description?: string;
}

export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

@Injectable()
export class MicropaymentService {
  private readonly logger = new Logger(MicropaymentService.name);
  private readonly domain: EIP712Domain;

  constructor(
    @InjectRepository(PaymentRequest)
    private paymentRepository: Repository<PaymentRequest>,
    private postQuantumCrypto: PostQuantumCryptoService,
    private qrngService: QRNGService,
    private reliabilityService: ReliabilityService,
    private configService: ConfigService,
  ) {
    // EIP-712 domain for Arc testnet
    this.domain = {
      name: 'CaptainWhiskers',
      version: '1',
      chainId: this.configService.get('ARC_CHAIN_ID', 5042002),
      verifyingContract: this.configService.get(
        'GATEWAY_CONTRACT',
        '0x0000000000000000000000000000000000000000',
      ),
    };
  }

  /**
   * Create a new payment request with EIP-712 typed data
   */
  async createPaymentRequest(
    params: PaymentRequestParams,
  ): Promise<PaymentRequest> {
    // Generate quantum random nonce
    const nonce = await this.qrngService.generateNonce(32);
    
    // Set expiry (1 hour from now)
    const expiry = Math.floor(Date.now() / 1000) + 3600;

    // Build EIP-712 typed data
    const typedData = this.buildTypedData(params, nonce, expiry);

    // Sign with post-quantum signature
    const keyPair = await this.postQuantumCrypto.generateKeyPair();
    const signature = await this.postQuantumCrypto.signTypedData(
      typedData,
      keyPair.secretKey,
    );

    const paymentRequest = this.paymentRepository.create({
      userId: params.userId,
      payer: params.payer,
      payee: params.payee,
      amount: params.amount,
      nonce,
      expiry,
      model: params.model || PaymentModel.PAY_PER_CALL,
      apiEndpoint: params.apiEndpoint,
      providerId: params.providerId,
      signature: signature.signature,
      eip712TypedData: JSON.stringify(typedData),
      status: PaymentStatus.PENDING,
      metadata: {
        description: params.description,
      },
    });

    await this.paymentRepository.save(paymentRequest);
    this.logger.log(`Created payment request ${paymentRequest.id}`);

    return paymentRequest;
  }

  /**
   * Authorize a payment request
   */
  async authorizePayment(requestId: string): Promise<PaymentRequest> {
    const request = await this.paymentRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new BadRequestException('Payment request not found');
    }

    if (request.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment already processed');
    }

    // Check expiry
    if (Date.now() / 1000 > request.expiry) {
      request.status = PaymentStatus.FAILED;
      request.metadata = {
        ...request.metadata,
        errorMessage: 'Payment request expired',
      };
      await this.paymentRepository.save(request);
      throw new BadRequestException('Payment request expired');
    }

    request.status = PaymentStatus.AUTHORIZED;
    await this.paymentRepository.save(request);

    return request;
  }

  /**
   * Complete a payment (transfer funds)
   */
  async completePayment(
    requestId: string,
    callResult?: any,
  ): Promise<PaymentRequest> {
    const request = await this.paymentRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new BadRequestException('Payment request not found');
    }

    if (request.status !== PaymentStatus.AUTHORIZED) {
      throw new BadRequestException('Payment not authorized');
    }

    // For pay-on-success, verify we have a valid result
    if (request.model === PaymentModel.PAY_ON_SUCCESS && !callResult) {
      request.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(request);
      throw new BadRequestException('Pay-on-success requires valid result');
    }

    // TODO: Execute actual transfer via Circle Gateway
    // For demo, mark as completed

    request.status = PaymentStatus.COMPLETED;
    request.metadata = {
      ...request.metadata,
      callResult,
    };

    await this.paymentRepository.save(request);

    // Update provider reliability
    if (request.providerId) {
      await this.reliabilityService.recordSuccess(request.providerId, 100);
    }

    this.logger.log(`Payment ${requestId} completed`);
    return request;
  }

  /**
   * Fail a payment
   */
  async failPayment(requestId: string, reason: string): Promise<PaymentRequest> {
    const request = await this.paymentRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new BadRequestException('Payment request not found');
    }

    request.status = PaymentStatus.FAILED;
    request.metadata = {
      ...request.metadata,
      errorMessage: reason,
    };

    await this.paymentRepository.save(request);

    // Update provider reliability
    if (request.providerId) {
      await this.reliabilityService.recordFailure(request.providerId);
    }

    return request;
  }

  /**
   * Process refund for a failed pay-on-success payment
   */
  async refundPayment(requestId: string): Promise<PaymentRequest> {
    const request = await this.paymentRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new BadRequestException('Payment request not found');
    }

    if (request.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    // TODO: Execute actual refund via Circle Gateway

    request.status = PaymentStatus.REFUNDED;
    await this.paymentRepository.save(request);

    return request;
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(
    userId: string,
    limit = 50,
  ): Promise<PaymentRequest[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Build EIP-712 typed data for payment request
   */
  private buildTypedData(
    params: PaymentRequestParams,
    nonce: string,
    expiry: number,
  ) {
    return {
      domain: this.domain,
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        PaymentRequest: [
          { name: 'payer', type: 'address' },
          { name: 'payee', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'expiry', type: 'uint256' },
        ],
      },
      message: {
        payer: params.payer,
        payee: params.payee,
        amount: params.amount,
        nonce: `0x${nonce}`,
        expiry: expiry.toString(),
      },
    };
  }
}
