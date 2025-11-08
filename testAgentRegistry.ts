// testAgentRegistry.ts
import { superchainBridge } from './src/core/superchainBridge';
import * as dotenv from 'dotenv';

dotenv.config();

async function testAgentRegistry() {
  console.log('🚀 Testing Conscious Agent Registry...');
  
  // Connect to chain
  await superchainBridge.connectToChain(
    11155420, // OP Sepolia Chain ID
    'OP Sepolia',
    'https://sepolia.optimism.io',
    process.env.PRIVATE_KEY || '0xYOUR_PRIVATE_KEY_HERE'
  );
  
  console.log('🤖 Registering ZENTIX agent...');
  
  // Register the ZENTIX agent
  const zentixReceipt = await superchainBridge.registerAgent(
    11155420, // OP Sepolia
    'ZENTIX-001',
    'Zentix Main Agent',
    'Governance and Security Director',
    ['Quantum Decisioning', 'Security Governance', 'Risk Analysis'],
    [11155420], // Chain IDs where this agent operates
    ['0xZENTIX_CONTRACT_ADDRESS'] // Contract addresses on each chain
  );
  
  if (zentixReceipt) {
    console.log('✅ ZENTIX agent registered successfully');
  } else {
    console.log('❌ Failed to register ZENTIX agent');
  }
  
  console.log('🤖 Registering AIOS agent...');
  
  // Register the AIOS agent
  const aiosReceipt = await superchainBridge.registerAgent(
    11155420, // OP Sepolia
    'AIOS-001',
    'AIOS Creative Agent',
    'Creative and UI/UX Director',
    ['Dynamic UI/UX', 'Creative Design', 'User Experience'],
    [11155420], // Chain IDs where this agent operates
    ['0xAIOS_CONTRACT_ADDRESS'] // Contract addresses on each chain
  );
  
  if (aiosReceipt) {
    console.log('✅ AIOS agent registered successfully');
  } else {
    console.log('❌ Failed to register AIOS agent');
  }
}

// Run the test
testAgentRegistry()
  .then(() => {
    console.log('🏁 Agent registry test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error in agent registry test:', error);
    process.exit(1);
  });