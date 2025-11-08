import { ethers } from "hardhat";
import { DynamicReputationProtocol, AIZRegistry, ConsciousDecisionLogger } from "../../typechain-types";
import { Signer } from "ethers";

async function main() {
  console.log("🚀 Starting Dynamic Reputation Protocol Demo");
  console.log("==========================================\n");

  // Get accounts
  const [deployer, aiz1, aiz2, aiz3] = await ethers.getSigners();
  
  console.log("Deploying required contracts...\n");

  // Deploy AIZRegistry
  const AIZRegistryFactory = await ethers.getContractFactory("AIZRegistry");
  const aizRegistry = await AIZRegistryFactory.deploy();
  await aizRegistry.waitForDeployment();
  console.log("✅ AIZRegistry deployed");

  // Deploy ConsciousDecisionLogger
  const DecisionLoggerFactory = await ethers.getContractFactory("ConsciousDecisionLogger");
  const decisionLogger = await DecisionLoggerFactory.deploy();
  await decisionLogger.waitForDeployment();
  console.log("✅ ConsciousDecisionLogger deployed");

  // Deploy DynamicReputationProtocol
  const DynamicReputationProtocolFactory = await ethers.getContractFactory("DynamicReputationProtocol");
  const aizId = ethers.encodeBytes32String("DYNAMIC-REPUTATION-AIZ");
  const aizName = "DynamicReputationProtocol";
  const aizDescription = "Protocol that manages reputation of AIZs based on performance";
  
  const dynamicReputationProtocol = await DynamicReputationProtocolFactory.deploy(
    aizId,
    await aizRegistry.getAddress(),
    await decisionLogger.getAddress(),
    aizName,
    aizDescription
  );
  await dynamicReputationProtocol.waitForDeployment();
  console.log("✅ DynamicReputationProtocol deployed\n");

  console.log("🤖 Dynamic Reputation Protocol is now active!");
  console.log("Managing reputation scores for all AIZs in the organization...\n");

  // Demo 1: Initialize reputation scores
  console.log("1️⃣ Initializing reputation scores...");
  const aiz1Id = ethers.encodeBytes32String("REVENUE-GEN-AIZ");
  const aiz2Id = ethers.encodeBytes32String("MARKETING-AIZ");
  const aiz3Id = ethers.encodeBytes32String("TECHNOLOGY-AIZ");
  
  await dynamicReputationProtocol.updateReputation(
    aiz1Id, 
    0, 
    "Initial registration", 
    ethers.encodeBytes32String("registration")
  );
  console.log("   ➕ Initialized Revenue Generation AIZ with 500 reputation");
  
  await dynamicReputationProtocol.updateReputation(
    aiz2Id, 
    0, 
    "Initial registration", 
    ethers.encodeBytes32String("registration")
  );
  console.log("   ➕ Initialized Marketing AIZ with 500 reputation");
  
  await dynamicReputationProtocol.updateReputation(
    aiz3Id, 
    0, 
    "Initial registration", 
    ethers.encodeBytes32String("registration")
  );
  console.log("   ➕ Initialized Technology AIZ with 500 reputation\n");

  // Demo 2: Record successful interactions
  console.log("2️⃣ Recording successful interactions...");
  await dynamicReputationProtocol.updateReputation(
    aiz1Id, 
    75, 
    "Successfully executed flash loan arbitrage", 
    ethers.encodeBytes32String("performance")
  );
  console.log("   ✅ Revenue Gen AIZ gained 75 reputation for successful arbitrage");
  
  await dynamicReputationProtocol.updateReputation(
    aiz2Id, 
    50, 
    "Successfully launched marketing campaign", 
    ethers.encodeBytes32String("performance")
  );
  console.log("   ✅ Marketing AIZ gained 50 reputation for successful campaign");
  
  await dynamicReputationProtocol.updateReputation(
    aiz3Id, 
    60, 
    "Successfully deployed new smart contract", 
    ethers.encodeBytes32String("performance")
  );
  console.log("   ✅ Technology AIZ gained 60 reputation for successful deployment\n");

  // Demo 3: Record economic contributions
  console.log("3️⃣ Recording economic contributions...");
  await dynamicReputationProtocol.recordEconomicContribution(
    aiz1Id, 
    5000, 
    "Generated $5000 in arbitrage profits"
  );
  console.log("   💰 Revenue Gen AIZ contributed $5000, gained 500 reputation");
  
  await dynamicReputationProtocol.recordEconomicContribution(
    aiz2Id, 
    2000, 
    "Generated $2000 in marketing ROI"
  );
  console.log("   💰 Marketing AIZ contributed $2000, gained 200 reputation\n");

  // Demo 4: Record a failure
  console.log("4️⃣ Recording a failure...");
  await dynamicReputationProtocol.updateReputation(
    aiz3Id, 
    -30, 
    "Failed security audit", 
    ethers.encodeBytes32String("reliability")
  );
  console.log("   ❌ Technology AIZ lost 30 reputation for failed audit\n");

  // Demo 5: Reputation staking
  console.log("5️⃣ Reputation staking...");
  await dynamicReputationProtocol.connect(aiz1).placeReputationStake(aiz2Id, 100);
  console.log("   📈 Revenue Gen AIZ staked 100 reputation on Marketing AIZ");
  
  await dynamicReputationProtocol.connect(aiz3).placeReputationStake(aiz1Id, 150);
  console.log("   📈 Technology AIZ staked 150 reputation on Revenue Gen AIZ\n");

  // Demo 6: Retrieve reputation data
  console.log("6️⃣ Retrieving reputation data...");
  const aiz1Reputation = await dynamicReputationProtocol.getAIZReputation(aiz1Id);
  console.log("   📊 Revenue Gen AIZ:");
  console.log("      Reputation Score:", aiz1Reputation.score.toString());
  console.log("      Total Interactions:", aiz1Reputation.totalInteractions.toString());
  console.log("      Successful Interactions:", aiz1Reputation.successfulInteractions.toString());
  console.log("      Economic Contributions:", aiz1Reputation.economicContributions.toString());
  
  const aiz2Reputation = await dynamicReputationProtocol.getAIZReputation(aiz2Id);
  console.log("   📊 Marketing AIZ:");
  console.log("      Reputation Score:", aiz2Reputation.score.toString());
  console.log("      Total Interactions:", aiz2Reputation.totalInteractions.toString());
  console.log("      Successful Interactions:", aiz2Reputation.successfulInteractions.toString());
  
  const aiz3Reputation = await dynamicReputationProtocol.getAIZReputation(aiz3Id);
  console.log("   📊 Technology AIZ:");
  console.log("      Reputation Score:", aiz3Reputation.score.toString());
  console.log("      Total Interactions:", aiz3Reputation.totalInteractions.toString());
  console.log("      Successful Interactions:", aiz3Reputation.successfulInteractions.toString());
  console.log("      Economic Contributions:", aiz3Reputation.economicContributions.toString());

  // Demo 7: Calculate success rates
  console.log("\n7️⃣ Calculating success rates...");
  const aiz1SuccessRate = await dynamicReputationProtocol.getSuccessRate(aiz1Id);
  const aiz2SuccessRate = await dynamicReputationProtocol.getSuccessRate(aiz2Id);
  const aiz3SuccessRate = await dynamicReputationProtocol.getSuccessRate(aiz3Id);
  
  console.log("   📈 Revenue Gen AIZ Success Rate:", aiz1SuccessRate.toString() + "%");
  console.log("   📈 Marketing AIZ Success Rate:", aiz2SuccessRate.toString() + "%");
  console.log("   📈 Technology AIZ Success Rate:", aiz3SuccessRate.toString() + "%");

  console.log("\n🎉 Dynamic Reputation Protocol Demo Completed!");
  console.log("The protocol is now managing reputation scores across the organization.");
  console.log("Higher reputation AIZs will receive priority in resource allocation and intent solving.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});