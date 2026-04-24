# Captain Whiskers - Repository guide (full context)

This document is written for **any reader or automated assistant with no prior context**: what the repo is, how it is organized, how to run it step by step, and **what each important file and folder is for**. Generated artifacts (`node_modules`, `.next`, Hardhat `artifacts`/`cache`/`typechain-types`, etc.) are summarized once-not enumerated file-by-file.

---

## 1. What this repository is

**Captain Whiskers** is a **monorepo** for an **agentic commerce / treasury** demo:

- **Frontend:** Next.js 14 (App Router), dashboard UI, wallet connect, charts.
- **Backend:** NestJS REST API - agent decisions, Kraken market/paper trading CLI integration, PRISM market data, Gemini instructions, ERC-8004 identity hooks, optional on-chain risk router, scheduled trading loop.
- **Quantum service (optional):** Python FastAPI - portfolio optimization, QRNG, Dilithium-related helpers (used when `QUANTUM_SERVICE_URL` points to it).
- **Smart contracts:** Hardhat + Solidity - treasury, BFT verification, x402 escrow, mocks, risk router, capital vault (deploy to Base Sepolia or other configured networks).

**Primary working tree:** everything under `apps/backend`, `apps/frontend`, `apps/quantum-service`, `contracts`, `packages/shared`, `deployment`, `scripts`.

**Secondary / legacy:** `apps/compress/` is a **large archived snapshot** (duplicate backend, old `Front/` frontend, extra Quantum Service). It is **not** part of the default npm workspaces build; treat it as reference or backup unless you intentionally migrate from it.

---

## 2. Prerequisites

| Tool | Role |
|------|------|
| **Node.js ≥ 20** | Required for backend, frontend, Hardhat. |
| **npm 10+** | Workspace manager (`packageManager` in root `package.json`). |
| **Python 3.10+** (optional) | `apps/quantum-service` if you run it locally. |
| **Docker** (optional) | `deployment/docker-compose.yml` for Postgres, Redis, full stack. |
| **Kraken CLI** (optional) | Paper trading and live CLI flows (`kraken` on PATH). |

---

## 3. Clone and install (step-by-step)

1. **Clone** the repository and `cd` into `captain-whiskers` (the folder that contains root `package.json`).

2. **Install dependencies** (hoists workspaces):

   ```bash
   npm install
   ```

3. **Environment:** copy `.env.example` → `.env` at **repo root** (`captain-whiskers/.env`). The backend resolves env from `apps/backend`, parent folders, and repo root (see `ConfigModule` in `apps/backend/src/app.module.ts`).

4. **Run backend** (from repo root):

   ```bash
   npm run dev:backend
   ```

   Or: `cd apps/backend && npm run dev` (or `npm run start:dev`).

5. **Run frontend** (from repo root):

   ```bash
   npm run dev:frontend
   ```

   If Next.js chunks misbehave: `npm run dev:frontend:clean` (see `apps/frontend/scripts/clean-next.sh`).

6. **Optional - quantum service:**

   ```bash
   cd apps/quantum-service
   pip install -r requirements.txt   # or requirements-minimal.txt
   npm run dev
   ```

   Default URL in `.env.example`: `http://localhost:8000`.

7. **Optional - contracts:** `cd contracts && npm install && npx hardhat compile`. Deploy scripts live in `contracts/scripts/`.

**URLs (typical):**

- API: `http://localhost:3001` - Swagger at `/api`
- UI: `http://localhost:3000`
- Quantum: `http://localhost:8000`

---

## 4. Root-level files and folders

| Path | Purpose |
|------|---------|
| `package.json` | Monorepo workspaces, scripts (`dev`, `dev:frontend`, `dev:backend`, `build`, `test`). |
| `package-lock.json` | Locked dependency tree. |
| `turbo.json` | Turborepo task config (`build`, `dev`, `lint`, `test`). |
| `.env` / `.env.example` | **Secrets and config** (gitignored: `.env`). Copy example and fill API keys, RPC, keys. |
| `.gitignore` | Ignores `node_modules`, `.env`, `.next`, Hardhat outputs, etc. |
| `.dockerignore` | Docker build context exclusions. |
| `README.md` | Product/architecture overview and quick links. |
| **`REPO_GUIDE.md`** | **This file** - full repo map for builders and tools. |
| `SUBMISSION_CHECKLIST.md` | Hackathon submission checklist. |
| `TESTING_GUIDE.md` | Testing notes. |
| `TRANSACTION_WORKFLOW.md` | Transaction flow documentation. |
| `CIRCLE_TECH_DEEPDIVE.md` | Circle-related technical notes. |
| `scripts/demo.sh` | Curl-based smoke demo against `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`). |
| `deployment/` | Docker Compose, Railway notes, env templates, helper shell scripts - see §10. |
| `contracts/` | Hardhat project - see §8. |
| `packages/shared/` | Shared TS constants - see §9. |
| `apps/backend/` | NestJS API - see §5. |
| `apps/frontend/` | Next.js UI - see §6. |
| `apps/quantum-service/` | Python service - see §7. |
| `apps/compress/` | **Legacy/archive tree** - duplicate apps; not primary. |

Binary/media at root (e.g. `.pdf`, `.mp4`, `.zip`) are **documentation or presentation assets**; they are not required to compile code.

---

## 5. `apps/backend` - NestJS API

### 5.1 Entry and app shell

| File | Purpose |
|------|---------|
| `src/main.ts` | Bootstraps Nest, CORS, validation pipe, Swagger; calls `applyResolvedBaseSepoliaRpc()` before app create (`src/common/rpc.util.ts`). |
| `src/app.module.ts` | Registers `ConfigModule`, `TypeORM` (Postgres if `USE_POSTGRES=true`, else **better-sqlite3 in-memory**), `ScheduleModule`, and feature modules listed below. **Does not import** `MicropaymentModule` / `CircleModule` (those folders exist but are not wired here). |
| `src/app.controller.ts` | Root HTTP routes. |
| `src/app.service.ts` | Root service. |

### 5.2 Shared utilities

| File | Purpose |
|------|---------|
| `src/common/eth-key.util.ts` | `isValidHexPrivateKey()` - validates Ethereum hex private keys (not Base64/API secrets). |
| `src/common/rpc.util.ts` | Resolves Base Sepolia RPC: explicit `BASE_SEPOLIA_RPC`, else `ALCHEMY_API_KEY` → Alchemy URL, else public `https://sepolia.base.org`. |

### 5.3 Modules (feature folders)

Each module typically contains `*.module.ts`, `*.controller.ts`, `*.service.ts`, and sometimes `entities/`, `dto/`, `strategies/`.

| Module path | Role |
|-------------|------|
| `modules/agent/` | Agent decisions, Gemini trading, **trading loop** (`trading-loop.service.ts`), performance, `/agent` and `/api/agent/instruct` (see `agent-instruct.controller.ts`). Entities: `agent-decision`, `trading-cycle-log`. |
| `modules/auth/` | Register/login, JWT, `user.entity.ts`, `jwt.strategy.ts`, `auth.dto.ts`. |
| `modules/wallet/` | Wallet CRUD, balances, transactions. |
| `modules/quantum/` | HTTP proxy/helpers toward quantum service; `post-quantum-crypto.service.ts`, `qrng.service.ts`. |
| `modules/verification/` | Byzantine-style verification simulation, verifier nodes, logs. |
| `modules/policy/` | Policy config entity and enforcement service. |
| `modules/reliability/` | Provider reliability scoring. |
| `modules/kraken/` | **Kraken CLI** wrapper (`kraken-cli.service.ts`), paper trading, market data, REST under `/api/kraken/...`. Tests: `kraken-cli.service.spec.ts`. DTO: `dto/paper-trade.dto.ts`. |
| `modules/prism/` | PRISM API integration for prices/signals/risk. |
| `modules/erc8004/` | ERC-8004 identity/reputation on Base Sepolia, `agent-identity.entity.ts`, register/status APIs. |
| `modules/risk/` | On-chain risk validation when `RISK_ROUTER_ADDRESS` is set. |
| `modules/aerodrome/` | Aerodrome router/factory references for swaps (config-driven). |
| `modules/circle/` | Circle gateway entities/services - **module exists; not imported in `AppModule`**. |
| `modules/micropayment/` | x402-style payment requests - **module exists; not imported in `AppModule`**. |

### 5.4 Tests and config

| Path | Purpose |
|------|---------|
| `test/policy.service.spec.ts` | Unit tests for policy service. |
| `test/verification.service.spec.ts` | Unit tests for verification service. |
| `jest.config.js` | Jest configuration. |
| `nest-cli.json` | Nest CLI. |
| `tsconfig.json` | TypeScript compiler options. |
| `Dockerfile` | Container image for backend. |
| `nixpacks.toml` / `railway.json` | Railway deployment metadata. |
| `start.sh` | Optional start script for containers. |

### 5.5 Build output

| Path | Purpose |
|------|---------|
| `dist/` | **Compiled JavaScript** after `nest build` - do not edit; regenerate from source. |

---

## 6. `apps/frontend` - Next.js 14 (App Router)

### 6.1 Config and tooling

| File | Purpose |
|------|---------|
| `package.json` | Scripts: `dev`, `dev:clean`, `dev:host`, `clean:next`, `build`, `start`, `lint`. |
| `next.config.js` | Images, headers, webpack aliases/fallbacks, dev `chunkLoadTimeout`. |
| `tsconfig.json` | TypeScript paths (e.g. `@/`). |
| `tailwind.config.ts` | Tailwind theme and content paths. |
| `postcss.config.js` | PostCSS for Tailwind. |
| `next-env.d.ts` | Next.js type references. |
| `.eslintrc.json` | ESLint. |
| `vercel.json` | Vercel deployment. |
| `.env.local` | Local overrides for `NEXT_PUBLIC_*` (gitignored by parent rules). |
| `scripts/clean-next.sh` | Safe removal of `.next` when permissions/xattrs break `rm -rf`. |

### 6.2 App routes (`src/app/`)

| Path | Purpose |
|------|---------|
| `layout.tsx` | Root layout, fonts, `Providers`, metadata. |
| `globals.css` | Global styles. |
| `page.tsx` | Landing / home. |
| `docs/page.tsx` | Docs page. |
| `dashboard/page.tsx` | Main dashboard. |
| `dashboard/chat/page.tsx` | Agent chat UI. |
| `dashboard/wallet/page.tsx` | Wallet UI. |
| `dashboard/quantum/page.tsx` | Quantum insights. |
| `dashboard/verification/page.tsx` | Verification status. |
| `dashboard/history/page.tsx` | History. |
| `dashboard/settings/page.tsx` | Settings. |
| `dashboard/circle/page.tsx` | Circle-related dashboard (if used). |
| `dashboard/identity/page.tsx` | ERC-8004 identity. |
| `dashboard/trading/page.tsx` | Trading view. |
| `dashboard/risk/page.tsx` | Risk view. |
| `dashboard/leaderboard/page.tsx` | Leaderboard. |

### 6.3 Components and libs

| Path | Purpose |
|------|---------|
| `components/providers.tsx` | React Query, wagmi/Web3Modal providers. |
| `components/layout/DashboardLayout.tsx` | Dashboard shell. |
| `components/auth/AuthPage.tsx` / `WalletConnectModal.tsx` | Auth and wallet connect. |
| `components/dashboard/*` | Agent chat, portfolio, transactions, verification, quantum insights. |
| `components/mascot/CaptainWhiskersMascot.tsx` | Mascot UI. |
| `components/onboarding/OnboardingFlow.tsx` | Onboarding. |
| `components/mobile/MobileNav.tsx` | Mobile navigation. |
| `components/modals/*` | Help, notifications. |
| `components/transactions/*` | Transaction modals. |
| `components/effects/QuantumOrb.tsx` | Visual effect. |
| `components/index.ts` | Barrel exports. |
| `contexts/WalletContext.tsx` | Wallet context. |
| `lib/api.ts` | API client helpers. |

### 6.4 Build artifact

| Path | Purpose |
|------|---------|
| `.next/` | **Next.js build cache** - safe to delete (`npm run clean:next` or `clean-next.sh`). |

---

## 7. `apps/quantum-service` - Python FastAPI

| File | Purpose |
|------|---------|
| `main.py` | FastAPI app entry, routes for optimization / health. |
| `requirements.txt` / `requirements-minimal.txt` | Python dependencies. |
| `quantum/portfolio_optimizer.py` | Portfolio optimization logic. |
| `quantum/qrng_service.py` | QRNG helpers. |
| `crypto/dilithium_service.py` | Post-quantum signing helpers (Dilithium-oriented). |
| `rl/trading_agent.py` | RL-style trading agent experiment. |
| `tests/test_portfolio_optimizer.py` | Tests. |
| `Dockerfile` | If present - container image for this service. |

---

## 8. `contracts/` - Hardhat + Solidity

### 8.1 Source contracts (`src/`)

| File | Purpose |
|------|---------|
| `CaptainWhiskersTreasury.sol` | Treasury logic. |
| `BFTVerification.sol` | Byzantine fault tolerant verification on-chain. |
| `X402Escrow.sol` | Escrow for x402-style flows. |
| `MockUSDC.sol` / `MockWETH.sol` | Test tokens. |
| `RiskRouter.sol` | On-chain risk checks. |
| `CapitalVault.sol` | Capital vault. |

### 8.2 Tooling

| File | Purpose |
|------|---------|
| `hardhat.config.ts` | Networks (hardhat, `base-sepolia`, Arc testnet/mainnet), Solidity 0.8.24, loads parent `../.env`. RPC resolution matches backend pattern for Base Sepolia. |
| `scripts/deploy.ts` | Generic deploy script. |
| `scripts/deploy-base-sepolia.ts` | Base Sepolia deployment. |
| `test/*.test.ts` | Hardhat tests. |
| `package.json` | Hardhat dependencies and scripts. |
| `tsconfig.json` | TypeScript for scripts/tests. |

### 8.3 Generated (do not hand-edit)

| Path | Purpose |
|------|---------|
| `artifacts/` | Compiled contract artifacts. |
| `cache/` | Hardhat cache. |
| `typechain-types/` | Generated TypeScript bindings for contracts. |

Regenerate with `npx hardhat compile`.

---

## 9. `packages/shared`

| File | Purpose |
|------|---------|
| `package.json` | Shared package name and build. |
| `tsconfig.json` | TS config. |
| `src/index.ts` | Exports e.g. `BASE_SEPOLIA_CHAIN_ID`, `DEFAULT_ERC8004` registry addresses. |

---

## 10. `deployment/`

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Postgres, Redis, backend, quantum, frontend images (ports 4001/4002 etc. mapped). |
| `docker-start.sh` / `start-dev.sh` / `stop-dev.sh` | Helper scripts. |
| `deploy-railway.sh` | Railway deploy helper. |
| `railway.json` | Railway config. |
| `README.md`, `DEPLOYMENT.md`, `HOSTING_GUIDE.md`, `ENV_TEMPLATE.md`, `PATHS_REFERENCE.md`, etc. | Hosting and env documentation. |
| Various `RAILWAY_*.md`, `DATABASE_*.md` | Troubleshooting notes for Railway/database. |

---

## 11. `scripts/`

| File | Purpose |
|------|---------|
| `demo.sh` | Curl smoke tests against running API (paper Kraken, ticker, agent performance). |

---

## 12. `apps/compress/` (legacy / archive)

This tree is **large** and **duplicates** a backend, a nested `frontend/Front/` Next app, and a **Quantum Service** subfolder. It is **not** referenced by root `package.json` workspaces.

**Use it only if** you are recovering old assets or comparing with the current `apps/backend` + `apps/frontend` + `apps/quantum-service`.

Do **not** treat paths in `apps/compress/` as the source of truth for the current V2 build.

---

## 13. Environment variables (conceptual map)

Consult **`.env.example`** for the full list. Key groups:

| Group | Examples |
|-------|----------|
| Kraken | `KRAKEN_API_KEY`, `KRAKEN_API_SECRET` |
| AI | `GEMINI_API_KEY` |
| PRISM | `PRISM_API_KEY` |
| Base Sepolia | `BASE_SEPOLIA_RPC`, `ALCHEMY_API_KEY`, `BASE_SEPOLIA_CHAIN_ID`, `DEPLOYER_PRIVATE_KEY`, `AGENT_PRIVATE_KEY`, contract addresses |
| ERC-8004 | `ERC8004_IDENTITY_REGISTRY`, `ERC8004_REPUTATION_REGISTRY` |
| Database | `DATABASE_URL`, `USE_POSTGRES` |
| App | `PORT`, `FRONTEND_URL`, `JWT_SECRET` |
| Quantum | `QUANTUM_SERVICE_URL` |
| Frontend (public) | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_QUANTUM_API_URL`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` |

**Never commit** real `.env` files with secrets.

---

## 14. How a new contributor should “build from scratch”

1. Read **`README.md`** (vision) and this **`REPO_GUIDE.md`** (structure).
2. `npm install` at repo root.
3. Copy `.env.example` → `.env` and fill keys for the features you need (minimum: often enough to run UI + API in demo DB mode).
4. Start **backend**, then **frontend**; add **quantum-service** if needed.
5. Run **`scripts/demo.sh`** with backend up to verify API paths.
6. For on-chain work: `cd contracts`, compile, deploy with env keys and document addresses in `.env`.

---

## 15. Related documentation files

| File | Content |
|------|---------|
| `README.md` | Features, architecture diagram, quick links. |
| `SUBMISSION_CHECKLIST.md` | Submission readiness. |
| `TESTING_GUIDE.md` | Testing guidance. |
| `TRANSACTION_WORKFLOW.md` | Transaction flow. |
| `deployment/README.md` | Deployment entry point. |

---

*End of repository guide. For generated trees (`node_modules`, `.next`, `dist`, Hardhat `artifacts`/`cache`/`typechain-types`), rely on build commands rather than editing files on disk.*
