/**
 * Souq-Analyzer Agent Demo
 * Demonstrates the capabilities of the Souq-Analyzer E-commerce Intelligence Agent
 * for Middle Eastern markets with Arabic dialect sentiment analysis
 */

import { SouqAnalyzerAgent } from '../core/agents/marketingGuild/souqAnalyzerAgent';
import { ArabicNLPService } from '../core/services/arabicNLPService';
import { EcommerceScraperService } from '../core/services/ecommerceScraperService';

async function runSouqAnalyzerDemo() {
  console.log('🚀 Souq-Analyzer Agent Demo');
  console.log('==========================\n');

  try {
    // Initialize services
    const souqAnalyzer = SouqAnalyzerAgent.getInstance();
    const arabicNLP = ArabicNLPService.getInstance();
    const ecommerceScraper = EcommerceScraperService.getInstance();

    console.log('1. Arabic Dialect Detection and Sentiment Analysis');
    console.log('---------------------------------------------------');
    
    // Test Arabic dialect detection and sentiment analysis
    const arabicReviews = [
      "المنتج جميل جداً وسعره ممتاز", // Egyptian: Product is very beautiful and price is excellent
      "والله شي حلوعليكم", // Gulf: Really nice, thank you
      "شو بعمل هالمنتج؟", // Levantine: What does this product do?
      "الshipment تأخر وأتى تالف", // MSA: Shipment was delayed and arrived damaged
    ];

    for (const review of arabicReviews) {
      const dialectResult = await arabicNLP.detectDialect(review);
      const sentimentResult = await arabicNLP.analyzeSentiment(review, dialectResult.dialect);
      
      console.log(`Review: "${review}"`);
      console.log(`  Detected Dialect: ${dialectResult.dialect} (Confidence: ${(dialectResult.confidence * 100).toFixed(1)}%)`);
      console.log(`  Sentiment: ${sentimentResult.sentiment} (Score: ${sentimentResult.score.toFixed(2)})`);
      console.log('');
    }

    console.log('2. E-commerce Market Analysis');
    console.log('----------------------------');
    
    // Analyze market for a specific category
    const marketReport = await souqAnalyzer.analyzeMarket(
      'noon',
      'Arabic Coffee',
      undefined,
      { includeReviews: true, includeCompetitors: true }
    );

    console.log(`Market Analysis for "Arabic Coffee" on Noon:`);
    console.log(`  Date: ${marketReport.date.toISOString().split('T')[0]}`);
    console.log(`  Products Analyzed: ${marketReport.products.length}`);
    console.log(`  Reviews Processed: ${marketReport.reviews.length}`);
    console.log(`  Competitors Identified: ${marketReport.competitors.length}`);
    console.log(`  Market Trends: ${marketReport.marketTrends.length}`);
    console.log('');
    
    console.log('Key Insights:');
    marketReport.insights.slice(0, 3).forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });
    console.log('');
    
    console.log('Recommendations:');
    marketReport.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    console.log('');

    console.log('3. Pricing Recommendations');
    console.log('-------------------------');
    
    // Generate pricing recommendations
    const pricingRecs = await souqAnalyzer.generatePricingRecommendations(
      marketReport.products.slice(0, 3),
      marketReport.competitors
    );
    
    console.log('Pricing Recommendations:');
    pricingRecs.forEach(rec => {
      const product = marketReport.products.find(p => p.id === rec.productId);
      if (product) {
        console.log(`  ${product.title}:`);
        console.log(`    Current Price: ${product.currency} ${product.price}`);
        console.log(`    Suggested Price: ${product.currency} ${rec.suggestedPrice}`);
        console.log(`    Recommendation: ${rec.recommendation}`);
        console.log('');
      }
    });

    console.log('4. Product Listing Optimization');
    console.log('-------------------------------');
    
    // Optimize product listings
    const optimizations = await souqAnalyzer.optimizeProductListings(
      marketReport.products.slice(0, 2),
      marketReport.reviews
    );
    
    console.log('Product Optimization Suggestions:');
    optimizations.forEach(opt => {
      const product = marketReport.products.find(p => p.id === opt.productId);
      if (product) {
        console.log(`  ${product.title}:`);
        opt.optimizations.slice(0, 3).forEach(suggestion => {
          console.log(`    - ${suggestion}`);
        });
        console.log('');
      }
    });

    console.log('5. E-commerce Scraping Demo');
    console.log('---------------------------');
    
    // Demonstrate scraping capabilities
    const scrapedProducts = await ecommerceScraper.searchProducts('noon', 'traditional Arabic coffee', 5);
    
    console.log(`Scraped ${scrapedProducts.length} products for "traditional Arabic coffee":`);
    scrapedProducts.forEach((product, i) => {
      console.log(`  ${i + 1}. ${product.title}`);
      console.log(`     Price: ${product.currency} ${product.price}`);
      console.log(`     Rating: ${product.rating}/5 (${product.reviewCount} reviews)`);
      console.log(`     Seller: ${product.seller}`);
      console.log('');
    });

    console.log('✅ Souq-Analyzer Demo Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed with error:', error);
  }
}

// Run the demo
if (require.main === module) {
  runSouqAnalyzerDemo();
}

export { runSouqAnalyzerDemo };