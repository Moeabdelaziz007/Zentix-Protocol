import { randomBytes } from 'crypto';
import { WalletService, ZentixWallet } from '../economy/walletService';
import type { AgentActivity, MicroInvestment, RewardTracking } from '../types';

/**
 * Zentix Smart Agents - Zero-Cost Monetization System
 * Arbitrage, Micro-Investments, and Market Intelligence
 * 
 * @module smartAgents
 * @version 1.0.0
 */

/**
 * Price data from external sources
 */
export interface PriceData {
  symbol: string;
  exchange: string;
  price: number;
  timestamp: string;
}

/**
 * Arbitrage opportunity
 */
export interface ArbitrageOpportunity {
  id: string;
  token_symbol: string;
  buy_exchange: string;
  sell_exchange: string;
  buy_price: number;
  sell_price: number;
  profit_percentage: number;
  potential_profit: number;
  detected_at: string;
  status: 'active' | 'executed' | 'expired';
}

/**
 * Market signal
 */
export interface MarketSignal {
  id: string;
  signal_type: 'buy' | 'sell' | 'hold' | 'alert';
  token_symbol: string;
  confidence: number; // 0-100
  reason: string;
  price_target?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * ArbitrageAgent - Monitors price differences across exchanges
 * Generates passive rewards from arbitrage opportunities
 */
export class ArbitrageAgent {
  /**
   * Detect arbitrage opportunity
   * 
   * @param prices - Array of price data from different exchanges
   * @param minProfitPercent - Minimum profit threshold (default: 1%)
   * @returns Arbitrage opportunity or null
   * 
   * @example
   * ```ts
   * const prices = [
   *   { symbol: 'ETH', exchange: 'Uniswap', price: 2000, timestamp: '...' },
   *   { symbol: 'ETH', exchange: 'Sushiswap', price: 2020, timestamp: '...' }
   * ];
   * const opportunity = ArbitrageAgent.detectOpportunity(prices);
   * ```
   */
  static detectOpportunity(
    prices: PriceData[],
    minProfitPercent = 1.0
  ): ArbitrageOpportunity | null {
    if (prices.length < 2) return null;

    // Group by symbol
    const pricesBySymbol = prices.reduce((acc, p) => {
      if (!acc[p.symbol]) acc[p.symbol] = [];
      acc[p.symbol].push(p);
      return acc;
    }, {} as Record<string, PriceData[]>);

    // Find best opportunity across all symbols
    let bestOpportunity: ArbitrageOpportunity | null = null;

    for (const [symbol, symbolPrices] of Object.entries(pricesBySymbol)) {
      if (symbolPrices.length < 2) continue;

      const sorted = symbolPrices.sort((a, b) => a.price - b.price);
      const lowest = sorted[0];
      const highest = sorted[sorted.length - 1];

      const profitPercent = ((highest.price - lowest.price) / lowest.price) * 100;

      if (profitPercent >= minProfitPercent) {
        const potentialProfit = highest.price - lowest.price;

        const opportunity: ArbitrageOpportunity = {
          id: randomBytes(8).toString('hex'),
          token_symbol: symbol,
          buy_exchange: lowest.exchange,
          sell_exchange: highest.exchange,
          buy_price: lowest.price,
          sell_price: highest.price,
          profit_percentage: profitPercent,
          potential_profit: potentialProfit,
          detected_at: new Date().toISOString(),
          status: 'active',
        };

        if (!bestOpportunity || profitPercent > bestOpportunity.profit_percentage) {
          bestOpportunity = opportunity;
        }
      }
    }

    return bestOpportunity;
  }

  /**
   * Execute arbitrage and reward user
   * 
   * @param wallet - User's wallet
   * @param opportunity - Arbitrage opportunity
   * @param investAmount - Amount to invest
   * @returns Updated wallet and activity log
   */
  static executeArbitrage(
    wallet: ZentixWallet,
    opportunity: ArbitrageOpportunity,
    investAmount: number
  ): { wallet: ZentixWallet; activity: AgentActivity; reward: RewardTracking } {
    // Calculate actual profit
    const profitMultiplier = opportunity.profit_percentage / 100;
    const actualProfit = investAmount * profitMultiplier;

    // Reward wallet
    const updatedWallet = WalletService.reward(
      wallet,
      actualProfit,
      `Arbitrage profit: ${opportunity.token_symbol}`,
      {
        opportunity_id: opportunity.id,
        buy_exchange: opportunity.buy_exchange,
        sell_exchange: opportunity.sell_exchange,
        profit_percentage: opportunity.profit_percentage,
      }
    );

    const activity: AgentActivity = {
      id: randomBytes(8).toString('hex'),
      agent_did: wallet.agent_did || '',
      activity_type: 'arbitrage',
      description: `Executed arbitrage: ${opportunity.token_symbol} - ${opportunity.profit_percentage.toFixed(2)}% profit`,
      reward_earned: actualProfit,
      metadata: {
        opportunity_id: opportunity.id,
        invest_amount: investAmount,
        profit: actualProfit,
      },
      timestamp: new Date().toISOString(),
    };

    const reward: RewardTracking = {
      id: randomBytes(8).toString('hex'),
      user_did: wallet.agent_did || '',
      reward_type: 'arbitrage',
      amount: actualProfit,
      source_id: opportunity.id,
      status: 'processed',
      created_at: new Date().toISOString(),
      processed_at: new Date().toISOString(),
    };

    return { wallet: updatedWallet, activity, reward };
  }

  /**
   * Monitor multiple token pairs for arbitrage
   * 
   * @param tokens - Token symbols to monitor
   * @param exchanges - Exchange names
   * @returns Mock price data (in production, fetch from APIs)
   */
  static async monitorMarkets(
    tokens: string[],
    exchanges: string[]
  ): Promise<PriceData[]> {
    // Mock implementation - replace with actual API calls
    const prices: PriceData[] = [];
    const timestamp = new Date().toISOString();

    for (const token of tokens) {
      for (const exchange of exchanges) {
        // Simulate slight price variations
        const basePrice = Math.random() * 1000 + 100;
        const variation = (Math.random() - 0.5) * 0.05; // ±2.5% variation
        
        prices.push({
          symbol: token,
          exchange,
          price: basePrice * (1 + variation),
          timestamp,
        });
      }
    }

    return prices;
  }
}

/**
 * MicroInvestmentAgent - Manages zero-cost passive income
 * Auto-compounds small amounts for maximum returns
 */
export class MicroInvestmentAgent {
  /**
   * Create micro-investment
   * 
   * @param userDID - User's DID
   * @param amount - Initial investment amount
   * @param type - Investment type
   * @returns New micro-investment
   */
  static createInvestment(
    userDID: string,
    amount: number,
    type: 'arbitrage' | 'staking' | 'yield_farming' | 'auto_compound' = 'auto_compound'
  ): MicroInvestment {
    return {
      id: randomBytes(8).toString('hex'),
      user_did: userDID,
      investment_type: type,
      initial_amount: amount,
      current_value: amount,
      total_profit: 0,
      status: 'active',
      started_at: new Date().toISOString(),
      last_update: new Date().toISOString(),
    };
  }

  /**
   * Update investment value with compound interest
   * 
   * @param investment - Current investment
   * @param apy - Annual percentage yield (e.g., 12 for 12%)
   * @returns Updated investment
   */
  static compoundInvestment(
    investment: MicroInvestment,
    apy: number
  ): MicroInvestment {
    // Calculate time elapsed
    const lastUpdate = new Date(investment.last_update);
    const now = new Date();
    const daysElapsed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

    // Calculate compound interest
    const dailyRate = apy / 365 / 100;
    const newValue = investment.current_value * Math.pow(1 + dailyRate, daysElapsed);
    const profit = newValue - investment.current_value;

    return {
      ...investment,
      current_value: newValue,
      total_profit: investment.total_profit + profit,
      last_update: now.toISOString(),
    };
  }

  /**
   * Auto-harvest and reinvest profits
   * 
   * @param investment - Current investment
   * @param wallet - User's wallet
   * @param harvestThreshold - Minimum profit to harvest
   * @returns Updated investment and wallet
   */
  static autoHarvest(
    investment: MicroInvestment,
    wallet: ZentixWallet,
    harvestThreshold = 1.0
  ): { investment: MicroInvestment; wallet: ZentixWallet; harvested: boolean } {
    if (investment.total_profit < harvestThreshold) {
      return { investment, wallet, harvested: false };
    }

    // Transfer profits to wallet
    const updatedWallet = WalletService.reward(
      wallet,
      investment.total_profit,
      `Micro-investment harvest: ${investment.investment_type}`,
      {
        investment_id: investment.id,
        days_active: Math.floor(
          (new Date().getTime() - new Date(investment.started_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
      }
    );

    // Reset profit counter
    const updatedInvestment = {
      ...investment,
      total_profit: 0,
      last_update: new Date().toISOString(),
    };

    return { investment: updatedInvestment, wallet: updatedWallet, harvested: true };
  }

  /**
   * Get investment performance summary
   * 
   * @param investment - Investment to analyze
   * @returns Performance metrics
   */
  static getPerformance(investment: MicroInvestment) {
    const daysActive = Math.floor(
      (new Date().getTime() - new Date(investment.started_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    const totalReturn = ((investment.current_value - investment.initial_amount) / investment.initial_amount) * 100;
    const annualizedReturn = daysActive > 0 ? (totalReturn / daysActive) * 365 : 0;

    return {
      investment_id: investment.id,
      type: investment.investment_type,
      days_active: daysActive,
      initial_amount: investment.initial_amount,
      current_value: investment.current_value,
      total_profit: investment.total_profit,
      total_return_percent: totalReturn,
      annualized_return_percent: annualizedReturn,
      status: investment.status,
    };
  }
}

/**
 * MarketIntelligenceAgent - AI-powered market analysis
 * Provides actionable signals and profit suggestions
 */
export class MarketIntelligenceAgent {
  /**
   * Analyze price trends and generate signal
   * 
   * @param symbol - Token symbol
   * @param historicalPrices - Price history
   * @returns Market signal
   */
  static analyzeMarket(
    symbol: string,
    historicalPrices: number[]
  ): MarketSignal {
    if (historicalPrices.length < 3) {
      return this.generateSignal(symbol, 'hold', 50, 'Insufficient data');
    }

    // Simple trend analysis
    const recent = historicalPrices.slice(-5);
    const average = recent.reduce((a, b) => a + b, 0) / recent.length;
    const current = recent[recent.length - 1];
    const previous = recent[recent.length - 2];

    // Calculate momentum
    const momentum = ((current - previous) / previous) * 100;
    const vsAverage = ((current - average) / average) * 100;

    // Generate signal based on momentum
    if (momentum > 5 && vsAverage < -2) {
      return this.generateSignal(symbol, 'buy', 75, 'Strong upward momentum with price below average', current * 1.1);
    } else if (momentum < -5 && vsAverage > 2) {
      return this.generateSignal(symbol, 'sell', 70, 'Negative momentum with price above average');
    } else if (Math.abs(momentum) > 10) {
      return this.generateSignal(symbol, 'alert', 80, 'High volatility detected', undefined, { volatility: 'high' });
    } else {
      return this.generateSignal(symbol, 'hold', 60, 'Market consolidating');
    }
  }

  /**
   * Generate market signal
   */
  private static generateSignal(
    symbol: string,
    type: 'buy' | 'sell' | 'hold' | 'alert',
    confidence: number,
    reason: string,
    target?: number,
    metadata?: Record<string, any>
  ): MarketSignal {
    return {
      id: randomBytes(8).toString('hex'),
      signal_type: type,
      token_symbol: symbol,
      confidence,
      reason,
      price_target: target,
      timestamp: new Date().toISOString(),
      metadata,
    };
  }

  /**
   * Find profitable opportunities across multiple tokens
   * 
   * @param tokens - Tokens to analyze
   * @param priceHistory - Historical price data
   * @returns Top opportunities
   */
  static findOpportunities(
    tokens: string[],
    priceHistory: Record<string, number[]>
  ): MarketSignal[] {
    const signals: MarketSignal[] = [];

    for (const token of tokens) {
      const history = priceHistory[token];
      if (history && history.length >= 3) {
        const signal = this.analyzeMarket(token, history);
        if (signal.signal_type === 'buy' && signal.confidence >= 70) {
          signals.push(signal);
        }
      }
    }

    // Sort by confidence
    return signals.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate risk score for investment
   * 
   * @param priceHistory - Historical prices
   * @returns Risk score (0-100, higher = riskier)
   */
  static calculateRisk(priceHistory: number[]): number {
    if (priceHistory.length < 10) return 50; // Unknown risk

    // Calculate volatility (standard deviation)
    const mean = priceHistory.reduce((a, b) => a + b, 0) / priceHistory.length;
    const variance = priceHistory.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / priceHistory.length;
    const volatility = Math.sqrt(variance) / mean;

    // Map volatility to 0-100 scale
    return Math.min(100, volatility * 1000);
  }

  /**
   * Generate daily market report
   * 
   * @param signals - Market signals
   * @param opportunities - Arbitrage opportunities
   * @returns Market report
   */
  static generateDailyReport(
    signals: MarketSignal[],
    opportunities: ArbitrageOpportunity[]
  ) {
    const buySignals = signals.filter((s) => s.signal_type === 'buy');
    const sellSignals = signals.filter((s) => s.signal_type === 'sell');
    const alerts = signals.filter((s) => s.signal_type === 'alert');

    const activeOpportunities = opportunities.filter((o) => o.status === 'active');
    const totalPotentialProfit = activeOpportunities.reduce((sum, o) => sum + o.potential_profit, 0);

    return {
      date: new Date().toISOString().split('T')[0],
      summary: {
        total_signals: signals.length,
        buy_signals: buySignals.length,
        sell_signals: sellSignals.length,
        alerts: alerts.length,
        arbitrage_opportunities: activeOpportunities.length,
        total_potential_profit: totalPotentialProfit,
      },
      top_buy_signals: buySignals.slice(0, 5),
      top_arbitrage: activeOpportunities.slice(0, 5),
      alerts,
    };
  }
}
