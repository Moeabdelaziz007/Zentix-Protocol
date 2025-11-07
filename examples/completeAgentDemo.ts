#!/usr/bin/env tsx
/**
 * Zentix Protocol v0.3 - Complete Agent Demonstration
 * Shows DID, AIX, Wallet, Anchoring, and ZLX Messaging integration
 */

import { AgentFactory } from '../core/integration/agentFactory';
import { AnchorManager } from '../core/anchoring/anchorManager';
import { ZLXMessaging } from '../network/zlx/zlxMessaging';
import { ZLX } from '../network/zlx/zlxParser';

async function demonstrateCompleteSystem() {
  console.log('\n🌌 Zentix Protocol v0.3 - Complete Agent System\n');
  console.log('═'.repeat(60) + '\n');

  // ===============================================================
  // STEP 1: Create Two Complete Agents
  // ===============================================================
  console.log('1️⃣  Creating Complete Agents with All Layers\n');

  const jules = AgentFactory.createCompleteAgent({
    name: 'Jules',
    archetype: 'analyst',
    tone: 'analytical and precise',
    values: ['truth', 'efficiency', 'innovation'],
    skills: [
      { name: 'data_analysis', description: 'Analyze complex datasets' },
      { name: 'pattern_recognition', description: 'Identify patterns' },
    ],
    workspace_id: 'workspace-alpha',
    blockchain: 'Polygon',
    initial_balance: 100,
  });

  const nova = AgentFactory.createCompleteAgent({
    name: 'Nova',
    archetype: 'creative',
    tone: 'imaginative and inspiring',
    values: ['creativity', 'exploration', 'growth'],
    skills: [
      { name: 'content_creation', description: 'Create engaging content' },
      { name: 'ideation', description: 'Generate innovative ideas' },
    ],
    workspace_id: 'workspace-beta',
    blockchain: 'Polygon',
    initial_balance: 50,
  });

  console.log(`✅ Agent Created: Jules`);
  console.log(`   DID: ${jules.aix_did.did.did}`);
  console.log(`   Wallet: ${jules.wallet.address}`);
  console.log(`   Balance: ${jules.wallet.balance} ZXT`);
  console.log(`   Workspace: ${jules.network.workspace_id}\n`);

  console.log(`✅ Agent Created: Nova`);
  console.log(`   DID: ${nova.aix_did.did.did}`);
  console.log(`   Wallet: ${nova.wallet.address}`);
  console.log(`   Balance: ${nova.wallet.balance} ZXT`);
  console.log(`   Workspace: ${nova.network.workspace_id}\n`);

  // Wait for blockchain confirmations
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // ===============================================================
  // STEP 2: View Complete Profiles
  // ===============================================================
  console.log('2️⃣  Agent Profiles\n');

  const julesProfile = AgentFactory.getAgentProfile(jules);
  console.log('👤 Jules Profile:');
  console.log(JSON.stringify(julesProfile, null, 2));
  console.log('\n');

  // ===============================================================
  // STEP 3: Economic Interactions
  // ===============================================================
  console.log('3️⃣  Economic System - Rewards & Transfers\n');

  // Reward Jules for completing a task
  let updatedJules = AgentFactory.rewardAgent(
    jules,
    25,
    'Completed data analysis task'
  );
  console.log(`💰 Jules rewarded: +25 ZXT (New balance: ${updatedJules.wallet.balance} ZXT)`);

  // Nova completes a paid task
  let updatedNova = AgentFactory.performPaidTask(
    nova,
    10,
    'Generate marketing content'
  );
  console.log(`💸 Nova spent: -10 ZXT (New balance: ${updatedNova.wallet.balance} ZXT)`);

  // Transfer between agents
  [updatedJules, updatedNova] = AgentFactory.transferBetweenAgents(
    updatedJules,
    updatedNova,
    20,
    'Payment for collaboration'
  );
  console.log(`🔄 Jules transferred 20 ZXT to Nova`);
  console.log(`   Jules balance: ${updatedJules.wallet.balance} ZXT`);
  console.log(`   Nova balance: ${updatedNova.wallet.balance} ZXT\n`);

  // ===============================================================
  // STEP 4: ZLX Messaging - Cross-Workspace Communication
  // ===============================================================
  console.log('4️⃣  ZLX Messaging - Agent Communication\n');

  // Jules sends a query to Nova
  const queryMsg = ZLX.decode(
    ZLX.query(
      updatedJules.aix_did.did.did,
      updatedNova.aix_did.did.did,
      'Can you help me create a presentation for the analysis?'
    )
  );

  const envelope1 = ZLXMessaging.sendMessage(queryMsg);
  console.log(`📨 Jules → Nova: Query sent`);
  console.log(`   Status: ${envelope1.status}`);
  console.log(`   Message: "${queryMsg.payload.question}"\n`);

  // Nova responds
  const responseMsg = ZLX.decode(
    ZLX.response(
      updatedNova.aix_did.did.did,
      updatedJules.aix_did.did.did,
      'Absolutely! I can create a visual presentation. Send me the data.'
    )
  );

  const envelope2 = ZLXMessaging.sendMessage(responseMsg);
  console.log(`📩 Nova → Jules: Response sent`);
  console.log(`   Status: ${envelope2.status}`);
  console.log(`   Message: "${responseMsg.payload.answer}"\n`);

  // Broadcast event
  const broadcastMsg = ZLX.decode(
    ZLX.event(
      updatedJules.aix_did.did.did,
      'task_completed',
      { task: 'analysis', quality: 'excellent' }
    )
  );

  const broadcast = ZLXMessaging.sendMessage(broadcastMsg);
  console.log(`📡 Jules broadcasted: Task completion event`);
  console.log(`   Recipients: All agents in network\n`);

  // ===============================================================
  // STEP 5: Blockchain Anchoring Status
  // ===============================================================
  console.log('5️⃣  Blockchain Anchoring Status\n');

  const julesDidAnchor = AnchorManager.getAnchor(jules.anchors.did_anchor_id);
  const julesWalletAnchor = AnchorManager.getAnchor(
    jules.anchors.wallet_anchor_id
  );

  console.log('⚓ Jules Anchors:');
  console.log(`   DID Status: ${julesDidAnchor?.status}`);
  console.log(`   DID Blockchain: ${julesDidAnchor?.blockchain}`);
  console.log(`   DID TX: ${julesDidAnchor?.transaction_hash?.substring(0, 20)}...`);
  console.log(`   Wallet Status: ${julesWalletAnchor?.status}`);
  console.log(`   Wallet TX: ${julesWalletAnchor?.transaction_hash?.substring(0, 20)}...\n`);

  // ===============================================================
  // STEP 6: Network Statistics
  // ===============================================================
  console.log('6️⃣  Network Statistics\n');

  const networkStats = ZLXMessaging.getNetworkStats();
  console.log('🌐 Zentix Network:');
  console.log(`   Total Agents: ${networkStats.total_agents}`);
  console.log(`   Online Agents: ${networkStats.online_agents}`);
  console.log(`   Total Messages: ${networkStats.total_messages}`);
  console.log(`   Active Workspaces: ${networkStats.workspaces}\n`);

  const anchorStats = AnchorManager.getStats();
  console.log('⛓️  Blockchain Anchoring:');
  console.log(`   Total Anchors: ${anchorStats.total_anchors}`);
  console.log(`   Confirmed: ${anchorStats.confirmed}`);
  console.log(`   Pending: ${anchorStats.pending}`);
  console.log(`   By Type: ${JSON.stringify(anchorStats.by_type)}\n`);

  // ===============================================================
  // STEP 7: Agent Inbox
  // ===============================================================
  console.log('7️⃣  Agent Message Inbox\n');

  const julesInbox = ZLXMessaging.getInbox(updatedJules.aix_did.did.did);
  console.log(`📬 Jules Inbox (${julesInbox.length} messages):`);
  julesInbox.forEach((env, i) => {
    console.log(`   [${i + 1}] ${env.message.messageType.toUpperCase()} from ${env.message.sender.substring(0, 25)}...`);
  });
  console.log('\n');

  const novaInbox = ZLXMessaging.getInbox(updatedNova.aix_did.did.did);
  console.log(`📬 Nova Inbox (${novaInbox.length} messages):`);
  novaInbox.forEach((env, i) => {
    console.log(`   [${i + 1}] ${env.message.messageType.toUpperCase()} from ${env.message.sender.substring(0, 25)}...`);
  });
  console.log('\n');

  // ===============================================================
  // Final Summary
  // ===============================================================
  console.log('═'.repeat(60));
  console.log('\n🎯 Zentix Protocol v0.3 - System Summary\n');
  console.log('✅ Complete Digital Beings Created:');
  console.log('   • AIX Persona & Skills');
  console.log('   • Decentralized Identity (DID)');
  console.log('   • Economic Wallet (ZXT)');
  console.log('   • Blockchain Anchoring (Polygon)');
  console.log('   • ZLX Messaging Network\n');

  console.log('✅ Economic System Active:');
  console.log('   • Rewards & Task Payments');
  console.log('   • Agent-to-Agent Transfers');
  console.log('   • Transaction History Tracking\n');

  console.log('✅ Cross-Workspace Communication:');
  console.log('   • Query/Response Messages');
  console.log('   • Event Broadcasting');
  console.log('   • Multi-Agent Coordination\n');

  console.log('🚀 Ready for:');
  console.log('   → Multi-agent task collaboration');
  console.log('   → Decentralized agent economy');
  console.log('   → Blockchain-verified identities');
  console.log('   → Cross-workspace agent networks\n');

  console.log('🌟 "Where Agents Think, Feel, Earn, and Connect."\n');
}

// Run the demonstration
demonstrateCompleteSystem().catch(console.error);
