const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface WalletData {
  address: string
  balance: {
    USDC: string
    ARC: string
  }
  network: string
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

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_URL
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  async getWallet(userId: string): Promise<WalletData> {
    return this.request<WalletData>(`/api/wallet/${userId}`)
  }

  async getTransactions(walletId: string, limit = 50): Promise<Transaction[]> {
    return this.request<Transaction[]>(`/api/wallet/${walletId}/transactions?limit=${limit}`)
  }

  async getPortfolio(walletId: string): Promise<PortfolioAsset[]> {
    return this.request<PortfolioAsset[]>(`/api/portfolio/${walletId}`)
  }

  async optimizePortfolio(walletId: string, riskTolerance?: number): Promise<PortfolioAsset[]> {
    return this.request<PortfolioAsset[]>(`/api/portfolio/${walletId}/optimize`, {
      method: 'POST',
      body: JSON.stringify({ riskTolerance }),
    })
  }
}

export const api = new ApiService()
