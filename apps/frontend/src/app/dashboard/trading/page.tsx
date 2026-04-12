'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Loader2, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'

const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function walkNumber(obj: unknown, keys: string[]): number | null {
  if (obj == null) return null
  if (typeof obj === 'number' && Number.isFinite(obj)) return obj
  if (typeof obj !== 'object') return null
  const o = obj as Record<string, unknown>
  for (const k of keys) {
    const v = o[k]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string') {
      const n = parseFloat(v)
      if (!Number.isNaN(n)) return n
    }
  }
  for (const v of Object.values(o)) {
    const n = walkNumber(v, keys)
    if (n != null) return n
  }
  return null
}

function extractTickerLast(t: unknown): number | null {
  const direct = walkNumber(t, ['last', 'c', 'price', 'close'])
  if (direct != null) return direct
  // Kraken REST-style: data.{PAIR}.c[0] = last trade price
  if (!t || typeof t !== 'object') return null
  const root = t as Record<string, unknown>
  const data = root.data
  if (!data || typeof data !== 'object') return null
  for (const v of Object.values(data as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue
    const pair = v as Record<string, unknown>
    const c = pair.c
    if (Array.isArray(c) && c.length > 0) {
      const first = c[0]
      const n = typeof first === 'number' ? first : parseFloat(String(first))
      if (!Number.isNaN(n)) return n
    }
  }
  return null
}

/** Best-effort portfolio / equity from Kraken paper status JSON */
function extractPortfolioUsd(s: unknown): number | null {
  return walkNumber(s, [
    'equity',
    'nav',
    'totalUsd',
    'total_usd',
    'portfolioValue',
    'value',
    'usd',
  ])
}

function extractPnl(perf: unknown): number | null {
  if (!perf || typeof perf !== 'object') return null
  const p = perf as Record<string, unknown>
  const v =
    p.pnlPercent ?? p.pnl ?? p.totalPnlPercent ?? p.totalPnl
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    return Number.isNaN(n) ? null : n
  }
  return null
}

function extractTotalTrades(perf: unknown): number | null {
  if (!perf || typeof perf !== 'object') return null
  const p = perf as Record<string, unknown>
  const v = p.totalTrades
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseInt(v, 10)
    return Number.isNaN(n) ? null : n
  }
  return null
}

function normalizeHistoryRows(h: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(h)) {
    return h.filter((x) => x && typeof x === 'object') as Array<
      Record<string, unknown>
    >
  }
  if (h && typeof h === 'object') {
    const o = h as Record<string, unknown>
    const data = o.data ?? o.history ?? o.trades ?? o.orders
    if (Array.isArray(data)) {
      return data.filter((x) => x && typeof x === 'object') as Array<
        Record<string, unknown>
      >
    }
  }
  return []
}

export default function TradingPage() {
  const [status, setStatus] = useState<unknown>(null)
  const [history, setHistory] = useState<unknown>(null)
  const [ticker, setTicker] = useState<unknown>(null)
  const [cycles, setCycles] = useState<unknown[]>([])
  const [perf, setPerf] = useState<unknown>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initBusy, setInitBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const [s, h, t, c, p] = await Promise.all([
        fetch(`${api}/api/kraken/paper/status`).then((r) => r.json()),
        fetch(`${api}/api/kraken/paper/history`).then((r) => r.json()),
        fetch(`${api}/api/kraken/ticker/BTCUSD`).then((r) => r.json()),
        fetch(`${api}/api/agent/cycles?limit=10`).then((r) => r.json()),
        fetch(`${api}/api/agent/performance`).then((r) => r.json()),
      ])
      setStatus(s)
      setHistory(h)
      setTicker(t)
      setCycles(Array.isArray(c) ? c : [])
      setPerf(p)
    } catch (e) {
      setErr(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [load])

  const btcLast = useMemo(() => extractTickerLast(ticker), [ticker])
  const portfolioUsd = useMemo(() => extractPortfolioUsd(status), [status])
  const pnl = useMemo(() => extractPnl(perf), [perf])
  const totalTrades = useMemo(() => extractTotalTrades(perf), [perf])
  const historyRows = useMemo(() => normalizeHistoryRows(history), [history])

  const initPaper = async () => {
    setInitBusy(true)
    try {
      const r = await fetch(`${api}/api/kraken/paper/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: 10000 }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(typeof j.message === 'string' ? j.message : JSON.stringify(j))
      toast.success('Paper trading initialized ($10,000)')
      await load()
    } catch (e) {
      toast.error(String(e))
    } finally {
      setInitBusy(false)
    }
  }

  const pnlPositive = pnl != null && pnl >= 0

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-display font-bold gradient-text">Live Trading</h1>
            <p className="text-muted-foreground mt-1">Kraken paper portfolio & AI cycle log</p>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>
            <button
              type="button"
              onClick={initPaper}
              disabled={initBusy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50"
            >
              {initBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Initialize paper ($10k)
            </button>
          </div>
        </div>

        {err && <div className="text-red-400 text-sm">{err}</div>}

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="card-quantum p-6 rounded-2xl border border-white/10">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Portfolio (est.)</p>
            <p className="text-3xl font-bold tabular-nums">
              {portfolioUsd != null
                ? `$${portfolioUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">From paper status JSON</p>
          </div>
          <div className="card-quantum p-6 rounded-2xl border border-white/10">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">BTC / USD</p>
            <p className="text-3xl font-bold tabular-nums">
              {btcLast != null
                ? `$${btcLast.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Kraken ticker BTCUSD</p>
          </div>
          <div className="card-quantum p-6 rounded-2xl border border-white/10">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Session P&amp;L</p>
            <p
              className={`text-3xl font-bold tabular-nums flex items-center gap-2 ${pnl == null ? '' : pnlPositive ? 'text-emerald-400' : 'text-red-400'
                }`}
            >
              {pnl != null ? (
                <>
                  {pnlPositive ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                  {pnl > 0 ? '+' : ''}
                  {pnl.toFixed(2)}%
                </>
              ) : (
                '—'
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-2">From agent performance</p>
          </div>
          <div className="card-quantum p-6 rounded-2xl border border-white/10">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">AI cycles / trades</p>
            <p className="text-3xl font-bold tabular-nums">{totalTrades ?? '—'}</p>
            <p className="text-xs text-muted-foreground mt-2">Logged trading decisions</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-quantum p-6 rounded-2xl">
            <h2 className="font-semibold mb-4">Paper trade history</h2>
            {historyRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No rows parsed yet — initialize paper trading or place a trade. Raw payload below.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-muted-foreground">
                      <th className="py-2 pr-2">#</th>
                      <th className="py-2 pr-2">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.slice(0, 25).map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2 pr-2 align-top text-muted-foreground">{i + 1}</td>
                        <td className="py-2 font-mono text-xs break-all">
                          {JSON.stringify(row)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <details className="mt-4">
              <summary className="text-xs text-muted-foreground cursor-pointer">Raw history JSON</summary>
              <pre className="text-xs overflow-auto max-h-48 mt-2 text-muted-foreground">
                {JSON.stringify(history, null, 2)}
              </pre>
            </details>
          </div>

          <div className="card-quantum p-6 rounded-2xl">
            <h2 className="font-semibold mb-4">Recent AI cycles</h2>
            <pre className="text-xs overflow-auto max-h-80 text-muted-foreground">
              {JSON.stringify(cycles, null, 2)}
            </pre>
          </div>
        </div>

        <details className="card-quantum p-6 rounded-2xl">
          <summary className="font-semibold cursor-pointer">Technical: raw paper status &amp; ticker</summary>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <pre className="text-xs overflow-auto max-h-64 text-muted-foreground">
              {JSON.stringify(status, null, 2)}
            </pre>
            <pre className="text-xs overflow-auto max-h-64 text-muted-foreground">
              {JSON.stringify(ticker, null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </DashboardLayout>
  )
}
