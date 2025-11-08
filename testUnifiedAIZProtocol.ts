#!/usr/bin/env tsx
/**
 * Test Script: Unified AIZ Protocol
 * Tests all core AIZ protocol components with enhanced integration
 */

import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing Unified AIZ Protocol...\n");
  
  // Get the first account as deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  try {
    // Deploy AIZRegistry
    console.log("Deploying AIZRegistry...");
    const AIZRegistry = await ethers.getContractFactory("AIZRegistry");
    const aizRegistry = await AIZRegistry.deploy();
    await aizRegistry.deployed();
    console.log("✅ AIZRegistry deployed to:", aizRegistry.address);
    
    // Deploy ConsciousDecisionLogger
    console.log("\nDeploying ConsciousDecisionLogger...");
    const dummyMessengerAddress = deployer.address;
    const ConsciousDecisionLogger = await ethers.getContractFactory("ConsciousDecisionLogger");
    const decisionLogger = await ConsciousDecisionLogger.deploy(dummyMessengerAddress, aizRegistry.address);
    await decisionLogger.deployed();
    console.log("✅ ConsciousDecisionLogger deployed to:", decisionLogger.address);
    
    // Deploy IntentBus
    console.log("\nDeploying IntentBus...");
    const IntentBus = await ethers.getContractFactory("IntentBus");
    const intentBus = await IntentBus.deploy(aizRegistry.address);
    await intentBus.deployed();
    console.log("✅ IntentBus deployed to:", intentBus.address);
    
    // Deploy ToolRegistry
    console.log("\nDeploying ToolRegistry...");
    const ToolRegistry = await ethers.getContractFactory("ToolRegistry");
    const toolRegistry = await ToolRegistry.deploy(aizRegistry.address);
    await toolRegistry.deployed();
    console.log("✅ ToolRegistry deployed to:", toolRegistry.address);
    
    // Deploy DataStreamRegistry
    console.log("\nDeploying DataStreamRegistry...");
    const DataStreamRegistry = await ethers.getContractFactory("DataStreamRegistry");
    const dataStreamRegistry = await DataStreamRegistry.deploy(aizRegistry.address);
    await dataStreamRegistry.deployed();
    console.log("✅ DataStreamRegistry deployed to:", dataStreamRegistry.address);
    
    // Deploy DynamicReputationProtocol
    console.log("\nDeploying DynamicReputationProtocol...");
    const DynamicReputationProtocol = await ethers.getContractFactory("DynamicReputationProtocol");
    const reputationProtocol = await DynamicReputationProtocol.deploy(
      ethers.utils.formatBytes32String("AIZ-REPUTATION"),
      aizRegistry.address,
      decisionLogger.address,
      "Dynamic Reputation Protocol",
      "Protocol for managing AIZ reputation"
    );
    await reputationProtocol.deployed();
    console.log("✅ DynamicReputationProtocol deployed to:", reputationProtocol.address);
    
    // Deploy MetaSelfMonitoringAIZ
    console.log("\nDeploying MetaSelfMonitoringAIZ...");
    const MetaSelfMonitoringAIZ = await ethers.getContractFactory("MetaSelfMonitoringAIZ");
    const selfMonitoring = await MetaSelfMonitoringAIZ.deploy(
      ethers.utils.formatBytes32String("AIZ-MONITORING"),
      aizRegistry.address,
      decisionLogger.address,
      "Meta Self-Monitoring AIZ",
      "AIZ for self-monitoring and optimization"
    );
    await selfMonitoring.deployed();
    console.log("✅ MetaSelfMonitoringAIZ deployed to:", selfMonitoring.address);
    
    // Deploy MEV Harvest Multiplier NFT
    console.log("\nDeploying MEVHarvestMultiplierNFT...");
    const MEVHarvestMultiplierNFT = await ethers.getContractFactory("MEVHarvestMultiplierNFT");
    const mevMultiplierNFT = await MEVHarvestMultiplierNFT.deploy(
      ethers.constants.AddressZero,
      deployer.address
    );
    await mevMultiplierNFT.deployed();
    console.log("✅ MEVHarvestMultiplierNFT deployed to:", mevMultiplierNFT.address);
    
    // Deploy Enhanced Zentix MEV Harvester
    console.log("\nDeploying EnhancedZentixMEVHarvester...");
    const EnhancedZentixMEVHarvester = await ethers.getContractFactory("EnhancedZentixMEVHarvester");
    const mevHarvester = await EnhancedZentixMEVHarvester.deploy(
      ethers.utils.formatBytes32String("AIZ-MEV-HARVESTER"),
      aizRegistry.address,
      decisionLogger.address,
      intentBus.address,
      reputationProtocol.address,
      selfMonitoring.address,
      mevMultiplierNFT.address
    );
    await mevHarvester.deployed();
    console.log("✅ EnhancedZentixMEVHarvester deployed to:", mevHarvester.address);
    
    // Update MEV Harvest Multiplier NFT with the MEV Harvester address
    console.log("\nSetting MEV Harvester address in MEVHarvestMultiplierNFT...");
    await mevMultiplierNFT.setMEVHarvesterAddress(mevHarvester.address);
    console.log("✅ MEV Harvester address set in MEVHarvestMultiplierNFT");
    
    // Register core AIZs
    console.log("\nRegistering core AIZs...");
    
    // Register Revenue Generation AIZ
    const revenueGenAIZId = ethers.utils.formatBytes32String("AIZ-REVENUE-GEN");
    await aizRegistry.registerAIZ(
      revenueGenAIZId,
      "Revenue Generation AIZ",
      "AIZ specialized in automated DeFi strategies for yield farming and arbitrage",
      deployer.address,
      [10], // OP Mainnet
      [deployer.address]
    );
    console.log("✅ Registered Revenue Generation AIZ");
    
    // Grant capabilities to Revenue Generation AIZ
    const canUseFlashLoans = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("canUseFlashLoans()")).substring(0, 10);
    await aizRegistry.setCapability(revenueGenAIZId, canUseFlashLoans, true);
    console.log("✅ Granted flash loan capability to Revenue Generation AIZ");
    
    const canDeployNewContracts = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("canDeployNewContracts()")).substring(0, 10);
    await aizRegistry.setCapability(revenueGenAIZId, canDeployNewContracts, true);
    console.log("✅ Granted contract deployment capability to Revenue Generation AIZ");
    
    // Register Marketing AIZ
    const marketingAIZId = ethers.utils.formatBytes32String("AIZ-MARKETING");
    await aizRegistry.registerAIZ(
      marketingAIZId,
      "Marketing AIZ",
      "AIZ specialized in AI-powered marketing strategies and campaign management",
      deployer.address,
      [10], // OP Mainnet
      [deployer.address]
    );
    console.log("✅ Registered Marketing AIZ");
    
    // Grant capabilities to Marketing AIZ
    const canSpendFromTreasury = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("canSpendFromTreasury()")).substring(0, 10);
    await aizRegistry.setCapability(marketingAIZId, canSpendFromTreasury, true);
    console.log("✅ Granted treasury spending capability to Marketing AIZ");
    
    // Register the MEV Harvester AIZ
    const mevHarvesterAIZId = ethers.utils.formatBytes32String("AIZ-MEV-HARVESTER");
    await aizRegistry.registerAIZ(
      mevHarvesterAIZId,
      "Enhanced Zentix MEV Harvester",
      "Enhanced AIZ for harvesting MEV through advanced strategies",
      mevHarvester.address,
      [10], // OP Mainnet
      [mevHarvester.address]
    );
    console.log("✅ Registered Enhanced Zentix MEV Harvester AIZ");
    
    // Grant capabilities to the MEV Harvester AIZ
    console.log("\nGranting capabilities to Enhanced Zentix MEV Harvester AIZ...");
    
    const mevCapabilities = [
      "canIdentifyArbitrage()",
      "canExecuteArbitrage()",
      "canCreateLiquidationIntent()",
      "canExecuteLiquidation()",
      "canSetBlockOptimization()",
      "canExecuteBlockOptimization()",
      "canConfigureMEVHarvester()"
    ];
    
    for (const capability of mevCapabilities) {
      const functionSelector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(capability)).substring(0, 10);
      await aizRegistry.setCapability(mevHarvesterAIZId, functionSelector, true);
      console.log(`✅ Granted capability: ${capability}`);
    }
    
    // Test 1: AIZ Registry functionality
    console.log("\nTest 1: Testing AIZ Registry functionality...");
    const aizInfo = await aizRegistry.getAIZ(revenueGenAIZId);
    console.log("✅ Revenue Generation AIZ info retrieved");
    console.log("   Name:", aizInfo.name);
    console.log("   Description:", aizInfo.description);
    
    // Test 2: Capability checking
    console.log("\nTest 2: Testing capability checking...");
    const hasFlashLoanCapability = await aizRegistry.checkCapability(revenueGenAIZId, canUseFlashLoans);
    console.log("✅ Flash loan capability check:", hasFlashLoanCapability);
    
    // Test 3: Intent posting and solving
    console.log("\nTest 3: Testing intent posting and solving...");
    const intentData = ethers.utils.toUtf8Bytes("Test intent for AIZ collaboration");
    const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const intentId = await intentBus.postIntent(intentData, expiry, 0, ethers.constants.AddressZero);
    console.log("✅ Intent posted with ID:", intentId);
    
    // Test 4: Tool registration
    console.log("\nTest 4: Testing tool registration...");
    const toolId = await toolRegistry.registerTool(
      "Test Tool",
      "A test tool for AIZ collaboration",
      deployer.address,
      0, // No fee
      ethers.constants.AddressZero
    );
    console.log("✅ Tool registered with ID:", toolId);
    
    // Test 5: Data stream registration
    console.log("\nTest 5: Testing data stream registration...");
    const streamId = await dataStreamRegistry.registerStream(
      "Test Stream",
      "A test data stream for AIZ collaboration",
      0, // No fee
      ethers.constants.AddressZero,
      3600 // 1 hour period
    );
    console.log("✅ Data stream registered with ID:", streamId);
    
    // Test 6: MEV Harvester functionality
    console.log("\nTest 6: Testing MEV Harvester functionality...");
    await mevHarvester.setMinProfitThreshold(ethers.utils.parseEther("0.1"));
    await mevHarvester.setMaxGasPrice(ethers.utils.parseUnits("50", "gwei"));
    await mevHarvester.setSpecializedSequencerEnabled(true);
    console.log("✅ MEV Harvester configuration set");
    
    // Test 7: Cross-chain arbitrage opportunity
    console.log("\nTest 7: Testing cross-chain arbitrage opportunity...");
    const opportunity = {
      sourceChainDex: "0x1234567890123456789012345678901234567890",
      destinationChainDex: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      tokenA: "0xTokenA1234567890123456789012345678901234567890",
      tokenB: "0xTokenBabcdefabcdefabcdefabcdefabcdefabcdefab",
      sourceChainId: 10,
      destinationChainId: 8453,
      sourcePrice: ethers.utils.parseEther("1000"),
      destinationPrice: ethers.utils.parseEther("1010"),
      amount: ethers.utils.parseEther("100"),
      estimatedProfit: ethers.utils.parseEther("1"),
      timestamp: Math.floor(Date.now() / 1000)
    };
    
    const opportunityId = await mevHarvester.callStatic.identifyCrossChainArbitrageOpportunity(opportunity);
    const tx1 = await mevHarvester.identifyCrossChainArbitrageOpportunity(opportunity);
    await tx1.wait();
    console.log("✅ Cross-chain arbitrage opportunity identified with ID:", opportunityId);
    
    // Test 8: Execute cross-chain arbitrage
    console.log("\nTest 8: Executing cross-chain arbitrage...");
    const profit = await mevHarvester.callStatic.executeCrossChainArbitrage(opportunityId);
    const tx2 = await mevHarvester.executeCrossChainArbitrage(opportunityId);
    await tx2.wait();
    console.log("✅ Cross-chain arbitrage executed successfully with profit:", ethers.utils.formatEther(profit), "ETH");
    
    // Test 9: MEV profit distribution
    console.log("\nTest 9: Checking MEV profit distribution...");
    const totalDistributed = await mevMultiplierNFT.totalProfitDistributed();
    console.log("✅ Total MEV profits distributed to NFT holders:", ethers.utils.formatEther(totalDistributed), "ETH");
    
    // Test 10: Performance metrics
    console.log("\nTest 10: Checking performance metrics...");
    const [totalOps, successfulOps, failedOps, avgGas] = await mevHarvester.getPerformanceMetrics();
    console.log("✅ Performance metrics:");
    console.log("   Total operations:", totalOps.toString());
    console.log("   Successful operations:", successfulOps.toString());
    console.log("   Failed operations:", failedOps.toString());
    console.log("   Average gas used:", avgGas.toString());
    
    console.log("\n🎉 All Unified AIZ Protocol tests passed!");
    console.log("\n📋 Summary of deployed components:");
    console.log("   AIZRegistry:", aizRegistry.address);
    console.log("   ConsciousDecisionLogger:", decisionLogger.address);
    console.log("   IntentBus:", intentBus.address);
    console.log("   ToolRegistry:", toolRegistry.address);
    console.log("   DataStreamRegistry:", dataStreamRegistry.address);
    console.log("   DynamicReputationProtocol:", reputationProtocol.address);
    console.log("   MetaSelfMonitoringAIZ:", selfMonitoring.address);
    console.log("   MEVHarvestMultiplierNFT:", mevMultiplierNFT.address);
    console.log("   EnhancedZentixMEVHarvester:", mevHarvester.address);
    
  } catch (error: any) {
    console.log("❌ Unified AIZ Protocol test failed:");
    console.log(error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});