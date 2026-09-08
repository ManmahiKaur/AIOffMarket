import React, { useState, useRef } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface AIQuestionInputProps {
  onAsk: (question: string) => void;
  isLoading: boolean;
}

export const SUGGESTED_QUESTIONS = [
  {
    icon: '📍',
    label: 'By Suburb',
    query: 'Show me all properties in Sydney',
  },
  {
    icon: '🔢',
    label: 'By Postcode',
    query: 'Find properties in postcode 2000',
  },
  {
    icon: '🗺️',
    label: 'By State',
    query: 'Show properties in NSW',
  },
  {
    icon: '🏙️',
    label: 'By City',
    query: 'Find properties in Melbourne',
  },
  {
    icon: '⚡',
    label: 'Seller Motivation',
    query: 'Which properties show strongest seller motivation and urgency signals?',
  },
  {
    icon: '🔥',
    label: 'Top Opportunities',
    query: 'What are the top 5 high-priority opportunities right now?',
  },
  {
    icon: '🎯',
    label: 'Best Focus Today',
    query: 'Which opportunities should I focus on first for maximum ROI?',
  },
  {
    icon: '🏛️',
    label: 'Probate & Estates',
    query: 'Identify properties with probate filings or deceased estate signals',
  },
];

export const AIQuestionInput: React.FC<AIQuestionInputProps> = ({ onAsk, isLoading }) => {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    onAsk(inputVal.trim());
  };


  return (
    <div className="space-y-4">
      {/* Main Input Bar — entire bar is a label so clicking anywhere focuses the input */}
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="ai-search-input"
          className="flex items-center bg-white rounded-2xl border-2 border-slate-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15 shadow-lg transition-all overflow-hidden p-1.5 cursor-text"
        >
          <span className="pl-3.5 pr-2 text-brand-600 flex items-center shrink-0">
            <Sparkles size={22} className="animate-pulse" />
          </span>

          <input
            id="ai-search-input"
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e as any)}
            placeholder="Search by suburb, postcode, city, or ask about opportunities and seller motivation..."
            autoComplete="off"
            className="w-full py-3.5 px-2 text-slate-800 placeholder-slate-400 bg-transparent text-base sm:text-lg font-medium focus:outline-none cursor-text"
          />

          <div className="flex items-center gap-2 pr-1.5 shrink-0">
            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Analyze <ArrowRight size={18} />
                </span>
              )}
            </button>
          </div>
        </label>
      </form>

    </div>
  );
};
