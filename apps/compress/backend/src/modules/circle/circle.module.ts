import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CircleController } from './circle.controller';
import { CircleService } from './circle.service';
import { CircleWallet } from './entities/circle-wallet.entity';
import { GatewayTransfer } from './entities/gateway-transfer.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([CircleWallet, GatewayTransfer])],
  controllers: [CircleController],
  providers: [CircleService],
  exports: [CircleService],
})
export class CircleModule {}
