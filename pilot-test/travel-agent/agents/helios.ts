// Helios Agent - Inspiration & Destination Expert
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI if API key is available
let genAI: GoogleGenerativeAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export interface HeliosRequest {
  destination: string;
  interests: string[];
  budget: number;
  duration: number; // in days
}

export interface HeliosResponse {
  recommendations: {
    attractions: {
      name: string;
      description: string;
      rating: number;
      category: string;
      estimatedCost: number;
      bestTimeToVisit: string;
      mustVisit: boolean;
    }[];
    activities: {
      name: string;
      description: string;
      duration: string;
      price: number;
      bestTime: string;
      season: string;
    }[];
    dining: {
      restaurant: string;
      cuisine: string;
      priceRange: string;
      recommendation: string;
      bestTime: string;
    }[];
  };
  itinerary: {
    day: number;
    activities: string[];
    meals: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
  }[];
}

// Generate destination recommendations using Gemini
export async function generateRecommendations(request: HeliosRequest): Promise<HeliosResponse> {
  if (!genAI) {
    // Fallback to simulated recommendations
    return generateSimulatedRecommendations(request);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are Helios, a travel inspiration expert. Generate detailed travel recommendations for ${request.destination}.
    
User interests: ${request.interests.join(', ')}
Budget: $${request.budget}
Duration: ${request.duration} days

Please provide:
1. Top attractions with descriptions, ratings, categories, and estimated costs
2. Recommended activities with durations, prices, and best times
3. Dining recommendations with cuisines, price ranges, and best times
4. A daily itinerary with activities and meal suggestions

Respond in JSON format with the exact structure specified.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse the response as JSON
    try {
      const jsonResponse = JSON.parse(text.replace(/```json|```/g, ''));
      return jsonResponse;
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON, using fallback');
      return generateSimulatedRecommendations(request);
    }
  } catch (error) {
    console.error('Helios Gemini error:', error);
    return generateSimulatedRecommendations(request);
  }
}

// Simulated recommendations for when API is not available
function generateSimulatedRecommendations(request: HeliosRequest): HeliosResponse {
  const destinations: Record<string, string[]> = {
    'Paris': ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral'],
    'Tokyo': ['Tokyo Tower', 'Senso-ji Temple', 'Shibuya Crossing'],
    'New York': ['Statue of Liberty', 'Central Park', 'Times Square'],
    'Rome': ['Colosseum', 'Vatican City', 'Trevi Fountain'],
    'London': ['Big Ben', 'Tower of London', 'British Museum']
  };
  
  const attractions = destinations[request.destination] || [`Top Attraction in ${request.destination}`];
  
  return {
    recommendations: {
      attractions: attractions.map((name, index) => ({
        name,
        description: `Must-see landmark in ${request.destination}`,
        rating: 4.5 - (index * 0.2),
        category: index % 2 === 0 ? 'Landmark' : 'Cultural',
        estimatedCost: 20 + (index * 5),
        bestTimeToVisit: index % 2 === 0 ? 'Morning' : 'Afternoon',
        mustVisit: index === 0
      })),
      activities: [
        {
          name: `Guided Tour of ${request.destination}`,
          description: `Professional guided tour with local expert`,
          duration: '3 hours',
          price: Math.floor(request.budget * 0.1),
          bestTime: 'Morning',
          season: 'All year'
        }
      ],
      dining: [
        {
          restaurant: `Best Restaurant in ${request.destination}`,
          cuisine: 'Local',
          priceRange: '$$',
          recommendation: 'Try their signature dish',
          bestTime: 'Evening'
        }
      ]
    },
    itinerary: Array.from({ length: Math.min(request.duration, 7) }, (_, day) => ({
      day: day + 1,
      activities: [`Visit ${attractions[day % attractions.length] || 'local attraction'}`],
      meals: {
        breakfast: 'Local café',
        lunch: 'Local restaurant',
        dinner: 'Fine dining'
      }
    }))
  };
}

// Get personalized recommendations based on user profile
export async function getPersonalizedRecommendations(
  userId: string,
  request: HeliosRequest
): Promise<HeliosResponse> {
  // In a real implementation, this would fetch user preferences from a database
  console.log(`Helios: Generating personalized recommendations for user ${userId}`);
  
  // Add some personalization based on user ID
  const isPremiumUser = userId.includes('premium');
  
  const recommendations = await generateRecommendations(request);
  
  // Enhance recommendations for premium users
  if (isPremiumUser) {
    recommendations.recommendations.attractions.forEach(attraction => {
      attraction.estimatedCost *= 0.9; // 10% discount for premium users
    });
  }
  
  return recommendations;
}
