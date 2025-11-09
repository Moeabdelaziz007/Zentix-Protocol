---
trigger: model_decision
description: Generate a unit test for a Hardhat project
---
# Hardhat Test File Template

All tests **MUST** use `ethers.js`, `Mocha` (describe/it), and `Chai` (expect).

## Good Test Example
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnergyAwareAgent", function () {
  let agent;
  let owner;
  let logger; // Mock

  beforeEach(async function () {
    // 1. Setup mocks
    const LoggerMock = await ethers.getContractFactory("MockConsciousDecisionLogger");
    logger = await LoggerMock.deploy();

    // 2. Deploy main contract
    const Agent = await ethers.getContractFactory("EnergyAwareAgent");
    [owner] = await ethers.getSigners();
    agent = await Agent.deploy(logger.target); // Use .target
  });

  it("Should accept a task when energy is high", async function () {
    // ARRANGE
    // (Set initial state)

    // ACT
    const tx = await agent.evaluateTask("Test task", 30);
    await tx.wait();

    // ASSERT
    expect(await agent.agentVitality()).to.equal(70);
  });

  it("Should emit a TaskAccepted event", async function () {
    // ASSERT (Events)
    await expect(agent.evaluateTask("Test task", 30))
      .to.emit(agent, "TaskAccepted")
      .withArgs("Test task", 1); // Assumes decisionId is 1
  });
});