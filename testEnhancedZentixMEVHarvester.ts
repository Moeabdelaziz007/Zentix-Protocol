#!/usr/bin/env tsx
/**
 * Test Script: Enhanced Zentix MEV Harvester
 * Tests the enhanced MEV Harvester with improved AIZ integration
 */

import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing Enhanced Zentix MEV Harvester...\n");
  
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
    
    // Register the MEV Harvester AIZ
    console.log("\nRegistering Enhanced Zentix MEV Harvester as an AIZ...");
    const aizId = ethers.utils.formatBytes32String("AIZ-MEV-HARVESTER");
    await aizRegistry.registerAIZ(
      aizId,
      "Enhanced Zentix MEV Harvester",
      "Enhanced AIZ for harvesting MEV through advanced strategies",
      mevHarvester.address,
      [10], // OP Mainnet
      [mevHarvester.address]
    );
    console.log("✅ Registered Enhanced Zentix MEV Harvester AIZ");
    
    // Grant capabilities to the MEV Harvester AIZ
    console.log("\nGranting capabilities to Enhanced Zentix MEV Harvester AIZ...");
    
    const capabilities = [
      "canIdentifyArbitrage()",
      "canExecuteArbitrage()",
      "canCreateLiquidationIntent()",
      "canExecuteLiquidation()",
      "canSetBlockOptimization()",
      "canExecuteBlockOptimization()",
      "canConfigureMEVHarvester()"
    ];
    
    for (const capability of capabilities) {
      const functionSelector = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(capability)).substring(0, 10);
      await aizRegistry.setCapability(aizId, functionSelector, true);
      console.log(`✅ Granted capability: ${capability}`);
    }
    
    // Test 1: Set configuration parameters
    console.log("\nTest 1: Setting configuration parameters...");
    await mevHarvester.setMinProfitThreshold(ethers.utils.parseEther("0.1"));
    await mevHarvester.setMaxGasPrice(ethers.utils.parseUnits("50", "gwei"));
    await mevHarvester.setSpecializedSequencerEnabled(true);
    console.log("✅ Configuration parameters set successfully");
    
    // Test 2: Identify cross-chain arbitrage opportunity
    console.log("\nTest 2: Identifying cross-chain arbitrage opportunity...");
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
    
    // Test 3: Execute cross-chain arbitrage
    console.log("\nTest 3: Executing cross-chain arbitrage...");
    const profit = await mevHarvester.callStatic.executeCrossChainArbitrage(opportunityId);
    const tx2 = await mevHarvester.executeCrossChainArbitrage(opportunityId);
    await tx2.wait();
    console.log("✅ Cross-chain arbitrage executed successfully with profit:", ethers.utils.formatEther(profit), "ETH");
    
    // Test 4: Check MEV Harvest Multiplier NFT distribution
    console.log("\nTest 4: Checking MEV profit distribution...");
    const totalDistributed = await mevMultiplierNFT.totalProfitDistributed();
    console.log("✅ Total MEV profits distributed to NFT holders:", ethers.utils.formatEther(totalDistributed), "ETH");
    
    // Test 5: Check performance metrics
    console.log("\nTest 5: Checking performance metrics...");
    const [totalOps, successfulOps, failedOps, avgGas] = await mevHarvester.getPerformanceMetrics();
    console.log("✅ Performance metrics:");
    console.log("   Total operations:", totalOps.toString());
    console.log("   Successful operations:", successfulOps.toString());
    console.log("   Failed operations:", failedOps.toString());
    console.log("   Average gas used:", avgGas.toString());
    
    // Test 6: Create conditional liquidation intent
    console.log("\nTest 6: Creating conditional liquidation intent...");
    const intentId = await mevHarvester.callStatic.createConditionalLiquidationIntent(
      "0xLoanContract1234567890123456789012345678901234567890",
      "0xBorrower1234567890123456789012345678901234567890",
      ethers.utils.parseEther("1000"), // triggerPrice
      ethers.utils.parseEther("1050"), // currentPrice
      150 // healthFactor
    );
    const tx3 = await mevHarvester.createConditionalLiquidationIntent(
      "0xLoanContract1234567890123456789012345678901234567890",
      "0xBorrower1234567890123456789012345678901234567890",
      ethers.utils.parseEther("1000"), // triggerPrice
      ethers.utils.parseEther("1050"), // currentPrice
      150 // healthFactor
    );
    await tx3.wait();
    console.log("✅ Conditional liquidation intent created with ID:", intentId);
    
    // Test 7: Execute conditional liquidation
    console.log("\nTest 7: Executing conditional liquidation...");
    const liquidationProfit = await mevHarvester.callStatic.executeConditionalLiquidation(intentId, ethers.utils.parseEther("990"));
    const tx4 = await mevHarvester.executeConditionalLiquidation(intentId, ethers.utils.parseEther("990"));
    await tx4.wait();
    console.log("✅ Conditional liquidation executed successfully with profit:", ethers.utils.formatEther(liquidationProfit), "ETH");
    
    // Test 8: Check total MEV harvested
    console.log("\nTest 8: Checking total MEV harvested...");
    const totalMEV = await mevHarvester.getTotalMEVHarvested();
    console.log("✅ Total MEV harvested:", ethers.utils.formatEther(totalMEV), "ETH");
    
    console.log("\n🎉 All Enhanced Zentix MEV Harvester tests passed!");
    
  } catch (error: any) {
    console.log("❌ Enhanced Zentix MEV Harvester test failed:");
    console.log(error.message);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});