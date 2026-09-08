import { liveDb } from '../lib/dbClient';

export interface DashboardMetrics {
  propertiesMonitored: number;
  newEvents24h: number;
  highPriority: number;
  watchlistMatches: number;
}

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const { count: propertiesCount } = await liveDb
      .from('properties')
      .select('*', { count: 'exact', head: true });
      
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { count: eventsCount } = await liveDb
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('detected_at', oneDayAgo);
      
    const { count: highPriorityCount } = await liveDb
      .from('opportunity_scores')
      .select('*', { count: 'exact', head: true })
      .gte('score', 0.8);
      
    const { count: watchlistMatches } = await liveDb
      .from('watchlist_items')
      .select('*', { count: 'exact', head: true })
      .gte('added_at', oneDayAgo);

    return {
      propertiesMonitored: propertiesCount || 0,
      newEvents24h: eventsCount || 0,
      highPriority: highPriorityCount || 0,
      watchlistMatches: watchlistMatches || 0,
    };
  },

  async getActivityChartData() {
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
    const { data } = await liveDb
      .from('events')
      .select('event_type')
      .limit(100);
      
    const dist: Record<string, number> = {};
    if (data) {
      data.forEach((e: any) => {
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
