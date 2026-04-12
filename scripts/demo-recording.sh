#!/usr/bin/env bash
# Captain Whiskers V2 — narrated demo curl flow (5-minute script aid)
set -euo pipefail
API="${API:-http://localhost:3001}"

echo "=== Captain Whiskers V2 — demo curls ==="
echo ""

echo "--- Step 1: On-chain identity ---"
curl -s "${API}/api/identity/status" | head -c 2000
echo -e "\n"

echo "--- Step 2: Paper portfolio init (skip if already initialized) ---"
curl -s -X POST "${API}/api/kraken/paper/init" \
  -H "Content-Type: application/json" \
  -d '{"balance":10000}' | head -c 800
echo -e "\n"

echo "--- Step 3: BTC ticker ---"
curl -s "${API}/api/kraken/ticker/BTCUSD" | head -c 1200
echo -e "\n"

echo "--- Step 4: Agent instruct (needs GEMINI_API_KEY) ---"
curl -s -X POST "${API}/api/agent/instruct" \
  -H "Content-Type: application/json" \
  -d '{"instruction":"Summarize BTC momentum in one sentence. Do not trade."}' | head -c 2500
echo -e "\n"

echo "--- Step 5: Paper status ---"
curl -s "${API}/api/kraken/paper/status" | head -c 1500
echo -e "\n"

echo "--- Step 6: Risk context ---"
curl -s "${API}/api/risk/context" | head -c 1200
echo -e "\n"

echo "--- Step 7: Performance ---"
curl -s "${API}/api/agent/performance" | head -c 800
echo -e "\n"

echo "=== Demo script complete ==="
