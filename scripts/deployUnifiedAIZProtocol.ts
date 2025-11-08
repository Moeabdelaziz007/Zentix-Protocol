#!/usr/bin/env tsx
/**
 * Deploy Script: Unified AIZ Protocol
 * Deploys all core AIZ protocol components with enhanced integration
 */

import { ethers } from "hardhat";

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Unified AIZ Protocol with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy AIZRegistry
  console.log("\nDeploying AIZRegistry...");
  const AIZRegistry = await ethers.getContractFactory("AIZRegistry");
  const aizRegistry = await AIZRegistry.deploy();
  await aizRegistry.deployed();
  console.log("AIZRegistry deployed to:", aizRegistry.address);

  // Deploy ConsciousDecisionLogger
  console.log("\nDeploying ConsciousDecisionLogger...");
  // Using a dummy address for the cross-domain messenger for this demo
  const dummyMessengerAddress = deployer.address;
  const ConsciousDecisionLogger = await ethers.getContractFactory("ConsciousDecisionLogger");
  const decisionLogger = await ConsciousDecisionLogger.deploy(dummyMessengerAddress, aizRegistry.address);
  await decisionLogger.deployed();
  console.log("ConsciousDecisionLogger deployed to:", decisionLogger.address);

  // Deploy IntentBus
  console.log("\nDeploying IntentBus...");
  const IntentBus = await ethers.getContractFactory("IntentBus");
  const intentBus = await IntentBus.deploy(aizRegistry.address);
  await intentBus.deployed();
  console.log("IntentBus deployed to:", intentBus.address);

  // Deploy ToolRegistry
  console.log("\nDeploying ToolRegistry...");
  const ToolRegistry = await ethers.getContractFactory("ToolRegistry");
  const toolRegistry = await ToolRegistry.deploy(aizRegistry.address);
  await toolRegistry.deployed();
  console.log("ToolRegistry deployed to:", toolRegistry.address);

  // Deploy DataStreamRegistry
  console.log("\nDeploying DataStreamRegistry...");
  const DataStreamRegistry = await ethers.getContractFactory("DataStreamRegistry");
  const dataStreamRegistry = await DataStreamRegistry.deploy(aizRegistry.address);
  await dataStreamRegistry.deployed();
  console.log("DataStreamRegistry deployed to:", dataStreamRegistry.address);

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
  console.log("DynamicReputationProtocol deployed to:", reputationProtocol.address);

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
  console.log("MetaSelfMonitoringAIZ deployed to:", selfMonitoring.address);

  // Deploy MEV Harvest Multiplier NFT
  console.log("\nDeploying MEVHarvestMultiplierNFT...");
  const MEVHarvestMultiplierNFT = await ethers.getContractFactory("MEVHarvestMultiplierNFT");
  const mevMultiplierNFT = await MEVHarvestMultiplierNFT.deploy(
    ethers.constants.AddressZero, // Will be set after MEV Harvester deployment
    deployer.address // Treasury address
  );
  await mevMultiplierNFT.deployed();
  console.log("MEVHarvestMultiplierNFT deployed to:", mevMultiplierNFT.address);

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
  console.log("EnhancedZentixMEVHarvester deployed to:", mevHarvester.address);

  // Update MEV Harvest Multiplier NFT with the MEV Harvester address
  console.log("\nSetting MEV Harvester address in MEVHarvestMultiplierNFT...");
  await mevMultiplierNFT.setMEVHarvesterAddress(mevHarvester.address);
  console.log("MEV Harvester address set in MEVHarvestMultiplierNFT");

  // Register core AIZs
  console.log("\nRegistering core AIZs...");

  // Register Revenue Generation AIZ
  const revenueGenAIZId = ethers.utils.formatBytes32String("AIZ-REVENUE-GEN");
  await aizRegistry.registerAIZ(
    revenueGenAIZId,
    "Revenue Generation AIZ",
    "AIZ specialized in automated DeFi strategies for yield farming and arbitrage",
    deployer.address, // Using deployer as placeholder orchestrator
    [10], // OP Mainnet
    [deployer.address] // Using deployer as placeholder contract
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
    deployer.address, // Using deployer as placeholder orchestrator
    [10], // OP Mainnet
    [deployer.address] // Using deployer as placeholder contract
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

  // Create bond issuance for community participation
  console.log("\nCreating MEV Harvest Bond issuance...");
  const bondParams = {
    totalBondsToIssue: 100,
    bondPrice: ethers.utils.parseEther("1"), // 1 ETH per bond
    maturityPeriod: 2592000, // 30 days
    profitSharePercentage: 25 // 25% of MEV profits
  };

  await mevMultiplierNFT.createBondIssuance(bondParams);
  console.log("✅ Created MEV Harvest Bond issuance for 100 bonds at 1 ETH each");
  console.log("✅ 25% of MEV profits will be distributed to bond holders");

  console.log("\n🎉 Unified AIZ Protocol deployment completed!");
  console.log("\n📋 Deployed Contracts:");
  console.log("   AIZRegistry:", aizRegistry.address);
  console.log("   ConsciousDecisionLogger:", decisionLogger.address);
  console.log("   IntentBus:", intentBus.address);
  console.log("   ToolRegistry:", toolRegistry.address);
  console.log("   DataStreamRegistry:", dataStreamRegistry.address);
  console.log("   DynamicReputationProtocol:", reputationProtocol.address);
  console.log("   MetaSelfMonitoringAIZ:", selfMonitoring.address);
  console.log("   MEVHarvestMultiplierNFT:", mevMultiplierNFT.address);
  console.log("   EnhancedZentixMEVHarvester:", mevHarvester.address);

  console.log("\n📋 Registered AIZs:");
  console.log("   Revenue Generation AIZ:", revenueGenAIZId);
  console.log("   Marketing AIZ:", marketingAIZId);
  console.log("   MEV Harvester AIZ:", mevHarvesterAIZId);

  console.log("\n🚀 The Unified AIZ Protocol is now ready for use!");
  console.log("   Run 'npm run test:unified-aiz-protocol' to test the deployment");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});