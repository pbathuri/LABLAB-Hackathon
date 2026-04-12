import { Injectable, Logger } from '@nestjs/common';

export interface GeminiTradingContext {
  portfolio: unknown;
  signals?: unknown;
  riskMetrics?: unknown;
  recentTrades?: unknown[];
}

export interface GeminiTradingResult {
  functionCalls: Array<{ name: string; args: Record<string, unknown> }>;
  reasoning: string;
  raw?: unknown;
}

@Injectable()
export class GeminiTradingService {
  private readonly logger = new Logger(GeminiTradingService.name);
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  private readonly tradingFunctions = [
    {
      name: 'paper_buy',
      description: 'Execute a paper trade buy order on Kraken',
      parameters: {
        type: 'object',
        properties: {
          pair: { type: 'string', description: 'Trading pair (e.g., BTCUSD, ETHUSD)' },
          volume: { type: 'number', description: 'Amount to buy' },
          orderType: { type: 'string', enum: ['market', 'limit'] },
          price: { type: 'number', description: 'Limit price (only for limit orders)' },
        },
        required: ['pair', 'volume'],
      },
    },
    {
      name: 'paper_sell',
      description: 'Execute a paper trade sell order on Kraken',
      parameters: {
        type: 'object',
        properties: {
          pair: { type: 'string', description: 'Trading pair' },
          volume: { type: 'number', description: 'Amount to sell' },
          orderType: { type: 'string', enum: ['market', 'limit'] },
          price: { type: 'number', description: 'Limit price (only for limit orders)' },
        },
        required: ['pair', 'volume'],
      },
    },
    {
      name: 'check_risk',
      description: 'Check risk metrics for an asset before trading',
      parameters: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Asset symbol' },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'get_signals',
      description: 'Get AI trading signals for an asset',
      parameters: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: 'Asset symbol' },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'portfolio_status',
      description: 'Get current paper trading portfolio status',
      parameters: { type: 'object', properties: {} },
    },
  ];

  async processInstruction(
    instruction: string,
    context: GeminiTradingContext,
  ): Promise<GeminiTradingResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.error('GEMINI_API_KEY missing');
      return {
        functionCalls: [],
        reasoning: 'GEMINI_API_KEY not configured',
      };
    }

    const systemPrompt = `You are Captain Whiskers, an autonomous AI trading agent. You analyze market signals, risk metrics, and portfolio state to make trading decisions.

RULES:
- Never exceed 5% of portfolio in a single trade
- Always check risk metrics before trading
- Explain your reasoning clearly
- If uncertain, choose HOLD
- Use fractional Kelly criterion (25-50% of full Kelly) for position sizing
- Monitor drawdown — if portfolio is down >8% from peak, reduce position sizes by 50%

CURRENT PORTFOLIO:
${JSON.stringify(context.portfolio, null, 2)}

${context.signals ? `MARKET SIGNALS:\n${JSON.stringify(context.signals, null, 2)}` : ''}
${context.riskMetrics ? `RISK METRICS:\n${JSON.stringify(context.riskMetrics, null, 2)}` : ''}`;

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: instruction }] }],
      tools: [{ functionDeclarations: this.tradingFunctions }],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data: unknown = await res.json();
    if (!res.ok) {
      this.logger.error(`Gemini error: ${JSON.stringify(data)}`);
      return {
        functionCalls: [],
        reasoning: 'Gemini request failed',
        raw: data,
      };
    }

    return this.parseGeminiResponse(data);
  }

  private parseGeminiResponse(data: unknown): GeminiTradingResult {
    const d = data as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string; functionCall?: { name: string; args: Record<string, unknown> } }> };
      }>;
    };
    const candidate = d.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    const functionCalls = parts
      .filter((p) => p.functionCall)
      .map((p) => ({
        name: p.functionCall!.name,
        args: (p.functionCall!.args as Record<string, unknown>) ?? {},
      }));

    const reasoning = parts
      .filter((p) => p.text)
      .map((p) => p.text as string)
      .join('\n');

    return { functionCalls, reasoning, raw: data };
  }
}
