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

/**
 * AIZ Template Entry Point
 * Main execution file for the AIZ template
 */

console.log('🚀 Starting AIZ Template...');
console.log('📦 AIZ Name:', process.env.AIZ_NAME || 'aiz-template');
console.log('🔢 AIZ Version:', process.env.AIZ_VERSION || '1.0.0');

// Import required modules
const fs = require('fs');
const path = require('path');

// Load manifest
const manifestPath = path.join(__dirname, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log('📋 AIZ Description:', manifest.description);
  console.log('🤖 Agents Count:', manifest.agents ? manifest.agents.length : 0);
  console.log('🛠️  Tools Count:', manifest.tools ? manifest.tools.length : 0);
}

// Import agent classes
const PlannerAgent = require('./agents/planner_agent');
const RiskAgent = require('./agents/risk_agent');
const ExecutionAgent = require('./agents/execution_agent');

// Initialize agents
console.log('\n🔧 Initializing AIZ Agents...');

const plannerAgent = new PlannerAgent();
console.log('   - Planner Agent: 🟢 Active');

const riskAgent = new RiskAgent();
console.log('   - Risk Agent: 🟢 Active');

const executionAgent = new ExecutionAgent();
console.log('   - Execution Agent: 🟢 Active');

// Start agents
console.log('\n▶️  Starting AIZ Agents...');
plannerAgent.start();
riskAgent.start();
executionAgent.start();

// Simulate AIZ operation
console.log('\n🔄 AIZ Template is now running...');
console.log('   Use Ctrl+C to stop the AIZ');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down AIZ Template...');
  
  // Stop agents
  plannerAgent.stop();
  riskAgent.stop();
  executionAgent.stop();
  
  console.log('✅ AIZ Template shutdown complete');
  process.exit(0);
});

// Export for use as a module
module.exports = {
  PlannerAgent,
  RiskAgent,
  ExecutionAgent
};