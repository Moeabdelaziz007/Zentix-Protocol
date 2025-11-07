#!/bin/bash

# Deploy Zentix Governance to Manus Cloud
# This script guides you through deploying to Manus

echo "🌌 Zentix Protocol - Manus Cloud Deployment"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if manus CLI is installed
if ! command -v manus &> /dev/null; then
    echo -e "${RED}❌ Manus CLI not found${NC}"
    echo ""
    echo "Please install Manus CLI first:"
    echo "  npm install -g @manus/cli"
    echo ""
    echo "Or visit: https://docs.manus.cloud/cli"
    exit 1
fi

echo -e "${GREEN}✓${NC} Manus CLI found"
echo ""

# Step 1: Login to Manus
echo -e "${BLUE}Step 1: Login to Manus Cloud${NC}"
echo ""
echo "Running: manus login"
manus login

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Logged in successfully"
echo ""

# Step 2: Create project
echo -e "${BLUE}Step 2: Create/Select Project${NC}"
echo ""
read -p "Enter project name (default: zentix-governance): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-zentix-governance}

echo "Creating project: $PROJECT_NAME"
manus projects create "$PROJECT_NAME" --runtime node18

echo ""

# Step 3: Configure secrets
echo -e "${BLUE}Step 3: Configure Secrets${NC}"
echo ""
echo "Setting up environment variables..."
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Found .env file"
    
    # Read from .env and set secrets
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        
        # Set secret in Manus
        if [ ! -z "$value" ]; then
            echo "Setting secret: $key"
            echo "$value" | manus secrets set "$key" --project "$PROJECT_NAME"
        fi
    done < .env
else
    echo -e "${YELLOW}⚠${NC} No .env file found"
    echo "You'll need to set secrets manually:"
    echo ""
    echo "Required secrets:"
    echo "  - RPC_MUMBAI"
    echo "  - PRIVATE_KEY_DEV"
    echo "  - PINATA_API_KEY (optional)"
    echo "  - PINATA_SECRET_KEY (optional)"
    echo ""
    echo "Set them with:"
    echo "  manus secrets set SECRET_NAME --project $PROJECT_NAME"
fi

echo ""

# Step 4: Deploy
echo -e "${BLUE}Step 4: Deploy to Manus${NC}"
echo ""
echo "Deploying from manus.yaml..."
manus deploy --project "$PROJECT_NAME" --config manus.yaml

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment Successful!${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🎉 Zentix Governance is now running on Manus Cloud!"
    echo ""
    echo "📊 View your deployment:"
    echo "   manus dashboard --project $PROJECT_NAME"
    echo ""
    echo "📡 API Endpoints:"
    echo "   Guardian API: https://$PROJECT_NAME.manus.cloud/api"
    echo "   Health Check: https://$PROJECT_NAME.manus.cloud/health"
    echo ""
    echo "📜 View logs:"
    echo "   manus logs governance-daemon --project $PROJECT_NAME"
    echo "   manus logs guardian-api --project $PROJECT_NAME"
    echo ""
    echo "📈 Monitoring:"
    echo "   View metrics in Manus dashboard"
    echo "   Alerts configured for violations and low balance"
    echo ""
    echo "💡 Next Steps:"
    echo "   1. Test the API endpoints"
    echo "   2. Deploy smart contracts to Mumbai testnet"
    echo "   3. Configure governance rewards"
    echo "   4. Invite guardians to the network"
    echo ""
    echo "🌟 'Building a digital civilization with law and ethics!'"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check logs with: manus logs --project $PROJECT_NAME"
    exit 1
fi
