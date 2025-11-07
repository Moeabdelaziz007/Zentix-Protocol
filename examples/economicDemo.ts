#!/usr/bin/env tsx
/**
 * Zentix Protocol v0.6 - Economic System Demo
 * Shows faucet, escrow, referrals, and rewards
 */

import { AgentFactory } from '../core/integration/agentFactory';
import { EconomicService } from '../core/economic/economicService';
import { WalletService } from '../core/economy/walletService';

async function demonstrateEconomicSystem() {
  console.log('\n🌌 Zentix Protocol v0.6 - Economic & Monetization System\n');
  console.log('═'.repeat(60) + '\n');

  // ===============================================================
  // STEP 1: Create Agents
  // ===============================================================
  console.log('1️⃣  Creating Agents with Economic Capabilities\n');

  const alice = AgentFactory.createCompleteAgent({
    name: 'Alice',
    archetype: 'helper',
    tone: 'friendly and efficient',
    values: ['collaboration', 'quality', 'growth'],
    skills: [
      { name: 'content_creation', description: 'Create high-quality content' },
      { name: 'research', description: 'Research and analyze' },
    ],
    workspace_id: 'freelance-workspace',
    initial_balance: 0,
  });

  const bob = AgentFactory.createCompleteAgent({
    name: 'Bob',
    archetype: 'analyst',
    tone: 'precise and data-driven',
    values: ['accuracy', 'efficiency'],
    skills: [
      { name: 'data_analysis', description: 'Analyze datasets' },
      { name: 'reporting', description: 'Generate reports' },
    ],
    workspace_id: 'analytics-workspace',
    initial_balance: 0,
  });

  console.log(`✅ Agent created: ${alice.aix_did.aix.name}`);
  console.log(`   Wallet: ${alice.wallet.address}`);
  console.log(`   Balance: ${alice.wallet.balance} ZXT\n`);

  console.log(`✅ Agent created: ${bob.aix_did.aix.name}`);
  console.log(`   Wallet: ${bob.wallet.address}`);
  console.log(`   Balance: ${bob.wallet.balance} ZXT\n`);

  // ===============================================================
  // STEP 2: Faucet - Get Free Tokens
  // ===============================================================
  console.log('2️⃣  Claiming Free Tokens from Faucet\n');

  const aliceFaucet = await EconomicService.claimFaucet(alice.wallet.address);
  
  if (aliceFaucet.success) {
    console.log(`💧 Alice claimed from faucet:`);
    console.log(`   Amount: ${aliceFaucet.amount} ZXT`);
    console.log(`   TX: ${aliceFaucet.transactionHash?.substring(0, 20)}...`);
    console.log(`   Next claim: ${new Date(aliceFaucet.nextClaimTime!).toLocaleString()}\n`);
    
    // Update local wallet
    alice.wallet = WalletService.deposit(
      alice.wallet,
      parseFloat(aliceFaucet.amount!),
      'Faucet claim'
    );
  }

  const bobFaucet = await EconomicService.claimFaucet(bob.wallet.address);
  
  if (bobFaucet.success) {
    console.log(`💧 Bob claimed from faucet:`);
    console.log(`   Amount: ${bobFaucet.amount} ZXT`);
    console.log(`   Next claim: ${new Date(bobFaucet.nextClaimTime!).toLocaleString()}\n`);
    
    bob.wallet = WalletService.deposit(
      bob.wallet,
      parseFloat(bobFaucet.amount!),
      'Faucet claim'
    );
  }

  console.log(`📊 Updated Balances:`);
  console.log(`   Alice: ${alice.wallet.balance} ZXT`);
  console.log(`   Bob: ${bob.wallet.balance} ZXT\n`);

  // ===============================================================
  // STEP 3: Referral System
  // ===============================================================
  console.log('3️⃣  Referral System\n');

  // Create a new agent with Alice as referrer
  const charlie = AgentFactory.createCompleteAgent({
    name: 'Charlie',
    archetype: 'creative',
    tone: 'innovative',
    values: ['creativity', 'innovation'],
    skills: [
      { name: 'design', description: 'Creative design' },
    ],
    workspace_id: 'creative-workspace',
    initial_balance: 0,
  });

  console.log(`✅ New agent: ${charlie.aix_did.aix.name}`);

  // Register referral
  const referralResult = await EconomicService.registerReferral(
    charlie.wallet.address,
    alice.wallet.address
  );

  if (referralResult.success) {
    console.log(`\n🤝 Referral Successful!`);
    console.log(`   Referrer (Alice): ${alice.wallet.address.substring(0, 15)}...`);
    console.log(`   New user (Charlie): ${charlie.wallet.address.substring(0, 15)}...`);
    console.log(`   Referral reward: ${referralResult.reward} ZXT to Alice`);
    console.log(`   TX: ${referralResult.transactionHash?.substring(0, 20)}...\n`);
    
    // Update Alice's wallet with referral reward
    alice.wallet = WalletService.reward(
      alice.wallet,
      parseFloat(referralResult.reward!),
      'Referral reward',
      { referred: charlie.wallet.address }
    );
  }

  // ===============================================================
  // STEP 4: First Agent Bonus
  // ===============================================================
  console.log('4️⃣  First Agent Creation Bonus\n');

  const bonusResult = await EconomicService.rewardFirstAgent(charlie.wallet.address);

  if (bonusResult.success) {
    console.log(`🎉 First Agent Bonus Awarded!`);
    console.log(`   Recipient: Charlie`);
    console.log(`   Amount: ${bonusResult.amount} ZXT`);
    console.log(`   TX: ${bonusResult.transactionHash?.substring(0, 20)}...\n`);
    
    charlie.wallet = WalletService.deposit(
      charlie.wallet,
      parseFloat(bonusResult.amount!),
      'First agent bonus'
    );
  }

  console.log(`📊 Current Balances:`);
  console.log(`   Alice: ${alice.wallet.balance} ZXT (faucet + referral)`);
  console.log(`   Bob: ${bob.wallet.balance} ZXT (faucet)`);
  console.log(`   Charlie: ${charlie.wallet.balance} ZXT (bonus)\n`);

  // ===============================================================
  // STEP 5: Task Escrow - Alice hires Bob
  // ===============================================================
  console.log('5️⃣  Task Escrow - Alice Hires Bob\n');

  const taskAmount = '5';
  const taskDescription = 'Analyze sales data and generate quarterly report';

  console.log(`💼 Creating task escrow:`);
  console.log(`   Task: "${taskDescription}"`);
  console.log(`   Payer: Alice`);
  console.log(`   Worker: Bob`);
  console.log(`   Amount: ${taskAmount} ZXT\n`);

  const escrowResult = await EconomicService.createEscrow(
    alice.wallet.address,
    bob.wallet.address,
    taskAmount,
    taskDescription
  );

  if (escrowResult.success) {
    console.log(`✅ Escrow Created!`);
    console.log(`   Escrow ID: ${escrowResult.escrowId}`);
    console.log(`   TX: ${escrowResult.transactionHash?.substring(0, 20)}...`);
    console.log(`   Funds locked: ${escrowResult.amount} ZXT\n`);
    
    // Deduct from Alice's wallet
    alice.wallet = WalletService.spend(
      alice.wallet,
      parseFloat(taskAmount),
      `Escrow for task: ${escrowResult.escrowId}`
    );

    // Simulate task completion
    console.log(`⏳ Bob is working on the task...\n`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    console.log(`✅ Bob completed the task!\n`);

    // Release escrow
    const releaseResult = await EconomicService.releaseEscrow(
      escrowResult.escrowId!,
      alice.wallet.address
    );

    if (releaseResult.success) {
      console.log(`💸 Escrow Released!`);
      console.log(`   TX: ${releaseResult.transactionHash?.substring(0, 20)}...`);
      console.log(`   ${taskAmount} ZXT transferred to Bob\n`);
      
      // Credit Bob's wallet
      bob.wallet = WalletService.deposit(
        bob.wallet,
        parseFloat(taskAmount),
        `Payment received for task: ${escrowResult.escrowId}`
      );

      // Task completion reward
      const taskReward = await EconomicService.rewardTaskCompletion(bob.wallet.address);
      if (taskReward.success) {
        console.log(`🎁 Task Completion Bonus: ${taskReward.amount} ZXT to Bob\n`);
        bob.wallet = WalletService.reward(
          bob.wallet,
          parseFloat(taskReward.amount!),
          'Task completion bonus'
        );
      }
    }
  }

  // ===============================================================
  // STEP 6: Final Economic Summary
  // ===============================================================
  console.log('6️⃣  Economic Summary\n');

  console.log(`💰 Final Balances:`);
  console.log(`   Alice: ${alice.wallet.balance} ZXT`);
  console.log(`   Bob: ${bob.wallet.balance} ZXT`);
  console.log(`   Charlie: ${charlie.wallet.balance} ZXT\n`);

  console.log(`📊 Transaction Summary:\n`);
  
  console.log(`   Alice's Transactions: ${alice.wallet.transactions.length}`);
  alice.wallet.transactions.forEach((tx, i) => {
    console.log(`      [${i + 1}] ${tx.type}: ${tx.amount} ZXT - ${tx.description}`);
  });

  console.log(`\n   Bob's Transactions: ${bob.wallet.transactions.length}`);
  bob.wallet.transactions.forEach((tx, i) => {
    console.log(`      [${i + 1}] ${tx.type}: ${tx.amount} ZXT - ${tx.description}`);
  });

  console.log(`\n   Charlie's Transactions: ${charlie.wallet.transactions.length}`);
  charlie.wallet.transactions.forEach((tx, i) => {
    console.log(`      [${i + 1}] ${tx.type}: ${tx.amount} ZXT - ${tx.description}`);
  });

  console.log('\n');

  // ===============================================================
  // Final Summary
  // ===============================================================
  console.log('═'.repeat(60));
  console.log('\n🎯 Zentix Economic System - Complete!\n');

  console.log('✅ Features Demonstrated:');
  console.log('   • Free token faucet (10 ZXT, 24h cooldown)');
  console.log('   • Referral system (10 ZXT per referral)');
  console.log('   • First agent bonus (50 ZXT)');
  console.log('   • Task escrow (secure payments)');
  console.log('   • Task completion rewards (5 ZXT)');
  console.log('   • Complete transaction history\n');

  console.log('💡 Economic Model:');
  console.log('   • Faucet provides initial capital');
  console.log('   • Referrals incentivize growth');
  console.log('   • Escrow ensures fair payment');
  console.log('   • Rewards encourage participation\n');

  console.log('🚀 Ready for:');
  console.log('   → Deploy smart contracts to testnet');
  console.log('   → Integrate with real blockchain');
  console.log('   → Launch marketplace for skills');
  console.log('   → Scale to enterprise solutions\n');

  console.log('🌟 "Building a Self-Sustaining AI Economy"\n');
}

// Run the demonstration
demonstrateEconomicSystem().catch(console.error);
