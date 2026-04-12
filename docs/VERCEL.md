# Deploy Captain Whiskers on Vercel

Use **two Vercel projects** (one Next.js app, one Nest API). Connect the same Git repository to both and set **different Root Directories**.

## 1. Backend API (`apps/backend`)

1. **New Project** → import repo → **Root Directory**: `captain-whiskers/apps/backend` (adjust if your repo root differs).
2. **Framework Preset**: Other (Vercel will use `vercel.json`).
3. **Environment variables** (Production + Preview as needed):

| Variable | Required | Notes |
|----------|----------|--------|
| `USE_POSTGRES` | Yes | `true` — SQLite / `better-sqlite3` is not supported on Vercel. |
| `DATABASE_URL` | Yes | Neon, Supabase, or other Postgres (SSL). |
| `GEMINI_API_KEY` | For AI | |
| `PRISM_API_KEY` | For signals | |
| `FRONTEND_URL` | Yes | Your frontend origin(s), comma-separated, e.g. `https://captain-whiskers.vercel.app,https://captain-whiskers-xxx.vercel.app` |
| `ALLOW_VERCEL_PREVIEW_ORIGINS` | Optional | Set to `true` to allow any `*.vercel.app` origin (convenient for previews; less strict). |
| `CRON_SECRET` | For cron | Random string; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when this is set. |
| `TRADING_LOOP_ENABLED` | Optional | `true` to run cycles from cron. |
| `TRADING_LOOP_INIT_PAPER` | Optional | `true` (default) seeds paper ledger. |
| On-chain / hackathon vars | As needed | `AGENT_PRIVATE_KEY`, `SEPOLIA_RPC_URL`, `HACKATHON_AGENT_ID`, `BASE_SEPOLIA_RPC`, routers, etc. (see `.env.example`). |

Vercel sets `VERCEL=1` automatically. That enables **Kraken public REST** (no CLI) and **persisted paper portfolio** in Postgres.

4. **Cron**: `vercel.json` schedules `GET /agent/cron/trading-tick` **once daily** (14:00 UTC) so **Hobby** plans can deploy; Vercel Pro allows more frequent schedules (e.g. every 5 minutes). Configure `CRON_SECRET` in the project; without it the handler returns 503.

5. **First deploy**: Open the deployment URL and hit `GET /` for health. Try `GET /api/kraken/ticker/BTCUSD`.

## 2. Frontend (`apps/frontend`)

1. **New Project** → **Root Directory**: `captain-whiskers/apps/frontend`.
2. **Framework**: Next.js (auto-detected).
3. **Environment variables**:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.vercel.app` (no trailing slash) |
| `NEXT_PUBLIC_QUANTUM_API_URL` | Public quantum service URL if you host one |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | From [WalletConnect Cloud](https://cloud.walletconnect.com/) |
| Other `NEXT_PUBLIC_*` | Per `.env.example` |

`next.config.js` loads the repo-root `.env` **only on your machine**; on Vercel you must set variables in the project settings.

4. **CORS**: Backend `FRONTEND_URL` must include the exact frontend origin (or enable `ALLOW_VERCEL_PREVIEW_ORIGINS=true` for previews).

## 3. Limitations on Vercel

- **Kraken CLI** is not available; market data uses **Kraken public REST**. Paper trading uses the **Postgres-backed** ledger when `VERCEL=1`.
- **Quantum** service must be reachable at a **public HTTPS** URL (not `localhost`).
- **Long-lived WebSockets / SSE** and very long requests are constrained by **function `maxDuration`** (see `vercel.json`).

## 4. Path routing

Requests to the API project hit `api/[[...all]].ts`. Paths under `kraken`, `hackathon`, `risk`, `identity`, `prism`, and public `api/agent` routes are rewritten to match Nest `@Controller('api/...')` (see `api/vercel-path.ts`). Cron stays on `/agent/cron/...`.
