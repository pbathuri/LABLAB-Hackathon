# 🔧 Railway Deployment Fix

## Issue
Railway is deploying from the wrong directory and can't detect the app type.

## Solution

### Option 1: Deploy from the service directory (Recommended)

**For Backend:**
```bash
cd apps/backend
railway init
railway link
railway up
```

**For Quantum Service:**
```bash
cd apps/quantum-service
railway init
railway link
railway up
```

This way Railway will detect the `package.json` or `requirements.txt` in the current directory.

### Option 2: Configure Root Directory in Railway Dashboard

1. Go to Railway dashboard
2. Select your service
3. Go to "Settings" → "Source"
4. Set "Root Directory" to:
   - `apps/backend` for backend service
   - `apps/quantum-service` for quantum service

### Option 3: Use Railway.toml

The `railway.toml` file has been created in `apps/backend/` to explicitly configure the build.

## Quick Fix Commands

```bash
# Backend
cd apps/backend
railway init
railway link
railway up

# Quantum Service  
cd apps/quantum-service
railway init
railway link
railway up
```

## Verification

After deployment, Railway should:
- ✅ Detect Node.js from `package.json` (backend)
- ✅ Detect Python from `requirements.txt` (quantum)
- ✅ Build successfully
- ✅ Start the service

## Troubleshooting

If Railway still can't detect:
1. Make sure you're in the correct directory (`apps/backend` or `apps/quantum-service`)
2. Check that `package.json` or `requirements.txt` exists
3. Set root directory in Railway dashboard settings
4. Check Railway logs: `railway logs`
