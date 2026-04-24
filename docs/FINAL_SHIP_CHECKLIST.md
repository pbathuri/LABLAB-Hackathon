# Captain Whiskers V2 - Final ship checklist

Use this with `COMPLETION_SPRINT.md` and `SUBMISSION_CHECKLIST.md`. **Correct API routes** (no `/api` on auth):

| Area | Routes |
|------|--------|
| Auth | `POST /auth/register`, `POST /auth/login` |
| Kraken | `GET /api/kraken/ticker/:pair`, `POST /api/kraken/paper/init`, `buy`, `sell`, `GET paper/status`, `GET paper/history` |
| Agent | `POST /api/agent/instruct`, `GET performance`, `GET cycles` |
| PRISM | `GET /api/prism/price/:symbol`, `signals`, `risk` |
| Identity | `POST /api/identity/register`, `POST feedback`, `GET status` |
| Risk | `GET /api/risk/context`, `POST validate` |
| Docs | `GET /api` (Swagger) |

## Task 1 - Validate pipeline (curl)

From repo root with backend on `PORT=3001`:

1. `curl -s http://localhost:3001/ | head -20`
2. Paper init: `curl -s -X POST http://localhost:3001/api/kraken/paper/init -H "Content-Type: application/json" -d '{"balance":10000}'`
3. Ticker: `curl -s http://localhost:3001/api/kraken/ticker/BTCUSD`
4. Buy / status as in README or `scripts/demo.sh`
5. PRISM: needs `PRISM_API_KEY` (`prism_sk_...`)
6. **Critical:** `POST /api/agent/instruct` with `GEMINI_API_KEY` - expect `reasoning`, `functionCalls`, `executionResults` (each item: `name`, `args`, `result`)
7. `GET /api/risk/context`, `GET /api/identity/status`

If `kraken` is not found by the backend, ensure the binary is on `PATH` (e.g. `~/.cargo/bin`) or set `PATH` in `.env` for the process that starts the backend.

## Task 2 - Contracts (Base Sepolia)

Verify registry bytecode on Base Sepolia before registering:

```bash
cd contracts && npm run verify:erc8004-registry
```

```bash
cd contracts && npx hardhat compile && npx hardhat test
npx hardhat run scripts/deploy-base-sepolia.ts --network base-sepolia
```

Copy addresses into root `.env`: `MOCK_USDC_ADDRESS`, `MOCK_WETH_ADDRESS`, `RISK_ROUTER_ADDRESS`, `CAPITAL_VAULT_ADDRESS`. Restart backend.

## Task 3 - ERC-8004

1. Host `docs/agent-card.json` (e.g. raw GitHub URL or jsonblob).
2. `POST /api/identity/register` with `{ "agentURI": "https://..." }` - response includes `agentId` and `txHash` when a new registration is mined.
3. `POST /api/identity/feedback` with **`pnlPercent`**, **`sharpeRatio`**, **`maxDrawdownBps`**, **`winRate`** (all numbers). Example:

   ```bash
   curl -s -X POST http://localhost:3001/api/identity/feedback \
     -H "Content-Type: application/json" \
     -d '{"pnlPercent":1.5,"sharpeRatio":0.8,"maxDrawdownBps":500,"winRate":50}'
   ```

   `GET /api/identity/status` should show `registered: true` after registration.

Alternative: `cd contracts && npm run register:erc8004 -- 'https://.../agent-card.json'`

## Task 4 - Trading loop

`.env`: `TRADING_LOOP_ENABLED=true`, `TRADING_LOOP_INIT_PAPER=true`. Restart backend; check `performance`, `cycles`, `paper/history`.

## Task 5 - Frontend

`NEXT_PUBLIC_API_URL=http://localhost:3001`. Smoke: `/`, `/dashboard`, `/dashboard/trading`, `/dashboard/chat`, `/dashboard/identity`, `/dashboard/leaderboard`, `/dashboard/risk`.

## Quick demo curls

See `scripts/demo.sh` or the “Quick reference” block in `COMPLETION_SPRINT.md`.
