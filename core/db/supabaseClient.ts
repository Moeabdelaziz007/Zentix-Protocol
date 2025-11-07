import { createClient, SupabaseClient as SBClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { SupabaseSchema, TableName } from '../types';

dotenv.config({ path: '../../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export class SupabaseClient {
  private client: SBClient | null;
  
  public get clientInstance(): SBClient | null {
    return this.client;
  }

  constructor() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('⚠️  Supabase not configured. Running in mock mode.');
      this.client = null;
    } else {
      this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }

  /**
   * Reads all records from a specified table.
   * @param table The name of the table.
   * @returns An array of records or null on error.
   */
  public async readAll<T extends TableName>(table: T): Promise<SupabaseSchema[T][] | null> {
    if (!this.client) {
      this.log('Supabase not configured, returning null', { table });
      return null;
    }
    try {
      const { data, error } = await this.client.from(table).select('*');
      if (error) {
        this.log('Error reading all records', { table, error: error.message });
        return null;
      }
      return data as SupabaseSchema[T][];
    } catch (e) {
      this.log('Exception during readAll', { table, exception: (e as Error).message });
      return null;
    }
  }

  /**
   * Reads a single record from a specified table by ID.
   * @param table The name of the table.
   * @param id The ID of the record.
   * @returns The record or null if not found or on error.
   */
  public async readOne<T extends TableName>(table: T, id: string): Promise<SupabaseSchema[T] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.from(table).select('*').eq('id', id).single();
      if (error) {
        // Supabase returns an error if no row is found with .single()
        if (error.code === 'PGRST116') { // Specific code for no rows found
            return null;
        }
        this.log('Error reading one record', { table, id, error: error.message });
        return null;
      }
      return data as SupabaseSchema[T];
    } catch (e) {
      this.log('Exception during readOne', { table, id, exception: (e as Error).message });
      return null;
    }
  }

  /**
   * Creates a new record in a specified table.
   * @param table The name of the table.
   * @param record The record data to insert.
   * @returns The created record or null on error.
   */
  public async create<T extends TableName>(table: T, record: Omit<SupabaseSchema[T], 'id'>): Promise<SupabaseSchema[T] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.from(table).insert(record).select().single();
      if (error) {
        this.log('Error creating record', { table, error: error.message });
        return null;
      }
      return data as SupabaseSchema[T];
    } catch (e) {
      this.log('Exception during create', { table, exception: (e as Error).message });
      return null;
    }
  }

  /**
   * Updates an existing record in a specified table by ID.
   * @param table The name of the table.
   * @param id The ID of the record to update.
   * @param updates The partial record data to update.
   * @returns The updated record or null on error.
   */
  public async update<T extends TableName>(table: T, id: string, updates: Partial<SupabaseSchema[T]>): Promise<SupabaseSchema[T] | null> {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.from(table).update(updates).eq('id', id).select().single();
      if (error) {
        this.log('Error updating record', { table, id, error: error.message });
        return null;
      }
      return data as SupabaseSchema[T];
    } catch (e) {
      this.log('Exception during update', { table, id, exception: (e as Error).message });
      return null;
    }
  }

  /**
   * Deletes a record from a specified table by ID.
   * @param table The name of the table.
   * @param id The ID of the record to delete.
   * @returns True if deletion was successful, false on error.
   */
  public async delete(table: TableName, id: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      const { error } = await this.client.from(table).delete().eq('id', id);
      if (error) {
        this.log('Error deleting record', { table, id, error: error.message });
        return false;
      }
      return true;
    } catch (e) {
      this.log('Exception during delete', { table, id, exception: (e as Error).message });
      return false;
    }
  }

  // Placeholder for internal structured logger
  private log(message: string, data: unknown = {}): void {
    // Internal structured logger implementation would go here
  }
}

export const supabaseClient = new SupabaseClient();