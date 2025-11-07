/**
 * Quick Demo for Orion Analytics Agent
 * Part of the Marketing Guild
 * 
 * This demo showcases the core capabilities of the Orion Analytics Agent
 * including market analysis, trend identification, and predictive insights.
 */

import { OrionAnalyticsAgent } from '../../core/agents/marketingGuild/orionAnalyticsAgent';

async function runOrionDemo() {
  console.log('🚀 Starting Orion Analytics Agent Quick Demo');
  console.log('==========================================\n');

  try {
    // Get the singleton instance of the Orion Analytics Agent
    const orionAgent = OrionAnalyticsAgent.getInstance();
    
    console.log('✅ Orion Analytics Agent initialized successfully\n');
    
    // Analyze market trends
    console.log('🔍 Analyzing market trends for: "Beauty & Cosmetics"');
    const marketAnalysis = await orionAgent.analyzeMarketTrends('Beauty & Cosmetics');
    
    console.log('✅ Market analysis completed:');
    console.log(`   Trend Score: ${marketAnalysis.trendScore}`);
    console.log(`   Growth Rate: ${marketAnalysis.growthRate}%`);
    console.log(`   Market Size: $${marketAnalysis.marketSize}B`);
    console.log(`   Key Insights: ${marketAnalysis.keyInsights.length} insights generated`);
    console.log('');
    
    // Generate predictive insights
    console.log('🔮 Generating predictive insights...');
    const insights = await orionAgent.generatePredictiveInsights('Beauty & Cosmetics', marketAnalysis);
    
    console.log('✅ Predictive insights generated:');
    insights.forEach((insight, index) => {
      console.log(`   ${index + 1}. ${insight.description}`);
      console.log(`      Confidence: ${insight.confidence}%`);
      console.log(`      Impact: ${insight.impact}`);
      console.log('');
    });
    
    // Create visualizations
    console.log('📊 Creating data visualizations...');
    const visualizations = await orionAgent.createVisualizations(marketAnalysis);
    
    console.log('✅ Data visualizations created:');
    visualizations.forEach(viz => {
      console.log(`   • ${viz.type}: ${viz.title}`);
    });
    
    console.log('\n🎉 Orion Analytics Agent demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in Orion Analytics Agent demo:', error);
  }
}

// Run the demo
runOrionDemo();