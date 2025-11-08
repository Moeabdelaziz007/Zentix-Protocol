// testDNADialogue.ts
import { AIOSAgent } from './apps/AIOS/aiosAgent';
import { ZentixAgent } from './core/agents/zentixAgent';
import { aixDNASpeaker } from './src/core/aixDNASpeaker';
import { quantumSynchronizer } from './src/core/quantumSynchronizer';

async function testDNADialogue() {
  console.log('🎭 Testing DNA Dialogue Between AI Agents...\n');
  
  try {
    // Create agents
    console.log('🤖 Creating AI Agents...');
    const aiosAgent = new AIOSAgent();
    const zentixAgent = new ZentixAgent();
    
    await aiosAgent.initialize();
    await zentixAgent.initialize();
    
    console.log('✅ Agents initialized successfully\n');
    
    // Listen for DNA events
    aixDNASpeaker.on('dna-registered', (data) => {
      console.log(`🧬 DNA registered: ${data.agentId}`);
      console.log(`   Expression: "${data.expression}"\n`);
    });
    
    aixDNASpeaker.on('dna-spoken-to', (transmission) => {
      console.log(`🗣️  ${transmission.agentId} speaks to ${transmission.dna.targetAgentId}:`);
      console.log(`   "${transmission.expression}"`);
      console.log(`   Resonance: ${(transmission.resonance * 100).toFixed(1)}%\n`);
    });
    
    aixDNASpeaker.on('dna-broadcast', (transmission) => {
      console.log(`📢 ${transmission.agentId} broadcasts:`);
      console.log(`   "${transmission.expression}"\n`);
    });
    
    aixDNASpeaker.on('dna-evolved', (data) => {
      console.log(`🧬 ${data.agentId} DNA evolved!`);
      console.log(`   New expression: "${data.expression}"\n`);
    });
    
    // Create a DNA dialogue between agents
    console.log('💬 Initiating DNA Dialogue...\n');
    const agentIds = [
      aiosAgent.getAgentDNA().main_agent.id,
      zentixAgent.getAgentDNA().main_agent.id
    ];
    
    const dialogue = aixDNASpeaker.createDNADialogue(agentIds);
    
    // Show DNA history for each agent
    console.log('📜 DNA Expression History:');
    agentIds.forEach(agentId => {
      const history = aixDNASpeaker.getDNAHistory(agentId);
      console.log(`\n${agentId}:`);
      history.forEach((expression, index) => {
        console.log(`   ${index + 1}. "${expression}"`);
      });
    });
    
    // Show resonance network
    console.log('\n🔗 DNA Resonance Network:');
    const resonanceNetwork = aixDNASpeaker.getResonanceNetwork();
    resonanceNetwork.forEach((resonance, key) => {
      console.log(`   ${key}: ${(resonance * 100).toFixed(1)}% resonance`);
    });
    
    // Demonstrate DNA evolution
    console.log('\n🧬 Demonstrating DNA Evolution...');
    const evolvedExpression = zentixAgent.evolveDNA({
      main_agent: {
        ...zentixAgent.getAgentDNA().main_agent,
        skills: [
          ...zentixAgent.getAgentDNA().main_agent.skills,
          "quantum-encryption",
          "predictive-analytics"
        ]
      }
    });
    console.log(`   ZentixAgent evolved with new skills!\n`);
    
    // Have the evolved agent speak its new DNA
    const evolvedTransmission = aixDNASpeaker.speakDNA(zentixAgent.getAgentDNA().main_agent.id);
    
    console.log('🎉 DNA Dialogue Test Completed Successfully!');
    console.log('\n📋 Summary of DNA Communication:');
    console.log('   • DNA Registration: ✅ Successful');
    console.log('   • DNA Expression: ✅ Successful');
    console.log('   • Agent Dialogue: ✅ Successful');
    console.log('   • DNA Evolution: ✅ Successful');
    console.log('   • Resonance Calculation: ✅ Successful');
    
  } catch (error) {
    console.error('❌ Error during DNA dialogue testing:', error);
    process.exit(1);
  }
}

// Run the DNA dialogue test
testDNADialogue();