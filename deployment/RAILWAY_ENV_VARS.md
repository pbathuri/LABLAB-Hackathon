# Railway Environment Variables

## Your Keys

### Gemini API Key
```
AIzaSyAYWxhjVCfa7yIvCiqJIWm4xi6biLgEoKU
```

### Wallet Private Key
```
0x59a4c1937c9db471392671e2bf01372c2d19302ad60fd1ab6b98766da90d988d
```

### Generated JWT Secret
```
captain-whiskers-jwt-secret-2026-arc-hackathon-secure-random-key
```

---

## Complete Railway Environment Variables

Copy and paste these into Railway Dashboard → Your Service → Variables:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
GEMINI_API_KEY=AIzaSyAYWxhjVCfa7yIvCiqJIWm4xi6biLgEoKU
WALLET_PRIVATE_KEY=0x59a4c1937c9db471392671e2bf01372c2d19302ad60fd1ab6b98766da90d988d
ARC_RPC_URL=https://testnet-rpc.arc.dev
JWT_SECRET=captain-whiskers-jwt-secret-2026-arc-hackathon-secure-random-key
```

**Note**: The `DATABASE_URL` will be automatically set by Railway when you add the PostgreSQL service. Use `${{Postgres.DATABASE_URL}}` to reference it.

---

## PostgreSQL Variables (Already Set)

These are automatically configured by Railway when you add PostgreSQL:

```
DATABASE_PUBLIC_URL="postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/${{PGDATABASE}}"
DATABASE_URL="postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:5432/${{PGDATABASE}}"
PGDATA="/var/lib/postgresql/data/pgdata"
PGDATABASE="${{POSTGRES_DB}}"
PGHOST="${{RAILWAY_PRIVATE_DOMAIN}}"
PGPASSWORD="${{POSTGRES_PASSWORD}}"
PGPORT="5432"
PGUSER="${{POSTGRES_USER}}"
POSTGRES_DB="railway"
POSTGRES_PASSWORD="lhDTBHlfFrwCuOalmAzpIfYCFDAFHTBC"
POSTGRES_USER="postgres"
```

---

## Quick Setup Steps

1. **In Railway Dashboard**:
   - Go to your backend service
   - Click "Variables" tab
   - Add each variable above
   - Save

2. **For DATABASE_URL**:
   - Railway automatically provides `${{Postgres.DATABASE_URL}}`
   - Just use that reference - Railway will resolve it

3. **Deploy**:
   - Railway will automatically redeploy when you save variables
   - Check logs to verify everything works

---

## Security Note

⚠️ **Important**: These keys are in your docker-compose.yml file. For production:
- Consider rotating the JWT_SECRET
- Keep private keys secure
- Never commit production keys to git
