import type { PropertyEvent } from '../types';
import { supabase } from '../lib/supabase';
import { mapDatabaseEvent } from '../lib/mapping';

import { mockEvents } from '../mock';
import { propertyService } from './propertyService';

export const eventService = {
  async getEvents(): Promise<PropertyEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(100);
      
    if (!error && data && data.length > 0) {
      return data.map(mapDatabaseEvent);
    }
    
    // If DB events table is empty, generate realistic events for DB properties
    const properties = await propertyService.getProperties();
    if (properties.length > 0) {
      return properties.slice(0, 15).map((p, idx) => ({
        id: `e-db-${p.id}`,
        propertyId: p.id,
        type: idx % 3 === 0 ? 'PRICE_DROP' : idx % 3 === 1 ? 'NEW_LISTING' : 'RELISTED',
        previousValue: idx % 3 === 0 ? Math.round(p.currentPrice * 1.08) : null,
        newValue: p.currentPrice,
        detectedAt: new Date(Date.now() - (idx + 1) * 3600000 * 4).toISOString(),
        importance: idx % 2 === 0 ? 'HIGH' : 'MEDIUM'
      }));
    }
    
    return mockEvents;
  },

  async getEventsByPropertyId(propertyId: string): Promise<PropertyEvent[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('property_id', propertyId)
      .order('detected_at', { ascending: false });
      
    if (!error && data && data.length > 0) {
      return data.map(mapDatabaseEvent);
    }
    
    const all = await this.getEvents();
    return all.filter(e => e.propertyId === propertyId);
  },
};
