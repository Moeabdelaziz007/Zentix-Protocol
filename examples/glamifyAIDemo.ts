/**
 * Glamify AI Agent Demo
 * Demonstrates the capabilities of the Glamify AI Agent for personalized beauty curation
 */

import { GlamifyAIAgent } from '../core/agents/marketingGuild/glamifyAIAgent';
import { AgentLogger, LogLevel } from '../core/utils/agentLogger';

async function runGlamifyAIDemo() {
  console.log('🚀 Glamify AI Agent Demo');
  console.log('========================\n');

  try {
    // Initialize the Glamify AI Agent
    const glamifyAgent = GlamifyAIAgent.getInstance();
    await glamifyAgent.initialize();
    
    console.log('✅ Glamify AI Agent initialized\n');

    // 1. Create a beauty profile
    console.log('1. Creating Beauty Profile');
    console.log('-------------------------');
    
    const userId = 'user_123';
    const profile = await glamifyAgent.createBeautyProfile(userId, {
      skinType: 'combination',
      hairConcerns: ['frizz', 'volume'],
      preferredStyles: ['glam', 'minimalist'],
      favoriteInfluencers: ['influencer1', 'influencer2'],
      budgetRange: 'mid',
      favoriteColors: ['rose', 'gold'],
      preferredBrands: ['brand1', 'brand2']
    });
    
    console.log(`Created beauty profile for user: ${userId}`);
    console.log(`Profile ID: ${profile.id}`);
    console.log(`Skin Type: ${profile.skinType}`);
    console.log(`Preferred Styles: ${profile.preferredStyles.join(', ')}\n`);

    // 2. Generate personalized recommendations
    console.log('2. Generating Personalized Recommendations');
    console.log('------------------------------------------');
    
    const recommendations = await glamifyAgent.generateRecommendations({
      userId,
      profileId: profile.id,
      limit: 5
    });
    
    console.log(`Generated ${recommendations.length} personalized recommendations:`);
    recommendations.slice(0, 3).forEach((rec: any, index: number) => {
      console.log(`  ${index + 1}. Product ID: ${rec.productId}`);
      console.log(`     Score: ${rec.score}/100`);
      console.log(`     Reason: ${rec.reason}\n`);
    });

    // 3. Search for products using natural language
    console.log('3. Searching for Products');
    console.log('------------------------');
    
    const searchResults = await glamifyAgent.searchProducts(
      'vegan cruelty-free foundation for oily skin under $50', 
      userId
    );
    
    console.log(`Found ${searchResults.length} products matching search query:`);
    searchResults.slice(0, 2).forEach((product: any, index: number) => {
      console.log(`  ${index + 1}. ${product.title}`);
      console.log(`     Price: ${product.currency} ${product.price}`);
      console.log(`     Rating: ${product.rating}/5\n`);
    });

    // 4. Generate affiliate link
    console.log('4. Generating Affiliate Link');
    console.log('----------------------------');
    
    const productId = 'product_abc123';
    const platform = 'noon';
    const affiliateLink = await glamifyAgent.generateAffiliateLink(
      productId, 
      platform, 
      userId
    );
    
    console.log(`Generated affiliate link for ${productId} on ${platform}:`);
    console.log(`${affiliateLink}\n`);

    // 5. Record user preference
    console.log('5. Recording User Preference');
    console.log('----------------------------');
    
    const preferenceRecorded = await glamifyAgent.recordUserPreference(
      userId, 
      productId, 
      'saved'
    );
    
    console.log(`User preference recorded: ${preferenceRecorded}\n`);

    // 6. Complete the look
    console.log('6. Completing the Look');
    console.log('----------------------');
    
    const complementaryProducts = await glamifyAgent.completeTheLook(
      productId, 
      userId
    );
    
    console.log(`Suggested ${complementaryProducts.length} complementary products:`);
    complementaryProducts.slice(0, 2).forEach((product: any, index: number) => {
      console.log(`  ${index + 1}. ${product.title}`);
      console.log(`     Category: ${product.category}`);
      console.log(`     Price: ${product.currency} ${product.price}\n`);
    });

    // 7. Scrape and tag products
    console.log('7. Scraping and Tagging Products');
    console.log('--------------------------------');
    
    const scrapedProducts = await glamifyAgent.scrapeAndTagProducts(
      'noon', 
      'makeup', 
      3
    );
    
    console.log(`Scraped and tagged ${scrapedProducts.length} products from Noon:`);
    scrapedProducts.forEach((product: any, index: number) => {
      console.log(`  ${index + 1}. ${product.title}`);
      console.log(`     Tags: ${product.tags ? product.tags.slice(0, 3).join(', ') : 'None'}\n`);
    });

    console.log('✅ Glamify AI Demo Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed with error:', error);
    process.exit(1);
  }
}

// Run the demo
runGlamifyAIDemo();

// Export the function for use in other modules
export { runGlamifyAIDemo };