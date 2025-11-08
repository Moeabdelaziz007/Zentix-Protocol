/**
 * DeFi Module - Exports
 * Flash loans, strategies, and liquidity management
 * 
 * @module core/defi
 * @version 1.0.0
 */

export {
  FlashLoanService,
  type FlashLoanRequest,
  type FlashLoanResult,
  type ArbitrageOpportunity,
} from './flashLoanService';

export {
  DeFiStrategyEngine,
  type StrategyConfig,
  type StrategyPosition,
  type StrategyMetrics,
  type StrategyType,
} from './defiStrategyEngine';

export {
  LiquidityManager,
  type LiquidityPool,
  type LiquidityPosition,
  type RebalanceRecommendation,
} from './liquidityManager';