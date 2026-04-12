#!/usr/bin/env bash
# CAPTAIN WHISKERS V2 — Diagnostic Script
# Run this FIRST to assess what works and what needs fixing.
# Usage: bash scripts/diagnose.sh   (from repo root or any cwd)

set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "=========================================="
echo " Captain Whiskers V2 — System Diagnostic"
echo " (repo: $ROOT_DIR)"
echo "=========================================="
echo ""

# 1. Check prerequisites
echo "--- PREREQUISITES ---"

check_cmd() {
  if command -v "$1" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $1 found: $(command -v "$1")"
    return 0
  else
    echo -e "${RED}✗${NC} $1 NOT FOUND"
    return 1
  fi
}

check_cmd "node" || true
check_cmd "npm" || true
check_cmd "npx" || true
check_cmd "python3" || true
check_cmd "docker" || true
check_cmd "kraken" || echo -e "  ${YELLOW}→ Install: curl --proto '=https' --tlsv1.2 -LsSf https://github.com/krakenfx/kraken-cli/releases/latest/download/kraken-cli-installer.sh | sh${NC}"

echo ""

# 2. Check env file
echo "--- ENVIRONMENT ---"
ENV_FILE=""
if [ -f ".env" ]; then
  ENV_FILE=".env"
elif [ -f "../.env" ]; then
  ENV_FILE="../.env"
fi
if [ -z "$ENV_FILE" ] || [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}✗${NC} No .env found at repo root (copy from .env.example)"
else
  echo -e "${GREEN}✓${NC} .env found: $ROOT_DIR/$ENV_FILE"

  check_env() {
    local key="$1"
    local line
    line=$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -1 || true)
    if [ -z "$line" ]; then
      echo -e "  ${RED}✗${NC} $key is missing"
      return
    fi
    local val="${line#*=}"
    val="${val%%#*}"
    val="$(echo "$val" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    if [ -n "$val" ]; then
      echo -e "  ${GREEN}✓${NC} $key is set"
    else
      echo -e "  ${RED}✗${NC} $key is empty"
    fi
  }

  check_env "GEMINI_API_KEY"
  check_env "PRISM_API_KEY"
  check_env "KRAKEN_API_KEY"
  check_env "KRAKEN_API_SECRET"
  check_env "JWT_SECRET"
  check_env "DEPLOYER_PRIVATE_KEY"
  check_env "AGENT_PRIVATE_KEY"
  check_env "BASE_SEPOLIA_RPC"
  check_env "ERC8004_IDENTITY_REGISTRY"
  check_env "ERC8004_REPUTATION_REGISTRY"

  # On-chain deploy targets — optional until you run deploy-base-sepolia
  check_env_deploy() {
    local key="$1"
    local line val
    line=$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -1 || true)
    val=""
    if [ -n "$line" ]; then
      val="${line#*=}"
      val="${val%%#*}"
      val="$(echo "$val" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    fi
    if [ -n "$val" ]; then
      echo -e "  ${GREEN}✓${NC} $key is set"
    else
      echo -e "  ${YELLOW}○${NC} $key empty — deploy: cd contracts && npx hardhat run scripts/deploy-base-sepolia.ts --network base-sepolia"
    fi
  }

  check_env_deploy "RISK_ROUTER_ADDRESS"
  check_env_deploy "CAPITAL_VAULT_ADDRESS"
  check_env_deploy "MOCK_USDC_ADDRESS"
  check_env_deploy "MOCK_WETH_ADDRESS"
  check_env_hackathon() {
    local key="$1"
    local line val
    line=$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -1 || true)
    val=""
    if [ -n "$line" ]; then
      val="${line#*=}"
      val="${val%%#*}"
      val="$(echo "$val" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    fi
    if [ -n "$val" ]; then
      echo -e "  ${GREEN}✓${NC} $key is set"
    else
      echo -e "  ${YELLOW}○${NC} $key empty — add from early.surge.xyz or Discord; see docs/CAPITAL_SANDBOX.md"
    fi
  }

  check_env_hackathon "BASE_CAPITAL_SANDBOX_ROUTER"
  check_env_hackathon "HACKATHON_CAPITAL_VAULT"
  check_env_hackathon "SEPOLIA_RPC_URL"
  check_env_hackathon "HACKATHON_AGENT_ID"

  check_env_agent_id() {
    local key="ERC8004_AGENT_ID"
    local line val
    line=$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -1 || true)
    val=""
    if [ -n "$line" ]; then
      val="${line#*=}"
      val="${val%%#*}"
      val="$(echo "$val" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    fi
    if [ -n "$val" ]; then
      echo -e "  ${GREEN}✓${NC} $key is set"
    else
      echo -e "  ${YELLOW}○${NC} $key empty — after register: npm run register:erc8004 -- '<agentURI>'"
    fi
  }
  check_env_agent_id
fi

echo ""

# 3. Check workspace structure
echo "--- WORKSPACE STRUCTURE ---"
check_dir() {
  if [ -d "$1" ]; then
    echo -e "  ${GREEN}✓${NC} $1/"
  else
    echo -e "  ${RED}✗${NC} $1/ NOT FOUND"
  fi
}

check_dir "apps/backend"
check_dir "apps/frontend"
check_dir "apps/quantum-service"
check_dir "contracts"
check_dir "packages/shared"

echo ""

# 4. Check node_modules
echo "--- DEPENDENCIES ---"
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} Root node_modules exists"
else
  echo -e "${RED}✗${NC} Root node_modules missing — run 'npm install'"
fi

if [ -d "apps/backend/node_modules" ] || [ -d "node_modules/@nestjs" ]; then
  echo -e "${GREEN}✓${NC} Backend dependencies available"
else
  echo -e "${YELLOW}?${NC} Backend deps may need install"
fi

if [ -d "contracts/node_modules" ] || [ -d "node_modules/hardhat" ]; then
  echo -e "${GREEN}✓${NC} Contracts dependencies available"
else
  echo -e "${YELLOW}?${NC} Contracts deps may need: cd contracts && npm install"
fi

echo ""

# 5. Check if backend builds
echo "--- BUILD CHECK ---"
if [ -d "apps/backend/dist" ]; then
  echo -e "${GREEN}✓${NC} Backend dist/ exists (previously built)"
else
  echo -e "${YELLOW}?${NC} Backend not built yet — run 'cd apps/backend && npm run build'"
fi

if [ -d "apps/frontend/.next" ]; then
  echo -e "${GREEN}✓${NC} Frontend .next/ exists (previously built)"
else
  echo -e "${YELLOW}?${NC} Frontend not built yet"
fi

echo ""

# 6. Check contracts compilation
echo "--- CONTRACTS ---"
if [ -d "contracts/artifacts" ]; then
  echo -e "${GREEN}✓${NC} Contracts compiled (artifacts/ exists)"
  for contract in RiskRouter CapitalVault MockUSDC MockWETH; do
    if find contracts/artifacts -name "${contract}.json" 2>/dev/null | head -1 | grep -q .; then
      echo -e "  ${GREEN}✓${NC} ${contract}.sol compiled"
    else
      echo -e "  ${RED}✗${NC} ${contract}.sol NOT compiled"
    fi
  done
else
  echo -e "${RED}✗${NC} Contracts not compiled — run 'cd contracts && npx hardhat compile'"
fi

echo ""

# 7. Check Kraken CLI
echo "--- KRAKEN CLI ---"
if command -v kraken &> /dev/null; then
  echo -e "${GREEN}✓${NC} Kraken CLI installed"

  # Kraken -o json may emit a JSON array ([...]) or object ({...}); first line is not always '{'.
  json_snippet_ok() {
    echo "$1" | head -c 8000 | grep -qE '[\{\[]'
  }

  echo "  Testing paper init..."
  PAPER_OUT=$(kraken paper init --balance 10000 -o json 2>/dev/null || true)
  if json_snippet_ok "$PAPER_OUT"; then
    echo -e "  ${GREEN}✓${NC} Paper trading JSON output OK"
  else
    echo -e "  ${YELLOW}?${NC} Paper init output unexpected (if already initialized, try: kraken paper status -o json)"
  fi

  echo "  Testing market ticker..."
  TICKER_OUT=$(kraken market ticker BTCUSD -o json 2>/dev/null || true)
  if json_snippet_ok "$TICKER_OUT"; then
    echo -e "  ${GREEN}✓${NC} Market ticker JSON OK"
  else
    echo -e "  ${YELLOW}?${NC} Market ticker — try: kraken market ticker BTCUSD -o json | head -c 200"
  fi
else
  echo -e "${RED}✗${NC} Kraken CLI not installed"
fi

echo ""

# 8. Check ports
echo "--- PORTS ---"
check_port() {
  local port="$1"
  local name="$2"
  if command -v lsof &> /dev/null; then
    if lsof -i ":$port" -sTCP:LISTEN &> /dev/null 2>&1; then
      echo -e "  ${GREEN}●${NC} Port $port is ACTIVE ($name)"
      return
    fi
  fi
  if command -v ss &> /dev/null; then
    if ss -tlnp 2>/dev/null | grep -q ":$port "; then
      echo -e "  ${GREEN}●${NC} Port $port is ACTIVE ($name)"
      return
    fi
  fi
  echo -e "  ${YELLOW}○${NC} Port $port is free ($name)"
}

check_port 3000 "Frontend"
check_port 3001 "Backend"
check_port 5433 "PostgreSQL"
check_port 6380 "Redis"
check_port 8000 "Quantum Service"

echo ""
echo "=========================================="
echo " Diagnostic complete."
echo " Fix RED items first, then YELLOW items."
echo "=========================================="
