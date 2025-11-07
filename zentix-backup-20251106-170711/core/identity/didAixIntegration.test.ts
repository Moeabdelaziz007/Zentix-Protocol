import { describe, it, expect } from 'vitest';
import { DidAixIntegration } from './didAixIntegration';

const createTestAgent = () =>
  DidAixIntegration.createAgentWithDID({
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'TestAgent',
    meta: {
      created: new Date().toISOString(),
      description: 'Test agent',
    },
    persona: {
      archetype: 'analyst',
      tone: 'professional',
      values: ['truth'],
    },
    skills: [],
  });

describe('DidAixIntegration', () => {
  it('should create agent with DID', () => {
    const agent = createTestAgent();

    expect(agent.aix.name).toBe('TestAgent');
    expect(agent.did.agent_name).toBe('TestAgent');
    expect(agent.did.history[0].event).toBe('genesis');
  });

  it('should record events in both systems', () => {
    let agent = createTestAgent();

    agent = DidAixIntegration.recordAgentEvent(agent, 'learning', {
      skill: 'test',
    });

    expect(agent.did.history.length).toBe(2);
    expect(agent.did.history[1].event).toBe('learning');
  });

  it('should verify agent authenticity', () => {
    const agent = createTestAgent();

    const verification = DidAixIntegration.verifyAgentAuthenticity(agent);

    expect(verification.valid).toBe(true);
  });

  it('should detect name mismatch', () => {
    const agent = createTestAgent();

    // Tamper with name
    agent.aix.name = 'DifferentName';

    const verification = DidAixIntegration.verifyAgentAuthenticity(agent);

    expect(verification.valid).toBe(false);
    expect(verification.reason).toContain('mismatch');
  });

  it('should get identity card', () => {
    const agent = DidAixIntegration.createAgentWithDID({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'TestAgent',
      meta: {
        created: new Date().toISOString(),
        description: 'Test agent',
      },
      persona: {
        archetype: 'analyst',
        tone: 'professional',
        values: ['truth'],
      },
      skills: [{ name: 'analyze', description: 'Test' }],
    });

    const card = DidAixIntegration.getIdentityCard(agent);

    expect(card.agent_name).toBe('TestAgent');
    expect(card.skills_count).toBe(1);
    expect(card.total_events).toBe(1);
    expect(card).toHaveProperty('fingerprint');
    expect(card).toHaveProperty('did');
  });

  it('should export and import agent', () => {
    const original = createTestAgent();

    const exported = DidAixIntegration.exportAgentWithDID(original);
    const imported = DidAixIntegration.importAgentWithDID(exported);

    expect(imported.aix.name).toBe(original.aix.name);
    expect(imported.did.did).toBe(original.did.did);
  });

  it('should track evolution timeline', () => {
    let agent = createTestAgent();

    agent = DidAixIntegration.recordAgentEvent(agent, 'learning', {});
    agent = DidAixIntegration.recordAgentEvent(agent, 'success', {});

    const timeline = DidAixIntegration.getEvolutionTimeline(agent);

    expect(timeline.length).toBe(3);
    expect(timeline[0].event).toBe('genesis');
    expect(timeline[1].event).toBe('learning');
    expect(timeline[2].event).toBe('success');
  });
});
