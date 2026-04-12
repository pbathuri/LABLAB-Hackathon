'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { History, ArrowUpRight, ArrowDownLeft, RefreshCw, Shield, ExternalLink } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { useQuery } from '@tanstack/react-query'
import { api, Transaction } from '@/lib/api'

export default function HistoryPage() {
  const { wallet } = useWallet()
  
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', wallet?.address, 'all'],
    queryFn: () => wallet?.address ? api.getTransactions(wallet.address, 50) : Promise.resolve([]),
    enabled: !!wallet?.address,
  })

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading transaction history...</div>
          ) : !wallet ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No wallet connected</p>
              <p className="text-sm text-muted-foreground">Connect your wallet to view transaction history.</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No transactions found</div>
          ) : (
            <div className="card-quantum p-6">
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-dark-100 hover:bg-dark-200 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/20">
                        {getTypeIcon(tx.type)}
                      </div>
                      <div>
                        <div className="font-medium capitalize">{tx.type}</div>
                        <div className="text-sm text-muted-foreground">{formatTimestamp(tx.timestamp)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-semibold">
                          {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                          {tx.amount} {tx.token}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</span>
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
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
