import React, { useState } from 'react';
import { mockAlerts } from '../mock';
import { Bell, BellOff, Settings2, Plus } from 'lucide-react';
import { cn } from '../utils';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState(mockAlerts);

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Alerts</h1>
          <p className="text-slate-500">Manage notifications for market events and opportunities.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors">
          <Plus size={18} />
          Create Alert
        </button>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700 font-medium">
              Note: This feature is currently using mock data. Full database connection for Alerts is pending.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className="premium-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                alert.isActive ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-slate-400"
              )}>
                {alert.isActive ? <Bell size={24} /> : <BellOff size={24} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{alert.name}</h3>
                <div className="text-sm text-slate-600 mb-2">
                  <span className="font-medium text-slate-700">Notify when:</span> {alert.condition}
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <span className="bg-slate-100 px-2 py-1 rounded">
                    Type: {alert.type.replace('_', ' ')}
                  </span>
                  <span className="bg-slate-100 px-2 py-1 rounded">
                    Location: {alert.location}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-t border-slate-100 md:border-0 pt-4 md:pt-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">{alert.isActive ? 'Active' : 'Paused'}</span>
                <button 
                  onClick={() => toggleAlert(alert.id)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    alert.isActive ? "bg-brand-500" : "bg-slate-200"
                  )}
                >
                  <span 
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      alert.isActive ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                <Settings2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
