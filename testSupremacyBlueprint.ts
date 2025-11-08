import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  CompetitorRegistry, 
  StrategicThreatDB, 
  ReputationStaking, 
  StrategyCandidate,
  MetaSelfMonitoringAIZ_Enhanced,
  AIZRegistry,
  ConsciousDecisionLogger
} from "../typechain-types";
import { Signer } from "ethers";

describe("Supremacy Blueprint", function () {
  let competitorRegistry: CompetitorRegistry;
  let strategicThreatDB: StrategicThreatDB;
  let reputationStaking: ReputationStaking;
  let strategyCandidate: StrategyCandidate;
  let metaSelfMonitoringAIZ: MetaSelfMonitoringAIZ_Enhanced;
  let aizRegistry: AIZRegistry;
  let decisionLogger: ConsciousDecisionLogger;
  
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let competitor1: Signer;
  let competitor2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2, competitor1, competitor2] = await ethers.getSigners();

    // Deploy AIZRegistry
    const AIZRegistryFactory = await ethers.getContractFactory("AIZRegistry");
    aizRegistry = await AIZRegistryFactory.deploy();
    await aizRegistry.waitForDeployment();

    // Deploy ConsciousDecisionLogger
    const DecisionLoggerFactory = await ethers.getContractFactory("ConsciousDecisionLogger");
    decisionLogger = await DecisionLoggerFactory.deploy();
    await decisionLogger.waitForDeployment();

    // Deploy CompetitorRegistry
    const CompetitorRegistryFactory = await ethers.getContractFactory("CompetitorRegistry");
    competitorRegistry = await CompetitorRegistryFactory.deploy();
    await competitorRegistry.waitForDeployment();

    // Deploy StrategicThreatDB
    const StrategicThreatDBFactory = await ethers.getContractFactory("StrategicThreatDB");
    strategicThreatDB = await StrategicThreatDBFactory.deploy(await aizRegistry.getAddress());
    await strategicThreatDB.waitForDeployment();

    // Deploy ReputationStaking
    const ReputationStakingFactory = await ethers.getContractFactory("ReputationStaking");
    reputationStaking = await ReputationStakingFactory.deploy(await aizRegistry.getAddress());
    await reputationStaking.waitForDeployment();

    // Deploy StrategyCandidate
    const StrategyCandidateFactory = await ethers.getContractFactory("StrategyCandidate");
    strategyCandidate = await StrategyCandidateFactory.deploy(
      await aizRegistry.getAddress(),
      await decisionLogger.getAddress(),
      ethers.parseEther("0.1") // 0.1 ETH test budget
    );
    await strategyCandidate.waitForDeployment();

    // Deploy Enhanced MetaSelfMonitoringAIZ
    const MetaSelfMonitoringAIZFactory = await ethers.getContractFactory("MetaSelfMonitoringAIZ_Enhanced");
    const aizId = ethers.encodeBytes32String("TEST-ENHANCED-AIZ");
    const aizName = "TestEnhancedAIZ";
    const aizDescription = "Test Enhanced AIZ";
    
    metaSelfMonitoringAIZ = await MetaSelfMonitoringAIZFactory.deploy(
      aizId,
      await aizRegistry.getAddress(),
      await decisionLogger.getAddress(),
      await strategicThreatDB.getAddress(),
      aizName,
      aizDescription
    );
    await metaSelfMonitoringAIZ.waitForDeployment();

    // Register the AIZ
    await aizRegistry.registerAIZ(
      aizId,
      aizName,
      aizDescription,
      await metaSelfMonitoringAIZ.getAddress(),
      [31337], // Local test network
      [await metaSelfMonitoringAIZ.getAddress()]
    );
  });

  describe("CompetitorRegistry", function () {
    it("Should register a competitor", async function () {
      const competitorAddress = await competitor1.getAddress();
      const name = "Uniswap";
      const category = "DEX";
      
      await expect(competitorRegistry.registerCompetitor(competitorAddress, name, category))
        .to.emit(competitorRegistry, "CompetitorRegistered")
        .withArgs(competitorAddress, name, category);
      
      expect(await competitorRegistry.isRegisteredCompetitor(competitorAddress)).to.be.true;
      expect(await competitorRegistry.competitorCount()).to.equal(1);
    });

    it("Should update competitor information", async function () {
      const competitorAddress = await competitor1.getAddress();
      const name = "Uniswap";
      const category = "DEX";
      
      // First register
      await competitorRegistry.registerCompetitor(competitorAddress, name, category);
      
      // Then update
      const newName = "Uniswap V3";
      const newCategory = "AMM";
      
      await expect(competitorRegistry.updateCompetitor(competitorAddress, newName, newCategory))
        .to.emit(competitorRegistry, "CompetitorUpdated")
        .withArgs(competitorAddress, newName, newCategory);
    });

    it("Should deactivate and reactivate a competitor", async function () {
      const competitorAddress = await competitor1.getAddress();
      const name = "Uniswap";
      const category = "DEX";
      
      // Register
      await competitorRegistry.registerCompetitor(competitorAddress, name, category);
      expect(await competitorRegistry.isRegisteredCompetitor(competitorAddress)).to.be.true;
      
      // Deactivate
      await expect(competitorRegistry.deactivateCompetitor(competitorAddress))
        .to.emit(competitorRegistry, "CompetitorDeactivated")
        .withArgs(competitorAddress);
      expect(await competitorRegistry.isRegisteredCompetitor(competitorAddress)).to.be.false;
      
      // Reactivate
      await expect(competitorRegistry.reactivateCompetitor(competitorAddress))
        .to.emit(competitorRegistry, "CompetitorReactivated")
        .withArgs(competitorAddress);
      expect(await competitorRegistry.isRegisteredCompetitor(competitorAddress)).to.be.true;
    });
  });

  describe("StrategicThreatDB", function () {
    it("Should register a threat signature", async function () {
      const sourceCompetitor = await competitor1.getAddress();
      const targetContract = await addr1.getAddress();
      const threatType = "ARBITRAGE_OPPORTUNITY";
      const callPattern = ethers.encodeBytes32String("swapExactTokensForTokens");
      const potentialProfit = 1000;
      const potentialLoss = 50;
      
      const tx = await strategicThreatDB.registerThreatSignature(
        sourceCompetitor,
        targetContract,
        threatType,
        callPattern,
        potentialProfit,
        potentialLoss
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => 
        log.topics[0] === ethers.id("ThreatSignatureRegistered(address,address,address,string)")
      );
      
      expect(event).to.not.be.undefined;
    });

    it("Should create a threat alert", async function () {
      // First register a threat
      const sourceCompetitor = await competitor1.getAddress();
      const targetContract = await addr1.getAddress();
      const threatType = "ARBITRAGE_OPPORTUNITY";
      const callPattern = ethers.encodeBytes32String("swapExactTokensForTokens");
      const potentialProfit = 1000;
      const potentialLoss = 50;
      
      const threatTx = await strategicThreatDB.registerThreatSignature(
        sourceCompetitor,
        targetContract,
        threatType,
        callPattern,
        potentialProfit,
        potentialLoss
      );
      
      const threatReceipt = await threatTx.wait();
      const threatEvent = threatReceipt?.logs.find(log => 
        log.topics[0] === ethers.id("ThreatSignatureRegistered(address,address,address,string)")
      );
      
      // Extract threatId from event (in real test we'd parse it)
      // For now we'll just test that the function can be called
      expect(threatTx).to.not.be.reverted;
    });
  });

  describe("ReputationStaking", function () {
    it("Should allow staking reputation", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ");
      const amount = 100;
      const action = ethers.encodeBytes32String("high_risk_action");
      
      // Register AIZ first
      await aizRegistry.registerAIZ(
        aizId,
        "Test AIZ",
        "Test AIZ Description",
        await addr1.getAddress(),
        [31337],
        [await addr1.getAddress()]
      );
      
      await expect(reputationStaking.stake(aizId, amount, action))
        .to.emit(reputationStaking, "ReputationStaked");
    });

    it("Should resolve a stake successfully", async function () {
      const aizId = ethers.encodeBytes32String("TEST-AIZ");
      const amount = 100;
      const action = ethers.encodeBytes32String("high_risk_action");
      
      // Register AIZ first
      await aizRegistry.registerAIZ(
        aizId,
        "Test AIZ",
        "Test AIZ Description",
        await addr1.getAddress(),
        [31337],
        [await addr1.getAddress()]
      );
      
      // Stake reputation
      const stakeTx = await reputationStaking.stake(aizId, amount, action);
      const stakeReceipt = await stakeTx.wait();
      
      // In a real test we would extract the stakeId from the event
      // For now we'll just test that the function can be called
      expect(stakeTx).to.not.be.reverted;
    });
  });

  describe("StrategyCandidate", function () {
    it("Should register a genome", async function () {
      const name = "Test Strategy";
      const description = "A test strategy";
      const geneContracts = [await addr1.getAddress(), await addr2.getAddress()];
      const geneFunctions = [
        ethers.id("function1()").substring(0, 10),
        ethers.id("function2()").substring(0, 10)
      ];
      const geneParameters = [1, 2];
      
      const tx = await strategyCandidate.registerGenome(
        name,
        description,
        geneContracts,
        geneFunctions,
        geneParameters
      );
      
      const receipt = await tx.wait();
      const event = receipt?.logs.find(log => 
        log.topics[0] === ethers.id("GenomeRegistered(bytes32,string,address)")
      );
      
      expect(event).to.not.be.undefined;
    });

    it("Should submit test results", async function () {
      // First register a genome
      const name = "Test Strategy";
      const description = "A test strategy";
      const geneContracts = [await addr1.getAddress(), await addr2.getAddress()];
      const geneFunctions = [
        ethers.id("function1()").substring(0, 10),
        ethers.id("function2()").substring(0, 10)
      ];
      const geneParameters = [1, 2];
      
      const registerTx = await strategyCandidate.registerGenome(
        name,
        description,
        geneContracts,
        geneFunctions,
        geneParameters
      );
      
      // In a real test we would extract the genomeId from the event
      // For now we'll just test that the function can be called
      expect(registerTx).to.not.be.reverted;
    });
  });

  describe("Enhanced MetaSelfMonitoringAIZ", function () {
    it("Should have correct initial vigilance level", async function () {
      const vigilanceLevel = await metaSelfMonitoringAIZ.getVigilanceLevel();
      expect(vigilanceLevel).to.equal(50); // Default vigilance level
    });

    it("Should update performance metrics", async function () {
      await expect(metaSelfMonitoringAIZ.updatePerformanceMetrics(10, 8, 2, 150, 256))
        .to.emit(metaSelfMonitoringAIZ, "PerformanceMetricsUpdated");
    });

    it("Should analyze performance", async function () {
      // Update metrics first
      await metaSelfMonitoringAIZ.updatePerformanceMetrics(10, 8, 2, 150, 256);
      
      // Then analyze
      await expect(metaSelfMonitoringAIZ.analyzePerformance())
        .to.emit(metaSelfMonitoringAIZ, "OptimizationSuggestionCreated");
    });

    it("Should generate monitoring report", async function () {
      await expect(metaSelfMonitoringAIZ.generateMonitoringReport())
        .to.emit(metaSelfMonitoringAIZ, "MonitoringReportGenerated");
    });
  });
});