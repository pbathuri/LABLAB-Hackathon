'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { useAccount, useBalance, useChainId, useConnect, useDisconnect } from 'wagmi'
import { toast } from 'react-hot-toast'
import { api, WalletData } from '@/lib/api'

interface WalletContextType {
  wallet: WalletData | null
  isLoading: boolean
  error: string | null
  isConnected: boolean
  isConnecting: boolean
  isSimulation: boolean
  isAuthenticated: boolean
  refreshWallet: () => Promise<void>
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending, error: connectError } = useConnect()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDemoConnected, setIsDemoConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const authAttempted = useRef(false)

  /**
   * Auto-authenticate with backend when wallet connects
   * This ensures JWT tokens are automatically created
   */
  const autoAuthenticate = useCallback(async (walletAddr: string) => {
    if (authAttempted.current) return
    authAttempted.current = true

    try {
      // Check if we already have a valid token
      const existingToken = api.getStoredAuthToken()
      if (existingToken) {
        setIsAuthenticated(true)
        return
      }

      // Auto-login with demo account
      const result = await api.autoLoginDemo(walletAddr)
      if (result) {
        setIsAuthenticated(true)
        console.log('Auto-authenticated with backend')
      }
    } catch (err) {
      console.warn('Auto-authentication failed:', err)
    }
  }, [])

  const refreshWallet = useCallback(async () => {
    if (isDemoConnected) {
      // For demo wallet, also try to authenticate
      await autoAuthenticate(wallet?.address || '0xDemo')
      return
    }

    if (!address || !isConnected) {
      setWallet(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Auto-authenticate first
      await autoAuthenticate(address)

      // Try to fetch from backend
      try {
        const walletData = await api.getWallet(address)
        setWallet(walletData)
      } catch {
        // Fallback to wagmi data
        setWallet({
          address,
          balance: {
            USDC: '1000.00', // Demo balance
            ARC: balance?.formatted || '5.00',
          },
          network: chainId === 5042002 ? 'arc-testnet' : 'unknown',
        })
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err)
      // Fallback to wagmi data on error
      setWallet({
        address,
        balance: {
          USDC: '1000.00',
          ARC: balance?.formatted || '5.00',
        },
        network: chainId === 5042002 ? 'arc-testnet' : 'unknown',
      })
      setError('Failed to load wallet data')
    } finally {
      setIsLoading(false)
    }
  }, [address, balance, chainId, isConnected, isDemoConnected, autoAuthenticate, wallet?.address])

  // Check for existing auth on mount
  useEffect(() => {
    const existingToken = api.getStoredAuthToken()
    if (existingToken) {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isConnected && address) {
      refreshWallet()
    } else {
      setWallet(null)
      setError(null)
    }
  }, [address, isConnected, refreshWallet])

  useEffect(() => {
    if (connectError) {
      toast.error(connectError.message || 'Failed to connect wallet')
    }
  }, [connectError])

  const connectWallet = async () => {
    const hasInjected = typeof window !== 'undefined' && (window as any).ethereum
    const injectedConnector = connectors.find((connector) => connector.id === 'injected')
    const walletConnectConnector = connectors.find((connector) => connector.id === 'walletConnect')

    if (hasInjected && injectedConnector) {
      connect({ connector: injectedConnector })
      return
    }

    if (walletConnectConnector) {
      connect({ connector: walletConnectConnector })
      return
    }

    // Use demo wallet and auto-authenticate
    const demoAddress = '0xDEMO' + Math.random().toString(16).slice(2, 10).padEnd(32, '0')
    setIsDemoConnected(true)
    authAttempted.current = false // Reset to allow auth
    
    setWallet({
      address: demoAddress,
      balance: {
        USDC: '1000.00',
        ARC: '10.00',
      },
      network: 'arc-testnet',
    })

    // Auto-authenticate in background
    try {
      const result = await api.autoLoginDemo(demoAddress)
      if (result) {
        setIsAuthenticated(true)
        toast.success('Demo wallet connected & authenticated!')
      } else {
        toast.success('Demo wallet connected (simulation mode)')
      }
    } catch {
      toast.success('Demo wallet connected (simulation mode)')
    }
  }

  const disconnectWallet = () => {
    wagmiDisconnect()
    setIsDemoConnected(false)
    setWallet(null)
    setError(null)
    setIsAuthenticated(false)
    api.clearAuthToken()
    authAttempted.current = false
    toast.success('Wallet disconnected')
  }

  const connectedState = isConnected || isDemoConnected

  return (
    <WalletContext.Provider value={{ 
      wallet, 
      isLoading, 
      error, 
      isConnected: connectedState, 
      isConnecting: isPending, 
      isSimulation: isDemoConnected, 
      isAuthenticated,
      refreshWallet, 
      connect: connectWallet, 
      disconnect: disconnectWallet 
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}
