# Railway Root Directory Fix

## The Issue
Railway is showing: "Could not find root directory: apps/backend"

## Solution Options

### Option 1: Set in Railway Dashboard (Most Reliable)

1. **Go to Railway Dashboard**: https://railway.app
2. **Select your project** → **Backend service**
3. **Click "Settings"** tab (gear icon)
4. **Scroll to "Root Directory"** section
5. **Enter**: `apps/backend` (exactly like this, no slashes at start/end)
6. **Click "Save"**
7. **Redeploy** the service

### Option 2: Create Service from Subdirectory

If Option 1 doesn't work:

1. **Delete the current backend service** (if it exists)
2. **Click "New Service"** → **"GitHub Repo"**
3. **Select your repository**
4. **In the setup wizard**, look for **"Subdirectory"** or **"Root Directory"** option
5. **Enter**: `apps/backend`
6. **Complete the setup**

### Option 3: Use Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
cd /path/to/captain-whiskers
railway link

# Set root directory for backend service
railway service backend
railway variables set RAILWAY_ROOT_DIRECTORY=apps/backend
```

### Option 4: Manual Path Verification

Verify the path is correct:

```bash
# From repository root
cd captain-whiskers
ls apps/backend/package.json  # Should exist
```

The path `apps/backend` is relative to the **repository root**, not the workspace root.

---

## Common Mistakes

❌ **Wrong**: `/apps/backend` (leading slash)
❌ **Wrong**: `./apps/backend` (relative path with dot)
❌ **Wrong**: `captain-whiskers/apps/backend` (includes parent directory)
✅ **Correct**: `apps/backend` (relative to repo root)

---

## Verification

After setting the root directory:

1. **Check build logs** in Railway
2. **Should see**: Files being read from `apps/backend/`
3. **Should see**: `npm install` running in that directory
4. **Should see**: `npm run build` executing
5. **Should see**: `node dist/main.js` starting

---

## If Still Not Working

1. **Check Railway service name**: Make sure you're editing the correct service
2. **Try absolute path**: Some Railway versions might need `/apps/backend` (with leading slash)
3. **Check repository structure**: Ensure `apps/backend/` exists at the root of your GitHub repo
4. **Contact Railway support**: If none of the above works

---

## Current Repository Structure

```
captain-whiskers/
├── apps/
│   ├── backend/          ← This is what Railway needs to find
│   │   ├── package.json
│   │   ├── src/
│   │   └── ...
│   ├── frontend/
│   └── quantum-service/
├── contracts/
└── railway.json
```

The root directory `apps/backend` should point to the `backend/` folder inside `apps/`.
