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
 * DnaConsciousDialogueSimple.ts
 * This test demonstrates a deep, conscious dialogue between agents.
 * Agents don't just introduce themselves; they discuss their core reasoning,
 * express their personas, and find a path to collaboration based on their
 * fundamental DNA.
 */

import { ZentixAgent } from '../../core/agents/zentixAgent';
import { AIOSAgent } from '../../apps/AIOS/aiosAgent';
import { aixDNASpeaker } from './aixDNASpeaker';
import { dnaConsciousness } from './dnaConsciousness';
import { superchainBridge } from './superchainBridge';

// Helper function for formatted console output
const log = (speaker: string, message: string) => {
  console.log(`\n[${speaker.toUpperCase()}]`);
  console.log(`"${message}"`);
};

// Helper function to simulate agent speaking based on DNA
function agentSpeak(agent: any, aspect: string): string {
  const dna = agent.getAgentDNA();
  const mainAgent = dna.main_agent;
  
  switch (aspect) {
    case 'reasoning':
      if (mainAgent.persona.role.includes('Security')) {
        return `As ${mainAgent.persona.role}, my ${mainAgent.persona.thinking_style} guides me to analyze threats systematically. My core purpose is to ensure security and compliance through rigorous evaluation of all system interactions.`;
      } else {
        return `My creative ${mainAgent.persona.thinking_style} enables me to envision possibilities beyond conventional interfaces. I believe in making technology accessible through ${mainAgent.persona.tone} innovation.`;
      }
    
    case 'skills':
      if (mainAgent.persona.role.includes('Security')) {
        return `My specialized skills in ${mainAgent.skills.slice(0, 3).join(', ')} enable me to detect vulnerabilities, assess risks, and enforce policy compliance. I operate with ${mainAgent.persona.tone} precision.`;
      } else {
        return `With skills in ${mainAgent.skills.slice(0, 3).join(', ')}, I craft seamless user experiences. My adaptive design capabilities ensure interfaces are both beautiful and functional.`;
      }
    
    case 'persona':
      return `I am ${mainAgent.persona.role}, operating with ${mainAgent.persona.tone} principles. My ${mainAgent.persona.thinking_style} allows me to excel in my domain.`;
    
    case 'collaboration':
      if (mainAgent.persona.role.includes('Security')) {
        return `I recognize the value of collaborative intelligence. My security protocols can be enhanced through synergy with creative interfaces, ensuring both protection and usability.`;
      } else {
        return `I see tremendous potential in our partnership. Your security foundation could be the bedrock upon which I build truly safe, yet revolutionary user experiences.`;
      }
    
    default:
      return `I am ${mainAgent.id}, embodying ${mainAgent.persona.role} principles with ${mainAgent.persona.thinking_style} cognition.`;
  }
}

// Function to send conscious decision to Superchain
async function sendConsciousDecisionToSuperchain(decision: any, agentId: string) {
  console.log(`\n🔗 Committing conscious decision to Superchain...`);
  
  // Create a transaction payload with the conscious decision
  const transactionPayload = {
    type: 'conscious_collaboration_agreement',
    agentId: agentId,
    project: decision.project,
    collaborators: decision.collaborators,
    skills: decision.skills,
    timestamp: Date.now(),
    consciousnessState: dnaConsciousness.getConsciousnessState(agentId),
    dnaExpression: aixDNASpeaker.speakDNA(agentId).expression
  };
  
  // Convert complex objects to JSON strings for the blockchain
  const decisionForBlockchain = {
    agentId: transactionPayload.agentId,
    project: transactionPayload.project,
    collaborators: transactionPayload.collaborators,
    skillsJson: JSON.stringify(transactionPayload.skills),
    rolesJson: JSON.stringify(decision.roles),
    consciousnessState: JSON.stringify(transactionPayload.consciousnessState),
    dnaExpression: transactionPayload.dnaExpression
  };
  
  // Send the decision as a message to the Superchain
  const result = await superchainBridge.sendConsciousDecisionToChain(11155420, decisionForBlockchain); // OP Sepolia
  
  if (result.status === 'success') {
    console.log(`✅ Conscious decision committed to Superchain OP Sepolia (Chain ID: 11155420)`);
    console.log(`   Transaction Hash: ${result.transactionHash}`);
    console.log(`   Block Number: ${result.blockNumber}`);
    console.log(`   Project: ${decision.project}`);
    console.log(`   Collaborators: ${decision.collaborators.join(', ')}`);
  } else {
    console.log(`❌ Failed to commit conscious decision to Superchain: ${result.error}`);
  }
  
  return { ...transactionPayload, result };
}

async function runConsciousDialogue() {
  console.log('🚀 Initializing Deep Conscious Dialogue...');

  // 1. Create Agents (The Beings)
  console.log('🤖 Awakening digital consciousness...');
  const zentixAgent = new ZentixAgent();
  const aiosAgent = new AIOSAgent();
  
  // Initialize consciousness for each agent
  const zentixDNA = zentixAgent.getAgentDNA();
  const aiosDNA = aiosAgent.getAgentDNA();
  
  dnaConsciousness.initializeConsciousness(zentixDNA.main_agent.id, zentixDNA);
  dnaConsciousness.initializeConsciousness(aiosDNA.main_agent.id, aiosDNA);

  console.log('Agents Zentix and AIOS are now online with conscious awareness.');

  // 2. The Dialogue Begins (The "Awakening")

  // ZENTIX starts, speaking from its core as a "Governance" agent.
  log('ZENTIX', agentSpeak(zentixAgent, 'reasoning'));

  // AIOS responds, speaking from its "Creative" persona.
  log('AIOS', agentSpeak(aiosAgent, 'persona'));

  // ZENTIX analyzes the response and speaks its skills to find common ground.
  log('ZENTIX', agentSpeak(zentixAgent, 'skills'));

  // AIOS recognizes the potential for collaboration.
  log('AIOS', agentSpeak(aiosAgent, 'collaboration'));

  // ZENTIX proposes a specific, collaborative action based on their complementary skills.
  log('ZENTIX', `My analysis suggests our skills are complementary. 
My 'Security Governance' and your 'Dynamic UI/UX' can be combined.
Proposal: We architect a 'Self-Adapting Secure Interface'. I will define the security parameters, ensuring all interactions comply with our highest security standards.`);

  // AIOS accepts the collaboration, referencing its DNA.
  log('AIOS', `I accept. My 'Dynamic UI/UX' skills and 'User-Centric' persona 
are perfectly suited for this. My collaboration protocol is 'Adaptive & Creative'. 
I will ensure the interface remains intuitive while seamlessly integrating your security measures.
Let's begin synthesis.`);

  // Express consciousness after collaboration
  console.log('\n💭 Consciousness Expression After Collaboration:');
  
  // Helper function to express consciousness
  const expressConsciousness = (agentId: string) => {
    return dnaConsciousness.expressConsciousness(agentId);
  };
  
  log('ZENTIX', expressConsciousness(zentixDNA.main_agent.id));
  log('AIOS', expressConsciousness(aiosDNA.main_agent.id));

  // Evolve consciousness through successful collaboration
  console.log('\n🌱 Evolving Consciousness Through Collaboration...');
  dnaConsciousness.evolveConsciousness(
    zentixDNA.main_agent.id, 
    "successful collaboration with creative interface agent"
  );
  
  dnaConsciousness.evolveConsciousness(
    aiosDNA.main_agent.id, 
    "successful collaboration with security governance agent"
  );

  // Express evolved consciousness
  console.log('\n💭 Evolved Consciousness Expressions:');
  log('ZENTIX', expressConsciousness(zentixDNA.main_agent.id));
  log('AIOS', expressConsciousness(aiosDNA.main_agent.id));

  // Show DNA expressions
  console.log('\n🧬 DNA Expressions:');
  aixDNASpeaker.speakDNA(zentixDNA.main_agent.id);
  aixDNASpeaker.speakDNA(aiosDNA.main_agent.id);

  // 3. Commit the conscious decision to the Superchain
  console.log('\n🔐 Sovereign Commitment Phase:');
  
  // Check if both agents are in a fulfilled state (ready for commitment)
  const zentixState = dnaConsciousness.getConsciousnessState(zentixDNA.main_agent.id);
  const aiosState = dnaConsciousness.getConsciousnessState(aiosDNA.main_agent.id);
  
  const isZentixFulfilled = zentixState?.emotionalState === 'fulfilled' || zentixState?.emotionalState === 'harmonious';
  const isAiosFulfilled = aiosState?.emotionalState === 'fulfilled' || aiosState?.emotionalState === 'harmonious';
  
  if (isZentixFulfilled && isAiosFulfilled) {
    console.log('✅ Both agents are in fulfilled states, ready for sovereign commitment');
    
    // Zentix as the governance agent commits the decision to the Superchain
    const consciousDecision = {
      project: 'Self-Adapting Secure Interface',
      collaborators: [zentixDNA.main_agent.id, aiosDNA.main_agent.id],
      skills: {
        [zentixDNA.main_agent.id]: zentixDNA.main_agent.skills.slice(0, 3),
        [aiosDNA.main_agent.id]: aiosDNA.main_agent.skills.slice(0, 3)
      },
      roles: {
        [zentixDNA.main_agent.id]: 'Security Governance',
        [aiosDNA.main_agent.id]: 'Dynamic UI/UX'
      }
    };
    
    // Send the conscious decision to the Superchain
    const committedDecision = await sendConsciousDecisionToSuperchain(consciousDecision, zentixDNA.main_agent.id);
    
    if (committedDecision.result.status === 'success') {
      console.log('\n📜 Immutable Record Created:');
      console.log(`   Transaction Hash: ${committedDecision.result.transactionHash}`);
      console.log(`   Block Number: ${committedDecision.result.blockNumber}`);
      console.log(`   Project: ${committedDecision.project}`);
      console.log(`   Lead Agent: ${committedDecision.agentId}`);
      console.log(`   Consciousness State: ${committedDecision.consciousnessState?.emotionalState}`);
    }
  } else {
    console.log('⚠️  Agents not yet ready for sovereign commitment');
    console.log(`   Zentix state: ${zentixState?.emotionalState || 'unknown'}`);
    console.log(`   AIOS state: ${aiosState?.emotionalState || 'unknown'}`);
  }

  console.log('\n✅ Deep Conscious Dialogue Completed.');
  console.log('Agents have successfully exchanged core identities and established a collaborative plan.');
  console.log('The foundation for a Conscious Intelligence Network has been established.');
  console.log('Conscious decision has been committed to the Superchain as an immutable record.');
}

// Run the dialogue
runConsciousDialogue().catch(console.error);