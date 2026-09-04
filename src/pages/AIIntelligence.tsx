import React from 'react';
import { BrainCircuit, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockOpportunities } from '../mock';

export const AIIntelligence: React.FC = () => {
  const navigate = useNavigate();
  // Using one opportunity for demonstration
  const sampleOpp = mockOpportunities[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 mb-6">
          <BrainCircuit size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">AI Intelligence</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Understand why property events may matter. Search for a property to view contextual market signals and insights.
        </p>
      </div>

      <div className="max-w-2xl mx-auto relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Search properties..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl shadow-sm text-lg focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          defaultValue="12 Smith Street, Parramatta"
        />
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10 pointer-events-none">
          <BrainCircuit size={250} />
        </div>
        
        <div className="relative z-10">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <p className="text-brand-300 font-medium mb-1">Analysis for</p>
              <h2 className="text-2xl font-bold">12 Smith Street, Parramatta</h2>
            </div>
            <button 
              onClick={() => navigate(`/properties/${sampleOpp.propertyId}`)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              View Property Details
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-brand-100 mb-3 border-b border-white/10 pb-2">Why This Matters</h3>
              <p className="text-slate-300 leading-relaxed">
                {sampleOpp.aiSummary.overview}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-brand-100 mb-3 border-b border-white/10 pb-2">Key Detected Signals</h3>
              <ul className="space-y-3">
                {sampleOpp.signals.map(sig => (
                  <li key={sig.id} className="flex flex-col gap-1">
                    <span className="font-medium text-white text-sm">{sig.label}</span>
                    <span className="text-slate-400 text-sm">{sig.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-brand-900/50 rounded-xl p-6 border border-brand-500/30">
            <h3 className="text-sm font-bold text-brand-300 uppercase tracking-wider mb-2">Suggested Next Step</h3>
            <p className="text-lg text-white">
              {sampleOpp.aiSummary.suggestedAction}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
