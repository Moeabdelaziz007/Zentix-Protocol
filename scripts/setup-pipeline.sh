#!/bin/bash

# Zentix Protocol - Complete Deployment Setup
# This script sets up the entire pipeline: Manus → GitHub → Vercel

set -e

echo "🌌 Zentix Protocol - Complete Deployment Setup"
echo "═══════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: GitHub Repository Setup
echo -e "${BLUE}Step 1: GitHub Repository Setup${NC}"
echo ""

read -p "GitHub username/org (default: amrikyy): " GITHUB_USER
GITHUB_USER=${GITHUB_USER:-amrikyy}

read -p "Repository name (default: zentix-protocol): " REPO_NAME
REPO_NAME=${REPO_NAME:-zentix-protocol}

echo -e "${GREEN}✓${NC} Will use: ${GITHUB_USER}/${REPO_NAME}"
echo ""

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    echo -e "${GREEN}✓${NC} Git initialized"
else
    echo -e "${GREEN}✓${NC} Git repository exists"
fi

# Add remote if it doesn't exist
if ! git remote get-url origin &> /dev/null; then
    echo "Adding GitHub remote..."
    git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
    echo -e "${GREEN}✓${NC} Remote added"
else
    echo -e "${GREEN}✓${NC} Remote already exists"
fi

echo ""

# Step 2: Vercel Setup
echo -e "${BLUE}Step 2: Vercel Setup${NC}"
echo ""

if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Vercel CLI not found. Install with: npm i -g vercel"
    read -p "Install Vercel CLI now? (y/n): " install_vercel
    if [ "$install_vercel" = "y" ]; then
        npm install -g vercel
        echo -e "${GREEN}✓${NC} Vercel CLI installed"
    fi
fi

if command -v vercel &> /dev/null; then
    echo "Linking to Vercel project..."
    vercel link --yes
    echo -e "${GREEN}✓${NC} Vercel project linked"
else
    echo -e "${YELLOW}⚠${NC} Skipping Vercel setup. Install CLI later."
fi

echo ""

# Step 3: MCP Server Setup
echo -e "${BLUE}Step 3: MCP Server Setup${NC}"
echo ""

cd mcp-server

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env created from template"
    echo -e "${YELLOW}⚠${NC} Please edit mcp-server/.env with your credentials"
else
    echo -e "${GREEN}✓${NC} .env already exists"
fi

echo "Installing MCP server dependencies..."
npm install
echo -e "${GREEN}✓${NC} Dependencies installed"

cd ..
echo ""

# Step 4: GitHub Secrets Setup
echo -e "${BLUE}Step 4: GitHub Secrets${NC}"
echo ""
echo "Required GitHub Secrets (add these manually in GitHub repo settings):"
echo ""
echo "1. VERCEL_TOKEN          - Get from vercel.com/account/tokens"
echo "2. VERCEL_ORG_ID         - From .vercel/project.json"
echo "3. VERCEL_PROJECT_ID     - From .vercel/project.json"
echo "4. GH_TOKEN              - GitHub Personal Access Token"
echo "5. RPC_MUMBAI            - Polygon Mumbai RPC URL"
echo "6. PINATA_API_KEY        - Pinata API key (optional)"
echo "7. PINATA_SECRET_KEY     - Pinata secret (optional)"
echo ""

if [ -f ".vercel/project.json" ]; then
    echo "Your Vercel IDs:"
    cat .vercel/project.json | grep -E '"orgId"|"projectId"'
    echo ""
fi

# Step 5: First Commit & Push
echo -e "${BLUE}Step 5: Initial Commit${NC}"
echo ""

git add .
git commit -m "🚀 Initial Zentix Protocol setup with MCP pipeline" || echo "Nothing to commit"

echo ""
read -p "Push to GitHub now? (y/n): " push_now

if [ "$push_now" = "y" ]; then
    git branch -M main
    git push -u origin main
    echo -e "${GREEN}✓${NC} Pushed to GitHub"
else
    echo -e "${YELLOW}ℹ${NC} Skipped push. Run manually: git push -u origin main"
fi

echo ""

# Step 6: Start MCP Server
echo -e "${BLUE}Step 6: MCP Server${NC}"
echo ""

read -p "Start MCP server now? (y/n): " start_mcp

if [ "$start_mcp" = "y" ]; then
    echo "Starting MCP server..."
    cd mcp-server
    npm start &
    MCP_PID=$!
    echo -e "${GREEN}✓${NC} MCP server started (PID: $MCP_PID)"
    echo "   Access at: http://localhost:8080/health"
    cd ..
else
    echo -e "${YELLOW}ℹ${NC} To start later: cd mcp-server && npm start"
fi

echo ""
echo "═══════════════════════════════════════════════"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Add GitHub Secrets (see list above)"
echo "2. Configure Manus webhook:"
echo "   URL: https://your-mcp-server.com/manus/webhook"
echo "   Secret: (from mcp-server/.env)"
echo ""
echo "3. Test the pipeline:"
echo "   - Build something in Manus"
echo "   - Check MCP server logs"
echo "   - Verify GitHub commit"
echo "   - Check Vercel deployment"
echo ""
echo "4. Deploy to production:"
echo "   vercel --prod"
echo ""
echo "🌟 Your auto-deployment pipeline is ready!"
echo ""
