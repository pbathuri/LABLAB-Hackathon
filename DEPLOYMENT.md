# 🚀 Captain Whiskers Deployment Guide

Complete guide for deploying Captain Whiskers to production.

## Quick Deploy

### Frontend (Vercel) - Recommended

1. **Go to Vercel**: https://vercel.com/new
2. **Import Repository**: `pbathuri/LABLAB-Hackathon`
3. **Configure**:
   - Root Directory: `apps/frontend`
   - Framework: Next.js (auto-detected)
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_ARC_RPC_URL=https://testnet-rpc.arc.dev
   NEXT_PUBLIC_ARC_CHAIN_ID=5042002
   NEXT_PUBLIC_ARCSCAN_URL=https://testnet.arcscan.io
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
5. **Deploy** 🎉

### Backend (Railway)

```bash
cd apps/backend
railway login
railway link
railway up
```

**Environment Variables**:
```
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
GEMINI_API_KEY=your-key
WALLET_PRIVATE_KEY=your-key
ARC_RPC_URL=https://testnet-rpc.arc.dev
JWT_SECRET=your-secret
```

### Quantum Service (Railway)

```bash
cd apps/quantum-service
railway link  # Same project, new service
railway up
```

## Architecture

```
Frontend (Vercel) → Backend (Railway) → PostgreSQL (Railway)
                              ↓
                    Quantum Service (Railway)
                              ↓
                    Arc Testnet (Smart Contracts)
```

## Contract Addresses

Deploy contracts first:
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network arcTestnet
```

Update environment variables with deployed addresses.

## Full Documentation

See `HOSTING_GUIDE.md` for detailed instructions.
