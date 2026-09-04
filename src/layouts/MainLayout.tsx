import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
