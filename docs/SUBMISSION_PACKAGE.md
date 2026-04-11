# LabLab / hackathon submission package

Use this text and checklist when filling the submission form. Replace bracketed items with your real links (no secrets).

## Long description (100+ words)

Captain Whiskers V2 is an autonomous trading agent that combines **Kraken CLI** execution (paper and live-capable), **Gemini** tool-calling for natural-language instructions, **PRISM** market intelligence, and **on-chain** risk and identity on **Base Sepolia**. The stack uses a NestJS backend and Next.js dashboard: users can chat with the agent, inspect paper portfolios and tickers, review ERC-8004 registration status, and see risk context wired to a **RiskRouter** and **ERC-4626** capital vault for sandbox accounting. The design emphasizes a layered defense—model constraints, off-chain validation, and on-chain limits—so demos stay safe on testnet while remaining extensible to production controls. The project targets combined hackathon tracks that reward real market connectivity, verifiable agent identity (EIP-8004), and clear presentation of architecture and live behavior.

## Checklist

- [ ] **Surge (early.surge.xyz)** — project registered for prize eligibility; sandbox addresses in `.env`
- [ ] **Multisig** — team wallet for Surge / Streamflow distribution per organizer rules
- [ ] **Public GitHub** — `.env` not committed; README with setup
- [ ] **Demo URL** — deployed or tunnel to Next.js + API
- [ ] **Video** — under 5 minutes, under 300MB; landing → chat → trading → identity → BaseScan / leaderboard
- [ ] **Cover image** — 16:9
- [ ] **Slide deck** — problem, solution, architecture, demo screenshot, stack
- [ ] **Technology tags** — e.g. Next.js, NestJS, Base, ERC-8004, Kraken, Gemini
- [ ] **Social** — post tagging organizers per rules (e.g. @krakenfx @lablabai @Surgexyz_)

## BaseScan

Replace with your deployed addresses:

- Agent wallet: `https://sepolia.basescan.org/address/<AGENT_ADDRESS>`
- Identity registry: `https://sepolia.basescan.org/address/<REGISTRY_ADDRESS>`
