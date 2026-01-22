# 🔧 Fix Railway Docker Build Error

## Issue
Railway is trying to use the root Dockerfile (configured for pnpm monorepo) instead of building from `apps/backend` with npm.

## Solution

### Option 1: Use Nixpacks (Recommended - No Dockerfile)

1. **In Railway Dashboard**:
   - Go to your backend service
   - **Settings** → **Source**
   - **Root Directory**: `captain-whiskers/apps/backend`
   - **Build Command**: Leave empty (Nixpacks will auto-detect)
   - **Start Command**: `node dist/main.js`

2. **Disable Dockerfile**:
   - Railway will automatically use Nixpacks when it finds `package.json`
   - The `nixpacks.toml` file will be used for build configuration

### Option 2: Use Backend Dockerfile

1. **In Railway Dashboard**:
   - Go to your backend service
   - **Settings** → **Source**
   - **Root Directory**: `captain-whiskers/apps/backend`
   - Railway will use the Dockerfile in that directory

### Option 3: Remove Root Dockerfile (If causing issues)

If Railway keeps using the root Dockerfile:

1. **Temporarily rename it**:
   ```bash
   mv Dockerfile Dockerfile.root.backup
   ```

2. **Or delete it** if not needed:
   ```bash
   rm Dockerfile
   ```

## Quick Fix Steps

1. **Go to Railway Dashboard** → Your backend service
2. **Settings** → **Source**
3. **Verify Root Directory** is: `captain-whiskers/apps/backend`
4. **Settings** → **Build**
5. **Clear Build Command** (let Nixpacks auto-detect)
6. **Set Start Command**: `node dist/main.js`
7. **Redeploy**

## What Changed

✅ Created proper `Dockerfile` in `apps/backend/` (uses npm, not pnpm)
✅ Updated `railway.json` to use Nixpacks
✅ Added `.dockerignore` to exclude unnecessary files
✅ Created `.railwayignore` to guide Railway

## Verification

After fixing, the build should:
- ✅ Detect Node.js from `package.json`
- ✅ Run `npm install`
- ✅ Run `npm run build`
- ✅ Start with `node dist/main.js`

## If Still Failing

1. Check **Build Logs** in Railway dashboard
2. Verify **Root Directory** is correct
3. Check that `package.json` exists in the root directory
4. Try **clearing build cache** in Railway settings
