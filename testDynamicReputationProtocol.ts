import { ethers } from "hardhat";
import { expect } from "chai";
import { DynamicReputationProtocol, AIZRegistry, ConsciousDecisionLogger } from "../typechain-types";
import { Signer } from "ethers";

describe("DynamicReputationProtocol", function () {
  let dynamicReputationProtocol: DynamicReputationProtocol;
  let aizRegistry: AIZRegistry;
  let decisionLogger: ConsciousDecisionLogger;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy AIZRegistry
    const AIZRegistryFactory = await ethers.getContractFactory("AIZRegistry");
    aizRegistry = await AIZRegistryFactory.deploy();
    await aizRegistry.waitForDeployment();

    // Deploy ConsciousDecisionLogger
    const DecisionLoggerFactory = await ethers.getContractFactory("ConsciousDecisionLogger");
    decisionLogger = await DecisionLoggerFactory.deploy();
    await decisionLogger.waitForDeployment();

    // Deploy DynamicReputationProtocol
    const DynamicReputationProtocolFactory = await ethers.getContractFactory("DynamicReputationProtocol");
    const aizId = ethers.encodeBytes32String("TEST-REPUTATION-AIZ");
    const aizName = "TestDynamicReputationProtocol";
    const aizDescription = "Test AIZ for dynamic reputation protocol";
    
    dynamicReputationProtocol = await DynamicReputationProtocolFactory.deploy(
      aizId,
      await aizRegistry.getAddress(),
      await decisionLogger.getAddress(),
      aizName,
      aizDescription
    );
    await dynamicReputationProtocol.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right decision logger address", async function () {
      expect(await dynamicReputationProtocol.decisionLoggerAddress()).to.equal(await decisionLogger.getAddress());
    });
  });

  describe("Reputation Management", function () {
    it("Should update reputation score", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ-1");
      const reason = "Successful task completion";
      const category = ethers.encodeBytes32String("performance");
      
      await expect(dynamicReputationProtocol.updateReputation(aizId, 50, reason, category))
        .to.emit(dynamicReputationProtocol, "ReputationUpdated")
        .withArgs(aizId, 550, 50, reason);
      
      const reputation = await dynamicReputationProtocol.getAIZReputation(aizId);
      expect(reputation.score).to.equal(550);
      expect(reputation.totalInteractions).to.equal(1);
      expect(reputation.successfulInteractions).to.equal(1);
    });

    it("Should handle negative reputation updates", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ-2");
      const reason = "Failed task";
      const category = ethers.encodeBytes32String("reliability");
      
      // First give some reputation
      await dynamicReputationProtocol.updateReputation(aizId, 100, "Initial boost", category);
      
      // Then reduce it
      await expect(dynamicReputationProtocol.updateReputation(aizId, -30, reason, category))
        .to.emit(dynamicReputationProtocol, "ReputationUpdated")
        .withArgs(aizId, 570, -30, reason);
      
      const reputation = await dynamicReputationProtocol.getAIZReputation(aizId);
      expect(reputation.score).to.equal(570);
      expect(reputation.totalInteractions).to.equal(2);
      expect(reputation.successfulInteractions).to.equal(1);
    });

    it("Should record economic contributions", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ-3");
      const amount = 1000;
      const reason = "Generated revenue for organization";
      
      await expect(dynamicReputationProtocol.recordEconomicContribution(aizId, amount, reason))
        .to.emit(dynamicReputationProtocol, "ReputationUpdated");
      
      const reputation = await dynamicReputationProtocol.getAIZReputation(aizId);
      expect(reputation.economicContributions).to.equal(amount);
      // Should have gotten a reputation boost (1000/10 = 100 points)
      expect(reputation.score).to.equal(600);
    });
  });

  describe("Reputation Staking", function () {
    it("Should allow staking on reputation", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ-4");
      const stakeAmount = 100;
      
      await expect(dynamicReputationProtocol.connect(addr1).placeReputationStake(aizId, stakeAmount))
        .to.emit(dynamicReputationProtocol, "ReputationStakePlaced")
        .withArgs(aizId, await addr1.getAddress(), stakeAmount);
      
      // Should also boost reputation slightly
      const reputation = await dynamicReputationProtocol.getAIZReputation(aizId);
      expect(reputation.score).to.equal(505); // Default 500 + 5 for staking
    });

    it("Should fail to place stake with zero amount", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ-5");
      
      await expect(dynamicReputationProtocol.connect(addr1).placeReputationStake(aizId, 0))
        .to.be.revertedWith("Stake amount must be greater than 0");
    });
  });

  describe("AIZ Penalization", function () {
    it("Should penalize an AIZ and update reputation", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ-6");
      const reason = "Violation of protocol rules";
      
      // First give some reputation
      await dynamicReputationProtocol.updateReputation(aizId, 100, "Good performance", ethers.encodeBytes32String("performance"));
      
      // Then penalize
      await expect(dynamicReputationProtocol.penalizeAIZ(aizId, reason))
        .to.emit(dynamicReputationProtocol, "ReputationUpdated")
        .withArgs(aizId, 550, -50, reason);
      
      const reputation = await dynamicReputationProtocol.getAIZReputation(aizId);
      expect(reputation.score).to.equal(550);
    });
  });

  describe("Utility Functions", function () {
    it("Should calculate success rate correctly", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ-7");
      
      // Add some successful and failed interactions
      await dynamicReputationProtocol.updateReputation(aizId, 50, "Success 1", ethers.encodeBytes32String("task1"));
      await dynamicReputationProtocol.updateReputation(aizId, 50, "Success 2", ethers.encodeBytes32String("task2"));
      await dynamicReputationProtocol.updateReputation(aizId, -25, "Failure 1", ethers.encodeBytes32String("task3"));
      
      const successRate = await dynamicReputationProtocol.getSuccessRate(aizId);
      // 2 successful out of 3 total = 66.67% -> 66% (integer division)
      expect(successRate).to.equal(66);
    });

    it("Should return zero success rate for new AIZ", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ-8");
      const successRate = await dynamicReputationProtocol.getSuccessRate(aizId);
      expect(successRate).to.equal(0);
    });
  });
});