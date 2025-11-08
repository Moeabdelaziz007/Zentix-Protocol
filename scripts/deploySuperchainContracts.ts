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

// scripts/deploySuperchainContracts.ts
import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying Superchain contracts...');

  // Get the contract factories
  const ConsciousDecisionLogger = await ethers.getContractFactory('ConsciousDecisionLogger');
  const ConsciousAgentRegistry = await ethers.getContractFactory('ConsciousAgentRegistry');
  
  // Deploy the ConsciousDecisionLogger contract with the cross-domain messenger address
  // For testing purposes, we'll use a placeholder address
  // In a real deployment, you would use the actual L2ToL2CrossDomainMessenger address
  const crossDomainMessengerAddress = "0x0000000000000000000000000000000000000000"; // Placeholder
  
  console.log('Deploying ConsciousDecisionLogger...');
  const consciousDecisionLogger = await ConsciousDecisionLogger.deploy(crossDomainMessengerAddress);
  await consciousDecisionLogger.waitForDeployment();
  const decisionLoggerAddress = await consciousDecisionLogger.getAddress();
  console.log('ConsciousDecisionLogger deployed to:', decisionLoggerAddress);
  
  console.log('Deploying ConsciousAgentRegistry...');
  const consciousAgentRegistry = await ConsciousAgentRegistry.deploy();
  await consciousAgentRegistry.waitForDeployment();
  const agentRegistryAddress = await consciousAgentRegistry.getAddress();
  console.log('ConsciousAgentRegistry deployed to:', agentRegistryAddress);
  
  // Verify the deployments
  const decisionLoggerOwner = await consciousDecisionLogger.owner();
  const agentRegistryOwner = await consciousAgentRegistry.owner();
  console.log('Decision Logger owner:', decisionLoggerOwner);
  console.log('Agent Registry owner:', agentRegistryOwner);
  
  console.log('Deployments completed successfully!');
  
  // Save the contract addresses to a file for later use
  const fs = require('fs');
  const path = require('path');
  
  const deploymentInfo = {
    contracts: {
      ConsciousDecisionLogger: decisionLoggerAddress,
      ConsciousAgentRegistry: agentRegistryAddress
    },
    owners: {
      ConsciousDecisionLogger: decisionLoggerOwner,
      ConsciousAgentRegistry: agentRegistryOwner
    },
    timestamp: new Date().toISOString()
  };
  
  const deploymentPath = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentPath, 'superchainContracts.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('Deployment info saved to deployments/superchainContracts.json');
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });