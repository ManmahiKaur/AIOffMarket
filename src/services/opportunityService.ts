import type { Opportunity } from '../types';
import { supabase } from '../lib/supabase';
import { mapDatabaseOpportunity } from '../lib/mapping';

import { mockOpportunities } from '../mock';
import { propertyService } from './propertyService';
import { eventService } from './eventService';

export const opportunityService = {
  async getOpportunities(): Promise<Opportunity[]> {
    // 1. Fetch scores
    const { data: scores, error: scoreErr } = await supabase
      .from('opportunity_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(20);
      
    if (!scoreErr && scores && scores.length > 0) {
      // Fetch associated events
      const propertyIds = scores.map(s => s.property_id);
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .in('property_id', propertyIds);
        
      const eventIds = (events || []).map(e => e.id);
      const { data: explanations } = eventIds.length > 0 
        ? await supabase.from('ai_explanations').select('*').in('event_id', eventIds)
        : { data: [] };
        
      const scoreIds = scores.map(s => s.id);
      const { data: factors } = scoreIds.length > 0
        ? await supabase.from('score_factors').select('*').in('score_id', scoreIds)
        : { data: [] };

      const opportunities: Opportunity[] = [];
      
      for (const score of scores) {
        const propEvents = (events || []).filter(e => e.property_id === score.property_id);
        const latestEvent = propEvents.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime())[0];
        
        if (!latestEvent) continue; 
        
        const explanation = (explanations || []).find(e => e.event_id === latestEvent.id);
        const scoreFactors = (factors || []).filter(f => f.score_id === score.id);
        
        opportunities.push(mapDatabaseOpportunity(latestEvent, score, explanation, scoreFactors));
      }
      
      if (opportunities.length > 0) return opportunities;
    }
    
    // Generate opportunities dynamically from properties & events if DB opportunity_scores table is empty
    const events = await eventService.getEvents();
    if (events.length > 0) {
      return events.map((ev, idx) => {
        const baseScore = Math.max(65, 95 - idx * 2);
        return {
          id: `opp-gen-${ev.id}`,
          propertyId: ev.propertyId,
          eventId: ev.id,
          score: baseScore,
          priority: baseScore >= 85 ? 'HIGH' : baseScore >= 75 ? 'MODERATE' : 'LOW',
          signals: [
            {
              id: `sig-1-${ev.id}`,
              propertyId: ev.propertyId,
              eventId: ev.id,
              type: ev.type as any,
              label: ev.type === 'PRICE_DROP' ? 'Price Reduction' : 'New Listing Event',
              description: ev.type === 'PRICE_DROP' ? 'Recent price reduction detected.' : 'New market activity detected.',
              impact: baseScore >= 85 ? 'HIGH' : 'MEDIUM'
            }
          ],
          aiSummary: {
            overview: `Detected ${ev.type.replace('_', ' ').toLowerCase()} event for property. Strong signal alignment with market conditions.`,
            keyReasons: ['Price reduction analysis', 'Suburb growth trends'],
            confidence: baseScore >= 85 ? 'HIGH' : 'MEDIUM',
            suggestedAction: 'Review property details and perform buyer evaluation.'
          },
          detectedAt: ev.detectedAt
        };
      });
    }

    return mockOpportunities;
  },

  async getOpportunityById(id: string): Promise<Opportunity | undefined> {
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .limit(1);
    if (!events || events.length === 0) return undefined;
    const event = events[0];
    
    const { data: scores } = await supabase
      .from('opportunity_scores')
      .select('*')
      .eq('property_id', event.property_id)
      .order('computed_at', { ascending: false })
      .limit(1);
    const score = scores?.[0];
    
    const { data: explanations } = await supabase
      .from('ai_explanations')
      .select('*')
      .eq('event_id', event.id)
      .limit(1);
    const explanation = explanations?.[0];
    
    const { data: factors } = score 
      ? await supabase.from('score_factors').select('*').eq('score_id', score.id)
      : { data: [] };
    
    return mapDatabaseOpportunity(event, score, explanation, factors || []);
  },

  async getOpportunitiesByPropertyId(propertyId: string): Promise<Opportunity[]> {
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('property_id', propertyId);
    if (!events || events.length === 0) return [];
    
    const { data: scores } = await supabase
      .from('opportunity_scores')
      .select('*')
      .eq('property_id', propertyId);
    
    const eventIds = events.map(e => e.id);
    const { data: explanations } = eventIds.length > 0 
      ? await supabase.from('ai_explanations').select('*').in('event_id', eventIds)
      : { data: [] };
      
    const scoreIds = (scores || []).map(s => s.id);
    const { data: factors } = scoreIds.length > 0 
      ? await supabase.from('score_factors').select('*').in('score_id', scoreIds)
      : { data: [] };

    return events.map(event => {
      const score = (scores || []).sort((a, b) => new Date(b.computed_at).getTime() - new Date(a.computed_at).getTime())[0];
      const explanation = (explanations || []).find(e => e.event_id === event.id);
      const scoreFactors = score ? (factors || []).filter(f => f.score_id === score.id) : [];
      return mapDatabaseOpportunity(event, score, explanation, scoreFactors);
    });
  }
};
