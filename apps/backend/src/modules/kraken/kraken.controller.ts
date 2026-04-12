import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { KrakenMarketService } from './kraken-market.service';
import { KrakenPaperService } from './kraken-paper.service';
import { PaperBuyDto, PaperInitDto, PaperSellDto } from './dto/paper-trade.dto';

@ApiTags('kraken')
@Controller('api/kraken')
export class KrakenController {
  constructor(
    private readonly market: KrakenMarketService,
    private readonly paper: KrakenPaperService,
  ) { }

  @Get('ticker/:pair')
  @ApiOperation({ summary: 'Kraken ticker for pair (e.g. BTCUSD)' })
  async ticker(@Param('pair') pair: string) {
    return this.market.ticker(pair);
  }

  @Get('market/ohlc/:pair')
  @ApiOperation({ summary: 'OHLC candles' })
  async ohlc(@Param('pair') pair: string) {
    return this.market.ohlc(pair);
  }

  @Post('paper/init')
  @ApiOperation({ summary: 'Initialize paper trading balance' })
  async paperInit(@Body() dto: PaperInitDto) {
    return this.paper.init(dto.balance ?? 10000);
  }

  @Post('paper/buy')
  @ApiOperation({ summary: 'Paper market/limit buy' })
  async paperBuy(@Body() dto: PaperBuyDto) {
    return this.paper.buy(dto.pair, dto.volume, {
      type: dto.orderType ?? 'market',
      price: dto.price,
    });
  }

  @Post('paper/sell')
  @ApiOperation({ summary: 'Paper market/limit sell' })
  async paperSell(@Body() dto: PaperSellDto) {
    return this.paper.sell(dto.pair, dto.volume, {
      type: dto.orderType ?? 'market',
      price: dto.price,
    });
  }

  @Get('paper/status')
  @ApiOperation({ summary: 'Paper portfolio status' })
  async paperStatus() {
    return this.paper.status();
  }

  @Get('paper/history')
  @ApiOperation({ summary: 'Paper trade history' })
  async paperHistory() {
    return this.paper.history();
  }
}
