import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { VerifierNode } from './entities/verifier-node.entity';
import { VerificationLog } from './entities/verification-log.entity';
import { QuantumModule } from '../quantum/quantum.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerifierNode, VerificationLog]),
    QuantumModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
