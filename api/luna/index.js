import http from 'http';
import https from 'https';
import { KiwiAPI, OpenStreetMapAPI, GooglePlacesAPI } from '../../core/apis/travelApisIntegration.js';
import { AmadeusAPI } from '../../core/apis/amadeusAPI.js';
import { ViatorAPI } from '../../core/apis/viatorAPI.js';
import { AgentLogger } from '../../core/utils/agentLogger.js';

// Mock data for AI-generated itineraries
const mockItineraries = {
  Tokyo: [
    {
      day: 1,
      time: "09:00",
      activity: "Arrival at Narita Airport",
      location: "Narita Airport",
      type: "flight",
      cost: 0
    },
    {
      day: 1,
      time: "12:00",
      activity: "Check-in at Hotel",
      location: "Shinjuku",
      type: "hotel",
      cost: 150
    },
    {
      day: 1,
      time: "14:00",
      activity: "Explore Shibuya Crossing",
      location: "Shibuya",
      type: "activity",
      cost: 0
    },
    {
      day: 1,
      time: "19:00",
      activity: "Dinner at Robot Restaurant",
      location: "Shibuya",
      type: "dining",
      cost: 45
    }
  ],
  Paris: [
    {
      day: 1,
      time: "10:00",
      activity: "Arrival at Charles de Gaulle Airport",
      location: "CDG Airport",
      type: "flight",
      cost: 0
    },
    {
      day: 1,
      time: "13:00",
      activity: "Check-in at Hotel",
      location: "Montmartre",
      type: "hotel",
      cost: 180
    },
    {
      day: 1,
      time: "15:00",
      activity: "Visit the Louvre Museum",
      location: "Louvre Museum",
      type: "activity",
      cost: 20
    },
    {
      day: 1,
      time: "20:00",
      activity: "Dinner at Le Jules Verne",
      location: "Eiffel Tower",
      type: "dining",
      cost: 120
    }
  ]
};

// Flight search endpoint
export const searchFlights = async (req, res) => {
  try {
    const params = await new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    // Use Kiwi API for flight search
    const flights = await KiwiAPI.searchFlights(params);
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.end(JSON.stringify(flights));
  } catch (error) {
    console.error('Flight search error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
};

// Places search endpoint
export const searchPlaces = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const query = url.searchParams.get('query');
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    
    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Query parameter is required' }));
      return;
    }
    
    // Use OpenStreetMap API for place search
    const places = await OpenStreetMapAPI.searchPlaces(query, limit);
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.end(JSON.stringify(places));
  } catch (error) {
    console.error('Places search error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
};

// Google Places search endpoint
export const searchGooglePlaces = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const query = url.searchParams.get('query');
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    
    if (!query) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Query parameter is required' }));
      return;
    }
    
    // Use Google Places API for place search
    const places = await GooglePlacesAPI.searchPlaces(query, limit);
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.end(JSON.stringify(places));
  } catch (error) {
    console.error('Google Places search error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
};

// AI Itinerary generation endpoint
export const generateItinerary = async (req, res) => {
  try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk.toString());
      req.on('end', () => resolve(data));
    });
    
    const { destination, preferences } = JSON.parse(body);
    
    // For now, return mock itinerary based on destination
    // In a real implementation, this would use an AI service
    const itinerary = mockItineraries[destination] || [
      {
        day: 1,
        time: "09:00",
        activity: `Explore ${destination}`,
        location: destination,
        type: "activity",
        cost: 0
      }
    ];
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.end(JSON.stringify(itinerary));
  } catch (error) {
    console.error('Itinerary generation error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
};

// Hotel search endpoint
export const searchHotels = async (req, res) => {
  try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk.toString());
      req.on('end', () => resolve(data));
    });
    
    const params = JSON.parse(body);
    
    // Use Amadeus API for hotel search
    const hotels = await AmadeusAPI.searchHotels(
      params.city,
      params.checkIn,
      params.checkOut,
      params.guests
    );
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.end(JSON.stringify(hotels));
  } catch (error) {
    console.error('Hotel search error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
};

// Activities search endpoint
export const searchActivities = async (req, res) => {
  try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk.toString());
      req.on('end', () => resolve(data));
    });
    
    const params = JSON.parse(body);
    
    // Use Viator API for activities search
    const viatorActivities = await ViatorAPI.searchActivities(params.location, 10);
    
    // Transform Viator response to match expected format
    const activities = viatorActivities.map(activity => ({
      id: activity.id,
      name: activity.title,
      description: activity.description,
      price: activity.price,
      duration: activity.duration,
      rating: activity.rating
    }));
    
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    
    res.end(JSON.stringify(activities));
  } catch (error) {
    console.error('Activities search error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
};