'use client'

import { useCallback, useMemo, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Volume2,
  Sparkles,
  Gauge,
  AlertTriangle,
  Activity,
  BadgeDollarSign,
  Clock,
} from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { useWallet } from '@/contexts/WalletContext'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
}

type DemoStepStatus = 'pending' | 'running' | 'done' | 'simulated' | 'error'

interface DemoStep {
  key: string
  label: string
  status: DemoStepStatus
  detail?: string
  startedAt?: string
  endedAt?: string
}

export interface PromptInsights {
  intent: string
  confidence: number
  risk: number
  estimatedFee: number | null
  impactPct: number | null
  path: string
  latency: number
  token: string | null
  amount: number
}

interface AgentChatProps {
  onMoodChange?: (mood: 'happy' | 'thinking' | 'alert') => void
  onSpeakingChange?: (speaking: boolean) => void
  onInsightsChange?: (insights: PromptInsights | null) => void
}

export function AgentChat({ onMoodChange, onSpeakingChange, onInsightsChange }: AgentChatProps) {
  const { wallet } = useWallet()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content:
        "Hi! I'm Captain Whiskers — your friendly, quantum-powered treasury copilot. Tell me what you'd like to do, and I’ll surface clear, confident next steps.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isDemoRunning, setIsDemoRunning] = useState(false)
  const [runSeed, setRunSeed] = useState(0)
  const [demoTimeline, setDemoTimeline] = useState<DemoStep[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const onInsightsChangeRef = useRef(onInsightsChange)

  useEffect(() => {
    onInsightsChangeRef.current = onInsightsChange
  }, [onInsightsChange])

  const suggestedPrompts = [
    'Optimize portfolio for low risk with 60% USDC',
    'Send 10 USDC to 0x... and log on ArcScan',
    'Run x402 pay-per-call for market data',
    'Verify last settlement with BFT quorum',
    'Run full demo',
  ]

  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

  const getPromptInsights = useCallback((text: string): PromptInsights => {
    const normalized = text.toLowerCase()
    const words = normalized.trim().split(/\s+/).filter(Boolean)
    const complexity = clamp(words.length / 18, 0, 1)

    const includesAny = (items: string[]) => items.some((item) => normalized.includes(item))
    const isMicropayment = includesAny(['x402', 'micropayment', 'pay per call', 'pay-on-success'])
    const isTransfer = includesAny(['send', 'transfer', 'pay'])
    const isOptimize = includesAny(['optimize', 'rebalance', 'allocation'])
    const isVerify = includesAny(['verify', 'consensus', 'bft', 'audit'])
    const isPolicy = includesAny(['policy', 'limit', 'cap', 'allowlist'])

    let intent = 'Insights'
    if (isMicropayment) intent = 'x402 Micropayment'
    else if (isTransfer) intent = 'Transfer'
    else if (isOptimize) intent = 'Optimization'
    else if (isVerify) intent = 'Verification'
    else if (isPolicy) intent = 'Policy Update'

    const keywordHits = [isMicropayment, isTransfer, isOptimize, isVerify, isPolicy].filter(Boolean).length
    const confidence = clamp(0.45 + keywordHits * 0.1 - complexity * 0.08, 0.2, 0.95)

    const amountMatch = normalized.match(/(\d+(\.\d+)?)/)
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0
    const token = normalized.includes('usdc') ? 'USDC' : normalized.includes('arc') ? 'ARC' : null

    const balance =
      token === 'USDC'
        ? parseFloat(wallet?.balance?.USDC || '0')
        : token === 'ARC'
          ? parseFloat(wallet?.balance?.ARC || '0')
          : 0

    const impactPct = balance > 0 && amount > 0 ? clamp((amount / balance) * 100, 0, 100) : null

    const riskBase = 0.2 + (isTransfer ? 0.2 : 0) + (isOptimize ? 0.1 : 0) + (isVerify ? 0.05 : 0)
    const amountRisk = balance > 0 && amount > 0 ? clamp(amount / balance, 0, 0.5) : 0
    const risk = clamp(riskBase + amountRisk + complexity * 0.15, 0.05, 0.95)

    const estimatedFee =
      amount > 0 && token === 'USDC' ? Math.max(0.002, amount * 0.005) : null

    const latency = 1.5 + complexity * 2.5 + (isVerify ? 1 : 0)
    const path = isMicropayment ? 'x402 → Gateway → Arc' : 'BFT → Arc settlement'

    return {
      intent,
      confidence,
      risk,
      estimatedFee,
      impactPct,
      path,
      latency,
      token,
      amount,
    }
  }, [wallet?.balance])

  const insights = useMemo(() => getPromptInsights(input), [input, getPromptInsights])
  useEffect(() => {
    if (input.trim()) {
      onInsightsChangeRef.current?.(insights)
    } else {
      onInsightsChangeRef.current?.(null)
    }
  }, [input, insights])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addAgentMessage = useCallback((content: string) => {
    const agentMessage: Message = {
      id: (Date.now() + Math.random()).toString(),
      role: 'agent',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, agentMessage])
  }, [])

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const createMockHash = () =>
    `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

  const shortenHash = (hash?: string | null) => {
    if (!hash) return 'N/A'
    return `${hash.slice(0, 10)}...${hash.slice(-6)}`
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const setStepStatus = useCallback(
    (key: string, status: DemoStepStatus, detail?: string) => {
      const now = new Date().toISOString()
      setDemoTimeline((prev) =>
        prev.map((step) =>
          step.key === key
            ? {
                ...step,
                status,
                detail: detail ?? step.detail,
                startedAt: status === 'running' ? now : step.startedAt,
                endedAt: ['done', 'simulated', 'error'].includes(status) ? now : step.endedAt,
              }
            : step,
        ),
      )
    },
    [],
  )

  const extractPaymentId = (payload: any) =>
    payload?.id || payload?.requestId || payload?.data?.id || payload?.paymentId || null

  const runFullDemo = useCallback(async () => {
    if (isDemoRunning) return

    const authToken = api.getStoredAuthToken()
    const isSimulation = !authToken

    const initialTimeline: DemoStep[] = [
      { key: 'wallet', label: 'Circle wallet', status: 'pending' },
      { key: 'gateway', label: 'Gateway settlement', status: 'pending' },
      { key: 'x402-create', label: 'x402 create', status: 'pending' },
      { key: 'x402-authorize', label: 'x402 authorize', status: 'pending' },
      { key: 'x402-complete', label: 'x402 complete', status: 'pending' },
      { key: 'agent', label: 'Agent decision + BFT', status: 'pending' },
    ]

    setDemoTimeline(initialTimeline)
    setIsDemoRunning(true)
    setIsTyping(true)
    onMoodChange?.('thinking')
    addAgentMessage(
      isSimulation
        ? 'Starting full demo in simulation mode (no JWT). I’ll still chain the steps so you can see the flow.'
        : 'Starting full demo. I’ll chain Circle Wallets → Gateway settlement → x402 → Agent decision.',
    )

    let activeStep = 'wallet'

    try {
      setStepStatus('wallet', 'running')
      let circleWallet = {
        walletId: 'demo-wallet',
        address: wallet?.address || `0x${Math.random().toString(16).slice(2, 42)}`,
      }

      if (!isSimulation) {
        circleWallet = await api.createCircleWallet({
          type: 'dev_controlled',
          label: 'Demo Treasury Wallet',
        })
      }

      await delay(400)
      setStepStatus(
        'wallet',
        isSimulation ? 'simulated' : 'done',
        `Wallet ${circleWallet.address.slice(0, 6)}...${circleWallet.address.slice(-4)}`,
      )
      addAgentMessage(
        `1) Circle wallet created: ${circleWallet.address.slice(0, 6)}...${circleWallet.address.slice(-4)}.`,
      )

      activeStep = 'gateway'
      setStepStatus('gateway', 'running')
      let gatewayTransfer: { amount: string; txHash?: string } = {
        amount: '25',
        txHash: createMockHash(),
      }

      if (!isSimulation) {
        gatewayTransfer = await api.createGatewaySettlement({
          amount: '25',
          sourceChain: 'Arc Testnet',
          destinationChain: 'Arc Testnet',
          fromWalletId: circleWallet.walletId,
          toAddress: circleWallet.address,
          notes: 'Full demo settlement',
        })
      }

      await delay(400)
      setStepStatus(
        'gateway',
        isSimulation ? 'simulated' : 'done',
        `Tx ${shortenHash(gatewayTransfer.txHash)}`,
      )
      addAgentMessage(
        `2) Gateway settlement completed: ${gatewayTransfer.amount} USDC · Tx ${shortenHash(
          gatewayTransfer.txHash,
        )}.`,
      )

      activeStep = 'x402-create'
      setStepStatus('x402-create', 'running')
      let paymentId = `pay_${Date.now()}`
      if (!isSimulation) {
        const payment = await api.createMicropayment({
          payee: circleWallet.address,
          amount: '0.01',
          apiEndpoint: '/api/agent/decide',
          providerId: 'gemini-flash',
          model: 'pay_per_call',
          description: 'Full demo x402 payment',
        })
        paymentId = extractPaymentId(payment) || paymentId
      }

      await delay(400)
      setStepStatus(
        'x402-create',
        isSimulation ? 'simulated' : 'done',
        `Payment ${paymentId}`,
      )
      addAgentMessage(`3) x402 payment created: ${paymentId}.`)

      if (!isSimulation) {
        activeStep = 'x402-authorize'
        setStepStatus('x402-authorize', 'running')
        await api.authorizeMicropayment(paymentId)
        setStepStatus('x402-authorize', 'done')
        addAgentMessage('4) x402 authorized successfully.')
        activeStep = 'x402-complete'
        setStepStatus('x402-complete', 'running')
        await api.completeMicropayment(paymentId, { ok: true, demo: true })
        setStepStatus('x402-complete', 'done')
        addAgentMessage('5) x402 completed with atomic settlement recorded.')
      } else {
        await delay(300)
        setStepStatus('x402-authorize', 'simulated')
        addAgentMessage('4) x402 authorized successfully. (simulated)')
        await delay(300)
        setStepStatus('x402-complete', 'simulated')
        addAgentMessage('5) x402 completed with atomic settlement recorded. (simulated)')
      }

      const decisionPrompt =
        'Optimize portfolio with low risk, keep 60% USDC, 30% ETH, 10% ARC, and verify via BFT.'
      const decisionStats = getPromptInsights(decisionPrompt)
      activeStep = 'agent'
      setStepStatus('agent', 'running')
      const decisionId = isSimulation
        ? `demo-decision-${Date.now()}`
        : (await api.makeAgentDecision({
            instruction: decisionPrompt,
            portfolioState: wallet?.balance || { USDC: 1000 },
            marketData: {},
            riskTolerance: 0.4,
          })).decisionId

      setStepStatus(
        'agent',
        isSimulation ? 'simulated' : 'done',
        `Decision ${decisionId}`,
      )

      addAgentMessage(
        `6) Agent decision queued: ${decisionId}. Confidence ${Math.round(
          decisionStats.confidence * 100,
        )}% · Risk ${Math.round(decisionStats.risk * 100)}% · ETA ${decisionStats.latency.toFixed(
          1,
        )}s.`,
      )
      addAgentMessage(
        isSimulation
          ? "Full demo complete (simulated). Add a JWT in Circle → Backend Authentication to run it live."
          : 'Full demo complete. Open the AI Decision Log to review BFT status and ArcScan links.',
      )
      onMoodChange?.('happy')
      onSpeakingChange?.(true)
      setTimeout(() => onSpeakingChange?.(false), 2000)
    } catch (error: any) {
      setStepStatus(activeStep, 'error', error?.message || 'Failed')
      addAgentMessage(
        `Full demo paused: ${error?.message || 'Something went wrong.'} You can retry anytime.`,
      )
      onMoodChange?.('alert')
    } finally {
      setIsTyping(false)
      setIsDemoRunning(false)
    }
  }, [
    addAgentMessage,
    getPromptInsights,
    isDemoRunning,
    onMoodChange,
    onSpeakingChange,
    wallet?.address,
    wallet?.balance,
    setStepStatus,
  ])

  useEffect(() => {
    if (runSeed === 0) return
    const start = async () => {
      await runFullDemo()
    }
    start()
  }, [runSeed, runFullDemo])

  const handleSend = async () => {
    if (!input.trim() || isDemoRunning) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsTyping(true)
    onMoodChange?.('thinking')

    if (userInput.trim().toLowerCase().includes('run full demo')) {
      await runFullDemo()
      setIsTyping(false)
      return
    }

    const preview = getPromptInsights(userInput)

    if (!api.getStoredAuthToken()) {
      addAgentMessage(
        `I can run a data-driven dry run now, or execute live once you add a JWT in Circle → Backend Authentication.`,
      )
      addAgentMessage(
        `Preview: Intent ${preview.intent} · Confidence ${Math.round(
          preview.confidence * 100,
        )}% · Risk ${Math.round(preview.risk * 100)}% · ETA ${preview.latency.toFixed(1)}s.`,
      )
      setIsTyping(false)
      onMoodChange?.('happy')
      return
    }

    try {
      addAgentMessage(
        `Quick preview ready: ${preview.intent} · Confidence ${Math.round(
          preview.confidence * 100,
        )}% · Risk ${Math.round(preview.risk * 100)}%. Executing live now...`,
      )

      // Call backend agent API
      const result = await api.makeAgentDecision({
        instruction: userInput,
        portfolioState: wallet?.balance || {},
        marketData: {},
        riskTolerance: 0.5,
      })

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content:
          result.explanation ||
          "Great request. I've queued it for BFT verification, and I’ll keep you posted as soon as it’s confirmed.",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, agentMessage])
      
      // If a decision was made, show success
      if (result.decisionId) {
        toast.success('Awesome — your request is in motion. BFT verification is underway.')
      }
    } catch (error: any) {
      console.error('Agent request failed:', error)
      const preview = getPromptInsights(userInput)
      addAgentMessage(
        `I hit a snag on the live request, so I ran a data-driven preview instead.`,
      )
      addAgentMessage(
        `Preview: Intent ${preview.intent} · Confidence ${Math.round(
          preview.confidence * 100,
        )}% · Risk ${Math.round(preview.risk * 100)}% · ETA ${preview.latency.toFixed(1)}s.`,
      )
      toast.error(error.message || 'Failed to process request')
    } finally {
      setIsTyping(false)
      onMoodChange?.('happy')
      onSpeakingChange?.(true)
      
      // Stop speaking animation after a bit
      setTimeout(() => onSpeakingChange?.(false), 2000)
    }
  }

  const timelinePill = (status: DemoStepStatus) => {
    const styles: Record<DemoStepStatus, string> = {
      pending: 'bg-white/5 text-muted-foreground',
      running: 'bg-primary/20 text-primary animate-pulse',
      done: 'bg-green-500/20 text-green-400',
      simulated: 'bg-yellow-500/20 text-yellow-400',
      error: 'bg-red-500/20 text-red-400',
    }
    const labelMap: Record<DemoStepStatus, string> = {
      pending: 'Pending',
      running: 'Running',
      done: 'Done',
      simulated: 'Simulated',
      error: 'Error',
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${styles[status]}`}>
        {labelMap[status]}
      </span>
    )
  }

  return (
    <div className="flex flex-col h-[520px] lg:h-[560px]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-dark-100/60 px-4 py-3">
        <div className="text-xs text-muted-foreground">
          Mode:{' '}
          <span
            className={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
              api.getStoredAuthToken()
                ? 'bg-green-500/20 text-green-300'
                : 'bg-yellow-500/20 text-yellow-300'
            }`}
          >
            {api.getStoredAuthToken() ? 'Live mode' : 'Simulation mode'}
          </span>
        </div>
        <button
          onClick={() => setRunSeed((prev) => prev + 1)}
          disabled={isDemoRunning}
          className="btn-quantum text-xs disabled:opacity-60"
        >
          {isDemoRunning ? 'Running full demo...' : 'Run full demo'}
        </button>
      </div>

      {demoTimeline.length > 0 && (
        <div className="mb-4 card-quantum p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Full demo timeline</span>
            <span className="text-xs text-muted-foreground">
              {demoTimeline.some((step) => step.status === 'running')
                ? 'In progress'
                : demoTimeline.some((step) => step.status === 'error')
                  ? 'Needs attention'
                  : 'Complete'}
            </span>
          </div>
          <div className="space-y-3">
            {demoTimeline.map((step, index) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between gap-3 rounded-xl bg-dark-100/70 border border-white/10 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">
                    {index + 1}. {step.label}
                  </div>
                  {step.detail && (
                    <div className="text-xs text-muted-foreground">{step.detail}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(step.endedAt || step.startedAt)}
                  </span>
                  {timelinePill(step.status)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {/* Prompt helpers */}
      {!input.trim() && (
        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Try a prompt to see live decision stats
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="px-3 py-1 rounded-full text-xs bg-dark-100 hover:bg-primary/10 border border-white/10 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live prompt insights */}
      {input.trim() && (
        <div className="mb-4 rounded-xl border border-white/10 bg-dark-100/60 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Live prompt insights
            </span>
            <span className="text-primary font-medium">{insights.intent}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-dark-100 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Gauge className="w-4 h-4 text-primary" />
                Confidence
              </div>
              <div className="text-lg font-semibold mt-1">
                {Math.round(insights.confidence * 100)}%
              </div>
              <div className="h-1.5 bg-dark-200 rounded-full mt-2">
                <div
                  className="h-1.5 rounded-full bg-primary"
                  style={{ width: `${Math.round(insights.confidence * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-dark-100 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                Risk score
              </div>
              <div className="text-lg font-semibold mt-1">
                {Math.round(insights.risk * 100)}%
              </div>
              <div className="h-1.5 bg-dark-200 rounded-full mt-2">
                <div
                  className="h-1.5 rounded-full bg-yellow-400"
                  style={{ width: `${Math.round(insights.risk * 100)}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl bg-dark-100 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BadgeDollarSign className="w-4 h-4 text-accent" />
                Est. fee
              </div>
              <div className="text-lg font-semibold mt-1">
                {insights.estimatedFee !== null ? `~${insights.estimatedFee.toFixed(4)} USDC` : '—'}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Based on detected amount and x402 model
              </div>
            </div>

            <div className="rounded-xl bg-dark-100 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="w-4 h-4 text-green-400" />
                Balance impact
              </div>
              <div className="text-lg font-semibold mt-1">
                {insights.impactPct !== null ? `${insights.impactPct.toFixed(1)}%` : '—'}
              </div>
              <div className="h-1.5 bg-dark-200 rounded-full mt-2">
                <div
                  className="h-1.5 rounded-full bg-green-400"
                  style={{ width: `${insights.impactPct ?? 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              ETA ~{insights.latency.toFixed(1)}s
            </span>
            <span>Path: {insights.path}</span>
            <span>BFT quorum: 7/11</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-dark-100 rounded-bl-md'
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 px-4 py-2 bg-dark-100 rounded-2xl rounded-bl-md w-16"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Captain Whiskers..."
            className="w-full px-4 py-3 pr-12 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            disabled={isDemoRunning}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isDemoRunning}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <button className="p-3 rounded-xl bg-dark-100 hover:bg-dark-200 transition-colors">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
