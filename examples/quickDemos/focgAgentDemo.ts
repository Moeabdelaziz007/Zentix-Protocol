#!/usr/bin/env tsx
/**
 * Quick Demo: Zentix FOCG Agent Service
 * Demonstrates the Agent-as-a-Service functionality for Fully On-Chain Games
 */

import { FOCGAgentService, GameEnvironment, FOCGAgentConfig } from '../../src/core/agents/focg/focgAgentService';
import { WalletService } from '../../core/economy/walletService';
import { AgentLogger } from '../../src/core/utils/agentLogger';

async function main() {
  console.log('\n🤖 Zentix FOCG Agent Service - Quick Demo\n');
  console.log('='.repeat(50));

  // Create FOCG Agent Service
  const focgService = FOCGAgentService.getInstance();
  
  // Create a test user
  const userDid = 'zxdid:zentix:focg-demo-user-' + Date.now();
  console.log(`👤 Demo User: ${userDid}\n`);

  try {
    // Register a game environment (example: a fantasy RPG game)
    console.log('🎮 Registering Game Environment...');
    
    const gameEnv: GameEnvironment = {
      id: 'fantasy-kingdoms-v1',
      name: 'Fantasy Kingdoms',
      chain_id: 10, // OP Mainnet
      game_contract_address: '0x1234567890123456789012345678901234567890',
      supported_assets: ['GOLD', 'WOOD', 'IRON', 'CRYSTAL'],
      liquidity_pools: ['0xabc...gold_pool', '0xdef...resource_pool'],
      marketplaces: ['0xghi...marketplace']
    };
    
    const registered = await focgService.registerGameEnvironment(gameEnv);
    console.log(`   Game registered: ${registered}\n`);
    
    // Create user wallet
    console.log('💰 Creating User Wallet...');
    const testWallet = WalletService.createWallet(userDid);
    console.log(`   Wallet created: ${testWallet.agent_did}\n`);
    
    // Deploy a yield farmer agent
    console.log('🚜 Deploying Yield Farmer Agent...');
    
    const agentConfig: FOCGAgentConfig = {
      agent_type: 'yield_farmer',
      game_env: gameEnv,
      risk_tolerance: 75,
      capital_allocation: 50, // 50% of capital
      rebalance_frequency: 'daily',
      performance_threshold: 5 // 5% minimum return
    };
    
    const deployment = await focgService.deployAgent(
      userDid,
      agentConfig,
      testWallet
    );
    
    if (deployment.success && deployment.agentId) {
      console.log(`   ✅ Agent deployed successfully!`);
      console.log(`   Agent ID: ${deployment.agentId}`);
      console.log(`   Transaction: ${deployment.transactionHash}\n`);
      
      // Execute agent strategy
      console.log('⚡ Executing Agent Strategy...');
      const execution = await focgService.executeAgentStrategy(
        deployment.agentId,
        testWallet
      );
      
      if (execution.success) {
        console.log(`   ✅ Strategy executed successfully!`);
        console.log(`   Transactions executed: ${execution.transactions?.length || 0}`);
        if (execution.performance) {
          console.log(`   ROI: ${execution.performance.roi_percentage.toFixed(2)}%`);
          console.log(`   Total Return: ${execution.performance.total_return.toFixed(2)} GAME_TOKENS`);
        }
        console.log(`   Transaction: ${deployment.transactionHash}\n`);
      } else {
        console.log(`   ❌ Strategy execution failed: ${execution.error}`);
      }
    } else {
      console.log(`   ❌ Agent deployment failed: ${deployment.error}`);
    }
    
    // Show system status
    console.log('📊 System Status:');
    const status = await focgService.getSystemStatus();
    console.log(`   Active: ${status.active}`);
    console.log(`   Agents Deployed: ${status.agentsCount}`);
    console.log(`   Games Registered: ${status.gamesCount}\n`);
    
    console.log('🎉 FOCG Agent Demo Completed Successfully!');
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\n❌ Demo failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});