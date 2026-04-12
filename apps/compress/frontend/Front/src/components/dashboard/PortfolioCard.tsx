'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { useQuery } from '@tanstack/react-query'
import { api, PortfolioAsset } from '@/lib/api'
import { useState } from 'react'

export function PortfolioCard() {
  const { wallet } = useWallet()
  const [isOptimizing, setIsOptimizing] = useState(false)
  
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['portfolio', wallet?.address],
    queryFn: () => wallet?.address ? api.getPortfolio(wallet.address) : Promise.resolve([]),
    enabled: !!wallet?.address,
  })

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0)
  const totalChange = assets.reduce((sum, asset) => sum + (asset.value * asset.change24h / 100), 0)
  const changePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0

  const handleOptimize = async () => {
    if (!wallet?.address) return
    setIsOptimizing(true)
    try {
      // Build holdings from current assets
      const holdings: Record<string, number> = {}
      assets.forEach(asset => {
        holdings[asset.symbol] = asset.value
      })
      await api.optimizePortfolio(holdings, 0.5)
      // Refetch portfolio data
    } catch (error) {
      console.error('Optimization failed:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="card-quantum p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Portfolio Overview</h3>
          <p className="text-sm text-muted-foreground">Quantum-optimized allocation</p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || !wallet}
          className="px-4 py-2 text-sm rounded-xl border border-primary/30 hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOptimizing ? 'Optimizing...' : 'Optimize'}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading portfolio...</div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-2">No portfolio data</p>
          <p className="text-sm text-muted-foreground">Connect your wallet to view your portfolio.</p>
        </div>
      ) : (
        <>
          {/* Total Value */}
          <div className="flex items-end gap-4 mb-8">
            <div className="text-4xl font-display font-bold">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
              changePercent >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
            </div>
          </div>

          {/* Allocation Chart */}
          <div className="mb-6">
            <div className="flex rounded-xl overflow-hidden h-4">
              {assets.map((asset, index) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ width: 0 }}
                  animate={{ width: `${asset.allocation}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  style={{ backgroundColor: asset.color }}
                  className="h-full"
                />
              ))}
            </div>
          </div>

          {/* Asset List */}
          <div className="space-y-3">
            {assets.map((asset, index) => (
          <motion.div
            key={asset.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-dark-100/50 hover:bg-dark-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
              >
                {asset.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="font-medium">{asset.symbol}</div>
                <div className="text-xs text-muted-foreground">{asset.name}</div>
              </div>
            </div>

              <div className="text-right">
                <div className="font-mono">${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className={`text-xs ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </div>
              </div>

              <div className="text-right w-16">
                <div className="text-sm text-muted-foreground">{asset.allocation.toFixed(1)}%</div>
              </div>
            </motion.div>
          ))}
        </div>
        </>
      )}
    </div>
  )
}
