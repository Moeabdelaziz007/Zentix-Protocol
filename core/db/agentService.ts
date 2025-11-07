import { supabaseClient } from './supabaseClient';

export class AgentService {
  private static instance: AgentService;

  private constructor() {}

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  // Agent Store Methods (replacing the in-memory agentStore)
  public async getAllAgents(): Promise<any[] | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('agents')
        .select('*');
      
      if (error) {
        console.error('Error fetching all agents:', error.message);
        return null;
      }
      
      return data;
    } catch (e) {
      console.error('Exception during getAllAgents:', (e as Error).message);
      return null;
    }
  }

  public async getAgentById(agentId: string): Promise<any | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();
      
      if (error) {
        // Supabase returns an error if no row is found with .single()
        if (error.code === 'PGRST116') { // Specific code for no rows found
            return null;
        }
        console.error('Error fetching agent by ID:', error.message);
        return null;
      }
      
      return data;
    } catch (e) {
      console.error('Exception during getAgentById:', (e as Error).message);
      return null;
    }
  }

  public async createAgent(agentId: string, agentData: any): Promise<any | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('agents')
        .insert([{ id: agentId, ...agentData }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating agent:', error.message);
        return null;
      }
      
      return data;
    } catch (e) {
      console.error('Exception during createAgent:', (e as Error).message);
      return null;
    }
  }

  public async updateAgent(agentId: string, updates: any): Promise<any | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('agents')
        .update(updates)
        .eq('id', agentId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating agent:', error.message);
        return null;
      }
      
      return data;
    } catch (e) {
      console.error('Exception during updateAgent:', (e as Error).message);
      return null;
    }
  }

  public async deleteAgent(agentId: string): Promise<boolean> {
    if (!supabaseClient.clientInstance) return false;
    try {
      const { error } = await supabaseClient.clientInstance
        .from('agents')
        .delete()
        .eq('id', agentId);
      
      if (error) {
        console.error('Error deleting agent:', error.message);
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Exception during deleteAgent:', (e as Error).message);
      return false;
    }
  }
}