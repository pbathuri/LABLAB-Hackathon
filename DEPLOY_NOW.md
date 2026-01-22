# 🚀 Deploy to Railway - Run These Commands

The Railway CLI needs interactive terminal access. Open your terminal and run these commands:

## Step 1: Navigate to Backend

```bash
cd "/Users/prady/Desktop/LabLab-Agentic Commerce/captain-whiskers/apps/backend"
```

## Step 2: Link to a Service

```bash
railway link
```

When prompted:
1. Select workspace: `pbathuri's Projects`
2. Select project: `appealing-warmth` (or create new)
3. Select service: Create new or select `@captain-whiskers/backend`

## Step 3: Deploy

```bash
railway up
```

This will upload your code and build using Nixpacks.

## Step 4: Set Environment Variables

```bash
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set GEMINI_API_KEY=AIzaSyAYWxhjVCfa7yIvCiqJIWm4xi6biLgEoKU
railway variables set CIRCLE_API_KEY=10d449cfe62733f77253ddcd466bf71d:1feea152581afa7adcebb320762b1376
railway variables set PRIVATE_KEY=0x59a4c1937c9db471392671e2bf01372c2d19302ad60fd1ab6b98766da90d988d
railway variables set TREASURY_ADDRESS=0x5B8648f8BE56A43C926783CA0E51FbD0540822B4
railway variables set ARC_RPC_URL=https://rpc.testnet.arc.network
railway variables set ARC_CHAIN_ID=5042002
```

## Step 5: Add PostgreSQL (via Dashboard)

1. Go to Railway Dashboard
2. Click "New" → "Database" → "PostgreSQL"
3. Railway will auto-set `DATABASE_URL`

## Step 6: Generate Domain

```bash
railway domain
```

## Step 7: Repeat for Quantum Service

```bash
cd "/Users/prady/Desktop/LabLab-Agentic Commerce/captain-whiskers/apps/quantum-service"
railway link
# Select same project, create new service
railway up
railway variables set PORT=8000
railway variables set PYTHONUNBUFFERED=1
railway domain
```

## Quick All-in-One Script

Copy and paste this in your terminal:

```bash
# Deploy Backend
cd "/Users/prady/Desktop/LabLab-Agentic Commerce/captain-whiskers/apps/backend"
echo "📦 Linking Backend..."
railway link
echo "🚀 Deploying Backend..."
railway up
echo "⚙️ Setting Variables..."
railway variables set NODE_ENV=production PORT=3001 GEMINI_API_KEY=AIzaSyAYWxhjVCfa7yIvCiqJIWm4xi6biLgEoKU
echo "🌐 Generating Domain..."
railway domain
echo "✅ Backend deployed!"
```

## Alternative: Use Railway Dashboard

If CLI doesn't work, use the dashboard:

1. Go to https://railway.app/dashboard
2. Open your project (appealing-warmth)
3. Delete the failing service
4. Click "New Service" → "Empty Service"
5. Settings → Source → Connect GitHub Repo
6. Select `pbathuri/LABLAB-Hackathon`
7. Set Root Directory: `captain-whiskers/apps/backend`
8. Settings → Build → Builder: "Nixpacks"
9. Deploy
