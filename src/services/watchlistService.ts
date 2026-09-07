import type { Watchlist } from '../types';
import { mockWatchlists } from '../mock';

const WATCHLIST_STORAGE_KEY = 'ai_offmarket_watchlists';

export const watchlistService = {
  getWatchlists(): Watchlist[] {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading watchlists from storage', e);
    }
    // Default initial watchlists
    this.saveWatchlists(mockWatchlists);
    return mockWatchlists;
  },

  saveWatchlists(watchlists: Watchlist[]): void {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlists));
    } catch (e) {
      console.error('Error saving watchlists to storage', e);
    }
  },

  createWatchlist(name: string, description?: string): Watchlist {
    const watchlists = this.getWatchlists();
    const newList: Watchlist = {
      id: `wl-${Date.now()}`,
      name,
      description: description || '',
      propertyIds: [],
      lastUpdated: new Date().toISOString()
    };
    watchlists.push(newList);
    this.saveWatchlists(watchlists);
    return newList;
  },

  addPropertyToWatchlist(watchlistId: string, propertyId: string): boolean {
    const watchlists = this.getWatchlists();
    const target = watchlists.find(w => w.id === watchlistId);
    if (!target) return false;

    if (!target.propertyIds.includes(propertyId)) {
      target.propertyIds.push(propertyId);
      target.lastUpdated = new Date().toISOString();
      this.saveWatchlists(watchlists);
    }
    return true;
  },

  removePropertyFromWatchlist(watchlistId: string, propertyId: string): boolean {
    const watchlists = this.getWatchlists();
    const target = watchlists.find(w => w.id === watchlistId);
    if (!target) return false;

    target.propertyIds = target.propertyIds.filter(id => id !== propertyId);
    target.lastUpdated = new Date().toISOString();
    this.saveWatchlists(watchlists);
    return true;
  },

  isPropertyInAnyWatchlist(propertyId: string): boolean {
    const watchlists = this.getWatchlists();
    return watchlists.some(w => w.propertyIds.includes(propertyId));
  },

  getWatchlistsForProperty(propertyId: string): Watchlist[] {
    const watchlists = this.getWatchlists();
    return watchlists.filter(w => w.propertyIds.includes(propertyId));
  }
};
