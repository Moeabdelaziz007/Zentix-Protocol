import { ethers, run } from "hardhat";
import { 
  AIZRegistry__factory, 
  ConsciousDecisionLogger__factory,
  IntentBus__factory,
  DynamicReputationProtocol__factory,
  MetaSelfMonitoringAIZ_Enhanced__factory,
  ZentixMEVHarvester__factory,
  MEVHarvestMultiplierNFT__factory
} from "../typechain-types";

async function main() {
  console.log("🚀 Deploying Zentix MEV Harvester with Multipliers...");
  console.log("====================================================\n");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString(), "wei\n");

  // Deploy AIZRegistry (if not already deployed)
  console.log("1️⃣ Deploying AIZRegistry...");
  const aizRegistryFactory = new AIZRegistry__factory(deployer);
  const aizRegistry = await aizRegistryFactory.deploy();
  await aizRegistry.waitForDeployment();
  const aizRegistryAddress = await aizRegistry.getAddress();
  console.log("   ✅ AIZRegistry deployed to:", aizRegistryAddress);

  // Deploy ConsciousDecisionLogger (if not already deployed)
  console.log("\n2️⃣ Deploying ConsciousDecisionLogger...");
  const decisionLoggerFactory = new ConsciousDecisionLogger__factory(deployer);
  const decisionLogger = await decisionLoggerFactory.deploy();
  await decisionLogger.waitForDeployment();
  const decisionLoggerAddress = await decisionLogger.getAddress();
  console.log("   ✅ ConsciousDecisionLogger deployed to:", decisionLoggerAddress);

  // Deploy IntentBus
  console.log("\n3️⃣ Deploying IntentBus...");
  const intentBusFactory = new IntentBus__factory(deployer);
  const intentBus = await intentBusFactory.deploy(aizRegistryAddress);
  await intentBus.waitForDeployment();
  const intentBusAddress = await intentBus.getAddress();
  console.log("   ✅ IntentBus deployed to:", intentBusAddress);

  // Deploy DynamicReputationProtocol
  console.log("\n4️⃣ Deploying DynamicReputationProtocol...");
  const dynamicReputationFactory = new DynamicReputationProtocol__factory(deployer);
  const reputationAizId = ethers.encodeBytes32String('DYNAMIC-REPUTATION');
  const reputationAizName = 'DynamicReputationProtocol';
  const reputationAizDescription = 'AIZ that manages reputation and collaboration scores';
  
  const dynamicReputation = await dynamicReputationFactory.deploy(
    reputationAizId,
    aizRegistryAddress,
    decisionLoggerAddress,
    reputationAizName,
    reputationAizDescription
  );
  await dynamicReputation.waitForDeployment();
  const dynamicReputationAddress = await dynamicReputation.getAddress();
  console.log("   ✅ DynamicReputationProtocol deployed to:", dynamicReputationAddress);

  // Deploy MetaSelfMonitoringAIZ_Enhanced
  console.log("\n5️⃣ Deploying MetaSelfMonitoringAIZ_Enhanced...");
  const metaSelfMonitoringFactory = new MetaSelfMonitoringAIZ_Enhanced__factory(deployer);
  const monitoringAizId = ethers.encodeBytes32String('META-MONITORING');
  const monitoringAizName = 'MetaSelfMonitoringAIZ_Enhanced';
  const monitoringAizDescription = 'Enhanced AIZ with self-monitoring capabilities';
  
  // We need the StrategicThreatDB address, but for this deployment script we'll use a placeholder
  const strategicThreatDBAddress = ethers.ZeroAddress;
  
  const metaSelfMonitoring = await metaSelfMonitoringFactory.deploy(
    monitoringAizId,
    aizRegistryAddress,
    decisionLoggerAddress,
    strategicThreatDBAddress,
    monitoringAizName,
    monitoringAizDescription
  );
  await metaSelfMonitoring.waitForDeployment();
  const metaSelfMonitoringAddress = await metaSelfMonitoring.getAddress();
  console.log("   ✅ MetaSelfMonitoringAIZ_Enhanced deployed to:", metaSelfMonitoringAddress);

  // Deploy MEVHarvestMultiplierNFT
  console.log("\n6️⃣ Deploying MEVHarvestMultiplierNFT...");
  const mevHarvestMultiplierNFTFactory = new MEVHarvestMultiplierNFT__factory(deployer);
  const treasuryAddress = deployer.address; // Using deployer as treasury for demo
  
  const mevHarvestMultiplierNFT = await mevHarvestMultiplierNFTFactory.deploy(
    ethers.ZeroAddress, // Placeholder for MEV Harvester address
    treasuryAddress
  );
  await mevHarvestMultiplierNFT.waitForDeployment();
  const mevHarvestMultiplierNFTAddress = await mevHarvestMultiplierNFT.getAddress();
  console.log("   ✅ MEVHarvestMultiplierNFT deployed to:", mevHarvestMultiplierNFTAddress);

  // Deploy ZentixMEVHarvester with reference to the multiplier NFT
  console.log("\n7️⃣ Deploying ZentixMEVHarvester...");
  const mevHarvesterFactory = new ZentixMEVHarvester__factory(deployer);
  const mevAizId = ethers.encodeBytes32String('ZENTIX-MEV-HARVESTER');
  const mevAizName = 'ZentixMEVHarvester';
  const mevAizDescription = 'AIZ that harvests MEV through advanced strategies';
  
  const zentixMEVHarvester = await mevHarvesterFactory.deploy(
    mevAizId,
    aizRegistryAddress,
    intentBusAddress,
    dynamicReputationAddress,
    metaSelfMonitoringAddress,
    mevHarvestMultiplierNFTAddress, // Reference to the multiplier NFT contract
    decisionLoggerAddress
  );
  await zentixMEVHarvester.waitForDeployment();
  const zentixMEVHarvesterAddress = await zentixMEVHarvester.getAddress();
  console.log("   ✅ ZentixMEVHarvester deployed to:", zentixMEVHarvesterAddress);

  // Update the MEVHarvestMultiplierNFT with the correct MEV Harvester address
  console.log("\n8️⃣ Updating MEVHarvestMultiplierNFT with MEV Harvester address...");
  const updateTx = await mevHarvestMultiplierNFT.setMEVHarvesterAddress(zentixMEVHarvesterAddress);
  await updateTx.wait();
  console.log("   ✅ MEVHarvestMultiplierNFT updated with MEV Harvester address");

  // Register the ZentixMEVHarvester with the registry
  console.log("\n9️⃣ Registering ZentixMEVHarvester with AIZRegistry...");
  const registerTx = await aizRegistry.registerAIZ(
    mevAizId,
    mevAizName,
    mevAizDescription,
    zentixMEVHarvesterAddress,
    [31337], // Local test network
    [zentixMEVHarvesterAddress]
  );
  await registerTx.wait();
  console.log("   ✅ ZentixMEVHarvester registered");

  // Grant necessary capabilities to the ZentixMEVHarvester
  console.log("\n🔟 Granting capabilities to ZentixMEVHarvester...");
  const capabilities = [
    "canIdentifyCrossChainArbitrage",
    "canExecuteCrossChainArbitrage",
    "canCreateConditionalLiquidationIntent",
    "canExecuteConditionalLiquidation",
    "canSetBlockOptimizationParams",
    "canExecuteBlockOptimization"
  ];

  for (const capability of capabilities) {
    const capabilitySelector = ethers.id(`${capability}()`).substring(0, 10);
    const tx = await aizRegistry.setCapability(mevAizId, capabilitySelector, true);
    await tx.wait();
    console.log(`   ✅ Granted capability: ${capability}`);
  }

  // Create initial bond issuance
  console.log("\n1️⃣1️⃣ Creating initial bond issuance...");
  const bondParams = {
    totalBondsToIssue: 100,
    bondPrice: ethers.parseEther("1"), // 1 ETH per bond
    maturityPeriod: 30 * 24 * 60 * 60, // 30 days
    profitSharePercentage: 25 // 25% of MEV profits
  };
  
  const createBondTx = await mevHarvestMultiplierNFT.createBondIssuance(bondParams);
  await createBondTx.wait();
  console.log("   ✅ Initial bond issuance created");

  // Verify contracts on Etherscan (if running on a public network)
  try {
    console.log("\n1️⃣2️⃣ Verifying contracts on Etherscan...");
    
    // Verify MEVHarvestMultiplierNFT
    await run("verify:verify", {
      address: mevHarvestMultiplierNFTAddress,
      constructorArguments: [
        ethers.ZeroAddress, // Placeholder was used during deployment
        treasuryAddress
      ],
    });
    console.log("   ✅ MEVHarvestMultiplierNFT verified");

    // Verify ZentixMEVHarvester
    await run("verify:verify", {
      address: zentixMEVHarvesterAddress,
      constructorArguments: [
        mevAizId,
        aizRegistryAddress,
        intentBusAddress,
        dynamicReputationAddress,
        metaSelfMonitoringAddress,
        mevHarvestMultiplierNFTAddress,
        decisionLoggerAddress
      ],
    });
    console.log("   ✅ ZentixMEVHarvester verified");

  } catch (error) {
    console.log("   ⚠️  Verification skipped or failed:", error);
  }

  // Summary
  console.log("\n🎉 Zentix MEV Harvester with Multipliers Deployment Complete!");
  console.log("==========================================================");
  console.log("Deployed Contracts:");
  console.log("   AIZRegistry:", aizRegistryAddress);
  console.log("   ConsciousDecisionLogger:", decisionLoggerAddress);
  console.log("   IntentBus:", intentBusAddress);
  console.log("   DynamicReputationProtocol:", dynamicReputationAddress);
  console.log("   MetaSelfMonitoringAIZ_Enhanced:", metaSelfMonitoringAddress);
  console.log("   MEVHarvestMultiplierNFT:", mevHarvestMultiplierNFTAddress);
  console.log("   ZentixMEVHarvester:", zentixMEVHarvesterAddress);
  console.log("   Treasury Address:", treasuryAddress);
  console.log("\n📋 Next Steps:");
  console.log("   1. Community can now purchase Harvest Bonds (100 available at 1 ETH each)");
  console.log("   2. 25% of all MEV profits will be distributed to bond holders");
  console.log("   3. Bond holders can claim their profits at any time");
  console.log("   4. NFT metadata will dynamically update to reflect performance");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});