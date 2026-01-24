# Railway PostgreSQL Database Setup

## The Problem

The backend is crashing with `ECONNREFUSED` because PostgreSQL is not configured in Railway.

## Solution: Add PostgreSQL Service

### Step 1: Add PostgreSQL Service in Railway

1. **Go to Railway Dashboard** → Your Project
2. **Click "+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically provision a PostgreSQL database
4. **Note the service name** (usually "Postgres" or "PostgreSQL")

### Step 2: Link Database to Backend Service

1. **Click on your Backend service**
2. **Go to "Variables" tab**
3. **Click "New Variable"**
4. **Select "Reference Variable"**
5. **Choose your PostgreSQL service** → **Select `DATABASE_URL`**
6. **Save**

Railway will automatically create a `DATABASE_URL` variable that looks like:
```
postgresql://postgres:password@hostname:5432/railway
```

### Step 3: Verify Environment Variables

Your backend service should have these variables:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}  ← This references the PostgreSQL service
GEMINI_API_KEY=AIzaSyAYWxhjVCfa7yIvCiqJIWm4xi6biLgEoKU
WALLET_PRIVATE_KEY=0x59a4c1937c9db471392671e2bf01372c2d19302ad60fd1ab6b98766da90d988d
ARC_RPC_URL=https://testnet-rpc.arc.dev
JWT_SECRET=captain-whiskers-jwt-secret-2026-arc-hackathon-secure-random-key
```

### Step 4: Redeploy

After adding the database and linking it:
1. Railway will automatically redeploy
2. Or manually click **"Redeploy"** on the backend service
3. Check logs - should see successful database connection

## Alternative: Quick Test Without Database

If you want to test the API without database first, you can temporarily disable database features, but this is not recommended for production.

## Verification

After setup, check the logs. You should see:
- ✅ `TypeOrmModule dependencies initialized`
- ✅ No `ECONNREFUSED` errors
- ✅ `Captain Whiskers API running on http://localhost:3001`

## Troubleshooting

**Still seeing `ECONNREFUSED`?**
1. Verify PostgreSQL service is running (green status in Railway)
2. Check that `DATABASE_URL` variable is correctly referenced
3. Make sure backend service is linked to PostgreSQL service
4. Try redeploying both services

**Database connection timeout?**
- Railway free tier PostgreSQL might take a moment to start
- Wait 1-2 minutes after creating the service
- Check PostgreSQL service logs for startup issues
