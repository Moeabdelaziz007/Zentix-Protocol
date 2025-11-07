/**
 * Example usage of Coinbase Service
 * This file demonstrates how to use the Coinbase integration service
 */

import { coinbaseService } from '../core/services/coinbaseService';

async function testCoinbaseIntegration() {
  console.log('🪙 Testing Coinbase Integration');
  console.log('════════════════════════════════');
  
  // Check if service is configured
  if (coinbaseService.isConfigured()) {
    console.log('✅ Coinbase service is configured');
    console.log(`🔑 API Key: ${coinbaseService.getMaskedApiKey()}`);
    
    // Initialize client
    const client = await coinbaseService.initializeClient();
    if (client) {
      console.log('🔗 Client initialized successfully');
      
      // Create a test wallet
      const wallet = await coinbaseService.createAgentWallet('test-agent-001');
      if (wallet) {
        console.log('💰 Wallet created:', wallet);
        
        // Get wallet balance
        const balance = await coinbaseService.getWalletBalance(wallet.id);
        console.log('📊 Wallet balance:', balance);
      }
    }
  } else {
    console.log('⚠️  Coinbase service is not configured');
    console.log('Please set COINBASE_API_KEY and COINBASE_API_SECRET in your environment variables');
  }
}

// Run the test
testCoinbaseIntegration().catch(console.error);