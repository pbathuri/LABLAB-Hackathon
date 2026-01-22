'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Atom, TrendingUp, Zap, Shield } from 'lucide-react'

export default function QuantumPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <Atom className="w-8 h-8 text-primary" />
            Quantum Optimization
          </h1>

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
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Optimization Type</span>
                  <span className="font-medium">Markowitz Portfolio</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expected Return</span>
                  <span className="text-accent font-bold">+12.4%</span>
                </div>
              </div>
            </div>

            {/* Quantum Metrics */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4">Quantum Metrics</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Risk Level</span>
                    <span className="text-sm font-medium">Moderate</span>
                  </div>
                  <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent w-3/4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Quantum Advantage</span>
                    <span className="text-sm font-medium">2.3x</span>
                  </div>
                  <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-full" />
                  </div>
                </div>
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
              We align with Circle’s post-quantum roadmap and research on upgrading consensus,
              signatures, and zero-knowledge systems.
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
              {[
                { asset: 'USDC', allocation: 45, change: -15 },
                { asset: 'WETH', allocation: 35, change: +10 },
                { asset: 'WBTC', allocation: 20, change: +5 },
              ].map((item) => (
                <div key={item.asset} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.asset}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{item.allocation}%</span>
                      <span className={`text-sm ${item.change > 0 ? 'text-accent' : 'text-red-400'}`}>
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                      style={{ width: `${item.allocation}%` }}
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
