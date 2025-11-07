/**
 * Free APIs Integration
 * CoinGecko, Alpha Vantage, NewsAPI, OpenWeatherMap
 * Zero-cost data sources for agents
 * 
 * @module freeApisIntegration
 * @version 1.0.0
 */

import { AgentLogger, LogLevel } from '../utils/agentLogger';

/**
 * CoinGecko API - Free crypto price data
 * Rate limit: 10-50 calls/min (no API key needed)
 */
export class CoinGeckoAPI {
  private static readonly BASE_URL = 'https://api.coingecko.com/api/v3';

  /**
   * Get real-time crypto prices
   */
  static async getCryptoPrices(symbols: string[]): Promise<Array<{
    symbol: string;
    price_usd: number;
    price_change_24h: number;
    volume_24h: number;
    market_cap: number;
    last_updated: string;
  }>> {
    return AgentLogger.measurePerformance(
      'CoinGeckoAPI',
      'getCryptoPrices',
      async () => {
        const ids = symbols.map(s => s.toLowerCase()).join(',');
        const response = await fetch(
          `${this.BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`
        );

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.statusText}`);
        }

        const data = await response.json() as Record<string, any>;

        return symbols.map(symbol => {
          const key = symbol.toLowerCase();
          const coinData = data[key] || {};

          return {
            symbol: symbol.toUpperCase(),
            price_usd: coinData.usd || 0,
            price_change_24h: coinData.usd_24h_change || 0,
            volume_24h: coinData.usd_24h_vol || 0,
            market_cap: coinData.usd_market_cap || 0,
            last_updated: coinData.last_updated_at 
              ? new Date(coinData.last_updated_at * 1000).toISOString()
              : new Date().toISOString(),
          };
        });
      },
      { symbols }
    );
  }

  /**
   * Get trending cryptocurrencies
   */
  static async getTrending(): Promise<Array<{
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number;
    price_btc: number;
  }>> {
    return AgentLogger.measurePerformance(
      'CoinGeckoAPI',
      'getTrending',
      async () => {
        const response = await fetch(`${this.BASE_URL}/search/trending`);

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.statusText}`);
        }

        const data = await response.json() as { coins: Array<{ item: any }> };

        return data.coins.slice(0, 10).map(({ item }) => ({
          id: item.id,
          name: item.name,
          symbol: item.symbol,
          market_cap_rank: item.market_cap_rank || 0,
          price_btc: item.price_btc || 0,
        }));
      }
    );
  }

  /**
   * Get market overview
   */
  static async getMarketOverview(): Promise<{
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap_usd: number;
    total_volume_24h_usd: number;
    market_cap_change_24h: number;
  }> {
    return AgentLogger.measurePerformance(
      'CoinGeckoAPI',
      'getMarketOverview',
      async () => {
        const response = await fetch(`${this.BASE_URL}/global`);

        if (!response.ok) {
          throw new Error(`CoinGecko API error: ${response.statusText}`);
        }

        const data = await response.json() as { data: any };
        const global = data.data;

        return {
          active_cryptocurrencies: global.active_cryptocurrencies || 0,
          markets: global.markets || 0,
          total_market_cap_usd: global.total_market_cap?.usd || 0,
          total_volume_24h_usd: global.total_volume?.usd || 0,
          market_cap_change_24h: global.market_cap_change_percentage_24h_usd || 0,
        };
      }
    );
  }
}

/**
 * Alpha Vantage API - Free stock market data
 * Rate limit: 5 calls/min, 500 calls/day (free tier)
 * Get API key: https://www.alphavantage.co/support/#api-key
 */
export class AlphaVantageAPI {
  private static readonly BASE_URL = 'https://www.alphavantage.co/query';
  private static apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

  /**
   * Get stock quote
   */
  static async getStockQuote(symbol: string): Promise<{
    symbol: string;
    price: number;
    change: number;
    change_percent: string;
    volume: number;
    latest_trading_day: string;
  }> {
    return AgentLogger.measurePerformance(
      'AlphaVantageAPI',
      'getStockQuote',
      async () => {
        const response = await fetch(
          `${this.BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
        );

        if (!response.ok) {
          throw new Error(`Alpha Vantage API error: ${response.statusText}`);
        }

        const data = await response.json() as { 'Global Quote': Record<string, string> };
        const quote = data['Global Quote'];

        return {
          symbol: quote['01. symbol'] || symbol,
          price: parseFloat(quote['05. price'] || '0'),
          change: parseFloat(quote['09. change'] || '0'),
          change_percent: quote['10. change percent'] || '0%',
          volume: parseInt(quote['06. volume'] || '0'),
          latest_trading_day: quote['07. latest trading day'] || '',
        };
      },
      { symbol }
    );
  }

  /**
   * Get forex exchange rate
   */
  static async getForexRate(from: string, to: string): Promise<{
    from: string;
    to: string;
    rate: number;
    last_updated: string;
  }> {
    return AgentLogger.measurePerformance(
      'AlphaVantageAPI',
      'getForexRate',
      async () => {
        const response = await fetch(
          `${this.BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${this.apiKey}`
        );

        if (!response.ok) {
          throw new Error(`Alpha Vantage API error: ${response.statusText}`);
        }

        const data = await response.json() as { 'Realtime Currency Exchange Rate': Record<string, string> };
        const rate = data['Realtime Currency Exchange Rate'];

        return {
          from: rate['1. From_Currency Code'] || from,
          to: rate['3. To_Currency Code'] || to,
          rate: parseFloat(rate['5. Exchange Rate'] || '0'),
          last_updated: rate['6. Last Refreshed'] || new Date().toISOString(),
        };
      },
      { from, to }
    );
  }
}

/**
 * NewsAPI - Free news headlines
 * Rate limit: 100 requests/day (free tier)
 * Get API key: https://newsapi.org/register
 */
export class NewsAPI {
  private static readonly BASE_URL = 'https://newsapi.org/v2';
  private static apiKey = process.env.NEWS_API_KEY || '';

  /**
   * Get top headlines by topic
   */
  static async getHeadlines(
    topic: 'crypto' | 'ai' | 'finance' | 'technology',
    limit: number = 10
  ): Promise<Array<{
    title: string;
    description: string;
    url: string;
    source: string;
    published_at: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
  }>> {
    return AgentLogger.measurePerformance(
      'NewsAPI',
      'getHeadlines',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return this.getMockHeadlines(topic, limit);
        }

        const query = this.getTopicQuery(topic);
        const response = await fetch(
          `${this.BASE_URL}/everything?q=${query}&sortBy=publishedAt&pageSize=${limit}&apiKey=${this.apiKey}`
        );

        if (!response.ok) {
          throw new Error(`NewsAPI error: ${response.statusText}`);
        }

        const data = await response.json() as { articles: Array<any> };

        return data.articles.map(article => ({
          title: article.title || '',
          description: article.description || '',
          url: article.url || '',
          source: article.source?.name || 'Unknown',
          published_at: article.publishedAt || new Date().toISOString(),
          sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
        }));
      },
      { topic, limit }
    );
  }

  private static getTopicQuery(topic: string): string {
    const queries: Record<string, string> = {
      crypto: 'cryptocurrency OR bitcoin OR ethereum',
      ai: 'artificial intelligence OR machine learning OR AI',
      finance: 'stock market OR trading OR investment',
      technology: 'tech OR startup OR innovation',
    };
    return queries[topic] || topic;
  }

  private static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positive = ['gain', 'rise', 'surge', 'bullish', 'growth', 'profit'];
    const negative = ['loss', 'fall', 'crash', 'bearish', 'decline', 'risk'];

    const lowerText = text.toLowerCase();
    const posCount = positive.filter(word => lowerText.includes(word)).length;
    const negCount = negative.filter(word => lowerText.includes(word)).length;

    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
  }

  private static getMockHeadlines(topic: string, limit: number) {
    const mockData: Record<string, Array<any>> = {
      crypto: [
        {
          title: 'Bitcoin Reaches New All-Time High',
          description: 'BTC surges past previous records amid institutional adoption',
          url: 'https://example.com/btc-ath',
          source: 'CryptoNews',
          published_at: new Date().toISOString(),
          sentiment: 'positive' as const,
        },
      ],
      ai: [
        {
          title: 'AI Agents Revolutionize Blockchain Industry',
          description: 'Autonomous agents bring new capabilities to DeFi',
          url: 'https://example.com/ai-blockchain',
          source: 'TechCrunch',
          published_at: new Date().toISOString(),
          sentiment: 'positive' as const,
        },
      ],
    };

    return (mockData[topic] || mockData.crypto).slice(0, limit);
  }
}

/**
 * OpenWeatherMap API - Free weather data
 * Rate limit: 1000 calls/day (free tier)
 * Get API key: https://openweathermap.org/api
 */
export class OpenWeatherAPI {
  private static readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private static apiKey = process.env.OPENWEATHER_API_KEY || '';

  /**
   * Get weather by city
   */
  static async getWeather(city: string): Promise<{
    city: string;
    temperature_celsius: number;
    feels_like: number;
    humidity: number;
    description: string;
    wind_speed: number;
    timestamp: string;
  }> {
    return AgentLogger.measurePerformance(
      'OpenWeatherAPI',
      'getWeather',
      async () => {
        if (!this.apiKey) {
          // Mock data when no API key
          return {
            city,
            temperature_celsius: 22,
            feels_like: 21,
            humidity: 65,
            description: 'Partly cloudy',
            wind_speed: 5.5,
            timestamp: new Date().toISOString(),
          };
        }

        const response = await fetch(
          `${this.BASE_URL}/weather?q=${city}&appid=${this.apiKey}&units=metric`
        );

        if (!response.ok) {
          throw new Error(`OpenWeather API error: ${response.statusText}`);
        }

        const data = await response.json() as any;

        return {
          city: data.name || city,
          temperature_celsius: data.main?.temp || 0,
          feels_like: data.main?.feels_like || 0,
          humidity: data.main?.humidity || 0,
          description: data.weather?.[0]?.description || '',
          wind_speed: data.wind?.speed || 0,
          timestamp: new Date().toISOString(),
        };
      },
      { city }
    );
  }
}

/**
 * Public Google Sheets Integration
 * Use public sheets as free database
 */
export class PublicSheetsDB {
  /**
   * Read from public Google Sheet (CSV export)
   */
  static async readSheet(sheetUrl: string): Promise<Array<Record<string, string>>> {
    return AgentLogger.measurePerformance(
      'PublicSheetsDB',
      'readSheet',
      async () => {
        // Convert sheet URL to CSV export URL
        const csvUrl = sheetUrl.replace('/edit', '/export?format=csv');

        const response = await fetch(csvUrl);

        if (!response.ok) {
          throw new Error(`Failed to read sheet: ${response.statusText}`);
        }

        const csv = await response.text();
        return this.parseCSV(csv);
      },
      { sheetUrl }
    );
  }

  private static parseCSV(csv: string): Array<Record<string, string>> {
    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1);

    return rows.map(row => {
      const values = row.split(',').map(v => v.trim());
      const record: Record<string, string> = {};

      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });

      return record;
    });
  }

  /**
   * Log data to sheet (requires Apps Script webhook)
   */
  static async appendToSheet(
    webhookUrl: string,
    data: Record<string, any>
  ): Promise<{ success: boolean }> {
    return AgentLogger.measurePerformance(
      'PublicSheetsDB',
      'appendToSheet',
      async () => {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        return { success: response.ok };
      },
      { dataKeys: Object.keys(data) }
    );
  }
}
