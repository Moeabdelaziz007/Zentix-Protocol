#!/usr/bin/env tsx

/**
 * Advanced AI Integration Demo
 * Demonstrates the new ERNIE Bot, DeepSeek Coder, Amadeus, and Sabre API integrations
 */

import dotenv from 'dotenv';
import { ErnieBotAPI } from '../../core/apis/ernieBotAPI';
import { DeepSeekCoderAPI } from '../../core/apis/deepSeekCoderAPI';
import { AmadeusAPI } from '../../core/apis/amadeusAPI';
import { SabreAPI } from '../../core/apis/sabreAPI';

// Load environment variables
dotenv.config();

async function runAdvancedAIDemo() {
  console.log('🚀 Starting Advanced AI Integration Demo\n');
  
  try {
    // ERNIE Bot Translation Demo
    console.log('🤖 ERNIE Bot Translation Demo');
    console.log('============================');
    
    const translationResult = await ErnieBotAPI.translateWithCulturalContext(
      '你好，世界！',
      'zh',
      'en'
    );
    
    console.log('Translation:', translationResult.translatedText);
    console.log('Cultural Context:', translationResult.culturalContext);
    console.log('Confidence:', translationResult.confidence);
    console.log('Pronunciation:', translationResult.pronunciation || 'N/A');
    console.log('');

    // ERNIE Bot Cultural Travel Tips Demo
    console.log('🌏 ERNIE Bot Cultural Travel Tips Demo');
    console.log('=====================================');
    
    const travelTips = await ErnieBotAPI.generateCulturalTravelTips(
      'Japan',
      ['technology', 'food', 'culture'],
      7
    );
    
    console.log('Cultural Tips:', travelTips.tips.slice(0, 3));
    console.log('Local Recommendations:', travelTips.recommendations.slice(0, 3));
    console.log('Important Warnings:', travelTips.warnings.slice(0, 2));
    console.log('');

    // DeepSeek Coder Code Generation Demo
    console.log('💻 DeepSeek Coder Code Generation Demo');
    console.log('====================================');
    
    const codeGeneration = await DeepSeekCoderAPI.generateCode(
      'Create a function that validates email addresses using regex',
      'typescript'
    );
    
    console.log('Generated Code:');
    console.log(codeGeneration.code);
    console.log('\nExplanation:', codeGeneration.explanation);
    console.log('Suggestions:', codeGeneration.suggestions);
    console.log('');

    // DeepSeek Coder Code Debugging Demo
    console.log('🐛 DeepSeek Coder Debugging Demo');
    console.log('==============================');
    
    const debuggingResult = await DeepSeekCoderAPI.debugCode(
      `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}`,
      'javascript',
      'TypeError: Cannot read property "price" of undefined'
    );
    
    console.log('Issues Found:', debuggingResult.issues);
    console.log('Fixed Code:');
    console.log(debuggingResult.fixedCode);
    console.log('\nExplanation:', debuggingResult.explanation);
    console.log('');

    // Amadeus Flight Search Demo
    console.log('✈️ Amadeus Flight Search Demo');
    console.log('===========================');
    
    const flights = await AmadeusAPI.searchFlights(
      'NYC',
      'LAX',
      '2023-12-15',
      '2023-12-22',
      2
    );
    
    console.log('Found', flights.length, 'flights:');
    flights.slice(0, 2).forEach((flight: any) => {
      console.log(`- ${flight.airline} ${flight.flightNumber}: ${flight.departure.airport} → ${flight.arrival.airport}`);
      console.log(`  Price: ${flight.price.amount} ${flight.price.currency}`);
      console.log(`  Duration: ${flight.duration}`);
    });
    console.log('');

    // Sabre Flight Search Demo
    console.log('🛫 Sabre Flight Search Demo');
    console.log('=========================');
    
    const sabreFlights = await SabreAPI.searchFlights(
      'JFK',
      'LAX',
      '2023-12-15',
      '2023-12-22',
      2
    );
    
    console.log('Found', sabreFlights.length, 'flights:');
    sabreFlights.slice(0, 2).forEach((flight: any) => {
      console.log(`- ${flight.airline} ${flight.flightNumber}: ${flight.departure.airport} → ${flight.arrival.airport}`);
      console.log(`  Price: ${flight.price.amount} ${flight.price.currency}`);
      console.log(`  Duration: ${flight.duration}`);
    });
    console.log('');

    // Amadeus Hotel Search Demo
    console.log('🏨 Amadeus Hotel Search Demo');
    console.log('===========================');
    
    const hotels = await AmadeusAPI.searchHotels(
      'PAR',
      '2023-12-15',
      '2023-12-22',
      2
    );
    
    console.log('Found', hotels.length, 'hotels:');
    hotels.slice(0, 2).forEach((hotel: any) => {
      console.log(`- ${hotel.name} (${hotel.rating}★)`);
      console.log(`  Price: ${hotel.price.amount} ${hotel.price.currency}`);
      console.log(`  Address: ${hotel.address.line1}, ${hotel.address.city}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Demo failed with error:', error);
  }

  console.log('\n✅ Advanced AI Integration Demo completed!');
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runAdvancedAIDemo();
}

export { runAdvancedAIDemo };