import type { Property } from '../types';
import { supabase } from '../lib/supabase';
import { mapDatabaseProperty } from '../lib/mapping';

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
      
    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }
    
    return (data || []).map(mapDatabaseProperty);
  },

  async getPropertyById(id: string): Promise<Property | undefined> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .limit(1);
      
    if (error || !data || data.length === 0) {
      console.error(`Error fetching property ${id}:`, error);
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
      .limit(50);
      
    if (error) {
      console.error('Error searching properties:', error);
      return [];
    }
    
    return (data || []).map(mapDatabaseProperty);
  },
};
