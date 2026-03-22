import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useWorkspaceAuth, workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  LayoutDashboard, Users, Building2, Package, ClipboardList, 
  FileText, Receipt, Truck, Settings, LogOut, Menu, X, Bell,
  ChevronRight, AlertCircle, Clock, CheckCircle2, Wrench, Sparkles, Monitor, Key, Shield, Globe
} from 'lucide-react';

export default function ServiceBookLayout() {
  const { employee, logout, isAuthenticated } = useWorkspaceAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/workspace/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await workspaceApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/workspace/login');
  };

  const isAdmin = employee?.role === 'admin' || employee?.role === 'backoffice';
  const isFieldStaff = employee?.role === 'engineer' || employee?.role === 'delivery';

  const adminMenuItems = [
    { path: '/workspace/servicebook', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/workspace/servicebook/tasks', icon: ClipboardList, label: 'Jobs / Tasks' },
    { path: '/workspace/servicebook/clients', icon: Building2, label: 'Clients' },
    { path: '/workspace/servicebook/assets', icon: Monitor, label: 'Asset Management' },
    { path: '/workspace/servicebook/amc-management', icon: Shield, label: 'AMC Contracts' },
    { path: '/workspace/servicebook/licenses', icon: Key, label: 'Licenses & Subs' },
    { path: '/workspace/servicebook/portal-users', icon: Globe, label: 'Client Portal' },
    { path: '/workspace/servicebook/employees', icon: Users, label: 'Employees' },
    { path: '/workspace/servicebook/suppliers', icon: Truck, label: 'Suppliers' },
    { path: '/workspace/servicebook/parts', icon: Package, label: 'Parts & Materials' },
    { path: '/workspace/servicebook/service-entries', icon: FileText, label: 'Service Entries' },
    { path: '/workspace/servicebook/parts-requests', icon: Truck, label: 'Parts Requests' },
    { path: '/workspace/servicebook/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/workspace/servicebook/blog-admin', icon: Sparkles, label: 'Blog Manager' },
  ];

  const fieldMenuItems = [
    { path: '/workspace/servicebook/my-tasks', icon: LayoutDashboard, label: 'My Tasks' },
    { path: '/workspace/servicebook/my-expenses', icon: Receipt, label: 'My Expenses' },
    { path: '/workspace/servicebook/request-parts', icon: Truck, label: 'Request Parts' },
  ];

  const menuItems = isAdmin ? adminMenuItems : fieldMenuItems;

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-800 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => setSidebarOpen(true)} className="p-2">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          <span className="font-semibold">ServiceBook</span>
        </div>
        <button className="p-2 relative">
          <Bell className="w-5 h-5" />
          {stats?.pending_tasks > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 h-full w-64 bg-slate-800 text-white z-50 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:shrink-0
        `}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">ServiceBook</h1>
              <p className="text-xs text-slate-400">TGME Workspace</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
              <span className="font-semibold text-sm">
                {employee?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{employee?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{employee?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors
                ${isActive(item) 
                  ? 'bg-amber-500 text-white' 
                  : 'text-slate-300 hover:bg-slate-700'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <Outlet context={{ stats, refreshStats: loadStats, employee }} />
      </main>
      </div>
    </div>
  );
}
