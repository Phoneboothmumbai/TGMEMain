import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useWorkspaceAuth } from '../../contexts/WorkspaceAuthContext';
import { Shield, Users, Settings, LogOut, Menu, X, LayoutDashboard, Briefcase } from 'lucide-react';

const NAV = [
  { path: '/workspace/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/workspace/admin/employees', icon: Users, label: 'Employee Management' },
];

export default function AdminLayout() {
  const { employee, logout } = useWorkspaceAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/workspace/login'); };

  const isActive = (nav) => nav.exact ? location.pathname === nav.path : location.pathname.startsWith(nav.path);

  return (
    <div className="min-h-screen bg-slate-50 flex" data-testid="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-56 bg-slate-900 text-white transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
            <div>
              <div className="font-bold text-sm">Admin Centre</div>
              <div className="text-[10px] text-slate-400">TGME Command</div>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-slate-700/50">
          <div className="text-xs text-slate-400">{employee?.name || 'Admin'}</div>
          <div className="text-[10px] text-slate-500">{employee?.role}</div>
        </div>

        <nav className="p-2 space-y-0.5 flex-1">
          {NAV.map(nav => (
            <Link key={nav.path} to={nav.path} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive(nav) ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-800'}`}>
              <nav.icon className="w-4 h-4" />{nav.label}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-700/50 mt-auto">
          <Link to="/workspace/login" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 transition-colors">
            <Briefcase className="w-4 h-4" /> Switch App
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-slate-100 rounded-lg">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-semibold text-sm text-slate-700">Admin Centre</span>
        </header>
        <main className="p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
