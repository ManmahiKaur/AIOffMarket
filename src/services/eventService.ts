import type { PropertyEvent } from '../types';
import { supabase } from '../lib/supabase';
import { mapDatabaseEvent } from '../lib/mapping';

export const eventService = {
  async getEvents(eventType?: string): Promise<PropertyEvent[]> {
    let query = supabase
      .from('events')
      .select('*')
      .order('detected_at', { ascending: false });
      
    if (eventType && eventType !== 'ALL') {
      query = query.eq('event_type', eventType);
    }
    
    const { data, error } = await query.range(0, 2999);
      
    if (error) {
      console.error('Error fetching events from live DB:', error);
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
      console.error(`Error fetching events for property ${propertyId} from live DB:`, error);
      return [];
    }
    
    return (data || []).map(mapDatabaseEvent);
  },
};
