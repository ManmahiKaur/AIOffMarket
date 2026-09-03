import React, { useState, useEffect } from 'react';
import { criteriaService } from '../services/criteriaService';
import type { MonitoringCriteria } from '../types';
import { User, Bell, Database, Shield, Monitor } from 'lucide-react';
import { cn } from '../utils';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [criteria, setCriteria] = useState<MonitoringCriteria | null>(null);

  useEffect(() => {
    criteriaService.getCriteria().then(setCriteria);
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'monitoring', label: 'Monitoring Preferences', icon: Monitor },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
    { id: 'data', label: 'Data Sources', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500">Manage your account, preferences, and connected data sources.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left",
                  activeTab === tab.id
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <tab.icon size={18} className={activeTab === tab.id ? "text-brand-600" : "text-slate-400"} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="md:col-span-3">
          {activeTab === 'monitoring' && criteria && (
            <div className="premium-card p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Monitoring Criteria</h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {criteria.locations.map(loc => (
                      <span key={loc} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-md border border-slate-200">
                        {loc}
                      </span>
                    ))}
                    <button className="px-3 py-1.5 border border-dashed border-slate-300 text-slate-500 text-sm font-medium rounded-md hover:border-brand-500 hover:text-brand-600 transition-colors">
                      + Add Location
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Property Types</label>
                    <div className="space-y-2">
                      {['House', 'Apartment', 'Townhouse', 'Unit', 'Land'].map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm text-slate-700">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" 
                            checked={criteria.propertyTypes.includes(type as any)} 
                            readOnly
                          /> 
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Priority Events</label>
                    <div className="space-y-2">
                      {['PRICE_DROP', 'LISTING_WITHDRAWN', 'RELISTED', 'NEW_LISTING'].map(evt => (
                        <label key={evt} className="flex items-center gap-2 text-sm text-slate-700">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" 
                            checked={criteria.priorityEvents.includes(evt as any)} 
                            readOnly
                          /> 
                          {evt.replace('_', ' ')}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Price Range</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <span className="text-xs text-slate-500 block mb-1">Minimum</span>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm" value={`$${criteria.priceRange.min.toLocaleString()}`} readOnly />
                    </div>
                    <div className="pt-5 text-slate-400">-</div>
                    <div className="flex-1">
                      <span className="text-xs text-slate-500 block mb-1">Maximum</span>
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm" value={`$${criteria.priceRange.max.toLocaleString()}`} readOnly />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button className="px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="premium-card p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Data Sources</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <Database size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">NSW Property Data API</h4>
                      <p className="text-sm text-slate-500">Provides real-time listing updates for NSW.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Connected</span>
                </div>
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center">
                      <Database size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">VIC Property Data API</h4>
                      <p className="text-sm text-slate-500">Provides real-time listing updates for VIC.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700">Connect</button>
                </div>
              </div>
            </div>
          )}

          {/* Add other placeholders as needed for profile, notifications etc. */}
          {['profile', 'notifications', 'security'].includes(activeTab) && (
            <div className="premium-card p-8 flex items-center justify-center min-h-[400px]">
              <p className="text-slate-400 flex items-center gap-2">
                {tabs.find(t => t.id === activeTab)?.label} configuration coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
