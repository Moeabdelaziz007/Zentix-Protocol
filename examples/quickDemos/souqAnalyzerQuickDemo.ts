/**
 * Quick Demo: Souq-Analyzer Agent
 * Demonstrates the core capabilities of the Souq-Analyzer E-commerce Intelligence Agent
 * for Middle Eastern markets with Arabic dialect sentiment analysis
 */

import { SouqAnalyzerAgent } from '../../core/agents/marketingGuild/souqAnalyzerAgent';
import { ArabicNLPService } from '../../core/services/arabicNLPService';

async function runSouqAnalyzerQuickDemo() {
  console.log('🚀 Souq-Analyzer Quick Demo');
  console.log('==========================\n');

  try {
    // Initialize services
    const souqAnalyzer = SouqAnalyzerAgent.getInstance();
    const arabicNLP = ArabicNLPService.getInstance();

    console.log('1. Arabic Dialect Detection');
    console.log('---------------------------');
    
    // Test Arabic dialect detection
    const arabicText = "والله شي حلوعليكم"; // Gulf dialect: Really nice, thank you
    const dialectResult = await arabicNLP.detectDialect(arabicText);
    
    console.log(`Text: "${arabicText}"`);
    console.log(`Detected Dialect: ${dialectResult.dialect}`);
    console.log(`Confidence: ${(dialectResult.confidence * 100).toFixed(1)}%`);
    console.log('');

    console.log('2. Arabic Sentiment Analysis');
    console.log('----------------------------');
    
    // Test Arabic sentiment analysis
    const sentimentText = "المنتج جميل جداً وسعره ممتاز"; // Product is very beautiful and price is excellent
    const sentimentResult = await arabicNLP.analyzeSentiment(sentimentText);
    
    console.log(`Text: "${sentimentText}"`);
    console.log(`Sentiment: ${sentimentResult.sentiment}`);
    console.log(`Score: ${sentimentResult.score.toFixed(2)}`);
    console.log('');

    console.log('3. Market Analysis');
    console.log('------------------');
    
    // Analyze market for a specific category
    const marketReport = await souqAnalyzer.analyzeMarket(
      'noon',
      'Traditional Arabic Coffee',
      undefined,
      { includeReviews: true }
    );

    console.log(`Analyzed ${marketReport.products.length} products on Noon`);
    console.log(`Processed ${marketReport.reviews.length} customer reviews`);
    console.log(`Identified ${marketReport.marketTrends.length} market trends`);
    console.log('');

    console.log('Key Insights:');
    marketReport.insights.slice(0, 2).forEach((insight, i) => {
      console.log(`  ${i + 1}. ${insight}`);
    });
    console.log('');

    console.log('✅ Souq-Analyzer Quick Demo Completed!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runSouqAnalyzerQuickDemo();
}

// Export for use in other modules
export { runSouqAnalyzerQuickDemo };