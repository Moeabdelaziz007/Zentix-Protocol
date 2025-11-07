import { supabaseClient } from './supabaseClient';
import { Referral, Lead, RewardTracking, AgentActivity, AnalyticsEvent } from '../types';

export class ReferralService {
  private static instance: ReferralService;

  private constructor() {}

  public static getInstance(): ReferralService {
    if (!ReferralService.instance) {
      ReferralService.instance = new ReferralService();
    }
    return ReferralService.instance;
  }

  // Referral Methods
  public async getAllReferrals(): Promise<Referral[] | null> {
    return await supabaseClient.readAll('referrals');
  }

  public async getReferralById(id: string): Promise<Referral | null> {
    return await supabaseClient.readOne('referrals', id);
  }

  public async getReferralsByReferrer(referrerDid: string): Promise<Referral[] | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('referrals')
        .select('*')
        .eq('referrer_did', referrerDid);
      
      if (error) {
        console.error('Error fetching referrals by referrer:', error.message);
        return null;
      }
      
      return data as Referral[];
    } catch (e) {
      console.error('Exception during getReferralsByReferrer:', (e as Error).message);
      return null;
    }
  }

  public async createReferral(referral: Omit<Referral, 'id'>): Promise<Referral | null> {
    return await supabaseClient.create('referrals', referral);
  }

  public async updateReferral(id: string, updates: Partial<Referral>): Promise<Referral | null> {
    return await supabaseClient.update('referrals', id, updates);
  }

  public async deleteReferral(id: string): Promise<boolean> {
    return await supabaseClient.delete('referrals', id);
  }

  // Lead Methods
  public async getAllLeads(): Promise<Lead[] | null> {
    return await supabaseClient.readAll('leads');
  }

  public async getLeadById(id: string): Promise<Lead | null> {
    return await supabaseClient.readOne('leads', id);
  }

  public async getLeadsByEmail(email: string): Promise<Lead[] | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('leads')
        .select('*')
        .eq('email', email);
      
      if (error) {
        console.error('Error fetching leads by email:', error.message);
        return null;
      }
      
      return data as Lead[];
    } catch (e) {
      console.error('Exception during getLeadsByEmail:', (e as Error).message);
      return null;
    }
  }

  public async createLead(lead: Omit<Lead, 'id'>): Promise<Lead | null> {
    return await supabaseClient.create('leads', lead);
  }

  public async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    return await supabaseClient.update('leads', id, updates);
  }

  public async deleteLead(id: string): Promise<boolean> {
    return await supabaseClient.delete('leads', id);
  }

  // Reward Tracking Methods
  public async getAllRewards(): Promise<RewardTracking[] | null> {
    return await supabaseClient.readAll('reward_tracking');
  }

  public async getRewardById(id: string): Promise<RewardTracking | null> {
    return await supabaseClient.readOne('reward_tracking', id);
  }

  public async getRewardsByUser(userDid: string): Promise<RewardTracking[] | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('reward_tracking')
        .select('*')
        .eq('user_did', userDid);
      
      if (error) {
        console.error('Error fetching rewards by user:', error.message);
        return null;
      }
      
      return data as RewardTracking[];
    } catch (e) {
      console.error('Exception during getRewardsByUser:', (e as Error).message);
      return null;
    }
  }

  public async createReward(reward: Omit<RewardTracking, 'id'>): Promise<RewardTracking | null> {
    return await supabaseClient.create('reward_tracking', reward);
  }

  public async updateReward(id: string, updates: Partial<RewardTracking>): Promise<RewardTracking | null> {
    return await supabaseClient.update('reward_tracking', id, updates);
  }

  public async deleteReward(id: string): Promise<boolean> {
    return await supabaseClient.delete('reward_tracking', id);
  }

  // Agent Activity Methods
  public async getAllActivities(): Promise<AgentActivity[] | null> {
    return await supabaseClient.readAll('agent_activities');
  }

  public async getActivityById(id: string): Promise<AgentActivity | null> {
    return await supabaseClient.readOne('agent_activities', id);
  }

  public async getActivitiesByAgent(agentDid: string): Promise<AgentActivity[] | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('agent_activities')
        .select('*')
        .eq('agent_did', agentDid);
      
      if (error) {
        console.error('Error fetching activities by agent:', error.message);
        return null;
      }
      
      return data as AgentActivity[];
    } catch (e) {
      console.error('Exception during getActivitiesByAgent:', (e as Error).message);
      return null;
    }
  }

  public async createActivity(activity: Omit<AgentActivity, 'id'>): Promise<AgentActivity | null> {
    return await supabaseClient.create('agent_activities', activity);
  }

  public async updateActivity(id: string, updates: Partial<AgentActivity>): Promise<AgentActivity | null> {
    return await supabaseClient.update('agent_activities', id, updates);
  }

  public async deleteActivity(id: string): Promise<boolean> {
    return await supabaseClient.delete('agent_activities', id);
  }

  // Analytics Event Methods
  public async getAllAnalyticsEvents(): Promise<AnalyticsEvent[] | null> {
    return await supabaseClient.readAll('analytics_events');
  }

  public async getAnalyticsEventById(id: string): Promise<AnalyticsEvent | null> {
    return await supabaseClient.readOne('analytics_events', id);
  }

  public async getAnalyticsEventsByUser(userDid: string): Promise<AnalyticsEvent[] | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('analytics_events')
        .select('*')
        .eq('user_did', userDid);
      
      if (error) {
        console.error('Error fetching analytics events by user:', error.message);
        return null;
      }
      
      return data as AnalyticsEvent[];
    } catch (e) {
      console.error('Exception during getAnalyticsEventsByUser:', (e as Error).message);
      return null;
    }
  }

  public async createAnalyticsEvent(event: Omit<AnalyticsEvent, 'id'>): Promise<AnalyticsEvent | null> {
    return await supabaseClient.create('analytics_events', event);
  }

  public async updateAnalyticsEvent(id: string, updates: Partial<AnalyticsEvent>): Promise<AnalyticsEvent | null> {
    return await supabaseClient.update('analytics_events', id, updates);
  }

  public async deleteAnalyticsEvent(id: string): Promise<boolean> {
    return await supabaseClient.delete('analytics_events', id);
  }
}