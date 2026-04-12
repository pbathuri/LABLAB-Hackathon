'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function RiskPage() {
  const [ctx, setCtx] = useState<Awaited<ReturnType<typeof api.riskContext>> | null>(null)
  const [validate, setValidate] = useState<{ valid: boolean; reason: string } | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const c = await api.riskContext()
        if (cancelled) return
        setCtx(c)
        if (!c.riskRouterConfigured || !c.agentAddress || !c.mockUsdc || !c.mockWeth) {
          setValidate({
            valid: false,
            reason:
              'Deploy RiskRouter and set MOCK_USDC_ADDRESS, MOCK_WETH_ADDRESS, AGENT_PRIVATE_KEY in .env',
          })
          return
        }
        const deadline = Math.floor(Date.now() / 1000) + 3600
        const nav = '10000000000'
        const v = await api.riskValidate({
          agent: c.agentAddress,
          tokenIn: c.mockUsdc,
          tokenOut: c.mockWeth,
          amountIn: '1000000',
          minAmountOut: '1',
          deadline: String(deadline),
          strategyHash: '0x' + '0'.repeat(64),
          portfolioNav: nav,
        })
        if (!cancelled) setValidate(v)
      } catch (e) {
        if (!cancelled) setErr(String(e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold gradient-text">Risk console</h1>
          <p className="text-muted-foreground mt-1">
            RiskRouter <code className="text-xs">validateIntent</code> — wired to env addresses
          </p>
        </motion.div>

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-quantum p-6 rounded-2xl space-y-3">
            <h2 className="font-semibold">Addresses</h2>
            <pre className="text-xs overflow-auto text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(ctx, null, 2)}
            </pre>
            {ctx?.riskRouterAddress && (
              <a
                href={`https://sepolia.basescan.org/address/${ctx.riskRouterAddress}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-sm hover:underline"
              >
                RiskRouter on BaseScan
              </a>
            )}
          </div>
          <div className="card-quantum p-6 rounded-2xl">
            <h2 className="font-semibold mb-4">validateIntent (live)</h2>
            <pre className="text-xs overflow-auto text-muted-foreground">
              {JSON.stringify(validate, null, 2)}
            </pre>
            <p className="text-xs text-muted-foreground mt-4">
              Uses <code>GET {apiBase}/api/risk/context</code> then <code>POST /api/risk/validate</code>.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
