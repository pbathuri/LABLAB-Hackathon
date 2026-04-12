'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function LeaderboardPage() {
  const [perf, setPerf] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetch(`${api}/api/agent/performance`)
      .then((r) => r.json())
      .then(setPerf)
  }, [])

  const chartData = [
    { t: 'PnL%', v: Number(perf?.pnlPercent ?? 0) },
    { t: 'Sharpe', v: Number(perf?.sharpeRatio ?? 0) * 10 },
    { t: 'DD bps', v: Number(perf?.maxDrawdownBps ?? 0) / 100 },
  ]

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold gradient-text">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">Risk-adjusted performance (sandbox)</p>
        </motion.div>

        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
          {['pnlPercent', 'sharpeRatio', 'maxDrawdownBps', 'winRate', 'totalTrades'].map((k) => (
            <div key={k} className="card-quantum p-4 rounded-xl">
              <div className="text-xs text-muted-foreground uppercase">{k}</div>
              <div className="text-2xl font-mono mt-1">
                {perf?.[k] != null ? String(perf[k]) : '—'}
              </div>
            </div>
          ))}
        </div>

        <div className="card-quantum p-6 rounded-2xl h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="t" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Line type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  )
}
