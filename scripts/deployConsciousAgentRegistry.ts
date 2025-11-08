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

// scripts/deployConsciousAgentRegistry.ts
import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying ConsciousAgentRegistry contract...');

  // Get the contract factory
  const ConsciousAgentRegistry = await ethers.getContractFactory('ConsciousAgentRegistry');
  
  // Deploy the contract
  const consciousAgentRegistry = await ConsciousAgentRegistry.deploy();
  
  // Wait for deployment
  await consciousAgentRegistry.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await consciousAgentRegistry.getAddress();
  
  console.log('ConsciousAgentRegistry deployed to:', contractAddress);
  
  // Verify the deployment by calling a function
  const owner = await consciousAgentRegistry.owner();
  console.log('Contract owner:', owner);
  
  console.log('Deployment completed successfully!');
  
  // Save the contract address to a file for later use
  const fs = require('fs');
  const path = require('path');
  
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: owner,
    timestamp: new Date().toISOString()
  };
  
  const deploymentPath = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentPath, 'consciousAgentRegistry.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('Deployment info saved to deployments/consciousAgentRegistry.json');
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });