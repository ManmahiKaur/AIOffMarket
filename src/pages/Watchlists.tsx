import React, { useState, useEffect } from 'react';
import type { Watchlist, EventType } from '../types';
import { watchlistService } from '../services/watchlistService';
import { Clock, MoreVertical, Building2, Plus, X, AlertCircle } from 'lucide-react';
import { formatRelativeTime } from '../utils';

export const Watchlists: React.FC = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [minimumScore, setMinimumScore] = useState<number | ''>('');

  const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
    { value: 'NEW_LISTING', label: 'New Listing' },
    { value: 'PRICE_DROP', label: 'Price Drop' },
    { value: 'PRICE_INCREASE', label: 'Price Increase' },
    { value: 'LISTING_WITHDRAWN', label: 'Withdrawn' },
    { value: 'RELISTED', label: 'Relisted' },
  ];

  const fetchWatchlists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await watchlistService.getWatchlists();
      setWatchlists(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load watchlists. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setLocation('');
    setEventTypes([]);
    setMinimumScore('');
    setEditingId(null);
  };

  const handleOpenModal = (watchlist?: Watchlist) => {
    if (watchlist) {
      setEditingId(watchlist.id);
      setName(watchlist.name);
      setDescription(watchlist.description || '');
      setLocation(watchlist.location || '');
      setEventTypes(watchlist.eventTypes || []);
      setMinimumScore(watchlist.minimumScore ?? '');
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name,
        description: description || undefined,
        location: location || undefined,
        eventTypes: eventTypes.length > 0 ? eventTypes : undefined,
        minimumScore: minimumScore !== '' ? Number(minimumScore) : undefined,
      };

      if (editingId) {
        await watchlistService.updateWatchlist(editingId, payload);
      } else {
        await watchlistService.createWatchlist(payload);
      }
      
      await fetchWatchlists();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving the watchlist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this watchlist?')) {
      try {
        await watchlistService.deleteWatchlist(id);
        await fetchWatchlists();
      } catch (err) {
        alert('Failed to delete watchlist.');
      }
    }
  };

  const toggleEventType = (type: EventType) => {
    setEventTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Watchlists</h1>
          <p className="text-slate-500">Track properties and opportunities important to you.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Watchlist
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-xl border border-slate-200"></div>
          ))}
        </div>
      ) : watchlists.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
          <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No watchlists found</h3>
          <p className="text-slate-500 mb-6">Create a watchlist to start monitoring specific properties.</p>
          <button 
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-brand-100 text-brand-700 font-medium rounded-lg hover:bg-brand-200 transition-colors"
          >
            Create Your First Watchlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlists.map(list => (
            <div 
              key={list.id} 
              className="premium-card hover:border-brand-300 transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => {
                // In a real app this would navigate, e.g. navigate(`/opportunities?watchlist=${list.id}`)
                alert(`Viewing matching properties for ${list.name} (ID: ${list.id}) is pending implementation in the feed.`);
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">{list.name}</h3>
                  <div className="relative group/menu">
                    <button 
                      className="text-slate-400 hover:text-slate-600 p-1 -m-1 rounded-full hover:bg-slate-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // A proper popover menu should go here. For simplicity, we just use buttons in a hover dropdown
                      }}
                    >
                      <MoreVertical size={20} />
                    </button>
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(list); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => handleDelete(list.id, e)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                {list.description && <p className="text-sm text-slate-500 line-clamp-2 mb-4">{list.description}</p>}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {list.location && <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">📍 {list.location}</span>}
                  {list.minimumScore && <span className="inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">⭐ {list.minimumScore}+ Score</span>}
                  {list.eventTypes && list.eventTypes.length > 0 && <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">{list.eventTypes.length} Events</span>}
                </div>
              </div>
              
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center text-sm rounded-b-xl">
                <div className="flex items-center gap-2 text-brand-600 font-semibold">
                  <Building2 size={16} />
                  {list.matchingCount || 0} Opportunities
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                  <Clock size={14} />
                  {formatRelativeTime(list.updatedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Watchlist' : 'Create Watchlist'}</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Watchlist Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="e.g. Parramatta Opportunities"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="Optional details..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Suburb</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="e.g. Parramatta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Event Types</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPE_OPTIONS.map(option => {
                    const isSelected = eventTypes.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleEventType(option.value)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors border ${
                          isSelected 
                            ? 'bg-brand-50 border-brand-200 text-brand-700 font-medium' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Opportunity Score (0-100)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={minimumScore}
                  onChange={e => setMinimumScore(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="e.g. 75"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !name.trim()}
                  className="px-5 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Watchlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
