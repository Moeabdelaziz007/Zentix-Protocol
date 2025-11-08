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

// scripts/deployRevenueGenerationAIZ.ts
import { ethers } from "hardhat";

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Revenue Generation AIZ with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy AIZRegistry first if not already deployed
  console.log("\nDeploying AIZRegistry...");
  const AIZRegistry = await ethers.getContractFactory("AIZRegistry");
  const aizRegistry = await AIZRegistry.deploy();
  await aizRegistry.deployed();
  console.log("AIZRegistry deployed to:", aizRegistry.address);

  // Deploy ConsciousDecisionLogger
  console.log("\nDeploying ConsciousDecisionLogger...");
  // Using a dummy address for the cross-domain messenger for this demo
  const dummyMessengerAddress = deployer.address;
  const ConsciousDecisionLogger = await ethers.getContractFactory("ConsciousDecisionLogger");
  const decisionLogger = await ConsciousDecisionLogger.deploy(dummyMessengerAddress);
  await decisionLogger.deployed();
  console.log("ConsciousDecisionLogger deployed to:", decisionLogger.address);

  // Deploy Revenue Generation AIZ Orchestrator
  console.log("\nDeploying Revenue Generation AIZ...");
  const aizId = ethers.utils.formatBytes32String("AIZ-REVENUE-GEN");
  const RevenueGenerationAIZ = await ethers.getContractFactory("RevenueGenerationAIZ");
  const revenueAIZ = await RevenueGenerationAIZ.deploy(
    aizId,
    aizRegistry.address,
    decisionLogger.address
  );
  await revenueAIZ.deployed();
  console.log("Revenue Generation AIZ deployed to:", revenueAIZ.address);

  // Register the AIZ in the registry
  console.log("\nRegistering AIZ in registry...");
  await aizRegistry.registerAIZ(
    aizId,
    "Revenue Generation AIZ",
    "Automated DeFi strategies for yield farming and arbitrage",
    revenueAIZ.address,
    [10, 8453], // OP Mainnet and Base
    [revenueAIZ.address, revenueAIZ.address] // Contract addresses on each chain
  );
  console.log("AIZ registered in registry");

  // Grant capabilities to the AIZ
  console.log("\nGranting capabilities...");
  await aizRegistry.grantCapability(
    aizId,
    "canUseFlashLoans",
    0 // No limit
  );
  
  await aizRegistry.grantCapability(
    aizId,
    "canSpendFromTreasury",
    ethers.utils.parseEther("1000000") // 1M limit
  );
  console.log("Capabilities granted");

  // Verify the deployment
  console.log("\nVerifying deployment...");
  const aizInfo = await aizRegistry.getAIZ(aizId);
  console.log("AIZ Info:");
  console.log("  Name:", aizInfo.name);
  console.log("  Description:", aizInfo.description);
  console.log("  Orchestrator:", aizInfo.orchestrator);
  console.log("  Active:", aizInfo.isActive);

  const hasFlashLoanCapability = await aizRegistry.hasCapability(aizId, "canUseFlashLoans");
  console.log("Has flash loan capability:", hasFlashLoanCapability);

  const hasTreasuryCapability = await aizRegistry.hasCapability(aizId, "canSpendFromTreasury");
  console.log("Has treasury spending capability:", hasTreasuryCapability);

  // Test executing a flash loan
  console.log("\nTesting flash loan execution...");
  const flashLoanParams = {
    asset: ethers.constants.AddressZero,
    amount: ethers.utils.parseEther("1000"),
    protocol: ethers.constants.AddressZero,
    data: ethers.utils.toUtf8Bytes("")
  };

  try {
    const tx = await revenueAIZ.executeFlashLoan(flashLoanParams);
    await tx.wait();
    console.log("✅ Flash loan executed successfully");
  } catch (error) {
    console.error("❌ Flash loan execution failed:", error);
  }

  console.log("\nRevenue Generation AIZ deployment completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});