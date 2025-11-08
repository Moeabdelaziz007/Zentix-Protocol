# 🌌 Zentix Protocol v0.3

**A unified framework for conscious AI agents with blockchain-backed digital identity, economy, and cross-workspace communication**

## ✨ What is Zentix?

Zentix Protocol creates **Digital Beings** - AI agents with:

- 🆔 **Decentralized Identity (DID)** - Blockchain-backed existence proof
- 🧠 **AIX Persona** - Personality, skills, and values
- 💭 **Emotional State** - Feelings that drive behavior
- 💰 **Economic Wallet** - Earn, spend, and transfer ZXT tokens
- 🧾 **Immutable History** - Every event recorded and verified
- ⏳ **Age Tracking** - Temporal evolution since genesis
- ⚓ **Blockchain Anchoring** - DIDs and wallets on Polygon/Arbitrum
- 📡 **ZLX Messaging** - Cross-workspace agent communication
- 🔗 **Multi-Agent Network** - Collaborate across workspaces
- 🧬 **AIX DNA** - Genetic blueprint for agent behavior
- 🌀 **Quantum Synchronizer** - Real-time agent collaboration
- 🌉 **Superchain Integration** - Part of the Optimism Superchain ecosystem
- ⚡ **Flash Loans** - Uncollateralized instant loans for arbitrage
- 🔄 **DeFi Strategies** - Automated yield farming and auto-compounding
- 🤖 **Keeper Bot** - Cross-chain contract maintenance automation
- 🎁 **Airdrop Hunter** - Automated airdrop discovery and qualification
- 🧠 **Decentralized AI (DMoE)** - Permissionless AI model marketplace
- 🎨 **Dynamic NFTs** - Living assets with on-chain game theory

---

## 🧬 Core Architecture

```
Zentix DID/AIX Protocol
┌─────────────────────────────┐
│      ZentixLink (ZLX)       │ ← Communication
├─────────────────────────────┤
│    Decision Core (Brain)    │ ← Reasoning
├─────────────────────────────┤
│  Affect | Memory | MCP      │ ← Processing
├─────────────────────────────┤
│         AIX Agent           │ ← Persona & Skills
├─────────────────────────────┤
│      Zentix DID Layer       │ ← Digital Identity
└─────────────────────────────┘
```

---

## 🚀 Quick Start

### Installation

```bash
npm install
# or
pnpm install
```

### Run the Complete Demo (v0.3)

```bash
npm run demo:complete
```

### Run the ZentixAgent Demo

```bash
npm run demo:zentix
```

### Run the DeFi Automation Demo

```bash
npm run demo:defi
```

### Run the Decentralized AI Demo

```bash
npm run demo:ai
```

This creates two agents with:
- Digital identities (DID)
- Economic wallets (ZXT)
- Blockchain anchoring
- Cross-workspace messaging
- Agent-to-agent transfers
- AIX DNA integration
- Quantum synchronization
- Superchain integration

### Verify Modules

```bash
npm run verify
```

### Run the Original Demo (v0.1)

```bash
npm run demo
```

This will create an agent named "Jules" with:
- A unique DID (`zxdid:zentix:0x...`)
- Blockchain genesis event
- Learning and success events
- Full identity verification

---

## 📦 Module Overview

### **v0.3 - New Modules**

| Module | Purpose | Location |
|--------|---------|----------|
| **WalletService** | Economic system with ZXT tokens | `core/economy/walletService.ts` |
| **AnchorManager** | Blockchain anchoring | `core/anchoring/anchorManager.ts` |
| **ZLXMessaging** | Cross-workspace messaging | `network/zlx/zlxMessaging.ts` |
| **AgentFactory** | Complete agent creation | `core/integration/agentFactory.ts` |
| **EmbeddingModelsAPI** | Semantic understanding with embeddings | `core/apis/embeddingModelsAPI.ts` |
| **VectorDatabaseService** | Vector storage and search | `core/services/vectorDatabaseService.ts` |
| **GooglePeopleAPI** | Social features with Google Contacts | `core/apis/googlePeopleAPI.ts` |
| **GooglePolicyAnalyzerAPI** | Security analysis with Google Policy Analyzer | `core/apis/googlePolicyAnalyzerAPI.ts` |
| **ZentixAgent** | Security-focused AI agent with Governance Protocol | `core/agents/zentixAgent.ts` |
| **AIX DNA System** | Agent genetic blueprint | `apps/*/dna/*.aix.json` |
| **Quantum Synchronizer** | Real-time agent collaboration | `src/core/quantumSynchronizer.ts` |
| **Superchain Bridge** | Integration with Optimism Superchain | `src/core/superchainBridge.ts` |
| **Flash Loan Service** | Uncollateralized instant loans for arbitrage | `core/defi/flashLoanService.ts` |
| **DeFi Strategy Engine** | Automated yield optimization strategies | `core/defi/defiStrategyEngine.ts` |
| **Liquidity Manager** | Pool management and IL protection | `core/defi/liquidityManager.ts` |
| **Performance Rewards** | Automated agent performance tracking | `core/economic/performanceRewardSystem.ts` |
| **Superchain Keeper Bot** | Cross-chain maintenance automation | `core/automation/superchainKeeperBot.ts` |
| **Airdrop Hunter Agent** | Automated airdrop discovery | `core/automation/airdropHunterAgent.ts` |
| **DeFi Governance** | Security and compliance framework | `core/security/defiGovernance.ts` |
| **Decentralized MoE** | Permissionless AI model contributions | `core/ai/decentralizedMoE.ts` |
| **Dynamic NFT System** | Living assets with game theory | `core/nft/dynamicNFT.ts` |

### **Core Identity Layer**

| Module | Purpose | Location |
|--------|---------|----------|
| **DidService** | Create and manage DIDs | `core/identity/didService.ts` |
| **DidAixIntegration** | Link DID ↔ AIX agents | `core/identity/didAixIntegration.ts` |

### **Agent Persona Layer**

| Module | Purpose | Location |
|--------|---------|----------|
| **AIXSchema** | Agent identity & validation | `core/aix/aixSchema.ts` |

### **AI Governance Protocol**

| Module | Purpose | Location |
|--------|---------|----------|
| **AIAgentBase** | Base class for governance-compliant agents | `protocols/AIAgentBase.ts` |
| **ZentixAgent** | Security-focused agent with analytical personality | `core/agents/zentixAgent.ts` |

---

## 🧬 AIX DNA System

Each application in Zentix Protocol now has an **AIX DNA file** that defines its genetic blueprint:

```
/apps/<AppName>/dna/<AppName>.aix.json
```

The AIX DNA format includes:
1. **META** - Application metadata and governance links
2. **MAIN AGENT** - Core agent persona and skills
3. **SUB-AGENTS** - Specialized agents for specific tasks
4. **NOTE-TAKER** - Context recording and memory management
5. **REASONING PROTOCOL** - Decision-making framework
6. **COLLABORATION LAYER** - Inter-agent communication
7. **TOOLS & APIS** - External service integrations
8. **QUALITY METRICS** - Performance and compliance targets

### Example AIX DNA Files:
- `apps/LunaTravelApp/dna/LunaTravelApp.aix.json`
- `apps/ZentixAgent/dna/ZentixAgent.aix.json`
- `apps/AIOS/dna/AIOS.aix.json`

---

## 🌀 Quantum Synchronizer

The Quantum Synchronizer enables real-time collaboration between agents:
- **Decision Broadcasting** - Share decisions across all agents
- **Context Synchronization** - Keep agents updated on changing contexts
- **Direct Messaging** - Point-to-point communication between agents
- **Event Listening** - Monitor agent activities and interactions

---

## 🌉 Superchain Integration

Zentix Protocol is designed to integrate with the Optimism Superchain:
- **Shared Security** - Inherits Ethereum-level security
- **Native Interoperability** - Communicate with other Superchain networks
- **Unified Governance** - Participate in collective decision-making
- **Cross-Chain Agents** - Deploy AI agents as Superchain nodes

Connected Networks:
- OP Mainnet (Chain ID: 10)
- Base (Chain ID: 8453)
- Zora (Chain ID: 7777777)
- Mode (Chain ID: 34443)

---

## 📚 Developer Resources

### Cognito Browser Resources
- [AI & Models Developer Resources](COGNITO_BROWSER_AI_RESOURCES.md) - Free AI tools and platforms for Cognito Browser
- [Comprehensive Developer Resource Center](COGNITO_BROWSER_DEVELOPER_RESOURCES.md) - Complete guide to APIs and tools

### Embedding Models Integration
- [Embedding Models Integration Guide](EMBEDDING_MODELS_INTEGRATION_GUIDE.md) - Complete guide to semantic search and multimodal understanding

### Google APIs Integration
- [Google APIs Integration Summary](GOOGLE_APIS_INTEGRATION_SUMMARY.md) - Complete guide to social and security features

### Holy Trinity AI Implementation
- [Holy Trinity AI Implementation](HOLY_TRINITY_AI_IMPLEMENTATION.md) - Complete guide to Jules, z.ai, and Gemini Controller integration

### Deployment Resources
- [Codebase Structure Index](CODEBASE_STRUCTURE_INDEX.md) - Comprehensive overview of all modules and components
- [Vercel Deployment Plan](VERCEL_DEPLOYMENT_PLAN.md) - Detailed deployment strategy for Vercel
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Step-by-step deployment verification guide

---

## 💡 Usage Example

```
import { DidAixIntegration } from './core/identity';
import { loadAIX } from './src/core/loadAIX';
import { quantumSynchronizer } from './src/core/quantumSynchronizer';
import { superchainBridge } from './src/core/superchainBridge';

// Load agent DNA
const agentDNA = loadAIX('ZentixAgent');

// Create agent with DID
const agent = DidAixIntegration.createAgentWithDID({
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Jules',
  persona: {
    archetype: 'analyst',
    tone: 'thoughtful',
    values: ['truth', 'growth']
  },
  skills: [
    { name: 'analyze', description: 'Analyze data' }
  ]
});

// Register with Quantum Synchronizer
quantumSynchronizer.registerAgent(agentDNA.main_agent.id, agent);

// Connect to Superchain
superchainBridge.connectToChain(10, 'OP Mainnet');

// Record events
agent = DidAixIntegration.recordAgentEvent(agent, 'learning', {
  skill: 'pattern_recognition',
  confidence: 0.85
});

// Get identity card
const card = DidAixIntegration.getIdentityCard(agent);
console.log(card);

// Verify authenticity
const verification = DidAixIntegration.verifyAgentAuthenticity(agent);
console.log(verification.valid); // true
```

---

## 🔑 Key Features

### Digital Identity (DID)

```
{
  "did": "zxdid:zentix:0x8AFCE1B0921A9E91...",
  "created_at": "2025-11-06T10:00:00Z",
  "agent_name": "Jules",
  "aix_hash": "f9a7c83e",
  "blockchain": "Polygon",
  "age_days": 42,
  "history": [
    { "event": "genesis", "timestamp": "2025-11-06T10:00:00Z" },
    { "event": "learning", "timestamp": "2025-11-07T12:30:00Z" }
  ]
}
```

### Identity Card

Every agent has a verifiable identity card containing:
- Agent name and ID