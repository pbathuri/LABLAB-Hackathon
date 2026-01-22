# 🚀 Deploy to Railway via GitHub

## Method: Connect GitHub Repo to Railway (Recommended)

This is the easiest way - Railway will auto-deploy from your GitHub repo!

## Step-by-Step Guide

### Step 1: Ensure Your Code is Pushed to GitHub

```bash
cd "/Users/prady/Desktop/LabLab-Agentic Commerce/captain-whiskers"
git status
git add -A
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 2: Create Railway Project from GitHub

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Authorize Railway** to access your GitHub (if first time)
5. **Select your repository**: `pbathuri/LABLAB-Hackathon`
6. **Click "Deploy Now"**

### Step 3: Configure Backend Service

After Railway creates the project:

1. **Rename the service** to "backend" (click the service name)
2. **Go to Settings** → **Source**
3. **Set Root Directory** to: `captain-whiskers/apps/backend`
4. **Go to Variables** tab
5. **Add all environment variables** (see `.railway-env-template`)

**Key Variables to Set:**
```
NODE_ENV=production
PORT=3001
DB_HOST=postgres
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=captain_whiskers
GEMINI_API_KEY=AIzaSyAYWxhjVCfa7yIvCiqJIWm4xi6biLgEoKU
CIRCLE_API_KEY=10d449cfe62733f77253ddcd466bf71d:1feea152581afa7adcebb320762b1376
PRIVATE_KEY=0x59a4c1937c9db471392671e2bf01372c2d19302ad60fd1ab6b98766da90d988d
TREASURY_ADDRESS=0x5B8648f8BE56A43C926783CA0E51FbD0540822B4
# ... (see .railway-env-template for full list)
```

6. **Add PostgreSQL Database**:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will auto-set `DATABASE_URL`
   - Update `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` from `DATABASE_URL`

7. **Generate Domain**:
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Copy the URL (e.g., `captain-whiskers-backend.up.railway.app`)

### Step 4: Create Quantum Service

1. **In the same Railway project**, click "New Service"
2. **Select "GitHub Repo"** → Choose `pbathuri/LABLAB-Hackathon`
3. **Rename** to "quantum-service"
4. **Settings** → **Source** → **Root Directory**: `captain-whiskers/apps/quantum-service`
5. **Variables** tab:
   ```
   PORT=8000
   PYTHONUNBUFFERED=1
   ```
6. **Generate Domain** and copy URL

### Step 5: Update Backend with Service URLs

Go back to **backend service** → **Variables**:

1. Add `QUANTUM_SERVICE_URL` = your quantum service URL
2. Add `FRONTEND_URL` = your Vercel URL (after Step 6)

### Step 6: Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Import Git Repository**: `pbathuri/LABLAB-Hackathon`
3. **Configure Project**:
   - **Root Directory**: `captain-whiskers/apps/frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXT_PUBLIC_QUANTUM_API_URL=https://your-quantum.railway.app
   NEXT_PUBLIC_TREASURY_ADDRESS=0x5B8648f8BE56A43C926783CA0E51FbD0540822B4
   NEXT_PUBLIC_USDC_ADDRESS=0x6b0D52c2c75da013cF09eE498F1B0430DD187EFc
   NEXT_PUBLIC_X402_ESCROW_ADDRESS=0xeD6E801A5DdFF38c28CCCac891fD721D5618194E
   NEXT_PUBLIC_ARC_TESTNET_RPC=https://rpc.testnet.arc.network
   NEXT_PUBLIC_ARC_CHAIN_ID=5042002
   NEXT_PUBLIC_ARCSCAN_URL=https://testnet.arcscan.io
   ```
5. **Deploy**

### Step 7: Update Backend with Frontend URL

Go back to Railway → **backend service** → **Variables**:
- Update `FRONTEND_URL` = your Vercel URL

## ✅ Auto-Deployment

Once set up:
- **Every push to `main` branch** = Auto-deploy to Railway
- **Railway watches your GitHub repo** for changes
- **No CLI needed!**

## 📋 Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created from GitHub
- [ ] Backend service configured (root: `captain-whiskers/apps/backend`)
- [ ] PostgreSQL database added
- [ ] Environment variables set
- [ ] Quantum service created (root: `captain-whiskers/apps/quantum-service`)
- [ ] Service URLs updated
- [ ] Frontend deployed to Vercel
- [ ] All services tested

## 🔍 Verify Deployment

```bash
# Test Backend
curl https://your-backend.railway.app/health

# Test Quantum
curl https://your-quantum.railway.app/health

# Test Frontend
open https://your-frontend.vercel.app
```

## 🎯 Benefits of GitHub Deployment

✅ **Auto-deploy** on every push
✅ **No CLI needed** - all via dashboard
✅ **Easy rollback** - revert commits
✅ **Branch deployments** - test on PRs
✅ **Better collaboration** - team can see deployments
