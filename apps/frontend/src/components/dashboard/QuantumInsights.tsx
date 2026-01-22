'use client'

import { motion } from 'framer-motion'
import { Cpu, Zap, Activity, TrendingUp } from 'lucide-react'

interface QuantumMetric {
  label: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

const mockMetrics: QuantumMetric[] = [
  {
    label: 'VQE Iterations',
    value: '247',
    change: 'Converged',
    trend: 'up',
    icon: <Cpu className="w-5 h-5" />,
  },
  {
    label: 'Circuit Depth',
    value: '12',
    change: 'Optimal',
    trend: 'neutral',
    icon: <Activity className="w-5 h-5" />,
  },
  {
    label: 'Sharpe Ratio',
    value: '1.42',
    change: '+0.12',
    trend: 'up',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    label: 'Risk Score',
    value: '0.34',
    change: 'Low',
    trend: 'neutral',
    icon: <Zap className="w-5 h-5" />,
  },
]

export function QuantumInsights() {
  return (
    <div className="card-quantum p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <Cpu className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quantum Insights</h3>
            <p className="text-sm text-muted-foreground">VQE Portfolio Optimization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-muted-foreground">Simulator Active</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {mockMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-dark-100/50 hover:bg-dark-100 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-primary">{metric.icon}</span>
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <div className="text-2xl font-mono font-bold mb-1">{metric.value}</div>
            <div className={`text-xs ${
              metric.trend === 'up' ? 'text-green-400' :
              metric.trend === 'down' ? 'text-red-400' :
              'text-accent'
            }`}>
              {metric.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quantum Circuit Visualization */}
      <div className="p-4 rounded-xl bg-dark-100/50">
        <div className="text-sm text-muted-foreground mb-3">Last Optimization Circuit</div>
        <div className="font-mono text-xs overflow-x-auto">
          <pre className="text-primary/80">
{`q[0]: ─H──●──────Rz(θ₁)──●────────M─
         │               │          
q[1]: ─H──X──Ry(θ₂)──────X──Rz(θ₃)──M─
                                     
q[2]: ─H──Ry(θ₄)──●──────────────────M─
                  │                   
q[3]: ─H──────────X──Rz(θ₅)──────────M─`}
          </pre>
        </div>
        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-muted-foreground">4 qubits • RealAmplitudes ansatz</span>
          <span className="text-accent">Energy: -2.847 ± 0.012</span>
        </div>
      </div>

      {/* Optimization History Chart (simplified) */}
      <div className="mt-6">
        <div className="text-sm text-muted-foreground mb-3">Convergence History</div>
        <div className="h-20 flex items-end gap-1">
          {Array.from({ length: 30 }).map((_, i) => {
            const height = Math.max(20, 100 - (i * 2.5) + Math.random() * 10)
            return (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.02 }}
                className="flex-1 bg-gradient-to-t from-primary/50 to-accent/50 rounded-t"
              />
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Iteration 0</span>
          <span>Cost Function ↓</span>
          <span>Iteration 247</span>
        </div>
      </div>
    </div>
  )
}
