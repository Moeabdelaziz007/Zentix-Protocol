/**
 * Quick Demo for Glamify AI Agent
 * Part of the Marketing Guild
 * 
 * This demo showcases the core capabilities of the Glamify AI Agent
 * including product analysis, visual content creation, and marketing strategy.
 */

import { GlamifyAIAgent } from '../../core/agents/marketingGuild/glamifyAIAgent';

async function runGlamifyDemo() {
  console.log('🚀 Starting Glamify AI Agent Quick Demo');
  console.log('======================================\n');

  try {
    // Get the singleton instance of the Glamify AI Agent
    const glamifyAgent = GlamifyAIAgent.getInstance();
    
    console.log('✅ Glamify AI Agent initialized successfully\n');
    
    // Analyze a product
    console.log('🔍 Analyzing product: "Luxury Skincare Set"');
    const productAnalysis = await glamifyAgent.analyzeProduct({
      name: 'Luxury Skincare Set',
      category: 'Beauty',
      price: 199.99,
      features: ['Anti-aging', 'Hydrating', 'Natural ingredients'],
      targetAudience: 'Women 25-45'
    });
    
    console.log('✅ Product analysis completed:');
    console.log(`   Market Position: ${productAnalysis.marketPosition}`);
    console.log(`   Unique Selling Points: ${productAnalysis.usps.length}`);
    console.log(`   Competitor Analysis: ${productAnalysis.competitorAnalysis.length} competitors\n`);
    
    // Generate visual content concepts
    console.log('🎨 Generating visual content concepts...');
    const visualConcepts = await glamifyAgent.generateVisualConcepts(productAnalysis);
    
    console.log('✅ Visual concepts generated:');
    console.log(`   Concepts: ${visualConcepts.length}`);
    console.log(`   Primary Style: ${visualConcepts[0]?.style || 'N/A'}\n`);
    
    // Create marketing copy
    console.log('✍️ Creating marketing copy...');
    const marketingCopy = await glamifyAgent.createMarketingCopy(productAnalysis, visualConcepts[0]);
    
    console.log('✅ Marketing copy created:');
    console.log(`   Headline: ${marketingCopy.headline}`);
    console.log(`   Body Preview: ${marketingCopy.body.substring(0, 100)}...\n`);
    
    // Generate social media posts
    console.log('📱 Generating social media posts...');
    const socialPosts = await glamifyAgent.generateSocialPosts(productAnalysis, marketingCopy);
    
    console.log('✅ Social media posts generated:');
    console.log(`   Platforms: ${Object.keys(socialPosts).join(', ')}\n`);
    
    // Optimize for conversions
    console.log('📈 Optimizing for conversions...');
    const optimization = await glamifyAgent.optimizeForConversions(productAnalysis, marketingCopy);
    
    console.log('✅ Conversion optimization completed:');
    console.log(`   CTA Suggestions: ${optimization.ctaSuggestions.length}`);
    console.log(`   A/B Test Variants: ${optimization.abTestVariants.length}\n`);
    
    console.log('🎉 Glamify AI Agent Quick Demo completed successfully!');
    console.log('   The agent demonstrated:');
    console.log('   • Product analysis and market positioning');
    console.log('   • Visual content concept generation');
    console.log('   • Marketing copy creation');
    console.log('   • Social media post generation');
    console.log('   • Conversion optimization');
    
  } catch (error) {
    console.error('❌ Error in Glamify AI Agent demo:', error);
    process.exit(1);
  }
}

// Run the demo
runGlamifyDemo().catch(console.error);