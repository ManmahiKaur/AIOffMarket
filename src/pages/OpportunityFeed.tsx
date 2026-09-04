import React, { useEffect, useState } from 'react';
import { opportunityService } from '../services/opportunityService';
import { propertyService } from '../services/propertyService';
import { eventService } from '../services/eventService';
import { OpportunityCard } from '../components/OpportunityCard';
import type { ResolvedOpportunity } from '../components/OpportunityCard';
import { SlidersHorizontal } from 'lucide-react';

export const OpportunityFeed: React.FC = () => {
  const [opportunities, setOpportunities] = useState<ResolvedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const opps = await opportunityService.getOpportunities();
        const props = await propertyService.getProperties();
        const events = await eventService.getEvents();

        const resolved = opps.map(opp => ({
          ...opp,
          property: props.find(p => p.id === opp.propertyId)!,
          event: events.find(e => e.id === opp.eventId)!,
        })).filter(o => o.property && o.event);

        setOpportunities(resolved);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Opportunity Feed</h1>
        <p className="text-slate-500">AI-ranked property events matching your monitoring criteria.</p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Filters Panel - Simplified for POC */}
        <div className="w-64 shrink-0 bg-white p-5 rounded-xl border border-slate-200 sticky top-24 hidden lg:block">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-6">
            <SlidersHorizontal size={18} />
            Filters
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm">
                <option>All Locations</option>
                <option>Parramatta NSW</option>
                <option>Chatswood NSW</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Event Type</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded text-brand-600" defaultChecked /> Price Drops
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded text-brand-600" defaultChecked /> Listing Withdrawn
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded text-brand-600" defaultChecked /> Relisted
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Score Range</label>
              <input type="range" min="0" max="100" className="w-full accent-brand-600" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button className="w-full py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
              Apply Filters
            </button>
            <button className="w-full mt-2 py-2 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors">
              Reset Filters
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200 pb-px">
            <button className="px-1 py-3 border-b-2 border-brand-600 text-brand-700 font-medium text-sm">
              All Opportunities
            </button>
            <button className="px-1 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm">
              High Priority
            </button>
            <button className="px-1 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm">
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
