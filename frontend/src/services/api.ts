import type {
  DashboardData,
  Guardian,
  GuardianReport,
  RelayerData,
  RelayRequest,
  ComplianceData,
  AuditData,
  CryptoPrice,
  TrendingCrypto,
  MarketOverview,
  StockQuote,
  ForexRate,
  NewsArticle,
  WeatherData,
  ImageResult,
  TranslationResult,
  DictionaryEntry
} from '../types';

// Referral Agent Types
interface ReferralStats {
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  total_rewards_earned: number;
  tier_breakdown: Record<string, number>;
  conversion_rate: number;
  current_balance: number;
}

interface ReferralInvite {
  code: string;
  link: string;
  qr_code: string;
}

interface LeaderboardEntry {
  rank: number;
  user_did: string;
  total_referrals: number;
  total_rewards: number;
  badge: string;
}

// Travel Agent Types
interface FlightSearchResult {
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
}

interface PlaceSearchResult {
  place_id: string;
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface GooglePlaceSearchResult {
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
}

// Google API Types
interface ToxicityAnalysis {
  [key: string]: number;
}

// Coding Intelligence Types
interface CodeAnalysisResult {
  issues: Array<{
    type: 'performance' | 'security' | 'maintainability' | 'bug';
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: { line: number; column: number };
    description: string;
    suggestion: string;
    codeExample?: string;
  }>;
  score: number;
  summary: string;
  contextAwareSuggestions: string[];
}

interface CodeAnalysisContext {
  projectName?: string;
  filePath?: string;
  dependencies?: string[];
  framework?: string;
}

interface CodeGenerationContext {
  projectName?: string;
  filePath?: string;
  language?: string;
  framework?: string;
  existingCode?: string;
  dependencies?: string[];
  codingStandards?: string[];
}

interface CodeGenerationResult {
  code: string;
  language: string;
  explanation: string;
  confidence: number;
  suggestions: string[];
}

interface FactCheckResult {
  text: string;
  claimReview: Array<{
    publisher: {
      name: string;
      site: string;
    };
    url: string;
    title: string;
    reviewDate: string;
    textualRating: string;
    languageCode: string;
  }>;
}

// New interfaces for specialized document analysis
interface FinancialMetric {
  name: string;
  value: number;
  benchmark?: number;
  interpretation: string;
}

interface FinancialAnalysisResult {
  metrics: FinancialMetric[];
  risks: string[];
  opportunities: string[];
  summary: string;
  keyMetrics: Array<{
    name: string;
    value: string;
    trend: string;
  }>;
  recommendations: string[];
}

interface LegalClause {
  name: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'needs-review';
}

interface LegalContractReviewResult {
  issues: Array<{
    clause: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  summary: string;
  complianceScore: number;
  keyClauses: LegalClause[];
  risks: string[];
  suggestions: string[];
}

interface MedicalAnalysisResult {
  findings: Array<{
    condition: string;
    confidence: number;
    evidence: string;
  }>;
  recommendations: string[];
  summary: string;
}

interface ScientificAnalysisResult {
  key_points: string[];
  methodology: string;
  findings: string;
  implications: string;
  confidence: number;
}

interface MarketAnalysisResult {
  insights: Array<{
    category: string;
    finding: string;
    confidence: number;
  }>;
  recommendations: string[];
  summary: string;
}

interface RemoteCommandResult {
  success: boolean;
  actionSequence: Array<{
    type: 'click' | 'type' | 'navigate' | 'wait' | 'screenshot';
    target?: string;
    content?: string;
    duration?: number;
    result?: string;
  }>;
  finalState: string;
  sessionId: string;
  confidence: number;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: number;
  likeCount: number;
  duration: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private async fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  }

  async getDashboardData(): Promise<DashboardData> {
    return this.fetchJSON<DashboardData>('/api/dashboard');
  }

  async getGuardians(): Promise<Guardian[]> {
    const response = await this.fetchJSON<{ total: number; guardians: Guardian[] }>('/api/guardians');
    return response.guardians;
  }

  async getGuardianReports(filters?: { status?: string; severity?: string }): Promise<GuardianReport[]> {
    const params = new URLSearchParams(filters as Record<string, string>);
    const response = await this.fetchJSON<{ total: number; reports: GuardianReport[] }>(
      `/api/guardians/reports?${params}`
    );
    return response.reports;
  }

  async voteOnReport(reportId: string, guardianDID: string, approve: boolean): Promise<GuardianReport> {
    return this.fetchJSON<GuardianReport>(`/api/guardians/reports/${reportId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ guardianDID, approve }),
    });
  }

  async getRelayerHealth(): Promise<{ status: string; balance: string; operational: boolean }> {
    return this.fetchJSON('/health');
  }

  async getRelayerStats(): Promise<RelayerData> {
    return this.fetchJSON<RelayerData>('/stats');
  }

  async getNonce(address: string): Promise<{ address: string; nonce: number }> {
    return this.fetchJSON(`/nonce/${address}`);
  }

  async relayTransaction(request: RelayRequest): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    return this.fetchJSON('/relay', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getComplianceScore(did: string): Promise<ComplianceData> {
    return this.fetchJSON<ComplianceData>(`/api/compliance/${did}`);
  }

  async exportAudit(did: string): Promise<AuditData> {
    return this.fetchJSON<AuditData>(`/api/compliance/audit/export?did=${did}`);
  }

  // Referral Agent API Methods
  async getReferralPoints(did: string): Promise<{ points: number; stats: ReferralStats }> {
    return this.fetchJSON(`/api/referral-agent/points/${did}`);
  }

  async generateInviteLink(userDID: string): Promise<ReferralInvite> {
    return this.fetchJSON('/api/referral-agent/invite-link', {
      method: 'POST',
      body: JSON.stringify({ userDID }),
    });
  }

  async getReferralLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return this.fetchJSON(`/api/referral-agent/leaderboard?limit=${limit}`);
  }

  async sendInvites(userDID: string, emails: string[]): Promise<{ total: number; sent: number; results: Array<{ email: string; sent: boolean; referral_id: string }> }> {
    return this.fetchJSON('/api/referral-agent/send-invites', {
      method: 'POST',
      body: JSON.stringify({ userDID, emails }),
    });
  }

  async trackReferral(userDID: string, referredDID: string, referredEmail?: string, tier?: string) {
    return this.fetchJSON('/api/referral-agent/track', {
      method: 'POST',
      body: JSON.stringify({ userDID, referredDID, referredEmail, tier }),
    });
  }

  // Travel Agent API Methods
  async searchFlights(params: {
    fly_from: string;
    fly_to: string;
    date_from: string;
    date_to: string;
    adults?: number;
    children?: number;
    infants?: number;
  }): Promise<FlightSearchResult[]> {
    return this.fetchJSON('/api/luna/flights/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async searchPlaces(query: string, limit?: number): Promise<PlaceSearchResult[]> {
    const params = new URLSearchParams({ query, ...(limit && { limit: limit.toString() }) });
    return this.fetchJSON(`/api/luna/places/search?${params}`);
  }

  async searchGooglePlaces(query: string, limit?: number): Promise<GooglePlaceSearchResult[]> {
    const params = new URLSearchParams({ query, ...(limit && { limit: limit.toString() }) });
    return this.fetchJSON(`/api/luna/places/google-search?${params}`);
  }

  // Add new method for generating AI itinerary
  async generateAiItinerary(destination: string, preferences: string): Promise<ItineraryItem[]> {
    return this.fetchJSON('/api/luna/itinerary/generate', {
      method: 'POST',
      body: JSON.stringify({ destination, preferences }),
    });
  }

  // Add new method for searching hotels
  async searchHotels(params: {
    city: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  }): Promise<any[]> {
    return this.fetchJSON('/api/luna/hotels/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Add new method for searching activities
  async searchActivities(params: {
    location: string;
    interests: string[];
    startDate: string;
    endDate: string;
  }): Promise<any[]> {
    return this.fetchJSON('/api/luna/activities/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Google Perspective API Methods
  async analyzeToxicity(text: string, attributes: string[] = ['TOXICITY']): Promise<ToxicityAnalysis> {
    return this.fetchJSON('/api/moderation/toxicity', {
      method: 'POST',
      body: JSON.stringify({ text, attributes }),
    });
  }

  async checkToxicity(text: string, threshold: number = 0.7): Promise<{ isToxic: boolean; text: string }> {
    return this.fetchJSON('/api/moderation/check-toxicity', {
      method: 'POST',
      body: JSON.stringify({ text, threshold }),
    });
  }

  // Google Fact Check API Methods
  async searchFactChecks(query: string, languageCode: string = 'en-US', maxResults: number = 10): Promise<FactCheckResult[]> {
    const params = new URLSearchParams({ query, languageCode, maxResults: maxResults.toString() });
    return this.fetchJSON(`/api/factcheck/search?${params}`);
  }

  async verifyClaim(claim: string): Promise<Array<{
    publisher: {
      name: string;
      site: string;
    };
    url: string;
    title: string;
    reviewDate: string;
    textualRating: string;
    languageCode: string;
  }> | null> {
    const params = new URLSearchParams({ claim });
    return this.fetchJSON(`/api/factcheck/verify?${params}`);
  }

  // YouTube Data API Methods
  async searchYouTubeVideos(query: string, maxResults: number = 10, type: string = 'video'): Promise<YouTubeVideo[]> {
    const params = new URLSearchParams({ query, maxResults: maxResults.toString(), type });
    return this.fetchJSON(`/api/youtube/search?${params}`);
  }

  async getTopYouTubeVideos(topic: string, maxResults: number = 5): Promise<YouTubeVideo[]> {
    const params = new URLSearchParams({ topic, maxResults: maxResults.toString() });
    return this.fetchJSON(`/api/youtube/top-videos?${params}`);
  }

  async getYouTubeVideoById(videoId: string): Promise<YouTubeVideo> {
    return this.fetchJSON(`/api/youtube/video/${videoId}`);
  }

  // Free Crypto APIs
  async getCryptoPrices(symbols: string[]): Promise<CryptoPrice[]> {
    const symbolParam = symbols.join(',');
    return this.fetchJSON(`/api/crypto/prices?symbols=${symbolParam}`);
  }

  async getTrendingCrypto(): Promise<TrendingCrypto[]> {
    return this.fetchJSON('/api/crypto/trending');
  }

  async getMarketOverview(): Promise<MarketOverview> {
    return this.fetchJSON('/api/crypto/market');
  }

  // Free Stock APIs
  async getStockQuote(symbol: string): Promise<StockQuote> {
    return this.fetchJSON(`/api/stock/quote?symbol=${symbol}`);
  }

  async getForexRate(from: string, to: string): Promise<ForexRate> {
    return this.fetchJSON(`/api/forex/rate?from=${from}&to=${to}`);
  }

  // Free News APIs
  async getNewsHeadlines(topic: string, limit: number = 10): Promise<NewsArticle[]> {
    return this.fetchJSON(`/api/news/headlines/${topic}?limit=${limit}`);
  }

  // Free Weather APIs
  async getWeather(city: string): Promise<WeatherData> {
    return this.fetchJSON(`/api/weather/${city}`);
  }

  // Free Image APIs
  async searchImages(query: string, count: number = 10): Promise<ImageResult[]> {
    return this.fetchJSON(`/api/images/search?query=${encodeURIComponent(query)}&count=${count}`);
  }

  // Free Translation APIs
  async translateText(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    return this.fetchJSON('/api/translate', {
      method: 'POST',
      body: JSON.stringify({ text, sourceLang, targetLang }),
    });
  }

  // Free Dictionary APIs
  async getDictionaryEntry(word: string, language: string = 'en'): Promise<DictionaryEntry> {
    return this.fetchJSON(`/api/dictionary/${word}?language=${language}`);
  }

  // Coding Intelligence API Methods
  async analyzeCode(code: string, language: string, context?: CodeAnalysisContext): Promise<CodeAnalysisResult> {
    return this.fetchJSON('/api/ai/coding/analyze', {
      method: 'POST',
      body: JSON.stringify({ code, language, context }),
    });
  }

  async generateCode(prompt: string, context?: CodeGenerationContext): Promise<CodeGenerationResult> {
    return this.fetchJSON('/api/ai/coding/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, context }),
    });
  }

  async executeRemoteCommand(command: string, sessionId?: string): Promise<RemoteCommandResult> {
    return this.fetchJSON('/api/ai/remote-control/execute', {
      method: 'POST',
      body: JSON.stringify({ command, sessionId }),
    });
  }

  // Specialized Document Analysis Methods
  async analyzeFinancialDocument(document: string): Promise<FinancialAnalysisResult> {
    return this.fetchJSON('/api/ai/ztools/financial', {
      method: 'POST',
      body: JSON.stringify({ document }),
    });
  }

  async reviewLegalContract(contract: string): Promise<LegalContractReviewResult> {
    return this.fetchJSON('/api/ai/ztools/legal', {
      method: 'POST',
      body: JSON.stringify({ contract }),
    });
  }

  async analyzeMedicalDocument(document: string): Promise<MedicalAnalysisResult> {
    return this.fetchJSON('/api/ai/ztools/medical', {
      method: 'POST',
      body: JSON.stringify({ document }),
    });
  }

  async analyzeScientificPaper(paper: string): Promise<ScientificAnalysisResult> {
    return this.fetchJSON('/api/ai/ztools/scientific', {
      method: 'POST',
      body: JSON.stringify({ paper }),
    });
  }

  async analyzeMarketResearch(data: string): Promise<MarketAnalysisResult> {
    return this.fetchJSON('/api/ai/ztools/market', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }
}

export const apiService = new ApiService();
export type { 
  ReferralStats, 
  ReferralInvite, 
  LeaderboardEntry,
  FlightSearchResult,
  PlaceSearchResult,
  GooglePlaceSearchResult,
  CryptoPrice,
  TrendingCrypto,
  MarketOverview,
  StockQuote,
  ForexRate,
  NewsArticle,
  WeatherData,
  ImageResult,
  TranslationResult,
  DictionaryEntry,
  ToxicityAnalysis,
  FactCheckResult,
  YouTubeVideo,
  CodeAnalysisResult,
  CodeGenerationResult,
  CodeAnalysisContext,
  CodeGenerationContext,
  FinancialAnalysisResult,
  LegalContractReviewResult,
  MedicalAnalysisResult,
  ScientificAnalysisResult,
  MarketAnalysisResult,
  RemoteCommandResult
};