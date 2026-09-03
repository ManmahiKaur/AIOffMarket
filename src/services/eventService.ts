import type { PropertyEvent } from '../types';
import { supabase } from '../lib/supabase';
import { mapDatabaseEvent } from '../lib/mapping';

export const eventService = {
  async getEvents(): Promise<PropertyEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(100);
      
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    return (data || []).map(mapDatabaseEvent);
  },

  async getEventsByPropertyId(propertyId: string): Promise<PropertyEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('property_id', propertyId)
      .order('detected_at', { ascending: false });
      
    if (error) {
      console.error(`Error fetching events for property ${propertyId}:`, error);
      return [];
    }
    
    return (data || []).map(mapDatabaseEvent);
  },
};
