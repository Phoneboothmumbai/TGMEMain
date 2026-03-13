import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import {
  Building2, Users, ClipboardList, Package, Receipt, Clock,
  CheckCircle2, AlertCircle, ArrowRight, Loader2
} from 'lucide-react';

export default function ServiceBookDashboard() {
  const { stats, refreshStats, employee } = useOutletContext();
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await refreshStats();
      const tasks = await workspaceApi.getTasks();
      setRecentTasks(tasks.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="dashboard-loading">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Clients', value: stats?.total_clients || 0, icon: Building2, color: 'text-blue-600 bg-blue-50', link: '/workspace/servicebook/clients' },
    { label: 'Total Employees', value: stats?.total_employees || 0, icon: Users, color: 'text-emerald-600 bg-emerald-50', link: '/workspace/servicebook/employees' },
    { label: 'Pending Tasks', value: stats?.pending_tasks || 0, icon: Clock, color: 'text-amber-600 bg-amber-50', link: '/workspace/servicebook/tasks' },
    { label: 'In Progress', value: stats?.in_progress_tasks || 0, icon: ClipboardList, color: 'text-violet-600 bg-violet-50', link: '/workspace/servicebook/tasks' },
    { label: 'Completed Today', value: stats?.completed_today || 0, icon: CheckCircle2, color: 'text-green-600 bg-green-50', link: '/workspace/servicebook/tasks' },
    { label: 'Pending Billing', value: stats?.pending_billing || 0, icon: Receipt, color: 'text-rose-600 bg-rose-50', link: '/workspace/servicebook/billing' },
    { label: 'Parts Requests', value: stats?.pending_parts_requests || 0, icon: Package, color: 'text-orange-600 bg-orange-50', link: '/workspace/servicebook/parts-requests' },
    { label: 'Pending Expenses', value: stats?.pending_expenses || 0, icon: AlertCircle, color: 'text-slate-600 bg-slate-100', link: '/workspace/servicebook/expenses' },
  ];

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-violet-100 text-violet-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 lg:p-6 space-y-6" data-testid="servicebook-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" data-testid="dashboard-title">
            Welcome back, {employee?.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's what's happening today</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="stats-grid">
        {statCards.map((stat) => (
          <Link to={stat.link} key={stat.label}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Tasks */}
      <Card className="border-slate-200" data-testid="recent-tasks-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-slate-800">Recent Tasks</CardTitle>
            <Link to="/workspace/servicebook/tasks" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8" data-testid="no-tasks-message">No tasks yet. Create your first task to get started.</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg" data-testid={`task-row-${task.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {task.client_name} {task.location_name ? `- ${task.location_name}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {task.assigned_to_name && (
                      <span className="text-xs text-slate-500 hidden sm:block">{task.assigned_to_name}</span>
                    )}
                    <Badge className={`text-xs ${statusColor[task.status] || 'bg-slate-100 text-slate-700'}`}>
                      {task.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
