/**
 * Glamify AI Agent Test
 * Simple test to verify the Glamify AI Agent functionality
 */

import { GlamifyAIAgent } from '../core/agents/marketingGuild/glamifyAIAgent';
import { AgentLogger, LogLevel } from '../core/utils/agentLogger';

async function runGlamifyAITest() {
  console.log('🧪 Glamify AI Agent Test');
  console.log('======================\n');

  try {
    // Initialize the Glamify AI Agent
    const glamifyAgent = GlamifyAIAgent.getInstance();
    await glamifyAgent.initialize();
    
    console.log('✅ Glamify AI Agent initialized');

    // Test creating a beauty profile
    const userId = 'test_user_123';
    const profile = await glamifyAgent.createBeautyProfile(userId, {
      skinType: 'oily',
      hairConcerns: ['frizz'],
      preferredStyles: ['minimalist'],
      favoriteInfluencers: ['influencer_test'],
      budgetRange: 'mid',
      favoriteColors: ['red'],
      preferredBrands: ['test_brand']
    });
    
    console.log('✅ Beauty profile created successfully');
    console.log(`Profile ID: ${profile.id}`);

    // Test generating recommendations
    const recommendations = await glamifyAgent.generateRecommendations({
      userId,
      profileId: profile.id,
      limit: 3
    });
    
    console.log('✅ Recommendations generated successfully');
    console.log(`Generated ${recommendations.length} recommendations`);

    // Test searching products
    const searchResults = await glamifyAgent.searchProducts(
      'foundation for oily skin', 
      userId
    );
    
    console.log('✅ Product search completed successfully');
    console.log(`Found ${searchResults.length} products`);

    // Test generating affiliate link
    const affiliateLink = await glamifyAgent.generateAffiliateLink(
      'test_product_123', 
      'noon', 
      userId
    );
    
    console.log('✅ Affiliate link generated successfully');
    console.log(`Link: ${affiliateLink.substring(0, 50)}...`);

    // Test recording user preference
    const preferenceRecorded = await glamifyAgent.recordUserPreference(
      userId, 
      'test_product_123', 
      'saved'
    );
    
    console.log('✅ User preference recorded successfully');
    console.log(`Preference recorded: ${preferenceRecorded}`);

    // Test completing the look
    const complementaryProducts = await glamifyAgent.completeTheLook(
      'test_product_123', 
      userId
    );
    
    console.log('✅ Complete the look feature worked successfully');
    console.log(`Suggested ${complementaryProducts.length} complementary products`);

    // Test scraping and tagging products (using a supported platform)
    const scrapedProducts = await glamifyAgent.scrapeAndTagProducts(
      'noon', 
      'makeup', 
      2
    );
    
    console.log('✅ Product scraping and tagging completed successfully');
    console.log(`Scraped and tagged ${scrapedProducts.length} products`);

    console.log('\n🎉 All tests passed! Glamify AI Agent is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

// Run the test
runGlamifyAITest();

// Export the function for use in other modules
export { runGlamifyAITest };