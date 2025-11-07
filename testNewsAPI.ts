import { NewsAPI } from './core/apis/freeApisIntegration';

async function testNewsAPI() {
  try {
    console.log('Testing NewsAPI with mock data (no API key)...');
    const result = await NewsAPI.getHeadlines('crypto', 5);
    console.log('NewsAPI result:', result);
  } catch (error) {
    console.error('NewsAPI error:', error);
  }
}

testNewsAPI();