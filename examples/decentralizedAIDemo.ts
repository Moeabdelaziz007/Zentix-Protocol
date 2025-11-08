#!/usr/bin/env tsx
/**
 * Decentralized AI & Dynamic NFT Demo
 * Demonstrates the Hive Mind Protocol and Living Assets
 * 
 * @version 1.0.0
 */

import { DecentralizedMoE } from '../core/ai/decentralizedMoE';
import { DynamicNFTSystem } from '../core/nft/dynamicNFT';

async function demonstrateDecentralizedAI() {
  console.log('\n🌌 Zentix Protocol - Decentralized AI & Living Assets\n');
  console.log('═'.repeat(70) + '\n');

  // ===============================================================
  // PART 1: Decentralized Mixture-of-Experts (DMoE)
  // ===============================================================
  console.log('🧠 PART 1: Decentralized Mixture-of-Experts Protocol\n');

  // View available expert models
  const experts = DecentralizedMoE.getActiveExperts();
  console.log(`📋 Available Expert Models: ${experts.length}\n`);

  experts.forEach((expert, i) => {
    console.log(`   ${i + 1}. ${expert.name} (${expert.specialty})`);
    console.log(`      Capabilities: ${expert.capabilities.join(', ')}`);
    console.log(`      Success Rate: ${expert.performance.successRate}%`);
    console.log(`      Cost: ${expert.pricing.costPerCall} ${expert.pricing.currency}`);
    console.log(`      Provider: ${expert.providerAddress.substring(0, 15)}...`);
    console.log(`      Total Calls: ${expert.performance.totalCalls}\n`);
  });

  console.log('─'.repeat(70) + '\n');

  // ===============================================================
  // PART 2: Complex Query Execution
  // ===============================================================
  console.log('⚙️  PART 2: Complex Multi-Expert Query\n');

  const complexQuery = {
    id: `query_${Date.now()}`,
    query: 'Write a poem about the Krebs cycle in Python code',
    requiredCapabilities: ['poetry', 'python', 'biology'],
    maxCost: 5.0,
  };

  console.log(`📝 Query: "${complexQuery.query}"\n`);

  const result = await DecentralizedMoE.executeQuery(complexQuery);

  if (result.success) {
    console.log(`✅ Query Executed Successfully!\n`);
    console.log(`📊 Execution Details:`);
    console.log(`   Experts Used: ${result.expertsUsed.length}`);
    console.log(`   Total Cost: ${result.totalCost} ZXT`);
    console.log(`   Execution Time: ${result.executionTime}ms`);
    console.log(`   ZK Proof: ${result.proofHash}\n`);

    console.log(`🎯 Experts Selected:`);
    result.expertsUsed.forEach((selection, i) => {
      const expert = DecentralizedMoE.getExpert(selection.expertId)!;
      console.log(`   ${i + 1}. ${expert.name}`);
      console.log(`      Confidence: ${(selection.confidence * 100).toFixed(1)}%`);
      console.log(`      Cost: ${selection.estimatedCost} ZXT`);
      console.log(`      Reasoning: ${selection.reasoning}\n`);
    });

    console.log(`📄 Combined Response:\n`);
    console.log(result.response);
    console.log();
  }

  console.log('─'.repeat(70) + '\n');

  // ===============================================================
  // PART 3: Model Governance - Submit Proposal
  // ===============================================================
  console.log('🗳️  PART 3: Decentralized Governance\n');

  const newModelProposal = await DecentralizedMoE.submitModelProposal(
    '0xNewProvider...',
    {
      name: 'RustExpert',
      specialty: 'Rust Programming',
      description: 'Expert in Rust systems programming and memory safety',
      providerAddress: '0xNewProvider...',
      modelHash: 'Qm...RustModel',
      pricing: {
        costPerCall: 0.6,
        currency: 'ZXT',
      },
      capabilities: ['rust', 'systems_programming', 'memory_safety', 'performance'],
      version: '1.0.0',
    }
  );

  console.log(`📝 New Model Proposal Submitted:`);
  console.log(`   Proposal ID: ${newModelProposal.id}`);
  console.log(`   Model: ${newModelProposal.model.name}`);
  console.log(`   Voting Ends: ${new Date(newModelProposal.votingEndsAt).toLocaleDateString()}\n`);

  // Simulate voting
  console.log(`🗳️  Simulating Community Votes...\n`);
  for (let i = 0; i < 12; i++) {
    const support = Math.random() > 0.2; // 80% approval
    DecentralizedMoE.voteOnProposal(newModelProposal.id, `voter_${i}`, support);
  }

  console.log();

  // Check if approved
  const updatedExperts = DecentralizedMoE.getActiveExperts();
  if (updatedExperts.length > experts.length) {
    console.log(`✅ Proposal Approved! New expert added to network.\n`);
  }

  console.log('─'.repeat(70) + '\n');

  // ===============================================================
  // PART 4: Network Statistics
  // ===============================================================
  console.log('📊 PART 4: Network Statistics\n');

  const stats = DecentralizedMoE.getNetworkStats();

  console.log(`🌐 DMoE Network Overview:`);
  console.log(`   Total Experts: ${stats.totalExperts}`);
  console.log(`   Total Queries: ${stats.totalQueries}`);
  console.log(`   Tokens Distributed: ${stats.totalTokensDistributed.toFixed(2)} ZXT`);
  console.log(`   Average Query Cost: ${stats.averageQueryCost.toFixed(2)} ZXT\n`);

  console.log(`🏆 Top Performing Experts:`);
  stats.topExperts.forEach((expert, i) => {
    console.log(`   ${i + 1}. ${expert.name}`);
    console.log(`      Calls: ${expert.performance.totalCalls}`);
    console.log(`      Success Rate: ${expert.performance.successRate}%`);
    console.log(`      Rating: ${expert.performance.userRatings}/5.0\n`);
  });

  console.log('═'.repeat(70) + '\n');

  // ===============================================================
  // PART 5: Dynamic NFT System - Living Assets
  // ===============================================================
  console.log('🎨 PART 5: Dynamic NFT System - Living Assets\n');

  // Mint NFTs from different factions
  const nft1 = DynamicNFTSystem.mintNFT('0xAlice...', 'Solaris', 'Sun');
  const nft2 = DynamicNFTSystem.mintNFT('0xBob...', 'Lunara', 'Sun');
  const nft3 = DynamicNFTSystem.mintNFT('0xCarol...', 'Stellaris', 'Star');
  const nft4 = DynamicNFTSystem.mintNFT('0xDave...', 'Terra', 'Earth');

  console.log();
  console.log('─'.repeat(70) + '\n');

  // ===============================================================
  // PART 6: Cooperation Mechanics
  // ===============================================================
  console.log('🤝 PART 6: Cooperation Between NFTs\n');

  const cooperation = await DynamicNFTSystem.executeCooperation({
    nft1: nft1.tokenId,
    nft2: nft2.tokenId,
    action: 'liquidity_provision',
    protocol: 'Velodrome',
    reward: 10,
  });

  if (cooperation.success) {
    console.log(`\n📈 Updated Stats:`);
    const updated1 = DynamicNFTSystem.getNFT(nft1.tokenId)!;
    const updated2 = DynamicNFTSystem.getNFT(nft2.tokenId)!;
    console.log(`   ${updated1.name}: ${updated1.attributes.resources} resources`);
    console.log(`   ${updated2.name}: ${updated2.attributes.resources} resources\n`);
  }

  console.log('─'.repeat(70) + '\n');

  // ===============================================================
  // PART 7: Weekly Competition
  // ===============================================================
  console.log('🏆 PART 7: Weekly Competition\n');

  const competition = DynamicNFTSystem.startWeeklyCompetition('Rare Energy Boost', 50);

  console.log();

  // Place bids
  console.log(`💰 NFTs Placing Bids...\n`);
  DynamicNFTSystem.placeBid(nft1.tokenId, 30);
  DynamicNFTSystem.placeBid(nft2.tokenId, 45);
  DynamicNFTSystem.placeBid(nft3.tokenId, 25);
  DynamicNFTSystem.placeBid(nft4.tokenId, 40);

  console.log();

  // End competition
  const competitionResult = DynamicNFTSystem.endWeeklyCompetition();

  if (competitionResult.winner) {
    console.log(`\n🎉 Winner Attributes:`);
    console.log(`   Energy: ${competitionResult.winner.attributes.energy}`);
    console.log(`   Resources: ${competitionResult.winner.attributes.resources}`);
    console.log(`   Special Attributes:`, 
      Array.from(competitionResult.winner.attributes.specialAttributes.entries()));
    console.log();
  }

  console.log('─'.repeat(70) + '\n');

  // ===============================================================
  // PART 8: Time-Based Energy Updates
  // ===============================================================
  console.log('☀️ PART 8: Oracle-Triggered Energy Updates\n');

  DynamicNFTSystem.updateEnergyByTimeOfDay('UTC');

  console.log();
  console.log('─'.repeat(70) + '\n');

  // ===============================================================
  // PART 9: Leaderboard
  // ===============================================================
  console.log('🏅 PART 9: NFT Leaderboard\n');

  const leaderboard = DynamicNFTSystem.getLeaderboard(5);

  console.log(`📊 Top NFTs by Resources:\n`);
  leaderboard.forEach((nft, i) => {
    console.log(`   ${i + 1}. ${nft.name} (${nft.attributes.allegiance} faction)`);
    console.log(`      Resources: ${nft.attributes.resources}`);
    console.log(`      Energy: ${nft.attributes.energy}`);
    console.log(`      Level: ${nft.attributes.level}`);
    console.log(`      Owner: ${nft.owner.substring(0, 12)}...\n`);
  });

  // ===============================================================
  // FINAL SUMMARY
  // ===============================================================
  console.log('═'.repeat(70));
  console.log('\n🎯 Decentralized AI & Living Assets Demo - Complete!\n');

  console.log('✅ Decentralized Mixture-of-Experts:');
  console.log('   🧠 Permissionless AI model contributions');
  console.log('   💰 Token incentives for model providers');
  console.log('   🔐 Verifiable computation with ZK proofs');
  console.log('   🗳️  Community governance for new models');
  console.log('   ⚡ Dynamic expert selection and routing\n');

  console.log('✅ Dynamic NFT System:');
  console.log('   🎨 Living assets that evolve over time');
  console.log('   🤝 Cooperation mechanics with rewards');
  console.log('   ⚔️  Competition through bidding wars');
  console.log('   ☀️ External oracle triggers (time-based)');
  console.log('   🖼️  On-chain SVG generation');
  console.log('   📊 Emergent social structures\n');

  console.log('💡 Innovation Highlights:');
  console.log('   • Censorship-resistant AI');
  console.log('   • Decentralized App Store for AI skills');
  console.log('   • NFTs with true digital physics');
  console.log('   • On-chain game theory experiments');
  console.log('   • Economic alignment for AI developers\n');

  console.log('🚀 Ready for:');
  console.log('   → Deploy DMoE smart contracts');
  console.log('   → Integrate real AI models (IPFS)');
  console.log('   → Launch Dynamic NFT collection');
  console.log('   → Enable cross-chain interactions\n');

  console.log('🌟 "Building the Future of Decentralized Intelligence"\n');
}

// Run the demonstration
demonstrateDecentralizedAI().catch(console.error);