import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Amadeus API Integration - Travel Search and Booking
 * Features: Flight search, hotel search, booking management
 * Get API key from Amadeus for Developers portal
 */
export class AmadeusAPI {
  private static readonly BASE_URL = 'https://test.api.amadeus.com/v1'; // Using test environment
  private static readonly PROD_BASE_URL = 'https://api.amadeus.com/v1'; // Production environment
  private static apiKey = process.env.AMADEUS_API_KEY || '';
  private static apiSecret = process.env.AMADEUS_API_SECRET || '';
  private static accessToken: string | null = null;
  private static tokenExpiration: number | null = null;
  private static useProduction = process.env.AMADEUS_ENV === 'production';

  /**
   * Get access token for Amadeus API
   * @returns Access token
   */
  private static async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.accessToken!;
    }

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Amadeus API key and secret are required');
    }

    try {
      const response = await axios.post(
        `${this.useProduction ? this.PROD_BASE_URL : this.BASE_URL}/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.apiSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (!response.data || !response.data.access_token) {
        throw new Error('Failed to obtain Amadeus access token');
      }

      this.accessToken = response.data.access_token;
      // Set expiration (typically 1800 seconds = 30 minutes)
      this.tokenExpiration = Date.now() + (response.data.expires_in * 1000 || 1800000);

      return this.accessToken!;
    } catch (error: any) {
      console.error('Amadeus token error:', error.response?.data || error.message);
      throw new Error(`Amadeus token error: ${error.message}`);
    }
  }

  /**
   * Search for flights
   * @param origin Origin airport code (e.g., NYC)
   * @param destination Destination airport code (e.g., MAD)
   * @param departureDate Departure date (YYYY-MM-DD)
   * @param returnDate Return date (YYYY-MM-DD, optional)
   * @param passengers Number of passengers
   * @returns Flight offers
   */
  static async searchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    returnDate?: string,
    passengers: number = 1
  ): Promise<Array<{
    id: string;
    airline: string;
    flightNumber: string;
    departure: { airport: string; terminal?: string; time: string };
    arrival: { airport: string; terminal?: string; time: string };
    duration: string;
    price: { amount: string; currency: string };
    stops: number;
    cabin: string;
  }>> {
    return AgentLogger.measurePerformance(
      'AmadeusAPI',
      'searchFlights',
      async () => {
        if (!this.apiKey || !this.apiSecret) {
          // Mock data when no API key
          return this.getMockFlights();
        }

        try {
          const token = await this.getAccessToken();
          const baseUrl = this.useProduction ? this.PROD_BASE_URL : this.BASE_URL;
          
          const params = new URLSearchParams({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: departureDate,
            adults: passengers.toString(),
            max: '5'
          });
          
          if (returnDate) {
            params.append('returnDate', returnDate);
          }

          const response = await axios.get(
            `${baseUrl}/shopping/flight-offers?${params}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (!response.data || !response.data.data) {
            throw new Error('Invalid response from Amadeus API');
          }

          return response.data.data.map((flight: any) => ({
            id: flight.id,
            airline: flight.itineraries[0]?.segments[0]?.carrierCode || 'Unknown',
            flightNumber: flight.itineraries[0]?.segments[0]?.number || 'Unknown',
            departure: {
              airport: flight.itineraries[0]?.segments[0]?.departure?.iataCode || '',
              terminal: flight.itineraries[0]?.segments[0]?.departure?.terminal,
              time: flight.itineraries[0]?.segments[0]?.departure?.at || ''
            },
            arrival: {
              airport: flight.itineraries[0]?.segments[0]?.arrival?.iataCode || '',
              terminal: flight.itineraries[0]?.segments[0]?.arrival?.terminal,
              time: flight.itineraries[0]?.segments[0]?.arrival?.at || ''
            },
            duration: flight.itineraries[0]?.duration || '',
            price: {
              amount: flight.price?.grandTotal?.toString() || '0',
              currency: flight.price?.currency || 'USD'
            },
            stops: flight.itineraries[0]?.segments?.length ? flight.itineraries[0]?.segments?.length - 1 : 0,
            cabin: flight.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY'
          }));
        } catch (error: any) {
          console.error('Amadeus flight search error:', error.response?.data || error.message);
          throw new Error(`Amadeus flight search error: ${error.message}`);
        }
      },
      { origin, destination, departureDate, returnDate, passengers }
    );
  }

  /**
   * Search for hotels
   * @param cityCode City code (e.g., PAR for Paris)
   * @param checkIn Check-in date (YYYY-MM-DD)
   * @param checkOut Check-out date (YYYY-MM-DD)
   * @param guests Number of guests
   * @returns Hotel offers
   */
  static async searchHotels(
    cityCode: string,
    checkIn: string,
    checkOut: string,
    guests: number = 1
  ): Promise<Array<{
    id: string;
    name: string;
    rating: number;
    address: { line1: string; city: string; country: string };
    price: { amount: string; currency: string };
    amenities: string[];
    distance?: { value: number; unit: string };
  }>> {
    return AgentLogger.measurePerformance(
      'AmadeusAPI',
      'searchHotels',
      async () => {
        if (!this.apiKey || !this.apiSecret) {
          // Mock data when no API key
          return this.getMockHotels();
        }

        try {
          const token = await this.getAccessToken();
          const baseUrl = this.useProduction ? this.PROD_BASE_URL : this.BASE_URL;
          
          const params = new URLSearchParams({
            cityCode: cityCode,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            adults: guests.toString(),
            rooms: '1',
            max: '5'
          });

          const response = await axios.get(
            `${baseUrl}/shopping/hotel-offers?${params}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (!response.data || !response.data.data) {
            throw new Error('Invalid response from Amadeus API');
          }

          return response.data.data.map((hotel: any) => ({
            id: hotel.hotel.hotelId,
            name: hotel.hotel.name,
            rating: hotel.hotel.rating || 0,
            address: {
              line1: hotel.hotel.address?.lines?.[0] || '',
              city: hotel.hotel.address?.cityName || '',
              country: hotel.hotel.address?.countryCode || ''
            },
            price: {
              amount: hotel.offers[0]?.price?.total || '0',
              currency: hotel.offers[0]?.price?.currency || 'USD'
            },
            amenities: hotel.hotel.amenities || [],
            distance: hotel.hotel.distance ? {
              value: hotel.hotel.distance.value,
              unit: hotel.hotel.distance.unit
            } : undefined
          }));
        } catch (error: any) {
          console.error('Amadeus hotel search error:', error.response?.data || error.message);
          throw new Error(`Amadeus hotel search error: ${error.message}`);
        }
      },
      { cityCode, checkIn, checkOut, guests }
    );
  }

  /**
   * Book a flight
   * @param offerId Flight offer ID
   * @param travelers Traveler information
   * @returns Booking confirmation
   */
  static async bookFlight(
    offerId: string,
    travelers: Array<{
      id: string;
      dateOfBirth: string;
      name: { firstName: string; lastName: string };
      contact: { emailAddress: string; phones: Array<{ countryCallingCode: string; number: string }> };
    }>
  ): Promise<{
    id: string;
    status: string;
    flightOffers: any[];
    travelers: any[];
    remarks: { general: { remarks: string[] } };
  }> {
    return AgentLogger.measurePerformance(
      'AmadeusAPI',
      'bookFlight',
      async () => {
        if (!this.apiKey || !this.apiSecret) {
          // Mock data when no API key
          return this.getMockBooking();
        }

        try {
          const token = await this.getAccessToken();
          const baseUrl = this.useProduction ? this.PROD_BASE_URL : this.BASE_URL;

          const response = await axios.post(
            `${baseUrl}/booking/flight-orders`,
            {
              data: {
                type: 'flight-order',
                flightOffers: [{ id: offerId }],
                travelers: travelers
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.data) {
            throw new Error('Invalid response from Amadeus API');
          }

          return {
            id: response.data.data.id,
            status: response.data.data.type,
            flightOffers: response.data.data.flightOffers,
            travelers: response.data.data.travelers,
            remarks: response.data.data.remarks
          };
        } catch (error: any) {
          console.error('Amadeus flight booking error:', error.response?.data || error.message);
          throw new Error(`Amadeus flight booking error: ${error.message}`);
        }
      },
      { offerId, travelersCount: travelers.length }
    );
  }

  /**
   * Get location information
   * @param keyword Location keyword (e.g., Paris)
   * @returns Location information
   */
  static async getLocationInfo(
    keyword: string
  ): Promise<Array<{
    id: string;
    name: string;
    type: string;
    subType: string;
    address?: { cityName: string; countryName: string };
  }>> {
    return AgentLogger.measurePerformance(
      'AmadeusAPI',
      'getLocationInfo',
      async () => {
        if (!this.apiKey || !this.apiSecret) {
          // Mock data when no API key
          return this.getMockLocations();
        }

        try {
          const token = await this.getAccessToken();
          const baseUrl = this.useProduction ? this.PROD_BASE_URL : this.BASE_URL;
          
          const params = new URLSearchParams({
            keyword: keyword,
            max: '5'
          });

          const response = await axios.get(
            `${baseUrl}/reference-data/locations?${params}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (!response.data || !response.data.data) {
            throw new Error('Invalid response from Amadeus API');
          }

          return response.data.data.map((location: any) => ({
            id: location.iataCode || location.id,
            name: location.name,
            type: location.type,
            subType: location.subType,
            address: location.address ? {
              cityName: location.address.cityName,
              countryName: location.address.countryName
            } : undefined
          }));
        } catch (error: any) {
          console.error('Amadeus location info error:', error.response?.data || error.message);
          throw new Error(`Amadeus location info error: ${error.message}`);
        }
      },
      { keyword }
    );
  }

  private static getMockFlights(): any {
    return [
      {
        id: 'mock-flight-1',
        airline: 'AF',
        flightNumber: '1234',
        departure: { airport: 'CDG', terminal: '2F', time: '2023-12-01T10:00:00' },
        arrival: { airport: 'JFK', terminal: '4', time: '2023-12-01T13:30:00' },
        duration: 'PT7H30M',
        price: { amount: '450.00', currency: 'USD' },
        stops: 0,
        cabin: 'ECONOMY'
      },
      {
        id: 'mock-flight-2',
        airline: 'DL',
        flightNumber: '5678',
        departure: { airport: 'CDG', terminal: '2E', time: '2023-12-01T15:30:00' },
        arrival: { airport: 'JFK', terminal: '2', time: '2023-12-01T18:45:00' },
        duration: 'PT8H15M',
        price: { amount: '420.00', currency: 'USD' },
        stops: 0,
        cabin: 'ECONOMY'
      }
    ];
  }

  private static getMockHotels(): any {
    return [
      {
        id: 'mock-hotel-1',
        name: 'Grand Plaza Hotel',
        rating: 4.5,
        address: { line1: '123 Main Street', city: 'Paris', country: 'France' },
        price: { amount: '180.00', currency: 'USD' },
        amenities: ['wifi', 'pool', 'restaurant', 'gym'],
        distance: { value: 0.5, unit: 'KM' }
      },
      {
        id: 'mock-hotel-2',
        name: 'Boutique Hotel Paris',
        rating: 4.2,
        address: { line1: '456 Rue de Rivoli', city: 'Paris', country: 'France' },
        price: { amount: '150.00', currency: 'USD' },
        amenities: ['wifi', 'restaurant'],
        distance: { value: 1.2, unit: 'KM' }
      }
    ];
  }

  private static getMockBooking(): any {
    return {
      id: 'mock-booking-123',
      status: 'CONFIRMED',
      flightOffers: [],
      travelers: [],
      remarks: { general: { remarks: ['Mock booking for demonstration'] } }
    };
  }

  private static getMockLocations(): any {
    return [
      {
        id: 'PAR',
        name: 'Paris',
        type: 'CITY',
        subType: 'CITY',
        address: { cityName: 'Paris', countryName: 'France' }
      },
      {
        id: 'CDG',
        name: 'Charles de Gaulle Airport',
        type: 'AIRPORT',
        subType: 'AIRPORT',
        address: { cityName: 'Paris', countryName: 'France' }
      }
    ];
  }
}

export const amadeusService = new AmadeusAPI();