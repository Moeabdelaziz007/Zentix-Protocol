# Advanced AI Integrations Usage Guide

This guide explains how to use the newly implemented advanced AI capabilities in the ZentixOS platform.

## Prerequisites

1. Add the required API keys to your `.env` file:
```env
# ERNIE Bot (Baidu)
ERNIE_BOT_API_KEY=your_ernie_bot_api_key
ERNIE_BOT_SECRET_KEY=your_ernie_bot_secret_key

# DeepSeek Coder
DEEPSEEK_API_KEY=your_deepseek_api_key

# Amadeus
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret

# Sabre
SABRE_API_KEY=your_sabre_api_key
SABRE_API_SECRET=your_sabre_api_secret

# z.ai (provided)
ZAI_API_KEY=18d550a8e2c14d0f90303393ee92df5b.TYHWGYFpZ4EzOBOL
```

## 1. ERNIE Bot Integration (Asian Language Processing)

**Import:**
```typescript
import { ErnieBotAPI } from '../core/apis/ernieBotAPI';
```

**Key Methods:**

### Translation with Cultural Context
```typescript
const result = await ErnieBotAPI.translateWithCulturalContext(
  '你好，世界！',  // Text to translate
  'zh',           // Source language
  'en'            // Target language
);

console.log(result.translatedText);    // "Hello, World!"
console.log(result.culturalContext);   // Cultural nuances
console.log(result.confidence);        // Confidence score
console.log(result.pronunciation);     // Pronunciation guide
```

### Cultural Travel Tips
```typescript
const tips = await ErnieBotAPI.generateCulturalTravelTips(
  'Japan',                    // Destination
  ['technology', 'food'],     // Interests
  7                           // Trip duration in days
);

console.log(tips.tips);           // Cultural tips
console.log(tips.recommendations); // Local recommendations
console.log(tips.warnings);       // Important warnings
```

### Asian Language Analysis
```typescript
const analysis = await ErnieBotAPI.analyzeAsianLanguageText(
  '这是一句中文句子。',  // Text to analyze
  'zh'                  // Language
);

console.log(analysis.vocabulary);     // Vocabulary list
console.log(analysis.grammar);        // Grammar patterns
console.log(analysis.culturalNotes);  // Cultural notes
console.log(analysis.difficulty);     // Difficulty level
```

## 2. DeepSeek Coder Integration (Programming Assistance)

**Import:**
```typescript
import { DeepSeekCoderAPI } from '../core/apis/deepSeekCoderAPI';
```

**Key Methods:**

### Code Generation
```typescript
const code = await DeepSeekCoderAPI.generateCode(
  'Create a function that validates email addresses using regex',
  'typescript'  // Language
);

console.log(code.code);         // Generated code
console.log(code.explanation);  // Explanation
console.log(code.suggestions);  // Improvement suggestions
```

### Code Debugging
```typescript
const debugResult = await DeepSeekCoderAPI.debugCode(
  `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}`,           // Code with issues
  'javascript', // Language
  'TypeError: Cannot read property "price" of undefined' // Error message
);

console.log(debugResult.issues);      // List of issues
console.log(debugResult.fixedCode);   // Fixed code
console.log(debugResult.explanation); // Explanation of fixes
```

### Code Optimization
```typescript
const optimization = await DeepSeekCoderAPI.optimizeCode(
  'function fibonacci(n) { if (n <= 1) return n; return fibonacci(n - 1) + fibonacci(n - 2); }',
  'javascript',           // Language
  ['speed', 'memory']     // Optimization metrics
);

console.log(optimization.optimizedCode);  // Optimized code
console.log(optimization.benchmark);      // Performance comparison
console.log(optimization.changes);        // List of changes
```

### Code Explanation
```typescript
const explanation = await DeepSeekCoderAPI.explainCode(
  'const arr = [1, 2, 3, 4, 5]; const doubled = arr.map(x => x * 2);',
  'javascript'  // Language
);

console.log(explanation.summary);     // Code summary
console.log(explanation.functions);   // Function details
console.log(explanation.flow);        // Execution flow
console.log(explanation.complexity);  // Time/space complexity
```

## 3. Amadeus API Integration (Travel Booking)

**Import:**
```typescript
import { AmadeusAPI } from '../core/apis/amadeusAPI';
```

**Key Methods:**

### Flight Search
```typescript
const flights = await AmadeusAPI.searchFlights(
  'NYC',        // Origin
  'LAX',        // Destination
  '2023-12-15', // Departure date
  '2023-12-22', // Return date (optional)
  2             // Number of passengers
);

flights.forEach(flight => {
  console.log(`${flight.airline} ${flight.flightNumber}`);
  console.log(`${flight.departure.airport} → ${flight.arrival.airport}`);
  console.log(`Price: ${flight.price.amount} ${flight.price.currency}`);
});
```

### Hotel Search
```typescript
const hotels = await AmadeusAPI.searchHotels(
  'PAR',        // City code
  '2023-12-15', // Check-in date
  '2023-12-22', // Check-out date
  2             // Number of guests
);

hotels.forEach(hotel => {
  console.log(`${hotel.name} (${hotel.rating}★)`);
  console.log(`Price: ${hotel.price.amount} ${hotel.price.currency}`);
});
```

### Location Information
```typescript
const locations = await AmadeusAPI.getLocationInfo('Paris');
locations.forEach(location => {
  console.log(`${location.name} (${location.type})`);
});
```

## 4. Sabre API Integration (Global Distribution System)

**Import:**
```typescript
import { SabreAPI } from '../core/apis/sabreAPI';
```

**Key Methods:**

### Flight Search
```typescript
const flights = await SabreAPI.searchFlights(
  'JFK',        // Origin
  'LAX',        // Destination
  '2023-12-15', // Departure date
  '2023-12-22', // Return date (optional)
  2             // Number of passengers
);
```

### Booking Session Creation
```typescript
const session = await SabreAPI.createBookingSession('flight-offer-id');
console.log(`Session ID: ${session.sessionId}`);
console.log(`Status: ${session.status}`);
```

### Location Information
```typescript
const locations = await SabreAPI.getLocationInfo('New York');
locations.forEach(location => {
  console.log(`${location.name} (${location.type})`);
});
```

## 5. Running the Demo

To see all integrations in action, run:

```bash
npm run quick:advanced-ai
```

This will execute a comprehensive demo showcasing all the new AI capabilities.

## 6. Environment Configuration

The integrations support both test and production environments:

- **Amadeus**: Set `AMADEUS_ENV=production` for production
- **Sabre**: Set `SABRE_ENV=production` for production

By default, both use their respective test environments.

## 7. Error Handling

All methods include proper error handling. When API keys are not provided, mock data is returned for testing purposes.

```typescript
try {
  const result = await ErnieBotAPI.translateWithCulturalContext('你好', 'zh', 'en');
  console.log(result);
} catch (error) {
  console.error('Translation failed:', error.message);
}
```

## 8. Performance Monitoring

All methods automatically track performance using the [AgentLogger](file:///Users/cryptojoker710/Desktop/Zentix%20Protocol/core/utils/agentLogger.ts#L37-L172) system, which is consistent with the rest of the ZentixOS platform.

## 9. Integration with Existing Systems

These new integrations work seamlessly with existing ZentixOS components:

- **LingoLeap**: Enhanced with ERNIE Bot for better Asian language support
- **Luna Travel Agent**: Empowered with Amadeus and Sabre for direct bookings
- **Amrikyy**: Augmented with DeepSeek Coder for advanced programming assistance

## 10. Best Practices

1. Always handle errors appropriately
2. Use environment variables for API keys
3. Test with mock data when API keys are not available
4. Monitor performance using the built-in tracking
5. Follow the established patterns for consistency