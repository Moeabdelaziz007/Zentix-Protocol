#!/usr/bin/env tsx
/**
 * Quick Demo: Cross-Chain Arbitrage Agent Network
 * Demonstrates the complete cross-chain arbitrage workflow
 */

import { CrossChainArbitrageService } from '../../src/core/defi/crossChainArbitrageService';
import { WalletService } from '../../src/core/economy/walletService';
import { AgentLogger } from '../../src/core/utils/agentLogger';

async function main() {
  console.log('\n🌐 Cross-Chain Arbitrage Agent Network - Quick Demo\n');
  console.log('='.repeat(60));

  // Create a test wallet
  const testWallet = WalletService.createWallet('did:zentix:arbitrage-demo-user');
  console.log(`👤 Demo User Wallet: ${testWallet.agent_did}\n`);

  try {
    // Performance measurement
    const { result: opportunities, duration } = await AgentLogger.measurePerformance(
      'CrossChainArbitrageService',
      'scanCrossChainOpportunities',
      () => CrossChainArbitrageService.scanCrossChainOpportunities(
        'WETH',
        ['OP Mainnet', 'Base', 'Zora'],
        0.003 // 0.3% minimum profit
      )
    );

    console.log(`⏱️  Scan completed in ${duration.toFixed(1)}ms`);
    console.log(`📊 Found ${opportunities.length} cross-chain arbitrage opportunities\n`);

    if (opportunities.length > 0) {
      // Display top opportunities
      const topOpportunities = opportunities
        .sort((a, b) => b.estimatedProfit - a.estimatedProfit)
        .slice(0, 3);

      console.log('🏆 Top Arbitrage Opportunities:');
      topOpportunities.forEach((opp, index) => {
        console.log(`  ${index + 1}. ${opp.token} ${opp.sourceChain} → ${opp.destinationChain}`);
        console.log(`     Profit: ${(opp.estimatedProfit * 100).toFixed(2)}%`);
        console.log(`     Price Diff: $${opp.priceDifference.toFixed(2)}`);
        console.log(`     Confidence: ${opp.confidence.toFixed(1)}%`);
        console.log('');
      });

      // Execute the best opportunity
      const bestOpportunity = topOpportunities[0];
      console.log('⚡ Executing Best Opportunity:');
      console.log(`   Route: ${bestOpportunity.sourceChain} → ${bestOpportunity.destinationChain}`);
      console.log(`   Estimated Profit: ${(bestOpportunity.estimatedProfit * 100).toFixed(2)}%\n`);

      const executionResult = await AgentLogger.measurePerformance(
        'CrossChainArbitrageService',
        'executeCrossChainArbitrage',
        () => CrossChainArbitrageService.executeCrossChainArbitrage(
          bestOpportunity,
          1, // 1 ETH
          testWallet
        )
      );

      if (executionResult.result.success) {
        console.log('✅ Arbitrage Execution Successful!');
        console.log(`   Profit Generated: ${executionResult.result.profit?.toFixed(4)} ETH`);
        console.log(`   Execution Time: ${executionResult.duration.toFixed(1)}ms\n`);
      } else {
        console.log('❌ Arbitrage Execution Failed:');
        console.log(`   Error: ${executionResult.result.error}\n`);
      }

      // Show execution plan
      console.log('📋 Execution Plan:');
      const plan = CrossChainArbitrageService.createExecutionPlan(bestOpportunity, 1);
      plan.steps.forEach((step, index) => {
        console.log(`   ${step}`);
      });
      console.log('');
    } else {
      console.log('ℹ️  No profitable cross-chain arbitrage opportunities found\n');
    }

    // Stats
    const stats = AgentLogger.getStats();
    console.log(`📈 Performance Stats:`);
    console.log(`   Total Operations: ${stats.total_operations}`);
    console.log(`   Average Duration: ${stats.avg_duration_ms.toFixed(1)}ms\n`);

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }

  console.log('='.repeat(60));
  console.log('✨ Cross-Chain Arbitrage Demo Completed!\n');
}

main().catch(console.error);