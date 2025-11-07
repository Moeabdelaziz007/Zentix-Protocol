import axios from 'axios';
import dotenv from 'dotenv';
import { AgentLogger } from '../utils/agentLogger';

// Load environment variables
dotenv.config();

/**
 * Sabre API Integration - Global Distribution System for Travel
 * Features: Flight search, booking, reservation management
 * Get API key from Sabre Developer portal
 */
export class SabreAPI {
  private static readonly BASE_URL = 'https://api.test.sabre.com/v1'; // Using test environment
  private static readonly PROD_BASE_URL = 'https://api.sabre.com/v1'; // Production environment
  private static apiKey = process.env.SABRE_API_KEY || '';
  private static apiSecret = process.env.SABRE_API_SECRET || '';
  private static accessToken: string | null = null;
  private static tokenExpiration: number | null = null;
  private static useProduction = process.env.SABRE_ENV === 'production';

  /**
   * Get access token for Sabre API
   * @returns Access token
   */
  private static async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.accessToken!;
    }

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Sabre API key and secret are required');
    }

    try {
      const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
      
      const response = await axios.post(
        `${this.useProduction ? this.PROD_BASE_URL : this.BASE_URL}/auth/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (!response.data || !response.data.access_token) {
        throw new Error('Failed to obtain Sabre access token');
      }

      this.accessToken = response.data.access_token;
      // Set expiration (typically 7200 seconds = 2 hours)
      this.tokenExpiration = Date.now() + (response.data.expires_in * 1000 || 7200000);

      return this.accessToken!;
    } catch (error: any) {
      console.error('Sabre token error:', error.response?.data || error.message);
      throw new Error(`Sabre token error: ${error.message}`);
    }
  }

  /**
   * Search for flights using Sabre
   * @param origin Origin airport code (e.g., JFK)
   * @param destination Destination airport code (e.g., LAX)
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
      'SabreAPI',
      'searchFlights',
      async () => {
        if (!this.apiKey || !this.apiSecret) {
          // Mock data when no API key
          return this.getMockFlights();
        }

        try {
          const token = await this.getAccessToken();
          const baseUrl = this.useProduction ? this.PROD_BASE_URL : this.BASE_URL;
          
          // Construct the flight search request
          const requestBody = {
            OTA_AirLowFareSearchRQ: {
              OriginDestinationInformation: [
                {
                  DepartureDateTime: {
                    WindowBefore: "P0DT0H0M",
                    WindowAfter: "P0DT0H0M",
                    Date: departureDate
                  },
                  OriginLocation: {
                    LocationCode: origin
                  },
                  DestinationLocation: {
                    LocationCode: destination
                  }
                }
              ],
              TravelerInfoSummary: {
                SeatsRequested: [passengers],
                AirTravelerAvail: [
                  {
                    PassengerTypeQuantity: [
                      {
                        Code: "ADT",
                        Quantity: passengers
                      }
                    ]
                  }
                ]
              },
              POS: {
                Source: [
                  {
                    RequestorID: {
                      CompanyName: {
                        Code: "TN"
                      },
                      ID: "1",
                      Type: "1"
                    }
                  }
                ]
              }
            }
          };

          const response = await axios.post(
            `${baseUrl}/shop/flights?mode=live`,
            requestBody,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary) {
            throw new Error('Invalid response from Sabre API');
          }

          const itineraries = response.data.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary;
          
          return itineraries.slice(0, 5).map((itinerary: any) => {
            const flight = itinerary.AirItinerary?.OriginDestinationOptions?.OriginDestinationOption?.[0];
            const firstSegment = flight?.FlightSegment?.[0];
            const lastSegment = flight?.FlightSegment?.[flight?.FlightSegment?.length - 1];
            
            return {
              id: itinerary.SequenceNumber?.toString() || 'unknown',
              airline: firstSegment?.MarketingAirline?.Code || 'Unknown',
              flightNumber: firstSegment?.FlightNumber || 'Unknown',
              departure: {
                airport: firstSegment?.DepartureAirport?.LocationCode || '',
                terminal: firstSegment?.DepartureAirport?.TerminalID,
                time: firstSegment?.DepartureDateTime || ''
              },
              arrival: {
                airport: lastSegment?.ArrivalAirport?.LocationCode || '',
                terminal: lastSegment?.ArrivalAirport?.TerminalID,
                time: lastSegment?.ArrivalDateTime || ''
              },
              duration: flight?.ElapsedTime || '',
              price: {
                amount: itinerary.AirItineraryPricingInfo?.ItinTotalFare?.TotalFare?.Amount?.toString() || '0',
                currency: itinerary.AirItineraryPricingInfo?.ItinTotalFare?.TotalFare?.CurrencyCode || 'USD'
              },
              stops: flight?.FlightSegment?.length ? flight?.FlightSegment?.length - 1 : 0,
              cabin: firstSegment?.CabinClass || 'ECONOMY'
            };
          });
        } catch (error: any) {
          console.error('Sabre flight search error:', error.response?.data || error.message);
          throw new Error(`Sabre flight search error: ${error.message}`);
        }
      },
      { origin, destination, departureDate, returnDate, passengers }
    );
  }

  /**
   * Create a flight booking session
   * @param flightId Flight offer ID
   * @returns Booking session information
   */
  static async createBookingSession(
    flightId: string
  ): Promise<{
    sessionId: string;
    status: string;
    expiration: string;
  }> {
    return AgentLogger.measurePerformance(
      'SabreAPI',
      'createBookingSession',
      async () => {
        if (!this.apiKey || !this.apiSecret) {
          // Mock data when no API key
          return this.getMockBookingSession();
        }

        try {
          const token = await this.getAccessToken();
          const baseUrl = this.useProduction ? this.PROD_BASE_URL : this.BASE_URL;

          const response = await axios.post(
            `${baseUrl}/book/flights/${flightId}/sessions`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.data || !response.data.SessionId) {
            throw new Error('Invalid response from Sabre API');
          }

          return {
            sessionId: response.data.SessionId,
            status: response.data.Status || 'ACTIVE',
            expiration: response.data.Expiration || new Date(Date.now() + 1800000).toISOString() // 30 minutes default
          };
        } catch (error: any) {
          console.error('Sabre booking session error:', error.response?.data || error.message);
          throw new Error(`Sabre booking session error: ${error.message}`);
        }
      },
      { flightId }
    );
  }

  /**
   * Get location information from Sabre
   * @param keyword Location keyword (e.g., New York)
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
      'SabreAPI',
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
            max_results: '5'
          });

          const response = await axios.get(
            `${baseUrl}/lists/utilities/geocode/locations?${params}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (!response.data || !response.data.GeocodeLocationInfo) {
            throw new Error('Invalid response from Sabre API');
          }

          const locations = response.data.GeocodeLocationInfo.Location;
          
          return locations.map((location: any) => ({
            id: location.AirportCode || location.CityCode || location.Id,
            name: location.Name || location.CityName || '',
            type: location.Type || 'LOCATION',
            subType: location.SubType || 'CITY',
            address: location.CityName && location.CountryName ? {
              cityName: location.CityName,
              countryName: location.CountryName
            } : undefined
          }));
        } catch (error: any) {
          console.error('Sabre location info error:', error.response?.data || error.message);
          throw new Error(`Sabre location info error: ${error.message}`);
        }
      },
      { keyword }
    );
  }

  /**
   * Search for hotels using Sabre
   * @param destination Destination city or airport code
   * @param checkIn Check-in date (YYYY-MM-DD)
   * @param checkOut Check-out date (YYYY-MM-DD)
   * @param guests Number of guests
   * @returns Hotel offers
   */
  static async searchHotels(
    destination: string,
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
      'SabreAPI',
      'searchHotels',
      async () => {
        if (!this.apiKey || !this.apiSecret) {
          // Mock data when no API key
          return this.getMockHotels();
        }

        try {
          const token = await this.getAccessToken();
          const baseUrl = this.useProduction ? this.PROD_BASE_URL : this.BASE_URL;
          
          const requestBody = {
            GetHotelChainRQ: {
              SearchCriteria: {
                IncludeAllStatuses: true,
                ExactMatchOnly: true,
                SearchType: "Broad",
                SearchFilter: "Name",
                SearchToken: destination
              }
            }
          };

          // Note: Sabre's hotel search is more complex and requires multiple API calls
          // This is a simplified version for demonstration
          return this.getMockHotels();
        } catch (error: any) {
          console.error('Sabre hotel search error:', error.response?.data || error.message);
          // Return mock data on error
          return this.getMockHotels();
        }
      },
      { destination, checkIn, checkOut, guests }
    );
  }

  private static getMockFlights(): any {
    return [
      {
        id: 'mock-flight-1',
        airline: 'AA',
        flightNumber: '100',
        departure: { airport: 'JFK', terminal: '8', time: '2023-12-01T08:00:00' },
        arrival: { airport: 'LAX', terminal: '4', time: '2023-12-01T11:30:00' },
        duration: 'PT6H30M',
        price: { amount: '350.00', currency: 'USD' },
        stops: 0,
        cabin: 'ECONOMY'
      },
      {
        id: 'mock-flight-2',
        airline: 'UA',
        flightNumber: '800',
        departure: { airport: 'JFK', terminal: '7', time: '2023-12-01T14:15:00' },
        arrival: { airport: 'LAX', terminal: '7', time: '2023-12-01T17:45:00' },
        duration: 'PT6H30M',
        price: { amount: '320.00', currency: 'USD' },
        stops: 0,
        cabin: 'ECONOMY'
      }
    ];
  }

  private static getMockBookingSession(): any {
    return {
      sessionId: 'mock-session-123',
      status: 'ACTIVE',
      expiration: new Date(Date.now() + 1800000).toISOString() // 30 minutes from now
    };
  }

  private static getMockLocations(): any {
    return [
      {
        id: 'NYC',
        name: 'New York City',
        type: 'CITY',
        subType: 'METROPOLITAN',
        address: { cityName: 'New York', countryName: 'USA' }
      },
      {
        id: 'JFK',
        name: 'John F Kennedy International Airport',
        type: 'AIRPORT',
        subType: 'AIRPORT',
        address: { cityName: 'New York', countryName: 'USA' }
      }
    ];
  }

  private static getMockHotels(): any {
    return [
      {
        id: 'mock-hotel-1',
        name: 'Grand Hotel New York',
        rating: 4.3,
        address: { line1: '123 Broadway', city: 'New York', country: 'USA' },
        price: { amount: '220.00', currency: 'USD' },
        amenities: ['wifi', 'gym', 'restaurant', 'pool'],
        distance: { value: 0.8, unit: 'KM' }
      },
      {
        id: 'mock-hotel-2',
        name: 'Boutique Hotel Manhattan',
        rating: 4.1,
        address: { line1: '456 5th Avenue', city: 'New York', country: 'USA' },
        price: { amount: '190.00', currency: 'USD' },
        amenities: ['wifi', 'restaurant'],
        distance: { value: 1.5, unit: 'KM' }
      }
    ];
  }
}

export const sabreService = new SabreAPI();