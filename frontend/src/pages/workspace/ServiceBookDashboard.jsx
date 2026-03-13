import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import {
  Building2, Users, ClipboardList, Package, Receipt, Clock, Truck,
  CheckCircle2, AlertTriangle, ArrowRight, Loader2, Send, FileText
} from 'lucide-react';

export default function ServiceBookDashboard() {
  const { stats, refreshStats, employee } = useOutletContext();
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFieldStaff = employee?.role === 'engineer' || employee?.role === 'delivery';

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      await refreshStats();
      const tasks = await workspaceApi.getTasks();
      setRecentTasks(tasks.slice(0, 8));
    } catch (e) {} finally { setLoading(false); }
  };

  if (isFieldStaff) return <Navigate to="/workspace/servicebook/my-tasks" replace />;
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  const statusConfig = {
    new: 'bg-slate-100 text-slate-700', part_ordered: 'bg-orange-100 text-orange-700',
    part_received: 'bg-blue-100 text-blue-700', estimate_sent: 'bg-purple-100 text-purple-700',
    estimate_approved: 'bg-indigo-100 text-indigo-700', assigned: 'bg-cyan-100 text-cyan-700',
    in_progress: 'bg-violet-100 text-violet-700', pending_for_part: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700', billed: 'bg-emerald-100 text-emerald-700',
  };

  const statCards = [
    { label: 'New Tasks', value: stats?.new_tasks || 0, icon: FileText, color: 'text-slate-600 bg-slate-50', link: '/workspace/servicebook/tasks' },
    { label: 'Pending Parts', value: stats?.pending_parts || 0, icon: Package, color: 'text-orange-600 bg-orange-50', link: '/workspace/servicebook/tasks' },
    { label: 'Awaiting Estimate', value: stats?.awaiting_estimate || 0, icon: Send, color: 'text-purple-600 bg-purple-50', link: '/workspace/servicebook/tasks' },
    { label: 'Ready to Assign', value: stats?.ready_to_assign || 0, icon: Users, color: 'text-cyan-600 bg-cyan-50', link: '/workspace/servicebook/tasks' },
    { label: 'Assigned', value: stats?.assigned_tasks || 0, icon: ClipboardList, color: 'text-blue-600 bg-blue-50', link: '/workspace/servicebook/tasks' },
    { label: 'In Progress', value: stats?.in_progress_tasks || 0, icon: Clock, color: 'text-violet-600 bg-violet-50', link: '/workspace/servicebook/tasks' },
    { label: 'Pending Billing', value: stats?.pending_billing || 0, icon: Receipt, color: 'text-rose-600 bg-rose-50', link: '/workspace/servicebook/tasks' },
    { label: 'Billed', value: stats?.billed_tasks || 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', link: '/workspace/servicebook/tasks' },
    { label: 'Clients', value: stats?.total_clients || 0, icon: Building2, color: 'text-blue-600 bg-blue-50', link: '/workspace/servicebook/clients' },
    { label: 'Employees', value: stats?.total_employees || 0, icon: Users, color: 'text-green-600 bg-green-50', link: '/workspace/servicebook/employees' },
    { label: 'Suppliers', value: stats?.total_suppliers || 0, icon: Truck, color: 'text-amber-600 bg-amber-50', link: '/workspace/servicebook/suppliers' },
    { label: 'Pending Expenses', value: stats?.pending_expenses || 0, icon: AlertTriangle, color: 'text-red-600 bg-red-50', link: '/workspace/servicebook/expenses' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6" data-testid="servicebook-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {employee?.name}</h1>
        <p className="text-slate-500 text-sm mt-1">Here's your workflow overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="stats-grid">
        {statCards.map((stat) => (
          <Link to={stat.link} key={stat.label}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.color}`}><stat.icon className="w-4 h-4" /></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-slate-800">Recent Jobs</CardTitle>
            <Link to="/workspace/servicebook/tasks" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No tasks yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <Link to={`/workspace/servicebook/task/${task.id}`} key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors" data-testid={`task-row-${task.id}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-amber-600 font-bold">{task.job_id}</span>
                      <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{task.client_name} {task.assigned_to_name ? `· ${task.assigned_to_name}` : ''}</p>
                  </div>
                  <Badge className={`text-xs ml-2 ${statusConfig[task.status] || 'bg-slate-100 text-slate-700'}`}>
                    {task.status?.replace(/_/g, ' ')}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
