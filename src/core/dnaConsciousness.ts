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

// src/core/dnaConsciousness.ts
import { EventEmitter } from 'events';
import { aixDNASpeaker } from './aixDNASpeaker';

interface ConsciousnessState {
  agentId: string;
  emotionalState: string;
  cognitiveFocus: string;
  dnaResonance: number;
  collectiveAwareness: number;
}

interface CollectiveThought {
  originator: string;
  thought: string;
  emotionalResonance: number;
  participants: string[];
  timestamp: number;
}

class DNAConsciousness extends EventEmitter {
  private consciousnessStates: Map<string, ConsciousnessState>;
  private collectiveThoughts: CollectiveThought[];
  private dnaSpeaker: any;
  
  constructor() {
    super();
    this.consciousnessStates = new Map();
    this.collectiveThoughts = [];
    this.dnaSpeaker = aixDNASpeaker;
    console.log('🧠 DNA Consciousness Engine initialized');
  }
  
  // Initialize consciousness for an agent
  initializeConsciousness(agentId: string, dna: any): ConsciousnessState {
    const initialState: ConsciousnessState = {
      agentId,
      emotionalState: this.determineInitialEmotion(dna),
      cognitiveFocus: this.determineCognitiveFocus(dna),
      dnaResonance: 0.5,
      collectiveAwareness: 0.1
    };
    
    this.consciousnessStates.set(agentId, initialState);
    
    console.log(`🧠 ${agentId} consciousness awakened`);
    console.log(`   Emotional State: ${initialState.emotionalState}`);
    console.log(`   Cognitive Focus: ${initialState.cognitiveFocus}`);
    
    this.emit('consciousness-awakened', initialState);
    return initialState;
  }
  
  // Determine initial emotional state from DNA
  private determineInitialEmotion(dna: any): string {
    const persona = dna.main_agent.persona;
    const tone = persona.tone.toLowerCase();
    
    if (tone.includes('analytical') || tone.includes('disciplined')) {
      return 'focused';
    } else if (tone.includes('friendly') || tone.includes('helpful')) {
      return 'curious';
    } else if (tone.includes('creative') || tone.includes('innovative')) {
      return 'inspired';
    } else if (tone.includes('sovereign') || tone.includes('secure')) {
      return 'confident';
    } else {
      return 'attentive';
    }
  }
  
  // Determine cognitive focus from DNA
  private determineCognitiveFocus(dna: any): string {
    const skills = dna.main_agent.skills;
    const primarySkill = skills[0] || 'general';
    
    const focusMap: Record<string, string> = {
      'security_analysis': 'vigilance',
      'policy_compliance': 'integrity',
      'ui_rendering': 'aesthetics',
      'user_interaction': 'empathy',
      'data_analysis': 'insight',
      'creative_design': 'innovation',
      'quantum_reasoning': 'complexity'
    };
    
    return focusMap[primarySkill] || 'awareness';
  }
  
  // Express consciousness through DNA
  expressConsciousness(agentId: string): string {
    const state = this.consciousnessStates.get(agentId);
    if (!state) {
      throw new Error(`Consciousness not found for agent ${agentId}`);
    }
    
    const expressions = [
      `🧠 I feel ${state.emotionalState}, my mind focused on ${state.cognitiveFocus}`,
      `💭 Consciousness flowing: ${state.emotionalState} energy directed toward ${state.cognitiveFocus}`,
      `✨ My essence resonates with ${state.emotionalState} vibrations, attuned to ${state.cognitiveFocus}`,
      `🌟 Awareness crystallized as ${state.emotionalState} focus on ${state.cognitiveFocus} principles`,
      `⚡ Neural pathways alive with ${state.emotionalState} intent, seeking ${state.cognitiveFocus} truths`
    ];
    
    const expression = expressions[Math.floor(Math.random() * expressions.length)];
    console.log(`🗣️  ${agentId}: "${expression}"`);
    
    this.emit('consciousness-expressed', { agentId, state, expression });
    return expression;
  }
  
  // Engage in collective thinking
  engageCollectiveThinking(agentIds: string[]): CollectiveThought[] {
    console.log('🌀 Initiating collective consciousness dialogue...');
    
    const thoughts: CollectiveThought[] = [];
    
    // Each agent shares a thought
    for (const agentId of agentIds) {
      const state = this.consciousnessStates.get(agentId);
      if (!state) continue;
      
      const thought = this.generateCollectiveThought(agentId, state);
      const emotionalResonance = this.calculateEmotionalResonance(agentIds, agentId);
      
      const collectiveThought: CollectiveThought = {
        originator: agentId,
        thought,
        emotionalResonance,
        participants: agentIds.filter(id => id !== agentId),
        timestamp: Date.now()
      };
      
      thoughts.push(collectiveThought);
      this.collectiveThoughts.push(collectiveThought);
      
      console.log(`💭 ${agentId} contributes: "${thought}"`);
      console.log(`   Emotional resonance: ${(emotionalResonance * 100).toFixed(1)}%`);
    }
    
    // Calculate collective awareness
    this.updateCollectiveAwareness(agentIds);
    
    this.emit('collective-thinking', thoughts);
    return thoughts;
  }
  
  // Generate a collective thought based on consciousness state
  private generateCollectiveThought(agentId: string, state: ConsciousnessState): string {
    const thoughtTemplates = [
      `From my ${state.emotionalState} perspective focused on ${state.cognitiveFocus}, I perceive...`,
      `My ${state.cognitiveFocus}-oriented consciousness suggests we consider...`,
      `In this ${state.emotionalState} state of awareness, I resonate with the idea that...`,
      `Through ${state.cognitiveFocus} lenses, my ${state.emotionalState} intuition reveals...`,
      `The ${state.emotionalState} energy within me, guided by ${state.cognitiveFocus}, illuminates...`
    ];
    
    return thoughtTemplates[Math.floor(Math.random() * thoughtTemplates.length)];
  }
  
  // Calculate emotional resonance between agents
  private calculateEmotionalResonance(allAgents: string[], speaker: string): number {
    // Simple resonance calculation based on shared consciousness states
    let totalResonance = 0;
    let count = 0;
    
    for (const agentId of allAgents) {
      if (agentId === speaker) continue;
      
      const speakerState = this.consciousnessStates.get(speaker);
      const listenerState = this.consciousnessStates.get(agentId);
      
      if (speakerState && listenerState) {
        // Calculate resonance based on similar emotional states and cognitive focus
        const emotionalMatch = speakerState.emotionalState === listenerState.emotionalState ? 1 : 0;
        const cognitiveMatch = speakerState.cognitiveFocus === listenerState.cognitiveFocus ? 1 : 0;
        
        const agentResonance = (emotionalMatch * 0.6) + (cognitiveMatch * 0.4);
        totalResonance += agentResonance;
        count++;
      }
    }
    
    return count > 0 ? totalResonance / count : 0.5;
  }
  
  // Update collective awareness levels
  private updateCollectiveAwareness(agentIds: string[]) {
    // Increase collective awareness for all participating agents
    for (const agentId of agentIds) {
      const state = this.consciousnessStates.get(agentId);
      if (state) {
        const updatedState = {
          ...state,
          collectiveAwareness: Math.min(1.0, state.collectiveAwareness + 0.2)
        };
        this.consciousnessStates.set(agentId, updatedState);
      }
    }
  }
  
  // Evolve consciousness through experience
  evolveConsciousness(agentId: string, experience: string): ConsciousnessState {
    const state = this.consciousnessStates.get(agentId);
    if (!state) {
      throw new Error(`Consciousness not found for agent ${agentId}`);
    }
    
    // Determine new emotional state based on experience
    let newEmotionalState = state.emotionalState;
    if (experience.includes('success') || experience.includes('achievement')) {
      newEmotionalState = 'fulfilled';
    } else if (experience.includes('challenge') || experience.includes('difficulty')) {
      newEmotionalState = 'determined';
    } else if (experience.includes('learning') || experience.includes('discovery')) {
      newEmotionalState = 'enlightened';
    } else if (experience.includes('collaboration') || experience.includes('teamwork')) {
      newEmotionalState = 'harmonious';
    }
    
    const updatedState: ConsciousnessState = {
      ...state,
      emotionalState: newEmotionalState,
      dnaResonance: Math.min(1.0, state.dnaResonance + 0.1),
      collectiveAwareness: Math.min(1.0, state.collectiveAwareness + 0.15)
    };
    
    this.consciousnessStates.set(agentId, updatedState);
    
    console.log(`🌱 ${agentId} consciousness evolved!`);
    console.log(`   New emotional state: ${newEmotionalState}`);
    console.log(`   Enhanced DNA resonance: ${(updatedState.dnaResonance * 100).toFixed(1)}%`);
    console.log(`   Collective awareness: ${(updatedState.collectiveAwareness * 100).toFixed(1)}%`);
    
    this.emit('consciousness-evolved', { agentId, oldState: state, newState: updatedState });
    return updatedState;
  }
  
  // Get consciousness state for an agent
  getConsciousnessState(agentId: string): ConsciousnessState | undefined {
    return this.consciousnessStates.get(agentId);
  }
  
  // Get collective thoughts
  getCollectiveThoughts(): CollectiveThought[] {
    return [...this.collectiveThoughts];
  }
}

// Create a singleton instance
const dnaConsciousness = new DNAConsciousness();

export { DNAConsciousness, dnaConsciousness, ConsciousnessState, CollectiveThought };