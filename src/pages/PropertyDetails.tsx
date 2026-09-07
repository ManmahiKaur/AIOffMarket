import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';
import { eventService } from '../services/eventService';
import { opportunityService } from '../services/opportunityService';
import { watchlistService } from '../services/watchlistService';
import { alertService } from '../services/alertService';
import type { Property, PropertyEvent, Opportunity } from '../types';
import { formatCurrency, formatRelativeTime, cn } from '../utils';
import { ArrowLeft, BellPlus, BookmarkPlus, BookmarkCheck, BrainCircuit, Activity, Flame, MapPin, CheckCircle2, TrendingDown, TrendingUp, AlertCircle, ShieldCheck, Compass, DollarSign, Calendar } from 'lucide-react';

const getEventIcon = (type: string) => {
  switch (type) {
    case 'PRICE_DROP': return <TrendingDown className="text-destructive" size={18} />;
    case 'PRICE_INCREASE': return <TrendingUp className="text-amber-500" size={18} />;
    case 'NEW_LISTING': return <AlertCircle className="text-brand-500" size={18} />;
    case 'LISTING_WITHDRAWN': return <AlertCircle className="text-slate-500" size={18} />;
    case 'RELISTED': return <AlertCircle className="text-blue-500" size={18} />;
    case 'PROBATE_SIGNAL': return <AlertCircle className="text-purple-600" size={18} />;
    case 'VACANCY_SIGNAL': return <AlertCircle className="text-red-500" size={18} />;
    default: return <AlertCircle size={18} />;
  }
};

const getEventLabel = (type: string) => type.replace(/_/g, ' ');

export const PropertyDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [events, setEvents] = useState<PropertyEvent[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [alertCreated, setAlertCreated] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [prop, evts, opps] = await Promise.all([
          propertyService.getPropertyById(id),
          eventService.getEventsByPropertyId(id),
          opportunityService.getOpportunitiesByPropertyId(id)
        ]);
        if (prop) {
          setProperty(prop);
          setInWatchlist(watchlistService.isPropertyInAnyWatchlist(prop.id));
        }
        setEvents(evts);
        setOpportunities(opps);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleWatchlistToggle = () => {
    if (!property) return;
    const defaultWatchlist = watchlistService.getWatchlists()[0];
    if (!defaultWatchlist) return;

    if (inWatchlist) {
      watchlistService.removePropertyFromWatchlist(defaultWatchlist.id, property.id);
      setInWatchlist(false);
    } else {
      watchlistService.addPropertyToWatchlist(defaultWatchlist.id, property.id);
      setInWatchlist(true);
    }
  };

  const handleCreateAlert = () => {
    if (!property) return;
    alertService.createAlert(
      `Alert for ${property.address}`,
      'HIGH_OPPORTUNITY',
      'Opportunity score > 75 or price drop detected',
      `${property.suburb} ${property.state}`
    );
    setAlertCreated(true);
    setTimeout(() => setAlertCreated(false), 3000);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading property intelligence...</div>;
  if (!property) return <div className="p-8 text-center text-slate-500">Property not found.</div>;

  const activeOpp = opportunities[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to properties
      </button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.address}</h1>
          <p className="text-slate-500 flex items-center gap-1.5 mb-4">
            <MapPin size={16} />
            {property.suburb} {property.state} {property.postcode}
            {property.latitude && property.longitude && (
              <span className="text-xs text-slate-400 font-mono ml-2">
                ({property.latitude.toFixed(4)}, {property.longitude.toFixed(4)})
              </span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium border border-slate-200">
              {property.type}
            </span>
            <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-md text-sm font-medium border border-brand-100">
              {property.status}
            </span>
            {activeOpp && (
              <span className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium border",
                activeOpp.priority === 'CRITICAL' ? "bg-red-50 text-red-700 border-red-200" : "bg-orange-50 text-orange-700 border-orange-200"
              )}>
                <Flame size={14} /> {activeOpp.priority} OPPORTUNITY
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={handleWatchlistToggle}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {inWatchlist ? (
              <>
                <BookmarkCheck size={16} className="text-brand-600" />
                In Watchlist
              </>
            ) : (
              <>
                <BookmarkPlus size={16} />
                Add to Watchlist
              </>
            )}
          </button>
          <button 
            onClick={handleCreateAlert}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
          >
            <BellPlus size={16} />
            {alertCreated ? 'Alert Created!' : 'Create Alert'}
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="premium-card p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Current Asking Price</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(property.currentPrice)}</p>
        </div>
        <div className="premium-card p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Estimated Market Value</p>
          <p className="text-2xl font-bold text-brand-700">{formatCurrency(property.estimatedValue)}</p>
        </div>
        <div className="premium-card p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Opportunity Score</p>
          <p className="text-2xl font-bold text-slate-900">
            {activeOpp ? activeOpp.score : '--'} <span className="text-sm text-slate-400 font-normal">/ 100</span>
          </p>
        </div>
        <div className="premium-card p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Monitoring Status</p>
          <p className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
            <Activity size={20} />
            Live Monitored
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Intelligence Panel */}
          {activeOpp && (
            <div className="bg-gradient-to-br from-brand-950 to-brand-900 rounded-xl p-8 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
                <BrainCircuit size={200} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-brand-200 mb-4 font-medium">
                  <BrainCircuit size={20} />
                  AI Intelligence & Opportunity Summary
                </div>
                <p className="text-lg leading-relaxed mb-6 font-light">
                  "{activeOpp.aiSummary.overview}"
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-brand-300 font-semibold mb-3">Key Reasons</p>
                    <ul className="space-y-2">
                      {activeOpp.aiSummary.keyReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-brand-50">
                          <CheckCircle2 size={16} className="text-brand-400 shrink-0 mt-0.5" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-brand-300 font-semibold mb-3">AI Confidence Level</p>
                    <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-md text-sm font-medium">
                      <ShieldCheck size={16} className="text-brand-300" />
                      {activeOpp.aiSummary.confidence} CONFIDENCE
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                  <p className="text-xs uppercase tracking-wider text-brand-300 font-semibold mb-2">Recommended Next Action</p>
                  <p className="text-sm text-brand-50 font-medium">{activeOpp.aiSummary.suggestedAction}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ownership & History Profile */}
          <div className="premium-card p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Ownership & History Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <Calendar size={14} /> Ownership Period
                </div>
                <p className="text-xl font-bold text-slate-900">{property.ownershipPeriodYears || 5} Years</p>
                <p className="text-xs text-slate-500 mt-1">Owner Type: {property.ownerType}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <DollarSign size={14} /> Last Sale Record
                </div>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(property.lastSalePrice)}</p>
                <p className="text-xs text-slate-500 mt-1">Date: {property.lastSaleDate}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                  <Compass size={14} /> Occupancy Status
                </div>
                <p className="text-xl font-bold text-slate-900">{property.vacancyStatus}</p>
                <p className="text-xs text-slate-500 mt-1">{property.rentalActivity}</p>
              </div>
            </div>
          </div>

          {/* Opportunity Signals */}
          {activeOpp && activeOpp.signals.length > 0 && (
            <div className="premium-card p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Detected Signals & Market Factors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOpp.signals.map(sig => (
                  <div key={sig.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">{sig.label}</h4>
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded",
                        sig.impact === 'HIGH' ? "bg-red-100 text-red-700" :
                        sig.impact === 'MEDIUM' ? "bg-amber-100 text-amber-700" :
                        "bg-blue-100 text-blue-700"
                      )}>{sig.impact} IMPACT</span>
                    </div>
                    <p className="text-sm text-slate-600">{sig.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Specifications Grid */}
          <div className="premium-card p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Property Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Type</p>
                <p className="font-medium text-slate-900">{property.type}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Bedrooms</p>
                <p className="font-medium text-slate-900">{property.bedrooms}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Bathrooms</p>
                <p className="font-medium text-slate-900">{property.bathrooms}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Parking</p>
                <p className="font-medium text-slate-900">{property.parking}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Land Size</p>
                <p className="font-medium text-slate-900">{property.landSize > 0 ? `${property.landSize} sqm` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Event Timeline */}
        <div className="lg:col-span-1">
          <div className="premium-card p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Detected Event Timeline</h3>
            
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
              {events.map((evt, idx) => (
                <div key={evt.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-brand-500 shadow-sm" />
                  
                  <div className="text-xs font-bold text-brand-600 mb-1 flex items-center justify-between">
                    <span>{idx === 0 ? 'LATEST EVENT' : formatRelativeTime(evt.detectedAt).toUpperCase()}</span>
                    {evt.confidenceScore && (
                      <span className="text-slate-400 font-normal">{Math.round(evt.confidenceScore * 100)}% Conf.</span>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      {getEventIcon(evt.type)}
                      <span className="font-bold text-slate-900 text-sm">{getEventLabel(evt.type)}</span>
                    </div>
                    {evt.description && (
                      <p className="text-xs text-slate-600 mb-2">{evt.description}</p>
                    )}
                    {evt.source && (
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Source: {evt.source}</p>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-200 border-2 border-white" />
                <div className="text-xs font-bold text-slate-400 mb-1">
                  HISTORIC
                </div>
                <div className="text-sm text-slate-500">
                  Property indexed into intelligence database
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
