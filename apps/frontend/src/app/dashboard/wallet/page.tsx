'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Wallet, Copy, ExternalLink, ArrowUpRight, ArrowDownLeft, CheckCircle2, RefreshCw, History, TrendingUp } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { SendTransactionModal } from '@/components/transactions/SendTransactionModal'
import { api, Transaction, CircleWallet } from '@/lib/api'

export default function WalletPage() {
  const { wallet, isLoading, refreshWallet, connect, isConnected, isConnecting, isAuthenticated } = useWallet()
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [circleWallets, setCircleWallets] = useState<CircleWallet[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loadingTx, setLoadingTx] = useState(false)

  const walletAddress = wallet?.address || address || 'Not connected'

  // Fetch transactions and Circle wallets
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated && !api.getStoredAuthToken()) return
      
      setLoadingTx(true)
      try {
        const [txs, wallets] = await Promise.all([
          api.getTransactions(walletAddress, 10).catch(() => []),
          api.listCircleWallets().catch(() => [])
        ])
        setTransactions(txs)
        setCircleWallets(wallets)
      } catch {
        // Silent fail - use empty arrays
      } finally {
        setLoadingTx(false)
      }
    }
    
    fetchData()
  }, [walletAddress, isAuthenticated])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshWallet?.()
      const txs = await api.getTransactions(walletAddress, 10).catch(() => [])
      setTransactions(txs)
    } finally {
      setIsRefreshing(false)
    }
  }
  const arcScanUrl = walletAddress !== 'Not connected' 
    ? `https://testnet.arcscan.io/address/${walletAddress}`
    : '#'

  const copyAddress = () => {
    if (walletAddress !== 'Not connected') {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-8">Wallet</h1>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading wallet data...</div>
          ) : !wallet && !address ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No wallet connected</p>
              <p className="text-sm text-muted-foreground">Please connect your wallet to view wallet information.</p>
              <button
                onClick={connect}
                disabled={isConnecting}
                className="mt-6 btn-quantum disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wallet Address Card */}
              <div className="card-quantum p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Wallet Address
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <code className="text-sm font-mono bg-dark-100 px-4 py-2 rounded-lg flex-1">
                    {walletAddress}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="p-2 rounded-lg hover:bg-dark-100 transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {walletAddress !== 'Not connected' && (
                  <a
                    href={arcScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    View on ArcScan <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Balance Card */}
              <div className="card-quantum p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Balance</h2>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-lg hover:bg-dark-100 transition-colors disabled:opacity-50"
                    title="Refresh balance"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-dark-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2775CA]/20 flex items-center justify-center">
                        <span className="text-[#2775CA] font-bold text-sm">$</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">USDC</span>
                        <div className="text-xs text-muted-foreground">USD Coin</div>
                      </div>
                    </div>
                    <span className="text-2xl font-bold font-mono">
                      {wallet?.balance?.USDC ? parseFloat(wallet.balance.USDC).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-dark-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#00D9FF]/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#00D9FF]" />
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">ARC</span>
                        <div className="text-xs text-muted-foreground">Arc Token</div>
                      </div>
                    </div>
                    <span className="text-2xl font-bold font-mono">
                      {wallet?.balance?.ARC ? parseFloat(wallet.balance.ARC).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 }) : '0.0000'}
                    </span>
                  </div>
                </div>
                {/* Total Value */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Value (est.)</span>
                    <span className="text-lg font-semibold">
                      ${(parseFloat(wallet?.balance?.USDC || '0') + parseFloat(wallet?.balance?.ARC || '0') * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

            {/* Quick Actions */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (!isConnected) {
                      connect()
                      return
                    }
                    setIsSendModalOpen(true)
                  }}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-dark-100 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <ArrowUpRight className="w-5 h-5 text-primary" />
                    <span>{isConnected ? 'Send' : 'Connect to Send'}</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    const addressToCopy = wallet?.address || address
                    if (addressToCopy) {
                      navigator.clipboard.writeText(addressToCopy)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    } else {
                      connect()
                    }
                  }}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-dark-100 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <ArrowDownLeft className="w-5 h-5 text-accent" />
                    <span>{wallet || address ? 'Receive' : 'Connect to Receive'}</span>
                  </div>
                </button>
              </div>
            </div>

              {/* Network Info */}
              <div className="card-quantum p-6">
                <h2 className="text-lg font-semibold mb-4">Network</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span className="font-medium">{wallet?.network === 'arc-testnet' ? 'Arc Testnet' : 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Chain ID</span>
                    <span className="font-mono">5042002</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      {wallet ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="card-quantum p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Transactions
                  </h2>
                  <a href="/dashboard/history" className="text-sm text-primary hover:underline">
                    View All →
                  </a>
                </div>
                {loadingTx ? (
                  <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Your transaction history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-dark-100 rounded-xl hover:bg-dark-100/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'send' || tx.type === 'swap' ? 'bg-red-500/20' : 'bg-green-500/20'
                          }`}>
                            {tx.type === 'send' || tx.type === 'swap' ? (
                              <ArrowUpRight className={`w-5 h-5 ${tx.type === 'send' ? 'text-red-400' : 'text-yellow-400'}`} />
                            ) : (
                              <ArrowDownLeft className="w-5 h-5 text-green-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium capitalize">{tx.type}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(tx.timestamp).toLocaleDateString()} · {tx.status}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono font-medium ${
                            tx.type === 'send' ? 'text-red-400' : tx.type === 'receive' ? 'text-green-400' : ''
                          }`}>
                            {tx.type === 'send' ? '-' : tx.type === 'receive' ? '+' : ''}{tx.amount} {tx.token}
                          </div>
                          {tx.hash && (
                            <a
                              href={`https://testnet.arcscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              {tx.hash.slice(0, 8)}...
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <SendTransactionModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSuccess={() => {
          refreshWallet?.()
        }}
      />
    </DashboardLayout>
  )
}
