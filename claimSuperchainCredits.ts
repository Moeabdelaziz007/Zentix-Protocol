/**
 * Superchain Credit Claim Script
 * Helper script to claim your daily 0.05 ETH and 0.05 OP testnet credits
 */

import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

// Superchain testnet networks
const SUPERCHAIN_TESTNETS = [
  {
    name: 'OP Sepolia',
    chainId: 11155420,
    rpcUrl: 'https://sepolia.optimism.io',
    explorer: 'https://sepolia-optimism.etherscan.io',
    faucet: 'https://console.optimism.io/faucet'
  },
  {
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    explorer: 'https://sepolia.basescan.org',
    faucet: 'https://base.org/developers/tools#faucets'
  }
];

async function checkBalances() {
  console.log('💰 Checking Superchain Testnet Balances...\n');
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log('⚠️  No PRIVATE_KEY found in environment variables');
    console.log('Please add your private key to .env file');
    return;
  }

  for (const network of SUPERCHAIN_TESTNETS) {
    try {
      console.log(`🔗 Checking ${network.name}...`);
      
      // Create provider using fetch-based approach for ethers v6
      // @ts-expect-error - Using v5 syntax for compatibility
      const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);
      const balance = await provider.getBalance(wallet.address);
      
      // Convert balance to ETH using simple division (1 ETH = 10^18 wei)
      const balanceInEth = parseFloat(balance.toString()) / 1e18;
      
      console.log(`   Wallet: ${wallet.address}`);
      console.log(`   Balance: ${balanceInEth} ETH`);
      
      if (balanceInEth < 0.1) {
        console.log(`   💧 Low balance - claim credits at: ${network.faucet}`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error checking ${network.name}:`, error);
    }
  }
  
  console.log('📋 How to claim your daily credits:');
  console.log('1. Visit https://console.optimism.io/faucet');
  console.log('2. Connect your wallet');
  console.log('3. Claim your daily 0.05 ETH and 0.05 OP testnet credits');
  console.log('4. Use these funds for testing on Superchain testnets\n');
}

// Run the balance check
checkBalances()
  .then(() => {
    console.log('🏁 Credit check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error in credit check:', error);
    process.exit(1);
  });