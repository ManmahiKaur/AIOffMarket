import React from 'react';
import type { AIQueryResponse } from '../../services/aiService';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '../../utils';

interface AIIntelligenceDossierProps {
  dossier: AIQueryResponse;
}

export const AIIntelligenceDossier: React.FC<AIIntelligenceDossierProps> = ({ dossier }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Main Intelligence Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 space-y-6">
          {/* Top Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">
                  {new Date(dossier.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {dossier.headline}
              </h2>
            </div>


          </div>



          {/* Top Matching Properties from Live Database */}
          {dossier.topProperties.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dossier.topProperties.map((match) => (
                  <div
                    key={match.property.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 hover:border-brand-500/40 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="font-bold text-white text-base group-hover:text-brand-400 transition-colors">
                          {match.property.address}
                        </div>
                        <div className="text-xs text-slate-400">
                          {match.property.suburb || 'ACT'} {match.property.state || ''} • {match.property.type || 'Residential'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-extrabold bg-brand-500/20 text-brand-400">
                          {match.score}/100
                        </span>
                        <div className="text-xs font-semibold text-slate-300 mt-1">
                          {formatCurrency(match.property.currentPrice || match.property.estimatedValue || 950000)}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <span className="text-brand-300 font-semibold">Signal: </span>
                      {match.primaryReason}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                      <span className="text-slate-400 font-medium">
                        Motivation: <span className="text-amber-300 font-semibold">{match.sellerMotivationRating}</span>
                      </span>
                      <button
                        onClick={() => navigate(`/properties/${match.property.id}`)}
                        className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold transition-colors cursor-pointer"
                      >
                        <span>View Property</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
