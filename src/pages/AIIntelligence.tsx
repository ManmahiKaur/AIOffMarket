import React, { useState, useEffect } from 'react';
import {
  Key,
  CheckCircle2,
  ExternalLink,
  X
} from 'lucide-react';
import { aiService, type AIQueryResponse } from '../services/aiService';
import { isGroqConfigured, getGroqApiKey, setGroqApiKey } from '../lib/groq';
import { AIQuestionInput, SUGGESTED_QUESTIONS } from '../components/ai/AIQuestionInput';
import { AIIntelligenceDossier } from '../components/ai/AIIntelligenceDossier';
import { AILoadingState } from '../components/ai/AILoadingState';

export const AIIntelligence: React.FC = () => {
  const [currentDossier, setCurrentDossier] = useState<AIQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Groq API Key modal & state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [groqKeyInput, setGroqKeyInput] = useState(() => getGroqApiKey());
  const [keySavedSuccess, setKeySavedSuccess] = useState(false);

  // Initial load: run default intelligence query
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const initialQuery = SUGGESTED_QUESTIONS[1].query;
        const initialDossier = await aiService.processNaturalLanguageQuery(initialQuery);
        setCurrentDossier(initialDossier);
      } catch (err) {
        console.error('Failed to initialize AI Intelligence page:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAskQuestion = async (question: string) => {
    setLoading(true);
    try {
      const response = await aiService.processNaturalLanguageQuery(question);
      setCurrentDossier(response);
    } catch (error) {
      console.error('Error running AI question:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleSaveGroqKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGroqApiKey(groqKeyInput.trim());
    const active = isGroqConfigured();
    setKeySavedSuccess(true);
    setTimeout(() => {
      setKeySavedSuccess(false);
      setShowKeyModal(false);
      if (currentDossier) {
        handleAskQuestion(currentDossier.query);
      }
    }, 1000);
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Property Intelligence Assistant
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            Ask natural-language questions to uncover hidden seller motivation, rank high-probability off-market opportunities, and formulate precision acquisition strategies.
          </p>
        </div>
      </div>

      {/* Question Input Section */}
      <AIQuestionInput onAsk={handleAskQuestion} isLoading={loading} />

      {/* Dynamic State: Loading vs Dossier Display */}
      {loading ? (
        <AILoadingState />
      ) : currentDossier ? (
        <AIIntelligenceDossier dossier={currentDossier} />
      ) : null}

      {/* Groq API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Key size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Configure Groq API Key</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Power your AI Intelligence Assistant with ultra-fast LLaMA 3.3 70B reasoning.
                </p>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveGroqKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Groq API Key (gsk_...)
                </label>
                <input
                  type="password"
                  placeholder="gsk_..."
                  value={groqKeyInput}
                  onChange={(e) => setGroqKeyInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-brand-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <span>You can also set this permanently in</span>
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env</code>
                  <span>as</span>
                  <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">VITE_GROQ_API_KEY</code>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800">How it works:</div>
                <div className="text-slate-500 leading-relaxed">
                  The AI agent pulls real property and event data directly from Supabase, formats it into a grounded context prompt, and uses Groq LLaMA 3.3 to synthesize executive opportunity scores, seller motivation vectors, and acquisition steps.
                </div>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold pt-1"
                >
                  <span>Get a free Groq API key</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {keySavedSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Groq API Key saved successfully! Re-analyzing...</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-md cursor-pointer"
                >
                  Save & Activate Groq
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
