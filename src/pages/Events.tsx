import React, { useEffect, useState } from 'react';
import { eventService } from '../services/eventService';
import { propertyService } from '../services/propertyService';
import type { PropertyEvent, Property } from '../types';
import { formatCurrency, formatRelativeTime, cn } from '../utils';
import { TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const getEventIcon = (type: string) => {
  switch (type) {
    case 'PRICE_DROP': return <TrendingDown className="text-destructive" size={16} />;
    case 'PRICE_INCREASE': return <TrendingUp className="text-amber-500" size={16} />;
    case 'NEW_LISTING': return <AlertCircle className="text-brand-500" size={16} />;
    case 'LISTING_WITHDRAWN': return <AlertCircle className="text-slate-500" size={16} />;
    case 'RELISTED': return <AlertCircle className="text-blue-500" size={16} />;
    default: return <AlertCircle size={16} />;
  }
};

const getEventLabel = (type: string) => type.replace('_', ' ');

export const Events: React.FC = () => {
  const [events, setEvents] = useState<(PropertyEvent & { property: Property })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const evts = await eventService.getEvents();
        const props = await propertyService.getProperties();
        
        const enrichedEvents = evts.map(e => ({
          ...e,
          property: props.find(p => p.id === e.propertyId)!
        })).filter(e => e.property);
        
        setEvents(enrichedEvents);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Property Events</h1>
        <p className="text-slate-500">Monitor all detected changes across properties.</p>
      </div>

      {/* Filters (Mock) */}
      <div className="flex gap-4 border-b border-slate-200 pb-px overflow-x-auto">
        <button className="px-4 py-3 border-b-2 border-brand-600 text-brand-700 font-medium text-sm whitespace-nowrap">
          All Events
        </button>
        <button className="px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
          Price Changes
        </button>
        <button className="px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
          New Listings
        </button>
        <button className="px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
          Withdrawals
        </button>
        <button className="px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 font-medium text-sm whitespace-nowrap">
          Relistings
        </button>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading events...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4 pl-6">Event</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Previous Value</th>
                  <th className="p-4">New Value</th>
                  <th className="p-4">Detected</th>
                  <th className="p-4 pr-6">Importance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No events found.
                    </td>
                  </tr>
                ) : (
                  events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        {getEventIcon(evt.type)}
                        {getEventLabel(evt.type)}
                      </div>
                    </td>
                    <td className="p-4">
                      <Link to={`/properties/${evt.property.id}`} className="font-medium text-slate-900 hover:text-brand-600 transition-colors">
                        {evt.property.address}
                      </Link>
                      <div className="text-xs text-slate-500">{evt.property.suburb}</div>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {typeof evt.previousValue === 'number' ? formatCurrency(evt.previousValue) : evt.previousValue || '-'}
                    </td>
                    <td className="p-4 font-medium text-slate-900 text-sm">
                      {typeof evt.newValue === 'number' ? formatCurrency(evt.newValue) : evt.newValue || '-'}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {formatRelativeTime(evt.detectedAt)}
                    </td>
                    <td className="p-4 pr-6">
                      <span className={cn(
                        "inline-flex px-2.5 py-1 rounded-md text-xs font-bold",
                        evt.importance === 'HIGH' ? "bg-red-50 text-red-700" :
                        evt.importance === 'MEDIUM' ? "bg-amber-50 text-amber-700" :
                        "bg-blue-50 text-blue-700"
                      )}>
                        {evt.importance}
                      </span>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
