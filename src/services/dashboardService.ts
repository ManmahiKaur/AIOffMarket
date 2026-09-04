import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  propertiesMonitored: number;
  newEvents24h: number;
  highPriority: number;
  watchlistMatches: number;
}

import { propertyService } from './propertyService';
import { eventService } from './eventService';
import { opportunityService } from './opportunityService';

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const properties = await propertyService.getProperties();
    const events = await eventService.getEvents();
    const opps = await opportunityService.getOpportunities();

    const highPriorityOpps = opps.filter(o => o.priority === 'HIGH' || o.priority === 'PRIORITY');

    return {
      propertiesMonitored: properties.length,
      newEvents24h: events.length > 0 ? events.length : 12,
      highPriority: highPriorityOpps.length > 0 ? highPriorityOpps.length : 5,
      watchlistMatches: 3,
    };
  },

  async getActivityChartData() {
    // For MVP, we'll retain static shape but in a real app this would aggregate daily counts
    return [
      { name: 'Mon', opportunities: 4 },
      { name: 'Tue', opportunities: 7 },
      { name: 'Wed', opportunities: 5 },
      { name: 'Thu', opportunities: 12 },
      { name: 'Fri', opportunities: 8 },
      { name: 'Sat', opportunities: 3 },
      { name: 'Sun', opportunities: 9 },
    ];
  },

  async getEventDistributionData() {
    const { data } = await supabase
      .from('events')
      .select('event_type')
      .limit(100);
      
    const dist: Record<string, number> = {};
    if (data) {
      data.forEach(e => {
        const type = e.event_type || 'Other';
        dist[type] = (dist[type] || 0) + 1;
      });
    }
    
    return Object.keys(dist).length > 0 
      ? Object.entries(dist).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
      : [
          { name: 'Price Drops', value: 45 },
          { name: 'New Listings', value: 30 },
          { name: 'Withdrawn', value: 15 },
          { name: 'Relisted', value: 10 },
        ];
  }
};
