"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QuantumService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumService = void 0;
const common_1 = require("@nestjs/common");
const qrng_service_1 = require("./services/qrng.service");
let QuantumService = QuantumService_1 = class QuantumService {
    constructor(qrngService) {
        this.qrngService = qrngService;
        this.logger = new common_1.Logger(QuantumService_1.name);
    }
    async optimizePortfolio(holdings, riskTolerance) {
        const assets = Object.keys(holdings);
        const n = assets.length;
        if (n === 0) {
            return this.getDefaultResult();
        }
        this.logger.log(`Starting VQE optimization for ${n} assets`);
        const assetData = await this.generateAssetData(assets);
        const covarianceMatrix = this.calculateCovarianceMatrix(assetData);
        const expectedReturns = assetData.map((a) => a.expectedReturn);
        const lambda = 2 * (1 - riskTolerance);
        const result = await this.runVQEOptimization(covarianceMatrix, expectedReturns, lambda, assets);
        return result;
    }
    async runVQEOptimization(covMatrix, expectedReturns, lambda, assets) {
        const n = assets.length;
        const maxIterations = 100;
        let bestCost = Infinity;
        let bestWeights = new Array(n).fill(1 / n);
        let iterations = 0;
        let converged = false;
        for (let iter = 0; iter < maxIterations; iter++) {
            iterations++;
            const perturbation = await this.qrngService.generateRandomNumbers(n);
            let candidateWeights = bestWeights.map((w, i) => w + (perturbation[i] - 0.5) * 0.1);
            candidateWeights = candidateWeights.map((w) => Math.max(0, w));
            const sum = candidateWeights.reduce((a, b) => a + b, 0);
            candidateWeights = candidateWeights.map((w) => w / sum);
            const cost = this.calculateCost(candidateWeights, covMatrix, expectedReturns, lambda);
            if (cost < bestCost) {
                bestCost = cost;
                bestWeights = candidateWeights;
            }
            if (Math.abs(cost - bestCost) < 1e-6) {
                converged = true;
                break;
            }
        }
        const portfolioReturn = this.calculatePortfolioReturn(bestWeights, expectedReturns);
        const portfolioVariance = this.calculatePortfolioVariance(bestWeights, covMatrix);
        const sharpeRatio = portfolioReturn / Math.sqrt(portfolioVariance);
        const weights = {};
        assets.forEach((asset, i) => {
            weights[asset] = Math.round(bestWeights[i] * 10000) / 10000;
        });
        this.logger.log(`VQE optimization completed in ${iterations} iterations`);
        return {
            weights,
            expectedReturn: portfolioReturn,
            variance: portfolioVariance,
            sharpeRatio,
            quantumIterations: iterations,
            convergenceAchieved: converged,
        };
    }
    calculateCost(weights, covMatrix, expectedReturns, lambda) {
        const variance = this.calculatePortfolioVariance(weights, covMatrix);
        const returnVal = this.calculatePortfolioReturn(weights, expectedReturns);
        return variance - lambda * returnVal;
    }
    calculatePortfolioVariance(weights, covMatrix) {
        let variance = 0;
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                variance += weights[i] * weights[j] * covMatrix[i][j];
            }
        }
        return variance;
    }
    calculatePortfolioReturn(weights, expectedReturns) {
        return weights.reduce((sum, w, i) => sum + w * expectedReturns[i], 0);
    }
    calculateCovarianceMatrix(assetData) {
        const n = assetData.length;
        const matrix = Array(n)
            .fill(null)
            .map(() => Array(n).fill(0));
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const cov = this.covariance(assetData[i].historicalReturns, assetData[j].historicalReturns);
                matrix[i][j] = cov;
            }
        }
        return matrix;
    }
    covariance(x, y) {
        const n = Math.min(x.length, y.length);
        if (n <= 1)
            return 0;
        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;
        let cov = 0;
        for (let i = 0; i < n; i++) {
            cov += (x[i] - meanX) * (y[i] - meanY);
        }
        return cov / (n - 1);
    }
    async generateAssetData(assets) {
        const mockReturns = {
            USDC: { mean: 0.02, volatility: 0.01 },
            BTC: { mean: 0.15, volatility: 0.6 },
            ETH: { mean: 0.12, volatility: 0.5 },
            default: { mean: 0.08, volatility: 0.3 },
        };
        return assets.map((symbol) => {
            const params = mockReturns[symbol] || mockReturns.default;
            const historicalReturns = Array(30)
                .fill(0)
                .map(() => params.mean +
                params.volatility * (Math.random() - 0.5) * 2);
            return {
                symbol,
                expectedReturn: params.mean,
                historicalReturns,
            };
        });
    }
    getDefaultResult() {
        return {
            weights: { USDC: 1.0 },
            expectedReturn: 0.02,
            variance: 0.0001,
            sharpeRatio: 2.0,
            quantumIterations: 0,
            convergenceAchieved: true,
        };
    }
};
exports.QuantumService = QuantumService;
exports.QuantumService = QuantumService = QuantumService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [qrng_service_1.QRNGService])
], QuantumService);
//# sourceMappingURL=quantum.service.js.map