#!/bin/bash

# Integrate Manus Generated Code into Main Project
# Run this after downloading code from Manus

echo "🔄 Integrating Manus Generated Code..."
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Backup current files
echo -e "${BLUE}📦 Creating backup...${NC}"
BACKUP_DIR="../zentix-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r ../server "$BACKUP_DIR/"
cp -r ../core "$BACKUP_DIR/"
echo -e "${GREEN}✓${NC} Backup created: $BACKUP_DIR"
echo ""

# Copy generated files
echo -e "${BLUE}📂 Copying generated files...${NC}"

# Server files
if [ -f "server/guardianAPI.ts" ]; then
    cp server/guardianAPI.ts ../server/
    echo -e "${GREEN}✓${NC} guardianAPI.ts"
fi

if [ -f "server/governanceDaemon.ts" ]; then
    cp server/governanceDaemon.ts ../server/
    echo -e "${GREEN}✓${NC} governanceDaemon.ts"
fi

# Cron jobs
mkdir -p ../server/cron
if [ -f "server/cron/dailyAudit.ts" ]; then
    cp server/cron/dailyAudit.ts ../server/cron/
    echo -e "${GREEN}✓${NC} dailyAudit.ts"
fi

if [ -f "server/cron/distributeRewards.ts" ]; then
    cp server/cron/distributeRewards.ts ../server/cron/
    echo -e "${GREEN}✓${NC} distributeRewards.ts"
fi

# Core files
if [ -f "core/relayer/relayerService.ts" ]; then
    cp core/relayer/relayerService.ts ../core/relayer/
    echo -e "${GREEN}✓${NC} relayerService.ts"
fi

if [ -f "core/security/guardianAgent.ts" ]; then
    cp core/security/guardianAgent.ts ../core/security/
    echo -e "${GREEN}✓${NC} guardianAgent.ts"
fi

if [ -f "core/security/policyEngine.ts" ]; then
    cp core/security/policyEngine.ts ../core/security/
    echo -e "${GREEN}✓${NC} policyEngine.ts"
fi

# Database
mkdir -p ../core/db
if [ -f "core/db/supabaseClient.ts" ]; then
    cp core/db/supabaseClient.ts ../core/db/
    echo -e "${GREEN}✓${NC} supabaseClient.ts"
fi

echo ""

# Update package.json if needed
echo -e "${BLUE}📝 Updating package.json...${NC}"
if ! grep -q "@supabase/supabase-js" ../package.json; then
    cd ..
    npm install --save @supabase/supabase-js
    echo -e "${GREEN}✓${NC} Supabase dependency added"
    cd zentix-manus
fi

echo ""

# Run type check
echo -e "${BLUE}🔍 Running type check...${NC}"
cd ..
npm run type-check

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Type check passed!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Type check failed. Review errors above.${NC}"
fi

echo ""

# Run build
echo -e "${BLUE}🔨 Building project...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Build failed. Review errors above.${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Integration Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "   1. Test cron jobs:"
echo "      npm run governance:daily-audit"
echo "      npm run governance:distribute-rewards"
echo ""
echo "   2. Test Guardian API:"
echo "      npm run guardian:api"
echo ""
echo "   3. Test Relayer:"
echo "      npm run relayer:server"
echo ""
echo "   4. Deploy to Vercel:"
echo "      npm run deploy:vercel"
echo ""
echo "💾 Backup location: $BACKUP_DIR"
echo ""
