# 🚀 Quick Railway Deployment

## Prerequisites ✅
- Railway CLI installed ✅
- GitHub repo pushed ✅
- All config files created ✅

## Quick Start (3 Steps)

### Step 1: Login to Railway
```bash
railway login
```

### Step 2: Deploy Backend
```bash
cd apps/backend
railway init
railway link
railway up
```

**Then in Railway Dashboard:**
1. Add PostgreSQL database
2. Set environment variables (see `.railway-env-template`)
3. Copy the service URL

### Step 3: Deploy Quantum Service
```bash
cd ../quantum-service
railway init
railway link
railway up
```

**Then in Railway Dashboard:**
1. Set `PORT=8000`
2. Copy the service URL

### Step 4: Deploy Frontend (Vercel)
```bash
cd ../frontend
npm install -g vercel
vercel login
vercel --prod
```

**Then in Vercel Dashboard:**
1. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = your backend URL
   - `NEXT_PUBLIC_QUANTUM_API_URL` = your quantum URL
   - Other variables from `.railway-env-template`

## Or Use the Script

```bash
./deploy-railway.sh
```

## Full Guide

See `RAILWAY_DEPLOY.md` for detailed instructions.

## Environment Variables

All variables are in `.railway-env-template` - copy them to Railway dashboard.

## Testing

After deployment:
- Backend: `https://your-backend.railway.app/health`
- Quantum: `https://your-quantum.railway.app/health`
- Frontend: `https://your-frontend.vercel.app`
