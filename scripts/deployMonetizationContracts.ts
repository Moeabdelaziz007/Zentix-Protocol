#!/usr/bin/env tsx
/**
 * Deploy Script: Monetization Contracts
 * Deploys the new monetization contracts for the Zentix Protocol
 */

import { ethers } from "hardhat";

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Monetization Contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy Priority Intent Bus
  console.log("\nDeploying PriorityIntentBus...");
  const PriorityIntentBus = await ethers.getContractFactory("PriorityIntentBus");
  // Using dummy addresses for now - in a real deployment, you would use the actual contract addresses
  const dummyAIZRegistry = deployer.address;
  const dummyZXTToken = deployer.address;
  const treasury = deployer.address;
  
  const priorityIntentBus = await PriorityIntentBus.deploy(
    dummyAIZRegistry,
    dummyZXTToken,
    treasury
  );
  await priorityIntentBus.deployed();
  console.log("PriorityIntentBus deployed to:", priorityIntentBus.address);

  // Deploy AI Model Store
  console.log("\nDeploying AIModelStore...");
  const AIModelStore = await ethers.getContractFactory("AIModelStore");
  const aiModelStore = await AIModelStore.deploy(
    dummyZXTToken,
    treasury
  );
  await aiModelStore.deployed();
  console.log("AIModelStore deployed to:", aiModelStore.address);

  // Deploy Reputation Bond
  console.log("\nDeploying ReputationBond...");
  const ReputationBond = await ethers.getContractFactory("ReputationBond");
  // Using dummy addresses for now
  const dummyReputationProtocol = deployer.address;
  const dummyUSDCToken = deployer.address;
  
  const reputationBond = await ReputationBond.deploy(
    dummyAIZRegistry,
    dummyReputationProtocol,
    dummyUSDCToken,
    dummyZXTToken,
    treasury
  );
  await reputationBond.deployed();
  console.log("ReputationBond deployed to:", reputationBond.address);

  console.log("\n🎉 Monetization Contracts deployment completed!");
  console.log("\n📋 Deployed Contracts:");
  console.log("   PriorityIntentBus:", priorityIntentBus.address);
  console.log("   AIModelStore:", aiModelStore.address);
  console.log("   ReputationBond:", reputationBond.address);

  console.log("\n📝 Next steps:");
  console.log("   1. Update contract addresses in the deployment script with actual addresses");
  console.log("   2. Run the deployment script with correct addresses");
  console.log("   3. Test the monetization contracts");
  console.log("   4. Integrate with existing AIZ protocol components");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});