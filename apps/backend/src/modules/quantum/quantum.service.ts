import { Injectable, Logger } from '@nestjs/common';
import { QRNGService } from './services/qrng.service';

export interface PortfolioOptimizationResult {
  weights: Record<string, number>;
  expectedReturn: number;
  variance: number;
  sharpeRatio: number;
  quantumIterations: number;
  convergenceAchieved: boolean;
}

export interface AssetData {
  symbol: string;
  expectedReturn: number;
  historicalReturns: number[];
}

/**
 * Quantum Treasury Service
 * 
 * Implements VQE (Variational Quantum Eigensolver) style portfolio optimization
 * using simulated quantum circuits. The optimization problem is formalized as:
 * 
 * minimize: C(θ) = <ψ(θ)|H|ψ(θ)>
 * subject to: Σwᵢ = 1, wᵢ ≥ 0
 * 
 * where H = Σᵢⱼ Σᵢⱼwᵢwⱼ - λΣᵢμᵢwᵢ
 * 
 * - Σᵢⱼ is the covariance matrix
 * - μᵢ are expected returns
 * - λ is risk aversion parameter
 */
@Injectable()
export class QuantumService {
  private readonly logger = new Logger(QuantumService.name);

  constructor(private qrngService: QRNGService) {}

  /**
   * Optimize portfolio using simulated VQE algorithm
   */
  async optimizePortfolio(
    holdings: Record<string, number>,
    riskTolerance: number,
  ): Promise<PortfolioOptimizationResult> {
    const assets = Object.keys(holdings);
    const n = assets.length;

    if (n === 0) {
      return this.getDefaultResult();
    }

    this.logger.log(`Starting VQE optimization for ${n} assets`);

    // Generate mock historical returns for demonstration
    const assetData = await this.generateAssetData(assets);

    // Calculate covariance matrix
    const covarianceMatrix = this.calculateCovarianceMatrix(assetData);

    // Calculate expected returns vector
    const expectedReturns = assetData.map((a) => a.expectedReturn);

    // Risk aversion parameter (higher = more risk averse)
    const lambda = 2 * (1 - riskTolerance);

    // Run VQE optimization simulation
    const result = await this.runVQEOptimization(
      covarianceMatrix,
      expectedReturns,
      lambda,
      assets,
    );

    return result;
  }

  /**
   * Simulated VQE optimization using classical optimization
   * In production, this would use Qiskit with actual quantum circuits
   */
  private async runVQEOptimization(
    covMatrix: number[][],
    expectedReturns: number[],
    lambda: number,
    assets: string[],
  ): Promise<PortfolioOptimizationResult> {
    const n = assets.length;
    const maxIterations = 100;
    let bestCost = Infinity;
    let bestWeights = new Array(n).fill(1 / n);
    let iterations = 0;
    let converged = false;

    // COBYLA-style optimization simulation
    for (let iter = 0; iter < maxIterations; iter++) {
      iterations++;

      // Generate random perturbation using QRNG
      const perturbation = await this.qrngService.generateRandomNumbers(n);

      // Create candidate weights with quantum-inspired randomness
      let candidateWeights = bestWeights.map(
        (w, i) => w + (perturbation[i] - 0.5) * 0.1,
      );

      // Normalize to sum to 1 and ensure non-negative
      candidateWeights = candidateWeights.map((w) => Math.max(0, w));
      const sum = candidateWeights.reduce((a, b) => a + b, 0);
      candidateWeights = candidateWeights.map((w) => w / sum);

      // Calculate cost function (portfolio variance - lambda * expected return)
      const cost = this.calculateCost(
        candidateWeights,
        covMatrix,
        expectedReturns,
        lambda,
      );

      if (cost < bestCost) {
        bestCost = cost;
        bestWeights = candidateWeights;
      }

      // Check convergence
      if (Math.abs(cost - bestCost) < 1e-6) {
        converged = true;
        break;
      }
    }

    // Calculate final metrics
    const portfolioReturn = this.calculatePortfolioReturn(
      bestWeights,
      expectedReturns,
    );
    const portfolioVariance = this.calculatePortfolioVariance(
      bestWeights,
      covMatrix,
    );
    const sharpeRatio = portfolioReturn / Math.sqrt(portfolioVariance);

    // Create weights map
    const weights: Record<string, number> = {};
    assets.forEach((asset, i) => {
      weights[asset] = Math.round(bestWeights[i] * 10000) / 10000;
    });

    this.logger.log(
      `VQE optimization completed in ${iterations} iterations`,
    );

    return {
      weights,
      expectedReturn: portfolioReturn,
      variance: portfolioVariance,
      sharpeRatio,
      quantumIterations: iterations,
      convergenceAchieved: converged,
    };
  }

  /**
   * Calculate cost function for VQE
   * Cost = w'Σw - λ * w'μ
   */
  private calculateCost(
    weights: number[],
    covMatrix: number[][],
    expectedReturns: number[],
    lambda: number,
  ): number {
    const variance = this.calculatePortfolioVariance(weights, covMatrix);
    const returnVal = this.calculatePortfolioReturn(weights, expectedReturns);
    return variance - lambda * returnVal;
  }

  private calculatePortfolioVariance(
    weights: number[],
    covMatrix: number[][],
  ): number {
    let variance = 0;
    for (let i = 0; i < weights.length; i++) {
      for (let j = 0; j < weights.length; j++) {
        variance += weights[i] * weights[j] * covMatrix[i][j];
      }
    }
    return variance;
  }

  private calculatePortfolioReturn(
    weights: number[],
    expectedReturns: number[],
  ): number {
    return weights.reduce((sum, w, i) => sum + w * expectedReturns[i], 0);
  }

  private calculateCovarianceMatrix(assetData: AssetData[]): number[][] {
    const n = assetData.length;
    const matrix: number[][] = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const cov = this.covariance(
          assetData[i].historicalReturns,
          assetData[j].historicalReturns,
        );
        matrix[i][j] = cov;
      }
    }

    return matrix;
  }

  private covariance(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let cov = 0;
    for (let i = 0; i < n; i++) {
      cov += (x[i] - meanX) * (y[i] - meanY);
    }

    return cov / (n - 1);
  }

  private async generateAssetData(assets: string[]): Promise<AssetData[]> {
    // In production, fetch real historical data
    // For demo, generate mock data based on asset type
    const mockReturns: Record<string, { mean: number; volatility: number }> = {
      USDC: { mean: 0.02, volatility: 0.01 },
      BTC: { mean: 0.15, volatility: 0.6 },
      ETH: { mean: 0.12, volatility: 0.5 },
      default: { mean: 0.08, volatility: 0.3 },
    };

    return assets.map((symbol) => {
      const params = mockReturns[symbol] || mockReturns.default;
      const historicalReturns = Array(30)
        .fill(0)
        .map(
          () =>
            params.mean +
            params.volatility * (Math.random() - 0.5) * 2,
        );

      return {
        symbol,
        expectedReturn: params.mean,
        historicalReturns,
      };
    });
  }

  private getDefaultResult(): PortfolioOptimizationResult {
    return {
      weights: { USDC: 1.0 },
      expectedReturn: 0.02,
      variance: 0.0001,
      sharpeRatio: 2.0,
      quantumIterations: 0,
      convergenceAchieved: true,
    };
  }
}
