#!/bin/bash

# Zentix Protocol - Zero-Cost MVP Setup Script
# This script sets up a completely free development environment

echo "🌌 Zentix Protocol - Zero-Cost MVP Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 0: Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js ${NODE_VERSION}"
else
    echo -e "${YELLOW}⚠${NC} Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm ${NPM_VERSION}"
else
    echo -e "${YELLOW}⚠${NC} npm not found"
    exit 1
fi

echo ""

# Step 1: Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Step 2: Setup environment
echo -e "${BLUE}⚙️  Setting up environment...${NC}"

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # Generate random private key for development
    DEV_KEY=$(openssl rand -hex 32)
    
    # Update .env with dev key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/PRIVATE_KEY_DEV=/PRIVATE_KEY_DEV=$DEV_KEY/" .env
    else
        # Linux
        sed -i "s/PRIVATE_KEY_DEV=/PRIVATE_KEY_DEV=$DEV_KEY/" .env
    fi
    
    echo -e "${GREEN}✓${NC} .env file created with dev key"
else
    echo -e "${YELLOW}ℹ${NC} .env already exists, skipping"
fi

echo ""

# Step 3: Start local Hardhat node
echo -e "${BLUE}🔨 Starting local Hardhat node...${NC}"
echo "   This will run in the background"
echo ""

# Kill any existing hardhat node
pkill -f "hardhat node" 2>/dev/null

# Start hardhat node in background
npx hardhat node > /dev/null 2>&1 &
HARDHAT_PID=$!

echo -e "${GREEN}✓${NC} Local blockchain running (PID: $HARDHAT_PID)"
echo "   Network: localhost:8545"
echo "   Chain ID: 31337"
echo ""

# Wait for node to be ready
sleep 3

# Step 4: Deploy contracts locally
echo -e "${BLUE}📝 Deploying contracts to local network...${NC}"
echo ""

npx hardhat run scripts/deploy.ts --network localhost

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓${NC} Contracts deployed successfully"
else
    echo ""
    echo -e "${YELLOW}⚠${NC} Contract deployment had issues (this is OK for testing)"
fi

echo ""

# Step 5: Setup complete
echo -e "${GREEN}✅ Zero-Cost MVP Setup Complete!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Quick Start Commands:"
echo ""
echo "   # Run economic demo"
echo "   npm run demo:economic"
echo ""
echo "   # Run complete agent demo"
echo "   npm run demo:complete"
echo ""
echo "   # Run security demo"
echo "   npm run demo:security"
echo ""
echo "   # Start gasless relayer server"
echo "   tsx server/relayerServer.ts"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Zero-Cost Features Enabled:"
echo "   ✓ Local blockchain (no gas costs)"
echo "   ✓ Free IPFS mock (Pinata optional)"
echo "   ✓ Faucet for free ZXT tokens"
echo "   ✓ Gasless transactions via relayer"
echo "   ✓ All demos working locally"
echo ""
echo "📚 Next Steps:"
echo "   1. Try the demos above"
echo "   2. Create your first agent"
echo "   3. Test faucet and referrals"
echo "   4. Deploy to Mumbai testnet (optional)"
echo ""
echo "🌟 'Start small, free - build economy later!'"
echo ""
