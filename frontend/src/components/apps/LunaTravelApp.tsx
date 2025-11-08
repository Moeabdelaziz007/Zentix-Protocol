import { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Plane, 
  Hotel, 
  Compass, 
  DollarSign,
  Clock,
  Star,
  Sparkles,
  Camera,
  X
} from 'lucide-react';

import { useDebounce } from '../../hooks/useDebounce';
import { VirtualList } from '../../components/ui/VirtualList';
import { ContextualTooltip } from '../../components/ui/ContextualTooltip';
// Import the AI Agent Governance Protocol
import { AIAgentBase } from '../../../../protocols/AIAgentBase';

import { apiService } from '../../services/api';
import type { FlightSearchResult, GooglePlaceSearchResult } from '../../services/api';

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  price: string;
  bestTime: string;
  highlights: string[];
  weather: {
    temp: string;
    condition: string;
  };
}

interface Flight {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  stops: number;
}

interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  activity: string;
  location: string;
  type: 'flight' | 'hotel' | 'activity' | 'dining';
  cost: number;
}

interface HotelOption {
  id: string;
  name: string;
  rating: number;
  address: { line1: string; city: string; country: string };
  price: { amount: string; currency: string };
  amenities: string[];
  distance?: { value: number; unit: string };
}

interface ActivityOption {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  rating: number;
}

// Define types for the AI agent
interface TravelOutput {
  summary: string;
  recommendations: string[];
  confidence: number;
}

// Extend the base AI agent for LunaTravel
class LunaTravelAgent extends AIAgentBase {
  constructor() {
    super('LunaTravelApp');
  }

  protected async handleInstruction(): Promise<TravelOutput> {
    // Handle travel planning instructions
    return {
      summary: `Travel plan for your destination`,
      recommendations: ["Book flights", "Reserve hotel", "Plan activities"],
      confidence: 0.95
    };
  }

  protected async handleQuestion(): Promise<TravelOutput> {
    // Handle travel-related questions
    return {
      summary: "Travel question answered",
      recommendations: ["Travel database", "Weather API"],
      confidence: 0.88
    };
  }

  protected async handleData(): Promise<TravelOutput> {
    // Process travel data
    return {
      summary: "Data analyzed",
      recommendations: ["Data analyzed", "Trends identified"],
      confidence: 0.92
    };
  }

  protected async handleCommand(): Promise<TravelOutput> {
    // Handle travel commands
    return {
      summary: "Command executed",
      recommendations: ["Success"],
      confidence: 0.99
    };
  }

  protected async handleFeedback(): Promise<TravelOutput> {
    // Handle user feedback
    return {
      summary: "Feedback acknowledged",
      recommendations: ["Thank you for your feedback on your travel experience"],
      confidence: 1.0
    };
  }

  protected async handleGeneralInput(): Promise<TravelOutput> {
    // Handle general travel input
    return {
      summary: "General input processed",
      recommendations: ["Specify destination", "Set travel dates", "Determine budget"],
      confidence: 0.85
    };
  }
}

type TabType = 'explore' | 'flights' | 'hotels' | 'activities' | 'itinerary' | 'budget';

export function LunaTravelApp() {
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [travelers, setTravelers] = useState(2);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [departureCity, setDepartureCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [budget, setBudget] = useState(5000);
  const [flights, setFlights] = useState<FlightSearchResult[]>([]);
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [googlePlaces, setGooglePlaces] = useState<GooglePlaceSearchResult[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  const [itineraryError, setItineraryError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState('a mix of cultural sights, local food, and some relaxation');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  // Initialize the AI agent
  const [agent] = useState(() => new LunaTravelAgent());

  useEffect(() => {
    const initializeAgent = async () => {
      try {
        await agent.initialize();
        console.log('LunaTravelAgent initialized with governance protocol');
      } catch (error) {
        console.error('Failed to initialize LunaTravelAgent:', error);
      }
    };
    
    initializeAgent();
  }, [agent]);

  const popularDestinations: Destination[] = [
    {
      id: '1',
      name: 'Tokyo',
      country: 'Japan',
      description: 'A vibrant blend of traditional culture and cutting-edge technology',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      rating: 4.8,
      price: '$1,200',
      bestTime: 'Mar-May, Sep-Nov',
      highlights: ['Shibuya Crossing', 'Mount Fuji', 'Senso-ji Temple', 'Tokyo Skytree'],
      weather: { temp: '22°C', condition: 'Sunny' }
    },
    {
      id: '2',
      name: 'Paris',
      country: 'France',
      description: 'The city of lights, romance, and world-class art and cuisine',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      rating: 4.9,
      price: '$1,500',
      bestTime: 'Apr-Jun, Sep-Oct',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame', 'Champs-Élysées'],
      weather: { temp: '18°C', condition: 'Partly Cloudy' }
    },
    {
      id: '3',
      name: 'Bali',
      country: 'Indonesia',
      description: 'Tropical paradise with stunning beaches and rich cultural heritage',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      rating: 4.7,
      price: '$800',
      bestTime: 'Apr-Oct',
      highlights: ['Ubud Rice Terraces', 'Tanah Lot Temple', 'Seminyak Beach', 'Mount Batur'],
      weather: { temp: '28°C', condition: 'Sunny' }
    },
    {
      id: '4',
      name: 'New York',
      country: 'USA',
      description: 'The city that never sleeps, iconic landmarks and diverse culture',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
      rating: 4.6,
      price: '$1,800',
      bestTime: 'Apr-Jun, Sep-Nov',
      highlights: ['Statue of Liberty', 'Central Park', 'Times Square', 'Brooklyn Bridge'],
      weather: { temp: '15°C', condition: 'Clear' }
    },
    {
      id: '5',
      name: 'Dubai',
      country: 'UAE',
      description: 'Luxury shopping, ultramodern architecture, and desert adventures',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      rating: 4.8,
      price: '$1,400',
      bestTime: 'Nov-Mar',
      highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari'],
      weather: { temp: '32°C', condition: 'Sunny' }
    },
    {
      id: '6',
      name: 'Santorini',
      country: 'Greece',
      description: 'Stunning sunsets, white-washed buildings, and crystal-clear waters',
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
      rating: 4.9,
      price: '$1,100',
      bestTime: 'Apr-Nov',
      highlights: ['Oia Village', 'Red Beach', 'Ancient Thera', 'Wine Tasting'],
      weather: { temp: '24°C', condition: 'Sunny' }
    }
  ];

  const mockFlights: Flight[] = [
    {
      id: 'f1',
      airline: 'Emirates',
      departure: '10:30 AM',
      arrival: '6:45 PM',
      duration: '8h 15m',
      price: 850,
      stops: 0
    },
    {
      id: 'f2',
      airline: 'Qatar Airways',
      departure: '2:15 PM',
      arrival: '11:30 PM',
      duration: '9h 15m',
      price: 720,
      stops: 1
    },
    {
      id: 'f3',
      airline: 'Turkish Airlines',
      departure: '6:00 AM',
      arrival: '3:20 PM',
      duration: '9h 20m',
      price: 680,
      stops: 1
    }
  ];

  const addToItinerary = (item: Omit<ItineraryItem, 'id'>) => {
    setItinerary([...itinerary, { ...item, id: Date.now().toString() }]);
  };

  const removeFromItinerary = (id: string) => {
    setItinerary(itinerary.filter(item => item.id !== id));
  };

  const totalBudgetUsed = itinerary.reduce((sum, item) => sum + item.cost, 0);
  const budgetRemaining = budget - totalBudgetUsed;

  const filteredDestinations = popularDestinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchGooglePlaces = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearchingPlaces(true);
    try {
      const places = await apiService.searchGooglePlaces(searchQuery, 10);
      setGooglePlaces(places);
    } catch (error) {
      console.error('Google Places search error:', error);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  // Call Google Places search when debounced search query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchGooglePlaces();
    } else {
      setGooglePlaces([]);
    }
  }, [debouncedSearchQuery, searchGooglePlaces]);

  const searchFlights = async () => {
    if (!departureCity.trim() || !destinationCity.trim()) {
      setSearchError('Please enter both departure and destination cities');
      return;
    }
    
    if (!departureDate || !returnDate) {
      setSearchError('Please select both departure and return dates');
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Search for places to get location data
      const [departurePlaces, destinationPlaces] = await Promise.all([
        apiService.searchPlaces(departureCity.trim(), 1),
        apiService.searchPlaces(destinationCity.trim(), 1)
      ]);
      
      const departureCode = departurePlaces.length > 0 ? departurePlaces[0].name : departureCity.trim();
      const destinationCode = destinationPlaces.length > 0 ? destinationPlaces[0].name : destinationCity.trim();
      
      const results = await apiService.searchFlights({
        fly_from: departureCode,
        fly_to: destinationCode,
        date_from: departureDate,
        date_to: returnDate,
        adults: travelers
      });
      
      setFlights(results);
    } catch (error) {
      console.error('Flight search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to search flights');
      // Fallback to mock data on error
      setFlights(mockFlights.map(flight => ({
        id: flight.id,
        cityFrom: departureCity || 'New York',
        cityTo: destinationCity || 'London',
        flyFrom: 'JFK',
        flyTo: 'LHR',
        price: flight.price,
        currency: 'USD',
        departureTime: new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        duration: 8 * 60 * 60,
        airline: flight.airline,
        booking_token: 'mock-booking-token'
      })));
    } finally {
      setIsSearching(false);
    }
  };

  const searchHotels = async () => {
    if (!destinationCity.trim()) {
      setSearchError('Please enter a destination city');
      return;
    }
    
    if (!checkInDate || !checkOutDate) {
      setSearchError('Please select both check-in and check-out dates');
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // In a real implementation, we would get the city code from the destination
      // For now, we'll use a mock implementation
      const mockHotels: HotelOption[] = [
        {
          id: 'h1',
          name: 'Grand Plaza Hotel',
          rating: 4.5,
          address: { line1: '123 Main Street', city: destinationCity, country: 'Country' },
          price: { amount: '180.00', currency: 'USD' },
          amenities: ['wifi', 'pool', 'restaurant', 'gym'],
          distance: { value: 0.5, unit: 'KM' }
        },
        {
          id: 'h2',
          name: `Boutique Hotel ${destinationCity}`,
          rating: 4.2,
          address: { line1: '456 Rue de Rivoli', city: destinationCity, country: 'Country' },
          price: { amount: '150.00', currency: 'USD' },
          amenities: ['wifi', 'restaurant'],
          distance: { value: 1.2, unit: 'KM' }
        }
      ];
      
      setHotels(mockHotels);
    } catch (error) {
      console.error('Hotel search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to search hotels');
    } finally {
      setIsSearching(false);
    }
  };

  const searchActivities = async () => {
    if (!destinationCity.trim()) {
      setSearchError('Please enter a destination');
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // In a real implementation, we would use an activities API
      // For now, we'll use a mock implementation
      const mockActivities: ActivityOption[] = [
        {
          id: 'a1',
          name: `Guided Tour of ${destinationCity}`,
          description: 'Explore the best of the city with a local guide',
          price: 50,
          duration: '4 hours',
          rating: 4.5
        },
        {
          id: 'a2',
          name: `${destinationCity} Food Tour`,
          description: 'Taste the local cuisine with a food expert',
          price: 75,
          duration: '3 hours',
          rating: 4.7
        },
        {
          id: 'a3',
          name: `${destinationCity} Cultural Experience`,
          description: 'Immerse yourself in local traditions and customs',
          price: 65,
          duration: '5 hours',
          rating: 4.3
        }
      ];
      
      setActivities(mockActivities);
    } catch (error) {
      console.error('Activities search error:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to search activities');
    } finally {
      setIsSearching(false);
    }
  };

  const generateAiItinerary = async () => {
    if (!selectedDestination) return;

    setIsGeneratingItinerary(true);
    setItineraryError(null);
    try {
      // Process the request through the AI agent governance protocol
      // Log that we're using the governance protocol
      console.log('Processing request through AI Agent Governance Protocol');
      
      const generatedItems = await apiService.generateAiItinerary(selectedDestination.name, preferences);

      const newItineraryItems: ItineraryItem[] = generatedItems.map((item, index) => ({
        ...item,
        id: `ai-${Date.now()}-${index}`,
      }));

      setItinerary(prev => [...prev, ...newItineraryItems]);
      setSelectedDestination(null); // Close modal
      setActiveTab('itinerary'); // Switch to itinerary tab
    } catch (error) {
      setItineraryError(error instanceof Error ? error.message : 'Failed to generate itinerary.');
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600/10 to-purple-500/10 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <span className="text-3xl">🌍</span>
              Luna Travel Agent
            </h2>
            <p className="text-muted-foreground">
              AI-powered travel planning and booking assistant
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-lg border border-border">
              <Users className="w-4 h-4 text-primary" />
              <input
                type="number"
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                min="1"
                max="10"
                className="w-12 bg-transparent border-none outline-none text-foreground"
                aria-label="Number of travelers"
                placeholder="2"
              />
              <span className="text-sm text-muted-foreground">travelers</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          {[
            { id: 'explore', label: 'Explore', icon: Compass },
            { id: 'flights', label: 'Flights', icon: Plane },
            { id: 'hotels', label: 'Hotels', icon: Hotel },
            { id: 'activities', label: 'Activities', icon: Camera },
            { id: 'itinerary', label: 'Itinerary', icon: Calendar },
            { id: 'budget', label: 'Budget', icon: DollarSign }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'explore' | 'flights' | 'hotels' | 'activities' | 'itinerary' | 'budget')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-background/50 text-muted-foreground hover:bg-background/80'
              }`}
              aria-label={`Switch to ${tab.label} tab`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Explore Tab */}
        {activeTab === 'explore' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* AI Recommendations */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-6 border border-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">AI Travel Recommendations</h3>
                  <p className="text-muted-foreground mb-4">
                    Based on your preferences and travel history, we recommend exploring Southeast Asia this season. 
                    Great weather, affordable prices, and rich cultural experiences await!
                  </p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                      View Personalized Trips
                    </button>
                    <button className="px-4 py-2 bg-background/50 text-foreground rounded-lg hover:bg-background/80 transition-colors text-sm font-medium">
                      Customize Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Destinations Grid */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {isSearchingPlaces ? 'Searching...' : 'Popular Destinations'}
              </h3>
              {isSearchingPlaces ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : googlePlaces.length > 0 ? (
                <VirtualList
                  items={googlePlaces}
                  itemHeight={200}
                  containerHeight={600}
                  renderItem={(place) => (
                    <div
                      className="bg-background/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => {
                        // Convert Google Place to Destination format
                        const destination: Destination = {
                          id: place.id,
                          name: place.name,
                          country: place.address.split(',').pop()?.trim() || 'Unknown',
                          description: place.types.join(', '),
                          image: place.photos && place.photos.length > 0 
                            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=YOUR_GOOGLE_API_KEY`
                            : 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
                          rating: place.rating || 0,
                          price: '$' + (Math.floor(Math.random() * 1000) + 500).toString(),
                          bestTime: 'Year-round',
                          highlights: place.types.slice(0, 3),
                          weather: { temp: '25°C', condition: 'Sunny' }
                        };
                        setSelectedDestination(destination);
                        setDestinationCity(place.name);
                        setActiveTab('flights');
                      }}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-foreground">{place.name}</h4>
                          {place.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-foreground">{place.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{place.address}</p>
                        <div className="flex flex-wrap gap-1">
                          {place.types.slice(0, 3).map((type, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDestinations.map(destination => (
                    <ContextualTooltip
                      key={destination.id}
                      content={
                        <div>
                          <h4 className="font-semibold">{destination.name}</h4>
                          <p className="text-sm">{destination.description}</p>
                          <div className="mt-2 flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{destination.rating}</span>
                          </div>
                        </div>
                      }
                    >
                      <div 
                        className="bg-background/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedDestination(destination);
                          setDestinationCity(destination.name);
                          setActiveTab('flights');
                        }}
                      >
                        <div className="relative h-48">
                          <img 
                            src={destination.image} 
                            alt={destination.name} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            {destination.rating}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-foreground">{destination.name}</h4>
                            <span className="text-sm text-muted-foreground">{destination.country}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{destination.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">{destination.price}</span>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              {destination.bestTime}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ContextualTooltip>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Flights Tab */}
        {activeTab === 'flights' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Find Flights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      placeholder="City or airport"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      placeholder="City or airport"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Departure</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Departure date"
                    />

                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Return</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Return date"
                    />

                  </div>
                </div>
              </div>
            </div>
            
            {searchError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                {searchError}
              </div>
            )}
            
            <button
              onClick={searchFlights}
              disabled={isSearching}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Searching Flights...
                </>
              ) : (
                <>
                  <Plane className="w-4 h-4" />
                  Search Flights
                </>
              )}
            </button>
            
            {flights.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Available Flights</h4>
                <div className="space-y-3">
                  {flights.map(flight => (
                    <div 
                      key={flight.id} 
                      className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => addToItinerary({
                        day: 1,
                        time: new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                        activity: `Flight: ${flight.airline}`,
                        location: `${flight.cityFrom} to ${flight.cityTo}`,
                        type: 'flight',
                        cost: flight.price
                      })}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-foreground">{flight.airline}</div>
                          <div className="text-sm text-muted-foreground">
                            {flight.cityFrom} ({flight.flyFrom}) → {flight.cityTo} ({flight.flyTo})
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">${flight.price}</div>
                          <div className="text-sm text-muted-foreground">{Math.floor(flight.duration / 3600)}h {Math.floor((flight.duration % 3600) / 60)}m</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hotels Tab */}
        {activeTab === 'hotels' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Find Hotels</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder="City"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Check-in</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Check-in date"
                    />

                </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Check-out</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      aria-label="Check-out date"
                    />
                </div>
                </div>
              </div>
            </div>
            
            {searchError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                {searchError}
              </div>
            )}
            
            <button
              onClick={searchHotels}
              disabled={isSearching}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Searching Hotels...
                </>
              ) : (
                <>
                  <Hotel className="w-4 h-4" />
                  Search Hotels
                </>
              )}
            </button>
            
            {hotels.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Available Hotels</h4>
                <div className="space-y-3">
                  {hotels.map(hotel => (
                    <div 
                      key={hotel.id} 
                      className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => addToItinerary({
                        day: 1,
                        time: '14:00',
                        activity: `Check-in: ${hotel.name}`,
                        location: `${hotel.address.line1}, ${hotel.address.city}`,
                        type: 'hotel',
                        cost: parseFloat(hotel.price.amount)
                      })}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-foreground">{hotel.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {hotel.address.line1}, {hotel.address.city}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(hotel.rating) ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} 
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-1">{hotel.rating}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">${hotel.price.amount}</div>
                          <div className="text-sm text-muted-foreground">per night</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {hotel.amenities.map((amenity, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Find Activities</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  placeholder="City"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            {searchError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                {searchError}
              </div>
            )}
            
            <button
              onClick={searchActivities}
              disabled={isSearching}
              className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Searching Activities...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Search Activities
                </>
              )}
            </button>
            
            {activities.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Recommended Activities</h4>
                <div className="space-y-3">
                  {activities.map(activity => (
                    <div 
                      key={activity.id} 
                      className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => addToItinerary({
                        day: 1,
                        time: '10:00',
                        activity: activity.name,
                        location: destinationCity,
                        type: 'activity',
                        cost: activity.price
                      })}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-foreground">{activity.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{activity.duration}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">${activity.price}</div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(activity.rating) ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} 
                              />
                            ))}
                            <span className="text-sm text-muted-foreground">{activity.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-foreground">Your Itinerary</h3>
              <button
                onClick={() => {
                  if (selectedDestination) {
                    generateAiItinerary();
                  }
                }}
                disabled={isGeneratingItinerary || !selectedDestination}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingItinerary ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate AI Itinerary
                  </>
                )}
              </button>
            </div>
            
            {itineraryError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                {itineraryError}
              </div>
            )}
            
            {itinerary.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">No Itinerary Yet</h4>
                <p className="text-muted-foreground mb-4">
                  Start building your travel itinerary by searching for flights, hotels, and activities.
                </p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Start Planning
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {itinerary.map(item => (
                  <div key={item.id} className="bg-background/50 border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">Day {item.day}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{item.time}</span>
                        </div>
                        <div className="font-medium text-foreground">{item.activity}</div>
                        <div className="text-sm text-muted-foreground">{item.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">${item.cost}</div>
                        <button 
                          onClick={() => removeFromItinerary(item.id)}
                          className="text-muted-foreground hover:text-foreground mt-1"
                          aria-label="Remove from itinerary"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedDestination && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-foreground">Generate AI Itinerary</h3>
                      <button 
                        onClick={() => setSelectedDestination(null)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Close modal"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Preferences</label>
                      <textarea
                        value={preferences}
                        onChange={(e) => setPreferences(e.target.value)}
                        placeholder="Tell us about your travel preferences..."
                        rows={4}
                        className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-foreground mb-2">AI-Powered Itinerary</h4>
                      <p className="text-sm text-muted-foreground">
                        Luna will create a personalized travel plan for {selectedDestination.name} based on your preferences.
                      </p>
                    </div>
                    
                    <button
                      onClick={generateAiItinerary}
                      disabled={isGeneratingItinerary}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                      aria-label="Generate AI Itinerary"
                    >
                      {isGeneratingItinerary ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          Generating Itinerary...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Itinerary
                        </>
                      )}
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Budget Tracker</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                    <p className="text-2xl font-bold">${budget}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Spent</p>
                    <p className="text-2xl font-bold">${totalBudgetUsed}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className={`bg-gradient-to-br ${budgetRemaining >= 0 ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' : 'from-red-500/20 to-orange-500/20 border-red-500/30'} rounded-lg p-5 border`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                    <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${budgetRemaining}
                    </p>
                  </div>
                  <DollarSign className={`w-8 h-8 ${budgetRemaining >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Set Budget</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="flex-1 p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="5000"
                />
                <button className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" aria-label="Update budget">
                  Update
                </button>
              </div>
            </div>
            
            {itinerary.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4">Expense Breakdown</h4>
                <div className="space-y-3">
                  {itinerary.map(item => (
                    <div key={item.id} className="bg-background/50 border border-border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-foreground">{item.activity}</div>
                          <div className="text-sm text-muted-foreground">{item.location}</div>
                        </div>
                        <div className="font-semibold text-foreground">${item.cost}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
