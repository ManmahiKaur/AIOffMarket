import type { Property } from '../types';
import { supabase } from '../lib/supabase';
import { mapDatabaseProperty } from '../lib/mapping';

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    try {
      // Parallel batch fetching to retrieve all 2,600+ records from live database
      const [b1, b2, b3] = await Promise.all([
        supabase.from('properties').select('*').order('created_at', { ascending: false }).range(0, 999),
        supabase.from('properties').select('*').order('created_at', { ascending: false }).range(1000, 1999),
        supabase.from('properties').select('*').order('created_at', { ascending: false }).range(2000, 3999),
      ]);

      const allData = [
        ...(b1.data || []),
        ...(b2.data || []),
        ...(b3.data || []),
      ];

      return allData.map(mapDatabaseProperty);
    } catch (err) {
      console.error('Error fetching all properties from live DB:', err);
      const { data } = await supabase.from('properties').select('*').range(0, 2999);
      return (data || []).map(mapDatabaseProperty);
    }
  },

  async getPropertyById(id: string): Promise<Property | undefined> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .limit(1);
      
    if (error || !data || data.length === 0) {
      console.error(`Error fetching property ${id} from live DB:`, error);
      return undefined;
    }
    
    return mapDatabaseProperty(data[0]);
  },

  async searchProperties(query: string): Promise<Property[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`address.ilike.${lowerQuery},suburb_name.ilike.${lowerQuery}`)
      .range(0, 2999);
      
    if (error) {
      console.error('Error searching properties in live DB:', error);
      return [];
    }
    
    return (data || []).map(mapDatabaseProperty);
  },
};
