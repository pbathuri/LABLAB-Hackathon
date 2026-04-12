import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PrismService {
  private readonly logger = new Logger(PrismService.name);
  private readonly baseUrl = 'https://api.prismapi.ai';
  private readonly headers: HeadersInit;
  private readonly cache = new Map<
    string,
    { data: unknown; expires: number }
  >();

  constructor() {
    const key = process.env.PRISM_API_KEY ?? '';
    this.headers = {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }

  private async cachedFetch(
    path: string,
    ttlMs: number,
  ): Promise<unknown> {
    const cached = this.cache.get(path);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.headers,
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`PRISM API ${res.status}: ${t}`);
    }
    const data: unknown = await res.json();
    this.cache.set(path, { data, expires: Date.now() + ttlMs });
    return data;
  }

  async resolve(asset: string): Promise<unknown> {
    return this.cachedFetch(`/resolve/${encodeURIComponent(asset)}`, 86_400_000);
  }

  async cryptoPrice(symbol: string): Promise<unknown> {
    return this.cachedFetch(`/crypto/${encodeURIComponent(symbol)}/price`, 10_000);
  }

  async signals(symbol: string): Promise<unknown> {
    return this.cachedFetch(`/signals/${encodeURIComponent(symbol)}`, 60_000);
  }

  async risk(symbol: string): Promise<unknown> {
    return this.cachedFetch(`/risk/${encodeURIComponent(symbol)}`, 60_000);
  }
}
