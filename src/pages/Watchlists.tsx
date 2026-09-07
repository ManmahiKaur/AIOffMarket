import React, { useState } from 'react';
import { watchlistService } from '../services/watchlistService';
import { propertyService } from '../services/propertyService';
import type { Watchlist, Property } from '../types';
import { Clock, MoreVertical, Building2, Plus, X, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '../utils';
import { useNavigate } from 'react-router-dom';

export const Watchlists: React.FC = () => {
  const navigate = useNavigate();
  const [watchlists, setWatchlists] = useState<Watchlist[]>(() => watchlistService.getWatchlists());
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [watchlistProps, setWatchlistProps] = useState<Property[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  const handleSelectWatchlist = async (list: Watchlist) => {
    setSelectedWatchlist(list);
    const allProps = await propertyService.getProperties();
    const filtered = allProps.filter(p => list.propertyIds.includes(p.id));
    setWatchlistProps(filtered);
  };

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    watchlistService.createWatchlist(newListName.trim(), newListDesc.trim());
    setWatchlists(watchlistService.getWatchlists());
    setNewListName('');
    setNewListDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Watchlists</h1>
          <p className="text-slate-500">Track properties and opportunities important to your acquisition strategy.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm text-sm"
        >
          <Plus size={18} />
          Create Watchlist
        </button>
      </div>

      {/* Watchlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {watchlists.map(list => (
          <div 
            key={list.id} 
            onClick={() => handleSelectWatchlist(list)}
            className={`premium-card hover:border-brand-300 transition-all cursor-pointer group ${
              selectedWatchlist?.id === list.id ? 'border-brand-500 ring-2 ring-brand-500/20' : ''
            }`}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors">{list.name}</h3>
                {list.description && <p className="text-sm text-slate-500">{list.description}</p>}
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50/50 flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Building2 size={16} className="text-slate-400" />
                {list.propertyIds.length} Properties
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Clock size={14} />
                Updated {formatRelativeTime(list.lastUpdated)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Watchlist Detail Panel */}
      {selectedWatchlist && (
        <div className="premium-card p-6 border-brand-200">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{selectedWatchlist.name}</h2>
              <p className="text-sm text-slate-500">{selectedWatchlist.description || 'Properties in this watchlist'}</p>
            </div>
            <button 
              onClick={() => setSelectedWatchlist(null)}
              className="text-slate-400 hover:text-slate-700 text-sm font-medium"
            >
              Close Panel
            </button>
          </div>

          {watchlistProps.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg">
              No properties in this watchlist yet. Add properties from the Opportunity Feed or Property pages.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {watchlistProps.map(prop => (
                <div key={prop.id} className="py-4 flex justify-between items-center hover:bg-slate-50 px-3 rounded-lg transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900">{prop.address}</h3>
                    <p className="text-xs text-slate-500">{prop.suburb} {prop.state} • {prop.type} • {prop.status}</p>
                  </div>
                  <button 
                    onClick={() => navigate(`/properties/${prop.id}`)}
                    className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    View Intelligence <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Watchlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Create Watchlist</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateWatchlist} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Watchlist Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Parramatta Off-Market Targets"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Notes about this watchlist criteria..."
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
