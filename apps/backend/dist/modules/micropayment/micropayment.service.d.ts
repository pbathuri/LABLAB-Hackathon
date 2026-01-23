import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentRequest, PaymentModel } from './entities/payment-request.entity';
import { PostQuantumCryptoService } from '../quantum/services/post-quantum-crypto.service';
import { QRNGService } from '../quantum/services/qrng.service';
import { ReliabilityService } from '../reliability/reliability.service';
import { CircleService } from '../circle/circle.service';
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
export declare class MicropaymentService {
    private paymentRepository;
    private postQuantumCrypto;
    private qrngService;
    private reliabilityService;
    private circleService;
    private configService;
    private readonly logger;
    private readonly domain;
    constructor(paymentRepository: Repository<PaymentRequest>, postQuantumCrypto: PostQuantumCryptoService, qrngService: QRNGService, reliabilityService: ReliabilityService, circleService: CircleService, configService: ConfigService);
    createPaymentRequest(params: PaymentRequestParams): Promise<PaymentRequest>;
    authorizePayment(requestId: string): Promise<PaymentRequest>;
    completePayment(requestId: string, callResult?: any): Promise<PaymentRequest>;
    failPayment(requestId: string, reason: string): Promise<PaymentRequest>;
    refundPayment(requestId: string): Promise<PaymentRequest>;
    getPaymentHistory(userId: string, limit?: number): Promise<PaymentRequest[]>;
    private buildTypedData;
}
