#!/usr/bin/env tsx
/**
 * Quick Demo: Quantum Probability Referral Agent
 * Minimal example showcasing quantum superposition rewards
 */

import { QuantumProbabilityReferralAgent } from '../../core/agents/quantumAgents';
import { WalletService } from '../../core/economy/walletService';
import { AgentLogger, LogLevel } from '../../core/utils/agentLogger';

async function main() {
  console.log('\n⚛️  Quantum Probability Referral Agent - Quick Demo\n');

  // Calculate quantum reward superposition
  const quantumState = await AgentLogger.measurePerformance(
    'QuantumProbabilityReferralAgent',
    'calculateQuantumReward',
    () => QuantumProbabilityReferralAgent.calculateQuantumReward('gold', 1, 85),
    { tier: 'gold', depth: 1, reputation: 85 }
  );

  console.log('Quantum Superposition State:');
  quantumState.possible_outcomes.forEach((outcome, i) => {
    console.log(`  ${i + 1}. ${outcome.amount} ZXT - ${(outcome.probability * 100).toFixed(1)}% probability`);
  });

  // Collapse superposition
  const wallet = WalletService.createWallet('demo-user');
  const { collapsed_amount } = await AgentLogger.measurePerformance(
    'QuantumProbabilityReferralAgent',
    'collapseAndReward',
    () => QuantumProbabilityReferralAgent.collapseAndReward(quantumState, wallet),
    { wallet_address: wallet.address }
  );

  console.log(`\n✨ Collapsed Amount: ${collapsed_amount} ZXT\n`);

  // Show stats
  const stats = AgentLogger.getStats();
  console.log('Performance Stats:');
  console.log(`  Operations: ${stats.total_operations}`);
  console.log(`  Avg Duration: ${stats.avg_duration_ms.toFixed(2)}ms\n`);
}

main().catch(console.error);
