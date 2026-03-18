import React, { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { usePortalAuth } from '../../contexts/PortalAuthContext';
import { LayoutDashboard, Monitor, Shield, FileText, Users, LogOut, Menu, X, Headphones } from 'lucide-react';

export default function PortalLayout() {
  const { user, logout, isAuthenticated } = usePortalAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) { navigate('/portal/login'); return null; }

  const handleLogout = () => { logout(); navigate('/portal/login'); };

  const nav = [
    { path: '/portal/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/portal/assets', icon: Monitor, label: 'Our Assets' },
    { path: '/portal/contacts', icon: Users, label: 'Our Contacts' },
    { path: '/portal/amcs', icon: Shield, label: 'AMC Contracts' },
    { path: '/portal/tickets', icon: FileText, label: 'Support Tickets' },
    { path: '/portal/raise-ticket', icon: Headphones, label: 'Raise Ticket' },
  ];

  const isActive = (item) => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" data-testid="portal-layout">
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => setOpen(true)} className="p-2"><Menu className="w-6 h-6" /></button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-sm">Client Portal</span>
        </div>
        <div className="w-8" />
      </div>

      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex flex-1">
        <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 flex flex-col ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:shrink-0`}>
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
              <div><h1 className="font-bold text-sm">Client Portal</h1><p className="text-xs text-slate-400">TGME</p></div>
            </div>
            <button onClick={() => setOpen(false)} className="lg:hidden p-1"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 border-b border-slate-700">
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-amber-400">{user?.client_name}</p>
          </div>
          <nav className="p-2 flex-1 overflow-y-auto">
            {nav.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive(item) ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
                <item.icon className="w-5 h-5" /><span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-700">
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-slate-800 rounded-lg" data-testid="portal-logout-btn">
              <LogOut className="w-5 h-5" /><span className="text-sm">Logout</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 min-h-screen overflow-auto p-4 lg:p-6">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
