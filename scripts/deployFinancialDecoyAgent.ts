import { ethers, run } from "hardhat";
import { 
  AIZRegistry__factory, 
  ConsciousDecisionLogger__factory,
  IntentBus__factory,
  CompetitorRegistry__factory,
  StrategicThreatDB__factory,
  FinancialDecoyAgent__factory
} from "../typechain-types";

async function main() {
  console.log("🚀 Deploying Financial Decoy Agent...");
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

  // Deploy CompetitorRegistry
  console.log("\n4️⃣ Deploying CompetitorRegistry...");
  const competitorRegistryFactory = new CompetitorRegistry__factory(deployer);
  const competitorRegistry = await competitorRegistryFactory.deploy();
  await competitorRegistry.waitForDeployment();
  const competitorRegistryAddress = await competitorRegistry.getAddress();
  console.log("   ✅ CompetitorRegistry deployed to:", competitorRegistryAddress);

  // Deploy StrategicThreatDB
  console.log("\n5️⃣ Deploying StrategicThreatDB...");
  const strategicThreatDBFactory = new StrategicThreatDB__factory(deployer);
  const strategicThreatDB = await strategicThreatDBFactory.deploy(aizRegistryAddress);
  await strategicThreatDB.waitForDeployment();
  const strategicThreatDBAddress = await strategicThreatDB.getAddress();
  console.log("   ✅ StrategicThreatDB deployed to:", strategicThreatDBAddress);

  // Deploy FinancialDecoyAgent
  console.log("\n6️⃣ Deploying FinancialDecoyAgent...");
  const financialDecoyAgentFactory = new FinancialDecoyAgent__factory(deployer);
  const aizId = ethers.encodeBytes32String('FINANCIAL-DECOY');
  const aizName = 'FinancialDecoyAgent';
  const aizDescription = 'AIZ that creates decoy transactions to deceive competing MEV bots';
  
  const financialDecoyAgent = await financialDecoyAgentFactory.deploy(
    aizId,
    aizRegistryAddress,
    intentBusAddress,
    competitorRegistryAddress,
    strategicThreatDBAddress,
    decisionLoggerAddress,
    aizName,
    aizDescription
  );
  await financialDecoyAgent.waitForDeployment();
  const financialDecoyAgentAddress = await financialDecoyAgent.getAddress();
  console.log("   ✅ FinancialDecoyAgent deployed to:", financialDecoyAgentAddress);

  // Register the FinancialDecoyAgent with the registry
  console.log("\n7️⃣ Registering FinancialDecoyAgent with AIZRegistry...");
  const registerTx = await aizRegistry.registerAIZ(
    aizId,
    aizName,
    aizDescription,
    financialDecoyAgentAddress,
    [31337], // Local test network
    [financialDecoyAgentAddress]
  );
  await registerTx.wait();
  console.log("   ✅ FinancialDecoyAgent registered");

  // Grant necessary capabilities to the FinancialDecoyAgent
  console.log("\n8️⃣ Granting capabilities to FinancialDecoyAgent...");
  const capabilities = [
    "canCreateDecoyTransactions",
    "canExecuteDecoyCampaigns",
    "canRecordResourceWaste"
  ];

  for (const capability of capabilities) {
    const capabilitySelector = ethers.id(`${capability}()`).substring(0, 10);
    const tx = await aizRegistry.setCapability(aizId, capabilitySelector, true);
    await tx.wait();
    console.log(`   ✅ Granted capability: ${capability}`);
  }

  // Verify contracts on Etherscan (if running on a public network)
  try {
    console.log("\n9️⃣ Verifying contracts on Etherscan...");
    
    // Verify FinancialDecoyAgent
    await run("verify:verify", {
      address: financialDecoyAgentAddress,
      constructorArguments: [
        aizId,
        aizRegistryAddress,
        intentBusAddress,
        competitorRegistryAddress,
        strategicThreatDBAddress,
        decisionLoggerAddress,
        aizName,
        aizDescription
      ],
    });
    console.log("   ✅ FinancialDecoyAgent verified");

  } catch (error) {
    console.log("   ⚠️  Verification skipped or failed:", error);
  }

  // Summary
  console.log("\n🎉 Financial Decoy Agent Deployment Complete!");
  console.log("============================================");
  console.log("Deployed Contracts:");
  console.log("   AIZRegistry:", aizRegistryAddress);
  console.log("   ConsciousDecisionLogger:", decisionLoggerAddress);
  console.log("   IntentBus:", intentBusAddress);
  console.log("   CompetitorRegistry:", competitorRegistryAddress);
  console.log("   StrategicThreatDB:", strategicThreatDBAddress);
  console.log("   FinancialDecoyAgent:", financialDecoyAgentAddress);
  console.log("\n📋 Next Steps:");
  console.log("   1. Register competitors in CompetitorRegistry");
  console.log("   2. Configure decoy transaction strategies");
  console.log("   3. Set up monitoring for MEV bots");
  console.log("   4. Begin testing decoy campaigns");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});