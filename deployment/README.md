# Captain Whiskers - Deployment Guide

This folder contains all deployment configuration files and documentation for the Captain Whiskers project.

## 📁 Folder Structure

```
deployment/
├── docker-compose.yml          # Docker orchestration configuration
├── docker-start.sh            # Docker startup script
├── railway.json               # Railway deployment configuration
├── deploy-railway.sh          # Railway deployment script
├── start-dev.sh              # Development environment startup
├── stop-dev.sh               # Development environment shutdown
├── DEPLOYMENT.md             # Detailed deployment instructions
├── DEPLOYMENT_STATUS.md      # Current deployment status
├── HOSTING_GUIDE.md          # Platform-specific hosting guides
├── DATABASE_AUTH_FIX.md      # Database authentication troubleshooting
└── RAILWAY_*.md              # Railway-specific documentation
```

## 🚀 Quick Start

### Local Development with Docker

From the `deployment` folder:

```bash
# Start all services
./docker-start.sh

# Or manually with docker-compose
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5433
- Redis on port 6380
- Backend API on port 4001
- Quantum service on port 4002
- Frontend on port 4000

### Stop Services

```bash
./stop-dev.sh
# or
docker-compose down
```

## ☁️ Cloud Deployment

### Vercel (Frontend)

The frontend is deployed on Vercel with automatic deployments from the main branch.

**Configuration Location:** `apps/frontend/vercel.json`

**Deploy from Repository Root:**

```bash
cd /path/to/captain-whiskers
vercel --prod
```

**Environment Variables Required:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_ARC_RPC_URL` - Arc Network RPC URL
- `NEXT_PUBLIC_ARC_CHAIN_ID` - Arc Network Chain ID
- `NEXT_PUBLIC_ARCSCAN_URL` - Arc Network Explorer URL

### Railway (Backend & Quantum Service)

Railway is used for deploying the backend and quantum service.

**Configuration Location:** `deployment/railway.json`

**Deploy from Repository Root:**

```bash
cd /path/to/captain-whiskers
railway up
```

**Service Configuration:**
- **Backend Service:**
  - Root Directory: `apps/backend`
  - Builder: NIXPACKS
  
- **Quantum Service:**
  - Root Directory: `apps/quantum-service`
  - Builder: NIXPACKS

**Required Environment Variables:**

Backend:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `CIRCLE_API_KEY` - Circle USDC API key
- `PRIVATE_KEY` - Ethereum private key
- `TREASURY_ADDRESS` - Treasury contract address
- `ARC_RPC_URL` - Arc Network RPC URL

Quantum Service:
- `PYTHONUNBUFFERED=1` - For proper logging

### Docker Deployment

For production Docker deployments, use the provided docker-compose.yml:

```bash
cd /path/to/captain-whiskers/deployment
docker-compose -f docker-compose.yml up -d
```

**Important Notes:**
- All paths in `docker-compose.yml` are relative to the deployment folder
- App contexts use `../apps/*` to reference application directories
- Update environment variables for production in docker-compose.yml

## 🔧 Configuration Files Explained

### docker-compose.yml

Orchestrates all services for local development:
- Uses relative paths (`../apps/*`) to reference application code
- Configures service dependencies and health checks
- Sets up networking between containers
- Mounts volumes for live development

### railway.json

Configures Railway deployment:
- Service root directories relative to repository root
- Build configuration for each service
- All paths are relative to the monorepo root

### vercel.json

Configures Vercel deployment:
- Framework detection (Next.js)
- Build and output settings
- Environment variables
- Security headers
- API rewrites

## 📚 Detailed Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment instructions
- **[DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)** - Current deployment status and URLs
- **[HOSTING_GUIDE.md](./HOSTING_GUIDE.md)** - Platform-specific hosting guides
- **[DATABASE_AUTH_FIX.md](./DATABASE_AUTH_FIX.md)** - Database troubleshooting
- **[RAILWAY_SETUP.md](./RAILWAY_SETUP.md)** - Railway setup guide
- **[RAILWAY_ENV_VARS.md](./RAILWAY_ENV_VARS.md)** - Railway environment variables

## 🔐 Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive configuration
- API keys and private keys should be stored in deployment platform secrets
- Update default passwords in production deployments

## 📝 Deployment Checklist

Before deploying to production:

- [ ] Update environment variables with production values
- [ ] Remove or secure any test API keys
- [ ] Configure proper CORS settings
- [ ] Set up SSL/TLS certificates
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Test all service connections
- [ ] Verify smart contract addresses
- [ ] Update RPC URLs for production networks

## 🆘 Troubleshooting

### Services Not Starting

1. Check Docker is running: `docker info`
2. Check for port conflicts: `lsof -i :4000,4001,4002,5433,6380`
3. Review service logs: `docker-compose logs [service-name]`

### Database Connection Issues

See [DATABASE_AUTH_FIX.md](./DATABASE_AUTH_FIX.md) for detailed troubleshooting.

### Railway Deployment Issues

See [RAILWAY_*.md](./RAILWAY_SETUP.md) files for Railway-specific issues.

## 📞 Support

For deployment issues, please:
1. Check the relevant documentation file in this folder
2. Review service logs for error messages
3. Verify all environment variables are set correctly
4. Ensure all required services are running

---

**Repository Root:** `/path/to/captain-whiskers`
**All deployment commands should be run relative to the repository structure described above.**
