import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MicropaymentService } from './micropayment.service';
import { MicropaymentController } from './micropayment.controller';
import { PaymentRequest } from './entities/payment-request.entity';
import { QuantumModule } from '../quantum/quantum.module';
import { ReliabilityModule } from '../reliability/reliability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentRequest]),
    QuantumModule,
    ReliabilityModule,
  ],
  controllers: [MicropaymentController],
  providers: [MicropaymentService],
  exports: [MicropaymentService],
})
export class MicropaymentModule {}
