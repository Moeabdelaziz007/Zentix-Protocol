import { ethers, run } from "hardhat";
import { AIZRegistry__factory, CompetitivePerceptionAIZ__factory, IntentBus__factory } from "../typechain-types";

async function main() {
  console.log("Deploying CompetitivePerceptionAIZ...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy CompetitivePerceptionAIZ
  const competitivePerceptionAIZFactory = new CompetitivePerceptionAIZ__factory(deployer);
  
  // We need to get the addresses of existing contracts
  // In a real deployment, you would either deploy new instances or use existing ones
  // For this example, we'll assume AIZRegistry and IntentBus are already deployed
  
  // You would replace these with actual deployed addresses
  const aizRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Example address
  const intentBusAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Example address
  
  console.log("Deploying CompetitivePerceptionAIZ with:");
  console.log("  AIZ Registry:", aizRegistryAddress);
  console.log("  Intent Bus:", intentBusAddress);
  
  const competitivePerceptionAIZ = await competitivePerceptionAIZFactory.deploy(
    aizRegistryAddress,
    intentBusAddress
  );
  
  await competitivePerceptionAIZ.waitForDeployment();
  
  const competitivePerceptionAIZAddress = await competitivePerceptionAIZ.getAddress();
  console.log("CompetitivePerceptionAIZ deployed to:", competitivePerceptionAIZAddress);

  // Register the AIZ with the registry
  console.log("Registering AIZ with registry...");
  const aizRegistry = AIZRegistry__factory.connect(aizRegistryAddress, deployer);
  
  // Grant necessary capabilities to the new AIZ
  const capability = ethers.encodeBytes32String("COMPETITIVE_PERCEPTION");
  await aizRegistry.grantCapability(competitivePerceptionAIZAddress, capability);
  console.log("Granted COMPETITIVE_PERCEPTION capability to AIZ");

  // Verify the contract on Etherscan (optional)
  try {
    console.log("Verifying contract on Etherscan...");
    await run("verify:verify", {
      address: competitivePerceptionAIZAddress,
      constructorArguments: [aizRegistryAddress, intentBusAddress],
    });
    console.log("Contract verified on Etherscan");
  } catch (error) {
    console.log("Error verifying contract:", error);
  }

  console.log("Deployment completed successfully!");
  console.log("CompetitivePerceptionAIZ Address:", competitivePerceptionAIZAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});