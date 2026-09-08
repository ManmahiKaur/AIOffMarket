import React, { useEffect, useState } from 'react';
import { opportunityService } from '../services/opportunityService';
import { OpportunityCard } from '../components/OpportunityCard';
import type { ResolvedOpportunity } from '../services/opportunityService';
import { SlidersHorizontal } from 'lucide-react';

export const OpportunityFeed: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ResolvedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'new'>('all');
  const [eventTypes, setEventTypes] = useState<string[]>(['NEW_LISTING', 'WITHDRAWN', 'RELISTED', 'SOLD']);
  const [minScore, setMinScore] = useState<number>(0);
  const [location, setLocation] = useState<string>('All Locations');

  const fetchData = async () => {
    setLoading(true);
    try {
      let finalMinScore = minScore;
      if (activeTab === 'high') finalMinScore = Math.max(finalMinScore, 80);

      const resolved = await opportunityService.getOpportunities({
        eventTypes,
        minScore: finalMinScore / 100 // db score is 0-1
      });

      // We handle 'new' purely on frontend for the POC if needed, or backend
      if (activeTab === 'new') {
        const today = new Date();
        const filtered = resolved.filter(opp => {
          const detectDate = new Date(opp.event.detectedAt);
          return detectDate.toDateString() === today.toDateString();
        });
        setOpportunities(filtered);
      } else {
        setOpportunities(resolved);
      }
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleResetFilters = () => {
    setEventTypes(['NEW_LISTING', 'WITHDRAWN', 'RELISTED', 'SOLD']);
    setMinScore(0);
    setLocation('All Locations');
    setActiveTab('all');
    // useEffect will trigger fetchData via activeTab change, or if it doesn't change, we call it manually
    setTimeout(fetchData, 0);
  };

  const toggleEventType = (type: string) => {
    setEventTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Opportunity Feed</h1>
        <p className="text-slate-500">AI-ranked property events matching your monitoring criteria.</p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Filters Panel */}
        <div className="w-64 shrink-0 bg-white p-5 rounded-xl border border-slate-200 sticky top-24 hidden lg:block">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-6">
            <SlidersHorizontal size={18} />
            Filters
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm disabled:opacity-50"
                value={location}
                onChange={e => setLocation(e.target.value)}
                disabled
                title="Location filtering coming soon"
              >
                <option>All Locations</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Event Type</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded text-brand-600" 
                    checked={eventTypes.includes('NEW_LISTING')} 
                    onChange={() => toggleEventType('NEW_LISTING')} /> New Listing
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded text-brand-600" 
                    checked={eventTypes.includes('WITHDRAWN')} 
                    onChange={() => toggleEventType('WITHDRAWN')} /> Listing Withdrawn
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded text-brand-600" 
                    checked={eventTypes.includes('RELISTED')} 
                    onChange={() => toggleEventType('RELISTED')} /> Relisted
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded text-brand-600" 
                    checked={eventTypes.includes('SOLD')} 
                    onChange={() => toggleEventType('SOLD')} /> Sold
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Min Score ({minScore})
              </label>
              <input type="range" min="0" max="100" className="w-full accent-brand-600" 
                value={minScore} 
                onChange={e => setMinScore(parseInt(e.target.value))} />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button 
              onClick={handleApplyFilters}
              className="w-full py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Apply Filters
            </button>
            <button 
              onClick={handleResetFilters}
              className="w-full mt-2 py-2 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200 pb-px">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-1 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'all' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              All Opportunities
            </button>
            <button 
              onClick={() => setActiveTab('high')}
              className={`px-1 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'high' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              High Priority (&ge; 80)
            </button>
            <button 
              onClick={() => setActiveTab('new')}
              className={`px-1 py-3 border-b-2 font-medium text-sm transition-colors ${activeTab === 'new' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              New Today
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
              No opportunities found matching your criteria.
            </div>
          ) : (
            opportunities.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
