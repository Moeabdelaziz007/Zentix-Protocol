/**
 * Superchain Developer Console Connection Script
 * This script helps connect to the Optimism Superchain Developer Console
 * and demonstrates how to use the daily testnet credits (0.05 ETH and OP)
 */

import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { superchainBridge } from './src/core/superchainBridge';

dotenv.config();

// Superchain testnet networks
const SUPERCHAIN_TESTNETS = [
  {
    name: 'OP Sepolia',
    chainId: 11155420,
    rpcUrl: 'https://sepolia.optimism.io',
    explorer: 'https://sepolia-optimism.etherscan.io'
  },
  {
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    explorer: 'https://sepolia.basescan.org'
  }
];

// Superchain mainnet networks
const SUPERCHAIN_MAINNETS = [
  {
    name: 'OP Mainnet',
    chainId: 10,
    rpcUrl: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io'
  },
  {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org'
  },
  {
    name: 'Zora',
    chainId: 7777777,
    rpcUrl: 'https://rpc.zora.energy',
    explorer: 'https://explorer.zora.energy'
  },
  {
    name: 'Mode',
    chainId: 34443,
    rpcUrl: 'https://mainnet.mode.network',
    explorer: 'https://explorer.mode.network'
  }
];

// Wallet address from user input
const WALLET_ADDRESS = '0x5768A93D15D1756e91b7CaB7D6ab06740072Fe0E';

async function connectToSuperchainConsole() {
  console.log('🚀 Connecting to Superchain Developer Console...\n');
  
  // Check if we have a private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.log('⚠️  No PRIVATE_KEY found in environment variables');
    console.log('Please add your private key to .env file to connect to Superchain networks');
    console.log('Example: PRIVATE_KEY=0x1234567890abcdef...\n');
    return;
  }
  
  console.log('🔗 Available Superchain Networks:');
  console.log('Testnets:');
  SUPERCHAIN_TESTNETS.forEach((network, index) => {
    console.log(`  ${index + 1}. ${network.name} (Chain ID: ${network.chainId})`);
  });
  
  console.log('\nMainnets:');
  SUPERCHAIN_MAINNETS.forEach((network, index) => {
    console.log(`  ${index + 1}. ${network.name} (Chain ID: ${network.chainId})`);
  });
  
  console.log('\n💰 Superchain Developer Console Benefits:');
  console.log('  • Daily 0.05 ETH testnet credits');
  console.log('  • Daily 0.05 OP testnet credits');
  console.log('  • Access to testnet faucets');
  console.log('  • Paymaster support for gasless transactions');
  console.log('  • Safe smart wallet integrations');
  
  // Connect to testnet for development
  console.log('\n🔌 Connecting to OP Sepolia testnet...');
  
  try {
    await superchainBridge.connectToChain(
      11155420, // OP Sepolia Chain ID
      'OP Sepolia',
      'https://sepolia.optimism.io',
      privateKey
    );
    
    console.log('✅ Successfully connected to OP Sepolia testnet!');
    
    // Get provider to check balance
    const chainInfo = Array.from(superchainBridge['connectedChains'].entries())
      .find(([chainId]) => chainId === 11155420);
    
    if (chainInfo) {
      // Using ethers v6 syntax
      const provider = chainInfo[1].connection.provider;
      const wallet = new ethers.Wallet(privateKey, provider);
      const balance = await provider.getBalance(wallet.address);
      
      // Convert balance to ETH using simple division (1 ETH = 10^18 wei)
      const balanceInEth = balance.toString() / 1e18;
      
      console.log(`\n💰 Wallet Address: ${wallet.address}`);
      console.log(`💰 Balance: ${balanceInEth} ETH`);
      
      // Check if we need to request testnet funds
      if (balanceInEth < 0.1) {
        console.log('\n💧 Request testnet ETH from the Superchain Developer Console faucet');
        console.log('   Visit: https://console.optimism.io/faucet');
        console.log('   Wallet address to use:', WALLET_ADDRESS);
        console.log('   You can claim up to 0.05 ETH daily');
      }
    }
    
    console.log('\n🧪 Testing cross-chain functionality...');
    
    // Register a test agent
    const receipt = await superchainBridge.registerAgent(
      11155420,
      'ZENTIX-TEST-001',
      'Zentix Test Agent',
      'Testing Superchain integration',
      ['Cross-chain messaging', 'Decision logging'],
      [11155420],
      ['0x0000000000000000000000000000000000000000']
    );
    
    if (receipt) {
      console.log('✅ Test agent registered successfully!');
    }
    
    console.log('\n🎉 Superchain Developer Console connection established!');
    console.log('\n📋 How to claim your daily credits:');
    console.log('1. Visit https://console.optimism.io/faucet');
    console.log('2. Connect your wallet:', WALLET_ADDRESS);
    console.log('3. Claim your daily 0.05 ETH and 0.05 OP testnet credits');
    console.log('4. Use the funds for testing on OP Sepolia or other testnets');
    
    console.log('\n🔧 Next steps for development:');
    console.log('1. Deploy contracts using Hardhat/Foundry');
    console.log('2. Test cross-chain messaging between OP chains');
    console.log('3. Utilize paymaster for gasless transactions');
    console.log('4. Monitor transactions in the console dashboard');
    
  } catch (error) {
    console.error('❌ Error connecting to Superchain:', error);
  }
}

// Run the connection script
connectToSuperchainConsole()
  .then(() => {
    console.log('\n🏁 Superchain connection script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error in Superchain connection script:', error);
    process.exit(1);
  });