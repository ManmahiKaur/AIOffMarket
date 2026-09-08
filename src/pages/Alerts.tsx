import React, { useState } from 'react';
import { alertService } from '../services/alertService';
import type { Alert, EventType } from '../types';
import { Bell, BellOff, Settings2, Plus, X } from 'lucide-react';
import { cn } from '../utils';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(() => alertService.getAlerts());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType | 'HIGH_OPPORTUNITY'>('PRICE_DROP');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('All Locations');

  const toggleAlert = (id: string) => {
    const updated = alertService.toggleAlert(id);
    setAlerts(updated);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !condition.trim()) return;
    alertService.createAlert(name.trim(), type, condition.trim(), location.trim());
    setAlerts(alertService.getAlerts());
    setName('');
    setCondition('');
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Alerts</h1>
          <p className="text-slate-500">Manage notifications for market events, score changes, and off-market opportunities.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-sm text-sm"
        >
          <Plus size={18} />
          Create Alert
        </button>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className="premium-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl shrink-0",
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
                    Type: {alert.type.replace(/_/g, ' ')}
                  </span>
                  <span className="bg-slate-100 px-2 py-1 rounded">
                    Location: {alert.location}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-t border-slate-100 md:border-0 pt-4 md:pt-0 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">{alert.isActive ? 'Active' : 'Paused'}</span>
                <button 
                  onClick={() => toggleAlert(alert.id)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer",
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

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Create New Alert Rule</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alert Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Parramatta Price Drop Alert"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="PRICE_DROP">Price Drop</option>
                  <option value="HIGH_OPPORTUNITY">High Opportunity Score (&gt;75)</option>
                  <option value="CRITICAL_OPPORTUNITY">Critical Opportunity Score (&gt;85)</option>
                  <option value="PROBATE_SIGNAL">Probate / Estate Notice</option>
                  <option value="VACANCY_SIGNAL">Vacancy Signal (60+ Days)</option>
                  <option value="LISTING_WITHDRAWN">Listing Withdrawn Unsold</option>
                  <option value="NEW_LISTING">New Listing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trigger Condition</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Asking price drops by >5% or score > 80"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location Filter</label>
                <input 
                  type="text"
                  placeholder="e.g. Parramatta NSW or All Locations"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
