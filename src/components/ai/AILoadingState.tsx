import React, { useState, useEffect } from 'react';
import { BrainCircuit, Database, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';

export const AILoadingState: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { text: 'Scanning 2,606 property records & tenure histories in Live Database...', icon: Database },
    { text: 'Correlating event timelines, price shifts & probate notices...', icon: ShieldAlert },
    { text: 'Evaluating vendor motivation vectors & opportunity scores (0-100)...', icon: Cpu },
    { text: 'Synthesizing actionable intelligence dossier & next steps...', icon: BrainCircuit },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 350);
    const timer2 = setTimeout(() => setCurrentStep(2), 700);
    const timer3 = setTimeout(() => setCurrentStep(3), 1050);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl border border-slate-800 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400 shrink-0">
          <BrainCircuit size={26} className="animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">AI Property Intelligence Engine</h3>
          <p className="text-xs text-slate-400">Processing natural language query against live database records...</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                isCurrent
                  ? 'bg-brand-950/60 border-brand-500/40 text-brand-200'
                  : isDone
                  ? 'bg-slate-800/40 border-slate-700/50 text-slate-300'
                  : 'bg-transparent border-transparent text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 size={18} className="text-brand-400 shrink-0" />
              ) : (
                <Icon
                  size={18}
                  className={`shrink-0 ${isCurrent ? 'text-brand-400 animate-pulse' : 'text-slate-600'}`}
                />
              )}
              <span className={`text-sm font-medium ${isCurrent ? 'font-semibold text-white' : ''}`}>
                {step.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
