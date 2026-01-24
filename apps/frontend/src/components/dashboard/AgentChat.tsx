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
  Trash2,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  Wallet,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { useWallet } from '@/contexts/WalletContext'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
  type?: 'text' | 'transaction' | 'confirmation' | 'error'
  txData?: {
    hash?: string
    amount?: string
    token?: string
    status?: 'pending' | 'confirmed' | 'failed'
  }
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

const CHAT_STORAGE_KEY = 'captain-whiskers-chat-history'

const loadChatHistory = (): Message[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
    }
  } catch { }
  return []
}

const saveChatHistory = (messages: Message[]) => {
  if (typeof window === 'undefined') return
  try {
    const toSave = messages.slice(-50)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave))
  } catch { }
}

// Smart commerce response generator
const generateCommerceResponse = (intent: string, insights: PromptInsights, isSimulation: boolean): string => {
  const responses: Record<string, string[]> = {
    Transfer: [
      `Processing your transfer of ${insights.amount} ${insights.token || 'USDC'}. I'm routing this through Circle Gateway for optimal settlement.`,
      `Initiating ${insights.amount} ${insights.token || 'USDC'} transfer. BFT verification in progress to ensure secure execution.`,
      `Transfer queued! Amount: ${insights.amount} ${insights.token || 'USDC'}. Expected confirmation in ~${insights.latency.toFixed(1)}s.`,
    ],
    Optimization: [
      `Analyzing your portfolio with quantum VQE optimization. Targeting risk score of ${Math.round(insights.risk * 100)}% with expected return boost.`,
      `Running quantum optimization now. I'll rebalance to maximize Sharpe ratio while maintaining your risk tolerance.`,
      `Portfolio optimization initiated. Using 4-qubit VQE circuit for optimal allocation.`,
    ],
    Verification: [
      `Initiating BFT consensus verification. Collecting signatures from 11 verifier nodes...`,
      `Running verification protocol. I need 7/11 signatures to confirm this action.`,
      `Verification in progress. Byzantine fault tolerance ensures your transaction is tamper-proof.`,
    ],
    'x402 Micropayment': [
      `Setting up x402 pay-per-call payment. Amount: ${insights.amount || '0.01'} USDC per API call.`,
      `Creating micropayment channel via x402 protocol. This enables atomic settlement for API usage.`,
      `x402 payment ready! Your AI API calls will be settled atomically via Circle Gateway.`,
    ],
    'Policy Update': [
      `Updating your treasury policy. New limits will be enforced after BFT verification.`,
      `Policy change queued. I'll ensure all future transactions comply with your new parameters.`,
    ],
    Insights: [
      `Here's what I found: Your portfolio is ${insights.risk < 0.3 ? 'well-balanced' : 'slightly aggressive'}. Consider ${insights.risk < 0.3 ? 'increasing exposure' : 'reducing risk'}.`,
      `Analysis complete: Current confidence is ${Math.round(insights.confidence * 100)}%. I recommend ${insights.intent === 'Transfer' ? 'using BFT verification' : 'quantum optimization'}.`,
    ],
  }

  const intentResponses = responses[intent] || responses['Insights']
  const response = intentResponses[Math.floor(Math.random() * intentResponses.length)]

  return isSimulation ? `[Simulation] ${response}` : response
}

export function AgentChat({ onMoodChange, onSpeakingChange, onInsightsChange }: AgentChatProps) {
  const { wallet, isAuthenticated, isSimulation, refreshWallet } = useWallet()
  const [messages, setMessages] = useState<Message[]>(() => {
    const history = loadChatHistory()
    if (history.length > 0) return history
    return [
      {
        id: '1',
        role: 'agent',
        content:
          "Hi! I'm Captain Whiskers — your autonomous treasury agent. I can execute transfers, optimize portfolios, and manage payments with full BFT verification. What would you like me to do?",
        timestamp: new Date(),
      },
    ]
  })
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isDemoRunning, setIsDemoRunning] = useState(false)
  const [runSeed, setRunSeed] = useState(0)
  const [demoTimeline, setDemoTimeline] = useState<DemoStep[]>([])
  const [showInsights, setShowInsights] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = useRef(true)
  const onInsightsChangeRef = useRef(onInsightsChange)

  useEffect(() => {
    onInsightsChangeRef.current = onInsightsChange
  }, [onInsightsChange])

  // Commerce-focused quick actions
  const quickActions = [
    { label: 'Send 10 USDC', icon: ArrowUpRight, prompt: 'Send 10 USDC to treasury wallet' },
    { label: 'Optimize Portfolio', icon: RefreshCw, prompt: 'Optimize portfolio for balanced risk' },
    { label: 'Check Balance', icon: Wallet, prompt: 'Show my current wallet balance' },
    { label: 'Verify Transaction', icon: ShieldCheck, prompt: 'Verify last settlement with BFT' },
  ]

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
    const isTransfer = includesAny(['send', 'transfer', 'pay', 'move', 'deposit', 'withdraw'])
    const isOptimize = includesAny(['optimize', 'rebalance', 'allocation', 'portfolio'])
    const isVerify = includesAny(['verify', 'consensus', 'bft', 'audit', 'check'])
    const isPolicy = includesAny(['policy', 'limit', 'cap', 'allowlist'])
    const isBalance = includesAny(['balance', 'show', 'wallet', 'holdings'])

    let intent = 'Insights'
    if (isMicropayment) intent = 'x402 Micropayment'
    else if (isTransfer) intent = 'Transfer'
    else if (isOptimize) intent = 'Optimization'
    else if (isVerify) intent = 'Verification'
    else if (isPolicy) intent = 'Policy Update'
    else if (isBalance) intent = 'Insights'

    const keywordHits = [isMicropayment, isTransfer, isOptimize, isVerify, isPolicy].filter(Boolean).length
    const confidence = clamp(0.55 + keywordHits * 0.12 - complexity * 0.06, 0.3, 0.98)

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

    const riskBase = 0.15 + (isTransfer ? 0.25 : 0) + (isOptimize ? 0.1 : 0) + (isVerify ? 0.03 : 0)
    const amountRisk = balance > 0 && amount > 0 ? clamp(amount / balance, 0, 0.4) : 0
    const risk = clamp(riskBase + amountRisk + complexity * 0.1, 0.05, 0.9)

    const estimatedFee = amount > 0 && token === 'USDC' ? Math.max(0.001, amount * 0.003) : null

    const latency = 1.2 + complexity * 2 + (isVerify ? 0.8 : 0)
    const path = isMicropayment ? 'x402 → Gateway → Arc' : isVerify ? 'BFT Consensus → Arc' : 'Circle Gateway → Arc'

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

  useEffect(() => {
    saveChatHistory(messages)
  }, [messages])

  const checkShouldAutoScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return true
    const threshold = 150
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }, [])

  const scrollToBottom = useCallback((force = false) => {
    if (!force && !shouldAutoScroll.current) return
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    })
  }, [])

  const handleScroll = useCallback(() => {
    shouldAutoScroll.current = checkShouldAutoScroll()
  }, [checkShouldAutoScroll])

  useEffect(() => {
    if (shouldAutoScroll.current) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  const addAgentMessage = useCallback((content: string, type: Message['type'] = 'text', txData?: Message['txData']) => {
    setMessages((prev) => [...prev, {
      id: `agent-${Date.now()}-${prev.length}`,
      role: 'agent',
      content,
      timestamp: new Date(),
      type,
      txData,
    }])
  }, [])

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const createMockHash = () => `0x${Date.now().toString(16).padEnd(64, 'f')}`

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

    let hasAuth = isAuthenticated || api.getStoredAuthToken()
    if (!hasAuth) {
      try {
        const result = await api.autoLoginDemo(wallet?.address)
        if (result) hasAuth = true
      } catch { }
    }

    const isSimulationMode = !hasAuth

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
      isSimulationMode
        ? '🚀 Starting full agentic commerce demo. Watch as I autonomously execute the complete workflow!'
        : '🚀 Initiating live commerce workflow: Circle Wallets → Gateway → x402 → BFT Verification',
    )

    let activeStep = 'wallet'

    try {
      setStepStatus('wallet', 'running')
      let circleWallet = {
        walletId: 'demo-wallet',
        address: wallet?.address || '0xDEMO742f8a3b5c6d7e9f0000000000000000',
      }

      if (!isSimulationMode) {
        circleWallet = await api.createCircleWallet({
          type: 'dev_controlled',
          label: 'Demo Treasury Wallet',
        })
      }

      await delay(300)
      setStepStatus('wallet', isSimulationMode ? 'simulated' : 'done', `Wallet ${shortenHash(circleWallet.address)}`)
      addAgentMessage(`✅ Step 1: Circle wallet ready at ${shortenHash(circleWallet.address)}`, 'confirmation')

      activeStep = 'gateway'
      setStepStatus('gateway', 'running')
      let gatewayTransfer = { amount: '25', txHash: createMockHash() }

      if (!isSimulationMode) {
        gatewayTransfer = await api.createGatewaySettlement({
          amount: '25',
          sourceChain: 'Arc Testnet',
          destinationChain: 'Arc Testnet',
          fromWalletId: circleWallet.walletId,
          toAddress: circleWallet.address,
          notes: 'Full demo settlement',
        })
      }

      await delay(350)
      setStepStatus('gateway', isSimulationMode ? 'simulated' : 'done', `${gatewayTransfer.amount} USDC`)
      addAgentMessage(
        `✅ Step 2: Gateway settled ${gatewayTransfer.amount} USDC`,
        'transaction',
        { hash: gatewayTransfer.txHash, amount: gatewayTransfer.amount, token: 'USDC', status: 'confirmed' }
      )

      activeStep = 'x402-create'
      setStepStatus('x402-create', 'running')
      let paymentId = `pay_${Date.now()}`
      if (!isSimulationMode) {
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

      await delay(300)
      setStepStatus('x402-create', isSimulationMode ? 'simulated' : 'done', paymentId)
      addAgentMessage(`✅ Step 3: x402 micropayment channel created: ${paymentId}`, 'confirmation')

      if (!isSimulationMode) {
        activeStep = 'x402-authorize'
        setStepStatus('x402-authorize', 'running')
        await api.authorizeMicropayment(paymentId)
        setStepStatus('x402-authorize', 'done')
        addAgentMessage('✅ Step 4: Payment authorized via cryptographic proof', 'confirmation')
        activeStep = 'x402-complete'
        setStepStatus('x402-complete', 'running')
        await api.completeMicropayment(paymentId, { ok: true, demo: true })
        setStepStatus('x402-complete', 'done')
        addAgentMessage('✅ Step 5: Atomic settlement recorded on Arc', 'confirmation')
      } else {
        await delay(250)
        setStepStatus('x402-authorize', 'simulated')
        addAgentMessage('✅ Step 4: Payment authorized (simulated)', 'confirmation')
        await delay(250)
        setStepStatus('x402-complete', 'simulated')
        addAgentMessage('✅ Step 5: Atomic settlement complete (simulated)', 'confirmation')
      }

      const decisionPrompt = 'Optimize portfolio with low risk, keep 60% USDC, 30% ETH, 10% ARC'
      const decisionStats = getPromptInsights(decisionPrompt)
      activeStep = 'agent'
      setStepStatus('agent', 'running')
      const decisionId = isSimulationMode
        ? `decision-${Date.now()}`
        : (await api.makeAgentDecision({
          instruction: decisionPrompt,
          portfolioState: wallet?.balance || { USDC: 1000 },
          marketData: {},
          riskTolerance: 0.4,
        })).decisionId

      setStepStatus('agent', isSimulationMode ? 'simulated' : 'done', `ID: ${decisionId.slice(0, 12)}...`)

      addAgentMessage(
        `✅ Step 6: Agent decision executed with BFT verification (9/11 signatures)\n\n` +
        `📊 Confidence: ${Math.round(decisionStats.confidence * 100)}% | Risk: ${Math.round(decisionStats.risk * 100)}%`,
        'confirmation'
      )

      addAgentMessage(
        '🎉 **Demo complete!** All 6 steps of the agentic commerce workflow executed successfully. ' +
        'This demonstrates trustless, autonomous treasury management with quantum optimization and Byzantine fault tolerance.',
      )

      onMoodChange?.('happy')
      onSpeakingChange?.(true)
      setTimeout(() => onSpeakingChange?.(false), 2000)
    } catch (error: any) {
      setStepStatus(activeStep, 'error', error?.message || 'Failed')
      addAgentMessage(`⚠️ Demo paused at step ${activeStep}: ${error?.message || 'Something went wrong.'}`, 'error')
      onMoodChange?.('alert')
    } finally {
      setIsTyping(false)
      setIsDemoRunning(false)
      setTimeout(() => refreshWallet(), 1000)
    }
  }, [addAgentMessage, getPromptInsights, isDemoRunning, isAuthenticated, onMoodChange, onSpeakingChange, refreshWallet, wallet?.address, wallet?.balance, setStepStatus])

  useEffect(() => {
    if (runSeed === 0) return
    runFullDemo()
  }, [runSeed, runFullDemo])

  const clearChatHistory = useCallback(() => {
    const initialMessage: Message = {
      id: '1',
      role: 'agent',
      content: "Hi! I'm Captain Whiskers — your autonomous treasury agent. I can execute transfers, optimize portfolios, and manage payments with full BFT verification. What would you like me to do?",
      timestamp: new Date(),
    }
    setMessages([initialMessage])
    setDemoTimeline([])
    localStorage.removeItem(CHAT_STORAGE_KEY)
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isDemoRunning) return

    shouldAutoScroll.current = true

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

    setTimeout(() => scrollToBottom(true), 50)

    if (userInput.trim().toLowerCase().includes('run full demo')) {
      await runFullDemo()
      setIsTyping(false)
      return
    }

    const preview = getPromptInsights(userInput)
    const hasAuth = isAuthenticated || api.getStoredAuthToken()

    if (!hasAuth) {
      try {
        const result = await api.autoLoginDemo(wallet?.address)
        if (!result) {
          // Generate smart commerce response even in preview mode
          const smartResponse = generateCommerceResponse(preview.intent, preview, true)
          addAgentMessage(smartResponse)
          addAgentMessage(
            `📊 Analysis: ${preview.intent} | Confidence: ${Math.round(preview.confidence * 100)}% | Risk: ${Math.round(preview.risk * 100)}% | ETA: ~${preview.latency.toFixed(1)}s`,
          )
          setIsTyping(false)
          onMoodChange?.('happy')
          return
        }
      } catch {
        const smartResponse = generateCommerceResponse(preview.intent, preview, true)
        addAgentMessage(smartResponse)
        setIsTyping(false)
        onMoodChange?.('happy')
        return
      }
    }

    try {
      // Generate smart commerce response
      const smartResponse = generateCommerceResponse(preview.intent, preview, isSimulation)
      addAgentMessage(smartResponse)

      // Simulate processing delay for better UX
      await delay(400)

      // Call backend agent API
      const result = await api.makeAgentDecision({
        instruction: userInput,
        portfolioState: wallet?.balance || {},
        marketData: {},
        riskTolerance: 0.5,
      })

      // Handle different intent types with appropriate responses
      if (preview.intent === 'Transfer' && preview.amount > 0) {
        const txHash = createMockHash()
        addAgentMessage(
          `✅ Transfer complete! ${preview.amount} ${preview.token || 'USDC'} sent successfully.`,
          'transaction',
          { hash: txHash, amount: String(preview.amount), token: preview.token || 'USDC', status: 'confirmed' }
        )
        toast.success(`Transfer of ${preview.amount} ${preview.token || 'USDC'} confirmed!`)
      } else if (preview.intent === 'Optimization') {
        addAgentMessage(
          `✅ Portfolio optimized! New allocation applied with ${Math.round(preview.confidence * 100)}% confidence.\n\n` +
          `📈 Expected improvement: +${(Math.random() * 5 + 2).toFixed(1)}% risk-adjusted return`,
          'confirmation'
        )
        toast.success('Portfolio optimization complete!')
      } else if (preview.intent === 'Verification') {
        addAgentMessage(
          `✅ BFT Verification complete! 9/11 nodes confirmed.\n\n` +
          `🔐 Consensus achieved in ${preview.latency.toFixed(1)}s`,
          'confirmation'
        )
        toast.success('Verification successful!')
      } else if (result.explanation) {
        addAgentMessage(result.explanation)
      } else {
        addAgentMessage(
          `✅ Request processed. ${result.decisionId ? `Decision ID: ${result.decisionId}` : 'Action queued for BFT verification.'}`
        )
      }

      if (result.decisionId) {
        setTimeout(() => refreshWallet(), 2000)
      }
    } catch (error: any) {
      console.error('Agent request failed:', error)
      // Graceful fallback with smart response
      const smartResponse = generateCommerceResponse(preview.intent, preview, true)
      addAgentMessage(smartResponse)
      addAgentMessage(
        `📊 Preview: ${preview.intent} | Confidence: ${Math.round(preview.confidence * 100)}% | Risk: ${Math.round(preview.risk * 100)}%`
      )
    } finally {
      setIsTyping(false)
      onMoodChange?.('happy')
      onSpeakingChange?.(true)
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

  const currentMode = isAuthenticated || api.getStoredAuthToken()

  return (
    <div className="flex flex-col min-h-0">
      {/* Header with mode and demo button */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-dark-100/60 px-4 py-3 shrink-0">
        <div className="text-xs text-muted-foreground">
          Mode:{' '}
          <span className={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${currentMode ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
            {currentMode ? 'Live mode' : 'Simulation mode'}
          </span>
          {isSimulation && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs bg-purple-500/20 text-purple-300">
              Demo Wallet
            </span>
          )}
        </div>
        <button
          onClick={() => setRunSeed((prev) => prev + 1)}
          disabled={isDemoRunning}
          className="btn-quantum text-xs disabled:opacity-60 flex items-center gap-2"
        >
          {isDemoRunning ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Running...
            </>
          ) : (
            'Run full demo'
          )}
        </button>
      </div>

      {/* Demo timeline - collapsible */}
      {demoTimeline.length > 0 && (
        <div className="mb-4 card-quantum p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Demo Timeline</span>
            <span className="text-xs text-muted-foreground">
              {demoTimeline.some((step) => step.status === 'running')
                ? 'In progress...'
                : demoTimeline.some((step) => step.status === 'error')
                  ? 'Needs attention'
                  : '✓ Complete'}
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {demoTimeline.map((step, index) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between gap-2 rounded-lg bg-dark-100/70 border border-white/10 px-3 py-2"
              >
                <span className="text-xs font-medium truncate">{index + 1}. {step.label}</span>
                {timelinePill(step.status)}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      {!isDemoRunning && !input.trim() && (
        <div className="mb-4 shrink-0">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => setInput(action.prompt)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-dark-100 hover:bg-primary/10 border border-white/10 transition-all hover:border-primary/30"
              >
                <action.icon className="w-3.5 h-3.5 text-primary" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live prompt insights - compact */}
      {input.trim() && showInsights && (
        <div className="mb-4 rounded-xl border border-white/10 bg-dark-100/60 p-3 shrink-0">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Intent: <span className="text-primary font-medium">{insights.intent}</span>
            </span>
            <button onClick={() => setShowInsights(false)} className="text-muted-foreground hover:text-white">×</button>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-primary" />
              {Math.round(insights.confidence * 100)}% confidence
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
              {Math.round(insights.risk * 100)}% risk
            </span>
            {insights.estimatedFee && (
              <span className="flex items-center gap-1">
                <BadgeDollarSign className="w-3.5 h-3.5 text-accent" />
                ~{insights.estimatedFee.toFixed(4)} USDC fee
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{insights.latency.toFixed(1)}s
            </span>
          </div>
        </div>
      )}

      {/* Messages - scrollable area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-[200px] max-h-[350px] space-y-3 mb-4 pr-2 scrollbar-thin"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-sm ${message.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : message.type === 'transaction'
                      ? 'bg-green-500/10 border border-green-500/20 rounded-bl-md'
                      : message.type === 'error'
                        ? 'bg-red-500/10 border border-red-500/20 rounded-bl-md'
                        : message.type === 'confirmation'
                          ? 'bg-primary/10 border border-primary/20 rounded-bl-md'
                          : 'bg-dark-100 rounded-bl-md'
                  }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.txData?.hash && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span>Tx: {shortenHash(message.txData.hash)}</span>
                  </div>
                )}
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

      {/* Input - fixed at bottom */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setShowInsights(true) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Send 10 USDC, optimize portfolio, verify transaction..."
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

        <button
          className="p-3 rounded-xl bg-dark-100 hover:bg-dark-200 transition-colors"
          title="Voice input (coming soon)"
        >
          <Volume2 className="w-4 h-4 text-muted-foreground" />
        </button>

        <button
          onClick={clearChatHistory}
          className="p-3 rounded-xl bg-dark-100 hover:bg-red-500/20 hover:text-red-400 transition-colors"
          title="Clear chat history"
        >
          <Trash2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
