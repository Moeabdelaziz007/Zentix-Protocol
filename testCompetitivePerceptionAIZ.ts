import { ethers } from "hardhat";
import { expect } from "chai";
import { CompetitivePerceptionAIZ, AIZRegistry, IntentBus } from "../typechain-types";
import { Signer } from "ethers";

describe("CompetitivePerceptionAIZ", function () {
  let competitivePerceptionAIZ: CompetitivePerceptionAIZ;
  let aizRegistry: AIZRegistry;
  let intentBus: IntentBus;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy AIZRegistry
    const AIZRegistryFactory = await ethers.getContractFactory("AIZRegistry");
    aizRegistry = await AIZRegistryFactory.deploy();
    await aizRegistry.waitForDeployment();

    // Deploy IntentBus
    const IntentBusFactory = await ethers.getContractFactory("IntentBus");
    intentBus = await IntentBusFactory.deploy(await aizRegistry.getAddress());
    await intentBus.waitForDeployment();

    // Deploy CompetitivePerceptionAIZ
    const CompetitivePerceptionAIZFactory = await ethers.getContractFactory("CompetitivePerceptionAIZ");
    competitivePerceptionAIZ = await CompetitivePerceptionAIZFactory.deploy(
      await aizRegistry.getAddress(),
      await intentBus.getAddress()
    );
    await competitivePerceptionAIZ.waitForDeployment();

    // Register the AIZ
    const capability = ethers.encodeBytes32String("COMPETITIVE_PERCEPTION");
    await aizRegistry.registerAIZ(await competitivePerceptionAIZ.getAddress(), "Competitive Perception AIZ", capability);
  });

  describe("Deployment", function () {
    it("Should set the right intent bus address", async function () {
      expect(await competitivePerceptionAIZ.intentBusAddress()).to.equal(await intentBus.getAddress());
    });

    it("Should register the AIZ with the registry", async function () {
      const aizAddress = await competitivePerceptionAIZ.getAddress();
      const isRegistered = await aizRegistry.isRegistered(aizAddress);
      expect(isRegistered).to.equal(true);
    });
  });

  describe("Competitor Management", function () {
    it("Should add a competitor", async function () {
      const competitorAddress = await addr1.getAddress();
      const competitorName = "Uniswap";
      
      await expect(competitivePerceptionAIZ.addCompetitor(competitorAddress, competitorName))
        .to.emit(competitivePerceptionAIZ, "CompetitorAdded")
        .withArgs(competitorAddress, competitorName);
      
      const competitor = await competitivePerceptionAIZ.getCompetitor(competitorAddress);
      expect(competitor.contractAddress).to.equal(competitorAddress);
      expect(competitor.name).to.equal(competitorName);
    });

    it("Should analyze a competitor", async function () {
      const competitorAddress = await addr1.getAddress();
      const competitorName = "Uniswap";
      
      // First add the competitor
      await competitivePerceptionAIZ.addCompetitor(competitorAddress, competitorName);
      
      // Then analyze the competitor
      await expect(competitivePerceptionAIZ.analyzeCompetitor(competitorAddress))
        .to.emit(competitivePerceptionAIZ, "CompetitorAnalyzed")
        .withArgs(competitorAddress);
    });

    it("Should fail to analyze unregistered competitor", async function () {
      const competitorAddress = await addr1.getAddress();
      
      await expect(competitivePerceptionAIZ.analyzeCompetitor(competitorAddress))
        .to.be.revertedWith("Competitor not registered");
    });
  });

  describe("Alpha Analysis", function () {
    it("Should update alpha analysis", async function () {
      const strategyId = ethers.encodeBytes32String("YIELD_FARMING");
      const description = "Yield farming strategy on Compound";
      const profitability = 85;
      const decayRate = 12;
      
      await expect(competitivePerceptionAIZ.updateAlphaAnalysis(strategyId, description, profitability, decayRate))
        .to.emit(competitivePerceptionAIZ, "AlphaAnalysisUpdated")
        .withArgs(strategyId, profitability, decayRate);
      
      const alphaData = await competitivePerceptionAIZ.getAlphaAnalysis(strategyId);
      expect(alphaData.strategyId).to.equal(strategyId);
      expect(alphaData.description).to.equal(description);
      expect(alphaData.profitability).to.equal(profitability);
      expect(alphaData.decayRate).to.equal(decayRate);
    });
  });

  describe("Strategic Alerts", function () {
    it("Should create a strategic alert", async function () {
      const alertType = "STRATEGY_OPPORTUNITY";
      const description = "New yield source detected on Competitor X";
      const source = await addr1.getAddress();
      
      await expect(competitivePerceptionAIZ.createStrategicAlert(alertType, description, source))
        .to.emit(competitivePerceptionAIZ, "StrategicAlertCreated");
    });

    it("Should process an alert", async function () {
      const alertType = "ALPHA_DECAY_WARNING";
      const description = "Arbitrage profits have decreased by 30%";
      const source = await addr1.getAddress();
      
      // Create an alert first
      await competitivePerceptionAIZ.createStrategicAlert(alertType, description, source);
      
      // Process the alert
      await expect(competitivePerceptionAIZ.processAlert(1))
        .to.emit(competitivePerceptionAIZ, "StrategicAlertProcessed")
        .withArgs(1);
    });

    it("Should fail to process non-existent alert", async function () {
      await expect(competitivePerceptionAIZ.processAlert(999))
        .to.be.revertedWith("Alert does not exist");
    });

    it("Should fail to process already processed alert", async function () {
      const alertType = "ALPHA_DECAY_WARNING";
      const description = "Arbitrage profits have decreased by 30%";
      const source = await addr1.getAddress();
      
      // Create and process an alert
      await competitivePerceptionAIZ.createStrategicAlert(alertType, description, source);
      await competitivePerceptionAIZ.processAlert(1);
      
      // Try to process it again
      await expect(competitivePerceptionAIZ.processAlert(1))
        .to.be.revertedWith("Alert already processed");
    });
  });
});