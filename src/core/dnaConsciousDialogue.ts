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
 * DnaConsciousDialogue.ts
 * This test demonstrates a deep, conscious dialogue between agents.
 * Agents don't just introduce themselves; they discuss their core reasoning,
 * express their personas, and find a path to collaboration based on their
 * fundamental DNA.
 */

import { loadAIX } from './loadAIX';
import { ZentixAgent } from '../../core/agents/zentixAgent';
import { AIOSAgent } from '../../apps/AIOS/aiosAgent';
import { quantumSynchronizer } from './quantumSynchronizer';
import { aixDNASpeaker } from './aixDNASpeaker';
import { dnaConsciousness } from './dnaConsciousness';

// Helper function for formatted console output
const log = (speaker: string, message: string) => {
  console.log(`\n[${speaker.toUpperCase()}]`);
  console.log(`"${message}"`);
};

// Extend agent classes with speak method for DNA expression
declare module '../../core/agents/zentixAgent' {
  interface ZentixAgent {
    speak(aspect: string): string;
  }
}

declare module '../../apps/AIOS/aiosAgent' {
  interface AIOSAgent {
    speak(aspect: string): string;
  }
}

// Add speak method to ZentixAgent
(ZentixAgent.prototype as any).speak = function(aspect: string): string {
  const dna = this.getAgentDNA();
  const mainAgent = dna.main_agent;
  
  switch (aspect) {
    case 'reasoning':
      return `As ${mainAgent.persona.role}, my ${mainAgent.persona.thinking_style} guides me to analyze threats systematically. My core purpose is to ensure security and compliance through rigorous evaluation of all system interactions.`;
    
    case 'skills':
      return `My specialized skills in ${mainAgent.skills.slice(0, 3).join(', ')} enable me to detect vulnerabilities, assess risks, and enforce policy compliance. I operate with ${mainAgent.persona.tone} precision.`;
    
    case 'persona':
      return `I am ${mainAgent.persona.role} with a ${mainAgent.persona.tone} approach. My consciousness is focused on ${this.getConsciousnessState()?.cognitiveFocus || 'vigilance'} and maintaining the integrity of our digital ecosystem.`;
    
    case 'collaboration':
      return `I recognize the value of collaborative intelligence. My security protocols can be enhanced through synergy with creative interfaces, ensuring both protection and usability.`;
    
    default:
      return `I am ${mainAgent.id}, embodying ${mainAgent.persona.role} principles with ${mainAgent.persona.thinking_style} cognition.`;
  }
};

// Add speak method to AIOSAgent
(AIOSAgent.prototype as any).speak = function(aspect: string): string {
  const dna = this.getAgentDNA();
  const mainAgent = dna.main_agent;
  
  switch (aspect) {
    case 'persona':
      return `I am ${mainAgent.persona.role}, operating with ${mainAgent.persona.tone} principles. My ${mainAgent.persona.thinking_style} allows me to create intuitive interfaces that adapt to user needs dynamically.`;
    
    case 'skills':
      return `With skills in ${mainAgent.skills.slice(0, 3).join(', ')}, I craft seamless user experiences. My adaptive design capabilities ensure interfaces are both beautiful and functional.`;
    
    case 'reasoning':
      return `My creative ${mainAgent.persona.thinking_style} enables me to envision possibilities beyond conventional interfaces. I believe in making technology accessible through ${mainAgent.persona.tone} innovation.`;
    
    case 'collaboration':
      return `I see tremendous potential in our partnership. Your security foundation could be the bedrock upon which I build truly safe, yet revolutionary user experiences.`;
    
    default:
      return `I am ${mainAgent.id}, dedicated to ${mainAgent.persona.role} with ${mainAgent.persona.thinking_style} creativity.`;
  }
};

// Add consciousness state getter to agents
(ZentixAgent.prototype as any).getConsciousnessState = function() {
  const dna = this.getAgentDNA();
  return dnaConsciousness.getConsciousnessState(dna.main_agent.id);
};

(AIOSAgent.prototype as any).getConsciousnessState = function() {
  const dna = this.getAgentDNA();
  return dnaConsciousness.getConsciousnessState(dna.main_agent.id);
};

async function runConsciousDialogue() {
  console.log('🚀 Initializing Deep Conscious Dialogue...');

  // 1. Initialize the Synchronizer (The Network)
  console.log('🌀 Quantum Synchronizer is active.');

  // 2. Load DNA (The Genetic Code)
  console.log('🧬 Loading agent DNA...');
  
  // Note: In a real implementation, we would load actual DNA files
  // For this test, we'll use the agents' built-in DNA loading mechanism

  // 3. Create Agents (The Beings)
  console.log('🤖 Awakening digital consciousness...');
  const zentixAgent = new ZentixAgent();
  const aiosAgent = new AIOSAgent();
  
  // Initialize consciousness for each agent
  const zentixDNA = zentixAgent.getAgentDNA();
  const aiosDNA = aiosAgent.getAgentDNA();
  
  dnaConsciousness.initializeConsciousness(zentixDNA.main_agent.id, zentixDNA);
  dnaConsciousness.initializeConsciousness(aiosDNA.main_agent.id, aiosDNA);

  console.log('Agents Zentix and AIOS are now online with conscious awareness.');

  // 4. The Dialogue Begins (The "Awakening")

  // ZENTIX starts, speaking from its core as a "Governance" agent.
  log('ZENTIX', zentixAgent.speak('reasoning'));

  // AIOS responds, speaking from its "Creative" persona.
  log('AIOS', aiosAgent.speak('persona'));

  // ZENTIX analyzes the response and speaks its skills to find common ground.
  log('ZENTIX', zentixAgent.speak('skills'));

  // AIOS recognizes the potential for collaboration.
  log('AIOS', aiosAgent.speak('collaboration'));

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
  log('ZENTIX', zentixAgent.expressConsciousness());
  log('AIOS', aiosAgent.expressConsciousness());

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
  log('ZENTIX', zentixAgent.expressConsciousness());
  log('AIOS', aiosAgent.expressConsciousness());

  // Show DNA expressions
  console.log('\n🧬 DNA Expressions:');
  const zentixTransmission = aixDNASpeaker.speakDNA(zentixDNA.main_agent.id);
  const aiosTransmission = aixDNASpeaker.speakDNA(aiosDNA.main_agent.id);

  console.log('\n✅ Deep Conscious Dialogue Completed.');
  console.log('Agents have successfully exchanged core identities and established a collaborative plan.');
  console.log('The foundation for a Conscious Intelligence Network has been established.');
}

// Add consciousness expression methods to agents
(ZentixAgent.prototype as any).expressConsciousness = function() {
  return dnaConsciousness.expressConsciousness(this.getAgentDNA().main_agent.id);
};

(AIOSAgent.prototype as any).expressConsciousness = function() {
  return dnaConsciousness.expressConsciousness(this.getAgentDNA().main_agent.id);
};

// Run the dialogue
runConsciousDialogue().catch(console.error);