# Hackathon Capital Sandbox (shared infrastructure)

Leaderboards may show **claimed sandbox ETH** and **trade intents** tied to an **organizer-provided** vault and risk router, not only this repo’s `RiskRouter` / `CapitalVault` from [`deploy-base-sepolia.ts`](../contracts/scripts/deploy-base-sepolia.ts).

## Environment variables

Use these names consistently in `.env` (see root `.env.example`):

| Variable | Purpose |
|----------|---------|
| `HACKATHON_RISK_ROUTER` | Shared sandbox **RiskRouter** - backend validates and records paper trades here when set (`RiskService` + `GeminiFunctionExecutorService`). |
| `HACKATHON_CAPITAL_VAULT` | Shared **ERC-4626** vault (reference for ops / future wiring; not required for current executor path). |

Legacy aliases like `HACKATHON_VAULT_ADDRESS` / `HACKATHON_RISK_ROUTER_ADDRESS` should be migrated to the names above to match the code.

## What to do

1. Check **early.surge.xyz**, **lablab.ai** hackathon pages, and **Discord** for:
   - Contract addresses for the shared sandbox on **Base Sepolia**
   - Steps to **claim** test capital (e.g. 0.001 ETH)
   - How **trade intents** are recorded for scoring (subgraph, API, or specific contract calls)

2. Add `HACKATHON_RISK_ROUTER` to `.env`. The backend calls **`validateIntent`** and **`recordTradeExecution`** on it using the same ABI as [`RiskRouter.sol`](../contracts/src/RiskRouter.sol). If the sandbox contract differs, update the ABI in [`risk.service.ts`](../apps/backend/src/modules/risk/risk.service.ts) or ask organizers for the correct interface.

3. **CLI fallback:** `cd contracts && npm run submit:hackathon-intent` (set `RECORD=1` to attempt `recordTradeExecution`; requires `AGENT_ROLE` on the sandbox router).

4. Until confirmed, treat the **custom** contracts as your **sandbox demo** and keep this document updated with links once organizers publish them.
