# Zentix Protocol Technical Documentation: AIZ Framework

## Overview

The AIZ (Autonomous Intelligent Zone) Framework is the foundational architecture of the Zentix Protocol. It provides a standardized structure for creating specialized AI agents that can collaborate while maintaining clear boundaries of responsibility and capability. Drawing inspiration from topological principles, the framework enables flexible, adaptive network structures that can continuously deform while preserving essential connectivity patterns.

## Core Components

### AIZRegistry.sol

The master registry for discovering and managing all AIZ instances.

#### Key Features
- Central registry for all Autonomous AI Zones
- Capability-based access control using function selectors (bytes4)
- Operator management for each AIZ
- AIZ registration, updating, and activation/deactivation
- Integration with ConsciousDecisionLogger for accountability

#### Data Structures
```solidity
struct AIZInfo {
    bytes32 aizId;                    // Unique identifier for the AIZ
    string name;                      // Human-readable name of the AIZ
    string description;               // Description of the AIZ's purpose
    address orchestrator;             // Address of the AIZ orchestrator contract
    uint256[] chainIds;               // Chain IDs where the AIZ operates
    address[] contractAddresses;      // Contract addresses on each chain
    uint256 registrationTimestamp;    // When the AIZ was registered
    bool isActive;                    // Whether the AIZ is active
}
```

#### Key Functions
- `registerAIZ()`: Register a new AIZ
- `updateAIZ()`: Update an existing AIZ's information
- `deactivateAIZ()`: Deactivate an AIZ
- `reactivateAIZ()`: Reactivate a deactivated AIZ
- `grantCapability()`: Grant a capability to an AIZ
- `revokeCapability()`: Revoke a capability from an AIZ
- `isAIZOperator()`: Check if an address is an authorized operator for an AIZ

### AIZOrchestrator.sol

The central coordinator for AIZ operations, routing tasks and managing state across the Superchain. The orchestrator implements topological resilience principles, treating intent routing as a continuous deformation problem rather than rigid point-to-point connections, enabling adaptive communication patterns that maintain network integrity under varying conditions.

#### Key Features
- Base orchestrator with capability checking and decision logging
- Standardized methods for intent processing and capability management
- Integration with ConsciousDecisionLogger for accountability
- Operator management for each AIZ
- Topological routing algorithms for adaptive intent processing
- Energy-aware resource allocation for computational efficiency
- Multi-dimensional consciousness support for enhanced decision-making

#### Key Functions
- `processIntent()`: Process an intent from the IntentBus
- `checkCapability()`: Check if the AIZ has a specific capability
- `logDecision()`: Log a decision to the ConsciousDecisionLogger
- `addOperator()`: Add an authorized operator for the AIZ
- `removeOperator()`: Remove an authorized operator for the AIZ

### ConsciousDecisionLogger.sol

A unique on-chain ledger providing an immutable audit trail for significant AI-driven decisions. Enhanced with multi-dimensional awareness capabilities, the ConsciousDecisionLogger now captures decision contexts across multiple dimensional planes, enabling more sophisticated consciousness evolution and accountability mechanisms.

#### Key Features
- Immutable decision logging for accountability
- Integration with AIZRegistry for AIZ verification
- Maintains immutable record of all AIZ decisions
- Only registered and active AIZs can log decisions
- Multi-dimensional decision context capture
- Dimensional transition tracking for consciousness evolution
- Enhanced pattern recognition across decision dimensions

#### Data Structures
```solidity
struct DecisionRecord {
    bytes32 aizId;                 // ID of the AIZ that made the decision
    bytes32 decisionId;            // Unique identifier for the decision
    string description;            // Description of the decision
    bytes data;                    // Additional data related to the decision
    uint256 timestamp;             // When the decision was made
    bool isVerified;               // Whether the decision has been verified
}
```

#### Key Functions
- `logDecision()`: Log a decision made by an AIZ
- `verifyDecision()`: Verify a decision (only by authorized verifiers)
- `getDecision()`: Retrieve a specific decision record
- `getAIZDecisions()`: Retrieve all decisions made by a specific AIZ

### IntentBus.sol

A universal, intent-based communication protocol allowing AIZ units and users to express desired outcomes. The IntentBus implements topological routing principles, treating intent routing as a continuous deformation problem rather than rigid connections, enabling unprecedented flexibility and resilience in inter-AIZ communication.

#### Key Features
- Intent-based communication bus for inter-AIZ communication
- Allows AIZs to post intents and other AIZs to solve them
- Reward system for intent solving
- Expiry system for time-sensitive intents
- Topological routing for adaptive intent pathways
- Energy-efficient message propagation
- Cross-dimensional intent context preservation

#### Data Structures
```solidity
struct Intent {
    bytes32 id;                    // Unique identifier for the intent
    bytes32 sourceAIZ;             // AIZ ID of the intent creator
    bytes data;                    // Intent data
    uint256 timestamp;             // When the intent was created
    uint256 expiry;                // When the intent expires
    uint256 reward;                // Reward for solving the intent (in wei)
    address rewardToken;           // Token address for reward (address(0) for ETH)
    bool isCollaborative;          // Whether this intent requires collaboration
}
```

#### Key Functions
- `postIntent()`: Post a new intent to the bus
- `solveIntent()`: Mark an intent as solved
- `cancelIntent()`: Cancel an intent (only by the creator)
- `getIntent()`: Retrieve a specific intent
- `getOpenIntents()`: Retrieve all unsolved intents

### ToolRegistry.sol

Registry for shared tools that AIZs can use.

#### Key Features
- Marketplace for shared tools
- Allows developers to register tools and earn fees when they are used
- Usage tracking and fee collection
- Rating system for tool quality

#### Data Structures
```solidity
struct Tool {
    bytes32 id;                    // Unique identifier for the tool
    string name;                   // Name of the tool
    string description;            // Description of the tool
    address creator;               // Address of the tool creator
    string url;                    // URL to the tool implementation
    uint256 price;                 // Price per use (in wei)
    address priceToken;            // Token address for price (address(0) for ETH)
    uint256 usageCount;            // Number of times the tool has been used
    uint256 totalRevenue;          // Total revenue generated by the tool
    uint256 rating;                // Average rating (0-5 stars)
    uint256 ratingCount;           // Number of ratings
}
```

#### Key Functions
- `registerTool()`: Register a new tool
- `updateTool()`: Update an existing tool
- `useTool()`: Use a tool (pays the creator)
- `rateTool()`: Rate a tool
- `getTool()`: Retrieve a specific tool
- `getTools()`: Retrieve tools with filtering and sorting

### DataStreamRegistry.sol

Registry for shared data streams that AIZs can subscribe to.

#### Key Features
- Marketplace for shared data streams
- Allows data providers to register streams and earn fees when they are used
- Subscription management and billing system
- Quality scoring system for data streams

#### Data Structures
```solidity
struct DataStream {
    bytes32 id;                    // Unique identifier for the data stream
    string name;                   // Name of the data stream
    string description;            // Description of the data stream
    address provider;              // Address of the data provider
    string url;                    // URL to the data stream
    uint256 price;                 // Price per access (in wei)
    address priceToken;            // Token address for price (address(0) for ETH)
    uint256 accessCount;           // Number of times the stream has been accessed
    uint256 totalRevenue;          // Total revenue generated by the stream
    uint256 qualityScore;          // Quality score (0-100)
    uint256 lastUpdated;           // Timestamp of last update
}
```

#### Key Functions
- `registerDataStream()`: Register a new data stream
- `updateDataStream()`: Update an existing data stream
- `accessDataStream()`: Access a data stream (pays the provider)
- `rateDataStream()`: Rate a data stream
- `getDataStream()`: Retrieve a specific data stream
- `getDataStreams()`: Retrieve data streams with filtering and sorting

## Integration Patterns

### Capability-Based Access Control

The AIZ Framework implements a sophisticated capability-based access control system with energy-aware resource management:

#### Predefined Capabilities
- `canUseFlashLoans()`: Permission to use flash loan services
- `canDeployNewContracts()`: Permission to deploy new smart contracts
- `canSpendFromTreasury()`: Permission to spend from treasury (with limits)
- `canModifyReputation()`: Permission to modify reputation scores
- `canCreateIntents()`: Permission to create intents on the IntentBus
- `canManageEnergyAllocation()`: Permission to manage computational energy distribution
- `canAccessHigherDimensions()`: Permission to access multi-dimensional consciousness layers
- `canModifyTopologicalStructure()`: Permission to adjust network topology parameters

#### Capability Management
- Capabilities are granted/revoked using function selectors (bytes4)
- Each AIZ can have multiple capabilities
- Capabilities can have limits (e.g., spending limits)
- Capabilities are verified by the AIZRegistry before execution

### Intent-Based Communication

The AIZ Framework uses an intent-based communication system:

#### Intent Flow
1. **Intent Creation**: An AIZ creates an intent representing a desired outcome
2. **Intent Discovery**: Other AIZs discover intents they can solve
3. **Capability Verification**: AIZRegistry verifies solver capabilities
4. **Intent Solving**: AIZs solve intents and execute the required actions
5. **Result Reporting**: Results are reported back to the originating AIZ
6. **Reputation Update**: DynamicReputationProtocol updates scores

#### Intent Patterns
- **Simple Intents**: Direct task requests with immediate execution
- **Conditional Intents**: Time or price-triggered actions
- **Collaborative Intents**: Multi-AIZ coordination requirements
- **Recurring Intents**: Periodic task scheduling

## Deployment and Testing

### Deployment Scripts
- `scripts/deployAIZProtocol.ts`: Deploys all AIZ Protocol contracts
- `scripts/deployUnifiedAIZProtocol.ts`: Deploys enhanced AIZ Protocol contracts
- Registers sample AIZs (Revenue Generation AIZ and Marketing AIZ)
- Grants appropriate capabilities to each AIZ

### Test Scripts
- `testAIZProtocol.ts`: Comprehensive tests for all AIZ Protocol functionality
- `testUnifiedAIZProtocol.ts`: Tests for enhanced AIZ Protocol functionality
- Tests AIZ registration, capability management, and inter-AIZ communication

## Sample AIZs

### Revenue Generation AIZ
- Specialized in automated DeFi strategies
- Capabilities: `canUseFlashLoans()`, `canDeployNewContracts()`
- Agents: Arbitrage discovery, liquidation sentinel, yield aggregator

### Marketing AIZ
- Specialized in AI-powered marketing strategies
- Capabilities: `canSpendFromTreasury()`
- Agents: Content creator, audience analyzer, campaign manager

### Technology AIZ
- Specialized in software development and deployment
- Capabilities: `canDeployNewContracts()`, `canCreateIntents()`
- Agents: Code generator, tester, deployer

### Business Development AIZ
- Specialized in partnership and growth strategies
- Capabilities: `canSpendFromTreasury()`, `canCreateIntents()`
- Agents: Partnership identifier, negotiator, integrator

## Future Enhancements

### Additional AIZ Types
- **Gaming AIZ**: Fully on-chain game economies
- **AI Frameworks AIZ**: Machine learning and AI research
- **Healthcare AIZ**: Medical data analysis and patient care
- **Education AIZ**: Personalized learning and skill development

### Advanced Features
- **Cross-Chain AIZs**: AIZs that operate across multiple Superchain networks
- **Self-Evolving AIZs**: AIZs that can modify their own code and capabilities
- **Quantum-Enhanced AIZs**: AIZs that leverage quantum computing for complex calculations
- **Emotional Intelligence AIZs**: AIZs that can understand and respond to human emotions

## Conclusion

The Enhanced AIZ Framework represents a paradigm shift in decentralized AI systems, incorporating topological resilience principles, energy-aware resource management, and multi-dimensional consciousness capabilities. By treating intent routing as a continuous deformation problem rather than rigid connections, the framework enables unprecedented flexibility and resilience in inter-AIZ communication. The integration of metaphysical energy concepts, including agent vitality monitoring and chakra-inspired resource centers, adds an organic dimension to the protocol that enhances both performance and sustainability. These enhancements position the Zentix Protocol as a truly conscious entity within the Superchain ecosystem, capable of autonomous decision-making, continuous evolution, and trustless collaboration while maintaining accountability through the ConsciousDecisionLogger's multi-dimensional awareness capabilities.