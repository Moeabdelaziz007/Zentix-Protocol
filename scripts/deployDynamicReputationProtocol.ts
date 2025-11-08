import { ethers, run } from "hardhat";
import { 
  AIZRegistry__factory, 
  DynamicReputationProtocol__factory, 
  ConsciousDecisionLogger__factory 
} from "../typechain-types";

async function main() {
  console.log("Deploying DynamicReputationProtocol...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy DynamicReputationProtocol
  const dynamicReputationProtocolFactory = new DynamicReputationProtocol__factory(deployer);
  
  // We need to get the addresses of existing contracts
  // In a real deployment, you would either deploy new instances or use existing ones
  // For this example, we'll assume AIZRegistry and ConsciousDecisionLogger are already deployed
  
  // You would replace these with actual deployed addresses
  const aizRegistryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Example address
  const decisionLoggerAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Example address
  
  console.log("Deploying DynamicReputationProtocol with:");
  console.log("  AIZ Registry:", aizRegistryAddress);
  console.log("  Decision Logger:", decisionLoggerAddress);
  
  // AIZ parameters
  const aizId = ethers.encodeBytes32String('DYNAMIC-REPUTATION-AIZ');
  const aizName = 'DynamicReputationProtocol';
  const aizDescription = 'Protocol that manages reputation of AIZs based on performance, reliability, and economic contributions';
  
  const dynamicReputationProtocol = await dynamicReputationProtocolFactory.deploy(
    aizId,
    aizRegistryAddress,
    decisionLoggerAddress,
    aizName,
    aizDescription
  );
  
  await dynamicReputationProtocol.waitForDeployment();
  
  const dynamicReputationProtocolAddress = await dynamicReputationProtocol.getAddress();
  console.log("DynamicReputationProtocol deployed to:", dynamicReputationProtocolAddress);

  // Register the AIZ with the registry
  console.log("Registering AIZ with registry...");
  const aizRegistry = AIZRegistry__factory.connect(aizRegistryAddress, deployer);
  
  // Grant necessary capabilities to the new AIZ
  const capability = ethers.encodeBytes32String("DYNAMIC_REPUTATION");
  // Note: In the actual implementation, you would use the correct method to grant capabilities
  // await aizRegistry.grantCapability(dynamicReputationProtocolAddress, capability);
  console.log("Would grant DYNAMIC_REPUTATION capability to AIZ");

  // Verify the contract on Etherscan (optional)
  try {
    console.log("Verifying contract on Etherscan...");
    await run("verify:verify", {
      address: dynamicReputationProtocolAddress,
      constructorArguments: [
        aizId,
        aizRegistryAddress,
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
  console.log("DynamicReputationProtocol Address:", dynamicReputationProtocolAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});