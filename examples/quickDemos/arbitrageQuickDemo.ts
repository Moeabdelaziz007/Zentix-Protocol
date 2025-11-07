#!/usr/bin/env tsx
/**
 * Quick Demo: Arbitrage & Micro-Investment Agents
 */

import { ArbitrageAgent, MicroInvestmentAgent } from '../../core/agents/smartAgents';
import { WalletService } from '../../core/economy/walletService';
import { AgentLogger } from '../../core/utils/agentLogger';

async function main() {
  console.log('\n💹 Arbitrage & Investment Agents - Quick Demo\n');

  // Arbitrage detection
  const prices = await AgentLogger.measurePerformance(
    'ArbitrageAgent',
    'monitorMarkets',
    () => ArbitrageAgent.monitorMarkets(['ETH', 'USDC'], ['Uniswap', 'Sushiswap'])
  );

  const opportunity = ArbitrageAgent.detectOpportunity(prices, 0.5);

  if (opportunity) {
    console.log('🎯 Arbitrage Opportunity Detected!');
    console.log(`  Token: ${opportunity.token_symbol}`);
    console.log(`  Buy: ${opportunity.buy_exchange} @ $${opportunity.buy_price.toFixed(2)}`);
    console.log(`  Sell: ${opportunity.sell_exchange} @ $${opportunity.sell_price.toFixed(2)}`);
    console.log(`  Profit: ${opportunity.profit_percentage.toFixed(2)}%\n`);
  }

  // Micro-investment
  const investment = await AgentLogger.measurePerformance(
    'MicroInvestmentAgent',
    'createInvestment',
    () => MicroInvestmentAgent.createInvestment('demo-user', 100, 'auto_compound'),
    { amount: 100, type: 'auto_compound' }
  );

  console.log('💼 Micro-Investment Created:');
  console.log(`  Initial: ${investment.initial_amount} ZXT`);
  console.log(`  Type: ${investment.investment_type}\n`);

  // Compound simulation
  const compounded = MicroInvestmentAgent.compoundInvestment(investment, 12);
  console.log('📈 After Compounding (12% APY):');
  console.log(`  Current Value: ${compounded.current_value.toFixed(2)} ZXT`);
  console.log(`  Profit: +${compounded.total_profit.toFixed(2)} ZXT\n`);

  // Stats
  const stats = AgentLogger.getStats();
  console.log(`⚡ ${stats.total_operations} operations, ${stats.avg_duration_ms.toFixed(1)}ms avg\n`);
}

main().catch(console.error);
