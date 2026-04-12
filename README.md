# 🐱 Captain Whiskers

> **Trustless AI Agent & Quantum-Aware Treasury Management System**

**Full repository map (every app, folder, and source file explained, step-by-step setup for builders and tools with no prior context):** [**REPO_GUIDE.md**](./REPO_GUIDE.md)

**Standalone blueprint (no repo access required — developer intent, architecture, APIs, env, and phased rebuild from scratch):** [**STANDALONE_PROJECT_BLUEPRINT.md**](./STANDALONE_PROJECT_BLUEPRINT.md)

**LabLab / hackathon submission (checklists, sandbox notes, copy for the form):** [HACKATHON_EXECUTION.md](./docs/HACKATHON_EXECUTION.md) · [SUBMISSION_PACKAGE.md](./docs/SUBMISSION_PACKAGE.md) · [CAPITAL_SANDBOX.md](./docs/CAPITAL_SANDBOX.md). Contract helpers: `cd contracts && npm run verify:erc8004-registry` · `npm run post:reputation` · `npm run set:agent-uri` · `npm run submit:hackathon-intent` · `npm run upload:agent-card`. Demo curls: `npm run demo-recording`.

## Deployed contracts (Base Sepolia) — fill after `deploy-base-sepolia`

| Contract | Address |
|----------|---------|
| MockUSDC | _set in `.env`_ |
| MockWETH | _set in `.env`_ |
| RiskRouter | _set in `.env`_ |
| CapitalVault | _set in `.env`_ |

Explorer: [Base Sepolia](https://sepolia.basescan.org). ERC-8004 agent: set `ERC8004_AGENT_ID` then view on [8004agents.ai/base](https://8004agents.ai/base).

Built for the **LabLab AI Trading Agents Hackathon** (ERC-8004 + optional Kraken tracks) on **Base Sepolia** — autonomous trading with on-chain identity, RiskRouter limits, and Gemini-driven execution. _Arc × Circle_ references in older docs refer to an earlier program; this repo targets the current LabLab / Surge submission path.

![Captain Whiskers Banner](./docs/banner.png)

## 🌟 Features

### 🧠 AI-Powered Treasury Management

- **Gemini Integration**: Natural language instructions processed by Gemini Flash/Pro models
- **Function Calling**: Automated trade execution based on user intents
- **Explainable AI**: Captain Whiskers mascot explains every decision

### ⚛️ Quantum Computing

- **VQE Portfolio Optimization**: Variational Quantum Eigensolver for Markowitz portfolio optimization
- **Qiskit Integration**: Ready for real quantum hardware deployment
- **QRNG**: Quantum random number generation for cryptographic nonces

### 🔐 Post-Quantum Security

- **CRYSTALS-Dilithium**: Lattice-based signatures resistant to quantum attacks
- **EIP-712 Signing**: Post-quantum signatures for x402 micropayments
- **Secure Key Management**: Quantum-safe key generation and storage

### 🛡️ Byzantine Fault Tolerant Verification

- **11-Node Consensus**: Tolerates up to 3 Byzantine (malicious) nodes
- **7 Required Signatures**: 2f + 1 threshold for transaction approval
- **On-Chain Logging**: All verifications recorded on Arc blockchain

### 💳 x402 Micropayments

- **Pay-per-Call**: Automatic payment for API/data access
- **Pay-on-Success**: Escrow-based payments released on completion
- **Bundle Payments**: Aggregate micropayments for efficiency
- **Reliability Scoring**: Provider selection based on success rate and latency

### 📊 Smart Policy Enforcement

- **Per-Transaction Limits**: Customizable spending caps
- **Daily Spending Caps**: Budget management
- **Cooldown Periods**: Rate limiting between trades
- **Price Deviation Guards**: Protection against manipulation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Captain Whiskers                              │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14)                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Dashboard │ │AI Chat   │ │Quantum   │ │Verifier  │               │
│  │          │ │Interface │ │Insights  │ │Monitor   │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│  Backend (NestJS)                        Quantum Service (Python)   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Agent     │ │Wallet    │ │Policy    │ │VQE       │               │
│  │Module    │ │Module    │ │Module    │ │Optimizer │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │Micropay  │ │Verify    │ │Reliab.   │ │QRNG      │               │
│  │Module    │ │Module    │ │Module    │ │Service   │               │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘               │
├─────────────────────────────────────────────────────────────────────┤
│  Smart Contracts (Solidity)                                         │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       │
│  │CaptainWhiskers  │ │BFTVerification  │ │X402Escrow       │       │
│  │Treasury         │ │                 │ │                 │       │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                    Arc Blockchain (USDC Settlement)                  │
└─────────────────────────────────────────────────────────────────────┘
```

## 📚 Documentation

- **[DEPLOYMENT FOLDER](./deployment/)** - All deployment configuration and documentation
- **[deployment/README.md](./deployment/README.md)** - Deployment quick start guide
- **[deployment/DEPLOYMENT.md](./deployment/DEPLOYMENT.md)** - Detailed deployment instructions
- **[deployment/HOSTING_GUIDE.md](./deployment/HOSTING_GUIDE.md)** - Platform-specific hosting guides
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing instructions
- **[TRANSACTION_WORKFLOW.md](./TRANSACTION_WORKFLOW.md)** - Transaction flow documentation
- **[CIRCLE_TECH_DEEPDIVE.md](./CIRCLE_TECH_DEEPDIVE.md)** - Circle integration details

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.10+
- PostgreSQL 15+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-team/captain-whiskers.git
cd captain-whiskers

# Install dependencies
pnpm install

# Setup environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Setup Python environment for quantum service
cd apps/quantum-service
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cd ../..

# Start PostgreSQL and run migrations
cd deployment
docker-compose up -d postgres
cd ..
pnpm db:migrate

# Start all services (from deployment folder)
cd deployment
./start-dev.sh
```

### Environment Variables

#### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=captain_whiskers

# Gemini AI
GEMINI_API_KEY=your-key

# Arc Blockchain
ARC_TESTNET_RPC=https://testnet-rpc.arc.dev
PRIVATE_KEY=your-key

# Smart Contracts (after deployment)
TREASURY_ADDRESS=0x...
BFT_VERIFICATION_ADDRESS=0x...
```

### Deploying Smart Contracts

```bash
cd contracts

# Install dependencies
npm install

# Compile
npx hardhat compile

# Deploy to Arc testnet
npx hardhat run scripts/deploy.ts --network arc-testnet
```

## 📖 API Documentation

### Agent Endpoints

```
POST /api/agent/instruct
Body: { "instruction": "Buy 100 USDC worth of ETH" }

GET /api/agent/status
Returns current agent state and pending decisions
```

### Quantum Endpoints

```
POST /quantum/optimize-portfolio
Body: { "assets": [...], "expected_returns": [...], "covariance_matrix": [...] }

POST /quantum/random
Body: { "count": 10, "min_value": 0, "max_value": 255 }
```

### Verification Endpoints

```
POST /api/verification/request
Body: { "type": "TRANSFER", "amount": 50, "recipient": "0x..." }

GET /api/verification/status/:verificationId
Returns BFT consensus status
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Backend tests
pnpm --filter @captain-whiskers/backend test

# Contract tests
cd contracts && npx hardhat test

# Quantum tests
cd apps/quantum-service && pytest
```

## 🎥 Demo

Watch our 5-minute demo showcasing:

1. Policy configuration through the UI
2. Natural language trading instructions
3. BFT verification in action
4. Quantum portfolio optimization
5. On-chain settlement on Arc (ArcScan link)

[Watch Demo Video](https://youtube.com/...)

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 19, Tailwind, Framer Motion |
| Backend | NestJS, TypeScript, PostgreSQL, TypeORM |
| Quantum | Python, Qiskit, FastAPI |
| Blockchain | Solidity 0.8.x, Hardhat, ethers.js |
| AI | Gemini Flash/Pro (via Google AI SDK) |
| Security | CRYSTALS-Dilithium, JWT, RBAC |

## 📚 References

- [PBFT Paper](https://pmg.csail.mit.edu/papers/osdi99.pdf) - Castro & Liskov (1999)
- [VQE Algorithm](https://arxiv.org/abs/1304.3061) - Peruzzo et al.
- [CRYSTALS-Dilithium](https://pq-crystals.org/dilithium/) - NIST PQC Standard
- [EIP-712](https://eips.ethereum.org/EIPS/eip-712) - Typed Structured Data
- [Markowitz Portfolio Theory](https://www.jstor.org/stable/2975974) - 1952

## 👥 Team

- **Lead Developer** - Full-stack implementation
- Built for Arc × Circle Hackathon 2026

## 📄 License

MIT License - See [LICENSE](./LICENSE)

---

**🐱 Meow! Happy Trading with Captain Whiskers!**

_Built with ❤️ for the Arc × Circle Hackathon_
