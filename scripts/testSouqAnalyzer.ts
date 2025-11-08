/**
 * MIT License
 * 
 * Copyright (c) 2025 Mohamed Hossameldin Abdelaziz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Contact Information:
 * Mohamed Hossameldin Abdelaziz
 * Email: Mabdela1@students.kennesaw.edu
 * Alternate Email: Amrikyy@gmail.com
 * Phone: +201094228044
 * WhatsApp: +17706160211
 * LinkedIn: https://www.linkedin.com/in/mohamed-abdelaziz-815797347/
 */

/**
 * Test Script for Souq-Analyzer Agent
 * Tests the core functionality of the Souq-Analyzer E-commerce Intelligence Agent
 */

import { SouqAnalyzerAgent } from '../core/agents/marketingGuild/souqAnalyzerAgent';
import { ArabicNLPService } from '../core/services/arabicNLPService';
import { EcommerceScraperService } from '../core/services/ecommerceScraperService';

async function testSouqAnalyzer() {
  console.log('🧪 Souq-Analyzer Agent Test Suite');
  console.log('=================================\n');

  try {
    // Initialize services
    const souqAnalyzer = SouqAnalyzerAgent.getInstance();
    const arabicNLP = ArabicNLPService.getInstance();
    const ecommerceScraper = EcommerceScraperService.getInstance();

    // Test 1: Arabic Dialect Detection
    console.log('Test 1: Arabic Dialect Detection');
    const dialectTest = "والله شي حلوعليكم"; // Gulf dialect
    const dialectResult = await arabicNLP.detectDialect(dialectTest);
    console.log(`✓ Dialect detection: ${dialectResult.dialect}`);
    
    // Test 2: Arabic Sentiment Analysis
    console.log('\nTest 2: Arabic Sentiment Analysis');
    const sentimentTest = "المنتج جميل جداً وسعره ممتاز"; // Positive sentiment
    const sentimentResult = await arabicNLP.analyzeSentiment(sentimentTest);
    console.log(`✓ Sentiment analysis: ${sentimentResult.sentiment} (${sentimentResult.score.toFixed(2)})`);
    
    // Test 3: Market Analysis
    console.log('\nTest 3: Market Analysis');
    const marketReport = await souqAnalyzer.analyzeMarket('noon', 'Coffee', undefined, { includeReviews: true });
    console.log(`✓ Market analysis completed: ${marketReport.products.length} products, ${marketReport.reviews.length} reviews`);
    
    // Test 4: Pricing Recommendations
    console.log('\nTest 4: Pricing Recommendations');
    const pricingRecs = await souqAnalyzer.generatePricingRecommendations(
      marketReport.products.slice(0, 2),
      marketReport.competitors.slice(0, 2)
    );
    console.log(`✓ Generated ${pricingRecs.length} pricing recommendations`);
    
    // Test 5: Product Optimization
    console.log('\nTest 5: Product Optimization');
    const optimizations = await souqAnalyzer.optimizeProductListings(
      marketReport.products.slice(0, 2),
      marketReport.reviews.slice(0, 5)
    );
    console.log(`✓ Generated optimizations for ${optimizations.length} products`);
    
    // Test 6: E-commerce Scraping
    console.log('\nTest 6: E-commerce Scraping');
    const scrapedProducts = await ecommerceScraper.searchProducts('noon', 'coffee', 3);
    console.log(`✓ Scraped ${scrapedProducts.length} products`);
    
    console.log('\n✅ All tests passed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSouqAnalyzer().then(success => {
    process.exit(success ? 0 : 1);
  });
}

// Export for use in other modules
export { testSouqAnalyzer };