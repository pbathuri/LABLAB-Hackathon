import { MicropaymentService } from './micropayment.service';
import { PaymentModel } from './entities/payment-request.entity';
declare class CreatePaymentDto {
    payee: string;
    amount: string;
    apiEndpoint?: string;
    providerId?: string;
    model?: PaymentModel;
    description?: string;
}
declare class CompletePaymentDto {
    callResult?: any;
}
export declare class MicropaymentController {
    private readonly micropaymentService;
    constructor(micropaymentService: MicropaymentService);
    createPayment(req: any, dto: CreatePaymentDto): Promise<import("./entities/payment-request.entity").PaymentRequest>;
    authorizePayment(id: string): Promise<import("./entities/payment-request.entity").PaymentRequest>;
    completePayment(id: string, dto: CompletePaymentDto): Promise<import("./entities/payment-request.entity").PaymentRequest>;
    failPayment(id: string, body: {
        reason: string;
    }): Promise<import("./entities/payment-request.entity").PaymentRequest>;
    refundPayment(id: string): Promise<import("./entities/payment-request.entity").PaymentRequest>;
    getHistory(req: any): Promise<import("./entities/payment-request.entity").PaymentRequest[]>;
}
export {};
