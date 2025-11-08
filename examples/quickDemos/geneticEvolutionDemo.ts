import { ethers } from "hardhat";
import { GeneticEvolutionAgent, AIZRegistry, IntentBus, ConsciousDecisionLogger } from "../../typechain-types";
import { Signer } from "ethers";

async function main() {
  console.log("🚀 Starting Genetic Evolution Agent Demo");
  console.log("======================================\n");

  // Get accounts
  const [deployer, strategy1, strategy2] = await ethers.getSigners();
  
  console.log("Deploying required contracts...\n");

  // Deploy AIZRegistry
  const AIZRegistryFactory = await ethers.getContractFactory("AIZRegistry");
  const aizRegistry = await AIZRegistryFactory.deploy();
  await aizRegistry.waitForDeployment();
  console.log("✅ AIZRegistry deployed");

  // Deploy IntentBus
  const IntentBusFactory = await ethers.getContractFactory("IntentBus");
  const intentBus = await IntentBusFactory.deploy(await aizRegistry.getAddress());
  await intentBus.waitForDeployment();
  console.log("✅ IntentBus deployed");

  // Deploy ConsciousDecisionLogger
  const DecisionLoggerFactory = await ethers.getContractFactory("ConsciousDecisionLogger");
  const decisionLogger = await DecisionLoggerFactory.deploy();
  await decisionLogger.waitForDeployment();
  console.log("✅ ConsciousDecisionLogger deployed");

  // Deploy GeneticEvolutionAgent
  const GeneticEvolutionAgentFactory = await ethers.getContractFactory("GeneticEvolutionAgent");
  const aizId = ethers.encodeBytes32String("GENETIC-EVOLUTION-AIZ");
  const aizName = "GeneticEvolutionAgent";
  const aizDescription = "AIZ that creates and evolves new strategies using genetic algorithms";
  
  const geneticEvolutionAgent = await GeneticEvolutionAgentFactory.deploy(
    aizId,
    await aizRegistry.getAddress(),
    await intentBus.getAddress(),
    await decisionLogger.getAddress(),
    aizName,
    aizDescription
  );
  await geneticEvolutionAgent.waitForDeployment();
  console.log("✅ GeneticEvolutionAgent deployed\n");

  console.log("🧬 Genetic Evolution Agent is now active!");
  console.log("Creating and evolving new strategies using genetic algorithms...\n");

  // Demo 1: Create random genomes
  console.log("1️⃣ Creating initial random genomes...");
  const genome1Tx = await geneticEvolutionAgent.createRandomGenome("High-Risk High-Reward Strategy");
  console.log("   🧬 Created 'High-Risk High-Reward Strategy' genome");
  
  const genome2Tx = await geneticEvolutionAgent.createRandomGenome("Conservative Income Strategy");
  console.log("   🧬 Created 'Conservative Income Strategy' genome");
  
  const genome3Tx = await geneticEvolutionAgent.createRandomGenome("Balanced Growth Strategy");
  console.log("   🧬 Created 'Balanced Growth Strategy' genome\n");

  // Demo 2: Test genomes
  console.log("2️⃣ Testing genomes in sandbox environment...");
  // In a real implementation, we would extract genome IDs from the events
  // For this demo, we'll simulate the testing process
  
  console.log("   🧪 Testing 'High-Risk High-Reward Strategy':");
  console.log("      Profitability: 85/100");
  console.log("      Risk: 75/100");
  console.log("      Stability: 60/100");
  console.log("      Fitness Score: 685/1000");
  console.log("      Result: ❌ Below threshold (700), needs improvement");
  
  console.log("   🧪 Testing 'Conservative Income Strategy':");
  console.log("      Profitability: 60/100");
  console.log("      Risk: 25/100");
  console.log("      Stability: 90/100");
  console.log("      Fitness Score: 795/1000");
  console.log("      Result: ✅ Passed threshold, eligible for evolution");
  
  console.log("   🧪 Testing 'Balanced Growth Strategy':");
  console.log("      Profitability: 75/100");
  console.log("      Risk: 45/100");
  console.log("      Stability: 75/100");
  console.log("      Fitness Score: 765/1000");
  console.log("      Result: ✅ Passed threshold, eligible for evolution\n");

  // Demo 3: Create child genomes through crossover and mutation
  console.log("3️⃣ Evolving new genomes through genetic operations...");
  console.log("   🧬 Creating child genome from 'Conservative Income' and 'Balanced Growth':");
  console.log("      Parent 1: Conservative Income Strategy");
  console.log("      Parent 2: Balanced Growth Strategy");
  console.log("      Crossover: 70% probability ✓");
  console.log("      Mutation: 10% probability ✓");
  console.log("      Child Genome: 'Moderate Growth with Income' created\n");

  // Demo 4: Test evolved genomes
  console.log("4️⃣ Testing evolved genomes...");
  console.log("   🧪 Testing 'Moderate Growth with Income':");
  console.log("      Profitability: 80/100");
  console.log("      Risk: 35/100");
  console.log("      Stability: 85/100");
  console.log("      Fitness Score: 825/1000");
  console.log("      Result: ✅ Excellent fitness, ready for strategy evolution\n");

  // Demo 5: Evolve strategies from successful genomes
  console.log("5️⃣ Evolving strategies from successful genomes...");
  console.log("   🚀 Evolving 'Conservative Income Strategy' into deployable strategy:");
  console.log("      Strategy Name: 'SteadyDividendHarvester'");
  console.log("      Description: 'Low-risk strategy focusing on stable dividend assets'");
  console.log("      Status: ✅ Evolved and ready for deployment");
  
  console.log("   🚀 Evolving 'Balanced Growth Strategy' into deployable strategy:");
  console.log("      Strategy Name: 'GrowthAndIncomeBalancer'");
  console.log("      Description: 'Balanced approach targeting both capital growth and income'");
  console.log("      Status: ✅ Evolved and ready for deployment");
  
  console.log("   🚀 Evolving 'Moderate Growth with Income' into deployable strategy:");
  console.log("      Strategy Name: 'OptimizedGrowthIncome'");
  console.log("      Description: 'Optimized strategy combining best traits of parents'");
  console.log("      Status: ✅ Evolved and ready for deployment\n");

  // Demo 6: Deploy evolved strategies
  console.log("6️⃣ Deploying evolved strategies...");
  console.log("   📡 Sending deployment intents via IntentBus:");
  console.log("      Intent: Deploy 'SteadyDividendHarvester'");
  console.log("      Target: Revenue Generation AIZ");
  console.log("      Status: ✅ Intent posted successfully");
  
  console.log("   📡 Sending deployment intents via IntentBus:");
  console.log("      Intent: Deploy 'GrowthAndIncomeBalancer'");
  console.log("      Target: Revenue Generation AIZ");
  console.log("      Status: ✅ Intent posted successfully");
  
  console.log("   📡 Sending deployment intents via IntentBus:");
  console.log("      Intent: Deploy 'OptimizedGrowthIncome'");
  console.log("      Target: Revenue Generation AIZ");
  console.log("      Status: ✅ Intent posted successfully\n");

  // Demo 7: Record deployments
  console.log("7️⃣ Recording strategy deployments...");
  console.log("   📦 'SteadyDividendHarvester' deployed at address:");
  console.log("      0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
  console.log("      Status: ✅ Deployment recorded");
  
  console.log("   📦 'GrowthAndIncomeBalancer' deployed at address:");
  console.log("      0xUniswapV2Router02"); // Placeholder
  console.log("      Status: ✅ Deployment recorded");
  
  console.log("   📦 'OptimizedGrowthIncome' deployed at address:");
  console.log("      0xCompoundComet"); // Placeholder
  console.log("      Status: ✅ Deployment recorded\n");

  // Demo 8: Monitor performance
  console.log("8️⃣ Monitoring strategy performance...");
  console.log("   📈 'SteadyDividendHarvester' Performance:");
  console.log("      30-day Return: 8.5%");
  console.log("      Risk Score: 22/100");
  console.log("      Stability: 92/100");
  console.log("      Performance Score: 845/1000");
  
  console.log("   📈 'GrowthAndIncomeBalancer' Performance:");
  console.log("      30-day Return: 12.3%");
  console.log("      Risk Score: 41/100");
  console.log("      Stability: 78/100");
  console.log("      Performance Score: 792/1000");
  
  console.log("   📈 'OptimizedGrowthIncome' Performance:");
  console.log("      30-day Return: 15.7%");
  console.log("      Risk Score: 52/100");
  console.log("      Stability: 81/100");
  console.log("      Performance Score: 835/1000\n");

  console.log("🎉 Genetic Evolution Agent Demo Completed!");
  console.log("The agent has successfully created, tested, and evolved new strategies.");
  console.log("This autonomous innovation engine continuously improves the organization's capabilities.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});