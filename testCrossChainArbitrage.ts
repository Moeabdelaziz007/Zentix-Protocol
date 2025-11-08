// testCrossChainArbitrage.ts
import { CrossChainArbitrageService } from './src/core/defi/crossChainArbitrageService';
import { WalletService } from './src/core/economy/walletService';

async function main() {
  console.log('🧪 Testing Cross-Chain Arbitrage Service\n');
  
  // Create a test wallet
  const testWallet = WalletService.createWallet('did:zentix:test-user-123');
  
  // Test 1: Scan for cross-chain opportunities
  console.log('Test 1: Scanning for cross-chain arbitrage opportunities...');
  const chains = ['OP Mainnet', 'Base', 'Zora'];
  const tokens = ['WETH', 'USDC'];
  
  const opportunities = await CrossChainArbitrageService.scanCrossChainOpportunities(
    'WETH',
    chains,
    0.005 // 0.5% minimum profit
  );
  
  console.log(`Found ${opportunities.length} opportunities\n`);
  
  if (opportunities.length > 0) {
    const bestOpportunity = opportunities[0];
    console.log('Best opportunity:');
    console.log(`  Token: ${bestOpportunity.token}`);
    console.log(`  Route: ${bestOpportunity.sourceChain} → ${bestOpportunity.destinationChain}`);
    console.log(`  Profit: ${(bestOpportunity.estimatedProfit * 100).toFixed(2)}%`);
    console.log(`  Confidence: ${bestOpportunity.confidence.toFixed(1)}%\n`);
    
    // Test 2: Create execution plan
    console.log('Test 2: Creating execution plan...');
    const plan = CrossChainArbitrageService.createExecutionPlan(bestOpportunity, 1);
    console.log(`Execution plan has ${plan.steps.length} steps\n`);
    
    // Test 3: Execute arbitrage (simulated)
    console.log('Test 3: Executing cross-chain arbitrage...');
    const result = await CrossChainArbitrageService.executeCrossChainArbitrage(
      bestOpportunity,
      1, // 1 ETH
      testWallet
    );
    
    if (result.success) {
      console.log(`✅ Arbitrage executed successfully!`);
      console.log(`   Profit: ${result.profit?.toFixed(4)} ETH\n`);
    } else {
      console.log(`❌ Arbitrage failed: ${result.error}\n`);
    }
  }
  
  console.log('🏁 Cross-chain arbitrage tests completed!');
}

main().catch(console.error);