'use client'

import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { toast } from 'react-hot-toast'

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
              Create, authorize, and complete x402 micropayments backed by Circle Gateway.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm text-muted-foreground">Payee</label>
                <input
                  value={paymentForm.payee}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payee: e.target.value })}
                  placeholder="0xPayeeAddress"
                  className="w-full px-4 py-2 rounded-xl bg-dark-100 border border-white/10 focus:border-primary/50 focus:outline-none"
                />
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
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
