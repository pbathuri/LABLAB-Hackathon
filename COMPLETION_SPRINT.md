# Completion sprint — what was wired (code)

This complements the sprint prompt you used: **scaffold → working integration**.

For the **final E2E deploy / ERC-8004 / demo** checklist, see [`docs/FINAL_SHIP_CHECKLIST.md`](docs/FINAL_SHIP_CHECKLIST.md).

## Backend

1. **`GeminiFunctionExecutorService`** (`apps/backend/src/modules/agent/services/gemini-function-executor.service.ts`)  
   Central place for Gemini tool execution: `paper_buy`, `paper_sell`, `portfolio_status`, `check_risk`, `get_signals`, including **RiskRouter** checks when addresses are set.

2. **`POST /api/agent/instruct`** now **executes every function call** returned by Gemini and returns:
   - `reasoning`, `functionCalls`, `executionResults` (each: `name`, `args`, `result`), `raw`  
   Previously it only returned the Gemini JSON without running tools.

3. **`TradingLoopService`** uses the same executor (no duplicated switch).

4. **`GET /api/agent/performance`** includes **`totalTrades`** (count of `TradingCycleLog` rows).

5. **`GET /api/risk/context`** — returns `agentAddress`, `mockUsdc`, `mockWeth`, `riskRouterAddress`, `riskRouterConfigured` from env / derived wallet.

6. **`.env.example`** — `TRADING_LOOP_ENABLED`, `TRADING_LOOP_INIT_PAPER`.

7. **`scripts/demo.sh`** — health, Kraken paper, ticker, performance, risk context, identity, optional instruct (if `GEMINI_API_KEY` exported), **auth at `/auth/register` and `/auth/login`** (not `/api/auth/...`).

## Frontend

1. **`lib/api.ts`** — `tradingInstruct`, `krakenPaperStatus`, `krakenPaperHistory`, `krakenTicker`, `agentPerformance`, `agentCycles`, `identityStatus`, `riskContext`, `riskValidate`, `prismPrice`.

2. **`AgentChat`** — primary path calls **`api.tradingInstruct`** (real Gemini + Kraken/PRISM execution). Fallback to JWT `/agent/decide` only if instruct throws.

3. **`/dashboard/trading`** — paper **history**, **BTCUSD ticker**, performance, cycles (fixed default API port **3001**).

4. **`/dashboard/risk`** — loads **`/api/risk/context`** then **`/api/risk/validate`** with real addresses.

5. **`/dashboard/leaderboard`** — shows **`totalTrades`**.

6. **`/dashboard/identity`** — register URI + post sample feedback + status.

## You still do manually

1. **Fund wallets** on Base Sepolia (deployer + agent) from a faucet.  
2. **`cd contracts && npx hardhat run scripts/deploy-base-sepolia.ts --network base-sepolia`** — paste printed addresses into `.env`.  
3. **ERC-8004** — ensure registry addresses in `.env` match **Base Sepolia** deployments you trust; host a real **agent card JSON** and pass its HTTPS URL to register.  
4. **`TRADING_LOOP_ENABLED=true`** when you want the cron loop.  
5. **Kraken CLI** on PATH for paper trading (`kraken`).

## Diagnostic script

From repo root: **`npm run diagnose`** or **`bash scripts/diagnose.sh`**

Checks Node/npm, `.env` keys, workspace folders, `node_modules`, build artifacts, Hardhat artifacts, Kraken CLI (optional), and common ports. The script **`cd`s to the repo root** automatically from `scripts/diagnose.sh`.

## Correct URLs (common mistake in the prompt)

- Ticker: **`GET /api/kraken/ticker/BTCUSD`** (not `/api/kraken/market/ticker/...`).  
- Auth: **`POST /auth/register`**, **`POST /auth/login`**.
