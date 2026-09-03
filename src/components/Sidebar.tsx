import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  Building2, 
  Zap, 
  Bookmark, 
  Bell, 
  BrainCircuit, 
  Settings 
} from 'lucide-react';
import { cn } from '../utils';

const navItems = [
  { label: 'Overview', icon: Home, path: '/' },
  { label: 'Opportunity Feed', icon: Activity, path: '/opportunities' },
  { label: 'Properties', icon: Building2, path: '/properties' },
  { label: 'Events', icon: Zap, path: '/events' },
  { label: 'Watchlists', icon: Bookmark, path: '/watchlists' },
  { label: 'Alerts', icon: Bell, path: '/alerts' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white mb-8">
          <div className="bg-brand-500 p-2 rounded-lg">
            <Building2 size={24} className="text-white" />
          </div>
          <div className="font-bold leading-tight">
            AI OFF-MARKET<br />
            <span className="text-xs font-normal text-slate-400">& EVENT INTELLIGENCE</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-500/10 text-brand-400"
                    : "hover:bg-slate-800 hover:text-white"
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}

          <div className="my-4 border-t border-slate-800" />

          <NavLink
            to="/ai-intelligence"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-500/10 text-brand-400"
                  : "hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <BrainCircuit size={18} />
            AI Intelligence
          </NavLink>

          <div className="my-4 border-t border-slate-800" />

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-500/10 text-brand-400"
                  : "hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800 m-4 rounded-lg bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
            MK
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Manmahi Kaur</p>
            <p className="text-xs text-slate-400 truncate">Property Intelligence Analyst</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
