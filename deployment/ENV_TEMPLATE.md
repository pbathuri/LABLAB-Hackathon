# Environment Variables Template

Copy this template and fill in your actual values when deploying.

## For Docker Development

When using `docker-compose.yml`, edit the environment variables directly in the file or create a `.env` file in the deployment folder.

## Required Environment Variables

### Gemini AI
```
GEMINI_API_KEY=your-gemini-api-key-here
```
Get your API key from: https://makersuite.google.com/app/apikey

### Circle USDC
```
CIRCLE_API_KEY=your-circle-api-key-here
```
Get your API key from: https://developers.circle.com/

### Ethereum/Blockchain
```
PRIVATE_KEY=your-ethereum-private-key-here
TREASURY_ADDRESS=0x5B8648f8BE56A43C926783CA0E51FbD0540822B4
ARC_RPC_URL=https://rpc.testnet.arc.network
```
⚠️ **WARNING:** Never commit your actual private key! Use testnet keys only for development.

### Database (Local)
```
DB_HOST=postgres  # or localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=captain_whiskers
```

### Redis
```
REDIS_HOST=redis  # or localhost
REDIS_PORT=6379
```

### Services
```
QUANTUM_SERVICE_URL=http://quantum:8000  # Docker service name, or http://localhost:8000
```

### Frontend (Next.js)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_QUANTUM_API_URL=http://localhost:8000
NEXT_PUBLIC_ARC_RPC_URL=https://testnet-rpc.arc.dev
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARCSCAN_URL=https://testnet.arcscan.io
```

## For Production Deployment

### Vercel (Frontend)
Add these in Project Settings > Environment Variables:
- `NEXT_PUBLIC_API_URL` - Your Railway backend URL
- `NEXT_PUBLIC_QUANTUM_API_URL` - Your Railway quantum service URL
- `NEXT_PUBLIC_ARC_RPC_URL` - Arc Network RPC
- `NEXT_PUBLIC_ARC_CHAIN_ID` - Arc Chain ID
- `NEXT_PUBLIC_ARCSCAN_URL` - Arc Explorer URL

### Railway (Backend + Quantum Service)
Add these in Project Settings > Variables:

**Backend Service:**
- `GEMINI_API_KEY`
- `CIRCLE_API_KEY`
- `PRIVATE_KEY`
- `TREASURY_ADDRESS`
- `ARC_RPC_URL`
- `DATABASE_URL` (automatically provided by Railway PostgreSQL)
- `REDIS_URL` (automatically provided by Railway Redis)
- `QUANTUM_SERVICE_URL` (URL of your quantum service)

**Quantum Service:**
- `PYTHONUNBUFFERED=1` (for proper logging)

## Security Best Practices

1. **Never commit actual keys** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** in production
4. **Use testnet keys** for development
5. **Store production keys** in secure secret management

## Testing Your Configuration

After setting environment variables:

1. **Check backend connection:**
   ```bash
   curl http://localhost:4001/health
   ```

2. **Check quantum service:**
   ```bash
   curl http://localhost:4002/health
   ```

3. **Check frontend:**
   Open http://localhost:4000 in browser

## Troubleshooting

- **Service can't connect to database:** Check `DATABASE_URL` or individual DB variables
- **API calls fail:** Verify API keys are valid and not expired
- **CORS errors:** Check `NEXT_PUBLIC_API_URL` matches your backend URL
- **Blockchain errors:** Verify `PRIVATE_KEY` and `ARC_RPC_URL` are correct
