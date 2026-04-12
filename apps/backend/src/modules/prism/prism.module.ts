import { Module } from '@nestjs/common';
import { PrismService } from './prism.service';
import { PrismController } from './prism.controller';

@Module({
  controllers: [PrismController],
  providers: [PrismService],
  exports: [PrismService],
})
export class PrismModule { }
