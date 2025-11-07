#!/usr/bin/env tsx
/**
 * Quantum & Topological Agents Demo
 * Advanced AI agents using quantum probability and network topology
 */

import {
  QuantumProbabilityReferralAgent,
  TopologicalArbitrageAgent,
  TopologyGamificationAgent,
  QuantumStakingAgent,
  QuantumPredictionAgent,
} from '../core/agents/quantumAgents';
import { WalletService } from '../core/economy/walletService';

async function main() {
  console.log('\n🌌 Zentix Quantum & Topological Agents Demo');
  console.log('═'.repeat(70));

  // ============================================
  // 1. QUANTUM PROBABILITY REFERRAL AGENT
  // ============================================
  console.log('\n⚛️  1. Quantum Probability Referral Agent\n');

  const quantumReward1 = QuantumProbabilityReferralAgent.calculateQuantumReward('silver', 1, 80);
  console.log('Quantum Superposition State (Silver Tier, Depth 1, Rep 80%):');
  console.log('Possible Outcomes:');
  quantumReward1.possible_outcomes.forEach((outcome) => {
    console.log(`   ${outcome.amount} ZXT: ${(outcome.probability * 100).toFixed(1)}% chance`);
  });

  // Collapse the superposition multiple times to show randomness
  const wallet = WalletService.createWallet('zxdid:zentix:demo');
  const results = [];
  for (let i = 0; i < 5; i++) {
    const { collapsed_amount, wallet: updated } = QuantumProbabilityReferralAgent.collapseAndReward(quantumReward1, wallet);
    results.push(collapsed_amount);
  }
  console.log(`\n5 Collapsed Results: [${results.join(', ')}] ZXT`);
  console.log(`Average: ${(results.reduce((a, b) => a + b) / results.length).toFixed(1)} ZXT`);

  // ============================================
  // 2. TOPOLOGICAL ARBITRAGE AGENT
  // ============================================
  console.log('\n\n🔗 2. Topological Arbitrage Agent\n');

  const prices = [
    { token: 'ETH', exchange: 'Uniswap', price: 2000 },
    { token: 'ETH', exchange: 'Sushiswap', price: 2010 },
    { token: 'USDC', exchange: 'Uniswap', price: 1.0 },
    { token: 'USDC', exchange: 'Sushiswap', price: 1.005 },
    { token: 'MATIC', exchange: 'Uniswap', price: 0.8 },
    { token: 'MATIC', exchange: 'Sushiswap', price: 0.81 },
  ];

  const loops = TopologicalArbitrageAgent.detectArbitrageLoops(prices);
  if (loops.length > 0) {
    console.log(`Found ${loops.length} arbitrage loops:\n`);
    loops.forEach((loop) => {
      console.log(`Loop: ${loop.loop.join(' → ')}`);
      console.log(`Profit: ${loop.profit_percentage.toFixed(3)}%\n`);
    });
  } else {
    console.log('No arbitrage loops detected (prices too similar)\n');
  }

  // Persistent homology
  const priceHistory = [2000, 2010, 1995, 2020, 2015, 2025, 2030];
  const stability = TopologicalArbitrageAgent.calculatePersistentHomology(priceHistory);
  console.log(`Price Stability Score: ${(stability * 100).toFixed(1)}%`);
  console.log(`Interpretation: ${stability > 0.7 ? 'Stable' : stability > 0.4 ? 'Moderate' : 'Volatile'} market conditions`);

  // ============================================
  // 3. TOPOLOGY-BASED GAMIFICATION
  // ============================================
  console.log('\n\n🎮 3. Topology-Based Gamification Agent\n');

  const networkNodes = [
    { did: 'user1', depth: 0, connections: ['user2', 'user3'], centrality_score: 0.8 },
    { did: 'user2', depth: 1, connections: ['user1', 'user3'], centrality_score: 0.7 },
    { did: 'user3', depth: 1, connections: ['user1', 'user2'], centrality_score: 0.6 },
  ];

  const topoReward = TopologyGamificationAgent.calculateTopologicalReward('user1', networkNodes, 100);
  console.log(`User 1 - Topological Reward Calculation:`);
  console.log(`   Base Reward: ${topoReward.base_reward} ZXT`);
  console.log(`   Topology Multiplier: ${topoReward.topology_multiplier.toFixed(2)}x`);
  console.log(`   Final Reward: ${topoReward.final_reward} ZXT`);
  console.log(`   Reasoning: ${topoReward.reasoning}\n`);

  const simplices = TopologyGamificationAgent.findSimplices(networkNodes);
  if (simplices.length > 0) {
    console.log(`Found ${simplices.length} fully connected group(s):`);
    simplices.forEach((simplex) => {
      console.log(`   Members: [${simplex.members.join(', ')}]`);
      console.log(`   Team Bonus: ${((simplex.bonus_multiplier - 1) * 100).toFixed(0)}%`);
    });
  }

  // ============================================
  // 4. QUANTUM STAKING AGENT
  // ============================================
  console.log('\n\n💎 4. Quantum Staking Agent\n');

  const strategies = [
    { name: 'Daily Compound', lockPeriod: 30, compoundFrequency: 365 },
    { name: 'Weekly Compound', lockPeriod: 30, compoundFrequency: 52 },
    { name: 'Monthly Compound', lockPeriod: 30, compoundFrequency: 12 },
  ];

  const stakingResults = QuantumStakingAgent.simulateParallelStrategies(1000, 12, strategies);
  console.log('Simulated Staking Strategies (1000 ZXT, 12% APY, 30 days):');
  stakingResults.forEach((result) => {
    const marker = result.optimal ? ' ✨ OPTIMAL' : '';
    console.log(`${result.strategy}:`);
    console.log(`   Final: ${result.final_amount.toFixed(2)} ZXT (+${result.profit.toFixed(2)} ZXT)${marker}`);
  });

  // Predict optimal unstaking
  const historicalYields = [0.02, 0.025, 0.021, 0.028, 0.03, 0.029];
  const unstakeTime = QuantumStakingAgent.predictOptimalUnstakeTime(historicalYields, 1000);
  console.log(`\nOptimal Unstaking Prediction:`);
  console.log(`   Wait: ${unstakeTime.days_to_wait} days`);
  console.log(`   Expected Harvest: ${unstakeTime.expected_return.toFixed(2)} ZXT`);
  console.log(`   Confidence: ${(unstakeTime.confidence * 100).toFixed(1)}%`);

  // ============================================
  // 5. QUANTUM PREDICTION AGENT
  // ============================================
  console.log('\n\n🔮 5. Quantum Prediction & Forecast Agent\n');

  const priceHist = [2000, 2010, 1990, 2020, 2015, 2030, 2050];
  const gasHist = [50, 55, 45, 60, 52, 48, 42];

  const predictions = QuantumPredictionAgent.predictBestTransactionTimes(priceHist, gasHist);
  console.log('Transaction Timing Predictions:');
  predictions.forEach((pred) => {
    console.log(`✓ ${pred.reason}`);
    console.log(`   Confidence: ${(pred.confidence * 100).toFixed(0)}%`);
    console.log(`   Recommended: In ${pred.recommended_in_hours} hour(s)\n`);
  });

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n═'.repeat(70));
  console.log('✨ Quantum Agent Summary\n');
  console.log('💡 Key Innovations:');
  console.log('   ✅ Quantum Superposition: Multiple reward outcomes with probabilities');
  console.log('   ✅ Topological Cycles: Arbitrage loops across exchanges');
  console.log('   ✅ Network Effects: Rewards based on graph centrality & clustering');
  console.log('   ✅ Staking Optimization: Parallel strategy simulation');
  console.log('   ✅ Quantum Timing: Predict best transaction windows\n');

  console.log('🚀 Real-World Impact:');
  console.log('   • Zero-cost passive income generation');
  console.log('   • Intelligent arbitrage detection');
  console.log('   • Network-driven reward systems');
  console.log('   • Automated profit optimization');
  console.log('   • AI-powered market timing\n');
}

main().catch(console.error);
