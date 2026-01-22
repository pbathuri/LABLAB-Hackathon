# Railway Backend Deployment Fix

## Critical Settings in Railway Dashboard

### 1. Set Root Directory
**IMPORTANT**: In Railway Dashboard → Your Backend Service → Settings:
- **Root Directory**: Set to `apps/backend`
- This tells Railway to build only the backend, not the entire monorepo

### 2. Build Settings
Railway should auto-detect:
- **Build Command**: `npm run build` (runs `nest build`)
- **Start Command**: `node dist/main.js`

### 3. Environment Variables
Make sure these are set:
```
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
GEMINI_API_KEY=AIzaSyAYWxhjVCfa7yIvCiqJIWm4xi6biLgEoKU
WALLET_PRIVATE_KEY=0x59a4c1937c9db471392671e2bf01372c2d19302ad60fd1ab6b98766da90d988d
ARC_RPC_URL=https://testnet-rpc.arc.dev
JWT_SECRET=captain-whiskers-jwt-secret-2026-arc-hackathon-secure-random-key
```

## What Was Fixed

1. ✅ **turbo.json**: Changed `pipeline` → `tasks` (Turborepo 2.0 compatibility)
2. ✅ **railway.json**: Removed incorrect start command
3. ✅ **nixpacks.toml**: Simplified build process
4. ✅ **Procfile**: Added for Railway compatibility
5. ✅ **.railwayignore**: Added to exclude unnecessary files

## Steps to Redeploy

1. **In Railway Dashboard**:
   - Go to your backend service
   - Click "Settings"
   - Set **Root Directory** to: `apps/backend`
   - Save

2. **Redeploy**:
   - Railway will automatically redeploy when you save
   - Or click "Redeploy" manually

3. **Check Logs**:
   - Should see: `npm install` → `npm run build` → `node dist/main.js`
   - Should NOT see: `turbo run build` or root-level builds

## If Still Failing

If you still see "Killed" errors:
1. **Check Root Directory** is set to `apps/backend`
2. **Increase Memory** in Railway (if on free tier, upgrade)
3. **Check Build Logs** for specific errors

The backend should now build and start correctly!
