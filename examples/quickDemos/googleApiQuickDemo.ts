#!/usr/bin/env tsx
/**
 * Quick Demo: Google APIs Integration
 * Dynamic import for performance optimization
 */

import { AgentLogger } from '../../core/utils/agentLogger';

async function main() {
  console.log('\n🔍 Google APIs Integration - Quick Demo\n');

  // Dynamic import - loads only when needed
  const { GoogleSearchAgent, GoogleTrendsAgent, GoogleNLPAgent } = await import(
    '../../core/agents/googleApisIntegration'
  );

  // Trends (no API key needed for demo)
  const trends = await AgentLogger.measurePerformance(
    'GoogleTrendsAgent',
    'getTrendingTopics',
    () => GoogleTrendsAgent.getTrendingTopics()
  );

  console.log('📈 Trending Topics:');
  trends.forEach((trend) => {
    console.log(`  • ${trend.keyword}: ${trend.trend_direction} (${trend.interest_change}% change)`);
  });

  // NLP Sentiment Analysis (mock - requires API key)
  console.log('\n💭 Sentiment Analysis (Demo):');
  const mockSentiment = { score: 0.8, magnitude: 0.9, sentiment: 'positive' as const };
  console.log(`  Text: "Zentix Protocol is amazing!"`);
  console.log(`  Sentiment: ${mockSentiment.sentiment} (${mockSentiment.score.toFixed(2)})`);

  // Performance stats
  console.log('\n⚡ Performance:');
  const stats = AgentLogger.getStats();
  Object.entries(stats.by_agent).forEach(([agent, count]) => {
    console.log(`  ${agent}: ${count} operations`);
  });
  console.log(`  Average Duration: ${stats.avg_duration_ms.toFixed(2)}ms\n`);
}

main().catch(console.error);
