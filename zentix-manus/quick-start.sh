#!/bin/bash

# Zentix Manus Quick Start Guide
# This script helps you prepare and use the zentix-manus folder

echo "🌌 Zentix Protocol - Manus Integration Quick Start"
echo "=================================================="
echo ""

# Step 1: Show folder structure
echo "📂 Folder Structure:"
echo ""
tree -L 3 -I 'node_modules' . 2>/dev/null || find . -not -path '*/node_modules/*' -type f | head -20
echo ""

# Step 2: Package for Manus
echo "📦 Packaging for Manus Upload..."
cd ..
zip -r zentix-manus.zip zentix-manus/ -x "*.DS_Store" "*/node_modules/*"
echo "✅ Created: zentix-manus.zip"
echo ""

# Step 3: Instructions
echo "🚀 Next Steps:"
echo ""
echo "1. Upload to Manus:"
echo "   - Go to https://manus.app"
echo "   - Create new project"
echo "   - Upload zentix-manus.zip"
echo ""
echo "2. Copy the Prompt:"
echo "   - Open: zentix-manus/MANUS_PROMPT.txt"
echo "   - Copy entire content"
echo "   - Paste in Manus chat"
echo ""
echo "3. After Manus Generates:"
echo "   - Download generated files"
echo "   - Run: ./integrate-manus-output.sh"
echo ""
echo "📋 Files Ready for Manus:"
echo "   ✅ 2 Server files (guardianAPI, governanceDaemon)"
echo "   ✅ 3 Core files (relayer, guardianAgent, policyEngine)"
echo "   ✅ 1 Database client (supabaseClient)"
echo "   ✅ 2 Cron jobs (dailyAudit, distributeRewards)"
echo "   ✅ Config files (package.json, tsconfig.json)"
echo ""
echo "🎯 Expected Output from Manus:"
echo "   - ~500-800 lines of new code"
echo "   - All TypeScript errors fixed"
echo "   - Ready for production deployment"
echo ""
echo "📍 Prompt file: zentix-manus/MANUS_PROMPT.txt"
echo "📍 ZIP file: zentix-manus.zip"
echo ""
echo "Good luck! 🚀"
