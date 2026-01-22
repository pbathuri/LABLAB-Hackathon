'use client'

import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import {
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Link as LinkIcon,
  Coins,
  Shield,
  CreditCard,
  Sparkles,
  Play,
  Wand2,
  Timer,
  ClipboardList,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useWallet } from '@/contexts/WalletContext'

type CircleConfig = {
  consoleUrl: string
  arc: { chainId: number; usdcContract?: string | null }
  wallets: { enabled: boolean }
  gateway: { enabled: boolean }
  bridge: { enabled: boolean }
  x402: { enabled: boolean }
  appBuilder: { enabled: boolean }
}

export default function CirclePage() {
  const [config, setConfig] = useState<CircleConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authToken, setAuthToken] = useState(api.getStoredAuthToken() || '')
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [isAtomicRunning, setIsAtomicRunning] = useState(false)
  const { wallet } = useWallet()
  const [paymentForm, setPaymentForm] = useState({
    payee: '',
    amount: '',
    apiEndpoint: '',
    providerId: '',
    model: 'pay_per_call',
    description: '',
  })

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true)
      try {
        const result = await api.getCircleConfig()
        setConfig(result)
      } catch (error: any) {
        console.error('Failed to fetch Circle config:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const saveToken = () => {
    if (!authToken.trim()) {
      api.clearAuthToken()
      toast.success('Backend token cleared')
      return
    }
    api.setAuthToken(authToken.trim())
    toast.success('Backend token saved')
  }

  const handleCreatePayment = async () => {
    try {
      setPaymentStatus('creating')
      const result: any = await api.createMicropayment({
        payee: paymentForm.payee,
        amount: paymentForm.amount,
        apiEndpoint: paymentForm.apiEndpoint || undefined,
        providerId: paymentForm.providerId || undefined,
        model: paymentForm.model as any,
        description: paymentForm.description || undefined,
      })
      setPaymentId(result.id || result.requestId || result?.data?.id)
      setPaymentStatus('created')
      toast.success('Micropayment created')
    } catch (error: any) {
      setPaymentStatus('error')
      toast.error(error.message || 'Failed to create micropayment')
    }
  }

  const handleAtomicSettlement = async () => {
    if (!paymentForm.payee || !paymentForm.amount) {
      toast.error('Payee and amount are required.')
      return
    }

    try {
      setIsAtomicRunning(true)
      setPaymentStatus('creating')
      const result: any = await api.createMicropayment({
        payee: paymentForm.payee,
        amount: paymentForm.amount,
        apiEndpoint: paymentForm.apiEndpoint || undefined,
        providerId: paymentForm.providerId || undefined,
        model: paymentForm.model as any,
        description: paymentForm.description || undefined,
      })
      const id = result.id || result.requestId || result?.data?.id
      setPaymentId(id)
      setPaymentStatus('authorizing')
      await api.authorizeMicropayment(id)
      setPaymentStatus('completing')
      await api.completeMicropayment(id, { ok: true, atomic: true })
      setPaymentStatus('completed')
      toast.success('Atomic settlement completed')
    } catch (error: any) {
      setPaymentStatus('error')
      toast.error(error.message || 'Atomic settlement failed')
    } finally {
      setIsAtomicRunning(false)
    }
  }

  const handleAuthorize = async () => {
    if (!paymentId) return
    try {
      setPaymentStatus('authorizing')
      await api.authorizeMicropayment(paymentId)
      setPaymentStatus('authorized')
      toast.success('Payment authorized')
    } catch (error: any) {
      setPaymentStatus('error')
      toast.error(error.message || 'Failed to authorize')
    }
  }

  const handleComplete = async () => {
    if (!paymentId) return
    try {
      setPaymentStatus('completing')
      await api.completeMicropayment(paymentId, { ok: true })
      setPaymentStatus('completed')
      toast.success('Payment completed')
    } catch (error: any) {
      setPaymentStatus('error')
      toast.error(error.message || 'Failed to complete')
    }
  }

  const handleFail = async () => {
    if (!paymentId) return
    try {
      setPaymentStatus('failing')
      await api.failMicropayment(paymentId, 'Demo failure')
      setPaymentStatus('failed')
      toast.success('Payment failed')
    } catch (error: any) {
      setPaymentStatus('error')
      toast.error(error.message || 'Failed to fail payment')
    }
  }

  const handleRefund = async () => {
    if (!paymentId) return
    try {
      setPaymentStatus('refunding')
      await api.refundMicropayment(paymentId)
      setPaymentStatus('refunded')
      toast.success('Payment refunded')
    } catch (error: any) {
      setPaymentStatus('error')
      toast.error(error.message || 'Failed to refund')
    }
  }

  const statusBadge = (enabled: boolean) => (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
        enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
      }`}
    >
      {enabled ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {enabled ? 'Configured' : 'Not configured'}
    </span>
  )

  const statusStepMap: Record<string, number> = {
    creating: 1,
    created: 1,
    authorizing: 2,
    authorized: 2,
    completing: 3,
    completed: 3,
    failing: 3,
    failed: 3,
    refunding: 3,
    refunded: 3,
    error: 3,
  }

  const currentStep = paymentStatus ? statusStepMap[paymentStatus] || 0 : 0
  const hasError = paymentStatus === 'error' || paymentStatus === 'failed'

  const renderStep = (step: number, title: string, description: string) => {
    const isActive = currentStep === step && ['creating', 'authorizing', 'completing'].includes(paymentStatus || '')
    const isDone = currentStep > step || (currentStep === step && !isActive && !hasError)
    const isError = hasError && currentStep === step

    const baseClass = 'p-4 rounded-xl border flex flex-col gap-2'
    const stateClass = isError
      ? 'border-red-500/40 bg-red-500/10 text-red-200'
      : isDone
        ? 'border-green-500/40 bg-green-500/10 text-green-200'
        : isActive
          ? 'border-primary/40 bg-primary/10 text-white'
          : 'border-white/10 bg-dark-100 text-muted-foreground'

    return (
      <div className={`${baseClass} ${stateClass}`}>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs">{description}</div>
      </div>
    )
  }

  const amountValue = parseFloat(paymentForm.amount || '0')
  const estimatedFee = amountValue > 0 ? Math.max(0.002, amountValue * 0.005) : null
  const estimatedLatency = paymentForm.model === 'bundled' ? '2-4s' : '3-6s'

  const quickStartSteps = useMemo(
    () => [
      'Paste a JWT token (from /auth/login)',
      'Enter payee + amount',
      'Run Atomic Settle',
    ],
    [],
  )

  const handleFillDemo = () => {
    if (!wallet?.address) {
      toast.error('Connect a wallet to auto-fill the payee address.')
    }
    setPaymentForm({
      payee: wallet?.address || paymentForm.payee,
      amount: paymentForm.amount || '0.10',
      apiEndpoint: paymentForm.apiEndpoint || '/api/agent/decide',
      providerId: paymentForm.providerId || 'gemini-flash',
      model: paymentForm.model || 'pay_per_call',
      description: paymentForm.description || 'Agent inference (x402)',
    })
  }

  const handleUseWalletAsPayee = () => {
    if (!wallet?.address) {
      toast.error('Connect a wallet first.')
      return
    }
    setPaymentForm({ ...paymentForm, payee: wallet.address })
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <Coins className="w-8 h-8 text-primary" />
            Circle Integrations
          </h1>

          {/* Circle Console Status */}
          <div className="card-quantum p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BadgeDollarSign className="w-5 h-5" />
                Circle Console Status
              </h2>
              {config?.consoleUrl && (
                <a
                  href={config.consoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Open Console <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {isLoading ? (
              <p className="text-muted-foreground">Loading configuration...</p>
            ) : config ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-dark-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Circle Wallets</span>
                    {statusBadge(config.wallets.enabled)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Programmable wallets for users and agents.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-dark-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Circle Gateway</span>
                    {statusBadge(config.gateway.enabled)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Unified USDC balance for cross-chain transfers.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-dark-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bridge Kit</span>
                    {statusBadge(config.bridge.enabled)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Cross-chain USDC bridging.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-dark-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">x402 Facilitator</span>
                    {statusBadge(config.x402.enabled)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    HTTP 402 micropayment verification.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-dark-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI App Builder</span>
                    {statusBadge(config.appBuilder.enabled)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Circle AI App Builder (beta).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-dark-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Arc + USDC</span>
                    {statusBadge(Boolean(config.arc.usdcContract))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Chain ID {config.arc.chainId} with USDC contract.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-red-400">Failed to load Circle configuration.</p>
            )}
          </div>

          {/* Backend Token */}
          <div className="card-quantum p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Backend Authentication
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Paste a JWT token to enable Circle backend APIs (micropayments, policy enforcement).
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Bearer token from /auth/login"
                className="flex-1 px-4 py-2 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none text-sm"
              />
              <button onClick={saveToken} className="btn-quantum">
                Save Token
              </button>
            </div>
          </div>

          {/* x402 Micropayments */}
          <div className="card-quantum p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              x402 Micropayments (Gateway)
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create, authorize, and complete x402 micropayments with atomic settlement on Arc.
            </p>

            <div className="mb-6 rounded-xl border border-white/10 bg-dark-100/60 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                Quickstart
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-xs text-muted-foreground">
                {quickStartSteps.map((step) => (
                  <div key={step} className="rounded-lg border border-white/10 bg-dark-100 px-3 py-2">
                    {step}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <button onClick={handleFillDemo} className="btn-quantum inline-flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Fill Demo Values
                </button>
                <button
                  onClick={handleAtomicSettlement}
                  disabled={isAtomicRunning}
                  className="btn-quantum inline-flex items-center gap-2 disabled:opacity-60"
                >
                  <Play className="w-4 h-4" />
                  {isAtomicRunning ? 'Running Atomic Settle...' : 'Atomic Settle'}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-muted-foreground">Payee</label>
                <input
                  value={paymentForm.payee}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payee: e.target.value })}
                  placeholder="0xPayeeAddress"
                  className="w-full px-4 py-2 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none"
                />
                <button
                  onClick={handleUseWalletAsPayee}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Use connected wallet
                </button>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Amount (USDC)</label>
                <input
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="0.10"
                  className="w-full px-4 py-2 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">API Endpoint</label>
                <input
                  value={paymentForm.apiEndpoint}
                  onChange={(e) => setPaymentForm({ ...paymentForm, apiEndpoint: e.target.value })}
                  placeholder="/api/agent/decision"
                  className="w-full px-4 py-2 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Model</label>
                <select
                  value={paymentForm.model}
                  onChange={(e) => setPaymentForm({ ...paymentForm, model: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none"
                >
                  <option value="pay_per_call">Pay Per Call</option>
                  <option value="pay_on_success">Pay On Success</option>
                  <option value="bundled">Bundled</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Provider ID (optional)</label>
                <input
                  value={paymentForm.providerId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, providerId: e.target.value })}
                  placeholder="gemini-flash"
                  className="w-full px-4 py-2 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground">Description</label>
                <input
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                  placeholder="AI agent inference payment"
                  className="w-full px-4 py-2 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={handleCreatePayment} className="btn-quantum">
                Create Payment
              </button>
              <button onClick={handleAuthorize} className="btn-quantum" disabled={!paymentId}>
                Authorize
              </button>
              <button onClick={handleComplete} className="btn-quantum" disabled={!paymentId}>
                Complete
              </button>
              <button onClick={handleFail} className="btn-quantum" disabled={!paymentId}>
                Fail
              </button>
              <button onClick={handleRefund} className="btn-quantum" disabled={!paymentId}>
                Refund
              </button>
            </div>

            {paymentId && (
              <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Payment ID: <span className="font-mono">{paymentId}</span>
                {paymentStatus && <span>({paymentStatus})</span>}
              </div>
            )}

            <div className="mt-6 grid md:grid-cols-3 gap-4">
              {renderStep(1, 'Create', 'EIP-712 + PQ signature')}
              {renderStep(2, 'Authorize', 'x402 gateway authorization')}
              {renderStep(3, 'Complete', 'Atomic settlement on Arc')}
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-dark-100 p-4">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <BadgeDollarSign className="w-4 h-4 text-accent" />
                  Estimated fee
                </div>
                <div className="text-lg font-semibold mt-2">
                  {estimatedFee ? `~${estimatedFee.toFixed(4)} USDC` : '—'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Estimate only</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-dark-100 p-4">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Timer className="w-4 h-4 text-primary" />
                  Estimated latency
                </div>
                <div className="text-lg font-semibold mt-2">{estimatedLatency}</div>
                <div className="text-xs text-muted-foreground mt-1">BFT quorum: 7/11</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-dark-100 p-4">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-green-400" />
                  Settlement path
                </div>
                <div className="text-lg font-semibold mt-2">x402 → Arc</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Gateway handles atomic settlement
                </div>
              </div>
            </div>
          </div>

          {/* Arc Infrastructure */}
          <div className="card-quantum p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Arc Infrastructure & Resources
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Arc is the settlement layer for Captain Whiskers. Use these providers and indexers
              for reliable RPC access, onchain data, and observability.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">Node Providers</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Alchemy</li>
                  <li>Blockdaemon</li>
                  <li>dRPC</li>
                  <li>QuickNode</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Data Indexers</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Envio (HyperIndex)</li>
                  <li>Goldsky (Subgraphs + Mirror)</li>
                  <li>The Graph</li>
                  <li>Thirdweb Insight</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <a
                href="https://docs.arc.network/llms.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Arc Docs & Resources
              </a>
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Circle Faucet (USDC testnet)
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
