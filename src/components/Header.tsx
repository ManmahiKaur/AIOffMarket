import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        {/* Breadcrumbs or page title could go here if needed, keeping it clean for now */}
      </div>

      <div className="flex items-center gap-6 text-slate-500">
        <Link to="/properties" className="hover:text-slate-900 transition-colors">
          <Search size={20} />
        </Link>
        <Link to="/alerts" className="hover:text-slate-900 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full border border-white"></span>
        </Link>
      </div>
    </header>
  );
};
