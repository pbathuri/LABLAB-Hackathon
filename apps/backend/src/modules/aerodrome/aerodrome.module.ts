import { Module } from '@nestjs/common';
import { AerodromeService } from './aerodrome.service';

@Module({
  providers: [AerodromeService],
  exports: [AerodromeService],
})
export class AerodromeModule { }
