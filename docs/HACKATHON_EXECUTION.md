# Hackathon execution checklist (human + verify)

**Do not commit secrets.** Complete these in order; credential rotation is blocking.

## RPC environment variable

- **Canonical:** `BASE_SEPOLIA_RPC` (used by Hardhat, contract scripts, and Nest after `main.ts` resolves it).
- **Alias:** `BASE_SEPOLIA_RPC_URL` is also read by the backend if `BASE_SEPOLIA_RPC` is empty ([`rpc.util.ts`](../apps/backend/src/common/rpc.util.ts)).

## Hour 0–1: Registration and credentials

1. **early.surge.xyz** — Register the project for prize eligibility (use organizer-provided access only; never paste passwords into the repo).
2. **lablab.ai** — Confirm team / project exists for submission.
3. **Rotate** any API key that appeared in chat exports or logs: Kraken, Gemini, PRISM, Alchemy, Pinata, WalletConnect, etc.
4. **Kraken read-only key** — For leaderboard verification if required: Query Funds + Query Open Orders & Trades only.
5. **`.env`** — Refresh keys; restart backend; smoke-test PRISM and Gemini.
6. **ERC-8004 registry** — From repo root:

   ```bash
   cd contracts && npm run verify:erc8004-registry
   ```

   Set `ERC8004_IDENTITY_REGISTRY` (and reputation registry if docs specify a pair) to addresses with **bytecode on Base Sepolia**.

## Hour 1–3: On-chain presence

1. Fund **deployer** and **agent** on Base Sepolia.
2. `npx hardhat run scripts/deploy-base-sepolia.ts --network base-sepolia`
3. Copy addresses into root `.env`; restart backend.
4. Host **agent card**: Pinata (`npm run upload:agent-card`) or raw GitHub URL to [`agent-card.json`](agent-card.json).
5. Register: `npm run register:erc8004 -- '<agentURI>'` or `POST /api/identity/register`.
6. Set `ERC8004_AGENT_ID` after registration; run `npm run post:reputation`.
7. **Shared Capital Sandbox** — See [CAPITAL_SANDBOX.md](CAPITAL_SANDBOX.md); integrate hackathon vault/router if required for leaderboard intents.
8. `TRADING_LOOP_ENABLED=true` (and `TRADING_LOOP_INIT_PAPER=true` as needed); confirm agent on **lablab** leaderboard.

## Submission assets

See [SUBMISSION_PACKAGE.md](SUBMISSION_PACKAGE.md) for long description template and field list (video, slides, cover, GitHub, demo URL, tags).

## Identity feedback API (`POST /api/identity/feedback`)

Body must match `FeedbackDto`: **`pnlPercent`**, **`sharpeRatio`**, **`maxDrawdownBps`**, **`winRate`** (numbers). Example:

```bash
curl -s -X POST http://localhost:3001/api/identity/feedback \
  -H "Content-Type: application/json" \
  -d '{"pnlPercent":2.5,"sharpeRatio":1.2,"maxDrawdownBps":800,"winRate":50}'
```

## On-chain agent URI after deploy

When the demo URL changes, push `docs/agent-card.json` and update the registry:

```bash
cd contracts && npm run set:agent-uri -- '<https://raw.githubusercontent.com/.../agent-card.json>'
# or: npm run set:agent-uri -- <agentId> '<uri>'
```

## Deploy demo (Vercel + Railway)

1. **Vercel:** Import GitHub repo; root directory **`apps/frontend`**; framework Next.js; env **`NEXT_PUBLIC_API_URL`** = public backend URL (no trailing slash issues — match your API host). Optional config: [`apps/frontend/vercel.json`](../apps/frontend/vercel.json).
2. **Railway / Render / Fly:** Deploy **`apps/backend`** (or Dockerfile); set all secrets from `.env.example`; **`USE_POSTGRES=false`**; **`FRONTEND_ORIGIN`** = `https://<your-app>.vercel.app` for CORS. Optional config: [`apps/backend/railway.json`](../apps/backend/railway.json).
3. Re-run **`set:agent-uri`** if the agent card URL changed.

## Hackathon intent CLI

```bash
cd contracts && npm run submit:hackathon-intent
# RECORD=1 npm run submit:hackathon-intent   # if wallet has AGENT_ROLE on sandbox router
```

## Demo curls

From repo root: `npm run demo-recording` (or `bash scripts/demo-recording.sh`). Also [`../scripts/demo.sh`](../scripts/demo.sh).
