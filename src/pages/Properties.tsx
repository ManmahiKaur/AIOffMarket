import React, { useEffect, useState } from 'react';
import { propertyService } from '../services/propertyService';
import type { Property } from '../types';
import { formatCurrency, cn } from '../utils';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Building2, ChevronRight, Activity } from 'lucide-react';

export const Properties: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true);
      try {
        const data = await propertyService.getProperties();
        setProperties(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, []);

  const filteredProperties = properties.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return p.address.toLowerCase().includes(query) || p.suburb.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Properties</h1>
        <p className="text-slate-500">Browse and monitor properties across your intelligence network.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by address or suburb..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading properties...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4 pl-6">Property</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No properties found.
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                      <div className="font-bold text-slate-900 mb-0.5">{prop.address}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={12} /> {prop.suburb} {prop.state}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Building2 size={16} className="text-slate-400" /> {prop.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                        prop.status === 'Active' ? "bg-brand-50 text-brand-700 border-brand-200" :
                        prop.status === 'Withdrawn' ? "bg-slate-100 text-slate-700 border-slate-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      )}>
                        {prop.status === 'Active' && <Activity size={12} />}
                        {prop.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-900">
                      {formatCurrency(prop.currentPrice)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={() => navigate(`/properties/${prop.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm font-medium text-brand-600 hover:bg-slate-50 transition-colors"
                      >
                        View <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
