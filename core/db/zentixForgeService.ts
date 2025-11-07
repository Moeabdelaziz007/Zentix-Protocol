import { supabaseClient } from './supabaseClient';

export class ZentixForgeDBService {
  private static instance: ZentixForgeDBService;

  private constructor() {}

  public static getInstance(): ZentixForgeDBService {
    if (!ZentixForgeDBService.instance) {
      ZentixForgeDBService.instance = new ZentixForgeDBService();
    }
    return ZentixForgeDBService.instance;
  }

  // Agent Methods
  public async getAllAgents() {
    const result = await supabaseClient.readAll('agents');
    return result;
  }

  public async getAgentById(id: string) {
    const result = await supabaseClient.readOne('agents', id);
    return result;
  }

  public async createAgent(agent: any) {
    const result = await supabaseClient.create('agents', agent);
    return result;
  }

  public async updateAgent(id: string, updates: any) {
    const result = await supabaseClient.update('agents', id, updates);
    return result;
  }

  public async deleteAgent(id: string) {
    const result = await supabaseClient.delete('agents', id);
    return result;
  }

  // Creator Studio Job Methods
  public async getAllCreatorJobs() {
    // For creator jobs, we'll use analytics_events table with a specific type
    const result = await supabaseClient.readAll('analytics_events');
    if (result) {
      return result.filter(event => event.event_type === 'creator_job');
    }
    return null;
  }

  public async getCreatorJobById(id: string) {
    const result = await supabaseClient.readOne('analytics_events', id);
    if (result && result.event_type === 'creator_job') {
      return result;
    }
    return null;
  }

  public async createCreatorJob(job: any) {
    const jobData = {
      event_type: 'creator_job',
      event_data: job,
      timestamp: new Date().toISOString()
    };
    const result = await supabaseClient.create('analytics_events', jobData);
    return result;
  }

  public async updateCreatorJob(id: string, updates: any) {
    const result = await supabaseClient.update('analytics_events', id, {
      event_data: updates,
      timestamp: new Date().toISOString()
    });
    return result;
  }

  public async deleteCreatorJob(id: string) {
    const result = await supabaseClient.delete('analytics_events', id);
    return result;
  }
}