'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AgentChat, PromptInsights } from '@/components/dashboard/AgentChat'
import { CaptainWhiskersMascot } from '@/components/mascot/CaptainWhiskersMascot'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { MessageSquare, TrendingUp, Shield, Droplets, Timer } from 'lucide-react'

export default function ChatPage() {
  const [agentMood, setAgentMood] = useState<'happy' | 'thinking' | 'alert'>('happy')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [insights, setInsights] = useState<PromptInsights | null>(null)

  const decisionSnapshot = useMemo(() => {
    if (!insights) return null
    const expectedReturn = Math.max(
      1,
      Math.round((insights.confidence * 12 - insights.risk * 6) * 10) / 10,
    )
    const liquidityScore = Math.max(10, Math.round((1 - insights.risk) * 100))
    const settlementScore = Math.max(10, Math.round((1 - insights.latency / 6) * 100))

    return {
      expectedReturn: `${expectedReturn}%`,
      liquidityScore,
      settlementScore,
    }
  }, [insights])

  const progressBar = (value: number, color: string) => (
    <div className="h-2 bg-dark-200 rounded-full mt-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  )

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            AI Assistant
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mascot */}
            <div className="lg:col-span-1">
              <div className="card-quantum p-6 flex flex-col items-center">
                <div className="mb-4">
                  <CaptainWhiskersMascot
                    size={200}
                    mood={agentMood}
                    speaking={isSpeaking}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Captain Whiskers</h3>
                  <p className="text-sm text-muted-foreground">
                    Your quantum-powered treasury assistant
                  </p>
                </div>
              </div>

              <div className="card-quantum p-6 mt-6">
                <h3 className="font-semibold mb-3">Decision Snapshot</h3>
                {insights ? (
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          Expected return
                        </span>
                        <span className="text-white font-semibold">
                          {decisionSnapshot?.expectedReturn}
                        </span>
                      </div>
                      {progressBar(Math.min(100, parseFloat(decisionSnapshot?.expectedReturn || '0') * 8), 'bg-green-400')}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          Risk posture
                        </span>
                        <span className="text-white font-semibold">
                          {Math.round(insights.risk * 100)}%
                        </span>
                      </div>
                      {progressBar(Math.round(insights.risk * 100), 'bg-primary')}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-accent" />
                          Liquidity
                        </span>
                        <span className="text-white font-semibold">{decisionSnapshot?.liquidityScore}%</span>
                      </div>
                      {progressBar(decisionSnapshot?.liquidityScore || 0, 'bg-accent')}
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-yellow-400" />
                          Settlement confidence
                        </span>
                        <span className="text-white font-semibold">{decisionSnapshot?.settlementScore}%</span>
                      </div>
                      {progressBar(decisionSnapshot?.settlementScore || 0, 'bg-yellow-400')}
                    </div>

                    <div className="pt-2 text-xs text-muted-foreground">
                      Path: {insights.path} · ETA ~{insights.latency.toFixed(1)}s
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Start typing a prompt to preview live commerce stats.
                  </p>
                )}
              </div>
            </div>

            {/* Chat */}
            <div className="lg:col-span-2">
              <div className="card-quantum p-6">
                <AgentChat
                  onMoodChange={setAgentMood}
                  onSpeakingChange={setIsSpeaking}
                  onInsightsChange={setInsights}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
