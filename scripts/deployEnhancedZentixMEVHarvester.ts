#!/usr/bin/env tsx
/**
 * Deploy Script: Enhanced Zentix MEV Harvester
 * Deploys the enhanced MEV Harvester with improved AIZ integration
 */

import { ethers } from "hardhat";

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Enhanced Zentix MEV Harvester with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy required AIZ protocol contracts if not already deployed
  console.log("\nChecking for existing AIZ Protocol contracts...");
  
  // For this demo, we'll deploy all contracts
  console.log("\nDeploying AIZRegistry...");
  const AIZRegistry = await ethers.getContractFactory("AIZRegistry");
  const aizRegistry = await AIZRegistry.deploy();
  await aizRegistry.deployed();
  console.log("AIZRegistry deployed to:", aizRegistry.address);

  console.log("\nDeploying ConsciousDecisionLogger...");
  // Using a dummy address for the cross-domain messenger for this demo
  const dummyMessengerAddress = deployer.address;
  const ConsciousDecisionLogger = await ethers.getContractFactory("ConsciousDecisionLogger");
  const decisionLogger = await ConsciousDecisionLogger.deploy(dummyMessengerAddress, aizRegistry.address);
  await decisionLogger.deployed();
  console.log("ConsciousDecisionLogger deployed to:", decisionLogger.address);

  console.log("\nDeploying IntentBus...");
  const IntentBus = await ethers.getContractFactory("IntentBus");
  const intentBus = await IntentBus.deploy(aizRegistry.address);
  await intentBus.deployed();
  console.log("IntentBus deployed to:", intentBus.address);

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

  // Deploy MEV Harvest Multiplier NFT if not already deployed
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

  console.log("\n🎉 Enhanced Zentix MEV Harvester deployment completed!");
  console.log("\n📋 Deployed Contracts:");
  console.log("   AIZRegistry:", aizRegistry.address);
  console.log("   ConsciousDecisionLogger:", decisionLogger.address);
  console.log("   IntentBus:", intentBus.address);
  console.log("   DynamicReputationProtocol:", reputationProtocol.address);
  console.log("   MetaSelfMonitoringAIZ:", selfMonitoring.address);
  console.log("   MEVHarvestMultiplierNFT:", mevMultiplierNFT.address);
  console.log("   EnhancedZentixMEVHarvester:", mevHarvester.address);

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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});