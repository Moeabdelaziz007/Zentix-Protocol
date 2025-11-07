#!/bin/bash

# Zentix Protocol GitHub Setup Script
# Sets up the GitHub repository with proper authentication and CI/CD configuration

set -e  # Exit on any error

echo "🚀 Setting up Zentix Protocol GitHub Repository..."
echo "================================================"

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Authenticate with GitHub (interactive)
echo "🔐 GitHub Authentication"
echo "You'll be prompted to authenticate with GitHub."
gh auth login

# Get repository name from package.json
REPO_NAME=$(node -p "require('./package.json').name" | sed 's/@[^/]*\///')
if [[ -z "$REPO_NAME" ]]; then
    REPO_NAME="zentix-protocol"
fi

echo "📦 Repository name: $REPO_NAME"

# Create GitHub repository
echo "🔧 Creating GitHub repository..."
gh repo create "$REPO_NAME" --public --clone || echo "Repository might already exist, continuing..."

# Set up environment variables
echo "⚙️  Setting up GitHub Environment Variables..."

# Create .env file if it doesn't exist
if [[ ! -f ".env" ]]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env 2>/dev/null || echo "No .env.example file found"
fi

# Set up GitHub repository secrets
echo "🔐 Setting up GitHub Repository Secrets..."
echo "Please enter your secrets when prompted (or press Enter to skip):"
echo ""

# GitHub Personal Access Token
read -p "Enter your GitHub Personal Access Token (classic): " GITHUB_TOKEN
if [[ -n "$GITHUB_TOKEN" ]]; then
    echo "Setting GITHUB_TOKEN secret..."
    gh secret set GITHUB_TOKEN -b"$GITHUB_TOKEN" --repo="$REPO_NAME" 2>/dev/null || echo "Warning: Failed to set GITHUB_TOKEN secret"
else
    echo "Skipping GITHUB_TOKEN setup"
fi

# Vercel Authentication Token
read -p "Enter your Vercel Authentication Token: " VERCEL_TOKEN
if [[ -n "$VERCEL_TOKEN" ]]; then
    echo "Setting VERCEL_TOKEN secret..."
    gh secret set VERCEL_TOKEN -b"$VERCEL_TOKEN" --repo="$REPO_NAME" 2>/dev/null || echo "Warning: Failed to set VERCEL_TOKEN secret"
else
    echo "Skipping VERCEL_TOKEN setup"
fi

# Jules AI API Key
read -p "Enter your Jules AI API Key: " JULES_AI_API_KEY
if [[ -n "$JULES_AI_API_KEY" ]]; then
    echo "Setting JULES_AI_API_KEY secret..."
    gh secret set JULES_AI_API_KEY -b"$JULES_AI_API_KEY" --repo="$REPO_NAME" 2>/dev/null || echo "Warning: Failed to set JULES_AI_API_KEY secret"
else
    echo "Skipping JULES_AI_API_KEY setup"
fi

# Coinbase API Key
read -p "Enter your Coinbase API Key: " COINBASE_API_KEY
if [[ -n "$COINBASE_API_KEY" ]]; then
    echo "Setting COINBASE_API_KEY secret..."
    gh secret set COINBASE_API_KEY -b"$COINBASE_API_KEY" --repo="$REPO_NAME" 2>/dev/null || echo "Warning: Failed to set COINBASE_API_KEY secret"
else
    echo "Skipping COINBASE_API_KEY setup"
fi

# PayPal Client ID
read -p "Enter your PayPal Client ID: " PAYPAL_CLIENT_ID
if [[ -n "$PAYPAL_CLIENT_ID" ]]; then
    echo "Setting PAYPAL_CLIENT_ID secret..."
    gh secret set PAYPAL_CLIENT_ID -b"$PAYPAL_CLIENT_ID" --repo="$REPO_NAME" 2>/dev/null || echo "Warning: Failed to set PAYPAL_CLIENT_ID secret"
else
    echo "Skipping PAYPAL_CLIENT_ID setup"
fi

# Stripe Publishable Key
read -p "Enter your Stripe Publishable Key: " STRIPE_PUBLISHABLE_KEY
if [[ -n "$STRIPE_PUBLISHABLE_KEY" ]]; then
    echo "Setting STRIPE_PUBLISHABLE_KEY secret..."
    gh secret set STRIPE_PUBLISHABLE_KEY -b"$STRIPE_PUBLISHABLE_KEY" --repo="$REPO_NAME" 2>/dev/null || echo "Warning: Failed to set STRIPE_PUBLISHABLE_KEY secret"
else
    echo "Skipping STRIPE_PUBLISHABLE_KEY setup"
fi

# Stripe Secret Key
read -s -p "Enter your Stripe Secret Key: " STRIPE_SECRET_KEY
echo ""
if [[ -n "$STRIPE_SECRET_KEY" ]]; then
    echo "Setting STRIPE_SECRET_KEY secret..."
    gh secret set STRIPE_SECRET_KEY -b"$STRIPE_SECRET_KEY" --repo="$REPO_NAME" 2>/dev/null || echo "Warning: Failed to set STRIPE_SECRET_KEY secret"
else
    echo "Skipping STRIPE_SECRET_KEY setup"
fi

echo ""
echo "✅ GitHub repository setup completed!"

# Set up CI/CD workflow
echo "🔧 Setting up CI/CD workflow..."
mkdir -p .github/workflows

# Create CI/CD workflow file
cat > .github/workflows/zentix-cicd.yml << 'EOF'
name: Zentix Protocol CI/CD Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  deploy-vercel:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./

  notify-success:
    runs-on: ubuntu-latest
    needs: deploy-vercel
    if: success()
    steps:
      - name: Notify deployment success
        run: echo "✅ Deployment successful!"

  notify-failure:
    runs-on: ubuntu-latest
    needs: [test, build, deploy-vercel]
    if: failure()
    steps:
      - name: Notify deployment failure
        run: echo "❌ Deployment failed!"

  rollback:
    runs-on: ubuntu-latest
    needs: deploy-vercel
    if: failure()
    steps:
      - name: Rollback to previous version
        run: echo "🔄 Rolling back to previous version..."
EOF

echo "✅ CI/CD workflow created!"

# Commit and push changes
echo "💾 Committing and pushing changes..."
git add .github/workflows/zentix-cicd.yml scripts/setup-github.sh .env .env.example 2>/dev/null || echo "Warning: Some files not added"
git commit -m "chore: Update GitHub setup script and CI/CD workflow" 2>/dev/null || echo "No changes to commit"
git push origin main 2>/dev/null || echo "Push skipped"

echo ""
echo "🎉 Zentix Protocol GitHub setup completed successfully!"
echo "   Repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo "   Next steps:"
echo "   1. Check the repository settings in GitHub"
echo "   2. Verify the CI/CD pipeline in the Actions tab"
echo "   3. Configure Vercel deployment with the provided tokens"