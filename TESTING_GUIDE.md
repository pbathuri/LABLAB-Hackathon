# 🧪 Testing Guide

## Services Status

Check if services are running:

```bash
# Check all services
curl http://localhost:3001
curl http://localhost:8000/health
curl http://localhost:3000
```

## Quick Test Commands

### 1. Test Backend Health
```bash
curl http://localhost:3001
```

### 2. Test Quantum Service
```bash
curl http://localhost:8000/health

# Test portfolio optimization
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
    "risk_tolerance": 0.5
  }'
```

### 3. Test Frontend
Open in browser: http://localhost:3000

## View Logs

```bash
# All logs
tail -f logs/*.log

# Individual services
tail -f logs/backend.log
tail -f logs/quantum.log
tail -f logs/frontend.log
```

## Stop Services

```bash
./stop-dev.sh
```

Or manually:
```bash
kill $(cat logs/backend.pid)
kill $(cat logs/quantum.pid)
kill $(cat logs/frontend.pid)
```

## Restart Services

```bash
./stop-dev.sh
./start-dev.sh
```

## Troubleshooting

### Backend Issues
- Check PostgreSQL: `pg_isready`
- Check port: `lsof -i:3001`
- View errors: `tail -f logs/backend.log`

### Quantum Service Issues
- Activate venv: `source apps/quantum-service/venv/bin/activate`
- Check Python: `python3 --version`
- View errors: `tail -f logs/quantum.log`

### Frontend Issues
- Check Node: `node --version`
- Clear cache: `rm -rf apps/frontend/.next`
- View errors: `tail -f logs/frontend.log`
