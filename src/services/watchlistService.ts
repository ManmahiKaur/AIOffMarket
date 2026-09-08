import type { Watchlist, Property } from '../types';
import { supabase } from '../lib/supabase';
import { mapDatabaseProperty } from '../lib/mapping';

export const watchlistService = {
  async getWatchlists(): Promise<Watchlist[]> {
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching watchlists:', error);
      return [];
    }

    // Map database snake_case to camelCase and fetch counts
    const watchlists: Watchlist[] = await Promise.all(
      (data || []).map(async (w: any) => {
        let matchingCount = 0;
        
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_watchlist_matches', {
            p_location: w.location || null,
            p_event_types: w.event_types && w.event_types.length > 0 ? w.event_types : null,
            p_minimum_score: w.minimum_score !== null ? w.minimum_score : null
          });
          
          if (!rpcError && rpcData !== null) {
            matchingCount = Number(rpcData);
          }
        } catch (err) {
          console.error('Error fetching match count:', err);
        }

        return {
          id: w.id,
          name: w.name,
          description: w.description,
          location: w.location,
          eventTypes: w.event_types || [],
          minimumScore: w.minimum_score !== null ? Number(w.minimum_score) : undefined,
          matchingCount,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
        };
      })
    );

    return watchlists;
  },

  async createWatchlist(watchlist: Partial<Watchlist>): Promise<Watchlist | null> {
    const { data, error } = await supabase
      .from('watchlists')
      .insert([
        {
          name: watchlist.name,
          description: watchlist.description,
          location: watchlist.location,
          event_types: watchlist.eventTypes,
          minimum_score: watchlist.minimumScore,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating watchlist:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      location: data.location,
      eventTypes: data.event_types || [],
      minimumScore: data.minimum_score !== null ? Number(data.minimum_score) : undefined,
      matchingCount: 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async updateWatchlist(id: string, watchlist: Partial<Watchlist>): Promise<Watchlist | null> {
    const updateData: any = {};
    if (watchlist.name !== undefined) updateData.name = watchlist.name;
    if (watchlist.description !== undefined) updateData.description = watchlist.description;
    if (watchlist.location !== undefined) updateData.location = watchlist.location;
    if (watchlist.eventTypes !== undefined) updateData.event_types = watchlist.eventTypes;
    if (watchlist.minimumScore !== undefined) updateData.minimum_score = watchlist.minimumScore;

    const { data, error } = await supabase
      .from('watchlists')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating watchlist:', error);
      throw error;
    }
    
    let matchingCount = 0;
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_watchlist_matches', {
        p_location: data.location || null,
        p_event_types: data.event_types && data.event_types.length > 0 ? data.event_types : null,
        p_minimum_score: data.minimum_score !== null ? data.minimum_score : null
      });
      if (!rpcError && rpcData !== null) matchingCount = Number(rpcData);
    } catch (err) {}

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      location: data.location,
      eventTypes: data.event_types || [],
      minimumScore: data.minimum_score !== null ? Number(data.minimum_score) : undefined,
      matchingCount,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async deleteWatchlist(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting watchlist:', error);
      throw error;
    }

    return true;
  },
  
  async getMatchingProperties(watchlist: Watchlist): Promise<Property[]> {
    // This replicates the logic of get_watchlist_matches but returns properties
    let query = supabase.from('properties').select('*, events!inner(event_type), opportunity_scores!inner(score)');
    
    if (watchlist.location) {
       query = query.ilike('suburb_name', `%${watchlist.location}%`);
    }
    
    if (watchlist.eventTypes && watchlist.eventTypes.length > 0) {
       query = query.in('events.event_type', watchlist.eventTypes);
    }
    
    if (watchlist.minimumScore !== undefined && watchlist.minimumScore !== null) {
       query = query.gte('opportunity_scores.score', watchlist.minimumScore / 100.0);
    }
    
    const { data, error } = await query.limit(50);
    
    if (error) {
      console.error('Error fetching matching properties:', error);
      return [];
    }
    
    return (data || []).map(mapDatabaseProperty);
  }
};
