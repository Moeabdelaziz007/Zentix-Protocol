import { supabaseClient } from './supabaseClient';

export class CreatorService {
  private static instance: CreatorService;

  private constructor() {}

  public static getInstance(): CreatorService {
    if (!CreatorService.instance) {
      CreatorService.instance = new CreatorService();
    }
    return CreatorService.instance;
  }

  // Creator Job Store Methods (replacing the in-memory creatorJobStore)
  public async getAllJobs(): Promise<any[] | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('creator_jobs')
        .select('*');
      
      if (error) {
        console.error('Error fetching all creator jobs:', error.message);
        return null;
      }
      
      return data;
    } catch (e) {
      console.error('Exception during getAllJobs:', (e as Error).message);
      return null;
    }
  }

  public async getJobById(jobId: string): Promise<any | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('creator_jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (error) {
        // Supabase returns an error if no row is found with .single()
        if (error.code === 'PGRST116') { // Specific code for no rows found
            return null;
        }
        console.error('Error fetching job by ID:', error.message);
        return null;
      }
      
      return data;
    } catch (e) {
      console.error('Exception during getJobById:', (e as Error).message);
      return null;
    }
  }

  public async createJob(jobId: string, jobData: any): Promise<any | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('creator_jobs')
        .insert([{ id: jobId, ...jobData }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating job:', error.message);
        return null;
      }
      
      return data;
    } catch (e) {
      console.error('Exception during createJob:', (e as Error).message);
      return null;
    }
  }

  public async updateJob(jobId: string, updates: any): Promise<any | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('creator_jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating job:', error.message);
        return null;
      }
      
      return data;
    } catch (e) {
      console.error('Exception during updateJob:', (e as Error).message);
      return null;
    }
  }

  public async deleteJob(jobId: string): Promise<boolean> {
    if (!supabaseClient.clientInstance) return false;
    try {
      const { error } = await supabaseClient.clientInstance
        .from('creator_jobs')
        .delete()
        .eq('id', jobId);
      
      if (error) {
        console.error('Error deleting job:', error.message);
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Exception during deleteJob:', (e as Error).message);
      return false;
    }
  }
}