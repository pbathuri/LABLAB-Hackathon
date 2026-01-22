# 🚀 Quick Start Guide

## Services Running

All services are now starting in the background!

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Quantum Service**: http://localhost:8000
- **API Docs**: http://localhost:3001/api (if Swagger is configured)

### Check Service Status

```bash
# Check if services are running
curl http://localhost:3001
curl http://localhost:8000/health
curl http://localhost:3000
```

### View Logs

```bash
# Backend logs
tail -f logs/backend.log

# Quantum Service logs
tail -f logs/quantum.log

# Frontend logs
tail -f logs/frontend.log
```

### Stop All Services

```bash
./stop-dev.sh
```

Or manually:
```bash
# Kill by PID
kill $(cat logs/backend.pid)
kill $(cat logs/quantum.pid)
kill $(cat logs/frontend.pid)

# Or kill by port
lsof -ti:3001 | xargs kill -9
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Restart Services

```bash
./stop-dev.sh
./start-dev.sh
```

## Testing the Application

1. **Open Frontend**: http://localhost:3000
2. **Test Backend API**: 
   ```bash
   curl http://localhost:3001
   ```
3. **Test Quantum Service**:
   ```bash
   curl http://localhost:8000/health
   ```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Check port 3001 is free: `lsof -i:3001`
- Check logs: `tail -f logs/backend.log`

### Quantum Service won't start
- Activate venv: `source apps/quantum-service/venv/bin/activate`
- Check Python dependencies: `pip list | grep qiskit`
- Check logs: `tail -f logs/quantum.log`

### Frontend won't start
- Check Node modules: `ls apps/frontend/node_modules`
- Check port 3000 is free: `lsof -i:3000`
- Check logs: `tail -f logs/frontend.log`

## Next Steps

1. Visit http://localhost:3000 to see the Captain Whiskers UI
2. Test the AI agent chat interface
3. Try portfolio optimization
4. Check BFT verification status
