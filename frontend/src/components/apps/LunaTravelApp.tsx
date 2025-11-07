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
  TrendingUp,
  Sparkles,
  Camera,
  Utensils,
  Heart,
  Share2,
  Download,
  Plus,
  X
} from 'lucide-react';

import { useDebounce } from '../../hooks/useDebounce';
import { VirtualList } from '../../components/ui/VirtualList';
import { ContextualTooltip } from '../../components/ui/ContextualTooltip';
import { ProgressTracker } from '../../components/ui/ProgressTracker';

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

import { apiService } from '../../services/api';
import type { FlightSearchResult, GooglePlaceSearchResult } from '../../services/api';

export function LunaTravelApp() {
  const [activeTab, setActiveTab] = useState<'explore' | 'flights' | 'itinerary' | 'budget'>('explore');
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
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [googlePlaces, setGooglePlaces] = useState<GooglePlaceSearchResult[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  const [itineraryError, setItineraryError] = useState<string | null>(null);

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
  }, [debouncedSearchQuery]);

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

  const generateAiItinerary = async () => {
    if (!selectedDestination) return;

    setIsGeneratingItinerary(true);
    setItineraryError(null);
    try {
      // Using a generic preference for now. This can be expanded later.
      const preferences = "a mix of cultural sights, local food, and some relaxation.";
      const generatedItems = await apiService.generateAiItinerary(selectedDestination.name, preferences);

      const newItineraryItems: ItineraryItem[] = generatedItems.map((item, index) => ({
        ...item,
        id: `ai-${Date.now()}-${index}`,
        cost: Math.floor(Math.random() * 100) + 20, // Assign random cost for now
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
            { id: 'itinerary', label: 'Itinerary', icon: Calendar },
            { id: 'budget', label: 'Budget', icon: DollarSign }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'explore' | 'flights' | 'itinerary' | 'budget')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-background/50 text-muted-foreground hover:bg-background/80'
              }`}
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
                          <p className="text-sm mt-1">{destination.description}</p>
                        </div>
                      }
                      aiSuggestion={`Based on your travel history, ${destination.name} is a great choice for cultural experiences.`}
                    >
                      <div
                        className="bg-background/50 border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedDestination(destination);
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
                          <p className="text-sm text-muted-foreground mb-3">{destination.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">{destination.price}</span>
                            <span className="text-xs text-muted-foreground">{destination.bestTime}</span>
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
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Flight Search Form */}
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Search Flights</h3>
              
              {/* Progress Tracker for Booking Workflow */}
              <div className="mb-6">
                <ProgressTracker
                  steps={[
                    { id: 'search', title: 'Search', status: 'completed' },
                    { id: 'select', title: 'Select Flight', status: activeTab === 'flights' && flights.length > 0 ? 'in-progress' : 'pending' },
                    { id: 'itinerary', title: 'Build Itinerary', status: itinerary.length > 0 ? 'in-progress' : 'pending' },
                    { id: 'confirm', title: 'Confirm Booking', status: 'pending' }
                  ]}
                  currentStep={1}
                  orientation="horizontal"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={departureCity}
                      onChange={(e) => setDepartureCity(e.target.value)}
                      placeholder="Departure city"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      placeholder="Destination city"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Departure</label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Select departure date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Return</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Select return date"
                  />
                </div>
              </div>
              <button 
                onClick={searchFlights}
                disabled={isSearching}
                className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search Flights
                  </>
                )}
              </button>
              {searchError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                  {searchError}
                </div>
              )}
            </div>

            {/* Flight Results */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Available Flights</h3>
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Searching for flights...</p>
                  </div>
                </div>
              ) : flights.length > 5 ? (
                <VirtualList
                  items={flights}
                  itemHeight={200}
                  containerHeight={600}
                  renderItem={(flight) => (
                    <div className="bg-background/50 border border-border rounded-lg p-6 hover:border-primary/50 transition-colors mb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Plane className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{flight.airline}</h4>
                            <p className="text-sm text-muted-foreground">
                              {flight.flyFrom} → {flight.flyTo}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">${flight.price}</div>
                          <div className="text-sm text-muted-foreground">per person</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">
                            {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-sm text-muted-foreground">{flight.cityFrom}</div>
                        </div>
                        <div className="flex-1 mx-8">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-border" />
                            <div className="px-3 py-1 bg-primary/10 rounded-full">
                              <Clock className="w-4 h-4 text-primary inline mr-1" />
                              <span className="text-sm font-medium text-primary">
                                {Math.floor(flight.duration / 3600)}h {Math.floor((flight.duration % 3600) / 60)}m
                              </span>
                            </div>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">
                            {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-sm text-muted-foreground">{flight.cityTo}</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => addToItinerary({
                            day: 1,
                            time: new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            activity: `Flight to ${flight.cityTo}`,
                            location: flight.airline,
                            type: 'flight',
                            cost: flight.price * travelers
                          })}
                          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                          Add to Itinerary
                        </button>
                        <button className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-background/80 transition-colors font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div className="space-y-4">
                  {flights.map(flight => (
                    <div key={flight.id} className="bg-background/50 border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Plane className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{flight.airline}</h4>
                            <p className="text-sm text-muted-foreground">
                              {flight.flyFrom} → {flight.flyTo}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">${flight.price}</div>
                          <div className="text-sm text-muted-foreground">per person</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">
                            {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-sm text-muted-foreground">{flight.cityFrom}</div>
                        </div>
                        <div className="flex-1 mx-8">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-border" />
                            <div className="px-3 py-1 bg-primary/10 rounded-full">
                              <Clock className="w-4 h-4 text-primary inline mr-1" />
                              <span className="text-sm font-medium text-primary">
                                {Math.floor(flight.duration / 3600)}h {Math.floor((flight.duration % 3600) / 60)}m
                              </span>
                            </div>
                            <div className="flex-1 h-px bg-border" />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">
                            {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-sm text-muted-foreground">{flight.cityTo}</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => addToItinerary({
                            day: 1,
                            time: new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            activity: `Flight to ${flight.cityTo}`,
                            location: flight.airline,
                            type: 'flight',
                            cost: flight.price * travelers
                          })}
                          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                          Add to Itinerary
                        </button>
                        <button className="px-4 py-2 bg-background border border-border rounded-lg hover:bg-background/80 transition-colors font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Your Travel Itinerary</h3>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Activity
              </button>
            </div>

            {itinerary.length === 0 ? (
              <div className="bg-background/50 border border-border rounded-lg p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">No items in your itinerary yet</h4>
                <p className="text-muted-foreground mb-4">Start adding flights, hotels, and activities to build your perfect trip</p>
                <button
                  onClick={() => setActiveTab('flights')}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Browse Flights
                </button>
              </div>
            ) : itinerary.length > 5 ? (
              <VirtualList
                items={itinerary}
                itemHeight={120}
                containerHeight={500}
                renderItem={(item) => (
                  <div className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          item.type === 'flight' ? 'bg-blue-500/10' :
                          item.type === 'hotel' ? 'bg-purple-500/10' :
                          item.type === 'activity' ? 'bg-green-500/10' :
                          'bg-orange-500/10'
                        }`}>
                          {item.type === 'flight' && <Plane className="w-6 h-6 text-blue-500" />}
                          {item.type === 'hotel' && <Hotel className="w-6 h-6 text-purple-500" />}
                          {item.type === 'activity' && <Camera className="w-6 h-6 text-green-500" />}
                          {item.type === 'dining' && <Utensils className="w-6 h-6 text-orange-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                              Day {item.day}
                            </span>
                            <span className="text-sm text-muted-foreground">{item.time}</span>
                          </div>
                          <h4 className="font-semibold text-foreground mb-1">{item.activity}</h4>
                          <p className="text-sm text-muted-foreground">{item.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground mb-2">${item.cost}</div>
                        <button 
                          onClick={() => removeFromItinerary(item.id)}
                          className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              />
            ) : (
              <div className="space-y-4">
                {itinerary.map(item => (
                  <div key={item.id} className="bg-background/50 border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          item.type === 'flight' ? 'bg-blue-500/10' :
                          item.type === 'hotel' ? 'bg-purple-500/10' :
                          item.type === 'activity' ? 'bg-green-500/10' :
                          'bg-orange-500/10'
                        }`}>
                          {item.type === 'flight' && <Plane className="w-6 h-6 text-blue-500" />}
                          {item.type === 'hotel' && <Hotel className="w-6 h-6 text-purple-500" />}
                          {item.type === 'activity' && <Camera className="w-6 h-6 text-green-500" />}
                          {item.type === 'dining' && <Utensils className="w-6 h-6 text-orange-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                              Day {item.day}
                            </span>
                            <span className="text-sm text-muted-foreground">{item.time}</span>
                          </div>
                          <h4 className="font-semibold text-foreground mb-1">{item.activity}</h4>
                          <p className="text-sm text-muted-foreground">{item.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground mb-2">${item.cost}</div>
                        <button 
                          onClick={() => removeFromItinerary(item.id)}
                          className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {itinerary.length > 0 && (
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-600 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Itinerary
                </button>
                <button className="flex-1 px-4 py-3 bg-background border border-border rounded-lg font-semibold hover:bg-background/80 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Trip
                </button>
              </div>
            )}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Budget Overview</h3>
              
              {/* Progress Tracker for Budget Planning */}
              <div className="mb-6">
                <ProgressTracker
                  steps={[
                    { id: 'set', title: 'Set Budget', status: budget > 0 ? 'completed' : 'in-progress' },
                    { id: 'plan', title: 'Plan Expenses', status: itinerary.length > 0 ? 'completed' : 'in-progress' },
                    { id: 'track', title: 'Track Spending', status: totalBudgetUsed > 0 ? 'completed' : 'pending' },
                    { id: 'optimize', title: 'Optimize', status: budgetRemaining < 0 ? 'error' : 'pending' }
                  ]}
                  currentStep={budget > 0 ? 1 : 0}
                  orientation="horizontal"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Total Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-semibold"
                    aria-label="Total budget amount"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Total Budget</div>
                  <div className="text-2xl font-bold text-foreground">${budget.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg p-4 border border-red-500/20">
                  <div className="text-sm text-muted-foreground mb-1">Spent</div>
                  <div className="text-2xl font-bold text-foreground">${totalBudgetUsed.toLocaleString()}</div>
                </div>
                <div className={`bg-gradient-to-br rounded-lg p-4 border ${
                  budgetRemaining >= 0 
                    ? 'from-green-500/10 to-emerald-500/10 border-green-500/20' 
                    : 'from-red-500/10 to-orange-500/10 border-red-500/20'
                }`}>
                  <div className="text-sm text-muted-foreground mb-1">Remaining</div>
                  <div className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${Math.abs(budgetRemaining).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Budget Usage</span>
                  <span className="font-medium">{Math.min(Math.round((totalBudgetUsed / budget) * 100), 100)}%</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      totalBudgetUsed > budget 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    style={{ width: `${Math.min((totalBudgetUsed / budget) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {budgetRemaining < 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-500 mb-1">Over Budget</h4>
                    <p className="text-sm text-muted-foreground">
                      You're ${Math.abs(budgetRemaining).toLocaleString()} over your budget. Consider adjusting your itinerary or increasing your budget.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Budget Breakdown */}
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Expense Breakdown</h3>
              
              {itinerary.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No expenses yet. Add items to your itinerary to track spending.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {['flight', 'hotel', 'activity', 'dining'].map(type => {
                    const items = itinerary.filter(item => item.type === type);
                    const total = items.reduce((sum, item) => sum + item.cost, 0);
                    if (items.length === 0) return null;

                    return (
                      <div key={type} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            type === 'flight' ? 'bg-blue-500/10' :
                            type === 'hotel' ? 'bg-purple-500/10' :
                            type === 'activity' ? 'bg-green-500/10' :
                            'bg-orange-500/10'
                          }`}>
                            {type === 'flight' && <Plane className="w-5 h-5 text-blue-500" />}
                            {type === 'hotel' && <Hotel className="w-5 h-5 text-purple-500" />}
                            {type === 'activity' && <Camera className="w-5 h-5 text-green-500" />}
                            {type === 'dining' && <Utensils className="w-5 h-5 text-orange-500" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground capitalize">{type}s</h4>
                            <p className="text-sm text-muted-foreground">{items.length} item{items.length > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">${total.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round((total / totalBudgetUsed) * 100)}% of total
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Destination Detail Modal */}
      {selectedDestination && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="relative h-64">
              <img
                src={selectedDestination.image}
                alt={selectedDestination.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDestination(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                aria-label="Close destination details"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedDestination.name}</h2>
                <p className="text-white/90">{selectedDestination.country}</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{selectedDestination.rating}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Best time: {selectedDestination.bestTime}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">{selectedDestination.price}</div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-muted-foreground">{selectedDestination.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Top Highlights</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedDestination.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {itineraryError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 my-4 text-sm text-red-500">
                  {itineraryError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveTab('flights');
                    setSelectedDestination(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-600 transition-colors"
                >
                  Book Trip
                </button>
                <button
                  onClick={generateAiItinerary}
                  disabled={isGeneratingItinerary}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingItinerary ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  Generate AI Itinerary
                </button>
                <button 
                  className="px-4 py-3 bg-background border border-border rounded-lg hover:bg-background/80 transition-colors"
                  aria-label="Add to favorites"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button 
                  className="px-4 py-3 bg-background border border-border rounded-lg hover:bg-background/80 transition-colors"
                  aria-label="Share trip"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
