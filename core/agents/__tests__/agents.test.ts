/**
 * Comprehensive Agent Unit Tests
 * Performance and stability validation
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Test subjects
import { ReferralAgent } from '../referralAgent';
import { ArbitrageAgent, MicroInvestmentAgent, MarketIntelligenceAgent } from '../smartAgents';
import { QuantumProbabilityReferralAgent, TopologyGamificationAgent } from '../quantumAgents';
import { WalletService } from '../../economy/walletService';

describe('ReferralAgent', () => {
  const testUser = 'zxdid:test:alice';

  it('generates unique invite codes', () => {
    const invite1 = ReferralAgent.generateInviteLink(testUser);
    const invite2 = ReferralAgent.generateInviteLink(testUser);

    expect(invite1.code).toBeDefined();
    expect(invite1.code).not.toBe(invite2.code);
    expect(invite1.link).toContain('zentix.network');
  });

  it('tracks referrals with correct tier rewards', async () => {
    const tiers = [
      { tier: 'bronze' as const, expected: 10 },
      { tier: 'silver' as const, expected: 25 },
      { tier: 'gold' as const, expected: 50 },
      { tier: 'platinum' as const, expected: 100 },
    ];

    for (const { tier, expected } of tiers) {
      const result = await ReferralAgent.trackReferral(
        `user-${tier}`,
        `ref-${tier}`,
        `${tier}@test.com`,
        tier
      );

      expect(result.reward_earned).toBe(expected);
      expect(result.success).toBe(true);
    }
  });

  it('handles bulk referrals efficiently', async () => {
    const start = Date.now();
    
    for (let i = 0; i < 50; i++) {
      await ReferralAgent.trackReferral(testUser, `ref-${i}`, `user${i}@test.com`, 'bronze');
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500); // < 500ms for 50 referrals
  });
});

describe('QuantumProbabilityReferralAgent', () => {
  it('generates valid superposition states', () => {
    const state = QuantumProbabilityReferralAgent.calculateQuantumReward('gold', 1, 80);

    expect(state.possible_outcomes).toHaveLength(4);
    expect(state.tier).toBe('gold');

    // Probabilities sum to ~1.0
    const total = state.possible_outcomes.reduce((sum, o) => sum + o.probability, 0);
    expect(total).toBeCloseTo(1.0, 1);
  });

  it('applies reputation bonuses', () => {
    const low = QuantumProbabilityReferralAgent.calculateQuantumReward('silver', 1, 50);
    const high = QuantumProbabilityReferralAgent.calculateQuantumReward('silver', 1, 95);

    const avgLow = low.possible_outcomes.reduce((s, o) => s + o.amount * o.probability, 0);
    const avgHigh = high.possible_outcomes.reduce((s, o) => s + o.amount * o.probability, 0);

    expect(avgHigh).toBeGreaterThan(avgLow);
  });

  it('collapses to valid outcomes', () => {
    const state = QuantumProbabilityReferralAgent.calculateQuantumReward('platinum', 1, 90);
    const wallet = WalletService.createWallet('test');

    const result = QuantumProbabilityReferralAgent.collapseAndReward(state, wallet);

    expect(result.collapsed_amount).toBeGreaterThan(0);
    expect(state.possible_outcomes.some(o => o.amount === result.collapsed_amount)).toBe(true);
  });
});

describe('ArbitrageAgent', () => {
  it('detects arbitrage opportunities', async () => {
    const prices = await ArbitrageAgent.monitorMarkets(['ETH'], ['Uniswap', 'Sushiswap']);

    expect(prices).toBeDefined();
    expect(prices.length).toBeGreaterThan(0);
    expect(prices[0]).toHaveProperty('token_symbol');
    expect(prices[0]).toHaveProperty('price');
  });

  it('validates profit threshold', () => {
    const mockPrices = [
      { token_symbol: 'ETH', exchange: 'Uniswap', price: 2000, timestamp: Date.now() },
      { token_symbol: 'ETH', exchange: 'Sushiswap', price: 2050, timestamp: Date.now() },
    ];

    const opportunity = ArbitrageAgent.detectOpportunity(mockPrices, 2.0);

    if (opportunity) {
      expect(opportunity.profit_percentage).toBeGreaterThan(2.0);
    }
  });
});

describe('MicroInvestmentAgent', () => {
  it('creates investments correctly', () => {
    const investment = MicroInvestmentAgent.createInvestment('user1', 100, 'auto_compound');

    expect(investment.user_did).toBe('user1');
    expect(investment.initial_amount).toBe(100);
    expect(investment.current_value).toBe(100);
    expect(investment.investment_type).toBe('auto_compound');
  });

  it('compounds correctly with APY', () => {
    const investment = MicroInvestmentAgent.createInvestment('user1', 1000, 'auto_compound');
    const compounded = MicroInvestmentAgent.compoundInvestment(investment, 12);

    expect(compounded.current_value).toBeGreaterThan(1000);
    expect(compounded.total_profit).toBeGreaterThan(0);
    expect(compounded.apy_percentage).toBe(12);
  });
});

describe('MarketIntelligenceAgent', () => {
  it('analyzes market trends', () => {
    const uptrend = [100, 105, 110, 115, 120];
    const signal = MarketIntelligenceAgent.analyzeMarket('ETH', uptrend);

    expect(signal.signal_type).toBe('buy');
    expect(signal.confidence).toBeGreaterThan(50);
  });

  it('detects downtrends', () => {
    const downtrend = [120, 115, 110, 105, 100];
    const signal = MarketIntelligenceAgent.analyzeMarket('ETH', downtrend);

    expect(signal.signal_type).toBe('sell');
  });
});

describe('TopologyGamificationAgent', () => {
  it('calculates topology rewards', () => {
    const network = [
      { did: 'user1', depth: 0, connections: ['user2', 'user3'], centrality_score: 0.8 },
    ];

    const reward = TopologyGamificationAgent.calculateTopologicalReward('user1', network, 100);

    expect(reward.base_reward).toBe(100);
    expect(reward.topology_multiplier).toBeGreaterThan(1.0);
    expect(reward.final_reward).toBeGreaterThan(100);
  });
});

describe('Performance Benchmarks', () => {
  it('referral operations complete under 10ms', async () => {
    const start = Date.now();
    await ReferralAgent.trackReferral('perf-test', 'ref-test', 'test@example.com', 'silver');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(10);
  });

  it('quantum calculations complete under 5ms', () => {
    const start = Date.now();
    QuantumProbabilityReferralAgent.calculateQuantumReward('gold', 2, 75);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5);
  });

  it('market analysis completes under 20ms', () => {
    const start = Date.now();
    const prices = Array.from({ length: 100 }, (_, i) => 2000 + i * 10);
    MarketIntelligenceAgent.analyzeMarket('ETH', prices);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(20);
  });
});
