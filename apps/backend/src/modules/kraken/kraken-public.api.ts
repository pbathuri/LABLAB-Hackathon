/**
 * Kraken public REST API (no auth). Used on Vercel where the `kraken` CLI is unavailable.
 * @see https://docs.kraken.com/rest/#tag/Market-Data/operation/getTickerInformation
 */

const PAIR_TO_KRAKEN: Record<string, string> = {
  BTCUSD: 'XBTUSD',
  XBTUSD: 'XBTUSD',
  ETHUSD: 'ETHUSD',
  SOLUSD: 'SOLUSD',
};

export async function krakenPublicTicker(pair: string): Promise<{
  last: number;
  raw: unknown;
}> {
  const k = PAIR_TO_KRAKEN[pair.toUpperCase()] ?? pair;
  const url = `https://api.kraken.com/0/public/Ticker?pair=${encodeURIComponent(k)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Kraken ticker HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    error?: string[];
    result?: Record<string, { c?: string[] }>;
  };
  if (json.error?.length) {
    throw new Error(json.error.join(', '));
  }
  const row = json.result ? Object.values(json.result)[0] : undefined;
  const last = parseFloat(row?.c?.[0] ?? '0');
  if (!Number.isFinite(last) || last <= 0) {
    throw new Error('Kraken ticker: invalid last price');
  }
  return { last, raw: json };
}
