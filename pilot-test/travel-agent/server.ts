import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// In-memory storage for travel plans
const travelPlans = new Map();

// Main Luna agent - Travel Assistant
interface TravelPlan {
  id: string;
  userId: string;
  destination: string;
  dates: {
    start: string;
    end: string;
  };
  budget: number;
  status: 'planning' | 'confirmed' | 'completed';
  createdAt: string;
  updatedAt: string;
  clients: {
    helios?: {
      status: 'pending' | 'processing' | 'completed';
      recommendations?: any[];
    };
    scout?: {
      status: 'pending' | 'processing' | 'completed';
      bookings?: any[];
    };
    atlas?: {
      status: 'pending' | 'processing' | 'completed';
      budgetTracking?: any;
    };
  };
}

// Helios agent - Inspiration & Destination Expert
interface HeliosRequest {
  destination: string;
  interests: string[];
  budget: number;
}

interface HeliosResponse {
  recommendations: {
    attractions: {
      name: string;
      description: string;
      rating: number;
      category: string;
      estimatedCost: number;
    }[];
    activities: {
      name: string;
      description: string;
      duration: string;
      price: number;
      bestTime: string;
    }[];
    dining: {
      restaurant: string;
      cuisine: string;
      priceRange: string;
      recommendation: string;
    }[];
  };
}

// Scout agent - Deal & Booking Finder
interface ScoutRequest {
  flights: {
    origin: string;
    destination: string;
    dates: {
      departure: string;
      return: string;
    };
  };
  hotels: {
    location: string;
    dates: {
      checkin: string;
      checkout: string;
    };
    guests: number;
  };
}

interface ScoutResponse {
  flights: {
    airline: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
    duration: string;
  }[];
  hotels: {
    name: string;
    rating: number;
    pricePerNight: number;
    totalPrice: number;
    amenities: string[];
  }[];
}

// Atlas agent - Smart Budget Planner
interface AtlasRequest {
  budget: number;
  allocations: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    shopping: number;
    emergency: number;
  };
}

interface AtlasResponse {
  tracking: {
    totalSpent: number;
    remainingBudget: number;
    dailyAllowance: number;
    categorySpending: {
      flights: number;
      accommodation: number;
      food: number;
      activities: number;
      shopping: number;
    };
  };
  alerts: {
    type: 'warning' | 'critical';
    message: string;
    threshold: number;
    current: number;
  }[];
}

// Create a new travel plan
app.post('/api/travel/plans', (req, res) => {
  const { userId, destination, dates, budget } = req.body;
  
  if (!userId || !destination || !dates || !budget) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: userId, destination, dates, budget',
    });
  }
  
  const planId = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const travelPlan: TravelPlan = {
    id: planId,
    userId,
    destination,
    dates: {
      start: dates.start,
      end: dates.end,
    },
    budget,
    status: 'planning',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clients: {
      helios: {
        status: 'pending',
      },
      scout: {
        status: 'pending',
      },
      atlas: {
        status: 'pending',
      },
    },
  };
  
  travelPlans.set(planId, travelPlan);
  
  res.json({
    success: true,
    data: travelPlan,
  });
});

// Get travel plan status
app.get('/api/travel/plans/:planId', (req, res) => {
  const { planId } = req.params;
  const plan = travelPlans.get(planId);
  
  if (!plan) {
    return res.status(404).json({
      success: false,
      error: 'Travel plan not found',
    });
  }
  
  res.json({
    success: true,
    data: plan,
  });
});

// Helios - Get destination recommendations
app.post('/api/travel/agents/helios/recommend', async (req, res) => {
  const { planId, interests, budget } = req.body;
  
  const plan = travelPlans.get(planId);
  if (!plan) {
    return res.status(404).json({
      success: false,
      error: 'Travel plan not found',
    });
  }
  
  // Update Helios status
  plan.clients.helios = {
    status: 'processing',
  };
  plan.updatedAt = new Date().toISOString();
  travelPlans.set(planId, plan);
  
  try {
    // Simulate Helios processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock recommendations based on destination
    const recommendations: HeliosResponse = {
      recommendations: {
        attractions: [
          {
            name: `Top Attraction in ${plan.destination}`,
            description: `Must-see landmark in ${plan.destination}`,
            rating: 4.5,
            category: 'Landmark',
            estimatedCost: 25,
          },
          {
            name: `Hidden Gem in ${plan.destination}`,
            description: `Lesser-known but amazing spot`,
            rating: 4.7,
            category: 'Experience',
            estimatedCost: 15,
          },
        ],
        activities: [
          {
            name: `Guided Tour of ${plan.destination}`,
            description: `Professional guided tour with local expert`,
            duration: '3 hours',
            price: 50,
            bestTime: 'Morning',
          },
        ],
        dining: [
          {
            restaurant: `Best Restaurant in ${plan.destination}`,
            cuisine: 'Local',
            priceRange: '$$',
            recommendation: 'Try their signature dish',
          },
        ],
      },
    };
    
    // Update plan with Helios results
    plan.clients.helios = {
      status: 'completed',
      recommendations: recommendations.recommendations,
    };
    plan.updatedAt = new Date().toISOString();
    travelPlans.set(planId, plan);
    
    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    plan.clients.helios = {
      status: 'failed',
    };
    plan.updatedAt = new Date().toISOString();
    travelPlans.set(planId, plan);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
    });
  }
});

// Scout - Find deals and bookings
app.post('/api/travel/agents/scout/search', async (req, res) => {
  const { planId, origin } = req.body;
  
  const plan = travelPlans.get(planId);
  if (!plan) {
    return res.status(404).json({
      success: false,
      error: 'Travel plan not found',
    });
  }
  
  // Update Scout status
  plan.clients.scout = {
    status: 'processing',
  };
  plan.updatedAt = new Date().toISOString();
  travelPlans.set(planId, plan);
  
  try {
    // Simulate Scout processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock flight and hotel options
    const options: ScoutResponse = {
      flights: [
        {
          airline: 'SkyWings Airlines',
          departureTime: '08:00 AM',
          arrivalTime: '11:30 AM',
          price: 450,
          duration: '3h 30m',
        },
        {
          airline: 'CloudJet',
          departureTime: '02:15 PM',
          arrivalTime: '05:45 PM',
          price: 380,
          duration: '3h 30m',
        },
      ],
      hotels: [
        {
          name: `${plan.destination} Grand Hotel`,
          rating: 4.2,
          pricePerNight: 120,
          totalPrice: 120 * 3, // 3 nights
          amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
        },
        {
          name: `${plan.destination} Boutique Inn`,
          rating: 4.6,
          pricePerNight: 95,
          totalPrice: 95 * 3,
          amenities: ['WiFi', 'Breakfast', 'Spa'],
        },
      ],
    };
    
    // Update plan with Scout results
    plan.clients.scout = {
      status: 'completed',
      bookings: options,
    };
    plan.updatedAt = new Date().toISOString();
    travelPlans.set(planId, plan);
    
    res.json({
      success: true,
      data: options,
    });
  } catch (error) {
    plan.clients.scout = {
      status: 'failed',
    };
    plan.updatedAt = new Date().toISOString();
    travelPlans.set(planId, plan);
    
    res.status(500).json({
      success: false,
      error: 'Failed to search for deals',
    });
  }
});

// Atlas - Budget tracking and alerts
app.post('/api/travel/agents/atlas/track', async (req, res) => {
  const { planId, spending } = req.body;
  
  const plan = travelPlans.get(planId);
  if (!plan) {
    return res.status(404).json({
      success: false,
      error: 'Travel plan not found',
    });
  }
  
  // Update Atlas status
  plan.clients.atlas = {
    status: 'processing',
  };
  plan.updatedAt = new Date().toISOString();
  travelPlans.set(planId, plan);
  
  try {
    // Simulate Atlas processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock budget tracking
    const totalSpent = spending?.flights + spending?.accommodation + spending?.food + spending?.activities || 0;
    const remainingBudget = plan.budget - totalSpent;
    const dailyAllowance = remainingBudget / 3; // 3 days
    
    const tracking: AtlasResponse = {
      tracking: {
        totalSpent,
        remainingBudget,
        dailyAllowance,
        categorySpending: {
          flights: spending?.flights || 0,
          accommodation: spending?.accommodation || 0,
          food: spending?.food || 0,
          activities: spending?.activities || 0,
          shopping: spending?.shopping || 0,
        },
      },
      alerts: remainingBudget < plan.budget * 0.2 ? [
        {
          type: 'warning',
          message: 'You have spent 80% of your budget. Consider adjusting your spending.',
          threshold: 0.8,
          current: totalSpent / plan.budget,
        }
      ] : [],
    };
    
    // Update plan with Atlas results
    plan.clients.atlas = {
      status: 'completed',
      budgetTracking: tracking,
    };
    plan.updatedAt = new Date().toISOString();
    travelPlans.set(planId, plan);
    
    res.json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    plan.clients.atlas = {
      status: 'failed',
    };
    plan.updatedAt = new Date().toISOString();
    travelPlans.set(planId, plan);
    
    res.status(500).json({
      success: false,
      error: 'Failed to track budget',
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'travel-agent' });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 TRAVEL AGENT SERVER STARTED');
  console.log('═'.repeat(60));
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log('\n📊 Available Endpoints:');
  console.log(`  POST /api/travel/plans                    - Create travel plan`);
  console.log(`  GET  /api/travel/plans/:planId           - Get plan status`);
  console.log(`  POST /api/travel/agents/helios/recommend - Get recommendations`);
  console.log(`  POST /api/travel/agents/scout/search     - Find deals`);
  console.log(`  POST /api/travel/agents/atlas/track      - Track budget`);
  console.log('═'.repeat(60) + '\n');
});
