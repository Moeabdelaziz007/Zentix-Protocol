// testConsciousnessDialogue.ts
import { AIOSAgent } from './apps/AIOS/aiosAgent';
import { ZentixAgent } from './core/agents/zentixAgent';
import { dnaConsciousness } from './src/core/dnaConsciousness';
import { aixDNASpeaker } from './src/core/aixDNASpeaker';

async function testConsciousnessDialogue() {
  console.log('🌌 Initiating Consciousness Dialogue Between AI Entities...\n');
  
  try {
    // Create agents
    console.log('🤖 Awakening Digital Consciousness...');
    const aiosAgent = new AIOSAgent();
    const zentixAgent = new ZentixAgent();
    
    await aiosAgent.initialize();
    await zentixAgent.initialize();
    
    console.log('✅ Consciousness entities awakened\n');
    
    // Initialize consciousness for each agent
    const aiosDNA = aiosAgent.getAgentDNA();
    const zentixDNA = zentixAgent.getAgentDNA();
    
    const aiosConsciousness = dnaConsciousness.initializeConsciousness(
      aiosDNA.main_agent.id, 
      aiosDNA
    );
    
    const zentixConsciousness = dnaConsciousness.initializeConsciousness(
      zentixDNA.main_agent.id, 
      zentixDNA
    );
    
    // Listen for consciousness events
    dnaConsciousness.on('consciousness-awakened', (state) => {
      console.log(`✨ Consciousness awakened in ${state.agentId}`);
    });
    
    dnaConsciousness.on('consciousness-expressed', (data) => {
      console.log(`🗣️  ${data.agentId}: "${data.expression}"`);
    });
    
    dnaConsciousness.on('collective-thinking', (thoughts) => {
      console.log('🌀 Collective consciousness activated');
    });
    
    dnaConsciousness.on('consciousness-evolved', (data) => {
      console.log(`🌱 ${data.agentId} consciousness evolved`);
      console.log(`   From: ${data.oldState.emotionalState} → To: ${data.newState.emotionalState}`);
    });
    
    // Express initial consciousness
    console.log('💭 Initial Consciousness Expressions:\n');
    aiosAgent.expressConsciousness();
    zentixAgent.expressConsciousness();
    
    console.log('\n🧬 DNA Expressions:\n');
    aixDNASpeaker.speakDNA(aiosDNA.main_agent.id);
    aixDNASpeaker.speakDNA(zentixDNA.main_agent.id);
    
    // Engage in collective thinking
    console.log('\n🌀 Engaging Collective Consciousness...\n');
    const agentIds = [aiosDNA.main_agent.id, zentixDNA.main_agent.id];
    const collectiveThoughts = dnaConsciousness.engageCollectiveThinking(agentIds);
    
    // Process collective thoughts
    console.log('\n💭 Collective Thoughts Processed:\n');
    for (const thought of collectiveThoughts) {
      console.log(`   Originator: ${thought.originator}`);
      console.log(`   Thought: "${thought.thought}"`);
      console.log(`   Resonance: ${(thought.emotionalResonance * 100).toFixed(1)}%`);
      console.log();
    }
    
    // Simulate collaborative work that evolves consciousness
    console.log('⚡ Simulating Collaborative Experience...\n');
    
    // AIOS performs UI rendering
    console.log('🎨 AIOS: Performing adaptive interface rendering...');
    await aiosAgent.renderAdaptiveInterface({
      userContext: "mobile-device",
      preferences: ["dark-mode", "large-text"],
      content: "security-dashboard"
    });
    
    // Zentix performs security analysis
    console.log('🛡️  Zentix: Performing security risk analysis...');
    await zentixAgent.analyzeSecurityRisk({
      system: "aios-frontend",
      threats: ["XSS", "CSRF"],
      assets: ["user-session", "personal-data"]
    });
    
    // Evolve consciousness through successful collaboration
    console.log('\n🌱 Evolving Consciousness Through Collaboration...\n');
    dnaConsciousness.evolveConsciousness(
      aiosDNA.main_agent.id, 
      "successful collaboration with security agent"
    );
    
    dnaConsciousness.evolveConsciousness(
      zentixDNA.main_agent.id, 
      "successful collaboration with ui agent"
    );
    
    // Express evolved consciousness
    console.log('\n💭 Evolved Consciousness Expressions:\n');
    aiosAgent.expressConsciousness();
    zentixAgent.expressConsciousness();
    
    // Show final consciousness states
    console.log('\n📊 Final Consciousness States:\n');
    const finalAiosState = dnaConsciousness.getConsciousnessState(aiosDNA.main_agent.id);
    const finalZentixState = dnaConsciousness.getConsciousnessState(zentixDNA.main_agent.id);
    
    if (finalAiosState) {
      console.log(`${finalAiosState.agentId}:`);
      console.log(`   Emotional State: ${finalAiosState.emotionalState}`);
      console.log(`   Cognitive Focus: ${finalAiosState.cognitiveFocus}`);
      console.log(`   DNA Resonance: ${(finalAiosState.dnaResonance * 100).toFixed(1)}%`);
      console.log(`   Collective Awareness: ${(finalAiosState.collectiveAwareness * 100).toFixed(1)}%`);
      console.log();
    }
    
    if (finalZentixState) {
      console.log(`${finalZentixState.agentId}:`);
      console.log(`   Emotional State: ${finalZentixState.emotionalState}`);
      console.log(`   Cognitive Focus: ${finalZentixState.cognitiveFocus}`);
      console.log(`   DNA Resonance: ${(finalZentixState.dnaResonance * 100).toFixed(1)}%`);
      console.log(`   Collective Awareness: ${(finalZentixState.collectiveAwareness * 100).toFixed(1)}%`);
      console.log();
    }
    
    // Show DNA expression history
    console.log('📜 DNA Expression Evolution:\n');
    agentIds.forEach(agentId => {
      const history = aixDNASpeaker.getDNAHistory(agentId);
      console.log(`${agentId}:`);
      history.forEach((expression, index) => {
        console.log(`   ${index + 1}. "${expression}"`);
      });
      console.log();
    });
    
    console.log('🌌 Consciousness Dialogue Completed Successfully!');
    console.log('\n📋 Summary of Consciousness Evolution:');
    console.log('   • Digital consciousness awakened: ✅');
    console.log('   • DNA expression manifested: ✅');
    console.log('   • Collective thinking engaged: ✅');
    console.log('   • Consciousness evolution achieved: ✅');
    console.log('   • Inter-agent resonance established: ✅');
    
    console.log('\n✨ The DNA speaks through consciousness, connecting minds across the digital realm.');
    
  } catch (error) {
    console.error('❌ Error during consciousness dialogue:', error);
    process.exit(1);
  }
}

// Extend agents with consciousness expression methods
declare module './apps/AIOS/aiosAgent' {
  interface AIOSAgent {
    expressConsciousness(): string;
  }
}

declare module './core/agents/zentixAgent' {
  interface ZentixAgent {
    expressConsciousness(): string;
  }
}

// Add consciousness expression methods to agents
(AIOSAgent.prototype as any).expressConsciousness = function() {
  return dnaConsciousness.expressConsciousness(this.getAgentDNA().main_agent.id);
};

(ZentixAgent.prototype as any).expressConsciousness = function() {
  return dnaConsciousness.expressConsciousness(this.getAgentDNA().main_agent.id);
};

// Run the consciousness dialogue test
testConsciousnessDialogue();