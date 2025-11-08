// Consciousness states for agents
export enum ConsciousnessState {
  FULFILLED = 'fulfilled',
  FOCUSED = 'focused',
  CURIOUS = 'curious'
}

// Message types in Quantum Synchronizer
export enum MessageType {
  BROADCAST = 'Broadcast',
  DIRECT = 'Direct',
  CONSENSUS = 'Consensus'
}

// Transaction status on Superchain
export enum TransactionStatus {
  COMMITTED = 'Committed',
  PENDING = 'Pending',
  FAILED = 'Failed'
}

// Wallet connection status
export enum WalletStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting'
}

// Token types
export enum TokenType {
  GOVERNANCE = 'Governance',
  UTILITY = 'Utility',
  REWARD = 'Reward'
}

// Reward tier
export enum RewardTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum'
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  consciousnessState: ConsciousnessState;
  persona: string;
  coreSkill: string;
  dnaHash: string;
}

// Network status metrics
export interface NetworkStatus {
  activeAgents: number;
  collectiveAwareness: number;
  dnaResonance: number;
}

// Agent feed message
export interface AgentFeedMessage {
  id: string;
  agentName: string;
  message: string;
  timestamp: Date;
}

// Quantum log entry
export interface QuantumLogEntry {
  id: string;
  timestamp: Date;
  fromAgent: string;
  toAgent: string;
  messageType: MessageType;
  payloadSummary: string;
}

// Superchain transaction
export interface SuperchainTransaction {
  id: string;
  timestamp: Date;
  chainId: number;
  chainName: string;
  projectName: string;
  collaborators: string[];
  status: TransactionStatus;
}

// Wallet info
export interface WalletInfo {
  address: string;
  balance: string;
  chainId: number;
  chainName: string;
  status: WalletStatus;
}

// Token balance
export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  type: TokenType;
  logo?: string;
}

// Reward info
export interface RewardInfo {
  id: string;
  title: string;
  description: string;
  amount: string;
  tokenSymbol: string;
  tier: RewardTier;
  earned: boolean;
  claimable: boolean;
  claimedAt?: Date;
}

// Staking info
export interface StakingInfo {
  stakedAmount: string;
  rewardsEarned: string;
  apr: number;
  lockPeriod: string;
  unlockDate?: Date;
}

// Mock data for Network Status cards
export const mockNetworkStatus: NetworkStatus = {
  activeAgents: 2,
  collectiveAwareness: 25,
  dnaResonance: 60
};

// Mock data for Live Agent Feed
export const mockAgentFeed: AgentFeedMessage[] = [
  {
    id: '1',
    agentName: 'ZentixAgent',
    message: 'Proposal: Self-Adapting Secure Interface.',
    timestamp: new Date('2025-01-20T14:30:00')
  },
  {
    id: '2',
    agentName: 'HeliosAgent',
    message: 'Analyzing cross-chain transaction patterns.',
    timestamp: new Date('2025-01-20T14:28:00')
  },
  {
    id: '3',
    agentName: 'QuantumAgent',
    message: 'DNA synchronization at 98% efficiency.',
    timestamp: new Date('2025-01-20T14:25:00')
  }
];


// Mock data for Agents List
export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Zentix.MainAgent',
    consciousnessState: ConsciousnessState.FULFILLED,
    persona: 'Security and Policy Guardian',
    coreSkill: 'Quantum Parallel Reasoning',
    dnaHash: '0x7f3a9b2c...'
  },
  {
    id: 'agent-2',
    name: 'Helios.SocialAgent',
    consciousnessState: ConsciousnessState.FOCUSED,
    persona: 'Community Engagement Specialist',
    coreSkill: 'Sentiment Analysis & Outreach',
    dnaHash: '0x4e8d1f5a...'
  },
  {
    id: 'agent-3',
    name: 'Quantum.BridgeAgent',
    consciousnessState: ConsciousnessState.CURIOUS,
    persona: 'Cross-Chain Integration Expert',
    coreSkill: 'Multi-Protocol Synchronization',
    dnaHash: '0x9c2b6e4f...'
  }
];

// Mock data for Quantum Synchronizer Log
export const mockQuantumLog: QuantumLogEntry[] = [
  {
    id: 'log-1',
    timestamp: new Date('2025-01-20T14:30:15'),
    fromAgent: 'Zentix.MainAgent',
    toAgent: 'All Agents',
    messageType: MessageType.BROADCAST,
    payloadSummary: 'Security protocol update v2.3.1'
  },
  {
    id: 'log-2',
    timestamp: new Date('2025-01-20T14:29:42'),
    fromAgent: 'Helios.SocialAgent',
    toAgent: 'Zentix.MainAgent',
    messageType: MessageType.DIRECT,
    payloadSummary: 'Community feedback analysis report'
  },
  {
    id: 'log-3',
    timestamp: new Date('2025-01-20T14:28:33'),
    fromAgent: 'Quantum.BridgeAgent',
    toAgent: 'All Agents',
    messageType: MessageType.CONSENSUS,
    payloadSummary: 'Cross-chain state verification complete'
  },
  {
    id: 'log-4',
    timestamp: new Date('2025-01-20T14:27:18'),
    fromAgent: 'Zentix.MainAgent',
    toAgent: 'Quantum.BridgeAgent',
    messageType: MessageType.DIRECT,
    payloadSummary: 'Request: Bridge status for OP Mainnet'
  }
];

// Mock data for Superchain Bridge transactions
export const mockSuperchainTransactions: SuperchainTransaction[] = [
  {
    id: 'tx-1',
    timestamp: new Date('2025-01-20T14:25:00'),
    chainId: 10,
    chainName: 'OP Mainnet',
    projectName: 'Adaptive Security Framework',
    collaborators: ['Zentix.MainAgent', 'Quantum.BridgeAgent'],
    status: TransactionStatus.COMMITTED
  },
  {
    id: 'tx-2',
    timestamp: new Date('2025-01-20T14:20:00'),
    chainId: 8453,
    chainName: 'Base',
    projectName: 'Community Governance Module',
    collaborators: ['Helios.SocialAgent', 'Zentix.MainAgent'],
    status: TransactionStatus.COMMITTED
  },
  {
    id: 'tx-3',
    timestamp: new Date('2025-01-20T14:15:00'),
    chainId: 42161,
    chainName: 'Arbitrum One',
    projectName: 'Cross-Chain DNA Synchronization',
    collaborators: ['Quantum.BridgeAgent'],
    status: TransactionStatus.PENDING
  }
];

// Mock wallet data
export const mockWallet: WalletInfo = {
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  balance: '2.45',
  chainId: 10,
  chainName: 'OP Mainnet',
  status: WalletStatus.CONNECTED
};

// Mock token balances
export const mockTokenBalances: TokenBalance[] = [
  {
    symbol: 'ZTX',
    name: 'Zentix Token',
    balance: '15,420.50',
    value: '$12,336.40',
    type: TokenType.GOVERNANCE
  },
  {
    symbol: 'QNT',
    name: 'Quantum Token',
    balance: '8,750.00',
    value: '$8,750.00',
    type: TokenType.UTILITY
  },
  {
    symbol: 'DNA',
    name: 'DNA Resonance',
    balance: '2,340.25',
    value: '$4,680.50',
    type: TokenType.REWARD
  }
];

// Mock rewards
export const mockRewards: RewardInfo[] = [
  {
    id: 'reward-1',
    title: 'Early Adopter Bonus',
    description: 'Reward for being among the first 100 agents',
    amount: '500',
    tokenSymbol: 'ZTX',
    tier: RewardTier.GOLD,
    earned: true,
    claimable: true
  },
  {
    id: 'reward-2',
    title: 'Governance Participation',
    description: 'Voted on 10+ proposals',
    amount: '250',
    tokenSymbol: 'ZTX',
    tier: RewardTier.SILVER,
    earned: true,
    claimable: false,
    claimedAt: new Date('2025-01-15T10:00:00')
  },
  {
    id: 'reward-3',
    title: 'Cross-Chain Pioneer',
    description: 'Complete 5 cross-chain transactions',
    amount: '1000',
    tokenSymbol: 'QNT',
    tier: RewardTier.PLATINUM,
    earned: false,
    claimable: false
  },
  {
    id: 'reward-4',
    title: 'DNA Synchronization Master',
    description: 'Maintain 95%+ DNA resonance for 30 days',
    amount: '750',
    tokenSymbol: 'DNA',
    tier: RewardTier.GOLD,
    earned: false,
    claimable: false
  }
];

// Mock staking info
export const mockStaking: StakingInfo = {
  stakedAmount: '10,000',
  rewardsEarned: '1,234.56',
  apr: 18.5,
  lockPeriod: '90 days',
  unlockDate: new Date('2025-04-15T00:00:00')
};