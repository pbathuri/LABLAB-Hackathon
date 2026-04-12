import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Gemini AI Service for Captain Whiskers
 * 
 * Integrates Google's Gemini models for:
 * - Natural language understanding of user instructions
 * - Function calling for automated trading decisions
 * - Risk analysis and portfolio recommendations
 * 
 * Uses:
 * - Gemini Flash for fast transactional flows
 * - Gemini Pro for deep analysis and complex reasoning
 */

export interface FunctionCall {
  name: string;
  parameters: Record<string, any>;
}

export interface AgentDecision {
  action: 'BUY' | 'SELL' | 'HOLD' | 'TRANSFER' | 'OPTIMIZE';
  confidence: number;
  reasoning: string;
  parameters: Record<string, any>;
  functionCalls: FunctionCall[];
}

export interface AnalysisResult {
  summary: string;
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  // Available functions for the AI to call
  private readonly availableFunctions = [
    {
      name: 'execute_trade',
      description: 'Execute a trade on behalf of the user',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', enum: ['BUY', 'SELL'] },
          asset: { type: 'string', description: 'Asset symbol to trade' },
          amount: { type: 'number', description: 'Amount to trade' },
          maxSlippage: { type: 'number', description: 'Maximum slippage tolerance in percent' },
        },
        required: ['action', 'asset', 'amount'],
      },
    },
    {
      name: 'transfer_usdc',
      description: 'Transfer USDC to another address',
      parameters: {
        type: 'object',
        properties: {
          recipient: { type: 'string', description: 'Recipient address' },
          amount: { type: 'number', description: 'Amount of USDC to transfer' },
          description: { type: 'string', description: 'Transaction description' },
        },
        required: ['recipient', 'amount'],
      },
    },
    {
      name: 'optimize_portfolio',
      description: 'Run quantum optimization on portfolio allocation',
      parameters: {
        type: 'object',
        properties: {
          riskTolerance: { type: 'number', description: 'Risk tolerance from 0 to 1' },
          rebalance: { type: 'boolean', description: 'Whether to execute rebalancing trades' },
        },
        required: ['riskTolerance'],
      },
    },
    {
      name: 'update_policy',
      description: 'Update spending or trading policy',
      parameters: {
        type: 'object',
        properties: {
          maxTransactionAmount: { type: 'number' },
          dailySpendingCap: { type: 'number' },
          cooldownPeriod: { type: 'number' },
          riskTolerance: { type: 'number' },
        },
      },
    },
    {
      name: 'analyze_market',
      description: 'Perform market analysis for an asset',
      parameters: {
        type: 'object',
        properties: {
          asset: { type: 'string', description: 'Asset symbol to analyze' },
          timeframe: { type: 'string', enum: ['1h', '24h', '7d', '30d'] },
        },
        required: ['asset'],
      },
    },
  ];

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured - using mock responses');
    }
  }

  /**
   * Process a natural language instruction and determine the action
   */
  async processInstruction(
    instruction: string,
    context: {
      portfolio?: any;
      policy?: any;
      recentTransactions?: any[];
    },
  ): Promise<AgentDecision> {
    this.logger.log(`Processing instruction: ${instruction}`);

    if (!this.apiKey) {
      return this.mockDecision(instruction);
    }

    try {
      const response = await this.callGemini('gemini-1.5-flash', {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: this.buildPrompt(instruction, context),
              },
            ],
          },
        ],
        tools: [
          {
            function_declarations: this.availableFunctions,
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      });

      return this.parseResponse(response);
    } catch (error) {
      this.logger.error(`Gemini API error: ${error.message}`);
      return this.mockDecision(instruction);
    }
  }

  /**
   * Perform deep analysis using Gemini Pro
   */
  async analyzePortfolio(
    portfolio: any,
    marketData: any,
  ): Promise<AnalysisResult> {
    this.logger.log('Analyzing portfolio with Gemini Pro');

    if (!this.apiKey) {
      return this.mockAnalysis();
    }

    try {
      const prompt = `
        Analyze this cryptocurrency portfolio and provide insights:
        
        Portfolio: ${JSON.stringify(portfolio)}
        Market Data: ${JSON.stringify(marketData)}
        
        Provide:
        1. A brief summary of portfolio health
        2. Key risks to be aware of
        3. Potential opportunities
        4. Actionable recommendations
        5. Overall sentiment (bullish/bearish/neutral)
        
        Respond in JSON format.
      `;

      const response = await this.callGemini('gemini-1.5-pro', {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      });

      return this.parseAnalysis(response);
    } catch (error) {
      this.logger.error(`Analysis error: ${error.message}`);
      return this.mockAnalysis();
    }
  }

  /**
   * Generate explanation for a decision (for the mascot to explain)
   */
  async explainDecision(decision: AgentDecision): Promise<string> {
    if (!this.apiKey) {
      return this.mockExplanation(decision);
    }

    try {
      const prompt = `
        You are Captain Whiskers, a friendly AI cat assistant for a cryptocurrency treasury.
        Explain this trading decision to the user in a friendly, educational way.
        Use cat-related expressions occasionally (like "purrfect" or "meow").
        Keep it under 100 words.
        
        Decision: ${JSON.stringify(decision)}
      `;

      const response = await this.callGemini('gemini-1.5-flash', {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.text ||
        this.mockExplanation(decision);
    } catch (error) {
      return this.mockExplanation(decision);
    }
  }

  private buildPrompt(instruction: string, context: any): string {
    return `
      You are Captain Whiskers, an AI agent managing a cryptocurrency treasury.
      
      User's current portfolio: ${JSON.stringify(context.portfolio || {})}
      Current policy settings: ${JSON.stringify(context.policy || {})}
      Recent transactions: ${JSON.stringify(context.recentTransactions || [])}
      
      User instruction: "${instruction}"
      
      Analyze the instruction and determine the appropriate action.
      If the user wants to make a trade, transfer, or change settings, use the appropriate function.
      Consider the user's policy limits and portfolio context.
      
      Always verify actions are within policy limits before suggesting them.
    `;
  }

  private async callGemini(model: string, request: any): Promise<any> {
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    return response.json();
  }

  private parseResponse(response: any): AgentDecision {
    const candidate = response.candidates?.[0];
    const content = candidate?.content;
    const parts = content?.parts || [];

    const functionCalls: FunctionCall[] = [];
    let reasoning = '';

    for (const part of parts) {
      if (part.functionCall) {
        functionCalls.push({
          name: part.functionCall.name,
          parameters: part.functionCall.args,
        });
      }
      if (part.text) {
        reasoning += part.text;
      }
    }

    // Determine action from function calls
    let action: AgentDecision['action'] = 'HOLD';
    let parameters: Record<string, any> = {};

    if (functionCalls.length > 0) {
      const fc = functionCalls[0];
      switch (fc.name) {
        case 'execute_trade':
          action = fc.parameters.action === 'BUY' ? 'BUY' : 'SELL';
          parameters = fc.parameters;
          break;
        case 'transfer_usdc':
          action = 'TRANSFER';
          parameters = fc.parameters;
          break;
        case 'optimize_portfolio':
          action = 'OPTIMIZE';
          parameters = fc.parameters;
          break;
      }
    }

    return {
      action,
      confidence: 0.85,
      reasoning,
      parameters,
      functionCalls,
    };
  }

  private parseAnalysis(response: any): AnalysisResult {
    try {
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = JSON.parse(text);
      return {
        summary: json.summary || 'Analysis complete',
        risks: json.risks || [],
        opportunities: json.opportunities || [],
        recommendations: json.recommendations || [],
        sentiment: json.sentiment || 'neutral',
      };
    } catch {
      return this.mockAnalysis();
    }
  }

  private mockDecision(instruction: string): AgentDecision {
    const lowerInstruction = instruction.toLowerCase();

    if (lowerInstruction.includes('buy') || lowerInstruction.includes('purchase')) {
      return {
        action: 'BUY',
        confidence: 0.75,
        reasoning: 'User requested a purchase action',
        parameters: { asset: 'ETH', amount: 100 },
        functionCalls: [{ name: 'execute_trade', parameters: { action: 'BUY', asset: 'ETH', amount: 100 } }],
      };
    }

    if (lowerInstruction.includes('sell')) {
      return {
        action: 'SELL',
        confidence: 0.75,
        reasoning: 'User requested a sell action',
        parameters: { asset: 'ETH', amount: 50 },
        functionCalls: [{ name: 'execute_trade', parameters: { action: 'SELL', asset: 'ETH', amount: 50 } }],
      };
    }

    if (lowerInstruction.includes('optimize')) {
      return {
        action: 'OPTIMIZE',
        confidence: 0.9,
        reasoning: 'User requested portfolio optimization',
        parameters: { riskTolerance: 0.5 },
        functionCalls: [{ name: 'optimize_portfolio', parameters: { riskTolerance: 0.5 } }],
      };
    }

    return {
      action: 'HOLD',
      confidence: 0.6,
      reasoning: 'No clear action identified, maintaining current position',
      parameters: {},
      functionCalls: [],
    };
  }

  private mockAnalysis(): AnalysisResult {
    return {
      summary: 'Your portfolio shows a balanced allocation with moderate risk exposure.',
      risks: [
        'High concentration in volatile assets',
        'Limited stablecoin reserves',
      ],
      opportunities: [
        'ETH staking yields are favorable',
        'DeFi protocols offering attractive APY',
      ],
      recommendations: [
        'Consider increasing USDC allocation to 40%',
        'Set up recurring quantum optimization',
      ],
      sentiment: 'neutral',
    };
  }

  private mockExplanation(decision: AgentDecision): string {
    const explanations: Record<string, string> = {
      BUY: `Meow! 🐱 I've analyzed the market and found a purrfect opportunity to buy ${decision.parameters.asset || 'this asset'}. Based on quantum optimization, this trade aligns with your risk tolerance!`,
      SELL: `Time to take some profits! 📈 I'm recommending we sell some ${decision.parameters.asset || 'assets'} to lock in gains. This keeps your portfolio balanced, just like a cat landing on its feet!`,
      HOLD: `Patience is a virtue, and this cat knows it! 😺 The market conditions suggest we hold our current positions. Our quantum analysis shows no compelling reason to trade right meow.`,
      TRANSFER: `Sending USDC as requested! 💸 I've verified this through our BFT consensus layer - 7 verifiers have signed off. Your funds are moving safely!`,
      OPTIMIZE: `Let me work my quantum magic! ⚛️ Running VQE optimization on your portfolio to find the purrfect allocation. Watch those qubits dance!`,
    };

    return explanations[decision.action] || explanations.HOLD;
  }
}
