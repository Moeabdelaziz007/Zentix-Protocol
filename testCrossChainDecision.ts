// testCrossChainDecision.ts
import { superchainBridge } from './src/core/superchainBridge';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

async function testCrossChainDecision() {
  console.log('🚀 Testing Cross-Chain Conscious Decision...');
  
  // Connect to source chain (OP Sepolia)
  await superchainBridge.connectToChain(
    11155420, // OP Sepolia Chain ID
    'OP Sepolia',
    'https://sepolia.optimism.io',
    process.env.PRIVATE_KEY || '0xYOUR_PRIVATE_KEY_HERE'
  );
  
  // Connect to destination chain (Base Sepolia)
  await superchainBridge.connectToChain(
    84532, // Base Sepolia Chain ID
    'Base Sepolia',
    'https://sepolia.base.org',
    process.env.PRIVATE_KEY || '0xYOUR_PRIVATE_KEY_HERE'
  );
  
  // Create a conscious decision
  const consciousDecision = {
    agentId: 'ZENTIX-001',
    project: 'Self-Adapting Secure Interface',
    collaborators: ['AIOS-001'],
    skills: {
      'Security Governance': 'Advanced',
      'Risk Analysis': 'Expert'
    },
    roles: {
      'Project Lead': 'ZENTIX-001',
      'UI/UX Designer': 'AIOS-001'
    },
    consciousnessState: {
      valence: 0.8,
      arousal: 0.7,
      motivation: 0.9
    },
    dnaExpression: 'GOVERNANCE|SECURITY|ETHICS'
  };
  
  console.log('🧠 Creating conscious decision on source chain...');
  
  // Send the decision to the source chain
  const receipt = await superchainBridge.sendConsciousDecisionToChain(
    11155420, // OP Sepolia
    consciousDecision
  );
  
  if (receipt) {
    console.log('✅ Decision created successfully on source chain');
    
    // Get the decision ID from the receipt logs
    // In a real implementation, you would parse the logs to get the decision ID
    const decisionId = 1; // Placeholder
    
    console.log('🔗 Sending decision to destination chain...');
    
    // Send the decision to the destination chain
    const crossChainReceipt = await superchainBridge.sendConsciousDecisionCrossChain(
      11155420, // Source: OP Sepolia
      84532,    // Destination: Base Sepolia
      '0xDESTINATION_CONTRACT_ADDRESS', // Replace with actual destination contract address
      decisionId
    );
    
    if (crossChainReceipt) {
      console.log('✅ Decision successfully sent to destination chain');
    } else {
      console.log('❌ Failed to send decision to destination chain');
    }
  } else {
    console.log('❌ Failed to create decision on source chain');
  }
}

// Run the test
testCrossChainDecision()
  .then(() => {
    console.log('🏁 Cross-chain decision test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error in cross-chain decision test:', error);
    process.exit(1);
  });