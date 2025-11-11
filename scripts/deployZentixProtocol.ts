import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Zentix Protocol contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy AIZ Registry (assuming it already exists, otherwise deploy it)
  // For this example, we'll assume it's already deployed
  const aizRegistryAddress = "0x..."; // Replace with actual address
  
  // Deploy Intent Bus (assuming it already exists)
  const intentBusAddress = "0x..."; // Replace with actual address
  
  // Deploy Conscious Decision Logger (assuming it already exists)
  const decisionLoggerAddress = "0x..."; // Replace with actual address
  
  // Deploy Zentix Chronicle (Memory Layer)
  const ZentixChronicle = await ethers.getContractFactory("ZentixChronicle");
  const zentixChronicle = await ZentixChronicle.deploy(decisionLoggerAddress, aizRegistryAddress);
  await zentixChronicle.deployed();
  console.log("ZentixChronicle deployed to:", zentixChronicle.address);
  
  // Deploy Zentix Oracle Network
  const ZentixOracleNetwork = await ethers.getContractFactory("ZentixOracleNetwork");
  const zentixOracleNetwork = await ZentixOracleNetwork.deploy(aizRegistryAddress);
  await zentixOracleNetwork.deployed();
  console.log("ZentixOracleNetwork deployed to:", zentixOracleNetwork.address);
  
  // Deploy Zentix Capital Nexus
  const treasuryTokenAddress = "0x..."; // Replace with actual token address
  const ZentixCapitalNexus = await ethers.getContractFactory("ZentixCapitalNexus");
  const zentixCapitalNexus = await ZentixCapitalNexus.deploy(aizRegistryAddress, intentBusAddress, treasuryTokenAddress);
  await zentixCapitalNexus.deployed();
  console.log("ZentixCapitalNexus deployed to:", zentixCapitalNexus.address);
  
  // Deploy Agent Foundry
  const AgentFoundry = await ethers.getContractFactory("AgentFoundry");
  const agentFoundry = await AgentFoundry.deploy(aizRegistryAddress, intentBusAddress, decisionLoggerAddress);
  await agentFoundry.deployed();
  console.log("AgentFoundry deployed to:", agentFoundry.address);
  
  // Deploy Social Graph Registry
  const SocialGraphRegistry = await ethers.getContractFactory("SocialGraphRegistry");
  const socialGraphRegistry = await SocialGraphRegistry.deploy(aizRegistryAddress, decisionLoggerAddress);
  await socialGraphRegistry.deployed();
  console.log("SocialGraphRegistry deployed to:", socialGraphRegistry.address);
  
  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });