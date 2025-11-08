/**
 * MIT License
 * 
 * Copyright (c) 2025 Mohamed Hossameldin Abdelaziz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * Contact Information:
 * Mohamed Hossameldin Abdelaziz
 * Email: Mabdela1@students.kennesaw.edu
 * Alternate Email: Amrikyy@gmail.com
 * Phone: +201094228044
 * WhatsApp: +17706160211
 * LinkedIn: https://www.linkedin.com/in/mohamed-abdelaziz-815797347/
 */

// scripts/deployAIZRegistry.ts
import { ethers } from "hardhat";

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AIZRegistry with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get contract factory
  const AIZRegistry = await ethers.getContractFactory("AIZRegistry");
  
  // Deploy the contract
  console.log("Deploying AIZRegistry...");
  
  const aizRegistry = await AIZRegistry.deploy();

  await aizRegistry.deployed();

  console.log("AIZRegistry deployed to:", aizRegistry.address);
  
  // Verify the deployment
  console.log("Verifying deployment...");
  const owner = await aizRegistry.owner();
  console.log("Contract owner:", owner);
  
  // Test registering a sample AIZ
  console.log("\nRegistering sample AIZs...");
  
  // Register Revenue Generation AIZ
  const revenueGenAIZId = ethers.utils.formatBytes32String("AIZ-REVENUE-GEN");
  await aizRegistry.registerAIZ(
    revenueGenAIZId,
    "Revenue Generation AIZ",
    "Automated DeFi strategies for yield farming and arbitrage",
    deployer.address, // For demo purposes, using deployer as orchestrator
    [10, 8453], // OP Mainnet and Base
    [deployer.address, deployer.address] // Demo addresses
  );
  
  console.log("Registered Revenue Generation AIZ");
  
  // Grant capabilities to Revenue Generation AIZ
  await aizRegistry.grantCapability(
    revenueGenAIZId,
    "canUseFlashLoans",
    0 // No limit
  );
  
  await aizRegistry.grantCapability(
    revenueGenAIZId,
    "canSpendFromTreasury",
    ethers.utils.parseEther("1000000") // 1M limit
  );
  
  console.log("Granted capabilities to Revenue Generation AIZ");
  
  // Register Marketing AIZ
  const marketingAIZId = ethers.utils.formatBytes32String("AIZ-MARKETING");
  await aizRegistry.registerAIZ(
    marketingAIZId,
    "Marketing AIZ",
    "AI-powered marketing strategies and campaign management",
    deployer.address, // For demo purposes, using deployer as orchestrator
    [10, 8453], // OP Mainnet and Base
    [deployer.address, deployer.address] // Demo addresses
  );
  
  console.log("Registered Marketing AIZ");
  
  // Grant capabilities to Marketing AIZ
  await aizRegistry.grantCapability(
    marketingAIZId,
    "canSpendFromTreasury",
    ethers.utils.parseEther("5000") // 5K limit
  );
  
  await aizRegistry.grantCapability(
    marketingAIZId,
    "canAccessDataStreams",
    0 // No limit
  );
  
  console.log("Granted capabilities to Marketing AIZ");
  
  // Verify registrations
  const totalAIZs = await aizRegistry.getTotalAIZs();
  console.log(`\nTotal AIZs registered: ${totalAIZs}`);
  
  const aizIds = await aizRegistry.getAIZIds(0, totalAIZs.toNumber());
  for (const aizId of aizIds) {
    const aiz = await aizRegistry.getAIZ(aizId);
    console.log(`\nAIZ: ${ethers.utils.parseBytes32String(aizId)}`);
    console.log(`  Name: ${aiz.name}`);
    console.log(`  Description: ${aiz.description}`);
    console.log(`  Active: ${aiz.isActive}`);
    console.log(`  Chains: ${aiz.chainIds.length}`);
  }
  
  console.log("\nAIZRegistry deployment and initial setup completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});