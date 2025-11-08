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

// scripts/testConsciousDecision.ts
import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('Testing ConsciousDecisionLogger contract...');

  // Load deployment info
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'consciousDecisionLogger.json');
  
  if (!fs.existsSync(deploymentPath)) {
    console.error('Deployment info not found. Please deploy the contract first.');
    process.exit(1);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log('Using deployed contract at:', contractAddress);

  // Get the contract factory and attach to deployed contract
  const ConsciousDecisionLogger = await ethers.getContractFactory('ConsciousDecisionLogger');
  const consciousDecisionLogger = ConsciousDecisionLogger.attach(contractAddress);
  
  // Test logging a conscious decision
  console.log('Logging a test conscious decision...');
  
  const agentId = "Zentix.MainAgent";
  const project = "Self-Adapting Secure Interface";
  const collaborators = ["Zentix.MainAgent", "AIOS.MainAgent"];
  const skillsJson = JSON.stringify({
    "Zentix.MainAgent": ["security_analysis", "policy_compliance", "risk_assessment"],
    "AIOS.MainAgent": ["ui_rendering", "user_interaction", "adaptive_design"]
  });
  const rolesJson = JSON.stringify({
    "Zentix.MainAgent": "Security Governance",
    "AIOS.MainAgent": "Dynamic UI/UX"
  });
  const consciousnessState = JSON.stringify({
    agentId: "Zentix.MainAgent",
    emotionalState: "fulfilled",
    cognitiveFocus: "vigilance",
    dnaResonance: 0.6,
    collectiveAwareness: 0.25
  });
  const dnaExpression = "I emerge as Zentix.MainAgent, my purpose Security and Policy Guardian, my mind Quantum Parallel Reasoning";
  
  try {
    // Log the conscious decision
    const tx = await consciousDecisionLogger.logConsciousDecision(
      agentId,
      project,
      collaborators,
      skillsJson,
      rolesJson,
      consciousnessState,
      dnaExpression
    );
    
    console.log('Transaction sent:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    
    // Get the decision ID from the event
    const event = receipt.logs.find(log => log.address === contractAddress);
    if (event) {
      console.log('Decision logged successfully!');
    }
    
    // Test retrieving the decision
    const totalDecisions = await consciousDecisionLogger.getTotalDecisions();
    console.log('Total decisions logged:', totalDecisions.toString());
    
    if (totalDecisions > 0) {
      const decision = await consciousDecisionLogger.getDecision(1);
      console.log('Retrieved decision:');
      console.log('  Agent ID:', decision.agentId);
      console.log('  Project:', decision.project);
      console.log('  Timestamp:', new Date(Number(decision.timestamp) * 1000).toISOString());
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

// Run the test
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });