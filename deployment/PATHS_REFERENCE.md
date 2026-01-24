# 🗺️ Deployment Paths Reference

Quick reference for deployment configurations and paths.

## 📍 Repository Structure

```
captain-whiskers/                    ← Repository Root
├── apps/
│   ├── backend/                    ← Backend root directory
│   ├── frontend/                   ← Frontend root directory
│   └── quantum-service/            ← Quantum service root directory
├── contracts/                       ← Smart contracts
└── deployment/                      ← Deployment files (this folder)
```

## 🐳 Docker Paths

**File Location:** `deployment/docker-compose.yml`
**Run From:** `captain-whiskers/deployment/`

```bash
cd captain-whiskers/deployment
docker-compose up -d
```

**Context Paths (relative to deployment folder):**
- Backend: `../apps/backend`
- Quantum: `../apps/quantum-service`
- Frontend: `../apps/frontend`

## 🚂 Railway Paths

**File Location:** `deployment/railway.json`
**Run From:** Repository root (`captain-whiskers/`)

```bash
cd captain-whiskers
railway up
```

**Root Directories (relative to repo root):**
- Backend: `apps/backend`
- Quantum Service: `apps/quantum-service`

**Railway Configuration:**
```json
{
  "services": {
    "backend": {
      "rootDirectory": "apps/backend"
    },
    "quantum-service": {
      "rootDirectory": "apps/quantum-service"
    }
  }
}
```

## ▲ Vercel Paths

**File Location:** `apps/frontend/vercel.json`
**Run From:** Repository root or frontend directory

### Option 1: Deploy from root
```bash
cd captain-whiskers
vercel --prod
```

### Option 2: Deploy from frontend directory
```bash
cd captain-whiskers/apps/frontend
vercel --prod
```

**Configuration:** Paths in `vercel.json` are relative to `apps/frontend/`

## 🔧 Path Conversion Table

| Service | Docker (from deployment/) | Railway (from root) | Vercel |
|---------|--------------------------|---------------------|---------|
| Backend | `../apps/backend` | `apps/backend` | N/A |
| Quantum | `../apps/quantum-service` | `apps/quantum-service` | N/A |
| Frontend | `../apps/frontend` | N/A | `apps/frontend` or `.` |

## 📝 Important Notes

1. **Docker Compose:**
   - Must be run from `deployment/` folder
   - Uses `../apps/*` to reference application code
   - All volume mounts are relative to deployment folder

2. **Railway:**
   - Deploy from repository root
   - `rootDirectory` specifies where each service starts
   - Paths are relative to repository root

3. **Vercel:**
   - Can deploy from root or frontend directory
   - Automatically detects Next.js framework
   - Configuration in `apps/frontend/vercel.json`

## 🚀 Quick Commands

### Local Development (Docker)
```bash
# From repository root
cd deployment
./docker-start.sh

# Or manually
docker-compose up -d
```

### Railway Deployment
```bash
# From repository root
railway up

# Or deploy specific service
railway up --service backend
railway up --service quantum-service
```

### Vercel Deployment
```bash
# From repository root
vercel --prod

# Or from frontend directory
cd apps/frontend
vercel --prod
```

## 🔄 Path Updates Summary

When we moved files to `deployment/` folder, we updated:

✅ **docker-compose.yml**: Changed `./apps/*` → `../apps/*`
✅ **railway.json**: No changes (already relative to root)
✅ **vercel.json**: No changes (already in frontend directory)

## 🆘 Troubleshooting

### Docker can't find apps/
**Problem:** Running docker-compose from wrong directory
**Solution:** Run from `deployment/` folder, not root

### Railway service not building
**Problem:** Wrong rootDirectory in railway.json
**Solution:** Paths should be `apps/backend` and `apps/quantum-service`

### Vercel build fails
**Problem:** Wrong build directory
**Solution:** Deploy from root or ensure correct working directory

---

**Last Updated:** January 2026
**Version:** 1.0.0
