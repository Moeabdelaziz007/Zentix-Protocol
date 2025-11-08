import { ethers } from "hardhat";
import { CompetitivePerceptionAIZ, AIZRegistry, IntentBus } from "../../typechain-types";
import { Signer } from "ethers";

async function main() {
  console.log("🚀 Starting Competitive Perception AIZ Demo");
  console.log("==========================================\n");

  // Get accounts
  const [deployer, competitor1, competitor2] = await ethers.getSigners();
  
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

  // Deploy CompetitivePerceptionAIZ
  const CompetitivePerceptionAIZFactory = await ethers.getContractFactory("CompetitivePerceptionAIZ");
  const competitivePerceptionAIZ = await CompetitivePerceptionAIZFactory.deploy(
    await aizRegistry.getAddress(),
    await intentBus.getAddress()
  );
  await competitivePerceptionAIZ.waitForDeployment();
  console.log("✅ CompetitivePerceptionAIZ deployed");

  // Register the AIZ
  const capability = ethers.encodeBytes32String("COMPETITIVE_PERCEPTION");
  await aizRegistry.registerAIZ(await competitivePerceptionAIZ.getAddress(), "Competitive Perception AIZ", capability);
  console.log("✅ CompetitivePerceptionAIZ registered with AIZ Registry\n");

  console.log("🤖 Competitive Perception AIZ is now active!");
  console.log("Monitoring external environment for threats and opportunities...\n");

  // Demo 1: Add competitors
  console.log("1️⃣ Adding competitors to monitor...");
  await competitivePerceptionAIZ.addCompetitor(await competitor1.getAddress(), "Uniswap");
  console.log("   ➕ Added Uniswap as competitor");
  
  await competitivePerceptionAIZ.addCompetitor(await competitor2.getAddress(), "SushiSwap");
  console.log("   ➕ Added SushiSwap as competitor\n");

  // Demo 2: Analyze competitors
  console.log("2️⃣ Analyzing competitor activity...");
  await competitivePerceptionAIZ.analyzeCompetitor(await competitor1.getAddress());
  console.log("   🔍 Analyzed Uniswap activity");
  
  await competitivePerceptionAIZ.analyzeCompetitor(await competitor2.getAddress());
  console.log("   🔍 Analyzed SushiSwap activity\n");

  // Demo 3: Update alpha analysis
  console.log("3️⃣ Updating alpha analysis...");
  const yieldFarmingStrategy = ethers.encodeBytes32String("YIELD_FARMING");
  await competitivePerceptionAIZ.updateAlphaAnalysis(
    yieldFarmingStrategy,
    "Yield farming strategy on Compound",
    85, // 85% profitability
    12  // 12% decay rate
  );
  console.log("   📊 Updated yield farming strategy analysis\n");

  const arbitrageStrategy = ethers.encodeBytes32String("ARBITRAGE");
  await competitivePerceptionAIZ.updateAlphaAnalysis(
    arbitrageStrategy,
    "Cross-chain arbitrage strategy",
    72, // 72% profitability
    25  // 25% decay rate (higher decay)
  );
  console.log("   📊 Updated arbitrage strategy analysis\n");

  // Demo 4: Create strategic alerts
  console.log("4️⃣ Creating strategic alerts...");
  await competitivePerceptionAIZ.createStrategicAlert(
    "STRATEGY_OPPORTUNITY",
    "New yield source detected on Balancer V2. Recommend analysis.",
    await competitor1.getAddress()
  );
  console.log("   ⚠️  STRATEGY_OPPORTUNITY alert created");

  await competitivePerceptionAIZ.createStrategicAlert(
    "ALPHA_DECAY_WARNING",
    "Arbitrage profits on ETH-USDC pair have decreased by 30%. Recommend re-allocating capital.",
    await competitor2.getAddress()
  );
  console.log("   ⚠️  ALPHA_DECAY_WARNING alert created\n");

  // Demo 5: Process alerts
  console.log("5️⃣ Processing alerts...");
  await competitivePerceptionAIZ.processAlert(1);
  console.log("   ✅ Processed STRATEGY_OPPORTUNITY alert");
  
  await competitivePerceptionAIZ.processAlert(2);
  console.log("   ✅ Processed ALPHA_DECAY_WARNING alert\n");

  // Demo 6: Retrieve data
  console.log("6️⃣ Retrieving competitive intelligence...");
  const competitorData = await competitivePerceptionAIZ.getCompetitor(await competitor1.getAddress());
  console.log("   📋 Uniswap data:", {
    name: competitorData.name,
    transactionCount: competitorData.transactionCount.toString(),
    successRate: competitorData.successRate.toString()
  });

  const alphaData = await competitivePerceptionAIZ.getAlphaAnalysis(yieldFarmingStrategy);
  console.log("   📋 Yield farming alpha data:", {
    description: alphaData.description,
    profitability: alphaData.profitability.toString(),
    decayRate: alphaData.decayRate.toString()
  });

  const alertData = await competitivePerceptionAIZ.getStrategicAlert(1);
  console.log("   📋 Alert data:", {
    type: alertData.alertType,
    description: alertData.description,
    processed: alertData.processed
  });

  console.log("\n🎉 Competitive Perception AIZ Demo Completed!");
  console.log("The AIZ is now monitoring external environment and generating actionable intelligence.");
  console.log("This intelligence can be sent via IntentBus to other AIZs for action.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});