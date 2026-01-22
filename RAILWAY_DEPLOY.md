# 🚂 Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at https://railway.app
2. **Railway CLI**: Already installed ✅
3. **GitHub Repository**: Already pushed ✅

## Step-by-Step Deployment

### Step 1: Login to Railway

```bash
railway login
```

This will open your browser to authenticate.

### Step 2: Create New Project

```bash
railway init
```

Select "Create a new project" and name it `captain-whiskers`

### Step 3: Deploy Backend Service

```bash
cd apps/backend
railway link
railway up
```

**Set Environment Variables** (via Railway dashboard or CLI):

```bash
railway variables set DB_HOST=postgres
railway variables set DB_PORT=5432
railway variables set DB_USERNAME=postgres
railway variables set DB_PASSWORD=postgres
railway variables set DB_NAME=captain_whiskers
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set JWT_SECRET=7kbGgPXA63C4JAq5bcwxt9o52RFLpT8fuBvmpoPpo60=
railway variables set JWT_EXPIRES_IN=7d
railway variables set GEMINI_API_KEY=AIzaSyAYWxhjVCfa7yIvCiqJIWm4xi6biLgEoKU
railway variables set CIRCLE_API_KEY=10d449cfe62733f77253ddcd466bf71d:1feea152581afa7adcebb320762b1376
railway variables set ARC_RPC_URL=https://rpc.testnet.arc.network
railway variables set ARC_CHAIN_ID=5042002
railway variables set PRIVATE_KEY=0x59a4c1937c9db471392671e2bf01372c2d19302ad60fd1ab6b98766da90d988d
railway variables set WALLET_ADDRESS=0xa395DE9aFC8864ecbA1E03C5519De053EBe4573F
railway variables set TREASURY_ADDRESS=0x5B8648f8BE56A43C926783CA0E51FbD0540822B4
railway variables set BFT_VERIFICATION_ADDRESS=0x35F8f381428eD56619341B6Ea5E8094D5Bd626a9
railway variables set X402_ESCROW_ADDRESS=0xeD6E801A5DdFF38c28CCCac891fD721D5618194E
railway variables set USDC_ADDRESS=0x6b0D52c2c75da013cF09eE498F1B0430DD187EFc
railway variables set QUANTUM_SERVICE_URL=https://captain-whiskers-quantum.up.railway.app
railway variables set FRONTEND_URL=https://captain-whiskers.vercel.app
```

**Add PostgreSQL Database**:
- In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
- Railway will automatically set `DATABASE_URL` environment variable
- Update `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` from the DATABASE_URL

**Get Backend URL**:
```bash
railway domain
```
Save this URL (e.g., `captain-whiskers-backend.up.railway.app`)

### Step 4: Deploy Quantum Service

```bash
cd ../quantum-service
railway init
railway link
railway up
```

**Set Environment Variables**:

```bash
railway variables set PORT=8000
railway variables set PYTHONUNBUFFERED=1
```

**Get Quantum Service URL**:
```bash
railway domain
```
Save this URL (e.g., `captain-whiskers-quantum.up.railway.app`)

### Step 5: Deploy Frontend to Vercel

```bash
cd ../frontend
npm install -g vercel
vercel login
vercel --prod
```

**Set Environment Variables in Vercel Dashboard**:

```
NEXT_PUBLIC_API_URL=https://captain-whiskers-backend.up.railway.app
NEXT_PUBLIC_QUANTUM_API_URL=https://captain-whiskers-quantum.up.railway.app
NEXT_PUBLIC_ARC_TESTNET_RPC=https://rpc.testnet.arc.network
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARCSCAN_URL=https://testnet.arcscan.io
NEXT_PUBLIC_TREASURY_ADDRESS=0x5B8648f8BE56A43C926783CA0E51FbD0540822B4
NEXT_PUBLIC_USDC_ADDRESS=0x6b0D52c2c75da013cF09eE498F1B0430DD187EFc
NEXT_PUBLIC_X402_ESCROW_ADDRESS=0xeD6E801A5DdFF38c28CCCac891fD721D5618194E
```

**Get Frontend URL**:
Vercel will provide a URL like `captain-whiskers.vercel.app`

### Step 6: Update Backend with Frontend URL

Go back to backend and update:

```bash
cd ../backend
railway variables set FRONTEND_URL=https://captain-whiskers.vercel.app
```

### Step 7: Update Quantum Service URL in Backend

```bash
railway variables set QUANTUM_SERVICE_URL=https://captain-whiskers-quantum.up.railway.app
```

## Quick Deploy Script

Save this as `deploy-railway.sh`:

```bash
#!/bin/bash

echo "🚂 Deploying Captain Whiskers to Railway..."

# Backend
echo "📦 Deploying Backend..."
cd apps/backend
railway link
railway up
BACKEND_URL=$(railway domain)
echo "✅ Backend deployed: $BACKEND_URL"
cd ../..

# Quantum Service
echo "📦 Deploying Quantum Service..."
cd apps/quantum-service
railway init
railway link
railway up
QUANTUM_URL=$(railway domain)
echo "✅ Quantum Service deployed: $QUANTUM_URL"
cd ../..

# Frontend (Vercel)
echo "📦 Deploying Frontend to Vercel..."
cd apps/frontend
vercel --prod
FRONTEND_URL=$(vercel ls | grep captain-whiskers | head -1 | awk '{print $2}')
echo "✅ Frontend deployed: $FRONTEND_URL"
cd ../..

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 URLs:"
echo "   Backend:  $BACKEND_URL"
echo "   Quantum:  $QUANTUM_URL"
echo "   Frontend: $FRONTEND_URL"
echo ""
echo "⚠️  Don't forget to set environment variables in Railway dashboard!"
```

## Environment Variables Checklist

### Backend (Railway)
- [ ] `DB_HOST` (from PostgreSQL service)
- [ ] `DB_PORT=5432`
- [ ] `DB_USERNAME` (from PostgreSQL service)
- [ ] `DB_PASSWORD` (from PostgreSQL service)
- [ ] `DB_NAME=captain_whiskers`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `JWT_SECRET`
- [ ] `GEMINI_API_KEY`
- [ ] `CIRCLE_API_KEY`
- [ ] `PRIVATE_KEY`
- [ ] `TREASURY_ADDRESS`
- [ ] `QUANTUM_SERVICE_URL` (from quantum service)
- [ ] `FRONTEND_URL` (from Vercel)

### Quantum Service (Railway)
- [ ] `PORT=8000`
- [ ] `PYTHONUNBUFFERED=1`

### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` (from backend)
- [ ] `NEXT_PUBLIC_QUANTUM_API_URL` (from quantum service)
- [ ] `NEXT_PUBLIC_TREASURY_ADDRESS`
- [ ] `NEXT_PUBLIC_USDC_ADDRESS`
- [ ] `NEXT_PUBLIC_X402_ESCROW_ADDRESS`

## Testing Deployment

### Test Backend
```bash
curl https://your-backend-url.railway.app/health
```

### Test Quantum Service
```bash
curl https://your-quantum-url.railway.app/health
```

### Test Frontend
Open `https://your-frontend-url.vercel.app` in browser

## Troubleshooting

### Backend won't start
- Check logs: `railway logs`
- Verify PostgreSQL connection
- Check all environment variables are set

### Quantum Service won't start
- Check Python version (should be 3.11)
- Verify requirements.txt is correct
- Check logs: `railway logs`

### Frontend build fails
- Check Node.js version (should be 20)
- Verify all `NEXT_PUBLIC_*` variables are set
- Check build logs in Vercel dashboard

## Monitoring

- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Logs**: `railway logs` or view in dashboard

## Cost Estimate

- **Railway**: Free tier includes $5/month credit
- **Vercel**: Free tier for frontend
- **Total**: ~$0/month for small deployments

## Next Steps

1. Set up custom domains (optional)
2. Configure SSL certificates (automatic)
3. Set up monitoring and alerts
4. Configure CI/CD for auto-deployment
