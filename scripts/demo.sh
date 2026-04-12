#!/usr/bin/env bash
# Captain Whiskers V2 — backend smoke test (Kraken CLI + optional GEMINI/PRISM)
set -euo pipefail

API="${NEXT_PUBLIC_API_URL:-http://localhost:3001}"

echo "== 1. Health =="
curl -sS "$API/" | head -c 300 || true
echo ""

echo "== 2. Paper init =="
curl -sS -X POST "$API/api/kraken/paper/init" -H "Content-Type: application/json" -d '{"balance":10000}' || true
echo ""

echo "== 3. Paper status =="
curl -sS "$API/api/kraken/paper/status" || true
echo ""

echo "== 4. Ticker BTCUSD (path: /api/kraken/ticker/:pair) =="
curl -sS "$API/api/kraken/ticker/BTCUSD" | head -c 500 || true
echo ""

echo "== 5. Agent performance =="
curl -sS "$API/api/agent/performance" || true
echo ""

echo "== 6. Risk context =="
curl -sS "$API/api/risk/context" || true
echo ""

echo "== 7. Identity status =="
curl -sS "$API/api/identity/status" || true
echo ""

if [ -n "${GEMINI_API_KEY:-}" ]; then
  echo "== 8. Agent instruct (GEMINI_API_KEY set) =="
  curl -sS -X POST "$API/api/agent/instruct" \
    -H "Content-Type: application/json" \
    -d '{"instruction":"Say HOLD and call portfolio_status only."}' | head -c 2000 || true
  echo ""
else
  echo "== 8. Agent instruct (skipped — export GEMINI_API_KEY to test) =="
fi

echo "== 9. Auth register/login (paths: /auth/register, /auth/login) =="
curl -sS -X POST "$API/auth/register" -H "Content-Type: application/json" \
  -d '{"email":"demo-smoke@test.com","password":"password123"}' || true
echo ""
curl -sS -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"demo-smoke@test.com","password":"password123"}' | head -c 400 || true
echo ""

echo "Done. ERC-8004: POST $API/api/identity/register with {\"agentURI\":\"https://...\"}"
echo "Trading loop: TRADING_LOOP_ENABLED=true in .env"
