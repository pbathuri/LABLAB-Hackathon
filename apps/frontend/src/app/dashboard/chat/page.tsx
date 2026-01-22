'use client'

import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AgentChat, PromptInsights } from '@/components/dashboard/AgentChat'
import { CaptainWhiskersMascot } from '@/components/mascot/CaptainWhiskersMascot'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, AgentDecision } from '@/lib/api'
import {
  MessageSquare,
  TrendingUp,
  Shield,
  Droplets,
  Timer,
  Sparkles,
  Activity,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  CircleDollarSign,
  Blocks,
  BadgeDollarSign,
  ShieldCheck,
} from 'lucide-react'

export default function ChatPage() {
  const [agentMood, setAgentMood] = useState<'happy' | 'thinking' | 'alert'>('happy')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [insights, setInsights] = useState<PromptInsights | null>(null)
  const [mode, setMode] = useState<'manual' | 'autonomous'>('manual')
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    setHasToken(Boolean(api.getStoredAuthToken()))
  }, [])

  const {
    data: agentHistory = [],
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['agent-history'],
    queryFn: () => api.getAgentHistory(20),
    enabled: hasToken,
  })

  const { data: circleConfig } = useQuery({
    queryKey: ['circle-config'],
    queryFn: () => api.getCircleConfig(),
  })

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

  const totalDecisions = agentHistory.length
  const verifiedCount = agentHistory.filter((decision) =>
    ['verified', 'executed'].includes(decision.status),
  ).length
  const executedCount = agentHistory.filter((decision) => decision.status === 'executed').length

  const statusBadge = (status: AgentDecision['status']) => {
    if (status === 'verified' || status === 'executed') {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          {status}
        </span>
      )
    }
    if (status === 'rejected' || status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
          <XCircle className="w-3 h-3" />
          {status}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
        <Activity className="w-3 h-3" />
        {status}
      </span>
    )
  }

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

          <div className="card-quantum p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  I’m here to make every commerce decision feel calm, confident, and clear.
                </p>
              </div>
              <Link href="/dashboard/circle" className="btn-quantum inline-flex items-center gap-2">
                Open Circle Console <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 card-quantum p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Agentic Commerce Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Toggle autonomy and track your agent’s decisions in real time.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMode('manual')}
                    className={`px-4 py-2 rounded-full text-sm border ${
                      mode === 'manual'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-white/10 text-muted-foreground'
                    }`}
                  >
                    Manual Mode
                  </button>
                  <button
                    onClick={() => setMode('autonomous')}
                    className={`px-4 py-2 rounded-full text-sm border ${
                      mode === 'autonomous'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-white/10 text-muted-foreground'
                    }`}
                  >
                    Autonomous Mode (Demo)
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/10 bg-dark-100 p-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Total decisions
                  </div>
                  <div className="text-2xl font-semibold mt-2">{totalDecisions}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-dark-100 p-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                    Verified decisions
                  </div>
                  <div className="text-2xl font-semibold mt-2">{verifiedCount}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-dark-100 p-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    Executed actions
                  </div>
                  <div className="text-2xl font-semibold mt-2">{executedCount}</div>
                </div>
              </div>
            </div>

            <div className="card-quantum p-6">
              <h3 className="font-semibold text-lg mb-4">Hackathon Stack</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Blocks className="w-4 h-4 text-primary" />
                    Arc L1
                  </span>
                  <span className="text-green-400">ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BadgeDollarSign className="w-4 h-4 text-accent" />
                    USDC
                  </span>
                  <span className="text-green-400">ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4 text-primary" />
                    Circle Wallets
                  </span>
                  <span className={circleConfig?.wallets.enabled ? 'text-green-400' : 'text-yellow-400'}>
                    {circleConfig?.wallets.enabled ? 'configured' : 'demo'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Gemini AI
                  </span>
                  <span className="text-yellow-400">demo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Circle Gateway
                  </span>
                  <span className={circleConfig?.gateway.enabled ? 'text-green-400' : 'text-yellow-400'}>
                    {circleConfig?.gateway.enabled ? 'available' : 'demo'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-accent" />
                    x402
                  </span>
                  <span className={circleConfig?.x402.enabled ? 'text-green-400' : 'text-yellow-400'}>
                    {circleConfig?.x402.enabled ? 'available' : 'demo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

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

              <div className="card-quantum p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">AI Agent Decision Log</h3>
                  <button onClick={() => refetchHistory()} className="text-sm text-primary hover:underline">
                    Refresh
                  </button>
                </div>

                {!hasToken && (
                  <p className="text-sm text-muted-foreground">
                    Add a JWT token in the Circle page to view secure agent logs.
                  </p>
                )}

                {hasToken && historyLoading && (
                  <p className="text-sm text-muted-foreground">Loading decisions...</p>
                )}

                {hasToken && !historyLoading && agentHistory.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No agent decisions yet. Send a prompt to create your first decision.
                  </p>
                )}

                {agentHistory.length > 0 && (
                  <div className="space-y-3">
                    {agentHistory.map((decision) => (
                      <div key={decision.id} className="rounded-xl border border-white/10 bg-dark-100 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold capitalize">
                              {decision.type} {decision.parameters?.asset || 'USDC'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Quantity: {decision.parameters?.quantity ?? decision.parameters?.amount ?? '—'}
                            </div>
                          </div>
                          {statusBadge(decision.status)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {decision.verificationResult?.totalSignatures || 0}/
                          {decision.verificationResult?.requiredSignatures || 7} signatures ·{' '}
                          {decision.verificationResult?.consensusReached ? 'BFT approved' : 'Pending'}
                        </div>
                        {decision.transactionHash && (
                          <a
                            href={`https://testnet.arcscan.io/tx/${decision.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-2 inline-block"
                          >
                            View on ArcScan
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
