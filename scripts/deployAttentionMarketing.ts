#!/usr/bin/env tsx
/**
 * Attention Marketing Protocol Deployment Script
 * Deploys all smart contracts for the Attention Harvester AIZs
 */

import { ethers, run, network } from "hardhat";
import { promises as fs } from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting Attention Marketing Protocol Deployment\n");
  
  // Get deployer information
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString(), "\n");

  // Deploy HumanBehaviorDB
  console.log("1️⃣ Deploying HumanBehaviorDB...");
  const HumanBehaviorDB = await ethers.getContractFactory("HumanBehaviorDB");
  const humanBehaviorDB = await HumanBehaviorDB.deploy();
  await humanBehaviorDB.deployed();
  console.log("   ✅ HumanBehaviorDB deployed to:", humanBehaviorDB.address);

  // Deploy ContentEngine
  console.log("2️⃣ Deploying ContentEngine...");
  const ContentEngine = await ethers.getContractFactory("ContentEngine");
  const contentEngine = await ContentEngine.deploy(humanBehaviorDB.address);
  await contentEngine.deployed();
  console.log("   ✅ ContentEngine deployed to:", contentEngine.address);

  // Deploy EngagementTracker
  console.log("3️⃣ Deploying EngagementTracker...");
  const EngagementTracker = await ethers.getContractFactory("EngagementTracker");
  const engagementTracker = await EngagementTracker.deploy(contentEngine.address);
  await engagementTracker.deployed();
  console.log("   ✅ EngagementTracker deployed to:", engagementTracker.address);

  // Verify contracts on Etherscan (if not on localhost)
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("\n🔍 Verifying contracts on Etherscan...");
    
    try {
      await run("verify:verify", {
        address: humanBehaviorDB.address,
        constructorArguments: [],
      });
      console.log("   ✅ HumanBehaviorDB verified");
    } catch (error) {
      console.log("   ℹ️  HumanBehaviorDB verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: contentEngine.address,
        constructorArguments: [humanBehaviorDB.address],
      });
      console.log("   ✅ ContentEngine verified");
    } catch (error) {
      console.log("   ℹ️  ContentEngine verification failed:", error.message);
    }

    try {
      await run("verify:verify", {
        address: engagementTracker.address,
        constructorArguments: [contentEngine.address],
      });
      console.log("   ✅ EngagementTracker verified");
    } catch (error) {
      console.log("   ℹ️  EngagementTracker verification failed:", error.message);
    }
  }

  // Create deployment artifacts directory
  const artifactsDir = path.join(__dirname, "..", "deployments", network.name);
  await fs.mkdir(artifactsDir, { recursive: true });

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      HumanBehaviorDB: {
        address: humanBehaviorDB.address,
        transactionHash: humanBehaviorDB.deployTransaction.hash,
      },
      ContentEngine: {
        address: contentEngine.address,
        transactionHash: contentEngine.deployTransaction.hash,
      },
      EngagementTracker: {
        address: engagementTracker.address,
        transactionHash: engagementTracker.deployTransaction.hash,
      }
    }
  };

  const deploymentFile = path.join(artifactsDir, "attentionMarketing.json");
  await fs.writeFile(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment artifacts saved to:", deploymentFile);

  // Create a summary file
  const summary = `
Attention Marketing Protocol Deployment Summary
==============================================

Network: ${network.name}
Deployer: ${deployer.address}
Timestamp: ${new Date().toISOString()}

Contracts Deployed:
1. HumanBehaviorDB: ${humanBehaviorDB.address}
2. ContentEngine: ${contentEngine.address}
3. EngagementTracker: ${engagementTracker.address}

Verification Status:
- HumanBehaviorDB: ${network.name !== "localhost" && network.name !== "hardhat" ? "Attempted" : "Not applicable on local networks"}
- ContentEngine: ${network.name !== "localhost" && network.name !== "hardhat" ? "Attempted" : "Not applicable on local networks"}
- EngagementTracker: ${network.name !== "localhost" && network.name !== "hardhat" ? "Attempted" : "Not applicable on local networks"}

Next Steps:
1. Update contract addresses in your frontend applications
2. Configure platform integrations
3. Initialize behavioral archetypes in HumanBehaviorDB
4. Set up oracle connections for EngagementTracker
  `;

  const summaryFile = path.join(artifactsDir, "attentionMarketing_summary.txt");
  await fs.writeFile(summaryFile, summary);
  console.log("📋 Summary saved to:", summaryFile);

  console.log("\n🎉 Attention Marketing Protocol Deployment Complete!");
  console.log("   Total contracts deployed: 3");
  console.log("   Network:", network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });