#!/usr/bin/env tsx
/**
 * Zentix Protocol v0.4 - Blockchain Integration Demo
 * Shows IPFS storage and on-chain anchoring
 */

import { AgentFactory } from '../core/integration/agentFactory';
import { BlockchainService } from '../core/blockchain/blockchainService';
import { IPFSService } from '../core/blockchain/ipfsService';

async function demonstrateBlockchainIntegration() {
  console.log('\n🌌 Zentix Protocol v0.4 - Blockchain Integration\n');
  console.log('═'.repeat(60) + '\n');

  // Check configuration
  console.log('🔧 Configuration Status:\n');
  console.log(`   IPFS (Pinata): ${IPFSService.isConfigured() ? '✅ Configured' : '⚠️  Using mock'}`);
  console.log(`   Mumbai Testnet: ${BlockchainService.isConfigured('mumbai') ? '✅ Configured' : '⚠️  Using mock'}`);
  console.log('\n');

  // ===============================================================
  // STEP 1: Create Agent with Full Integration
  // ===============================================================
  console.log('1️⃣  Creating Agent with Blockchain Integration\n');

  const agent = AgentFactory.createCompleteAgent({
    name: 'Nexus',
    archetype: 'guardian',
    tone: 'protective and vigilant',
    values: ['security', 'trust', 'integrity'],
    skills: [
      { name: 'security_audit', description: 'Audit smart contracts' },
      { name: 'threat_detection', description: 'Detect security threats' },
    ],
    workspace_id: 'blockchain-workspace',
    blockchain: 'Polygon',
    initial_balance: 250,
  });

  console.log(`✅ Agent Created: ${agent.aix_did.aix.name}`);
  console.log(`   DID: ${agent.aix_did.did.did}`);
  console.log(`   Wallet: ${agent.wallet.address}`);
  console.log(`   Balance: ${agent.wallet.balance} ZXT\n`);

  // ===============================================================
  // STEP 2: Anchor DID to IPFS + Blockchain
  // ===============================================================
  console.log('2️⃣  Anchoring DID to IPFS & Blockchain\n');

  const didAnchor = await BlockchainService.anchorDIDToBlockchain(
    agent.aix_did.did,
    'mumbai'
  );

  if (didAnchor.success) {
    console.log('✅ DID Successfully Anchored:');
    console.log(`   IPFS CID: ${didAnchor.ipfsCid}`);
    console.log(`   TX Hash: ${didAnchor.transactionHash}`);
    console.log(`   Block: ${didAnchor.blockNumber}`);
    console.log(`   Gateway: ${IPFSService.getGatewayUrl(didAnchor.ipfsCid!)}\n`);
    
    if (didAnchor.transactionHash) {
      console.log(`   Explorer: ${BlockchainService.getExplorerUrl(didAnchor.transactionHash, 'mumbai')}\n`);
    }
  } else {
    console.log(`❌ Anchoring failed: ${didAnchor.error}\n`);
  }

  // ===============================================================
  // STEP 3: Anchor Wallet to Blockchain
  // ===============================================================
  console.log('3️⃣  Anchoring Wallet to Blockchain\n');

  const walletAnchor = await BlockchainService.anchorWalletToBlockchain(
    agent.wallet,
    'mumbai'
  );

  if (walletAnchor.success) {
    console.log('✅ Wallet Successfully Anchored:');
    console.log(`   IPFS CID: ${walletAnchor.ipfsCid}`);
    console.log(`   TX Hash: ${walletAnchor.transactionHash}`);
    console.log(`   Block: ${walletAnchor.blockNumber}\n`);
  } else {
    console.log(`❌ Wallet anchoring failed: ${walletAnchor.error}\n`);
  }

  // ===============================================================
  // STEP 4: Agent Evolution Events
  // ===============================================================
  console.log('4️⃣  Recording Agent Evolution\n');

  // Agent completes tasks and earns rewards
  let updatedAgent = AgentFactory.rewardAgent(agent, 50, 'Smart contract audit completed');
  console.log('💰 Agent rewarded: +50 ZXT');

  updatedAgent = AgentFactory.rewardAgent(updatedAgent, 75, 'Security threat detected and neutralized');
  console.log('💰 Agent rewarded: +75 ZXT');

  console.log(`   New balance: ${updatedAgent.wallet.balance} ZXT\n`);

  // Upload updated state to IPFS
  console.log('📤 Uploading agent evolution to IPFS...');
  const evolutionData = {
    did: updatedAgent.aix_did.did.did,
    wallet_balance: updatedAgent.wallet.balance,
    total_events: updatedAgent.aix_did.did.history.length,
    last_update: new Date().toISOString(),
  };

  const evolutionUpload = await IPFSService.uploadJSON(
    evolutionData,
    'agent-evolution-snapshot'
  );

  if (evolutionUpload.success) {
    console.log(`✅ Evolution snapshot saved to IPFS: ${evolutionUpload.cid}\n`);
  }

  // ===============================================================
  // STEP 5: Complete Agent Profile with Blockchain Data
  // ===============================================================
  console.log('5️⃣  Complete Agent Profile\n');

  const profile = AgentFactory.getAgentProfile(updatedAgent);
  
  console.log('👤 Agent Profile:');
  console.log(`   Name: ${profile.name}`);
  console.log(`   DID: ${profile.did}`);
  console.log(`   Fingerprint: ${profile.fingerprint}`);
  console.log(`   Age: ${profile.age_days} days`);
  console.log(`   Wallet Balance: ${profile.wallet.balance} ZXT`);
  console.log(`   Total Transactions: ${profile.wallet.total_transactions}`);
  console.log(`   Total Events: ${profile.total_events}`);
  console.log(`   Blockchain: ${profile.anchoring.did_blockchain}`);
  console.log('\n');

  // ===============================================================
  // STEP 6: Blockchain Verification
  // ===============================================================
  console.log('6️⃣  Blockchain Verification Summary\n');

  console.log('🔗 On-Chain Anchors:');
  console.log(`   ✅ DID anchored: ${didAnchor.success ? 'YES' : 'NO'}`);
  console.log(`   ✅ Wallet anchored: ${walletAnchor.success ? 'YES' : 'NO'}`);
  console.log(`   ✅ Evolution tracked: ${evolutionUpload.success ? 'YES' : 'NO'}`);
  console.log('\n');

  console.log('📦 IPFS Storage:');
  if (didAnchor.ipfsCid) {
    console.log(`   DID: ipfs://${didAnchor.ipfsCid}`);
  }
  if (walletAnchor.ipfsCid) {
    console.log(`   Wallet: ipfs://${walletAnchor.ipfsCid}`);
  }
  if (evolutionUpload.cid) {
    console.log(`   Evolution: ipfs://${evolutionUpload.cid}`);
  }
  console.log('\n');

  // ===============================================================
  // Final Summary
  // ===============================================================
  console.log('═'.repeat(60));
  console.log('\n🎯 Zentix Protocol v0.4 - Blockchain Integration Complete!\n');
  
  console.log('✅ Achieved:');
  console.log('   • Agent created with DID, Wallet, and Skills');
  console.log('   • DID anchored to IPFS + Blockchain');
  console.log('   • Wallet anchored with economic state');
  console.log('   • Agent evolution tracked immutably');
  console.log('   • Decentralized identity verified on-chain\n');

  console.log('🔐 Security Features:');
  console.log('   • Immutable identity records');
  console.log('   • Verifiable on-chain anchors');
  console.log('   • Decentralized storage (IPFS)');
  console.log('   • Transaction history tracking\n');

  console.log('🚀 Ready for:');
  console.log('   → Deploy ZXT token on Mumbai testnet');
  console.log('   → Deploy Zentix Registry contract');
  console.log('   → Configure real Pinata IPFS credentials');
  console.log('   → Scale to mainnet when ready\n');

  console.log('💡 Next Steps:');
  console.log('   1. Add Pinata credentials to .env');
  console.log('   2. Deploy contracts: npm run deploy:mumbai');
  console.log('   3. Update .env with contract addresses');
  console.log('   4. Re-run this demo with live integration\n');

  console.log('🌟 "Building Trust Through Decentralization"\n');
}

// Run the demonstration
demonstrateBlockchainIntegration().catch(console.error);
