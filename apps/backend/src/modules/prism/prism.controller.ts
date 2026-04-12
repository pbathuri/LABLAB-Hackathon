import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismService } from './prism.service';

@ApiTags('prism')
@Controller('api/prism')
export class PrismController {
  constructor(private readonly prism: PrismService) { }

  @Get('resolve/:asset')
  @ApiOperation({ summary: 'Resolve asset identifier' })
  resolve(@Param('asset') asset: string) {
    return this.prism.resolve(asset);
  }

  @Get('price/:symbol')
  @ApiOperation({ summary: 'Crypto price' })
  price(@Param('symbol') symbol: string) {
    return this.prism.cryptoPrice(symbol);
  }

  @Get('signals/:symbol')
  @ApiOperation({ summary: 'AI trading signals' })
  signals(@Param('symbol') symbol: string) {
    return this.prism.signals(symbol);
  }

  @Get('risk/:symbol')
  @ApiOperation({ summary: 'Risk / volatility metrics' })
  risk(@Param('symbol') symbol: string) {
    return this.prism.risk(symbol);
  }
}
