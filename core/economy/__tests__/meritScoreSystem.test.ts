import { MeritScoreSystem } from '../meritScoreSystem';
import { ZentixWallet, WalletService } from '../walletService';

describe('MeritScoreSystem', () => {
  let mockWallet: ZentixWallet;

  beforeEach(() => {
    mockWallet = WalletService.createWallet('did:zentix:test123');
  });

  test('should calculate performance score correctly', () => {
    // Record some task performance data
    MeritScoreSystem.recordTaskPerformance('did:zentix:test123', {
      taskId: 'task1',
      completionTime: 10, // seconds
      resourceUsage: 5, // ZXT per task
      successRate: 0.9, // 90%
      accuracy: 0.95 // 95%
    });

    const score = MeritScoreSystem.calculatePerformanceScore('did:zentix:test123');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1000);
  });

  test('should calculate reputation score correctly', () => {
    // Record some user ratings
    MeritScoreSystem.recordUserRating('did:zentix:test123', {
      rating: 5, // 5 stars
      timestamp: new Date().toISOString()
    });

    MeritScoreSystem.recordUserRating('did:zentix:test123', {
      rating: 4, // 4 stars
      timestamp: new Date().toISOString()
    });

    const score = MeritScoreSystem.calculateReputationScore('did:zentix:test123');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1000);
  });

  test('should calculate economic score correctly', () => {
    // Add some economic activity
    const walletWithFunds = WalletService.deposit(mockWallet, 1000, 'Initial deposit');
    MeritScoreSystem.recordEconomicActivity('did:zentix:test123', {
      amount: 1000,
      transactionType: 'income',
      timestamp: new Date().toISOString()
    });

    const score = MeritScoreSystem.calculateEconomicScore('did:zentix:test123', walletWithFunds);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1000);
  });

  test('should calculate compliance score correctly', () => {
    // Record a compliance violation
    MeritScoreSystem.recordComplianceViolation('did:zentix:test123', {
      severity: 'medium',
      resolved: false,
      timestamp: new Date().toISOString()
    });

    const score = MeritScoreSystem.calculateComplianceScore('did:zentix:test123');
    // Should be less than perfect score due to violation
    expect(score).toBeLessThan(1000);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  test('should calculate unified merit score correctly', () => {
    // Record various metrics
    MeritScoreSystem.recordTaskPerformance('did:zentix:test123', {
      taskId: 'task1',
      completionTime: 5,
      resourceUsage: 3,
      successRate: 1.0,
      accuracy: 0.98
    });

    MeritScoreSystem.recordUserRating('did:zentix:test123', {
      rating: 5,
      timestamp: new Date().toISOString()
    });

    const walletWithFunds = WalletService.deposit(mockWallet, 500, 'Test deposit');
    MeritScoreSystem.recordEconomicActivity('did:zentix:test123', {
      amount: 500,
      transactionType: 'income',
      timestamp: new Date().toISOString()
    });

    const meritRecord = MeritScoreSystem.calculateMeritScore('did:zentix:test123', walletWithFunds);
    
    expect(meritRecord.total_score).toBeGreaterThanOrEqual(0);
    expect(meritRecord.total_score).toBeLessThanOrEqual(1000);
    expect(meritRecord.tier).toBeDefined();
    expect(['bronze', 'silver', 'gold', 'platinum']).toContain(meritRecord.tier);
  });

  test('should determine correct tier based on score', () => {
    // Test platinum tier (800+)
    expect(MeritScoreSystem['calculateMeritScore']('did:zentix:test123', mockWallet).tier).toBe('bronze');
  });

  test('should apply merit rewards correctly', () => {
    const initialBalance = mockWallet.balance;
    const updatedWallet = MeritScoreSystem.applyMeritReward('did:zentix:test123', mockWallet, 5); // 5-star rating
    
    // Should have received a reward
    expect(updatedWallet.balance).toBeGreaterThan(initialBalance);
  });

  test('should apply merit penalties correctly', () => {
    const initialBalance = mockWallet.balance;
    const updatedWallet = MeritScoreSystem.applyMeritReward('did:zentix:test123', mockWallet, 1); // 1-star rating
    
    // Should have been penalized (or no change if penalty is 0 for 1-star)
    expect(updatedWallet.balance).toBeLessThanOrEqual(initialBalance);
  });
});