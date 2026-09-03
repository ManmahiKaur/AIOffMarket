import React from 'react';
import type { Opportunity, Property, PropertyEvent } from '../types';
import { formatCurrency, formatRelativeTime } from '../utils';
import { useNavigate } from 'react-router-dom';
import { Flame, BrainCircuit, CheckCircle2, ChevronRight, MapPin, Building2, TrendingDown, TrendingUp, AlertCircle, BookmarkPlus } from 'lucide-react';

export interface ResolvedOpportunity extends Opportunity {
  property: Property;
  event: PropertyEvent;
}

interface OpportunityCardProps {
  opportunity: ResolvedOpportunity;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'PRICE_DROP': return <TrendingDown className="text-destructive" size={20} />;
    case 'PRICE_INCREASE': return <TrendingUp className="text-amber-500" size={20} />;
    case 'NEW_LISTING': return <AlertCircle className="text-brand-500" size={20} />;
    case 'LISTING_WITHDRAWN': return <AlertCircle className="text-slate-500" size={20} />;
    case 'RELISTED': return <AlertCircle className="text-blue-500" size={20} />;
    default: return <AlertCircle size={20} />;
  }
};

const getEventLabel = (type: string) => {
  return type.replace('_', ' ');
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const navigate = useNavigate();
  const { property, event, score, priority, signals, aiSummary } = opportunity;

  return (
    <div className="premium-card p-6 hover:border-brand-300 transition-colors cursor-pointer" onClick={() => navigate(`/properties/${property.id}`)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {priority === 'PRIORITY' || priority === 'HIGH' ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold tracking-wide">
              <Flame size={14} />
              {priority} PRIORITY
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wide">
              {priority}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold tracking-wide">
            SCORE {score}/100
          </div>
        </div>
        <div className="text-sm text-slate-500">
          Detected {formatRelativeTime(event.detectedAt)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 border-r border-slate-100 pr-6">
          <h3 className="text-lg font-bold text-slate-900 mb-1">{property.address}</h3>
          <p className="text-slate-500 flex items-center gap-1.5 text-sm mb-4">
            <MapPin size={14} />
            {property.suburb} {property.state} {property.postcode}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
            <div className="flex items-center gap-1">
              <Building2 size={16} />
              {property.type}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {getEventIcon(event.type)}
              <span className="font-bold text-slate-900">{getEventLabel(event.type)}</span>
            </div>
            {event.previousValue && event.newValue && typeof event.newValue === 'number' && typeof event.previousValue === 'number' && (
              <div className="text-sm">
                <span className="text-slate-500 line-through mr-2">{formatCurrency(event.previousValue)}</span>
                <span className="font-bold text-slate-900">{formatCurrency(event.newValue)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="mb-4">
            <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3 flex items-center gap-2">
              <BrainCircuit size={16} />
              Why This Matters
            </h4>
            <div className="bg-brand-50/50 p-4 rounded-lg border border-brand-100 mb-4">
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                {aiSummary.overview}
              </p>
              <p className="text-sm font-medium text-brand-900">
                <span className="font-bold text-brand-700 mr-2">Suggested Next Step:</span>
                {aiSummary.suggestedAction}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-3">Key Signals</h4>
            <div className="flex flex-wrap gap-2">
              {signals.map((sig) => (
                <div key={sig.id} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-medium text-slate-700">
                  <CheckCircle2 size={14} className="text-brand-500" />
                  {sig.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
        <button 
          onClick={(e) => { e.stopPropagation(); /* Add to watchlist */ }} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <BookmarkPlus size={16} />
          Add to Watchlist
        </button>
        <button 
          onClick={() => navigate(`/properties/${property.id}`)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
        >
          View Intelligence
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
