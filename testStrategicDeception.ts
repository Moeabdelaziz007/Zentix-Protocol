import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  FinancialDecoyAgent,
  DynamicReputationProtocol,
  GeneticEvolutionAgent,
  CompetitivePerceptionAIZ,
  AIZRegistry,
  ConsciousDecisionLogger,
  IntentBus,
  CompetitorRegistry,
  StrategicThreatDB
} from "../typechain-types";
import { Signer } from "ethers";

describe("Strategic Deception Components", function () {
  let financialDecoyAgent: FinancialDecoyAgent;
  let dynamicReputation: DynamicReputationProtocol;
  let geneticEvolution: GeneticEvolutionAgent;
  let competitivePerception: CompetitivePerceptionAIZ;
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
    const decoyAizId = ethers.encodeBytes32String("TEST-DECOY-AIZ");
    const decoyAizName = "TestDecoyAIZ";
    const decoyAizDescription = "Test Decoy AIZ";
    
    financialDecoyAgent = await FinancialDecoyAgentFactory.deploy(
      decoyAizId,
      await aizRegistry.getAddress(),
      await intentBus.getAddress(),
      await competitorRegistry.getAddress(),
      await strategicThreatDB.getAddress(),
      await decisionLogger.getAddress(),
      decoyAizName,
      decoyAizDescription
    );
    await financialDecoyAgent.waitForDeployment();

    // Deploy DynamicReputationProtocol
    const DynamicReputationFactory = await ethers.getContractFactory("DynamicReputationProtocol");
    const reputationAizId = ethers.encodeBytes32String("TEST-REPUTATION-AIZ");
    const reputationAizName = "TestReputationAIZ";
    const reputationAizDescription = "Test Reputation AIZ";
    
    dynamicReputation = await DynamicReputationFactory.deploy(
      reputationAizId,
      await aizRegistry.getAddress(),
      await decisionLogger.getAddress(),
      reputationAizName,
      reputationAizDescription
    );
    await dynamicReputation.waitForDeployment();

    // Deploy GeneticEvolutionAgent
    const GeneticEvolutionFactory = await ethers.getContractFactory("GeneticEvolutionAgent");
    const evolutionAizId = ethers.encodeBytes32String("TEST-EVOLUTION-AIZ");
    const evolutionAizName = "TestEvolutionAIZ";
    const evolutionAizDescription = "Test Evolution AIZ";
    
    geneticEvolution = await GeneticEvolutionFactory.deploy(
      evolutionAizId,
      await aizRegistry.getAddress(),
      await intentBus.getAddress(),
      await decisionLogger.getAddress(),
      evolutionAizName,
      evolutionAizDescription
    );
    await geneticEvolution.waitForDeployment();

    // Deploy CompetitivePerceptionAIZ
    const CompetitivePerceptionFactory = await ethers.getContractFactory("CompetitivePerceptionAIZ");
    competitivePerception = await CompetitivePerceptionFactory.deploy(
      await aizRegistry.getAddress(),
      await intentBus.getAddress()
    );
    await competitivePerception.waitForDeployment();

    // Register all AIZs
    await aizRegistry.registerAIZ(
      decoyAizId,
      decoyAizName,
      decoyAizDescription,
      await financialDecoyAgent.getAddress(),
      [31337], // Local test network
      [await financialDecoyAgent.getAddress()]
    );

    await aizRegistry.registerAIZ(
      reputationAizId,
      reputationAizName,
      reputationAizDescription,
      await dynamicReputation.getAddress(),
      [31337], // Local test network
      [await dynamicReputation.getAddress()]
    );

    await aizRegistry.registerAIZ(
      evolutionAizId,
      evolutionAizName,
      evolutionAizDescription,
      await geneticEvolution.getAddress(),
      [31337], // Local test network
      [await geneticEvolution.getAddress()]
    );

    await aizRegistry.registerAIZ(
      ethers.encodeBytes32String("TEST-PERCEPTION-AIZ"),
      "TestPerceptionAIZ",
      "Test Perception AIZ",
      await competitivePerception.getAddress(),
      [31337], // Local test network
      [await competitivePerception.getAddress()]
    );
  });

  describe("Financial Decoy Agent", function () {
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

    it("Should create a decoy campaign", async function () {
      const name = "Test Campaign";
      const targetCompetitors = [await competitor1.getAddress()];
      const budget = 1000;
      
      await expect(financialDecoyAgent.createDecoyCampaign(name, targetCompetitors, budget))
        .to.emit(financialDecoyAgent, "DecoyCampaignCreated");
    });
  });

  describe("Dynamic Reputation Protocol", function () {
    it("Should update reputation score", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ");
      const scoreChange = 50;
      const reason = "Successful task completion";
      
      await expect(dynamicReputation.updateReputation(aizId, scoreChange, reason, ethers.encodeBytes32String("")))
        .to.emit(dynamicReputation, "ReputationUpdated");
    });

    it("Should record economic contribution", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ");
      const amount = 1000;
      const reason = "Revenue generation";
      
      await dynamicReputation.recordEconomicContribution(aizId, amount, reason);
      // Check that the reputation was updated
      const reputation = await dynamicReputation.getAIZReputation(aizId);
      expect(reputation.economicContributions).to.equal(amount);
    });

    it("Should record collaboration", async function () {
      const participantAIZs = [ethers.encodeBytes32String("AIZ-1"), ethers.encodeBytes32String("AIZ-2")];
      const taskDescription = "Complex multi-domain task";
      const completionScore = 95;
      
      await expect(dynamicReputation.recordCollaboration(participantAIZs, taskDescription, completionScore))
        .to.emit(dynamicReputation, "CollaborationCompleted");
    });
  });

  describe("Genetic Evolution Agent", function () {
    it("Should create a random genome", async function () {
      const name = "Test Genome";
      
      await expect(geneticEvolution.createRandomGenome(name))
        .to.emit(geneticEvolution, "GenomeCreated");
    });

    it("Should create a tournament", async function () {
      const participantIds = [
        ethers.encodeBytes32String("GENOME-1"),
        ethers.encodeBytes32String("GENOME-2")
      ];
      const name = "Test Tournament";
      
      await expect(geneticEvolution.createTournament(participantIds, name))
        .to.emit(geneticEvolution, "TournamentCreated");
    });

    it("Should test a genome", async function () {
      // First create a genome
      const genomeId = await geneticEvolution.createRandomGenome("Test Genome");
      
      // Then test it
      await expect(geneticEvolution.testGenome(genomeId, 80, 20, 90))
        .to.emit(geneticEvolution, "GenomeTested");
    });
  });

  describe("Competitive Perception AIZ", function () {
    it("Should add a competitor", async function () {
      const competitorAddress = await competitor1.getAddress();
      const name = "Uniswap";
      
      await expect(competitivePerception.addCompetitor(competitorAddress, name))
        .to.emit(competitivePerception, "CompetitorAdded")
        .withArgs(competitorAddress, name);
    });

    it("Should analyze a competitor", async function () {
      const competitorAddress = await competitor1.getAddress();
      const name = "Uniswap";
      
      // First add competitor
      await competitivePerception.addCompetitor(competitorAddress, name);
      
      // Then analyze
      await expect(competitivePerception.analyzeCompetitor(competitorAddress))
        .to.emit(competitivePerception, "CompetitorAnalyzed");
    });

    it("Should create a strategic alert", async function () {
      const alertType = "DECOY_NEEDED";
      const description = "MEV bot detected";
      const source = await competitor1.getAddress();
      
      await expect(competitivePerception.createStrategicAlert(alertType, description, source))
        .to.emit(competitivePerception, "StrategicAlertCreated");
    });
  });

  describe("Component Integration", function () {
    it("Should have correct initial state", async function () {
      expect(await financialDecoyAgent.decoyTransactionCount()).to.equal(0);
      expect(await financialDecoyAgent.decoyCampaignCount()).to.equal(0);
      expect(await geneticEvolution.genomeCount()).to.equal(0);
      expect(await geneticEvolution.tournamentCount()).to.equal(0);
    });
  });
});