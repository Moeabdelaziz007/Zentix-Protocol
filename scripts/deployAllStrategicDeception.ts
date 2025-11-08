import { ethers, run } from "hardhat";
import { 
  AIZRegistry__factory, 
  ConsciousDecisionLogger__factory,
  IntentBus__factory,
  CompetitorRegistry__factory,
  StrategicThreatDB__factory,
  FinancialDecoyAgent__factory,
  DynamicReputationProtocol__factory,
  GeneticEvolutionAgent__factory,
  CompetitivePerceptionAIZ__factory
} from "../typechain-types";

async function main() {
  console.log("🚀 Deploying All Strategic Deception Components...");
  console.log("================================================\n");

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
  const decoyAizId = ethers.encodeBytes32String('FINANCIAL-DECOY');
  const decoyAizName = 'FinancialDecoyAgent';
  const decoyAizDescription = 'AIZ that creates decoy transactions to deceive competing MEV bots';
  
  const financialDecoyAgent = await financialDecoyAgentFactory.deploy(
    decoyAizId,
    aizRegistryAddress,
    intentBusAddress,
    competitorRegistryAddress,
    strategicThreatDBAddress,
    decisionLoggerAddress,
    decoyAizName,
    decoyAizDescription
  );
  await financialDecoyAgent.waitForDeployment();
  const financialDecoyAgentAddress = await financialDecoyAgent.getAddress();
  console.log("   ✅ FinancialDecoyAgent deployed to:", financialDecoyAgentAddress);

  // Deploy DynamicReputationProtocol
  console.log("\n7️⃣ Deploying DynamicReputationProtocol...");
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

  // Deploy GeneticEvolutionAgent
  console.log("\n8️⃣ Deploying GeneticEvolutionAgent...");
  const geneticEvolutionFactory = new GeneticEvolutionAgent__factory(deployer);
  const evolutionAizId = ethers.encodeBytes32String('GENETIC-EVOLUTION');
  const evolutionAizName = 'GeneticEvolutionAgent';
  const evolutionAizDescription = 'AIZ that evolves strategies through genetic algorithms';
  
  const geneticEvolution = await geneticEvolutionFactory.deploy(
    evolutionAizId,
    aizRegistryAddress,
    intentBusAddress,
    decisionLoggerAddress,
    evolutionAizName,
    evolutionAizDescription
  );
  await geneticEvolution.waitForDeployment();
  const geneticEvolutionAddress = await geneticEvolution.getAddress();
  console.log("   ✅ GeneticEvolutionAgent deployed to:", geneticEvolutionAddress);

  // Deploy CompetitivePerceptionAIZ
  console.log("\n9️⃣ Deploying CompetitivePerceptionAIZ...");
  const competitivePerceptionFactory = new CompetitivePerceptionAIZ__factory(deployer);
  const perceptionAizId = ethers.encodeBytes32String('COMPETITIVE-PERCEPTION');
  const perceptionAizName = 'CompetitivePerceptionAIZ';
  const perceptionAizDescription = 'AIZ that monitors competitors and detects threats';
  
  const competitivePerception = await competitivePerceptionFactory.deploy(
    aizRegistryAddress,
    intentBusAddress
  );
  await competitivePerception.waitForDeployment();
  const competitivePerceptionAddress = await competitivePerception.getAddress();
  console.log("   ✅ CompetitivePerceptionAIZ deployed to:", competitivePerceptionAddress);

  // Register all AIZs with the registry
  console.log("\n🔟 Registering AIZs with AIZRegistry...");
  
  // Register FinancialDecoyAgent
  let registerTx = await aizRegistry.registerAIZ(
    decoyAizId,
    decoyAizName,
    decoyAizDescription,
    financialDecoyAgentAddress,
    [31337], // Local test network
    [financialDecoyAgentAddress]
  );
  await registerTx.wait();
  console.log("   ✅ FinancialDecoyAgent registered");

  // Register DynamicReputationProtocol
  registerTx = await aizRegistry.registerAIZ(
    reputationAizId,
    reputationAizName,
    reputationAizDescription,
    dynamicReputationAddress,
    [31337], // Local test network
    [dynamicReputationAddress]
  );
  await registerTx.wait();
  console.log("   ✅ DynamicReputationProtocol registered");

  // Register GeneticEvolutionAgent
  registerTx = await aizRegistry.registerAIZ(
    evolutionAizId,
    evolutionAizName,
    evolutionAizDescription,
    geneticEvolutionAddress,
    [31337], // Local test network
    [geneticEvolutionAddress]
  );
  await registerTx.wait();
  console.log("   ✅ GeneticEvolutionAgent registered");

  // Register CompetitivePerceptionAIZ
  registerTx = await aizRegistry.registerAIZ(
    perceptionAizId,
    perceptionAizName,
    perceptionAizDescription,
    competitivePerceptionAddress,
    [31337], // Local test network
    [competitivePerceptionAddress]
  );
  await registerTx.wait();
  console.log("   ✅ CompetitivePerceptionAIZ registered");

  // Grant necessary capabilities to all AIZs
  console.log("\n1️⃣1️⃣ Granting capabilities to AIZs...");
  
  // Capabilities for FinancialDecoyAgent
  const decoyCapabilities = [
    "canCreateDecoyTransactions",
    "canExecuteDecoyCampaigns",
    "canRecordResourceWaste"
  ];

  for (const capability of decoyCapabilities) {
    const capabilitySelector = ethers.id(`${capability}()`).substring(0, 10);
    const tx = await aizRegistry.setCapability(decoyAizId, capabilitySelector, true);
    await tx.wait();
    console.log(`   ✅ Granted capability to FinancialDecoyAgent: ${capability}`);
  }
  
  // Capabilities for DynamicReputationProtocol
  const reputationCapabilities = [
    "canUpdateReputation",
    "canRecordEconomicContribution",
    "canPlaceReputationStake",
    "canPenalizeAIZ",
    "canRecordCollaboration"
  ];

  for (const capability of reputationCapabilities) {
    const capabilitySelector = ethers.id(`${capability}()`).substring(0, 10);
    const tx = await aizRegistry.setCapability(reputationAizId, capabilitySelector, true);
    await tx.wait();
    console.log(`   ✅ Granted capability to DynamicReputationProtocol: ${capability}`);
  }
  
  // Capabilities for GeneticEvolutionAgent
  const evolutionCapabilities = [
    "canCreateRandomGenome",
    "canCreateChildGenome",
    "canTestGenome",
    "canCreateTournament",
    "canRecordTournamentResults",
    "canEvolveStrategy"
  ];

  for (const capability of evolutionCapabilities) {
    const capabilitySelector = ethers.id(`${capability}()`).substring(0, 10);
    const tx = await aizRegistry.setCapability(evolutionAizId, capabilitySelector, true);
    await tx.wait();
    console.log(`   ✅ Granted capability to GeneticEvolutionAgent: ${capability}`);
  }
  
  // Capabilities for CompetitivePerceptionAIZ
  const perceptionCapabilities = [
    "canAddCompetitor",
    "canAnalyzeCompetitor",
    "canUpdateAlphaAnalysis",
    "canCreateStrategicAlert",
    "canProcessAlert",
    "canRequestDecoyStrategy"
  ];

  for (const capability of perceptionCapabilities) {
    const capabilitySelector = ethers.id(`${capability}()`).substring(0, 10);
    const tx = await aizRegistry.setCapability(perceptionAizId, capabilitySelector, true);
    await tx.wait();
    console.log(`   ✅ Granted capability to CompetitivePerceptionAIZ: ${capability}`);
  }

  // Set up integrations between components
  console.log("\n1️⃣2️⃣ Setting up component integrations...");
  
  // Connect CompetitivePerceptionAIZ to FinancialDecoyAgent
  const connectTx = await competitivePerception.setFinancialDecoyAgentAddress(financialDecoyAgentAddress);
  await connectTx.wait();
  console.log("   ✅ Connected CompetitivePerceptionAIZ to FinancialDecoyAgent");

  // Verify contracts on Etherscan (if running on a public network)
  try {
    console.log("\n1️⃣3️⃣ Verifying contracts on Etherscan...");
    
    // Verify FinancialDecoyAgent
    await run("verify:verify", {
      address: financialDecoyAgentAddress,
      constructorArguments: [
        decoyAizId,
        aizRegistryAddress,
        intentBusAddress,
        competitorRegistryAddress,
        strategicThreatDBAddress,
        decisionLoggerAddress,
        decoyAizName,
        decoyAizDescription
      ],
    });
    console.log("   ✅ FinancialDecoyAgent verified");
    
    // Verify DynamicReputationProtocol
    await run("verify:verify", {
      address: dynamicReputationAddress,
      constructorArguments: [
        reputationAizId,
        aizRegistryAddress,
        decisionLoggerAddress,
        reputationAizName,
        reputationAizDescription
      ],
    });
    console.log("   ✅ DynamicReputationProtocol verified");
    
    // Verify GeneticEvolutionAgent
    await run("verify:verify", {
      address: geneticEvolutionAddress,
      constructorArguments: [
        evolutionAizId,
        aizRegistryAddress,
        intentBusAddress,
        decisionLoggerAddress,
        evolutionAizName,
        evolutionAizDescription
      ],
    });
    console.log("   ✅ GeneticEvolutionAgent verified");
    
    // Verify CompetitivePerceptionAIZ
    await run("verify:verify", {
      address: competitivePerceptionAddress,
      constructorArguments: [
        aizRegistryAddress,
        intentBusAddress
      ],
    });
    console.log("   ✅ CompetitivePerceptionAIZ verified");

  } catch (error) {
    console.log("   ⚠️  Verification skipped or failed:", error);
  }

  // Summary
  console.log("\n🎉 All Strategic Deception Components Deployment Complete!");
  console.log("========================================================");
  console.log("Deployed Contracts:");
  console.log("   AIZRegistry:", aizRegistryAddress);
  console.log("   ConsciousDecisionLogger:", decisionLoggerAddress);
  console.log("   IntentBus:", intentBusAddress);
  console.log("   CompetitorRegistry:", competitorRegistryAddress);
  console.log("   StrategicThreatDB:", strategicThreatDBAddress);
  console.log("   FinancialDecoyAgent:", financialDecoyAgentAddress);
  console.log("   DynamicReputationProtocol:", dynamicReputationAddress);
  console.log("   GeneticEvolutionAgent:", geneticEvolutionAddress);
  console.log("   CompetitivePerceptionAIZ:", competitivePerceptionAddress);
  console.log("\n📋 Next Steps:");
  console.log("   1. Register competitors in CompetitorRegistry");
  console.log("   2. Configure decoy transaction strategies");
  console.log("   3. Set up monitoring for MEV bots");
  console.log("   4. Begin testing decoy campaigns");
  console.log("   5. Create initial strategy genomes");
  console.log("   6. Run first evolution tournament");
  console.log("   7. Test collaborative task forces");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});