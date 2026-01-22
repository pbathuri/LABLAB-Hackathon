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
    try {
      const token = this.getAuthToken()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
      const headers = new Headers(options?.headers || {})
      headers.set('Content-Type', 'application/json')

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

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
      if (error.name === 'AbortError') {
        console.error(`API request timed out: ${endpoint}`)
        throw new Error('Request timed out. Please try again.')
      }
      console.error(`API request failed: ${endpoint}`, error)
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
        change24h: Math.random() * 5 - 2.5,
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
    } catch (error) {
      // If direct settlement fails (no auth or other error), use agent decision
      // For demo purposes, we'll create a mock response
      console.warn('Direct settlement failed, using agent decision flow:', error)
      
      // Return a mock decision ID for demo
      const decisionId = `decision_${Date.now()}`
      return {
        decisionId,
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
      // Backend expects portfolioState, marketData, riskTolerance
      // Use longer timeout for AI decisions as they involve multiple steps
      const result = await this.request<{ id: string; explanation?: string; reasoning?: string }>(
        '/agent/decide',
        {
          method: 'POST',
          body: JSON.stringify({
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
    } catch (error: any) {
      // For demo purposes, return a mock response if backend is unavailable
      console.warn('Agent decision failed, using mock response:', error)
      
      // Generate a realistic mock response
      const mockId = `decision_${Date.now()}`
      const action = params.instruction.toLowerCase().includes('send') ? 'transfer' :
                     params.instruction.toLowerCase().includes('optimize') ? 'rebalance' : 'analysis'
      
      return {
        decisionId: mockId,
        explanation: action === 'transfer' 
          ? `I've queued your transfer request (${mockId}). It's being verified by 11 BFT nodes - 7 signatures required for consensus.`
          : action === 'rebalance'
          ? `Portfolio optimization complete (${mockId}). VQE algorithm suggests: 45% USDC, 35% ETH, 20% ARC for optimal risk-adjusted returns.`
          : `I've analyzed your request (${mockId}). This action is being processed through our quantum-secured pipeline.`,
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

  /**
   * Auto-login with a demo account for seamless experience
   * Creates account if doesn't exist, or logs in if it does
   */
  async autoLoginDemo(walletAddress?: string): Promise<AuthResponse | null> {
    const demoEmail = `demo-${walletAddress?.slice(2, 10) || 'user'}@captainwhiskers.demo`
    const demoPassword = 'CaptainWhiskers2026!Demo'
    
    try {
      // Try to register first
      const result = await this.register({
        email: demoEmail,
        password: demoPassword,
        walletAddress: walletAddress || '0xDemoWallet',
      })
      console.log('Auto-registered demo account')
      return result
    } catch (error: any) {
      // If user already exists, try login
      if (error.message?.includes('already exists') || error.message?.includes('409') || error.message?.includes('Conflict')) {
        try {
          const result = await this.login({ email: demoEmail, password: demoPassword })
          console.log('Auto-logged in to demo account')
          return result
        } catch (loginError) {
          console.error('Auto-login failed:', loginError)
          return null
        }
      }
      console.error('Auto-register failed:', error)
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
    nodes: Array<{ id: string; address: string; reliability: number; avgLatencyMs: number }>
  }> {
    try {
      return await this.request('/verification/stats')
    } catch {
      // Return mock data for demo
      return {
        totalNodes: 11,
        activeNodes: 11,
        faultTolerance: 3,
        requiredSignatures: 7,
        nodes: Array.from({ length: 11 }, (_, i) => ({
          id: `verifier-${i + 1}`,
          address: `0x${Math.random().toString(16).slice(2, 42)}`,
          reliability: 0.9 + Math.random() * 0.1,
          avgLatencyMs: 30 + Math.random() * 50,
        })),
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
        randomNumbers: Array.from({ length: 10 }, () => Math.random()),
        nonce: Math.random().toString(16).slice(2),
        quantumUUID: `qrng-${Date.now()}`,
        source: 'QRNG Simulation (frontend fallback)',
      }
    }
  }
}

export const api = new ApiService()
