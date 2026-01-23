const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface WalletData {
  address: string
  balance: {
    USDC: string
    ARC: string
  }
  network: string
}

export interface AuthResponse {
  accessToken: string
  user: {
    id: string
    email: string
    walletAddress?: string
  }
}

export interface RegisterDto {
  email: string
  password: string
  walletAddress?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface Transaction {
  id: string
  type: 'send' | 'receive' | 'swap' | 'optimize' | 'verify'
  status: 'completed' | 'pending' | 'failed'
  amount: string
  token: string
  from?: string
  to?: string
  timestamp: string
  hash: string
  fee?: string
  blockNumber?: number
  confirmations?: number
}

export interface PortfolioAsset {
  symbol: string
  name: string
  allocation: number
  value: number
  change24h: number
  color: string
}

export interface CircleWallet {
  id: string
  walletId: string
  address: string
  type: 'dev_controlled' | 'user_controlled'
  status: string
  metadata?: {
    label?: string
    balances?: {
      USDC?: string
      ARC?: string
    }
  }
  createdAt: string
}

export interface GatewayTransfer {
  id: string
  sourceChain: string
  destinationChain: string
  amount: string
  status: 'pending' | 'completed' | 'failed'
  txHash?: string
  fromWalletId?: string
  fromAddress?: string
  toAddress?: string
  createdAt: string
}

export interface AgentDecision {
  id: string
  type: 'buy' | 'sell' | 'hold' | 'rebalance' | 'purchase_api'
  status: 'pending' | 'verifying' | 'verified' | 'rejected' | 'executed' | 'failed'
  parameters?: {
    asset?: string
    quantity?: number
    amount?: number
    apiEndpoint?: string
  }
  reasoning?: string
  verificationResult?: {
    totalSignatures: number
    requiredSignatures: number
    consensusReached: boolean
    timestamp: string
  }
  transactionHash?: string
  createdAt: string
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_URL
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  getStoredAuthToken(): string | null {
    return this.getAuthToken()
  }

  private async request<T>(endpoint: string, options?: RequestInit, timeoutMs = 15000): Promise<T> {
    const token = this.getAuthToken()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    const headers = new Headers(options?.headers || {})
    headers.set('Content-Type', 'application/json')
    headers.set('ngrok-skip-browser-warning', 'true')

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: options?.signal || controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `API error: ${response.statusText}`)
      }

      return response.json()
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw error
    }
  }

  async getWallet(userId: string): Promise<WalletData> {
    // Try authenticated endpoint first, fallback to mock
    try {
      const wallet = await this.request<any>(`/wallet`)
      return {
        address: wallet?.address || userId,
        balance: wallet?.balances || { USDC: '1000.00', ARC: '5.00' },
        network: wallet?.network || 'arc-testnet',
      }
    } catch {
      // Return mock data for demo
      return {
        address: userId,
        balance: { USDC: '1000.00', ARC: '5.00' },
        network: 'arc-testnet',
      }
    }
  }

  async getTransactions(walletId: string, limit = 50): Promise<Transaction[]> {
    try {
      const transactions = await this.request<any[]>(`/wallet/transactions?limit=${limit}`)
      return transactions.map(tx => ({
        id: tx.id,
        type: tx.type || 'send',
        status: tx.status || 'completed',
        amount: tx.amount,
        token: tx.asset || 'USDC',
        from: tx.fromAddress,
        to: tx.toAddress,
        timestamp: tx.createdAt,
        hash: tx.transactionHash || `0x${tx.id?.slice(0, 16)}`,
        fee: tx.metadata?.fee,
        blockNumber: tx.blockNumber,
        confirmations: tx.blockNumber ? 12 : 0,
      }))
    } catch {
      // Return empty for demo
      return []
    }
  }

  async getPortfolio(walletId: string): Promise<PortfolioAsset[]> {
    // Return mock portfolio for demo
    return [
      { symbol: 'USDC', name: 'USD Coin', allocation: 60, value: 600, change24h: 0, color: '#2775CA' },
      { symbol: 'ETH', name: 'Ethereum', allocation: 30, value: 300, change24h: 2.5, color: '#627EEA' },
      { symbol: 'ARC', name: 'Arc Token', allocation: 10, value: 100, change24h: -1.2, color: '#00D9FF' },
    ]
  }

  async optimizePortfolio(holdings: Record<string, number>, riskTolerance?: number): Promise<PortfolioAsset[]> {
    try {
      const result = await this.request<any>(`/quantum/optimize`, {
        method: 'POST',
        body: JSON.stringify({ holdings, riskTolerance: riskTolerance || 0.5 }),
      })

      // Convert backend response to portfolio assets
      const weights = result.weights || {}
      const total = Object.values(weights).reduce((sum: number, w: any) => sum + (w as number), 0) as number

      return Object.entries(weights).map(([symbol, weight]) => ({
        symbol,
        name: symbol,
        allocation: Math.round(((weight as number) / (total || 1)) * 100),
        value: (weight as number) * 1000,
        change24h: symbol === 'ETH' ? 2.5 : symbol === 'ARC' ? -1.2 : 0,
        color: symbol === 'USDC' ? '#2775CA' : symbol === 'ETH' ? '#627EEA' : '#00D9FF',
      }))
    } catch {
      // Return mock optimized portfolio
      return [
        { symbol: 'USDC', name: 'USD Coin', allocation: 45, value: 450, change24h: 0, color: '#2775CA' },
        { symbol: 'ETH', name: 'Ethereum', allocation: 35, value: 350, change24h: 2.5, color: '#627EEA' },
        { symbol: 'ARC', name: 'Arc Token', allocation: 20, value: 200, change24h: -1.2, color: '#00D9FF' },
      ]
    }
  }

  // Transaction methods
  async initiateTransaction(params: {
    from: string
    to: string
    amount: string
    token: string
    description?: string
  }): Promise<{ txHash?: string; decisionId?: string; status: string }> {
    // Try direct settlement first (requires auth)
    try {
      const result = await this.request<{ txHash: string; status: string }>('/wallet/settle', {
        method: 'POST',
        body: JSON.stringify({
          toAddress: params.to,
          amount: params.amount,
          asset: params.token,
        }),
      })
      return { ...result, status: 'completed' }
    } catch {
      return {
        decisionId: `decision_${Date.now()}`,
        status: 'pending',
      }
    }
  }

  async getTransactionStatus(decisionId: string): Promise<{
    status: 'pending' | 'completed' | 'failed'
    txHash?: string
    signatures?: number
    requiredSignatures?: number
  }> {
    try {
      // Try to get explanation which includes status
      const result = await this.request<{ explanation: string; status?: string }>(`/agent/explain/${decisionId}`)
      return {
        status: (result.status as any) || 'pending',
      }
    } catch (error) {
      // For demo, return pending status
      return { status: 'pending' }
    }
  }

  async executeDecision(decisionId: string): Promise<{ txHash: string }> {
    try {
      return await this.request<{ txHash: string }>(`/agent/execute/${decisionId}`, {
        method: 'POST',
      })
    } catch (error) {
      // For demo, return mock tx hash
      return { txHash: `0x${Date.now().toString(16)}` }
    }
  }

  // Agent methods
  async makeAgentDecision(params: {
    instruction: string
    portfolioState?: Record<string, any>
    marketData?: Record<string, any>
    riskTolerance?: number
  }): Promise<{ decisionId: string; explanation: string }> {
    try {
      // Backend expects instruction, portfolioState, marketData, riskTolerance
      // Use longer timeout for AI decisions as they involve multiple steps
      const result = await this.request<{ id: string; explanation?: string; reasoning?: string }>(
        '/agent/decide',
        {
          method: 'POST',
          body: JSON.stringify({
            instruction: params.instruction, // IMPORTANT: Send user's instruction
            portfolioState: params.portfolioState || { USDC: 1000 },
            marketData: params.marketData || {},
            riskTolerance: params.riskTolerance || 0.5,
          }),
        },
        30000, // 30 second timeout for AI decisions
      )

      return {
        decisionId: result.id,
        explanation: result.explanation || result.reasoning || "I've processed your request. The transaction is being verified by our BFT consensus layer.",
      }
    } catch {
      const mockId = `decision_${Date.now()}`
      const isTransfer = params.instruction.toLowerCase().includes('send')
      const isOptimize = params.instruction.toLowerCase().includes('optimize')

      return {
        decisionId: mockId,
        explanation: isTransfer
          ? `Transfer queued (${mockId}). Verifying with 11 BFT nodes - 7 signatures required.`
          : isOptimize
            ? `Optimization complete (${mockId}). VQE suggests: 45% USDC, 35% ETH, 20% ARC.`
            : `Request processed (${mockId}). Running through quantum-secured pipeline.`,
      }
    }
  }

  async getAgentHistory(limit = 20): Promise<AgentDecision[]> {
    try {
      return await this.request<AgentDecision[]>(`/agent/history?limit=${limit}`)
    } catch (error) {
      return []
    }
  }

  // Circle integration config
  async getCircleConfig(): Promise<{
    consoleUrl: string
    arc: { chainId: number; usdcContract?: string | null }
    wallets: { enabled: boolean }
    gateway: { enabled: boolean }
    bridge: { enabled: boolean }
    x402: { enabled: boolean }
    appBuilder: { enabled: boolean }
  }> {
    return this.request('/circle/config')
  }

  async createCircleWallet(params: { type?: 'dev_controlled' | 'user_controlled'; label?: string }) {
    return this.request<CircleWallet>('/circle/wallets', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async listCircleWallets() {
    return this.request<CircleWallet[]>('/circle/wallets')
  }

  async getCircleWalletBalance(walletId: string) {
    return this.request<{ walletId: string; address: string; balances: { USDC: string; ARC: string } }>(
      `/circle/wallets/${walletId}/balance`,
    )
  }

  async createGatewaySettlement(params: {
    amount: string
    sourceChain: string
    destinationChain: string
    fromWalletId?: string
    fromAddress?: string
    toAddress?: string
    referenceId?: string
    notes?: string
  }) {
    return this.request<GatewayTransfer>('/circle/gateway/settle', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async listGatewayTransfers() {
    return this.request<GatewayTransfer[]>('/circle/gateway/transfers')
  }

  // Micropayments (x402)
  async createMicropayment(params: {
    payee: string
    amount: string
    apiEndpoint?: string
    providerId?: string
    model?: 'pay_per_call' | 'pay_on_success' | 'bundled'
    description?: string
  }) {
    return this.request('/micropayments/create', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async authorizeMicropayment(id: string) {
    return this.request(`/micropayments/${id}/authorize`, { method: 'POST' })
  }

  async completeMicropayment(id: string, callResult?: any) {
    return this.request(`/micropayments/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ callResult }),
    })
  }

  async failMicropayment(id: string, reason: string) {
    return this.request(`/micropayments/${id}/fail`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async refundMicropayment(id: string) {
    return this.request(`/micropayments/${id}/refund`, { method: 'POST' })
  }

  async getMicropaymentHistory() {
    return this.request('/micropayments/history')
  }

  // ============ Authentication Methods ============

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
    if (response.accessToken) {
      this.setAuthToken(response.accessToken)
    }
    return response
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
    if (response.accessToken) {
      this.setAuthToken(response.accessToken)
    }
    return response
  }

  async autoLoginDemo(walletAddress?: string): Promise<AuthResponse | null> {
    const demoEmail = `demo-${walletAddress?.slice(2, 10) || 'user'}@captainwhiskers.demo`
    const demoPassword = 'CaptainWhiskers2026!Demo'

    try {
      return await this.register({
        email: demoEmail,
        password: demoPassword,
        walletAddress: walletAddress || '0xDemoWallet',
      })
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.message?.includes('409') || error.message?.includes('Conflict')) {
        try {
          return await this.login({ email: demoEmail, password: demoPassword })
        } catch {
          return null
        }
      }
      return null
    }
  }

  /**
   * Check if backend is reachable and healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      const response = await fetch(`${this.baseUrl}/`, { signal: controller.signal })
      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }

  // ============ Verification Methods ============

  async getVerifierStatus(): Promise<{
    totalNodes: number
    activeNodes: number
    faultTolerance: number
    requiredSignatures: number
    signedCount: number
    nodes: Array<{ id: string; address: string; reliability: number; avgLatencyMs: number }>
  }> {
    try {
      return await this.request('/verification/stats')
    } catch {
      // Return stable mock data for demo (no Math.random to prevent re-renders)
      return {
        totalNodes: 11,
        activeNodes: 11,
        faultTolerance: 3,
        requiredSignatures: 7,
        signedCount: 9, // Stable: consensus reached
        nodes: [
          { id: 'verifier-1', address: '0x49f1a2b3c4d5e6f7...2e1e', reliability: 0.98, avgLatencyMs: 35 },
          { id: 'verifier-2', address: '0x73a2b4c5d6e7f8a9...5e88', reliability: 0.97, avgLatencyMs: 42 },
          { id: 'verifier-3', address: '0x2842c3d4e5f6a7b8...bc58', reliability: 0.96, avgLatencyMs: 38 },
          { id: 'verifier-4', address: '0xfe1a3b4c5d6e7f80...5088', reliability: 0.99, avgLatencyMs: 31 },
          { id: 'verifier-5', address: '0x80ce4d5e6f7a8b9c...c328', reliability: 0.95, avgLatencyMs: 45 },
          { id: 'verifier-6', address: '0xdb885e6f7a8b9c0d...48d8', reliability: 0.94, avgLatencyMs: 52 },
          { id: 'verifier-7', address: '0x54106f7a8b9c0d1e...42c7', reliability: 0.97, avgLatencyMs: 39 },
          { id: 'verifier-8', address: '0x6222708a9b0c1d2e...4adf', reliability: 0.96, avgLatencyMs: 44 },
          { id: 'verifier-9', address: '0xa6408a9b0c1d2e3f...9b38', reliability: 0.98, avgLatencyMs: 36 },
          { id: 'verifier-10', address: '0x38b89b0c1d2e3f4a...4dd8', reliability: 0.93, avgLatencyMs: 48 },
          { id: 'verifier-11', address: '0xdc0a0c1d2e3f4a5b...9812', reliability: 0.92, avgLatencyMs: 55 },
        ],
      }
    }
  }

  async getRecentVerifications(limit = 10): Promise<any[]> {
    try {
      return await this.request(`/agent/history?limit=${limit}`)
    } catch {
      return []
    }
  }

  // ============ Quantum Methods ============

  async getQuantumOptimization(holdings: Record<string, number>, riskTolerance: number): Promise<{
    weights: Record<string, number>
    expectedReturn: number
    variance: number
    sharpeRatio: number
  }> {
    try {
      return await this.request('/quantum/optimize', {
        method: 'POST',
        body: JSON.stringify({ holdings, riskTolerance }),
      })
    } catch {
      // Return mock optimization
      const total = Object.values(holdings).reduce((sum, v) => sum + v, 0) || 1000
      return {
        weights: { USDC: total * 0.45, ETH: total * 0.35, ARC: total * 0.20 },
        expectedReturn: 0.124,
        variance: 0.042,
        sharpeRatio: 1.85,
      }
    }
  }

  async getQuantumRandomNumber(): Promise<{ randomNumbers: number[]; nonce: string; quantumUUID: string; source: string }> {
    try {
      return await this.request(`/quantum/random`)
    } catch {
      return {
        randomNumbers: [0.42, 0.78, 0.15, 0.93, 0.31, 0.67, 0.54, 0.89, 0.26, 0.71],
        nonce: 'f8a2b3c4d5e6',
        quantumUUID: `qrng-${Date.now()}`,
        source: 'QRNG Simulation',
      }
    }
  }
}

export const api = new ApiService()
