'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { History, ArrowUpRight, ArrowDownLeft, RefreshCw, Shield } from 'lucide-react'

export default function HistoryPage() {
  const transactions = [
    {
      id: '1',
      type: 'optimize',
      amount: '1,250.00',
      token: 'USDC',
      timestamp: '2 hours ago',
      status: 'completed',
      hash: '0x7232...ec22',
    },
    {
      id: '2',
      type: 'send',
      amount: '500.00',
      token: 'USDC',
      timestamp: '5 hours ago',
      status: 'completed',
      hash: '0x4a1b...9f3c',
    },
    {
      id: '3',
      type: 'verify',
      amount: '0',
      token: 'N/A',
      timestamp: '1 day ago',
      status: 'completed',
      hash: '0x8c2d...7a1e',
    },
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-red-400" />
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-accent" />
      case 'optimize':
        return <RefreshCw className="w-4 h-4 text-primary" />
      case 'verify':
        return <Shield className="w-4 h-4 text-primary" />
      default:
        return <History className="w-4 h-4" />
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Transaction History
          </h1>

          <div className="card-quantum p-6">
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-dark-100 hover:bg-dark-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/20">
                      {getTypeIcon(tx.type)}
                    </div>
                    <div>
                      <div className="font-medium capitalize">{tx.type}</div>
                      <div className="text-sm text-muted-foreground">{tx.timestamp}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono font-semibold">
                        {tx.amount} {tx.token}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">{tx.hash}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                      {tx.status}
                    </span>
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
