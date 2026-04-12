import { Test } from '@nestjs/testing';
import { KrakenCliService } from './kraken-cli.service';

describe('KrakenCliService', () => {
  it('is injectable', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [KrakenCliService],
    }).compile();
    expect(moduleRef.get(KrakenCliService)).toBeDefined();
  });
});
