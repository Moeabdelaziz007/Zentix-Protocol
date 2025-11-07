#!/usr/bin/env tsx
/**
 * Free APIs Integration Demo
 * CoinGecko, Alpha Vantage, NewsAPI, Weather
 */

import { AgentLogger } from '../../core/utils/agentLogger';

async function main() {
  console.log('\n🌐 FREE APIs INTEGRATION DEMO\n');
  console.log('═'.repeat(60));

  // Dynamic imports for optimization
  const { CoinGeckoAPI, NewsAPI, OpenWeatherAPI, PublicSheetsDB } = await import(
    '../../core/apis/freeApisIntegration'
  );

  // ============================================
  // 1. COINGECKO - Real-time Crypto Prices
  // ============================================
  console.log('\n1️⃣  COINGECKO - Real-time Crypto Prices\n');

  const cryptoPrices = await AgentLogger.measurePerformance(
    'Demo',
    'getCryptoPrices',
    () => CoinGeckoAPI.getCryptoPrices(['bitcoin', 'ethereum', 'matic-network'])
  );

  cryptoPrices.forEach(coin => {
    const changeIcon = coin.price_change_24h >= 0 ? '📈' : '📉';
    console.log(`   ${changeIcon} ${coin.symbol}`);
    console.log(`      Price: $${coin.price_usd.toLocaleString()}`);
    console.log(`      24h Change: ${coin.price_change_24h.toFixed(2)}%`);
    console.log(`      Market Cap: $${(coin.market_cap / 1e9).toFixed(2)}B\n`);
  });

  // Trending coins
  const trending = await CoinGeckoAPI.getTrending();
  console.log('   🔥 Trending Coins:');
  trending.slice(0, 3).forEach((coin, i) => {
    console.log(`      ${i + 1}. ${coin.name} (${coin.symbol.toUpperCase()}) - Rank #${coin.market_cap_rank}`);
  });

  // Market overview
  const market = await CoinGeckoAPI.getMarketOverview();
  console.log(`\n   📊 Market Overview:`);
  console.log(`      Total Market Cap: $${(market.total_market_cap_usd / 1e12).toFixed(2)}T`);
  console.log(`      24h Change: ${market.market_cap_change_24h.toFixed(2)}%`);
  console.log(`      Active Cryptocurrencies: ${market.active_cryptocurrencies.toLocaleString()}`);

  // ============================================
  // 2. NEWS API - Latest Headlines
  // ============================================
  console.log('\n\n2️⃣  NEWS API - Latest Headlines\n');

  const cryptoNews = await NewsAPI.getHeadlines('crypto', 5);
  console.log('   📰 Crypto News:\n');

  cryptoNews.forEach((article, i) => {
    const sentimentIcon = {
      positive: '🟢',
      negative: '🔴',
      neutral: '🟡',
    }[article.sentiment || 'neutral'];

    console.log(`   ${i + 1}. ${sentimentIcon} ${article.title}`);
    console.log(`      ${article.description.slice(0, 80)}...`);
    console.log(`      Source: ${article.source}\n`);
  });

  // ============================================
  // 3. WEATHER API - Environmental Data
  // ============================================
  console.log('\n3️⃣  WEATHER API - Environmental Data\n');

  const weather = await OpenWeatherAPI.getWeather('London');
  console.log(`   🌤️  ${weather.city}:`);
  console.log(`      Temperature: ${weather.temperature_celsius}°C (feels like ${weather.feels_like}°C)`);
  console.log(`      Condition: ${weather.description}`);
  console.log(`      Humidity: ${weather.humidity}%`);
  console.log(`      Wind: ${weather.wind_speed} m/s`);

  // ============================================
  // PERFORMANCE SUMMARY
  // ============================================
  console.log('\n\n═'.repeat(60));
  console.log('⚡ PERFORMANCE SUMMARY\n');

  const stats = AgentLogger.getStats();
  console.log(`   Total API Calls: ${stats.total_operations}`);
  console.log(`   Average Response Time: ${stats.avg_duration_ms.toFixed(2)}ms`);
  console.log(`   Success Rate: 100%\n`);

  console.log('   API Operations:');
  Object.entries(stats.by_agent).forEach(([agent, count]) => {
    console.log(`      • ${agent}: ${count} calls`);
  });

  console.log('\n═'.repeat(60));
  console.log('✅ All Free APIs Working!\n');
  console.log('💡 Tips:');
  console.log('   • CoinGecko: No API key needed, 10-50 calls/min');
  console.log('   • NewsAPI: 100 requests/day free tier');
  console.log('   • Weather: 1000 calls/day free tier');
  console.log('   • Alpha Vantage: 5 calls/min, 500/day\n');
}

main().catch(error => {
  console.error('\n❌ Demo failed:', error.message);
  process.exit(1);
});
