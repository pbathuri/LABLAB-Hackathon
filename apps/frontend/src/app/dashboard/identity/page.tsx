'use client'

import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'

const basescan = 'https://sepolia.basescan.org'

export default function IdentityPage() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null)
  const [agentUri, setAgentUri] = useState(
    'https://raw.githubusercontent.com/pbathuri/LABLAB-Hackathon/main/docs/agent-card.json',
  )
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    api
      .identityStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const register = async () => {
    setLoading(true)
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/identity/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentURI: agentUri.trim() }),
        },
      )
      const j = await r.json() as { agentId?: number; txHash?: string; message?: string }
      if (!r.ok) throw new Error(typeof j.message === 'string' ? j.message : JSON.stringify(j))
      const tx = j.txHash ? ` · tx ${j.txHash.slice(0, 10)}…` : ''
      toast.success(`Registered · agentId ${j.agentId ?? '—'}${tx}`)
      refresh()
    } catch (e) {
      toast.error(String(e))
    } finally {
      setLoading(false)
    }
  }

  const feedback = async () => {
    setLoading(true)
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/identity/feedback`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pnlPercent: 1.5,
            sharpeRatio: 1.1,
            maxDrawdownBps: 400,
            winRate: 55,
          }),
        },
      ).then((r) => {
        if (!r.ok) throw new Error('feedback failed')
        return r.json()
      })
      toast.success('Feedback posted to reputation registry')
      refresh()
    } catch (e) {
      toast.error(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">ERC-8004 Identity</h1>
            <p className="text-muted-foreground mt-1">Agent registration & reputation on Base Sepolia</p>
          </div>
          {status?.registered === true && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-medium px-3 py-1 border border-emerald-500/30">
              Registered ✓
            </span>
          )}
          {status?.registered === false && status?.configured === true && (
            <span className="inline-flex items-center rounded-full bg-amber-500/15 text-amber-200 text-xs font-medium px-3 py-1 border border-amber-500/30">
              Not registered
            </span>
          )}
        </motion.div>

        <div className="card-quantum p-6 rounded-2xl space-y-4">
          <h2 className="font-semibold">Register agent URI</h2>
          <p className="text-sm text-muted-foreground">
            Host <code className="text-xs">docs/agent-card.json</code> (e.g. raw GitHub) and paste the URL below.
            Requires <code>AGENT_PRIVATE_KEY</code> (hex) and Base Sepolia ETH. Registry addresses are in{' '}
            <code>.env</code>.
          </p>
          <input
            className="w-full rounded-lg bg-dark-100 border border-white/10 px-3 py-2 text-sm"
            value={agentUri}
            onChange={(e) => setAgentUri(e.target.value)}
            placeholder="https://.../agent-card.json"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={register}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50"
            >
              Register on-chain
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={feedback}
              className="px-4 py-2 rounded-lg border border-white/20 text-sm disabled:opacity-50"
            >
              Post sample feedback
            </button>
          </div>
        </div>

        <div className="card-quantum p-6 rounded-2xl space-y-4">
          <h2 className="font-semibold">On-chain status</h2>
          {typeof status?.wallet === 'string' && status.wallet && (
            <p className="text-sm">
              <span className="text-muted-foreground">Agent wallet </span>
              <code className="text-xs break-all">{status.wallet}</code>{' '}
              <a
                href={`${basescan}/address/${status.wallet}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-sm hover:underline ml-1"
              >
                BaseScan
              </a>
            </p>
          )}
          {status?.agentId != null && (
            <p className="text-sm">
              <span className="text-muted-foreground">Agent ID </span>
              <span className="font-mono">{String(status.agentId)}</span>
            </p>
          )}
          <pre className="text-xs overflow-auto text-muted-foreground max-h-96">
            {JSON.stringify(status, null, 2)}
          </pre>
          {status &&
            typeof status.identityRegistry === 'string' &&
            status.identityRegistry && (
              <a
                href={`${basescan}/address/${status.identityRegistry}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-sm hover:underline"
              >
                Identity registry on BaseScan
              </a>
            )}
        </div>
      </div>
    </DashboardLayout>
  )
}
