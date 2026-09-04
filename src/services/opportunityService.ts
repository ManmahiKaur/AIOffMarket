import type { Opportunity, Property, PropertyEvent } from '../types';
import { supabase } from '../lib/supabase';
import { mapDatabaseOpportunity, mapDatabaseProperty, mapDatabaseEvent } from '../lib/mapping';

export interface ResolvedOpportunity extends Opportunity {
  property: Property;
  event: PropertyEvent;
}

export const opportunityService = {
  async getOpportunities(): Promise<ResolvedOpportunity[]> {
    // 1. Fetch top scores
    const { data: scores, error: scoreErr } = await supabase
      .from('opportunity_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(20);
      
    if (scoreErr || !scores || scores.length === 0) return [];
    
    // 2. Fetch associated properties and events
    const propertyIds = scores.map(s => s.property_id);
    const { data: dbProperties } = await supabase
      .from('properties')
      .select('*')
      .in('id', propertyIds);
      
    const { data: dbEvents } = await supabase
      .from('events')
      .select('*')
      .in('property_id', propertyIds);
      
    // 3. Fetch score_factors
    const scoreIds = scores.map(s => s.id);
    const { data: factors } = scoreIds.length > 0
      ? await supabase.from('score_factors').select('*').in('score_id', scoreIds)
      : { data: [] };

    const resolvedOpportunities: ResolvedOpportunity[] = [];
    const props = (dbProperties || []).map(mapDatabaseProperty);
    
    for (const score of scores) {
      // Find latest event for this property
      const propEvents = (dbEvents || []).filter(e => e.property_id === score.property_id);
      const latestEvent = propEvents.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime())[0];
      
      const prop = props.find(p => p.id === score.property_id.toString());
      
      if (!latestEvent || !prop) continue; 
      
      const scoreFactors = (factors || []).filter(f => f.score_id === score.id);
      
      const baseOpp = mapDatabaseOpportunity(latestEvent, score, null, scoreFactors);
      const mappedEvent = mapDatabaseEvent(latestEvent);
      
      resolvedOpportunities.push({
        ...baseOpp,
        property: prop,
        event: mappedEvent
      });
    }
    
    return resolvedOpportunities;
  },

  async getOpportunityById(id: string): Promise<Opportunity | undefined> {
    const { data: events } = await supabase.from('events').select('*').eq('id', id).limit(1);
    if (!events || events.length === 0) return undefined;
    const event = events[0];
    
    const { data: scores } = await supabase.from('opportunity_scores').select('*').eq('property_id', event.property_id).order('computed_at', { ascending: false }).limit(1);
    const score = scores?.[0];
    
    const { data: explanations } = await supabase.from('ai_explanations').select('*').eq('event_id', event.id).limit(1);
    const explanation = explanations?.[0];
    
    const { data: factors } = score 
      ? await supabase.from('score_factors').select('*').eq('score_id', score.id) 
      : { data: [] };
    
    return mapDatabaseOpportunity(event, score, explanation, factors || []);
  },

  async getOpportunitiesByPropertyId(propertyId: string): Promise<Opportunity[]> {
    const { data: events } = await supabase.from('events').select('*').eq('property_id', propertyId);
    if (!events || events.length === 0) return [];
    
    const { data: scores } = await supabase.from('opportunity_scores').select('*').eq('property_id', propertyId);
    
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
