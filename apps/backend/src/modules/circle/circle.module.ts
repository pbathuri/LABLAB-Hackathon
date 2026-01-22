import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CircleController } from './circle.controller';
import { CircleService } from './circle.service';

@Module({
  imports: [ConfigModule],
  controllers: [CircleController],
  providers: [CircleService],
  exports: [CircleService],
})
export class CircleModule {}
