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

// scripts/deployCrossChainArbitrageAgent.ts
import { ethers } from "hardhat";

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CrossChainArbitrageAgent with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get contract factories
  const CrossChainArbitrageAgent = await ethers.getContractFactory("CrossChainArbitrageAgent");
  
  // Deploy the contract
  // Note: These addresses are placeholders and should be replaced with actual deployed contract addresses
  const crossDomainMessengerAddress = "0x4200000000000000000000000000000000000007"; // Standard address on OP chains
  const decisionLoggerAddress = "0x1234567890123456789012345678901234567890"; // Placeholder
  const agentRegistryAddress = "0x0987654321098765432109876543210987654321"; // Placeholder
  const treasuryAddress = deployer.address; // Using deployer as treasury for now

  console.log("Deploying CrossChainArbitrageAgent...");
  
  const crossChainArbitrageAgent = await CrossChainArbitrageAgent.deploy(
    crossDomainMessengerAddress,
    decisionLoggerAddress,
    agentRegistryAddress,
    treasuryAddress
  );

  await crossChainArbitrageAgent.deployed();

  console.log("CrossChainArbitrageAgent deployed to:", crossChainArbitrageAgent.address);
  
  // Verify the deployment
  console.log("Verifying deployment...");
  const owner = await crossChainArbitrageAgent.owner();
  console.log("Contract owner:", owner);
  
  const treasury = await crossChainArbitrageAgent.treasury();
  console.log("Treasury address:", treasury);
  
  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });