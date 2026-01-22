'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAccount, useBalance, useChainId, useConnect, useDisconnect } from 'wagmi'
import { toast } from 'react-hot-toast'
import { api, WalletData } from '@/lib/api'

interface WalletContextType {
  wallet: WalletData | null
  isLoading: boolean
  error: string | null
  isConnected: boolean
  isConnecting: boolean
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

  const refreshWallet = useCallback(async () => {
    if (isDemoConnected) {
      return
    }

    if (!address || !isConnected) {
      setWallet(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // If backend is available, fetch from API
      if (process.env.NEXT_PUBLIC_API_URL) {
        const walletData = await api.getWallet(address)
        setWallet(walletData)
      } else {
        // Fallback to wagmi data
        setWallet({
          address,
          balance: {
            USDC: '0',
            ARC: balance?.formatted || '0',
          },
          network: chainId === 5042002 ? 'arc-testnet' : 'unknown',
        })
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err)
      // Fallback to wagmi data on error
      if (address && balance) {
        setWallet({
          address,
          balance: {
            USDC: '0',
            ARC: balance.formatted || '0',
          },
          network: chainId === 5042002 ? 'arc-testnet' : 'unknown',
        })
      }
      setError('Failed to load wallet data')
    } finally {
      setIsLoading(false)
    }
  }, [address, balance, chainId, isConnected, isDemoConnected])

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

  const connectWallet = () => {
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

    setIsDemoConnected(true)
    setWallet({
      address: '0xDEMOcAptainWhiskers000000000000000000000',
      balance: {
        USDC: '250.00',
        ARC: '8.50',
      },
      network: 'arc-testnet',
    })
    toast.success('Demo wallet connected (simulation mode).')
  }

  const disconnectWallet = () => {
    wagmiDisconnect()
    setIsDemoConnected(false)
    setWallet(null)
    setError(null)
  }

  const connectedState = isConnected || isDemoConnected

  return (
    <WalletContext.Provider value={{ wallet, isLoading, error, isConnected: connectedState, isConnecting: isPending, refreshWallet, connect: connectWallet, disconnect: disconnectWallet }}>
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
