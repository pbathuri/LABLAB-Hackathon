# Railway Backend Deployment Guide

## Setting Root Directory in Railway Dashboard

### Option 1: Using Railway Dashboard (Recommended)

1. **Go to Railway Dashboard** → Your Project → Backend Service
2. **Click on "Settings"** tab
3. **Find "Root Directory"** field
4. **Enter exactly**: `apps/backend` (no leading slash, no trailing slash)
5. **Save** the settings

### Option 2: Using Railway CLI

```bash
# Install Railway CLI if not already installed
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Set root directory
railway variables set RAILWAY_ROOT_DIRECTORY=apps/backend
```

### Option 3: Using railway.json at Root

If Railway still can't find it, we can create a service-specific configuration. However, Railway should detect the `railway.toml` file in `apps/backend/`.

---

## Verification Steps

1. **Check that the directory exists**:
   ```bash
   ls -la apps/backend
   ```
   You should see: `package.json`, `src/`, `Dockerfile`, etc.

2. **Verify Railway can see the files**:
   - In Railway dashboard, check the "Deployments" tab
   - Look at the build logs - it should show files from `apps/backend/`

3. **If Railway still can't find it**:
   - Make sure you're setting the root directory on the **correct service**
   - The service should be named "backend" or similar
   - Try creating a new service and pointing it to `apps/backend`

---

## Alternative: Deploy from Backend Directory

If Railway continues to have issues, you can:

1. **Create a separate Railway project** just for the backend
2. **Point it directly to the `apps/backend` directory**
3. **Or use a GitHub subdirectory**:
   - In Railway, when creating a new service
   - Select "Deploy from GitHub repo"
   - Choose your repo
   - Set subdirectory to: `apps/backend`

---

## Current Configuration Files

The backend has these Railway config files:

- `apps/backend/railway.toml` - Root directory config
- `apps/backend/railway.json` - Build configuration
- `apps/backend/nixpacks.toml` - Build dependencies
- `apps/backend/Procfile` - Start command

All of these are already in place and should work once Railway finds the root directory.

---

## Troubleshooting

**Error: "Could not find root directory: apps/backend"**

Possible causes:
1. ✅ **Path format**: Make sure it's `apps/backend` not `/apps/backend` or `./apps/backend`
2. ✅ **Service selection**: Make sure you're setting it on the backend service, not the root project
3. ✅ **Repository structure**: Verify the repo has `apps/backend/` at the root level
4. ✅ **Case sensitivity**: Make sure the path matches exactly (lowercase)

**Solution**: Try creating a new service in Railway and selecting the subdirectory during setup.
