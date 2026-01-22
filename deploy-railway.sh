#!/bin/bash

echo "🚂 Deploying Captain Whiskers to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login check
echo "🔐 Checking Railway login..."
railway whoami || railway login

echo ""
echo "📦 Step 1: Deploying Backend..."
cd apps/backend
railway link || railway init
railway up
BACKEND_URL=$(railway domain 2>/dev/null || echo "Check Railway dashboard")
echo "✅ Backend URL: $BACKEND_URL"
cd ../..

echo ""
echo "📦 Step 2: Deploying Quantum Service..."
cd apps/quantum-service
railway link || railway init
railway up
QUANTUM_URL=$(railway domain 2>/dev/null || echo "Check Railway dashboard")
echo "✅ Quantum Service URL: $QUANTUM_URL"
cd ../..

echo ""
echo "📦 Step 3: Deploying Frontend to Vercel..."
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

cd apps/frontend
vercel --prod || echo "Run 'vercel login' first, then 'vercel --prod'"
cd ../..

echo ""
echo "🎉 Deployment initiated!"
echo ""
echo "⚠️  IMPORTANT: Set environment variables in Railway dashboard!"
echo ""
echo "📋 Next steps:"
echo "   1. Go to https://railway.app/dashboard"
echo "   2. Add PostgreSQL database to backend service"
echo "   3. Set all environment variables (see RAILWAY_DEPLOY.md)"
echo "   4. Update QUANTUM_SERVICE_URL and FRONTEND_URL in backend"
echo ""
