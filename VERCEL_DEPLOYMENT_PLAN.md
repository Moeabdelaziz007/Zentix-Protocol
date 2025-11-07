# Zentix Protocol - Vercel Deployment Plan

## Overview
This document outlines the comprehensive deployment plan for the Zentix Protocol application on Vercel. The deployment includes both the frontend dashboard and API services, with proper environment variable management and build configurations.

## 1. Prerequisites

### 1.1 Vercel Account Setup
- Create a Vercel account at [vercel.com](https://vercel.com)
- Install Vercel CLI: `npm i -g vercel`
- Login to Vercel CLI: `vercel login`

### 1.2 GitHub Integration (Recommended)
- Connect GitHub repository to Vercel for automated deployments
- Grant necessary permissions for repository access

### 1.3 Domain Configuration (Optional)
- Custom domain setup in Vercel dashboard
- DNS configuration for custom domains

## 2. Environment Variables Configuration

### 2.1 Critical Security Variables (Set via Vercel Dashboard)
These variables must be set as "Secrets" in the Vercel dashboard for security:

```bash
# Blockchain Configuration
BLOCKCHAIN_PRIVATE_KEY_DEV
BLOCKCHAIN_PRIVATE_KEY_PROD

# API Keys
PINATA_API_KEY
PINATA_SECRET_KEY
INFURA_PROJECT_ID
INFURA_SECRET
COINBASE_API_KEY
COINBASE_API_SECRET
STRIPE_SECRET_KEY_TEST
STRIPE_SECRET_KEY_PROD
PAYPAL_CLIENT_ID_SANDBOX
PAYPAL_CLIENT_ID_PRODUCTION
GEMINI_API_KEY
ERNIE_BOT_API_KEY
ERNIE_BOT_SECRET_KEY
DEEPSEEK_API_KEY
HUGGING_FACE_API_KEY

# Database and Infrastructure
QDRANT_API_KEY
REDIS_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
```

### 2.2 Environment-Specific Variables
These can be set in the Vercel dashboard or in code:

```bash
# Development Environment
DEVELOPMENT_RPC_MUMBAI=https://rpc.ankr.com/polygon_mumbai
DEVELOPMENT_ZXT_TOKEN_ADDRESS_MUMBAI=
DEVELOPMENT_ANCHOR_REGISTRY_ADDRESS_MUMBAI=

# Production Environment
PRODUCTION_RPC_POLYGON=https://polygon-rpc.com
PRODUCTION_ZXT_TOKEN_ADDRESS_POLYGON=
PRODUCTION_ANCHOR_REGISTRY_ADDRESS_POLYGON=

# Monitoring and Notifications
SLACK_WEBHOOK_URL=
DISCORD_WEBHOOK_URL=
```

### 2.3 Setting Secrets via CLI
For initial setup, use the Vercel CLI to set secrets:

```bash
# Blockchain secrets
vercel env add BLOCKCHAIN_PRIVATE_KEY_DEV development
vercel env add BLOCKCHAIN_PRIVATE_KEY_PROD production

# API keys
vercel env add PINATA_API_KEY production
vercel env add PINATA_SECRET_KEY production
vercel env add INFURA_PROJECT_ID production
vercel env add COINBASE_API_KEY production
vercel env add GEMINI_API_KEY production

# Database secrets
vercel env add QDRANT_API_KEY production
vercel env add REDIS_URL production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
```

## 3. Project Configuration

### 3.1 Vercel Configuration Files

#### 3.1.1 Root [vercel.json](file:///Users/cryptojoker710/Desktop/Zentix%20Protocol/vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods", 
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/health",
      "destination": "/api/health"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/dist/$1"
    },
    {
      "source": "/dashboard",
      "destination": "/api/monitoring/dashboard"
    },
    {
      "source": "/metrics",
      "destination": "/api/monitoring/metrics"
    }
  ]
}
```

#### 3.1.2 Deploy Configuration [/deploy/vercel.json](file:///Users/cryptojoker710/Desktop/Zentix%20Protocol/deploy/vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

### 3.2 Frontend Configuration

#### 3.2.1 [frontend/package.json](file:///Users/cryptojoker710/Desktop/Zentix%20Protocol/frontend/package.json) Scripts
Ensure the build script is properly configured:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

#### 3.2.2 Vite Configuration [frontend/vite.config.ts](file:///Users/cryptojoker710/Desktop/Zentix%20Protocol/frontend/vite.config.ts)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@tailwindcss/vite', 'tailwindcss', 'framer-motion'],
          charts: ['recharts'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true
  }
});
```

## 4. Build Process

### 4.1 Frontend Build
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Build the frontend:
   ```bash
   npm run build
   ```

3. The build output will be in `frontend/dist/`

### 4.2 API Build
1. The API functions in the [api/](file:///Users/cryptojoker710/Desktop/Zentix%20Protocol/api/) directory are automatically built by Vercel
2. Ensure all dependencies are in the root [package.json](file:///Users/cryptojoker710/Desktop/Zentix%20Protocol/package.json)

## 5. Deployment Steps

### 5.1 Initial Deployment
1. Link the project to Vercel:
   ```bash
   vercel
   ```

2. Follow the prompts to:
   - Set the project name
   - Select the framework (Vite for frontend)
   - Set the root directory
   - Configure build settings

3. Deploy to production:
   ```bash
   vercel --prod
   ```

### 5.2 Automated Deployments
1. Connect GitHub repository in Vercel dashboard
2. Configure deployment settings:
   - Production branch: `main`
   - Automatic deployments: Enabled
   - Preview deployments: Enabled for all branches

### 5.3 Manual Deployment via CLI
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy with specific environment
vercel --env NODE_ENV=production
```

## 6. Monitoring and Maintenance

### 6.1 Health Checks
- Vercel automatically monitors deployments
- Custom health endpoints at `/api/health`
- Metrics available at `/api/metrics`

### 6.2 Error Monitoring
- Vercel logs accessible via dashboard
- Integration with error tracking services (optional)
- Custom error handling in API functions

### 6.3 Performance Optimization
- Vercel's Edge Network for global distribution
- Caching headers configured in [vercel.json](file:///Users/cryptojoker710/Desktop/Zentix%20Protocol/vercel.json)
- Asset optimization through Vercel's build process

## 7. Rollback Procedures

### 7.1 Automatic Rollbacks
- Vercel automatically rolls back failed deployments
- Previous working version is restored

### 7.2 Manual Rollbacks
1. Access Vercel dashboard
2. Navigate to deployments
3. Select a previous working deployment
4. Redeploy that version

## 8. Security Considerations

### 8.1 Environment Variables
- All secrets stored as Vercel Secrets
- Never commit secrets to git
- Regular secret rotation

### 8.2 HTTPS Enforcement
- Vercel automatically provides HTTPS
- HSTS headers configured

### 8.3 CORS and Security Headers
- Configured in [vercel.json](file:///Users/cryptojoker710/Desktop/Zentix%20Protocol/vercel.json)
- Content security policies
- XSS protection headers

## 9. Scaling and Performance

### 9.1 Vercel Edge Network
- Global distribution of static assets
- API functions run on Vercel's serverless infrastructure

### 9.2 Caching Strategy
- Static assets cached with long TTL
- API responses cached where appropriate
- Redis caching for database queries

### 9.3 Resource Optimization
- Code splitting in frontend build
- Bundle size optimization
- Image optimization through Vercel

## 10. CI/CD Integration

### 10.1 GitHub Actions Workflow
```yaml
name: Deploy to Vercel
on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 10.2 Environment Variables in CI/CD
- Store Vercel tokens as GitHub secrets
- Use environment-specific secrets for different deployment stages

## 11. Troubleshooting

### 11.1 Common Issues
1. **Build failures**: Check dependencies and build scripts
2. **Environment variables not loading**: Verify secrets are set in Vercel dashboard
3. **API function timeouts**: Optimize function code or increase timeout limits
4. **Frontend routing issues**: Check rewrites configuration in [vercel.json](file:///Users/cryptojoker710/Desktop/Zentix%20Protocol/vercel.json)

### 11.2 Debugging Steps
1. Check Vercel logs in dashboard
2. Run local development server to reproduce issues
3. Validate environment variables locally
4. Test API functions independently

This deployment plan ensures a secure, scalable, and maintainable deployment of the Zentix Protocol application on Vercel.