'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Repeat } from 'lucide-react'

interface Transaction {
  id: string
  type: 'send' | 'receive' | 'swap'
  amount: number
  token: string
  to?: string
  from?: string
  status: 'confirmed' | 'pending'
  timestamp: string
  txHash: string
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'send',
    amount: 50,
    token: 'USDC',
    to: '0xabcd...1234',
    status: 'confirmed',
    timestamp: '5 min ago',
    txHash: '0x123...',
  },
  {
    id: '2',
    type: 'swap',
    amount: 100,
    token: 'ETH → USDC',
    status: 'confirmed',
    timestamp: '1 hour ago',
    txHash: '0x456...',
  },
  {
    id: '3',
    type: 'receive',
    amount: 250,
    token: 'USDC',
    from: '0xefgh...5678',
    status: 'confirmed',
    timestamp: '3 hours ago',
    txHash: '0x789...',
  },
  {
    id: '4',
    type: 'send',
    amount: 15,
    token: 'USDC',
    to: '0xijkl...9012',
    status: 'pending',
    timestamp: '1 min ago',
    txHash: '0xabc...',
  },
]

export function RecentTransactions() {
  return (
    <div className="card-quantum p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Transactions</h3>
        <button className="text-xs text-accent hover:underline">View All</button>
      </div>

      <div className="space-y-3">
        {mockTransactions.map((tx, index) => (
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
                </div>
                <div className="text-xs text-muted-foreground">
                  {tx.to ? `To: ${tx.to}` : tx.from ? `From: ${tx.from}` : tx.token}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`font-mono ${
                tx.type === 'receive' ? 'text-green-400' : ''
              }`}>
                {tx.type === 'receive' ? '+' : '-'}${tx.amount}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{tx.timestamp}</span>
                <a 
                  href={`https://testnet.arcscan.io/tx/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-3 h-3 text-accent" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
