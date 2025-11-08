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

// scripts/deployAIZProtocol.ts
import { ethers } from "hardhat";

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AIZ Protocol with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy AIZRegistry
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
  const decisionLogger = await ConsciousDecisionLogger.deploy(dummyMessengerAddress, aizRegistry.address);
  await decisionLogger.deployed();
  console.log("ConsciousDecisionLogger deployed to:", decisionLogger.address);

  // Deploy IntentBus
  console.log("\nDeploying IntentBus...");
  const IntentBus = await ethers.getContractFactory("IntentBus");
  const intentBus = await IntentBus.deploy(aizRegistry.address);
  await intentBus.deployed();
  console.log("IntentBus deployed to:", intentBus.address);

  // Deploy ToolRegistry
  console.log("\nDeploying ToolRegistry...");
  const ToolRegistry = await ethers.getContractFactory("ToolRegistry");
  const toolRegistry = await ToolRegistry.deploy(aizRegistry.address);
  await toolRegistry.deployed();
  console.log("ToolRegistry deployed to:", toolRegistry.address);

  // Deploy DataStreamRegistry
  console.log("\nDeploying DataStreamRegistry...");
  const DataStreamRegistry = await ethers.getContractFactory("DataStreamRegistry");
  const dataStreamRegistry = await DataStreamRegistry.deploy(aizRegistry.address);
  await dataStreamRegistry.deployed();
  console.log("DataStreamRegistry deployed to:", dataStreamRegistry.address);

  // Register sample AIZs
  console.log("\nRegistering sample AIZs...");

  // Register Revenue Generation AIZ
  const revenueGenAIZId = ethers.utils.formatBytes32String("AIZ-REVENUE-GEN");
  const tx1 = await aizRegistry.registerAIZ(
    revenueGenAIZId,
    "Revenue Generation AIZ",
    "AIZ specialized in automated DeFi strategies for yield farming and arbitrage",
    deployer.address, // Using deployer as placeholder orchestrator
    [10], // OP Mainnet
    [deployer.address] // Using deployer as placeholder contract
  );
  await tx1.wait();
  console.log("✅ Registered Revenue Generation AIZ");

  // Grant capabilities to Revenue Generation AIZ
  const canUseFlashLoans = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("canUseFlashLoans()")).substring(0, 10);
  const tx2 = await aizRegistry.setCapability(revenueGenAIZId, canUseFlashLoans, true);
  await tx2.wait();
  console.log("✅ Granted flash loan capability to Revenue Generation AIZ");

  const canDeployNewContracts = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("canDeployNewContracts()")).substring(0, 10);
  const tx3 = await aizRegistry.setCapability(revenueGenAIZId, canDeployNewContracts, true);
  await tx3.wait();
  console.log("✅ Granted contract deployment capability to Revenue Generation AIZ");

  // Register Marketing AIZ
  const marketingAIZId = ethers.utils.formatBytes32String("AIZ-MARKETING");
  const tx4 = await aizRegistry.registerAIZ(
    marketingAIZId,
    "Marketing AIZ",
    "AIZ specialized in AI-powered marketing strategies and campaign management",
    deployer.address, // Using deployer as placeholder orchestrator
    [10], // OP Mainnet
    [deployer.address] // Using deployer as placeholder contract
  );
  await tx4.wait();
  console.log("✅ Registered Marketing AIZ");

  // Grant capabilities to Marketing AIZ
  const canSpendFromTreasury = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("canSpendFromTreasury()")).substring(0, 10);
  const tx5 = await aizRegistry.setCapability(marketingAIZId, canSpendFromTreasury, true);
  await tx5.wait();
  console.log("✅ Granted treasury spending capability to Marketing AIZ");

  console.log("\n🎉 AIZ Protocol deployment completed!");
  console.log("\n📋 Deployed Contracts:");
  console.log("   AIZRegistry:", aizRegistry.address);
  console.log("   ConsciousDecisionLogger:", decisionLogger.address);
  console.log("   IntentBus:", intentBus.address);
  console.log("   ToolRegistry:", toolRegistry.address);
  console.log("   DataStreamRegistry:", dataStreamRegistry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});