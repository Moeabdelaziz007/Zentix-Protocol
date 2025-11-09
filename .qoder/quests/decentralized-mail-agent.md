# Decentralized Mail Agent (DeMA) Design Document

## 1. Overview

### 1.1 Vision
Transform email into a decentralized, autonomous system where each inbox is a smart contract agent that processes incoming messages as blockchain intents, enabling trustless communication and automated actions.

### 1.2 Problem Statement
Traditional email systems are centralized, creating single points of failure and data control issues. Even "Agent-Native Email" solutions remain within walled gardens controlled by single entities.

### 1.3 Solution Concept
The "Sentient Inbox" reimagines email as a blockchain-based system:
- Email addresses become on-chain identities (ENS or ZNS)
- Emails are submitted as intents to the Zentix Protocol's IntentBus
- Personal AIZ Agents process intents and log conscious decisions
- Actions are executed autonomously based on predefined rules

### 1.4 AIZ Framework Alignment
The DeMA project fully implements the AIZ (AI-Consciousness Framework) principles:
- **Intents over Functions**: All communication occurs through the IIntentBus interface
- **Proof of Consciousness**: Every decision is logged via IConsciousDecisionLogger
- **Energy Awareness**: Agents check network efficiency before operations
- **Identity**: Each agent has a discoverable agentId

## 2. Core Components

### 2.1 DecentralizedMailAgent Smart Contract
An AIZ-compliant agent that:
- Inherits from the EnergyAwareAgent pattern
- Processes incoming intents via `processIntent(Intent calldata intent)`
- Integrates with IConsciousDecisionLogger for decision transparency
- Connects to IMEVHarvester for gas optimization
- Implements Solidity Style Guide compliance (SPDX, pragma, naming conventions)
- Follows function ordering: constructor, receive/fallback, external, public, internal, private

#### 2.1.1 Key Functions
- `processIntent(Intent calldata intent)`: Main entry point for intent processing
- `logDecision(...)`: Wrapper for IConsciousDecisionLogger integration
- `checkVitality(...)`: Energy awareness checks before execution
- `executeAction(...)`: On-chain action execution based on intent type

#### 2.1.2 State Management
- Approved sender lists for trustless payments
- Configuration parameters for filtering and processing rules
- Connection to Zentix Chronicle for persistent memory

### 2.2 DeMA Gateway
A Node.js service that:
- Receives traditional emails via IMAP/SMTP
- Converts emails to Intent structs
- Submits intents to the IIntentBus on Superchain
- Handles reply loops via Chainlink Oracle integration

#### 2.2.1 Key Modules
- **Email Receiver**: IMAP/SMTP client or Mailgun webhook handler
- **Intent Formatter**: Converts email content to structured Intent objects
- **Blockchain Connector**: ethers.js integration with IIntentBus
- **Reply Handler**: Processes oracle callbacks and sends email responses

#### 2.2.2 Data Flow
1. Email receipt via webhook or polling
2. MIME parsing and content extraction
3. Intent struct construction
4. Gas estimation and transaction signing
5. Intent submission to IIntentBus
6. Transaction monitoring and confirmation

### 2.3 Identity System
- ENS integration for existing web3 identities
- Zentix-specific Naming Service (ZNS) for .zentix addresses
- Mapping between identities and agent contract addresses

#### 2.3.1 Resolution Process
1. Email address parsing (user@domain)
2. Domain resolution (.zentix → ZNS, .eth → ENS)
3. Address lookup in respective registries
4. Agent contract validation

#### 2.3.2 Registration Flow
1. Agent deployment with unique agentId
2. Identity registration in ZNS/ENS
3. Address mapping verification
4. Ownership proof validation

## 3. Use Cases

### 3.1 Trustless Payments
Process payment requests directly from email addresses with automated verification and execution.

#### 3.1.1 Implementation Details
- Intent format: `pay.invoice(recipient, amount, token)@identity`
- Sender authentication against approved list
- Token balance verification before transfer
- Multi-signature support for high-value transactions
- Decision logging: "Paid invoice to vendor. Reason: Sender authenticated."

#### 3.1.2 Security Features
- Rate limiting for payment requests
- Daily/weekly spending caps
- Multi-factor authentication for large transfers
- Automated fraud detection based on behavioral patterns

### 3.2 Decentralized Summarization
Offload content processing to external LLMs via oracles, with results stored on IPFS/Arweave.

#### 3.2.1 Implementation Details
- Intent format: `summarize.article(url)@identity`
- URL content fetching via ZON (Zentix Oracle Network)
- LLM processing through Chainlink Functions
- Result storage on IPFS with permanent Arweave backup
- Decision logging: "Summary generated. IPFS Hash: Qm..."

#### 3.2.2 Data Flow
1. URL validation and content fetching
2. Content chunking for large documents
3. Oracle request preparation
4. LLM processing with specified parameters
5. Result aggregation and storage
6. Response notification generation

### 3.3 Autonomous Agent Management
Allow owners to configure their agents through email commands that modify smart contract state.

#### 3.3.1 Implementation Details
- Intent format: `set.config(parameter=value)@identity`
- Owner verification through signature validation
- Parameter validation and bounds checking
- Configuration state updates
- Change logging and audit trail

#### 3.3.2 Configuration Options
- Spam filtering sensitivity levels
- Payment authorization thresholds
- Processing priority settings
- Notification preferences
- Integration activation/deactivation

## 4. Technical Architecture

### 4.1 System Flow
1. Traditional email received at gateway
2. Gateway converts email to Intent struct
3. Intent submitted to IIntentBus on Superchain
4. User's DecentralizedMailAgent processes intent
5. Decision logged via IConsciousDecisionLogger
6. On-chain or off-chain action executed
7. Response sent back via reply loop (if applicable)

### 4.2 Detailed Architecture

#### 4.2.1 Intent Structure
```text
Intent {
  id: bytes32,           // Unique identifier
  sender: address,       // Sender's identity
  recipient: address,    // Recipient's agent address
  timestamp: uint256,    // Submission time
  action: string,        // Requested action
  parameters: bytes,     // Action-specific parameters
  metadata: bytes        // Additional context
}
```

#### 4.2.2 Data Flow Between Components
1. **Email Ingestion Layer**: Receives SMTP/IMAP or webhook emails
2. **Parsing Layer**: Extracts content and converts to structured data
3. **Validation Layer**: Verifies sender authenticity and content safety
4. **Intent Construction Layer**: Builds Intent struct with proper formatting
5. **Blockchain Interface Layer**: Signs and submits transactions
6. **Monitoring Layer**: Tracks transaction confirmations and events
7. **Response Layer**: Handles oracle callbacks and user notifications

### 4.3 Technology Stack
- Blockchain: Superchain (Base, OP Mainnet) with Sepolia testnet for development
- Core Protocol: Zentix Protocol (IIntentBus, IAIZOrchestrator, IConsciousDecisionLogger)
- Gateway: Node.js/Express server with Mailgun integration
- Data Storage: IPFS/Arweave for large content
- Off-Chain Compute: Chainlink Functions for external API calls

### 4.4 Protocol Enhancements Integration

#### 4.4.1 Zentix Chronicle (Persistent Memory)
- Integration with decentralized storage for decision history
- Query interface for past interactions
- Learning from previous decisions

#### 4.4.2 ZON (Zentix Oracle Network)
- Web2 data fetching capabilities
- Cross-chain state verification
- External API integration

#### 4.4.3 Zentix Capital Nexus
- Working capital provisioning for high-value tasks
- Revenue sharing mechanisms
- Economic incentive alignment

## 5. Implementation Roadmap

### 5.1 Phase 1: On-Chain Agent
- Adapt EnergyAwareAgent.sol to DecentralizedMailAgent.sol
- Implement processIntent function with intent parsing logic
- Integrate with IConsciousDecisionLogger and IMEVHarvester
- Add configuration management for filtering rules
- Implement approved sender list functionality
- Create unit tests for all core functions

**Deliverables**: Deployable smart contract, test suite, documentation

### 5.2 Phase 2: Gateway Development
- Build Node.js server with /webhook/incoming-email endpoint
- Integrate with Mailgun for email reception
- Implement email-to-intent conversion logic
- Add MIME parsing and content extraction
- Implement transaction signing and submission
- Create monitoring and error handling

**Deliverables**: Gateway service, API documentation, deployment guide

### 5.3 Phase 3: Blockchain Bridge
- Implement ethers.js integration with IIntentBus
- Create intent submission functionality with gas estimation
- Handle gas payment mechanics and wallet management
- Add transaction confirmation monitoring
- Implement retry logic for failed submissions

**Deliverables**: Blockchain integration module, transaction management system

### 5.4 Phase 4: End-to-End Testing
- Test complete flow from email to blockchain execution
- Verify decision logging on Sepolia block explorer
- Validate core use cases (payments, summarization, configuration)
- Performance testing under various load conditions
- Security audit of smart contracts

**Deliverables**: Test reports, security audit results, performance benchmarks

### 5.5 Phase 5: Reply Loop
- Implement Chainlink Oracle integration for callbacks
- Create /api/send-reply endpoint in gateway
- Enable automated email responses with results
- Add error handling for failed replies
- Implement retry mechanism for delivery failures

**Deliverables**: Complete bidirectional communication system, response handling

## 6. AIZ Framework Compliance

### 6.1 Intents over Functions
- All agent interactions occur through IIntentBus
- No direct agent-to-agent calls
- Intent-based communication pattern

### 6.2 Proof of Consciousness
- All decisions logged via IConsciousDecisionLogger
- Decision rationale recorded for transparency
- Decision IDs generated for traceability

### 6.3 Energy Awareness
- Integration with IMEVHarvester for gas optimization
- Vitality checks before executing costly operations
- Network efficiency considerations

### 6.4 Identity
- Discoverable agentId for each DecentralizedMailAgent
- Identity resolution through ENS or ZNS
- Ownership verification mechanisms

## 7. Security Considerations

### 7.1 Smart Contract Security
- Implementation of OpenZeppelin security best practices
- Formal verification of critical functions
- Reentrancy protection for financial operations
- Access control for configuration changes
- Rate limiting for resource-intensive operations

### 7.2 Data Privacy
- End-to-end encryption for sensitive content
- Zero-knowledge proofs for identity verification
- Selective disclosure mechanisms
- GDPR compliance for data handling

### 7.3 Network Security
- Secure key management for gateway operations
- DDoS protection for public endpoints
- Input validation and sanitization
- Secure communication channels (TLS/SSL)

## 8. Compliance and Standards

### 8.1 Blockchain Standards
- ERC-725/735 for identity management
- ERC-20/777 for token interactions
- EIP-155 for transaction replay protection

### 8.2 Email Standards
- RFC 5321/5322 compliance for SMTP/IMAP
- MIME standards for content encoding
- DKIM/SPF/DMARC for email authentication

### 8.3 AIZ Framework Compliance
- Full adherence to Intents over Functions principle
- Comprehensive Proof of Consciousness implementation
- Energy awareness for all operations
- Identity discoverability and verification

## 9. Monitoring and Observability

### 9.1 Agent Performance Metrics
- Transaction success/failure rates
- Average processing time per intent
- Gas consumption statistics
- Decision accuracy tracking

### 9.2 System Health Monitoring
- Gateway uptime and response times
- Blockchain connectivity status
- Oracle response reliability
- Storage availability metrics

### 9.3 User Experience Analytics
- Feature adoption rates
- Error patterns and common failures
- User configuration preferences
- Support request analysis

## 10. Deployment and Infrastructure

### 10.1 Smart Contract Deployment
- Deployment to Base Sepolia testnet for initial testing
- Mainnet deployment strategy for Base and OP Mainnet
- Upgrade mechanisms for future enhancements
- Multi-signature deployment for security

### 10.2 Gateway Infrastructure
- Containerized deployment using Docker
- Load balancing for high availability
- Auto-scaling based on email volume
- Geographic distribution for latency optimization

### 10.3 Data Storage
- IPFS nodes for content distribution
- Arweave for permanent storage
- Backup and redundancy strategies
- Data retention policies

## 11. Future Enhancements and Roadmap

### 11.1 Short-term Enhancements
- Integration with additional email providers
- Support for email attachments and rich media
- Advanced natural language processing for intent extraction
- Multi-language support for internationalization

### 11.2 Medium-term Roadmap
- Decentralized governance for protocol upgrades
- Cross-chain intent routing and execution
- Advanced AI capabilities through ZON integration
- Mobile application for agent management

### 11.3 Long-term Vision
- Fully autonomous agent ecosystems
- Integration with other decentralized protocols
- Advanced machine learning for intent prediction
- Quantum-resistant cryptography implementation