/**
 * Travel APIs Integration
 * Kiwi.com (Tequila API), OpenStreetMap
 * Zero-cost travel data sources for Luna Travel
 * 
 * @module travelApisIntegration
 * @version 1.0.0
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger, LogLevel } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Kiwi.com Tequila API - Flight search
 * Rate limit: 2000 requests/month (free tier)
 * Get API key: https://tequila.kiwi.com/portal/login
 */
export class KiwiAPI {
  private static readonly BASE_URL = 'https://api.tequila.kiwi.com';
  private static apiKey = process.env.KIWI_API_KEY || '';

  /**
   * Search for flights
   */
  static async searchFlights(params: {
    fly_from: string;
    fly_to: string;
    date_from: string;
    date_to: string;
    adults?: number;
    children?: number;
    infants?: number;
    max_stopovers?: number;
    price_from?: number;
    price_to?: number;
    limit?: number;
  }): Promise<Array<{
    id: string;
    cityFrom: string;
    cityTo: string;
    flyFrom: string;
    flyTo: string;
    price: number;
    currency: string;
    departureTime: string;
    arrivalTime: string;
    duration: number;
    airline: string;
    booking_token: string;
  }>> {
    return AgentLogger.measurePerformance(
      'KiwiAPI',
      'searchFlights',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockFlights(params);
        }

        try {
          const response = await axios.get(`${this.BASE_URL}/v2/search`, {
            params: {
              ...params,
              limit: params.limit || 10,
              sort: 'price',
              asc: 1,
              partner: 'picky' // Required parameter
            },
            headers: {
              'apikey': this.apiKey,
              'Content-Type': 'application/json',
              'Accept-Encoding': 'gzip'
            }
          });

          if (!response.data || !response.data.data) {
            throw new Error('Invalid response from Kiwi API');
          }

          return response.data.data.slice(0, params.limit || 10).map((flight: any) => ({
            id: flight.id,
            cityFrom: flight.cityFrom,
            cityTo: flight.cityTo,
            flyFrom: flight.flyFrom,
            flyTo: flight.flyTo,
            price: flight.price,
            currency: flight.currency,
            departureTime: flight.dTimeUTC ? new Date(flight.dTimeUTC * 1000).toISOString() : '',
            arrivalTime: flight.aTimeUTC ? new Date(flight.aTimeUTC * 1000).toISOString() : '',
            duration: flight.duration?.total || 0,
            airline: flight.airlines?.[0] || 'Unknown',
            booking_token: flight.booking_token || ''
          }));
        } catch (error: any) {
          console.error('Kiwi API error:', error.response?.data || error.message);
          throw new Error(`Kiwi API error: ${error.message}`);
        }
      },
      { params }
    );
  }

  private static getMockFlights(params: any) {
    return [
      {
        id: 'mock-flight-1',
        cityFrom: params.fly_from,
        cityTo: params.fly_to,
        flyFrom: `${params.fly_from}-airport`,
        flyTo: `${params.fly_to}-airport`,
        price: 450,
        currency: 'USD',
        departureTime: new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        duration: 8 * 60 * 60,
        airline: 'Mock Airlines',
        booking_token: 'mock-booking-token'
      },
      {
        id: 'mock-flight-2',
        cityFrom: params.fly_from,
        cityTo: params.fly_to,
        flyFrom: `${params.fly_from}-airport`,
        flyTo: `${params.fly_to}-airport`,
        price: 520,
        currency: 'USD',
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        arrivalTime: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(),
        duration: 8 * 60 * 60,
        airline: 'Another Mock Airlines',
        booking_token: 'mock-booking-token-2'
      }
    ];
  }

  /**
   * Get location ID by name (for fly_from/fly_to parameters)
   */
  static async getLocationId(location: string): Promise<string> {
    return AgentLogger.measurePerformance(
      'KiwiAPI',
      'getLocationId',
      async () => {
        if (!this.apiKey) {
          // Return mock location ID
          return `mock-${location.toLowerCase()}`;
        }

        try {
          const response = await axios.get(`${this.BASE_URL}/locations/query`, {
            params: {
              term: location,
              locale: 'en-US',
              location_types: 'airport,city',
              limit: 1,
              active_only: true,
              sort: 'name'
            },
            headers: {
              'apikey': this.apiKey,
              'Content-Type': 'application/json'
            }
          });

          if (!response.data || !response.data.locations || response.data.locations.length === 0) {
            throw new Error(`Location not found: ${location}`);
          }

          return response.data.locations[0].id;
        } catch (error: any) {
          console.error('Kiwi Location API error:', error.response?.data || error.message);
          throw new Error(`Kiwi Location API error: ${error.message}`);
        }
      },
      { location }
    );
  }
}

/**
 * OpenStreetMap Nominatim API - Geocoding and location search
 * Rate limit: 1 request/second (free to use)
 */
export class OpenStreetMapAPI {
  private static readonly BASE_URL = 'https://nominatim.openstreetmap.org';

  /**
   * Search for places by name
   */
  static async searchPlaces(query: string, limit: number = 10): Promise<Array<{
    place_id: string;
    name: string;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
  }>> {
    return AgentLogger.measurePerformance(
      'OpenStreetMapAPI',
      'searchPlaces',
      async () => {
        try {
          const params = new URLSearchParams({
            q: query,
            format: 'json',
            limit: limit.toString(),
            addressdetails: '1'
          });

          const response = await axios.get(`${this.BASE_URL}/search?${params}`, {
            headers: {
              'User-Agent': 'ZentixOS/1.0 (https://zentixos.com)'
            }
          });

          if (!response.data || !Array.isArray(response.data)) {
            return [];
          }

          return response.data.slice(0, limit).map((place: any) => ({
            place_id: place.place_id,
            name: place.name || place.display_name.split(',')[0],
            display_name: place.display_name,
            lat: place.lat,
            lon: place.lon,
            type: place.type
          }));
        } catch (error: any) {
          console.error('OpenStreetMap API error:', error.response?.data || error.message);
          throw new Error(`OpenStreetMap API error: ${error.message}`);
        }
      },
      { query, limit }
    );
  }

  /**
   * Get reverse geocoding (coordinates to place name)
   */
  static async reverseGeocode(lat: string, lon: string): Promise<{
    place_id: string;
    name: string;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
  }> {
    return AgentLogger.measurePerformance(
      'OpenStreetMapAPI',
      'reverseGeocode',
      async () => {
        try {
          const response = await axios.get(`${this.BASE_URL}/reverse`, {
            params: {
              lat: lat,
              lon: lon,
              format: 'json'
            },
            headers: {
              'User-Agent': 'ZentixOS/1.0 (https://zentixos.com)'
            }
          });

          if (!response.data) {
            throw new Error('Invalid response from OpenStreetMap API');
          }

          const place = response.data;
          return {
            place_id: place.place_id,
            name: place.display_name.split(',')[0],
            display_name: place.display_name,
            lat: place.lat,
            lon: place.lon,
            type: place.type
          };
        } catch (error: any) {
          console.error('OpenStreetMap Reverse API error:', error.response?.data || error.message);
          // Return mock data on error
          return {
            place_id: 'mock-place',
            name: 'Unknown Location',
            display_name: 'Unknown Location',
            lat: lat,
            lon: lon,
            type: 'unknown'
          };
        }
      },
      { lat, lon }
    );
  }
}

/**
 * Google Places API - Place search and details
 * Requires GOOGLE_PLACES_API_KEY environment variable
 * Rate limit: 1,000 requests/day (free tier)
 */
export class GooglePlacesAPI {
  private static readonly BASE_URL = 'https://maps.googleapis.com/maps/api/place';
  private static readonly apiKey = process.env.GOOGLE_PLACES_API_KEY;

  /**
   * Search for places by text query
   */
  static async searchPlaces(query: string, limit: number = 10): Promise<Array<{
    id: string;
    name: string;
    address: string;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    types: string[];
    location: {
      lat: number;
      lng: number;
    };
    photos?: Array<{
      photo_reference: string;
      width: number;
      height: number;
    }>;
    business_status?: string;
  }>> {
    return AgentLogger.measurePerformance(
      'GooglePlacesAPI',
      'searchPlaces',
      async () => {
        // If no API key, return mock data
        if (!this.apiKey) {
          console.warn('Google Places API key not configured, returning mock data');
          return Array.from({ length: limit }, (_, i) => ({
            id: `mock-place-${i}`,
            name: `${query} Location ${i + 1}`,
            address: `${i + 1} ${query} Street, City, Country`,
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            user_ratings_total: Math.floor(Math.random() * 500),
            price_level: Math.floor(Math.random() * 4),
            types: ['tourist_attraction', 'point_of_interest'],
            location: {
              lat: 40.7128 + (Math.random() - 0.5) * 0.1,
              lng: -74.0060 + (Math.random() - 0.5) * 0.1
            },
            photos: [{
              photo_reference: 'mock-photo-ref',
              width: 400,
              height: 300
            }],
            business_status: 'OPERATIONAL'
          }));
        }

        try {
          const params = new URLSearchParams({
            key: this.apiKey,
            input: query,
            inputtype: 'textquery',
            fields: 'place_id,name,formatted_address,rating,user_ratings_total,price_level,types,geometry,photos,business_status'
          });

          const response = await axios.get(`${this.BASE_URL}/textsearch/json?${params}`);
          
          if (!response.data || response.data.status !== 'OK') {
            throw new Error(`Google Places API error: ${response.data?.error_message || response.data?.status}`);
          }

          return response.data.results.slice(0, limit).map((place: any) => ({
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            rating: place.rating,
            user_ratings_total: place.user_ratings_total,
            price_level: place.price_level,
            types: place.types,
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            },
            photos: place.photos ? place.photos.map((photo: any) => ({
              photo_reference: photo.photo_reference,
              width: photo.width,
              height: photo.height
            })) : undefined,
            business_status: place.business_status
          }));
        } catch (error: any) {
          console.error('Google Places API error:', error.response?.data || error.message);
          // Return mock data on error
          return Array.from({ length: limit }, (_, i) => ({
            id: `mock-place-${i}`,
            name: `${query} Location ${i + 1}`,
            address: `${i + 1} ${query} Street, City, Country`,
            rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
            user_ratings_total: Math.floor(Math.random() * 500),
            price_level: Math.floor(Math.random() * 4),
            types: ['tourist_attraction', 'point_of_interest'],
            location: {
              lat: 40.7128 + (Math.random() - 0.5) * 0.1,
              lng: -74.0060 + (Math.random() - 0.5) * 0.1
            },
            photos: [{
              photo_reference: 'mock-photo-ref',
              width: 400,
              height: 300
            }],
            business_status: 'OPERATIONAL'
          }));
        }
      },
      { query, limit }
    );
  }
}
