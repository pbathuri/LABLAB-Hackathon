import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MicropaymentService } from './micropayment.service';
import { PaymentModel } from './entities/payment-request.entity';

class CreatePaymentDto {
  payee: string;
  amount: string;
  apiEndpoint?: string;
  providerId?: string;
  model?: PaymentModel;
  description?: string;
}

class CompletePaymentDto {
  callResult?: any;
}

@ApiTags('micropayments')
@Controller('micropayments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class MicropaymentController {
  constructor(private readonly micropaymentService: MicropaymentService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new micropayment request (x402)' })
  @ApiResponse({ status: 201, description: 'Payment request created' })
  async createPayment(@Request() req: any, @Body() dto: CreatePaymentDto) {
    const wallet = req.user.walletAddress || '0x0000000000000000000000000000000000000000';
    
    return this.micropaymentService.createPaymentRequest({
      userId: req.user.id,
      payer: wallet,
      payee: dto.payee,
      amount: dto.amount,
      apiEndpoint: dto.apiEndpoint,
      providerId: dto.providerId,
      model: dto.model,
      description: dto.description,
    });
  }

  @Post(':id/authorize')
  @ApiOperation({ summary: 'Authorize a payment request' })
  @ApiResponse({ status: 200, description: 'Payment authorized' })
  async authorizePayment(@Param('id') id: string) {
    return this.micropaymentService.authorizePayment(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a payment' })
  @ApiResponse({ status: 200, description: 'Payment completed' })
  async completePayment(
    @Param('id') id: string,
    @Body() dto: CompletePaymentDto,
  ) {
    return this.micropaymentService.completePayment(id, dto.callResult);
  }

  @Post(':id/fail')
  @ApiOperation({ summary: 'Mark payment as failed' })
  @ApiResponse({ status: 200, description: 'Payment marked as failed' })
  async failPayment(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.micropaymentService.failPayment(id, body.reason);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a completed payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded' })
  async refundPayment(@Param('id') id: string) {
    return this.micropaymentService.refundPayment(id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({ status: 200, description: 'Payment history returned' })
  async getHistory(@Request() req: any) {
    return this.micropaymentService.getPaymentHistory(req.user.id);
  }
}
