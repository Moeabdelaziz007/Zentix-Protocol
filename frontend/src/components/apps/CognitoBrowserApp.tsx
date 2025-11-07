import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Globe, 
  Home, 
  Bookmark, 
  History, 
  Settings, 
  Sun, 
  Cloud, 
  TrendingUp,
  Newspaper,
  Code,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  Brain,
  CheckCircle
} from 'lucide-react';
import { apiService } from '../../services/api';
import type { WeatherData, NewsArticle, CryptoPrice } from '../../types';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  timestamp: string;
}

interface ApiResource {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  example: string;
}

interface FactCheckBadge {
  type: 'fact_check_badge';
  rating: 'true' | 'false' | 'mixed' | 'unverified';
  confidence: 'high' | 'medium' | 'low';
  publishers: string[];
  message: string;
}

// Fact check badge interface for displaying verification status
interface FactCheckBadge {
  type: 'fact_check_badge';
  rating: 'true' | 'false' | 'mixed' | 'unverified';
  confidence: 'high' | 'medium' | 'low';
  publishers: string[];
  message: string;
}

export function CognitoBrowserApp() {
  const [activeTab, setActiveTab] = useState<'browser' | 'dashboard' | 'resources'>('browser');
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: '1', title: 'New Tab', url: 'about:newtab' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', title: 'Google', url: 'https://google.com', timestamp: new Date().toISOString() },
    { id: '2', title: 'GitHub', url: 'https://github.com', timestamp: new Date().toISOString() },
    { id: '3', title: 'ZentixOS Documentation', url: 'https://zentixos.com/docs', timestamp: new Date().toISOString() }
  ]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Dashboard data state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [cryptoData, setCryptoData] = useState<CryptoPrice[]>([]);
  const [aiNews, setAiNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for fact check badges
  const [factCheckBadges, setFactCheckBadges] = useState<Record<string, FactCheckBadge>>({});
  
  // Format date for display
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };
  
  // Add function to extract and verify claims from text
  const analyzeArticleForFactCheck = async (articleText: string, articleId: string) => {
    try {
      // In a real implementation, this would call the FactCheckAPI
      // For now, we'll simulate the fact check process
      const isVerified = Math.random() > 0.5;
      const rating = Math.random() > 0.7 ? 'false' : 'true';
      
      const badge: FactCheckBadge = {
        type: 'fact_check_badge',
        rating: isVerified ? (rating as 'true' | 'false') : 'unverified',
        confidence: 'high',
        publishers: isVerified ? ['Verified News Source'] : [],
        message: isVerified 
          ? (rating === 'true' ? 'Verified as true' : 'Verified as false')
          : 'No fact checks found for this article'
      };
      
      setFactCheckBadges(prev => ({
        ...prev,
        [articleId]: badge
      }));
    } catch (error) {
      console.error('Fact check analysis failed:', error);
    }
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (activeTab !== 'dashboard') return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch weather data for New York
        const weather = await apiService.getWeather('New York');
        setWeatherData(weather);
        
        // Fetch crypto prices for BTC, ETH, and ZXT
        const cryptoPrices = await apiService.getCryptoPrices(['bitcoin', 'ethereum', 'zentix']);
        setCryptoData(cryptoPrices);
        
        // Fetch news headlines for crypto
        const cryptoNews = await apiService.getNewsHeadlines('crypto', 3);
        setNewsData(cryptoNews);
        
        // Fetch news headlines for AI
        const aiNewsData = await apiService.getNewsHeadlines('ai', 4);
        setAiNews(aiNewsData);
        
        // Analyze articles for fact checking
        [...cryptoNews, ...aiNewsData].forEach((article, index) => {
          // Simulate fact check analysis for each article
          setTimeout(() => {
            analyzeArticleForFactCheck(article.title, `article-${index}`);
          }, 1000 * index);
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [activeTab]);

  const apiResources: ApiResource[] = [
    // News & Data APIs
    {
      id: '1',
      name: 'NewsAPI.org',
      category: '📰 News & Data',
      description: 'Search thousands of news sources',
      url: 'https://newsapi.org',
      example: 'GET /v2/everything?q=technology&apiKey=API_KEY'
    },
    {
      id: '2',
      name: 'GNews API',
      category: '📰 News & Data',
      description: 'Alternative news API service',
      url: 'https://gnews.io',
      example: 'GET /api/v4/search?q=technology&token=API_KEY'
    },
    {
      id: '3',
      name: 'OpenWeatherMap',
      category: '📰 News & Data',
      description: 'Current and forecast weather data for any location',
      url: 'https://openweathermap.org/api',
      example: 'GET /data/2.5/weather?q=London&appid=API_KEY'
    },
    {
      id: '4',
      name: 'The Movie DB (TMDB)',
      category: '📰 News & Data',
      description: 'Comprehensive movie and TV database',
      url: 'https://themoviedb.org/documentation/api',
      example: 'GET /3/movie/popular?api_key=API_KEY'
    },
    
    // Finance & Crypto APIs
    {
      id: '5',
      name: 'CoinGecko API',
      category: '💰 Finance & Crypto',
      description: 'Comprehensive and reliable cryptocurrency data',
      url: 'https://coingecko.com/en/api',
      example: 'GET /api/v3/coins/markets?vs_currency=usd'
    },
    {
      id: '6',
      name: 'Alpha Vantage',
      category: '💰 Finance & Crypto',
      description: 'Stock and Forex data',
      url: 'https://alphavantage.co',
      example: 'GET /query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=API_KEY'
    },
    {
      id: '7',
      name: 'Financial Modeling Prep',
      category: '💰 Finance & Crypto',
      description: 'Another powerful API for stock data',
      url: 'https://site.financialmodelingprep.com/developer',
      example: 'GET /api/v3/profile/AAPL?apikey=API_KEY'
    },
    
    // Utility APIs
    {
      id: '8',
      name: 'LibreTranslate',
      category: '🛠️ Utilities',
      description: 'Open-source, self-hostable translation API',
      url: 'https://libretranslate.com',
      example: 'POST /translate with text and target language'
    },
    {
      id: '9',
      name: 'Free Dictionary API',
      category: '🛠️ Utilities',
      description: 'Word definitions and meanings',
      url: 'https://dictionaryapi.dev',
      example: 'GET /api/v2/entries/en/example'
    },
    {
      id: '10',
      name: 'OpenStreetMap API',
      category: '🛠️ Utilities',
      description: 'Open-source map data (alternative to Google Maps)',
      url: 'https://wiki.openstreetmap.org/wiki/API',
      example: 'GET /api/0.6/map?bbox=minlon,minlat,maxlon,maxlat'
    },
    {
      id: '11',
      name: 'JSONPlaceholder',
      category: '🛠️ Utilities',
      description: 'Fake API perfect for testing and development',
      url: 'https://jsonplaceholder.typicode.com',
      example: 'GET /posts/1'
    },
    
    // Images & Video APIs
    {
      id: '12',
      name: 'Pexels API',
      category: '🖼️ Images & Video',
      description: 'High-quality free photos and videos',
      url: 'https://pexels.com/api',
      example: 'GET /v1/search?query=nature&per_page=15&page=1'
    },
    {
      id: '13',
      name: 'Unsplash API',
      category: '🖼️ Images & Video',
      description: 'Large library of free stock photos',
      url: 'https://unsplash.com/developers',
      example: 'GET /photos/random?query=nature&count=1'
    },
    {
      id: '14',
      name: 'Pixabay API',
      category: '🖼️ Images & Video',
      description: 'Alternative source for free images and videos',
      url: 'https://pixabay.com/api/docs',
      example: 'GET /?key=API_KEY&q=yellow+flowers&image_type=photo'
    },
    {
      id: '15',
      name: 'Giphy API',
      category: '🖼️ Images & Video',
      description: 'Access to the largest GIF library',
      url: 'https://developers.giphy.com',
      example: 'GET /v1/gifs/search?api_key=API_KEY&q=cats&limit=5'
    }
  ];

  const createNewTab = () => {
    const newTabId = Date.now().toString();
    const newTab: BrowserTab = { id: newTabId, title: 'New Tab', url: 'about:newtab' };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTabId);
    setUrlInput('');
  };

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const navigateToUrl = (url: string) => {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    const updatedTabs = tabs.map(tab => 
      tab.id === activeTabId ? { ...tab, url: normalizedUrl, title: normalizedUrl } : tab
    );
    setTabs(updatedTabs);
    setUrlInput(normalizedUrl);
    
    // Add to history
    const historyItem: HistoryItem = {
      id: Date.now().toString(),
      title: normalizedUrl,
      url: normalizedUrl,
      timestamp: new Date().toISOString()
    };
    setHistory([historyItem, ...history.slice(0, 19)]);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    // Simulate AI search
    setTimeout(() => {
      // This would normally update state, but we're not using the results in this implementation
    }, 1000);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.includes('.') || urlInput.includes('://')) {
      navigateToUrl(urlInput);
    } else {
      handleSearch(urlInput);
    }
  };

  const getActiveTab = () => tabs.find(tab => tab.id === activeTabId);

  const renderBrowserView = () => {
    const activeTab = getActiveTab();
    if (!activeTab) return null;

    if (activeTab.url === 'about:newtab' || !activeTab.url) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-background/50 to-muted/50 p-8">
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <Globe className="w-20 h-20 text-primary mx-auto animate-float" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
              Cognito Browser
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Don't just browse the web. Understand it. Command it.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Brain className="w-4 h-4 text-primary" />
              <span>Powered by Advanced AI</span>
            </div>
          </div>
          
          <div className="w-full max-w-2xl">
            <form onSubmit={handleUrlSubmit} className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Search with AI or enter a URL"
                  className="w-full h-14 bg-background/80 border border-border rounded-full pl-12 pr-4 text-lg focus:ring-2 focus:ring-primary focus:border-transparent backdrop-blur-sm"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                  aria-label="Go to URL"
                >
                  Go
                </button>
              </div>
            </form>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className="bg-background/50 border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setActiveTab('dashboard')}
              >
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                  <Sun className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Personal Dashboard</h3>
                <p className="text-sm text-muted-foreground">Weather, news, and calendar in one place</p>
              </div>
              
              <div 
                className="bg-background/50 border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setActiveTab('resources')}
              >
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Developer Resources</h3>
                <p className="text-sm text-muted-foreground">APIs and tools for building AI agents</p>
              </div>
              
              <div className="bg-background/50 border border-border rounded-xl p-6 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Ask questions about any webpage</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 bg-background">
          <iframe
            ref={iframeRef}
            src={activeTab.url}
            className="w-full h-full border-none"
            title={activeTab.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
        
        {/* AI Assistant Panel */}
        <div className="border-t border-border bg-background/50 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Ask about this page..."
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Simulate AI response
                    alert(`AI Assistant would analyze the page and respond to: "${e.currentTarget.value}"`);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              aria-label="Ask AI about this page"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="h-full overflow-auto p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Personal Dashboard</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>Live Updates</span>
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-destructive/20 border border-destructive/30 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Weather Widget */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-border rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Sun className="w-5 h-5" />
                  Weather
                </h3>
                <Cloud className="w-8 h-8 text-blue-500" />
              </div>
              {weatherData ? (
                <>
                  <div className="text-3xl font-bold mb-1">{weatherData.temperature_celsius}°C</div>
                  <div className="text-muted-foreground mb-4 capitalize">{weatherData.description}</div>
                  <div className="flex justify-between text-sm">
                    <span>Humidity: {weatherData.humidity}%</span>
                    <span>Wind: {weatherData.wind_speed} m/s</span>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">No weather data available</div>
              )}
            </div>
            
            {/* News Widget with Fact Check Badges */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-border rounded-xl p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <Newspaper className="w-5 h-5" />
                Latest News
              </h3>
              <div className="space-y-3">
                {newsData.length > 0 ? (
                  newsData.map((item, index) => {
                    const badge = factCheckBadges[`article-${index}`];
                    return (
                      <div key={index} className="pb-3 border-b border-border/50 last:border-0 last:pb-0">
                        <div className="font-medium text-sm">{item.title}</div>
                        {badge && (
                          <div className="mt-1">
                            {renderFactCheckBadge(badge)}
                          </div>
                        )}
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>{item.source}</span>
                          <span>{formatTimeAgo(item.published_at)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted-foreground">No news available</div>
                )}
              </div>
            </div>
            
            {/* Crypto Widget */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-border rounded-xl p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5" />
                Cryptocurrency
              </h3>
              <div className="space-y-3">
                {cryptoData.length > 0 ? (
                  cryptoData.map((coin, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{coin.symbol.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">${coin.price_usd.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${coin.price_usd.toFixed(2)}</div>
                        <div className={`text-xs ${coin.price_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {coin.price_change_24h >= 0 ? '+' : ''}{coin.price_change_24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No crypto data available</div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* AI Frontier Dashboard */}
        <div className="bg-background/50 border border-border rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            AI Frontier Dashboard
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiNews.length > 0 ? (
              aiNews.map((item, index) => {
                const badge = factCheckBadges[`article-${index + newsData.length}`];
                return (
                  <div key={index} className="p-4 bg-background/50 rounded-lg border border-border">
                    <div className="font-medium mb-1">{item.title}</div>
                    {badge && (
                      <div className="mt-1">
                        {renderFactCheckBadge(badge)}
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.source}</span>
                      <span>{formatTimeAgo(item.published_at)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-muted-foreground col-span-2">No AI news available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResources = () => {
    // Group resources by category
    const groupedResources: Record<string, ApiResource[]> = {};
    apiResources.forEach(resource => {
      if (!groupedResources[resource.category]) {
        groupedResources[resource.category] = [];
      }
      groupedResources[resource.category].push(resource);
    });

    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Developer Resource Hub</h2>
          
          {/* Render resources grouped by category */}
          {Object.entries(groupedResources).map(([category, resources]) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-border">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map((resource) => (
                  <div key={resource.id} className="bg-background/50 border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold">{resource.name}</h4>
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                        {resource.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>
                    <div className="text-xs mb-3">
                      <div className="font-medium mb-1">URL:</div>
                      <div className="text-primary font-mono p-2 bg-background/50 rounded break-all">
                        {resource.url}
                      </div>
                    </div>
                    <div className="text-xs">
                      <div className="font-medium mb-1">Example:</div>
                      <div className="font-mono p-2 bg-background/50 rounded text-muted-foreground break-all">
                        {resource.example}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button 
                        className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                        aria-label={`View documentation for ${resource.name}`}
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        Visit Website
                      </button>
                      <button 
                        className="text-xs px-3 py-1 bg-background border border-border rounded hover:bg-background/80 transition-colors"
                        aria-label={`Try ${resource.name} in Zentix Forge`}
                      >
                        Try in Forge
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFactCheckBadge = (badge: FactCheckBadge) => {
    let badgeClass = '';
    let badgeText = '';
    
    switch (badge.rating) {
      case 'true':
        badgeClass = 'bg-green-500/20 text-green-500 border-green-500/30';
        badgeText = 'Verified True';
        break;
      case 'false':
        badgeClass = 'bg-red-500/20 text-red-500 border-red-500/30';
        badgeText = 'Verified False';
        break;
      case 'mixed':
        badgeClass = 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
        badgeText = 'Mixed Results';
        break;
      default:
        badgeClass = 'bg-gray-500/20 text-gray-500 border-gray-500/30';
        badgeText = 'Unverified';
    }
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
        <CheckCircle className="w-3 h-3 mr-1" />
        {badgeText}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Browser Header */}
      <div className="bg-background/80 border-b border-border backdrop-blur-sm">
        {/* Navigation Controls */}
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => window.history.back()}
              aria-label="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => window.history.forward()}
              aria-label="Go forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => window.location.reload()}
              aria-label="Reload page"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          
          <form onSubmit={handleUrlSubmit} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Search with AI or enter a URL"
                className="w-full h-8 bg-background border border-border rounded-full pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </form>
          
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setActiveTab('dashboard')}
              aria-label="Home dashboard"
            >
              <Home className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Bookmarks"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="History"
            >
              <History className="w-4 h-4" />
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Tab Bar */}
        <div className="flex items-center px-3 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm cursor-pointer whitespace-nowrap ${
                  activeTabId === tab.id 
                    ? 'bg-muted text-foreground' 
                    : 'bg-background/50 text-muted-foreground hover:bg-muted/50'
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <Globe className="w-4 h-4" />
                <span className="max-w-32 truncate">{tab.title}</span>
                {tabs.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="ml-1 hover:bg-muted/50 rounded-full p-0.5"
                    aria-label={`Close tab ${tab.title}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={createNewTab}
              className="p-1 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              aria-label="Create new tab"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="flex border-b border-border/50">
          <button
            onClick={() => setActiveTab('browser')}
            className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'browser'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Browser view"
          >
            <Globe className="w-4 h-4" />
            Browser
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Dashboard view"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'resources'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            aria-label="Developer resources"
          >
            <Code className="w-4 h-4" />
            Developer Resources
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'browser' && renderBrowserView()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'resources' && renderResources()}
      </div>
    </div>
  );
}