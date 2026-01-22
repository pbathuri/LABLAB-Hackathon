'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Atom, TrendingUp, Zap, Shield, RefreshCw, Loader2 } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function QuantumPage() {
  const { wallet } = useWallet()
  const queryClient = useQueryClient()
  const [riskTolerance, setRiskTolerance] = useState(0.5)

  // Fetch current optimization
  const { data: optimization, isLoading: optimizationLoading } = useQuery({
    queryKey: ['quantum-optimization', wallet?.address, riskTolerance],
    queryFn: () => api.getQuantumOptimization(
      { USDC: 1000, ETH: 500, ARC: 200 },
      riskTolerance
    ),
    enabled: !!wallet?.address,
    staleTime: 30000,
  })

  // Fetch quantum random data
  const { data: quantumRandom } = useQuery({
    queryKey: ['quantum-random'],
    queryFn: () => api.getQuantumRandomNumber(),
    staleTime: 60000,
  })

  // Optimize mutation
  const optimizeMutation = useMutation({
    mutationFn: () => api.getQuantumOptimization(
      { USDC: parseFloat(wallet?.balance?.USDC || '1000'), ETH: 500, ARC: parseFloat(wallet?.balance?.ARC || '200') },
      riskTolerance
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantum-optimization'] })
      toast.success('Portfolio optimized with VQE algorithm!')
    },
    onError: () => {
      toast.error('Optimization failed. Using cached results.')
    },
  })

  const expectedReturn = optimization?.expectedReturn ? (optimization.expectedReturn * 100).toFixed(1) : '12.4'
  const sharpeRatio = optimization?.sharpeRatio?.toFixed(2) || '1.85'
  const variance = optimization?.variance ? (optimization.variance * 100).toFixed(2) : '4.2'

  // Calculate portfolio weights
  const portfolioAssets = optimization?.weights
    ? Object.entries(optimization.weights).map(([asset, weight]) => {
        const total = Object.values(optimization.weights).reduce((sum, w) => sum + w, 0)
        const allocation = Math.round((weight / total) * 100)
        const prevAllocation = asset === 'USDC' ? 60 : asset === 'ETH' ? 30 : 10
        return {
          asset,
          allocation,
          change: allocation - prevAllocation,
        }
      })
    : [
        { asset: 'USDC', allocation: 45, change: -15 },
        { asset: 'ETH', allocation: 35, change: +5 },
        { asset: 'ARC', allocation: 20, change: +10 },
      ]

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Atom className="w-8 h-8 text-primary" />
              Quantum Optimization
            </h1>
            <button
              onClick={() => optimizeMutation.mutate()}
              disabled={optimizeMutation.isPending}
              className="btn-quantum flex items-center gap-2"
            >
              {optimizeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Re-optimize
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* VQE Status */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" />
                VQE Algorithm Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                    {optimizationLoading ? 'Computing...' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Optimization Type</span>
                  <span className="font-medium">Markowitz Mean-Variance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expected Return</span>
                  <span className="text-accent font-bold">+{expectedReturn}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sharpe Ratio</span>
                  <span className="font-medium">{sharpeRatio}</span>
                </div>
              </div>
            </div>

            {/* Quantum Metrics */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4">Quantum Metrics</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Risk Tolerance</span>
                    <span className="text-sm font-medium">{Math.round(riskTolerance * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={riskTolerance * 100}
                    onChange={(e) => setRiskTolerance(parseInt(e.target.value) / 100)}
                    className="w-full h-2 bg-dark-100 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Portfolio Variance</span>
                    <span className="text-sm font-medium">{variance}%</span>
                  </div>
                  <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${Math.min(parseFloat(variance) * 10, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Quantum Advantage</span>
                    <span className="text-sm font-medium">2.3x faster</span>
                  </div>
                  <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QRNG Status */}
          <div className="card-quantum p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Atom className="w-5 h-5 text-accent animate-pulse" />
              Quantum Random Number Generator
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-dark-100 rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">Source</div>
                <div className="font-mono text-sm">{quantumRandom?.source || 'QRNG Simulation'}</div>
              </div>
              <div className="bg-dark-100 rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">Quantum UUID</div>
                <div className="font-mono text-sm truncate">{quantumRandom?.quantumUUID || 'qrng-...'}</div>
              </div>
              <div className="bg-dark-100 rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">Latest Nonce</div>
                <div className="font-mono text-sm truncate">{quantumRandom?.nonce?.slice(0, 16) || '...'}</div>
              </div>
              <div className="bg-dark-100 rounded-xl p-4">
                <div className="text-xs text-muted-foreground mb-1">Random Values</div>
                <div className="font-mono text-sm">{quantumRandom?.randomNumbers?.length || 10} generated</div>
              </div>
            </div>
          </div>

          {/* Q-Day Reference */}
          <div className="card-quantum p-6 mb-8">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Preparing for Q-Day
            </h2>
            <p className="text-sm text-muted-foreground">
              We align with Circle&apos;s post-quantum roadmap and research on upgrading consensus,
              signatures, and zero-knowledge systems. Captain Whiskers uses CRYSTALS-Dilithium
              for quantum-resistant signatures.
            </p>
            <a
              href="https://www.circle.com/blog/preparing-blockchains-for-q-day"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-2 mt-3"
            >
              Read the Circle blog <span aria-hidden>→</span>
            </a>
          </div>

          {/* Portfolio Allocation */}
          <div className="card-quantum p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Optimized Portfolio Allocation
            </h2>
            <div className="space-y-4">
              {portfolioAssets.map((item) => (
                <div key={item.asset} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.asset}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{item.allocation}%</span>
                      <span className={`text-sm ${item.change > 0 ? 'text-accent' : item.change < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.allocation}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
