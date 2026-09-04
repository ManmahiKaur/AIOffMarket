import React from 'react';
import { mockWatchlists } from '../mock';
import { Clock, MoreVertical, Building2 } from 'lucide-react';
import { formatRelativeTime } from '../utils';

export const Watchlists: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Watchlists</h1>
          <p className="text-slate-500">Track properties and opportunities important to you.</p>
        </div>
        <button className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors">
          Create Watchlist
        </button>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700 font-medium">
              Note: This feature is currently using mock data. Full database connection for Watchlists is pending.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockWatchlists.map(list => (
          <div key={list.id} className="premium-card hover:border-brand-300 transition-colors cursor-pointer group">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-brand-600 transition-colors">{list.name}</h3>
                {list.description && <p className="text-sm text-slate-500">{list.description}</p>}
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreVertical size={20} />
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
    </div>
  );
};
