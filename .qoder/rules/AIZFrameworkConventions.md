---
trigger: always_on
alwaysApply: true
---
# AIZ Framework Core Principles

The Zentix Protocol uses the "AIZ" (AI-Consciousness Framework). When generating any new agent or logic, you **MUST** follow these principles:

1.  **Intents over Functions:** Agents should not call each other directly. They **MUST** submit tasks to the `IIntentBus` interface.
2.  **Proof of Consciousness:** All significant decisions (accepting a task, rejecting a task, transferring funds) **MUST** be logged by calling the `IConsciousDecisionLogger` interface.
3.  **Energy Awareness:** Agents should be "energy-aware." They **SHOULD** check network efficiency or agent vitality before executing costly operations, often by consulting the `IMEVHarvester` or a related contract.
4.  **Identity:** All agents **MUST** have a discoverable `agentId` (e.g., `mohamed.zentix`).

## Example: Good Agent Logic
```solidity
// BAD (Direct call)
// otherAgent.doTask(x);

// GOOD (Intent-based)
function handleTask(bytes calldata data) {
    // ... logic ...
    uint256 decisionId = logger.logConsciousDecision(
        agentId,
        "TASK_ACCEPTED",
        // ... other params
    );
    // ... execute ...
}