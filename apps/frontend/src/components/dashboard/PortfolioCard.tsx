'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, PieChart } from 'lucide-react'

interface Asset {
  symbol: string
  name: string
  allocation: number
  value: number
  change24h: number
  color: string
}

const mockAssets: Asset[] = [
  { symbol: 'USDC', name: 'USD Coin', allocation: 40, value: 4980, change24h: 0, color: '#2775CA' },
  { symbol: 'ETH', name: 'Ethereum', allocation: 30, value: 3735, change24h: 2.4, color: '#627EEA' },
  { symbol: 'BTC', name: 'Bitcoin', allocation: 20, value: 2490, change24h: 1.8, color: '#F7931A' },
  { symbol: 'ARC', name: 'Arc Token', allocation: 10, value: 1245, change24h: 5.2, color: '#14F5DD' },
]

export function PortfolioCard() {
  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.value, 0)
  const totalChange = mockAssets.reduce((sum, asset) => sum + (asset.value * asset.change24h / 100), 0)
  const changePercent = (totalChange / totalValue) * 100

  return (
    <div className="card-quantum p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Portfolio Overview</h3>
          <p className="text-sm text-muted-foreground">Quantum-optimized allocation</p>
        </div>
        <button className="px-4 py-2 text-sm rounded-xl border border-primary/30 hover:bg-primary/10 transition-colors">
          Optimize
        </button>
      </div>

      {/* Total Value */}
      <div className="flex items-end gap-4 mb-8">
        <div className="text-4xl font-display font-bold">
          ${totalValue.toLocaleString()}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
          changePercent >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>

      {/* Allocation Chart (simplified bar) */}
      <div className="mb-6">
        <div className="flex rounded-xl overflow-hidden h-4">
          {mockAssets.map((asset, index) => (
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
        {mockAssets.map((asset, index) => (
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
              <div className="font-mono">${asset.value.toLocaleString()}</div>
              <div className={`text-xs ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
              </div>
            </div>

            <div className="text-right w-16">
              <div className="text-sm text-muted-foreground">{asset.allocation}%</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
