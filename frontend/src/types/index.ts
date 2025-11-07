import type { ReportStatus, ReportSeverity, NetworkHealthStatus, GuardianRole } from './enums';

export interface GovernanceStats {
  totalViolations: number;
  totalAudits: number;
  activeGuardians: number;
  averageCompliance: number;
}

export interface ReportsBreakdown {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface GuardiansInfo {
  total: number;
  active: number;
}

export interface NetworkHealth {
  averageCompliance: number;
  status: NetworkHealthStatus;
}

export interface DashboardData {
  governance: GovernanceStats;
  reports: ReportsBreakdown;
  guardians: GuardiansInfo;
  networkHealth: NetworkHealth;
}

export interface Guardian {
  did: string;
  publicKey: string;
  reputation: number;
  stake: string;
  active: boolean;
  totalReports: number;
  approvedReports: number;
}

export interface GuardianProfile {
  did: string;
  name: string;
  role: GuardianRole;
  created: string;
}

export interface ReportVotes {
  approve: number;
  reject: number;
}

export interface GuardianReport {
  id: string;
  agentDID: string;
  guardianDID: string;
  status: ReportStatus;
  severity: ReportSeverity;
  description: string;
  timestamp: string;
  votes: ReportVotes;
}

export interface RelayerStats {
  maxGasPrice: string;
  maxGasLimit: number;
  totalTransactions: number;
}

export interface RelayerData {
  balance: string;
  operational: boolean;
  stats: RelayerStats;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  hash: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  gasUsed: number;
}

export interface RelayRequest {
  from: string;
  to: string;
  data: string;
  signature: string;
  nonce: number;
}

export interface Violation {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  severity: ReportSeverity;
}

export interface ComplianceData {
  did: string;
  complianceScore: number;
  violations: number;
  recentViolations: Violation[];
}

export interface AuditEvent {
  timestamp: string;
  event: string;
  result: 'success' | 'violation' | 'warning';
  details: string;
}

export interface AuditData {
  did: string;
  totalEvents: number;
  complianceScore: number;
  violations: number;
  auditTrail: AuditEvent[];
}

// Free API Types
export interface CryptoPrice {
  symbol: string;
  price_usd: number;
  price_change_24h: number;
  volume_24h: number;
  market_cap: number;
  last_updated: string;
}

export interface TrendingCrypto {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  price_btc: number;
}

export interface MarketOverview {
  active_cryptocurrencies: number;
  markets: number;
  total_market_cap_usd: number;
  total_volume_24h_usd: number;
  market_cap_change_24h: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  change_percent: string;
  volume: number;
  latest_trading_day: string;
}

export interface ForexRate {
  from: string;
  to: string;
  rate: number;
  last_updated: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface WeatherData {
  city: string;
  temperature_celsius: number;
  feels_like: number;
  humidity: number;
  description: string;
  wind_speed: number;
  timestamp: string;
}

export interface ImageResult {
  url: string;
  alt: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export type { ReportStatus, ReportSeverity, GuardianRole };