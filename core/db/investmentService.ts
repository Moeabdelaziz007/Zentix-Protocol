import { supabaseClient } from './supabaseClient';
import { MicroInvestment } from '../types';

export class InvestmentService {
  private static instance: InvestmentService;

  private constructor() {}

  public static getInstance(): InvestmentService {
    if (!InvestmentService.instance) {
      InvestmentService.instance = new InvestmentService();
    }
    return InvestmentService.instance;
  }

  // Micro Investment Methods
  public async getAllInvestments(): Promise<MicroInvestment[] | null> {
    return await supabaseClient.readAll('micro_investments');
  }

  public async getInvestmentById(id: string): Promise<MicroInvestment | null> {
    return await supabaseClient.readOne('micro_investments', id);
  }

  public async getInvestmentsByUser(userDid: string): Promise<MicroInvestment[] | null> {
    if (!supabaseClient.clientInstance) return null;
    try {
      const { data, error } = await supabaseClient.clientInstance
        .from('micro_investments')
        .select('*')
        .eq('user_did', userDid);
      
      if (error) {
        console.error('Error fetching investments by user:', error.message);
        return null;
      }
      
      return data as MicroInvestment[];
    } catch (e) {
      console.error('Exception during getInvestmentsByUser:', (e as Error).message);
      return null;
    }
  }

  public async createInvestment(investment: Omit<MicroInvestment, 'id'>): Promise<MicroInvestment | null> {
    return await supabaseClient.create('micro_investments', investment);
  }

  public async updateInvestment(id: string, updates: Partial<MicroInvestment>): Promise<MicroInvestment | null> {
    return await supabaseClient.update('micro_investments', id, updates);
  }

  public async deleteInvestment(id: string): Promise<boolean> {
    return await supabaseClient.delete('micro_investments', id);
  }
}