'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CaptainWhiskersMascot } from '@/components/mascot/CaptainWhiskersMascot'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { PortfolioCard } from '@/components/dashboard/PortfolioCard'
import { VerificationStatus } from '@/components/dashboard/VerificationStatus'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { AgentChat } from '@/components/dashboard/AgentChat'
import { QuantumInsights } from '@/components/dashboard/QuantumInsights'

export default function DashboardPage() {
  const [agentMood, setAgentMood] = useState<'happy' | 'thinking' | 'alert'>('happy')
  const [isSpeaking, setIsSpeaking] = useState(false)

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-display font-bold">
              Welcome back, <span className="gradient-text">Captain</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Your AI treasury is monitoring 24/7
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Network Status */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm">Arc Testnet</span>
            </div>
            
            {/* Balance */}
            <div className="px-4 py-2 rounded-xl glass">
              <span className="text-sm text-muted-foreground">Balance</span>
              <div className="text-lg font-mono font-bold text-accent">$12,450.00 USDC</div>
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Portfolio Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PortfolioCard />
            </motion.div>

            {/* Quantum Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <QuantumInsights />
            </motion.div>

            {/* Verification Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <VerificationStatus />
            </motion.div>
          </div>

          {/* Right Column - Agent & Transactions */}
          <div className="col-span-4 space-y-6">
            {/* Captain Whiskers Agent */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card-quantum p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">AI Agent</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                  Active
                </span>
              </div>
              
              <div className="flex justify-center mb-4">
                <CaptainWhiskersMascot 
                  size={180} 
                  mood={agentMood}
                  speaking={isSpeaking}
                />
              </div>

              <AgentChat 
                onMoodChange={setAgentMood}
                onSpeakingChange={setIsSpeaking}
              />
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RecentTransactions />
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
