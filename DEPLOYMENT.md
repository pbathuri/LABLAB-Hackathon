# 🚀 Captain Whiskers - Deployment Guide

## ✅ Completed Tasks

### 1. Backend TypeScript Errors - FIXED ✅
- Fixed type mismatches in `agent.service.ts`
- Fixed `VerificationResult` type mapping
- Fixed `Wallet` type conflicts
- All TypeScript errors resolved

### 2. Quantum Optimization API - TESTED ✅
- Endpoint: `POST /quantum/optimize-portfolio`
- Tested with USDC, ETH, BTC portfolio
- Returns optimal allocations, expected return, risk metrics, Sharpe ratio

### 3. Contracts Verified on ArcScan ✅

**Deployed Contracts:**
- **Treasury**: https://testnet.arcscan.io/address/0x5B8648f8BE56A43C926783CA0E51FbD0540822B4
- **BFT Verification**: https://testnet.arcscan.io/address/0x35F8f381428eD56619341B6Ea5E8094D5Bd626a9
- **X402 Escrow**: https://testnet.arcscan.io/address/0xeD6E801A5DdFF38c28CCCac891fD721D5618194E
- **Mock USDC**: https://testnet.arcscan.io/address/0x6b0D52c2c75da013cF09eE498F1B0430DD187EFc

## 🐳 Docker Deployment

### Local Docker Setup

```bash
# Start all services
./docker-start.sh

# Or manually:
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Quantum Service**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## ☁️ Cloud Deployment Options

### Option 1: Railway (Recommended)

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy Backend**:
   ```bash
   cd apps/backend
   railway init
   railway up
   ```

3. **Deploy Quantum Service**:
   ```bash
   cd apps/quantum-service
   railway init
   railway up
   ```

4. **Deploy Frontend** (Vercel):
   ```bash
   cd apps/frontend
   vercel --prod
   ```

### Option 2: Render

1. **Backend**:
   - Connect GitHub repo
   - Build: `cd apps/backend && npm install && npm run build`
   - Start: `npm run start:prod`
   - Environment: Add all `.env` variables

2. **Quantum Service**:
   - Build: `cd apps/quantum-service && pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port 8000`
   - Environment: Python 3.11

3. **Frontend** (Vercel):
   - Connect repo
   - Root: `apps/frontend`
   - Build: `npm run build`
   - Output: `.next`

### Option 3: Docker on VPS

```bash
# On your VPS
git clone https://github.com/pbathuri/LABLAB-Hackathon.git
cd LABLAB-Hackathon
docker-compose up -d

# With nginx reverse proxy
# Configure nginx to proxy:
# - /api -> http://localhost:3001
# - /quantum -> http://localhost:8000
# - / -> http://localhost:3000
```

## 🔧 Environment Variables

### Backend (.env)
```env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=captain_whiskers
GEMINI_API_KEY=your_key
CIRCLE_API_KEY=your_key
PRIVATE_KEY=your_key
TREASURY_ADDRESS=0x5B8648f8BE56A43C926783CA0E51FbD0540822B4
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_QUANTUM_API_URL=https://your-quantum.railway.app
NEXT_PUBLIC_TREASURY_ADDRESS=0x5B8648f8BE56A43C926783CA0E51FbD0540822B4
```

## 🧪 Testing

### Test Quantum API
```bash
curl -X POST http://localhost:8000/quantum/optimize-portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "assets": ["USDC", "ETH", "BTC"],
    "expected_returns": [0.0, 0.15, 0.12],
    "covariance_matrix": [
      [0.0001, 0.0, 0.0],
      [0.0, 0.04, 0.02],
      [0.0, 0.02, 0.03]
    ],
    "risk_tolerance": 0.5,
    "budget": 1.0
  }'
```

### Test Backend
```bash
curl http://localhost:3001
curl http://localhost:3001/api
```

### Test Frontend
```bash
curl http://localhost:3000
```

## 📊 Monitoring

- **Health Checks**:
  - Backend: `http://localhost:3001/health`
  - Quantum: `http://localhost:8000/health`
  - Frontend: `http://localhost:3000`

- **API Docs**:
  - Backend Swagger: `http://localhost:3001/api`
  - Quantum Swagger: `http://localhost:8000/docs`

## 🎯 Next Steps

1. ✅ Fix TypeScript errors
2. ✅ Test quantum optimization
3. ✅ Verify contracts on ArcScan
4. ⏳ Deploy to cloud (Railway/Render)
5. ⏳ Set up CI/CD
6. ⏳ Configure domain and SSL
