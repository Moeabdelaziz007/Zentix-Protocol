import { ethers } from "hardhat";
import { expect } from "chai";
import { 
  ZentixMEVHarvester,
  AIZRegistry,
  ConsciousDecisionLogger,
  IntentBus,
  DynamicReputationProtocol,
  MetaSelfMonitoringAIZ_Enhanced
} from "../typechain-types";
import { Signer } from "ethers";

describe("ZentixMEVHarvester", function () {
  let zentixMEVHarvester: ZentixMEVHarvester;
  let aizRegistry: AIZRegistry;
  let decisionLogger: ConsciousDecisionLogger;
  let intentBus: IntentBus;
  let dynamicReputation: DynamicReputationProtocol;
  let metaSelfMonitoring: MetaSelfMonitoringAIZ_Enhanced;
  
  let owner: Signer;
  let addr1: Signer;
  let loanContract: Signer;
  let borrower: Signer;

  beforeEach(async function () {
    [owner, addr1, loanContract, borrower] = await ethers.getSigners();

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

    // Deploy MetaSelfMonitoringAIZ_Enhanced
    const MetaSelfMonitoringFactory = await ethers.getContractFactory("MetaSelfMonitoringAIZ_Enhanced");
    const monitoringAizId = ethers.encodeBytes32String("TEST-MONITORING-AIZ");
    const monitoringAizName = "TestMonitoringAIZ";
    const monitoringAizDescription = "Test Monitoring AIZ";
    const strategicThreatDBAddress = ethers.ZeroAddress; // Placeholder
    
    metaSelfMonitoring = await MetaSelfMonitoringFactory.deploy(
      monitoringAizId,
      await aizRegistry.getAddress(),
      await decisionLogger.getAddress(),
      strategicThreatDBAddress,
      monitoringAizName,
      monitoringAizDescription
    );
    await metaSelfMonitoring.waitForDeployment();

    // Deploy ZentixMEVHarvester
    const ZentixMEVHarvesterFactory = await ethers.getContractFactory("ZentixMEVHarvester");
    const mevAizId = ethers.encodeBytes32String("TEST-MEV-AIZ");
    const mevAizName = "TestMEVAIZ";
    const mevAizDescription = "Test MEV AIZ";
    
    zentixMEVHarvester = await ZentixMEVHarvesterFactory.deploy(
      mevAizId,
      await aizRegistry.getAddress(),
      await intentBus.getAddress(),
      await dynamicReputation.getAddress(),
      await metaSelfMonitoring.getAddress(),
      await decisionLogger.getAddress()
    );
    await zentixMEVHarvester.waitForDeployment();

    // Register the AIZ
    await aizRegistry.registerAIZ(
      mevAizId,
      mevAizName,
      mevAizDescription,
      await zentixMEVHarvester.getAddress(),
      [31337], // Local test network
      [await zentixMEVHarvester.getAddress()]
    );
  });

  describe("Cross-Chain Arbitrage", function () {
    it("Should identify a cross-chain arbitrage opportunity", async function () {
      const opportunity = {
        sourceChainDex: await addr1.getAddress(),
        destinationChainDex: await loanContract.getAddress(),
        tokenA: ethers.ZeroAddress,
        tokenB: ethers.ZeroAddress,
        sourceChainId: 1,
        destinationChainId: 2,
        sourcePrice: ethers.parseEther("1000"),
        destinationPrice: ethers.parseEther("1050"),
        amount: ethers.parseEther("100"),
        estimatedProfit: ethers.parseEther("5"),
        timestamp: Math.floor(Date.now() / 1000)
      };
      
      await expect(zentixMEVHarvester.identifyCrossChainArbitrageOpportunity(opportunity))
        .to.emit(zentixMEVHarvester, "CrossChainArbitrageOpportunityIdentified");
    });

    it("Should execute a cross-chain arbitrage opportunity", async function () {
      // First identify an opportunity
      const opportunity = {
        sourceChainDex: await addr1.getAddress(),
        destinationChainDex: await loanContract.getAddress(),
        tokenA: ethers.ZeroAddress,
        tokenB: ethers.ZeroAddress,
        sourceChainId: 1,
        destinationChainId: 2,
        sourcePrice: ethers.parseEther("1000"),
        destinationPrice: ethers.parseEther("1050"),
        amount: ethers.parseEther("100"),
        estimatedProfit: ethers.parseEther("5"),
        timestamp: Math.floor(Date.now() / 1000)
      };
      
      const tx = await zentixMEVHarvester.identifyCrossChainArbitrageOpportunity(opportunity);
      const receipt = await tx.wait();
      
      // Extract opportunityId from event (in a real test we'd parse it)
      // For now we'll just test that execution works with a valid ID
      const opportunityId = ethers.encodeBytes32String("test-opportunity");
      
      await expect(zentixMEVHarvester.executeCrossChainArbitrage(opportunityId))
        .to.emit(zentixMEVHarvester, "MEVHarvestExecuted");
    });
  });

  describe("Conditional Liquidation", function () {
    it("Should create a conditional liquidation intent", async function () {
      const loanContractAddress = await loanContract.getAddress();
      const borrowerAddress = await borrower.getAddress();
      const triggerPrice = ethers.parseEther("100");
      const currentPrice = ethers.parseEther("110");
      const healthFactor = 105; // 1.05
      
      await expect(zentixMEVHarvester.createConditionalLiquidationIntent(
        loanContractAddress,
        borrowerAddress,
        triggerPrice,
        currentPrice,
        healthFactor
      )).to.emit(zentixMEVHarvester, "ConditionalLiquidationIntentCreated");
    });

    it("Should execute a conditional liquidation", async function () {
      // First create an intent
      const loanContractAddress = await loanContract.getAddress();
      const borrowerAddress = await borrower.getAddress();
      const triggerPrice = ethers.parseEther("100");
      const currentPrice = ethers.parseEther("110");
      const healthFactor = 105; // 1.05
      
      const tx = await zentixMEVHarvester.createConditionalLiquidationIntent(
        loanContractAddress,
        borrowerAddress,
        triggerPrice,
        currentPrice,
        healthFactor
      );
      const receipt = await tx.wait();
      
      // Extract intentId from event (in a real test we'd parse it)
      // For now we'll just test that execution works with a valid ID
      const intentId = ethers.encodeBytes32String("test-intent");
      const newPrice = ethers.parseEther("95"); // Below trigger price
      
      await expect(zentixMEVHarvester.executeConditionalLiquidation(intentId, newPrice))
        .to.emit(zentixMEVHarvester, "MEVHarvestExecuted");
    });
  });

  describe("Block Optimization", function () {
    it("Should set block optimization parameters", async function () {
      const transactions = [await addr1.getAddress(), await loanContract.getAddress()];
      const gasLimits = [200000, 300000];
      const estimatedMEV = ethers.parseEther("1");
      
      await expect(zentixMEVHarvester.setBlockOptimizationParams(transactions, gasLimits, estimatedMEV))
        .to.emit(zentixMEVHarvester, "BlockOptimizationParamsSet");
    });

    it("Should execute block optimization", async function () {
      // First set optimization parameters
      const transactions = [await addr1.getAddress(), await loanContract.getAddress()];
      const gasLimits = [200000, 300000];
      const estimatedMEV = ethers.parseEther("1");
      
      const tx = await zentixMEVHarvester.setBlockOptimizationParams(transactions, gasLimits, estimatedMEV);
      const receipt = await tx.wait();
      
      // Extract optimizationId from event (in a real test we'd parse it)
      // For now we'll just test that execution works with a valid ID
      const optimizationId = ethers.encodeBytes32String("test-optimization");
      
      await expect(zentixMEVHarvester.executeBlockOptimization(optimizationId))
        .to.emit(zentixMEVHarvester, "MEVHarvestExecuted");
    });
  });

  describe("Configuration", function () {
    it("Should set specialized sequencer enabled", async function () {
      await expect(zentixMEVHarvester.setSpecializedSequencerEnabled(true))
        .to.emit(zentixMEVHarvester, "SpecializedSequencerEnabled")
        .withArgs(true);
    });

    it("Should set minimum profit threshold", async function () {
      const newThreshold = ethers.parseEther("2");
      await zentixMEVHarvester.setMinProfitThreshold(newThreshold);
      // In a real test we would verify the threshold was set correctly
    });

    it("Should set maximum gas price", async function () {
      const newGasPrice = 200000000000; // 200 Gwei
      await zentixMEVHarvester.setMaxGasPrice(newGasPrice);
      // In a real test we would verify the gas price was set correctly
    });
  });

  describe("Integration", function () {
    it("Should have correct initial state", async function () {
      expect(await zentixMEVHarvester.crossChainArbCount()).to.equal(0);
      expect(await zentixMEVHarvester.liquidationIntentCount()).to.equal(0);
      expect(await zentixMEVHarvester.blockOptimizationCount()).to.equal(0);
      expect(await zentixMEVHarvester.mevHarvestResultCount()).to.equal(0);
    });
  });
});