import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KrakenCliService } from './kraken-cli.service';
import { KrakenMarketService } from './kraken-market.service';
import { KrakenPaperService } from './kraken-paper.service';
import { KrakenController } from './kraken.controller';
import { PaperPortfolioState } from './entities/paper-portfolio-state.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaperPortfolioState])],
  controllers: [KrakenController],
  providers: [KrakenCliService, KrakenMarketService, KrakenPaperService],
  exports: [KrakenCliService, KrakenMarketService, KrakenPaperService],
})
export class KrakenModule { }
