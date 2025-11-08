# AIZ Template

This is a template for creating new Autonomous AI Zones (AIZs) in the Zentix Protocol.

## Overview

The AIZ template provides a standardized structure for creating specialized AI zones with:

- **Standardized Agent Architecture**: Predefined agents for planning, risk assessment, and execution
- **Modular Structure**: Organized directories for agents, tools, knowledge base, and configuration
- **Smart Contract Integration**: Template orchestrator contract for on-chain interactions
- **Intent-Based Communication**: Ready-to-use intent processing framework

## Directory Structure

```
aiz-template/
├── manifest.json           # AIZ configuration and metadata
├── index.js               # Main entry point
├── AIZOrchestrator.sol    # Smart contract template
├── agents/                # AI agents
│   ├── planner_agent.js    # High-level planning agent
│   ├── risk_agent.js       # Risk and compliance agent
│   └── execution_agent.js  # Execution agent
├── tools/                 # Custom tools (empty by default)
├── knowledge_base/        # Knowledge and data (empty by default)
└── config/                # Configuration files (empty by default)
```

## Getting Started

1. **Clone the template**:
   ```bash
   cp -r aiz-template my-new-aiz
   cd my-new-aiz
   ```

2. **Update the manifest**:
   Edit `manifest.json` to customize your AIZ's metadata

3. **Customize the agents**:
   Modify the agent files in the `agents/` directory to implement your specific logic

4. **Add custom tools**:
   Add any custom tools to the `tools/` directory

5. **Update the smart contract**:
   Modify `AIZOrchestrator.sol` to implement your on-chain logic

6. **Register your AIZ**:
   Deploy your AIZ orchestrator contract and register it with the AIZRegistry

## Agent Architecture

### Planner Agent
Responsible for creating high-level strategies and plans based on inputs and objectives.

### Risk Agent
Validates plans for risk and compliance before execution.

### Execution Agent
Executes approved plans and interacts with tools and smart contracts.

## Smart Contract Integration

The `AIZOrchestrator.sol` contract provides:

- **Intent Processing**: Receive and process intents from other AIZs
- **Decision Logging**: Log decisions to the ConsciousDecisionLogger
- **Capability Management**: Define and expose AIZ capabilities
- **Event Emission**: Emit events for monitoring and tracking

## Intent-Based Communication

AIZs communicate using an intent-based architecture:

1. **Intent Creation**: An AIZ creates an intent representing a desired outcome
2. **Intent Discovery**: Other AIZs discover intents they can solve
3. **Intent Solving**: AIZs solve intents and execute the required actions
4. **Result Reporting**: Results are reported back to the originating AIZ

## Customization

To customize this template for your specific use case:

1. **Update the manifest** with your AIZ's details
2. **Modify the agents** to implement your specific logic
3. **Add custom tools** to the tools directory
4. **Extend the orchestrator contract** with your on-chain functionality
5. **Register your AIZ** with the AIZRegistry

## Deployment

To deploy your AIZ:

1. **Deploy the orchestrator contract**:
   ```bash
   # Use your preferred deployment method
   ```

2. **Register with AIZRegistry**:
   ```javascript
   await aizRegistry.registerAIZ(
     aizId,
     "My AIZ",
     "Description of my AIZ",
     orchestratorAddress,
     [chainIds],
     [contractAddresses]
   );
   ```

3. **Grant capabilities**:
   ```javascript
   await aizRegistry.setCapability(aizId, capability, true);
   ```

## License

MIT