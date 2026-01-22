'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { Wallet, Copy, ExternalLink, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default function WalletPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-8">Wallet</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Address Card */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallet Address
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <code className="text-sm font-mono bg-dark-100 px-4 py-2 rounded-lg">
                  0xa395DE9aFC8864ecbA1E03C5519De053EBe4573F
                </code>
                <button className="p-2 rounded-lg hover:bg-dark-100 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <a
                href="https://testnet.arcscan.io/address/0xa395DE9aFC8864ecbA1E03C5519De053EBe4573F"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View on ArcScan <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Balance Card */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4">Balance</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">USDC</span>
                  <span className="text-2xl font-bold font-mono">12,450.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ARC</span>
                  <span className="text-2xl font-bold font-mono">0.5</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-dark-100 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <ArrowUpRight className="w-5 h-5 text-primary" />
                    <span>Send</span>
                  </div>
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-dark-100 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <ArrowDownLeft className="w-5 h-5 text-accent" />
                    <span>Receive</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Network Info */}
            <div className="card-quantum p-6">
              <h2 className="text-lg font-semibold mb-4">Network</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-medium">Arc Testnet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chain ID</span>
                  <span className="font-mono">5042002</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
