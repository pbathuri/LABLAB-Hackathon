import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

/** Kraken pair codes: uppercase alphanumeric, typical length e.g. BTCUSD */
const PAIR_RE = /^[A-Z0-9]{3,16}$/;

export class PaperInitDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1e15)
  balance?: number;
}

export class PaperBuyDto {
  @IsString()
  @Matches(PAIR_RE, {
    message: 'pair must be uppercase Kraken-style code (e.g. BTCUSD)',
  })
  pair!: string;

  @IsNumber()
  @Min(1e-12)
  @Max(1e9)
  volume!: number;

  @IsOptional()
  @IsString()
  @IsIn(['market', 'limit'])
  orderType?: 'market' | 'limit';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1e15)
  price?: number;
}

export class PaperSellDto extends PaperBuyDto { }
