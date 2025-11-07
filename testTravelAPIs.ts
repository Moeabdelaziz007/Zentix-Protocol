import { KiwiAPI, OpenStreetMapAPI } from './core/apis/travelApisIntegration';

async function testTravelAPIs() {
  try {
    console.log('Testing OpenStreetMap place search...');
    const places = await OpenStreetMapAPI.searchPlaces('London', 3);
    console.log('Places:', places);
  } catch (error) {
    console.error('OpenStreetMap error:', error);
  }

  try {
    console.log('Testing OpenStreetMap reverse geocode...');
    const place = await OpenStreetMapAPI.reverseGeocode('51.5074', '-0.1278');
    console.log('Reverse geocode result:', place);
  } catch (error) {
    console.error('Reverse geocode error:', error);
  }

  try {
    console.log('Testing KiwiAPI flight search...');
    const flights = await KiwiAPI.searchFlights({
      fly_from: 'LON',
      fly_to: 'NYC',
      date_from: '01/12/2025',
      date_to: '31/12/2025',
      adults: 1
    });
    console.log('Flights:', flights);
  } catch (error) {
    console.error('KiwiAPI error:', error);
  }
}

testTravelAPIs();