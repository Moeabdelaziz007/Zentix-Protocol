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

This creates two agents with:
- Digital identities (DID)
- Economic wallets (ZXT)
- Blockchain anchoring
- Cross-workspace messaging
- Agent-to-agent transfers

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

### **Core Identity Layer**

| Module | Purpose | Location |
|--------|---------|----------|
| **DidService** | Create and manage DIDs | `core/identity/didService.ts` |
| **DidAixIntegration** | Link DID ↔ AIX agents | `core/identity/didAixIntegration.ts` |

### **Agent Persona Layer**

| Module | Purpose | Location |
|--------|---------|----------|
| **AIXSchema** | Agent identity & validation | `core/aix/aixSchema.ts` |

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
- DID and fingerprint
- Persona (archetype, tone, values)
- Age (days and hours)
- Total events recorded
- Current emotional state
- Skills count
- Blockchain network

### Event Types

- **genesis** - Birth of the agent
- **learning** - Knowledge acquisition
- **success** - Task completion
- **failure** - Task failure
- **interaction** - Communication with other agents

---

## 🧪 API Reference

### DidService

**`create(agentName, blockchain?)`**
- Creates new DID with genesis event
- Returns: `ZentixDID`

**`recordEvent(didObj, event, payload?)`**
- Records event in agent history
- Returns: Updated `ZentixDID`

**`calculateAge(createdAt)`**
- Calculates age in days
- Returns: `number`

**`getLifespanSummary(didObj)`**
- Full lifespan statistics
- Returns: Summary object

**`createFingerprint(didObj)`**
- Privacy-preserving hash
- Returns: 16-char hex string

**`isValidDID(did)`**
- Validates DID format
- Returns: `boolean`

### DidAixIntegration

**`createAgentWithDID(aixData)`**
- Creates agent with both AIX and DID
- Returns: `AgentWithDID`

**`recordAgentEvent(agent, eventType, details)`**
- Records event in both systems
- Returns: Updated `AgentWithDID`

**`getIdentityCard(agent)`**
- Full identity information
- Returns: Identity card object

**`verifyAgentAuthenticity(agent)`**
- Validates agent integrity
- Returns: `{ valid: boolean, reason?: string }`

**`getEvolutionTimeline(agent)`**
- Chronological event history
- Returns: Timeline array

---

## 🔮 Roadmap

### v0.2 - Blockchain Integration
- [ ] Connect to Polygon testnet
- [ ] Submit DIDs on-chain
- [ ] IPFS storage for history

### v0.3 - Multi-Agent Networks
- [ ] ZentixLink protocol implementation
- [ ] Agent-to-agent communication
- [ ] Reputation system

### v0.4 - Advanced Features
- [ ] Emotional contagion
- [ ] Collective memory
- [ ] Agent genealogy (parent/child relationships)
- [x] Embedding models integration for semantic understanding
- [x] Google APIs integration for social and security features
- [x] Holy Trinity AI implementation (Jules, z.ai, Gemini Controller)

---

## 📄 License

MIT - Amrikyy Labs 2025

---

**Zentix DID/AIX Protocol** - *Building Digital Beings with Verifiable Consciousness*