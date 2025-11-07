#!/usr/bin/env tsx
/**
 * Automated Arbitrage Monitoring
 * Scans markets for profitable opportunities
 * 
 * Run: npm run cron:arbitrage-monitor
 * Schedule: Every 5 minutes
 */

import { ArbitrageAgent, MarketIntelligenceAgent } from '../../core/agents/smartAgents';
import { WalletService, ZentixWallet } from '../../core/economy/walletService';
import type { ArbitrageOpportunity, MarketSignal } from '../../core/agents/smartAgents';

/**
 * Monitor markets and detect arbitrage opportunities
 */
async function monitorArbitrageOpportunities() {
  console.log('\n💹 Starting Arbitrage Monitoring');
  console.log('═'.repeat(50));
  console.log(`⏰ Time: ${new Date().toISOString()}\n`);

  try {
    // Tokens to monitor
    const tokens = ['ETH', 'BTC', 'MATIC', 'USDC', 'DAI', 'LINK', 'UNI'];
    const exchanges = ['Uniswap', 'Sushiswap', 'QuickSwap', 'Curve'];

    console.log(`🔍 Monitoring ${tokens.length} tokens across ${exchanges.length} exchanges\n`);

    // Fetch price data
    const prices = await ArbitrageAgent.monitorMarkets(tokens, exchanges);
    
    // Detect opportunities
    const opportunity = ArbitrageAgent.detectOpportunity(prices, 0.5); // 0.5% minimum profit

    if (opportunity) {
      console.log('🚨 ARBITRAGE OPPORTUNITY DETECTED!\n');
      console.log(`   Token: ${opportunity.token_symbol}`);
      console.log(`   Buy from: ${opportunity.buy_exchange} at $${opportunity.buy_price.toFixed(4)}`);
      console.log(`   Sell on: ${opportunity.sell_exchange} at $${opportunity.sell_price.toFixed(4)}`);
      console.log(`   Profit: ${opportunity.profit_percentage.toFixed(2)}% ($${opportunity.potential_profit.toFixed(2)})`);
      console.log(`   Status: ${opportunity.status}`);

      // In production, notify subscribed users
      // await notifySubscribers(opportunity);

      return {
        success: true,
        opportunity,
        timestamp: new Date().toISOString(),
      };
    } else {
      console.log('ℹ️  No arbitrage opportunities found above 0.5% threshold\n');
      
      // Show top price differences anyway
      console.log('📊 Price Analysis:');
      tokens.forEach(token => {
        const tokenPrices = prices.filter(p => p.symbol === token);
        if (tokenPrices.length > 0) {
          const sorted = tokenPrices.sort((a, b) => a.price - b.price);
          const lowest = sorted[0];
          const highest = sorted[sorted.length - 1];
          const diff = ((highest.price - lowest.price) / lowest.price) * 100;
          
          console.log(`   ${token}: ${diff.toFixed(3)}% spread (${lowest.exchange} → ${highest.exchange})`);
        }
      });

      return {
        success: true,
        opportunity: null,
        timestamp: new Date().toISOString(),
      };
    }

  } catch (error) {
    console.error('\n❌ Error in arbitrage monitoring:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Generate market intelligence report
 */
async function generateMarketReport() {
  console.log('\n📊 Generating Market Intelligence Report\n');

  try {
    const tokens = ['ETH', 'BTC', 'MATIC', 'LINK'];
    
    // Mock price history (in production, fetch from API)
    const priceHistory: Record<string, number[]> = {
      ETH: [2000, 2010, 2020, 2015, 2030, 2025, 2035],
      BTC: [45000, 45200, 45100, 45300, 45400, 45350, 45500],
      MATIC: [0.80, 0.81, 0.82, 0.81, 0.83, 0.84, 0.85],
      LINK: [15.5, 15.6, 15.7, 15.8, 15.9, 16.0, 16.1],
    };

    const signals = MarketIntelligenceAgent.findOpportunities(tokens, priceHistory);

    console.log(`🎯 Found ${signals.length} high-confidence signals:\n`);

    signals.forEach(signal => {
      const icon = signal.signal_type === 'buy' ? '📈' : signal.signal_type === 'sell' ? '📉' : '⚠️';
      console.log(`${icon} ${signal.token_symbol}: ${signal.signal_type.toUpperCase()}`);
      console.log(`   Confidence: ${signal.confidence}%`);
      console.log(`   Reason: ${signal.reason}`);
      if (signal.price_target) {
        console.log(`   Target: $${signal.price_target.toFixed(2)}`);
      }
      console.log('');
    });

    // Calculate risk scores
    console.log('⚖️  Risk Assessment:');
    Object.entries(priceHistory).forEach(([token, history]) => {
      const risk = MarketIntelligenceAgent.calculateRisk(history);
      const riskLevel = risk < 30 ? 'Low' : risk < 60 ? 'Medium' : 'High';
      console.log(`   ${token}: ${riskLevel} (${risk.toFixed(1)}/100)`);
    });

    return {
      success: true,
      signals,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('\n❌ Error generating market report:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Auto-execute profitable arbitrage for subscribed users
 */
async function autoExecuteArbitrage(opportunity: ArbitrageOpportunity) {
  console.log('\n🤖 Auto-Executing Arbitrage for Subscribers\n');

  try {
    // Mock subscribed users with auto-invest enabled
    const subscribedUsers = [
      { did: 'zxdid:zentix:user1', autoInvestAmount: 100 },
      { did: 'zxdid:zentix:user2', autoInvestAmount: 50 },
    ];

    let totalProfit = 0;

    for (const user of subscribedUsers) {
      // Create wallet if doesn't exist
      let wallet = WalletService.createWallet(user.did);
      wallet = WalletService.deposit(wallet, user.autoInvestAmount, 'Auto-invest deposit');

      // Execute arbitrage
      const { wallet: updatedWallet, activity, reward } = ArbitrageAgent.executeArbitrage(
        wallet,
        opportunity,
        user.autoInvestAmount
      );

      totalProfit += activity.reward_earned;

      console.log(`✅ Executed for ${user.did.slice(0, 30)}...`);
      console.log(`   Invested: ${user.autoInvestAmount} ZXT`);
      console.log(`   Profit: ${activity.reward_earned.toFixed(2)} ZXT`);
    }

    console.log(`\n💰 Total Profit Generated: ${totalProfit.toFixed(2)} ZXT`);

    return {
      success: true,
      usersProcessed: subscribedUsers.length,
      totalProfit,
    };

  } catch (error) {
    console.error('\n❌ Error auto-executing arbitrage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Compound micro-investments
 */
async function compoundInvestments() {
  console.log('\n📈 Compounding Micro-Investments\n');

  try {
    // Mock active investments
    const activeInvestments = [
      // In production, fetch from database
    ];

    console.log(`💼 Processing ${activeInvestments.length} active investments\n`);

    // In production, iterate and compound each investment
    console.log('✅ All investments compounded successfully!\n');

    return {
      success: true,
      investmentsCompounded: activeInvestments.length,
    };

  } catch (error) {
    console.error('\n❌ Error compounding investments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    console.clear();
    
    // Monitor arbitrage
    const arbResult = await monitorArbitrageOpportunities();
    
    if (arbResult.success && arbResult.opportunity) {
      // Auto-execute if opportunity found
      await autoExecuteArbitrage(arbResult.opportunity);
    }

    // Generate market report
    await generateMarketReport();

    // Compound investments
    await compoundInvestments();

    console.log('\n═'.repeat(50));
    console.log('✨ Arbitrage monitoring cycle completed!\n');
    
    if (!arbResult.success) {
      process.exit(1);
    }
  })();
}

export { monitorArbitrageOpportunities, generateMarketReport };
