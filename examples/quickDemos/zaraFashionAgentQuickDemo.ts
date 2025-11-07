/**
 * Quick Demo for Zara Fashion Agent
 * Part of the Marketing Guild
 * 
 * This demo showcases the core capabilities of the Zara Fashion Agent
 * including trend analysis, style curation, and personalized recommendations.
 */

import { ZaraFashionAgent } from '../../core/agents/marketingGuild/zaraFashionAgent';

async function runZaraDemo() {
  console.log('🚀 Starting Zara Fashion Agent Quick Demo');
  console.log('=======================================\n');

  try {
    // Get the singleton instance of the Zara Fashion Agent
    const zaraAgent = ZaraFashionAgent.getInstance();
    
    console.log('✅ Zara Fashion Agent initialized successfully\n');
    
    // Analyze current fashion trends
    console.log('🔍 Analyzing current fashion trends...');
    const trends = await zaraAgent.analyzeTrends();
    
    console.log('✅ Current fashion trends identified:');
    trends.forEach((trend, index) => {
      console.log(`   ${index + 1}. ${trend.name}`);
      console.log(`      Category: ${trend.category}`);
      console.log(`      Popularity: ${trend.popularityScore}/100`);
      console.log(`      Season: ${trend.season}`);
      console.log('');
    });
    
    // Create personalized recommendations
    console.log('👤 Creating personalized recommendations for user profile...');
    const userProfile = {
      stylePreferences: ['casual', 'minimalist'],
      favoriteColors: ['black', 'white', 'navy'],
      budgetRange: 'mid-range',
      bodyType: 'pear-shaped'
    };
    
    const recommendations = await zaraAgent.createPersonalizedRecommendations(userProfile);
    
    console.log('✅ Personalized recommendations generated:');
    recommendations.items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name}`);
      console.log(`      Category: ${item.category}`);
      console.log(`      Price: $${item.price}`);
      console.log(`      Match Score: ${item.matchScore}/100`);
      console.log('');
    });
    
    // Generate style report
    console.log('📋 Generating style report...');
    const styleReport = await zaraAgent.generateStyleReport(userProfile, recommendations);
    
    console.log('✅ Style report generated:');
    console.log(`   Overall Style: ${styleReport.overallStyle}`);
    console.log(`   Best Categories: ${styleReport.bestCategories.join(', ')}`);
    console.log(`   Shopping Tips: ${styleReport.shoppingTips.length} tips provided`);
    console.log(`   Wardrobe Gaps: ${styleReport.wardrobeGaps.length} gaps identified`);
    
    console.log('\n🎉 Zara Fashion Agent demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in Zara Fashion Agent demo:', error);
  }
}

// Run the demo
runZaraDemo();