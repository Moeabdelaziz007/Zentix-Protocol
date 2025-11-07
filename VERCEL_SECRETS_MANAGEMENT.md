# Secure Environment Variable Management for Vercel
# This file provides the configuration and setup for secure environment variable management

# 1. Vercel Project Environment Variables Configuration
# These should be set in the Vercel dashboard, not in code or CLI

# Critical Environment Variables (High Security - Use Vercel Secrets)

## Blockchain Configuration
# Use Vercel secrets for these critical values
VERCEL_SECRET_BLOCKCHAIN_PRIVATE_KEY_DEV=               # Development private key
VERCEL_SECRET_BLOCKCHAIN_PRIVATE_KEY_PROD=               # Production private key

## API Keys (High Security)
VERCEL_SECRET_PINATA_API_KEY=                            # Pinata API key
VERCEL_SECRET_PINATA_SECRET_KEY=                         # Pinata secret key
VERCEL_SECRET_INFURA_PROJECT_ID=                         # Infura project ID
VERCEL_SECRET_INFURA_SECRET=                             # Infura secret

## Payment and Financial Services
VERCEL_SECRET_COINBASE_API_KEY=                          # Coinbase API key
VERCEL_SECRET_COINBASE_API_SECRET=                       # Coinbase API secret
VERCEL_SECRET_STRIPE_SECRET_KEY_TEST=                    # Stripe test secret key
VERCEL_SECRET_STRIPE_SECRET_KEY_PROD=                    # Stripe production secret key
VERCEL_SECRET_PAYPAL_CLIENT_ID_SANDBOX=                  # PayPal sandbox client ID
VERCEL_SECRET_PAYPAL_CLIENT_ID_PRODUCTION=               # PayPal production client ID

## Advanced AI Services
VERCEL_SECRET_GEMINI_API_KEY=                            # Google Gemini API key
VERCEL_SECRET_ERNIE_BOT_API_KEY=                         # Ernie Bot API key
VERCEL_SECRET_ERNIE_BOT_SECRET_KEY=                      # Ernie Bot secret key
VERCEL_SECRET_DEEPSEEK_API_KEY=                          # DeepSeek API key
VERCEL_SECRET_HUGGING_FACE_API_KEY=                      # Hugging Face API key

## Database and Infrastructure
VERCEL_SECRET_QDRANT_API_KEY=                            # Qdrant vector database key
VERCEL_SECRET_REDIS_URL=                                 # Redis connection URL
VERCEL_SECRET_SUPABASE_URL=                              # Supabase project URL
VERCEL_SECRET_SUPABASE_ANON_KEY=                         # Supabase anonymous key
VERCEL_SECRET_SUPABASE_SERVICE_KEY=                      # Supabase service role key

# Environment-Specific Variables (Medium Security - Can be in code if needed)

## Development Environment
DEVELOPMENT_RPC_MUMBAI=https://rpc.ankr.com/polygon_mumbai
DEVELOPMENT_ZXT_TOKEN_ADDRESS_MUMBAI=                    # Development contract address
DEVELOPMENT_ANCHOR_REGISTRY_ADDRESS_MUMBAI=              # Development registry address

## Production Environment  
PRODUCTION_RPC_POLYGON=https://polygon-rpc.com
PRODUCTION_ZXT_TOKEN_ADDRESS_POLYGON=                    # Production contract address
PRODUCTION_ANCHOR_REGISTRY_ADDRESS_POLYGON=              # Production registry address

## Monitoring and Notifications
SLACK_WEBHOOK_URL=                                       # Slack notification webhook
DISCORD_WEBHOOK_URL=                                     # Discord notification webhook

# 2. Setting up Vercel Secrets (Command Line)
# Use these commands to set up secrets securely

# Install Vercel CLI if not already installed
# npm i -g vercel

# Login to Vercel
# vercel login

# Set secrets (NEVER use these in scripts committed to git)
# vercel env add BLOCKCHAIN_PRIVATE_KEY_DEV production
# vercel env add BLOCKCHAIN_PRIVATE_KEY_PROD production
# vercel env add PINATA_API_KEY production
# vercel env add PINATA_SECRET_KEY production
# vercel env add COINBASE_API_KEY production
# vercel env add GEMINI_API_KEY production

# List current environment variables
# vercel env ls

# Remove environment variable
# vercel env rm VARIABLE_NAME production

# 3. Using Environment Variables in Code

# In Node.js/TypeScript
const apiKey = process.env.VERCEL_SECRET_PINATA_API_KEY;

// In Vercel functions
export default function handler(req, res) {
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY_PROD;
  const apiKey = process.env.PINATA_API_KEY;
  
  // Use the secrets securely
}

# 4. Security Best Practices

## Secret Rotation
# - Rotate all secrets quarterly
# - Use time-limited tokens when possible
# - Monitor for unauthorized access

## Access Control
# - Limit who can access production secrets
# - Use different secrets for different environments
# - Audit secret access regularly

## Monitoring
# - Monitor for secret exposure in logs
# - Set up alerts for unauthorized access attempts
# - Log all secret access for audit trails

## Development Practices
# - Never commit secrets to git
# - Use .env.local for local development
# - Use Vercel secrets for production
# - Implement proper error handling for missing secrets

# 5. Environment-Specific Secret Configuration

# Development
BLOCKCHAIN_PRIVATE_KEY=dev-private-key-here
PINATA_API_KEY=development-pinata-key
INFURA_PROJECT_ID=development-infura-id

# Staging
BLOCKCHAIN_PRIVATE_KEY=staging-private-key-here
PINATA_API_KEY=staging-pinata-key
INFURA_PROJECT_ID=staging-infura-id

# Production
BLOCKCHAIN_PRIVATE_KEY=prod-private-key-here
PINATA_API_KEY=production-pinata-key
INFURA_PROJECT_ID=production-infura-id

# 6. Error Handling for Missing Secrets

function validateRequiredSecrets() {
  const requiredSecrets = [
    'BLOCKCHAIN_PRIVATE_KEY_PROD',
    'PINATA_API_KEY',
    'COINBASE_API_KEY'
  ];
  
  const missingSecrets = requiredSecrets.filter(secret => !process.env[secret]);
  
  if (missingSecrets.length > 0) {
    throw new Error(`Missing required secrets: ${missingSecrets.join(', ')}`);
  }
}

# 7. Secret Validation Function

function validateSecrets() {
  const validations = {
    'BLOCKCHAIN_PRIVATE_KEY_PROD': (value) => 
      value && value.length > 0 && value.startsWith('0x'),
    'PINATA_API_KEY': (value) => 
      value && value.length > 0 && value.startsWith('pk.'),
    'GEMINI_API_KEY': (value) => 
      value && value.length > 20
  };
  
  for (const [secret, validator] of Object.entries(validations)) {
    const value = process.env[secret];
    if (!validator(value)) {
      console.error(`Invalid or missing secret: ${secret}`);
      process.exit(1);
    }
  }
  
  console.log('✅ All secrets validated successfully');
}

# 8. Implementation in CI/CD Pipeline

# In GitHub Actions workflow
- name: Deploy to Vercel
  run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    # Production secrets are automatically available
    BLOCKCHAIN_PRIVATE_KEY_PROD: ${{ secrets.BLOCKCHAIN_PRIVATE_KEY_PROD }}

# 9. Rollback Security

# If secrets are compromised, immediately:
# 1. Revoke the compromised secrets
# 2. Generate new secrets
# 3. Update all deployment environments
# 4. Force new deployments
# 5. Monitor for any unusual activity

# 10. Audit and Compliance

# - Document all secrets and their purpose
# - Regular access audits
# - Compliance with data protection regulations
# - Incident response plan for secret exposure