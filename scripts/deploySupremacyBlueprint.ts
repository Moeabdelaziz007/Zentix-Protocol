import { ethers, run } from "hardhat";
import { 
  AIZRegistry__factory, 
  ConsciousDecisionLogger__factory,
  CompetitorRegistry__factory,
  StrategicThreatDB__factory,
  ReputationStaking__factory,
  StrategyCandidate__factory,
  MetaSelfMonitoringAIZ_Enhanced__factory
} from "../typechain-types";

async function main() {
  console.log("🚀 Deploying Supremacy Blueprint Contracts...");
  console.log("=============================================\n");

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

  // Deploy CompetitorRegistry
  console.log("\n3️⃣ Deploying CompetitorRegistry...");
  const competitorRegistryFactory = new CompetitorRegistry__factory(deployer);
  const competitorRegistry = await competitorRegistryFactory.deploy();
  await competitorRegistry.waitForDeployment();
  const competitorRegistryAddress = await competitorRegistry.getAddress();
  console.log("   ✅ CompetitorRegistry deployed to:", competitorRegistryAddress);

  // Deploy StrategicThreatDB
  console.log("\n4️⃣ Deploying StrategicThreatDB...");
  const strategicThreatDBFactory = new StrategicThreatDB__factory(deployer);
  const strategicThreatDB = await strategicThreatDBFactory.deploy(aizRegistryAddress);
  await strategicThreatDB.waitForDeployment();
  const strategicThreatDBAddress = await strategicThreatDB.getAddress();
  console.log("   ✅ StrategicThreatDB deployed to:", strategicThreatDBAddress);

  // Deploy ReputationStaking
  console.log("\n5️⃣ Deploying ReputationStaking...");
  const reputationStakingFactory = new ReputationStaking__factory(deployer);
  const reputationStaking = await reputationStakingFactory.deploy(aizRegistryAddress);
  await reputationStaking.waitForDeployment();
  const reputationStakingAddress = await reputationStaking.getAddress();
  console.log("   ✅ ReputationStaking deployed to:", reputationStakingAddress);

  // Deploy StrategyCandidate
  console.log("\n6️⃣ Deploying StrategyCandidate...");
  const strategyCandidateFactory = new StrategyCandidate__factory(deployer);
  const strategyCandidate = await strategyCandidateFactory.deploy(
    aizRegistryAddress,
    decisionLoggerAddress,
    ethers.parseEther("0.1") // 0.1 ETH test budget limit
  );
  await strategyCandidate.waitForDeployment();
  const strategyCandidateAddress = await strategyCandidate.getAddress();
  console.log("   ✅ StrategyCandidate deployed to:", strategyCandidateAddress);

  // Deploy Enhanced MetaSelfMonitoringAIZ
  console.log("\n7️⃣ Deploying Enhanced MetaSelfMonitoringAIZ...");
  const metaSelfMonitoringAIZFactory = new MetaSelfMonitoringAIZ_Enhanced__factory(deployer);
  const aizId = ethers.encodeBytes32String('META-MONITORING-ENHANCED');
  const aizName = 'EnhancedMetaSelfMonitoringAIZ';
  const aizDescription = 'Enhanced AIZ with self-monitoring capabilities and competitive threat awareness';
  
  const metaSelfMonitoringAIZ = await metaSelfMonitoringAIZFactory.deploy(
    aizId,
    aizRegistryAddress,
    decisionLoggerAddress,
    strategicThreatDBAddress,
    aizName,
    aizDescription
  );
  await metaSelfMonitoringAIZ.waitForDeployment();
  const metaSelfMonitoringAIZAddress = await metaSelfMonitoringAIZ.getAddress();
  console.log("   ✅ Enhanced MetaSelfMonitoringAIZ deployed to:", metaSelfMonitoringAIZAddress);

  // Register the Enhanced MetaSelfMonitoringAIZ with the registry
  console.log("\n8️⃣ Registering Enhanced MetaSelfMonitoringAIZ with AIZRegistry...");
  const registerTx = await aizRegistry.registerAIZ(
    aizId,
    aizName,
    aizDescription,
    metaSelfMonitoringAIZAddress,
    [31337], // Local test network
    [metaSelfMonitoringAIZAddress]
  );
  await registerTx.wait();
  console.log("   ✅ Enhanced MetaSelfMonitoringAIZ registered");

  // Grant necessary capabilities to the Enhanced MetaSelfMonitoringAIZ
  console.log("\n9️⃣ Granting capabilities to Enhanced MetaSelfMonitoringAIZ...");
  const capabilities = [
    "canUpdateMetrics",
    "canAnalyzePerformance",
    "canImplementOptimizations",
    "canGenerateReports",
    "canApplyOptimizations"
  ];

  for (const capability of capabilities) {
    const capabilitySelector = ethers.id(`${capability}()`).substring(0, 10);
    const tx = await aizRegistry.setCapability(aizId, capabilitySelector, true);
    await tx.wait();
    console.log(`   ✅ Granted capability: ${capability}`);
  }

  // Verify contracts on Etherscan (if running on a public network)
  try {
    console.log("\n🔟 Verifying contracts on Etherscan...");
    
    // Verify CompetitorRegistry
    await run("verify:verify", {
      address: competitorRegistryAddress,
      constructorArguments: [],
    });
    console.log("   ✅ CompetitorRegistry verified");

    // Verify StrategicThreatDB
    await run("verify:verify", {
      address: strategicThreatDBAddress,
      constructorArguments: [aizRegistryAddress],
    });
    console.log("   ✅ StrategicThreatDB verified");

    // Verify ReputationStaking
    await run("verify:verify", {
      address: reputationStakingAddress,
      constructorArguments: [aizRegistryAddress],
    });
    console.log("   ✅ ReputationStaking verified");

    // Verify StrategyCandidate
    await run("verify:verify", {
      address: strategyCandidateAddress,
      constructorArguments: [aizRegistryAddress, decisionLoggerAddress, ethers.parseEther("0.1")],
    });
    console.log("   ✅ StrategyCandidate verified");

    // Verify Enhanced MetaSelfMonitoringAIZ
    await run("verify:verify", {
      address: metaSelfMonitoringAIZAddress,
      constructorArguments: [
        aizId,
        aizRegistryAddress,
        decisionLoggerAddress,
        strategicThreatDBAddress,
        aizName,
        aizDescription
      ],
    });
    console.log("   ✅ Enhanced MetaSelfMonitoringAIZ verified");

  } catch (error) {
    console.log("   ⚠️  Verification skipped or failed:", error);
  }

  // Summary
  console.log("\n🎉 Supremacy Blueprint Deployment Complete!");
  console.log("==========================================");
  console.log("Deployed Contracts:");
  console.log("   AIZRegistry:", aizRegistryAddress);
  console.log("   ConsciousDecisionLogger:", decisionLoggerAddress);
  console.log("   CompetitorRegistry:", competitorRegistryAddress);
  console.log("   StrategicThreatDB:", strategicThreatDBAddress);
  console.log("   ReputationStaking:", reputationStakingAddress);
  console.log("   StrategyCandidate:", strategyCandidateAddress);
  console.log("   Enhanced MetaSelfMonitoringAIZ:", metaSelfMonitoringAIZAddress);
  console.log("\n📋 Next Steps:");
  console.log("   1. Register competitors in CompetitorRegistry");
  console.log("   2. Configure threat monitoring agents");
  console.log("   3. Set up reputation staking mechanisms");
  console.log("   4. Begin testing strategy candidates");
  console.log("   5. Integrate with off-chain components");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});