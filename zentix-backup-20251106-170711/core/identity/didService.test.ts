import { describe, it, expect } from 'vitest';
import { DidService } from './didService';

describe('DidService', () => {
  it('should create a valid DID', () => {
    const did = DidService.create('TestAgent', 'Polygon');
    
    expect(did.agent_name).toBe('TestAgent');
    expect(did.blockchain).toBe('Polygon');
    expect(DidService.isValidDID(did.did)).toBe(true);
    expect(did.history.length).toBe(1);
    expect(did.history[0].event).toBe('genesis');
  });

  it('should record events correctly', () => {
    let did = DidService.create('TestAgent');
    
    did = DidService.recordEvent(did, 'learning', { skill: 'test' });
    
    expect(did.history.length).toBe(2);
    expect(did.history[1].event).toBe('learning');
    expect(did.history[1].payload?.skill).toBe('test');
  });

  it('should validate DID format', () => {
    expect(DidService.isValidDID('zxdid:zentix:0x8AFCE1B0921A9E91FFFFFFFFFFFFF01A')).toBe(true);
    expect(DidService.isValidDID('invalid-did')).toBe(false);
    expect(DidService.isValidDID('zxdid:zentix:0xTOOSHORT')).toBe(false);
  });

  it('should calculate age correctly', () => {
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const age = DidService.calculateAge(pastDate);
    
    expect(age).toBe(2);
  });

  it('should create unique fingerprints', () => {
    const did1 = DidService.create('Agent1');
    const did2 = DidService.create('Agent2');
    
    const fp1 = DidService.createFingerprint(did1);
    const fp2 = DidService.createFingerprint(did2);
    
    expect(fp1).not.toBe(fp2);
    expect(fp1.length).toBe(16);
  });

  it('should get lifespan summary', () => {
    let did = DidService.create('TestAgent');
    did = DidService.recordEvent(did, 'learning');
    did = DidService.recordEvent(did, 'success');
    
    const summary = DidService.getLifespanSummary(did);
    
    expect(summary.total_events).toBe(3);
    expect(summary.event_types).toContain('genesis');
    expect(summary.event_types).toContain('learning');
    expect(summary.event_types).toContain('success');
  });

  it('should export and import correctly', () => {
    const original = DidService.create('TestAgent');
    const exported = DidService.export(original);
    const imported = DidService.import(exported);
    
    expect(imported.did).toBe(original.did);
    expect(imported.agent_name).toBe(original.agent_name);
    expect(imported.history.length).toBe(original.history.length);
  });
});
