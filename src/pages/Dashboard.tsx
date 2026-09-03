import React, { useEffect, useState } from 'react';
import { dashboardService, type DashboardMetrics } from '../services/dashboardService';
import { opportunityService } from '../services/opportunityService';
import { propertyService } from '../services/propertyService';
import { eventService } from '../services/eventService';
import type { Opportunity, Property, PropertyEvent } from '../types';
import { formatRelativeTime } from '../utils';
import { useNavigate } from 'react-router-dom';
import { Building2, Zap, Flame, Bookmark, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [highPriorityOpps, setHighPriorityOpps] = useState<(Opportunity & { property: Property, event: PropertyEvent })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [mets, actData, distData, opps, props, events] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getActivityChartData(),
          dashboardService.getEventDistributionData(),
          opportunityService.getOpportunities(),
          propertyService.getProperties(),
          eventService.getEvents()
        ]);
        
        setMetrics(mets);
        setActivityData(actData);
        setDistributionData(distData);

        const highPriority = opps
          .filter(o => o.priority === 'HIGH' || o.priority === 'PRIORITY')
          .slice(0, 5)
          .map(o => ({
            ...o,
            property: props.find(p => p.id === o.propertyId)!,
            event: events.find(e => e.id === o.eventId)!
          }))
          .filter(o => o.property && o.event);
          
        setHighPriorityOpps(highPriority);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading || !metrics) return <div className="p-8 text-slate-500">Loading dashboard...</div>;

  const COLORS = ['#22c55e', '#3b82f6', '#64748b', '#eab308'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Good morning, Manmahi</h1>
        <p className="text-slate-500">Monitor property events and discover emerging opportunities.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-brand-50 text-brand-600 p-3 rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{metrics.propertiesMonitored.toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-500">Properties Monitored</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">Across active monitoring areas</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{metrics.newEvents24h}</p>
              <p className="text-sm font-medium text-slate-500">New Events</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">Detected in the last 24 hours</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-50 text-orange-600 p-3 rounded-xl">
              <Flame size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{metrics.highPriority}</p>
              <p className="text-sm font-medium text-slate-500">High Priority</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">Opportunities requiring attention</p>
        </div>

        <div className="premium-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
              <Bookmark size={24} />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{metrics.watchlistMatches}</p>
              <p className="text-sm font-medium text-slate-500">Watchlist Matches</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">New matches today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Opportunity Activity Chart */}
        <div className="premium-card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Opportunity Activity</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line type="monotone" dataKey="opportunities" stroke="#16a34a" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Distribution */}
        <div className="premium-card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Event Distribution</h3>
          <div className="h-60 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {distributionData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-2xl font-bold text-slate-900">100</span>
                <span className="block text-xs text-slate-500">Events</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {distributionData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="w-3 h-3 rounded-full block" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Priority Opportunities Table */}
      <div className="premium-card p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">High Priority Opportunities</h3>
          <button 
            onClick={() => navigate('/opportunities')}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4 pl-6">Score</th>
                <th className="p-4">Property</th>
                <th className="p-4">Location</th>
                <th className="p-4">Event</th>
                <th className="p-4">Detected</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highPriorityOpps.map((opp) => (
                <tr 
                  key={opp.id} 
                  onClick={() => navigate(`/properties/${opp.property.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="p-4 pl-6">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold text-sm">
                      {opp.score}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-900 group-hover:text-brand-600 transition-colors">
                    {opp.property.address}
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {opp.property.suburb} {opp.property.state}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
                      {opp.event?.type.replace('_', ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {formatRelativeTime(opp.detectedAt)}
                  </td>
                  <td className="p-4 pr-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600">
                      <Flame size={14} /> High
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
