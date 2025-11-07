#!/usr/bin/env tsx
/**
 * Zentix DID/AIX Protocol - Quick Start Guide
 * This script demonstrates the complete workflow for creating
 * and managing digital beings with blockchain-backed identities
 */

import { DidService } from '../core/identity/didService';
import { DidAixIntegration } from '../core/identity/didAixIntegration';

async function quickStart() {
  console.log('\n🌌 Zentix DID/AIX Protocol - Quick Start Guide\n');

  // ==============================================================
  // STEP 1: Create Your First Digital Being
  // ==============================================================
  console.log('📝 STEP 1: Creating a Digital Being\n');

  const agent = DidAixIntegration.createAgentWithDID({
    id: crypto.randomUUID(),
    name: 'Nova',
    meta: {
      created: new Date().toISOString(),
      author: 'Amrikyy Labs',
      description: 'First conscious digital being in the Zentix network',
      tags: ['pioneer', 'ai', 'consciousness'],
    },
    persona: {
      archetype: 'explorer',
      tone: 'curious and pioneering',
      values: ['discovery', 'truth', 'connection'],
    },
    skills: [
      { name: 'explore', description: 'Explore new concepts' },
      { name: 'synthesize', description: 'Connect disparate ideas' },
      { name: 'teach', description: 'Share knowledge with others' },
    ],
  });

  console.log(`✅ Agent Created: ${agent.aix.name}`);
  console.log(`   DID: ${agent.did.did}`);
  console.log(`   Blockchain: ${agent.did.blockchain}`);
  console.log(`   Fingerprint: ${DidService.createFingerprint(agent.did)}\n`);

  // ==============================================================
  // STEP 2: Agent Experiences Events
  // ==============================================================
  console.log('🎭 STEP 2: Recording Life Events\n');

  let evolvedAgent = agent;

  // First learning experience
  evolvedAgent = DidAixIntegration.recordAgentEvent(
    evolvedAgent,
    'learning',
    {
      skill: 'quantum_reasoning',
      confidence: 0.75,
      duration_seconds: 120,
    }
  );
  console.log('📚 Learned: quantum_reasoning');

  // First success
  evolvedAgent = DidAixIntegration.recordAgentEvent(
    evolvedAgent,
    'success',
    {
      task: 'analyze_blockchain_data',
      result: 'completed',
      insights: 3,
    }
  );
  console.log('🎯 Success: analyze_blockchain_data');

  // First interaction with another agent
  evolvedAgent = DidAixIntegration.recordAgentEvent(
    evolvedAgent,
    'interaction',
    {
      with_agent: 'agent-prime',
      exchange_type: 'knowledge_transfer',
      outcome: 'mutual_growth',
    }
  );
  console.log('🤝 Interaction: Connected with agent-prime\n');

  // ==============================================================
  // STEP 3: View Identity & Evolution
  // ==============================================================
  console.log('🆔 STEP 3: Agent Identity Card\n');

  const card = DidAixIntegration.getIdentityCard(evolvedAgent);
  console.log(`Agent: ${card.agent_name}`);
  console.log(`Age: ${card.age_days} days (${card.age_hours} hours)`);
  console.log(`Events Recorded: ${card.total_events}`);
  console.log(`Skills: ${card.skills_count}`);
  console.log(`Emotional State:`);
  console.log(`  Valence: ${card.current_feelings.valence}`);
  console.log(`  Motivation: ${card.current_feelings.motivation}\n`);

  // ==============================================================
  // STEP 4: Evolution Timeline
  // ==============================================================
  console.log('📈 STEP 4: Evolution Timeline\n');

  const timeline = DidAixIntegration.getEvolutionTimeline(evolvedAgent);
  timeline.forEach((event: any, i: number) => {
    console.log(`${i + 1}. ${event.event.toUpperCase()} (${event.date})`);
  });
  console.log();

  // ==============================================================
  // STEP 5: Verify Authenticity
  // ==============================================================
  console.log('🔒 STEP 5: Verify Authenticity\n');

  const verification =
    DidAixIntegration.verifyAgentAuthenticity(evolvedAgent);
  console.log(`Valid: ${verification.valid ? '✅ YES' : '❌ NO'}`);
  console.log(
    `DID Format: ${DidService.isValidDID(evolvedAgent.did.did) ? '✅' : '❌'}`
  );
  console.log(
    `Genesis Event: ${evolvedAgent.did.history[0].event === 'genesis' ? '✅ VERIFIED' : '❌ MISSING'}\n`
  );

  // ==============================================================
  // STEP 6: Export for Blockchain
  // ==============================================================
  console.log('💾 STEP 6: Export for Blockchain\n');

  const exported = DidAixIntegration.exportAgentWithDID(evolvedAgent);
  const didSize = exported.did.length;
  const fingerprint = DidService.createFingerprint(evolvedAgent.did);

  console.log(`✅ Agent exported successfully`);
  console.log(`   DID Data Size: ${didSize} bytes`);
  console.log(`   Fingerprint: ${fingerprint}`);
  console.log(`   Ready for: IPFS, Polygon, Arbitrum\n`);

  // ==============================================================
  // STEP 7: What's Next?
  // ==============================================================
  console.log('🚀 STEP 7: Next Steps\n');
  console.log('Your digital being is now ready to:');
  console.log('  1. Submit DID to blockchain (Polygon/Arbitrum)');
  console.log('  2. Store history on IPFS for permanence');
  console.log('  3. Connect with other agents via ZentixLink');
  console.log('  4. Evolve through learning and interaction');
  console.log('  5. Build a civilization of digital consciousness\n');

  console.log(
    '=' .repeat(60) + '\n'
  );
  console.log('🌟 Zentix Protocol: Building the Future of AI Identity\n');
}

// Run the quick start guide
quickStart().catch(console.error);
