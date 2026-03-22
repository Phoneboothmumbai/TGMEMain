import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useWorkspaceAuth } from '../../contexts/WorkspaceAuthContext';
import {
  TrendingUp, Users, Zap, BarChart3, Phone, Target,
  LogOut, Menu, X, Bell, Settings
} from 'lucide-react';

const NAV = [
  { path: '/workspace/sales', icon: BarChart3, label: 'Dashboard', exact: true },
  { path: '/workspace/sales/leads', icon: Users, label: 'All Leads' },
  { path: '/workspace/sales/scraper', icon: Zap, label: 'Lead Scraper' },
  { path: '/workspace/sales/visitors', icon: Target, label: 'Visitor Analytics' },
  { path: '/workspace/sales/pipeline', icon: TrendingUp, label: 'Sales Pipeline' },
];

export default function SalesLayout() {
  const { employee, logout } = useWorkspaceAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/workspace/login'); };

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" data-testid="sales-layout">
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => setSidebarOpen(true)} className="p-2"><Menu className="w-6 h-6" /></button>
        <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-emerald-400" /><span className="font-semibold text-sm">Sales CRM</span></div>
        <div className="w-8" />
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex flex-1">
        <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:shrink-0`}>
          {/* Brand */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm">Sales CRM</h1>
                <p className="text-xs text-slate-400">TGME Lead Engine</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1"><X className="w-5 h-5" /></button>
          </div>

          {/* Employee Info */}
          <div className="px-4 py-3 border-b border-slate-700">
            <p className="text-sm font-medium truncate">{employee?.name || employee?.employee_id}</p>
            <p className="text-xs text-emerald-400">{employee?.role || 'Sales'}</p>
          </div>

          {/* Nav */}
          <nav className="p-2 flex-1 overflow-y-auto">
            {NAV.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive(item) ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <item.icon className="w-5 h-5" /><span className="text-sm">{item.label}</span>
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <Link to="/workspace/servicebook" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors">
                <Settings className="w-5 h-5" /><span className="text-sm">Switch to ServiceBook</span>
              </Link>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-slate-800 rounded-lg transition-colors" data-testid="sales-logout-btn">
              <LogOut className="w-5 h-5" /><span className="text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen overflow-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
