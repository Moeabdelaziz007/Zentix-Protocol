import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  FinancialDecoyAgent, 
  AIZRegistry,
  ConsciousDecisionLogger,
  IntentBus,
  CompetitorRegistry,
  StrategicThreatDB
} from "../typechain-types";
import { Signer } from "ethers";

describe("FinancialDecoyAgent", function () {
  let financialDecoyAgent: FinancialDecoyAgent;
  let aizRegistry: AIZRegistry;
  let decisionLogger: ConsciousDecisionLogger;
  let intentBus: IntentBus;
  let competitorRegistry: CompetitorRegistry;
  let strategicThreatDB: StrategicThreatDB;
  
  let owner: Signer;
  let addr1: Signer;
  let competitor1: Signer;

  beforeEach(async function () {
    [owner, addr1, competitor1] = await ethers.getSigners();

    // Deploy AIZRegistry
    const AIZRegistryFactory = await ethers.getContractFactory("AIZRegistry");
    aizRegistry = await AIZRegistryFactory.deploy();
    await aizRegistry.waitForDeployment();

    // Deploy ConsciousDecisionLogger
    const DecisionLoggerFactory = await ethers.getContractFactory("ConsciousDecisionLogger");
    decisionLogger = await DecisionLoggerFactory.deploy();
    await decisionLogger.waitForDeployment();

    // Deploy IntentBus
    const IntentBusFactory = await ethers.getContractFactory("IntentBus");
    intentBus = await IntentBusFactory.deploy(await aizRegistry.getAddress());
    await intentBus.waitForDeployment();

    // Deploy CompetitorRegistry
    const CompetitorRegistryFactory = await ethers.getContractFactory("CompetitorRegistry");
    competitorRegistry = await CompetitorRegistryFactory.deploy();
    await competitorRegistry.waitForDeployment();

    // Deploy StrategicThreatDB
    const StrategicThreatDBFactory = await ethers.getContractFactory("StrategicThreatDB");
    strategicThreatDB = await StrategicThreatDBFactory.deploy(await aizRegistry.getAddress());
    await strategicThreatDB.waitForDeployment();

    // Deploy FinancialDecoyAgent
    const FinancialDecoyAgentFactory = await ethers.getContractFactory("FinancialDecoyAgent");
    const aizId = ethers.encodeBytes32String("TEST-DECOY-AIZ");
    const aizName = "TestDecoyAIZ";
    const aizDescription = "Test Decoy AIZ";
    
    financialDecoyAgent = await FinancialDecoyAgentFactory.deploy(
      aizId,
      await aizRegistry.getAddress(),
      await intentBus.getAddress(),
      await competitorRegistry.getAddress(),
      await strategicThreatDB.getAddress(),
      await decisionLogger.getAddress(),
      aizName,
      aizDescription
    );
    await financialDecoyAgent.waitForDeployment();

    // Register the AIZ
    await aizRegistry.registerAIZ(
      aizId,
      aizName,
      aizDescription,
      await financialDecoyAgent.getAddress(),
      [31337], // Local test network
      [await financialDecoyAgent.getAddress()]
    );
  });

  describe("Decoy Transaction Management", function () {
    it("Should create a decoy transaction", async function () {
      const targetContract = await addr1.getAddress();
      const data = ethers.encodeBytes32String("decoy_data");
      const gasLimit = 100000;
      
      await expect(financialDecoyAgent.createDecoyTransaction(targetContract, data, gasLimit))
        .to.emit(financialDecoyAgent, "DecoyTransactionCreated");
    });

    it("Should record competitor resource waste", async function () {
      const competitorAddress = await competitor1.getAddress();
      const gasWasted = 50000;
      const strategy = "fake_arbitrage";
      
      await expect(financialDecoyAgent.recordCompetitorResourceWaste(competitorAddress, gasWasted, strategy))
        .to.emit(financialDecoyAgent, "CompetitorResourceWasted")
        .withArgs(competitorAddress, gasWasted, strategy);
    });
  });

  describe("Decoy Campaign Management", function () {
    it("Should create a decoy campaign", async function () {
      const name = "Test Campaign";
      const targetCompetitors = [await competitor1.getAddress()];
      const budget = 1000;
      
      await expect(financialDecoyAgent.createDecoyCampaign(name, targetCompetitors, budget))
        .to.emit(financialDecoyAgent, "DecoyCampaignCreated");
    });
  });

  describe("Integration with Other Components", function () {
    it("Should have correct initial state", async function () {
      expect(await financialDecoyAgent.decoyTransactionCount()).to.equal(0);
      expect(await financialDecoyAgent.decoyCampaignCount()).to.equal(0);
    });
  });
});