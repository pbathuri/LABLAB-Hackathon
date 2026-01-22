# 🚀 Captain Whiskers Deployment Guide

## Quick Start: Deploy to Vercel (Frontend)

The easiest and fastest way to host the Captain Whiskers frontend is through **Vercel** - optimized for Next.js applications.

### Option 1: One-Click Vercel Deploy

1. **Push your code to GitHub** (if not already done)
2. Visit [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project"
4. Import your `captain-whiskers` repository
5. Set the root directory to `apps/frontend`
6. Add environment variables (see below)
7. Click "Deploy"

### Option 2: Vercel CLI Deploy

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to frontend
cd apps/frontend

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

---

## Environment Variables for Vercel

Add these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend.railway.app` | Backend API URL |
| `NEXT_PUBLIC_ARC_RPC_URL` | `https://testnet-rpc.arc.dev` | Arc Testnet RPC |
| `NEXT_PUBLIC_ARC_CHAIN_ID` | `5042002` | Arc Testnet Chain ID |
| `NEXT_PUBLIC_ARCSCAN_URL` | `https://testnet.arcscan.io` | Block Explorer URL |
| `NEXT_PUBLIC_TREASURY_CONTRACT` | Your deployed address | Treasury contract |
| `NEXT_PUBLIC_BFT_CONTRACT` | Your deployed address | BFT verification contract |
| `NEXT_PUBLIC_ESCROW_CONTRACT` | Your deployed address | X402 Escrow contract |
| `NEXT_PUBLIC_USDC_CONTRACT` | Your deployed address | Mock USDC contract |

---

## Backend Deployment (Railway)

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Create a new project
4. Add a PostgreSQL database service

### Step 2: Deploy Backend Service

```bash
# Navigate to backend
cd apps/backend

# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

### Step 3: Set Backend Environment Variables

In Railway Dashboard:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
GEMINI_API_KEY=your-gemini-api-key
WALLET_PRIVATE_KEY=your-wallet-private-key
ARC_RPC_URL=https://testnet-rpc.arc.dev
JWT_SECRET=your-jwt-secret
```

### Step 4: Generate Domain

```bash
railway domain
```

---

## Quantum Service Deployment (Railway)

```bash
cd apps/quantum-service

railway link  # Select same project, create new service

railway up

# Set variables
railway variables set PYTHONUNBUFFERED=1 PORT=8000
```

---

## Deployed Contract Addresses

Use the contracts you deployed to Arc Testnet:

```
Treasury:     0xYourTreasuryAddress
BFT:          0xYourBFTAddress  
Escrow:       0xYourEscrowAddress
MockUSDC:     0xYourMockUSDCAddress
```

View them on [ArcScan Testnet](https://testnet.arcscan.io)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Next.js 14 + React 18 + Tailwind                   │    │
│  │  • Landing Page                                      │    │
│  │  • Dashboard                                         │    │
│  │  • AI Chat Interface                                 │    │
│  │  • Quantum Insights                                  │    │
│  │  • Mobile Responsive                                 │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS API Calls
┌────────────────────────────▼────────────────────────────────┐
│                   RAILWAY (Backend)                          │
│  ┌───────────────────┐  ┌───────────────────────────────┐   │
│  │  NestJS Backend   │  │  Python Quantum Service       │   │
│  │  • REST API       │  │  • VQE Optimization           │   │
│  │  • Gemini AI      │  │  • CRYSTALS-Dilithium         │   │
│  │  • BFT Consensus  │  │  • QRNG                       │   │
│  │  • Auth/JWT       │  │  • RL Trading Agent           │   │
│  └─────────┬─────────┘  └───────────────────────────────┘   │
│            │                                                 │
│  ┌─────────▼─────────┐                                      │
│  │  PostgreSQL       │                                      │
│  │  (Railway)        │                                      │
│  └───────────────────┘                                      │
└────────────────────────────┬────────────────────────────────┘
                             │ Web3 RPC
┌────────────────────────────▼────────────────────────────────┐
│              ARC TESTNET (Smart Contracts)                   │
│  • CaptainWhiskersTreasury                                  │
│  • BFTVerification                                          │
│  • X402Escrow                                               │
│  • MockUSDC                                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Hackathon Judging Checklist

✅ **Working Demo on Arc Testnet**
- Frontend deployed on Vercel
- Backend deployed on Railway
- Contracts deployed on Arc Testnet (Chain ID: 5042002)

✅ **ArcScan Transaction Proof**
- View deployed contracts: `https://testnet.arcscan.io/address/YOUR_CONTRACT`
- Execute a transaction and link it in demo video

✅ **Required Features**
- AI-powered treasury management (Gemini integration)
- Quantum portfolio optimization (VQE)
- BFT consensus verification (11 nodes, 7+ required)
- Post-quantum cryptography (CRYSTALS-Dilithium)
- x402 micropayment protocol
- Beautiful UI with Captain Whiskers mascot

---

## Troubleshooting

### Vercel Build Fails

1. Check Node.js version (use 18.x or 20.x)
2. Ensure all dependencies are in `package.json`
3. Check for TypeScript errors: `npm run build` locally

### Railway Deployment Issues

1. Check build logs in Railway dashboard
2. Ensure `nixpacks.toml` or `Dockerfile` exists
3. Verify environment variables are set

### Contract Interaction Fails

1. Verify wallet is funded with ARC testnet tokens
2. Check contract addresses are correct
3. Ensure RPC URL is `https://testnet-rpc.arc.dev`

---

## Quick Commands Reference

```bash
# Frontend
cd apps/frontend
npm run dev          # Local development
npm run build        # Build for production
vercel --prod        # Deploy to Vercel

# Backend
cd apps/backend
npm run start:dev    # Local development
railway up           # Deploy to Railway

# Contracts
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.ts --network arcTestnet
```

---

## Support

- Arc Testnet RPC: `https://testnet-rpc.arc.dev`
- Arc Testnet Explorer: `https://testnet.arcscan.io`
- Chain ID: `5042002`
- Faucet: Check Arc documentation for testnet tokens

Good luck with the hackathon! 🐱‍🚀
