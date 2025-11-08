import { ethers, run } from "hardhat";
import { 
  AIZRegistry__factory, 
  ConsciousDecisionLogger__factory,
  IntentBus__factory,
  DynamicReputationProtocol__factory,
  MetaSelfMonitoringAIZ_Enhanced__factory,
  ZentixMEVHarvester__factory
} from "../typechain-types";

async function main() {
  console.log("🚀 Deploying Zentix MEV Harvester...");
  console.log("====================================\n");

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

  // Deploy ZentixMEVHarvester
  console.log("\n6️⃣ Deploying ZentixMEVHarvester...");
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
    decisionLoggerAddress
  );
  await zentixMEVHarvester.waitForDeployment();
  const zentixMEVHarvesterAddress = await zentixMEVHarvester.getAddress();
  console.log("   ✅ ZentixMEVHarvester deployed to:", zentixMEVHarvesterAddress);

  // Register the ZentixMEVHarvester with the registry
  console.log("\n7️⃣ Registering ZentixMEVHarvester with AIZRegistry...");
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
  console.log("\n8️⃣ Granting capabilities to ZentixMEVHarvester...");
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

  // Verify contracts on Etherscan (if running on a public network)
  try {
    console.log("\n9️⃣ Verifying contracts on Etherscan...");
    
    // Verify ZentixMEVHarvester
    await run("verify:verify", {
      address: zentixMEVHarvesterAddress,
      constructorArguments: [
        mevAizId,
        aizRegistryAddress,
        intentBusAddress,
        dynamicReputationAddress,
        metaSelfMonitoringAddress,
        decisionLoggerAddress
      ],
    });
    console.log("   ✅ ZentixMEVHarvester verified");

  } catch (error) {
    console.log("   ⚠️  Verification skipped or failed:", error);
  }

  // Summary
  console.log("\n🎉 Zentix MEV Harvester Deployment Complete!");
  console.log("==========================================");
  console.log("Deployed Contracts:");
  console.log("   AIZRegistry:", aizRegistryAddress);
  console.log("   ConsciousDecisionLogger:", decisionLoggerAddress);
  console.log("   IntentBus:", intentBusAddress);
  console.log("   DynamicReputationProtocol:", dynamicReputationAddress);
  console.log("   MetaSelfMonitoringAIZ_Enhanced:", metaSelfMonitoringAddress);
  console.log("   ZentixMEVHarvester:", zentixMEVHarvesterAddress);
  console.log("\n📋 Next Steps:");
  console.log("   1. Configure MEV harvesting strategies");
  console.log("   2. Set up cross-chain monitoring");
  console.log("   3. Configure conditional liquidation parameters");
  console.log("   4. Enable specialized sequencer functionality");
  console.log("   5. Begin harvesting MEV through advanced strategies");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});