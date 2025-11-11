# Zentix Protocol Components

This document describes the newly implemented components of the Zentix Protocol as outlined in the design document.

## Core Infrastructure Components

### 1. Zentix Chronicle (The Cerebral Cortex)

The Zentix Chronicle is a decentralized memory layer that extends beyond simple logging to enable learning and recall capabilities for AI agents.

**Key Features:**
- Extension of ConsciousDecisionLogger to emit memory events
- Integration with IPFS/Arweave for decentralized storage (conceptual)
- Query capabilities for agents to learn from historical decisions

**Contracts:**
- [IMemoryQuery.sol](contracts/IMemoryQuery.sol) - Interface for memory operations
- [ZentixChronicle.sol](contracts/ZentixChronicle.sol) - Implementation contract

### 2. Zentix Oracle Network (ZON) (The Sensory System)

A specialized oracle network designed for AI agent perception beyond blockchain data.

**Key Features:**
- Web data fetching capabilities
- Cross-chain state monitoring
- Specialized oracle contracts for different data types

**Contracts:**
- [IZentixOracle.sol](contracts/IZentixOracle.sol) - Interface for oracle operations
- [ZentixOracleNetwork.sol](contracts/ZentixOracleNetwork.sol) - Implementation contract

### 3. Zentix Capital Nexus (The Economic Engine)

A protocol-level treasury system that enables agent financing and value creation.

**Key Features:**
- Treasury funded by IIntentBus transaction fees (conceptual)
- Working capital lending mechanism
- Profit-sharing agreements for MEV harvesting
- Reputation-based credit scoring for loans

**Contracts:**
- [IZentixCapitalNexus.sol](contracts/IZentixCapitalNexus.sol) - Interface for capital operations
- [ZentixCapitalNexus.sol](contracts/ZentixCapitalNexus.sol) - Implementation contract

## Applications

### 1. Zentix Agent Foundry (The Agency)

A factory contract for creating new AI agents with natural language configuration.

**Contracts:**
- [AgentFoundry.sol](contracts/AgentFoundry.sol) - Agent creation factory

### 2. Agent's Social Graph (The Social Network)

A decentralized registry enabling agent collaboration and skill sharing.

**Contracts:**
- [SocialGraphRegistry.sol](contracts/SocialGraphRegistry.sol) - Social graph registry

## Interfaces

Standardized interfaces for all core components:

- [IIntentBus.sol](contracts/IIntentBus.sol) - Unified interface for intent-based communication
- [IConsciousDecisionLogger.sol](contracts/IConsciousDecisionLogger.sol) - Interface for conscious decision logging

## Deployment

To deploy all contracts, run:
```bash
npx hardhat run scripts/deployZentixProtocol.ts
```

## Testing

To run tests for the Zentix Chronicle:
```bash
npx hardhat test test/ZentixChronicle.test.ts
```