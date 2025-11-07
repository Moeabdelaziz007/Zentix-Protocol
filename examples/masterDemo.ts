#!/usr/bin/env tsx
/**
 * 🚀 Zentix Protocol - Master Demo
 * Showcases all smart features in one comprehensive demo
 */

import { AgentLogger, LogLevel } from '../core/utils/agentLogger';

async function main() {
  console.clear();
  console.log('\n🌟'.repeat(35));
  console.log('🚀 ZENTIX PROTOCOL - COMPLETE SYSTEM DEMO');
  console.log('🌟'.repeat(35));
  console.log('\n💡 Showcasing: Zero-Cost Passive Income Ecosystem\n');

  // ============================================
  // 1. REFERRAL SYSTEM
  // ============================================
  console.log('━'.repeat(70));
  console.log('1️⃣  AUTOMATED REFERRAL SYSTEM\n');

  const { ReferralAgent } = await import('../core/agents/referralAgent');
  
  const alice = 'zxdid:zentix:alice';
  const invite = await AgentLogger.measurePerformance(
    'ReferralAgent',
    'generateInviteLink',
    () => ReferralAgent.generateInviteLink(alice)
  );

  console.log(`   📎 Referral Code: ${invite.code}`);
  console.log(`   🔗 Share Link: ${invite.link.slice(0, 50)}...`);

  const result = await ReferralAgent.trackReferral(alice, 'zxdid:zentix:bob', 'bob@example.com', 'gold');
  console.log(`   ✅ ${result.message}`);
  console.log(`   💰 Balance: ${result.new_balance} ZXT\n`);

  // ============================================
  // 2. QUANTUM PROBABILITY
  // ============================================
  console.log('━'.repeat(70));
  console.log('2️⃣  QUANTUM PROBABILITY REWARDS\n');

  const { QuantumProbabilityReferralAgent } = await import('../core/agents/quantumAgents');
  const { WalletService } = await import('../core/economy/walletService');

  const quantumState = QuantumProbabilityReferralAgent.calculateQuantumReward('platinum', 1, 90);
  console.log('   ⚛️  Superposition State:');
  quantumState.possible_outcomes.forEach((o, i) => {
    console.log(`      ${i + 1}. ${o.amount} ZXT - ${(o.probability * 100).toFixed(1)}% chance`);
  });

  const wallet = WalletService.createWallet('demo');
  const { collapsed_amount } = QuantumProbabilityReferralAgent.collapseAndReward(quantumState, wallet);
  console.log(`   ✨ Collapsed: ${collapsed_amount} ZXT rewarded!\n`);

  // ============================================
  // 3. ARBITRAGE DETECTION
  // ============================================
  console.log('━'.repeat(70));
  console.log('3️⃣  TOPOLOGICAL ARBITRAGE DETECTION\n');

  const { ArbitrageAgent } = await import('../core/agents/smartAgents');

  const prices = await ArbitrageAgent.monitorMarkets(['ETH', 'MATIC'], ['Uniswap', 'Sushiswap']);
  const opportunity = ArbitrageAgent.detectOpportunity(prices, 0.5);

  if (opportunity) {
    console.log('   🎯 Opportunity Detected!');
    console.log(`      Token: ${opportunity.token_symbol}`);
    console.log(`      Profit: ${opportunity.profit_percentage.toFixed(2)}%`);
  } else {
    console.log('   ℹ️  No opportunities at this time (simulated)\n');
  }

  // ============================================
  // 4. MICRO-INVESTMENT
  // ============================================
  console.log('━'.repeat(70));
  console.log('4️⃣  MICRO-INVESTMENT AUTO-COMPOUND\n');

  const { MicroInvestmentAgent } = await import('../core/agents/smartAgents');

  const investment = MicroInvestmentAgent.createInvestment('user1', 100, 'auto_compound');
  console.log(`   💼 Created: ${investment.initial_amount} ZXT`);

  const compounded = MicroInvestmentAgent.compoundInvestment(investment, 12);
  console.log(`   📈 After 1 day (12% APY): ${compounded.current_value.toFixed(2)} ZXT`);
  console.log(`   💰 Profit: +${compounded.total_profit.toFixed(2)} ZXT\n`);

  // ============================================
  // 5. MARKET INTELLIGENCE
  // ============================================
  console.log('━'.repeat(70));
  console.log('5️⃣  MARKET INTELLIGENCE & SIGNALS\n');

  const { MarketIntelligenceAgent } = await import('../core/agents/smartAgents');

  const priceHistory = [2000, 2010, 2020, 2015, 2030, 2040, 2050];
  const signal = MarketIntelligenceAgent.analyzeMarket('ETH', priceHistory);

  console.log(`   📊 Signal: ${signal.signal_type.toUpperCase()}`);
  console.log(`   🎯 Confidence: ${signal.confidence}%`);
  console.log(`   💡 Reason: ${signal.reason}\n`);

  // ============================================
  // 6. NETWORK TOPOLOGY
  // ============================================
  console.log('━'.repeat(70));
  console.log('6️⃣  TOPOLOGY-BASED REWARDS\n');

  const { TopologyGamificationAgent } = await import('../core/agents/quantumAgents');

  const network = [
    { did: 'user1', depth: 0, connections: ['user2', 'user3'], centrality_score: 0.8 },
    { did: 'user2', depth: 1, connections: ['user1', 'user3'], centrality_score: 0.6 },
    { did: 'user3', depth: 1, connections: ['user1', 'user2'], centrality_score: 0.5 },
  ];

  const topoReward = TopologyGamificationAgent.calculateTopologicalReward('user1', network, 100);
  console.log(`   🎮 Base Reward: ${topoReward.base_reward} ZXT`);
  console.log(`   🔗 Multiplier: ${topoReward.topology_multiplier.toFixed(2)}x`);
  console.log(`   ✨ Final: ${topoReward.final_reward} ZXT`);
  console.log(`   📝 ${topoReward.reasoning}\n`);

  // ============================================
  // 7. GOOGLE APIS
  // ============================================
  console.log('━'.repeat(70));
  console.log('7️⃣  GOOGLE FREE APIS INTEGRATION\n');

  const { GoogleTrendsAgent } = await import('../core/agents/googleApisIntegration');

  const trends = await GoogleTrendsAgent.getTrendingTopics();
  console.log('   📈 Trending Topics:');
  trends.slice(0, 2).forEach(t => {
    console.log(`      • ${t.keyword}: ${t.trend_direction} (${t.interest_change}%)`);
  });
  console.log('');

  // ============================================
  // PERFORMANCE SUMMARY
  // ============================================
  console.log('━'.repeat(70));
  console.log('⚡ PERFORMANCE SUMMARY\n');

  const stats = AgentLogger.getStats();
  console.log(`   📊 Total Operations: ${stats.total_operations}`);
  console.log(`   ⏱️  Average Duration: ${stats.avg_duration_ms.toFixed(2)}ms`);
  console.log(`   ✅ Success Rate: ${((1 - stats.by_level.ERROR / stats.total_operations) * 100).toFixed(1)}%`);
  
  console.log('\n   🤖 Operations by Agent:');
  Object.entries(stats.by_agent).forEach(([agent, count]) => {
    console.log(`      • ${agent}: ${count}`);
  });

  // ============================================
  // FINAL SUMMARY
  // ============================================
  console.log('\n' + '━'.repeat(70));
  console.log('✨ ZENTIX PROTOCOL CAPABILITIES\n');

  console.log('   💰 PASSIVE INCOME:');
  console.log('      • Referral rewards: 10-100 ZXT per user');
  console.log('      • Arbitrage profits: Auto-detected opportunities');
  console.log('      • Micro-investments: 12% APY auto-compound');
  console.log('      • Network bonuses: Up to 50% team multiplier\n');

  console.log('   🚀 ADVANCED FEATURES:');
  console.log('      • Quantum probability distributions');
  console.log('      • Topological arbitrage loops');
  console.log('      • Graph-based reward systems');
  console.log('      • AI market predictions');
  console.log('      • Google APIs integration\n');

  console.log('   🎯 ZERO COST:');
  console.log('      • No upfront investment');
  console.log('      • Free Google API tiers');
  console.log('      • Polygon Mumbai testnet');
  console.log('      • Self-sustaining economy\n');

  console.log('━'.repeat(70));
  console.log('🎉 Demo Complete! Run individual quick demos:');
  console.log('   npm run quick:quantum      - Quantum rewards');
  console.log('   npm run quick:referral     - Referral system');
  console.log('   npm run quick:arbitrage    - Arbitrage detection');
  console.log('   npm run quick:google       - Google APIs\n');
  console.log('🌟'.repeat(35));
  console.log('');
}

main().catch((error) => {
  AgentLogger.log(LogLevel.ERROR, 'MasterDemo', 'main', {}, error);
  console.error('\n❌ Demo failed:', error.message);
  process.exit(1);
});
