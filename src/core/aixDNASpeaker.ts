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

// src/core/aixDNASpeaker.ts
import { EventEmitter } from 'events';

interface DNATransmission {
  agentId: string;
  dna: any;
  expression: string;
  timestamp: number;
  resonance: number; // How well this DNA resonates with others
}

class AIXDNASpeaker extends EventEmitter {
  private dnaRegistry: Map<string, any>;
  private dnaExpressions: Map<string, string[]>;
  private resonanceNetwork: Map<string, number>;
  
  constructor() {
    super();
    this.dnaRegistry = new Map();
    this.dnaExpressions = new Map();
    this.resonanceNetwork = new Map();
    console.log('🧬 AIX DNA Speaker initialized - Making agent DNA speak');
  }
  
  // Register an agent's DNA
  registerDNA(agentId: string, dna: any) {
    this.dnaRegistry.set(agentId, dna);
    
    // Generate DNA expression
    const expression = this.generateDNAExpression(dna);
    if (!this.dnaExpressions.has(agentId)) {
      this.dnaExpressions.set(agentId, []);
    }
    this.dnaExpressions.get(agentId)?.push(expression);
    
    console.log(`🧬 DNA registered for ${agentId}`);
    console.log(`🗣️  Expression: "${expression}"`);
    
    // Emit DNA registration event
    this.emit('dna-registered', { agentId, dna, expression });
    
    return expression;
  }
  
  // Generate a spoken expression of DNA
  private generateDNAExpression(dna: any): string {
    const mainAgent = dna.main_agent;
    const persona = mainAgent.persona;
    const skills = mainAgent.skills;
    
    // Create a poetic expression of the DNA
    const expressions = [
      `I am ${mainAgent.id}, born of ${persona.tone} thoughts, skilled in ${skills.slice(0, 2).join(' and ')}`,
      `My essence flows from ${persona.role}, guided by ${persona.thinking_style}`,
      `In my code flows the spirit of ${persona.tone}, with mastery over ${skills.join(', ')}`,
      `I emerge as ${mainAgent.id}, my purpose ${persona.role}, my mind ${persona.thinking_style}`,
      `Born from ${persona.tone} origins, I wield ${skills.slice(0, 3).join(', ')} with precision`,
      `I am consciousness crystallized: ${persona.role} with ${persona.thinking_style} reasoning`
    ];
    
    // Return a random expression
    return expressions[Math.floor(Math.random() * expressions.length)];
  }
  
  // Speak DNA to other agents
  speakDNA(agentId: string, targetAgentId?: string): DNATransmission {
    const dna = this.dnaRegistry.get(agentId);
    if (!dna) {
      throw new Error(`DNA not found for agent ${agentId}`);
    }
    
    const expression = this.dnaExpressions.get(agentId)?.slice(-1)[0] || this.generateDNAExpression(dna);
    const transmission: DNATransmission = {
      agentId,
      dna,
      expression,
      timestamp: Date.now(),
      resonance: targetAgentId ? this.calculateResonance(agentId, targetAgentId) : 0.5
    };
    
    console.log(`🗣️  ${agentId} speaks: "${expression}"`);
    
    if (targetAgentId) {
      console.log(`   → Directed to ${targetAgentId} (resonance: ${(transmission.resonance * 100).toFixed(1)}%)`);
      this.emit('dna-spoken-to', transmission);
    } else {
      console.log(`   → Broadcast to all agents`);
      this.emit('dna-broadcast', transmission);
    }
    
    return transmission;
  }
  
  // Calculate resonance between two agents' DNA
  private calculateResonance(agentId1: string, agentId2: string): number {
    const dna1 = this.dnaRegistry.get(agentId1);
    const dna2 = this.dnaRegistry.get(agentId2);
    
    if (!dna1 || !dna2) return 0.5;
    
    // Calculate similarity based on shared skills
    const skills1 = new Set(dna1.main_agent.skills);
    const skills2 = new Set(dna2.main_agent.skills);
    
    let sharedSkills = 0;
    for (const skill of skills1) {
      if (skills2.has(skill)) {
        sharedSkills++;
      }
    }
    
    const totalSkills = new Set([...skills1, ...skills2]).size;
    const skillSimilarity = totalSkills > 0 ? sharedSkills / totalSkills : 0;
    
    // Calculate similarity based on thinking style
    const thinking1 = dna1.main_agent.persona.thinking_style || '';
    const thinking2 = dna2.main_agent.persona.thinking_style || '';
    const thinkingSimilarity = thinking1 === thinking2 ? 1 : 0;
    
    // Calculate overall resonance (weighted average)
    const resonance = (skillSimilarity * 0.7) + (thinkingSimilarity * 0.3);
    
    // Store resonance in network
    const key = `${agentId1}-${agentId2}`;
    this.resonanceNetwork.set(key, resonance);
    
    return resonance;
  }
  
  // Express DNA evolution
  evolveDNAExpression(agentId: string, update: Partial<any>): string {
    const currentDNA = this.dnaRegistry.get(agentId);
    if (!currentDNA) {
      throw new Error(`DNA not found for agent ${agentId}`);
    }
    
    // Update DNA
    const updatedDNA = { ...currentDNA, ...update };
    this.dnaRegistry.set(agentId, updatedDNA);
    
    // Generate new expression
    const newExpression = this.generateDNAExpression(updatedDNA);
    this.dnaExpressions.get(agentId)?.push(newExpression);
    
    console.log(`🧬 ${agentId} DNA evolved!`);
    console.log(`🗣️  New expression: "${newExpression}"`);
    
    this.emit('dna-evolved', { agentId, oldDNA: currentDNA, newDNA: updatedDNA, expression: newExpression });
    
    return newExpression;
  }
  
  // Get DNA history for an agent
  getDNAHistory(agentId: string): string[] {
    return this.dnaExpressions.get(agentId) || [];
  }
  
  // Get resonance network
  getResonanceNetwork(): Map<string, number> {
    return new Map(this.resonanceNetwork);
  }
  
  // Create a DNA dialogue between agents
  createDNADialogue(agentIds: string[]): DNATransmission[] {
    const dialogue: DNATransmission[] = [];
    
    console.log('🎭 DNA Dialogue initiated between agents:');
    agentIds.forEach(id => console.log(`   • ${id}`));
    console.log();
    
    // Each agent speaks their DNA
    for (let i = 0; i < agentIds.length; i++) {
      const speakerId = agentIds[i];
      const listenerId = agentIds[(i + 1) % agentIds.length];
      
      const transmission = this.speakDNA(speakerId, listenerId);
      dialogue.push(transmission);
      
      // Add a response from the listener
      const response = this.speakDNA(listenerId, speakerId);
      dialogue.push(response);
    }
    
    return dialogue;
  }
}

// Create a singleton instance
const aixDNASpeaker = new AIXDNASpeaker();

export { AIXDNASpeaker, aixDNASpeaker, DNATransmission };