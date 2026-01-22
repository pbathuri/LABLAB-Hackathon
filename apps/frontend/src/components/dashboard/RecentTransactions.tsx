'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Repeat } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { useQuery } from '@tanstack/react-query'
import { api, Transaction } from '@/lib/api'

export function RecentTransactions() {
  const { wallet } = useWallet()
  
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', wallet?.address],
    queryFn: () => wallet?.address ? api.getTransactions(wallet.address, 5) : Promise.resolve([]),
    enabled: !!wallet?.address,
  })
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount)
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="card-quantum p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Transactions</h3>
        <a href="/dashboard/history" className="text-xs text-accent hover:underline">View All</a>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No transactions yet</div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, index) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-dark-100/50 hover:bg-dark-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tx.type === 'send' ? 'bg-red-500/20 text-red-400' :
                tx.type === 'receive' ? 'bg-green-500/20 text-green-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {tx.type === 'send' ? <ArrowUpRight className="w-5 h-5" /> :
                 tx.type === 'receive' ? <ArrowDownLeft className="w-5 h-5" /> :
                 <Repeat className="w-5 h-5" />}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{tx.type}</span>
                  {tx.status === 'pending' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                      Pending
                    </span>
                  )}
                  {tx.status === 'failed' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                      Failed
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : tx.from ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : tx.token}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-mono ${
                tx.type === 'receive' ? 'text-green-400' : ''
              }`}>
                {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                {formatAmount(tx.amount)} {tx.token}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{formatTimestamp(tx.timestamp)}</span>
                {tx.hash && (
                  <a 
                    href={`https://testnet.arcscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3 text-accent" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
