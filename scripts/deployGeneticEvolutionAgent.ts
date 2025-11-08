import { ethers, run } from "hardhat";
import { 
  AIZRegistry__factory, 
  GeneticEvolutionAgent__factory, 
  IntentBus__factory,
  ConsciousDecisionLogger__factory 
} from "../typechain-types";

async function main() {
  console.log("Deploying GeneticEvolutionAgent...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy GeneticEvolutionAgent
  const geneticEvolutionAgentFactory = new GeneticEvolutionAgent__factory(deployer);
  
  // We need to get the addresses of existing contracts
  // In a real deployment, you would either deploy new instances or use existing ones
  // For this example, we'll assume AIZRegistry, IntentBus, and ConsciousDecisionLogger are already deployed
  
  // You would replace these with actual deployed addresses
  const aizRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Example address
  const intentBusAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Example address
  const decisionLoggerAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Example address
  
  console.log("Deploying GeneticEvolutionAgent with:");
  console.log("  AIZ Registry:", aizRegistryAddress);
  console.log("  Intent Bus:", intentBusAddress);
  console.log("  Decision Logger:", decisionLoggerAddress);
  
  // AIZ parameters
  const aizId = ethers.encodeBytes32String('GENETIC-EVOLUTION-AIZ');
  const aizName = 'GeneticEvolutionAgent';
  const aizDescription = 'AIZ that creates and evolves new strategies using genetic algorithms';
  
  const geneticEvolutionAgent = await geneticEvolutionAgentFactory.deploy(
    aizId,
    aizRegistryAddress,
    intentBusAddress,
    decisionLoggerAddress,
    aizName,
    aizDescription
  );
  
  await geneticEvolutionAgent.waitForDeployment();
  
  const geneticEvolutionAgentAddress = await geneticEvolutionAgent.getAddress();
  console.log("GeneticEvolutionAgent deployed to:", geneticEvolutionAgentAddress);

  // Register the AIZ with the registry
  console.log("Registering AIZ with registry...");
  const aizRegistry = AIZRegistry__factory.connect(aizRegistryAddress, deployer);
  
  // Grant necessary capabilities to the new AIZ
  const capability = ethers.encodeBytes32String("GENETIC_EVOLUTION");
  // Note: In the actual implementation, you would use the correct method to grant capabilities
  // await aizRegistry.grantCapability(geneticEvolutionAgentAddress, capability);
  console.log("Would grant GENETIC_EVOLUTION capability to AIZ");

  // Verify the contract on Etherscan (optional)
  try {
    console.log("Verifying contract on Etherscan...");
    await run("verify:verify", {
      address: geneticEvolutionAgentAddress,
      constructorArguments: [
        aizId,
        aizRegistryAddress,
        intentBusAddress,
        decisionLoggerAddress,
        aizName,
        aizDescription
      ],
    });
    console.log("Contract verified on Etherscan");
  } catch (error) {
    console.log("Error verifying contract:", error);
  }

  console.log("Deployment completed successfully!");
  console.log("GeneticEvolutionAgent Address:", geneticEvolutionAgentAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});