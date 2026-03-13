import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import {
  ClipboardList, Plus, Search, Loader2, Filter, Calendar,
  User, Building2, MapPin
} from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-violet-100 text-violet-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

export default function TasksPage() {
  const { employee } = useOutletContext();
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    client_id: '', location_id: '', assigned_to: '', service_type: 'service',
    title: '', description: '', priority: 'medium', due_date: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [tasksData, clientsData, employeesData] = await Promise.all([
        workspaceApi.getTasks(),
        workspaceApi.getClients(),
        workspaceApi.getEmployees(),
      ]);
      setTasks(tasksData);
      setClients(clientsData);
      setEmployees(employeesData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async (clientId) => {
    if (!clientId) { setLocations([]); return; }
    try {
      const locs = await workspaceApi.getLocations(clientId);
      setLocations(locs);
    } catch (error) {
      console.error('Failed to load locations');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const taskData = {
        ...form,
        created_by: employee?.employee_id || 'ADMIN001',
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      };
      if (!taskData.assigned_to) delete taskData.assigned_to;
      if (!taskData.due_date) delete taskData.due_date;

      await workspaceApi.createTask(taskData);
      toast.success('Task created successfully');
      setShowAdd(false);
      setForm({ client_id: '', location_id: '', assigned_to: '', service_type: 'service', title: '', description: '', priority: 'medium', due_date: '' });
      loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await workspaceApi.updateTask(taskId, { status: newStatus });
      toast.success('Task status updated');
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filtered = tasks
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.client_name && t.client_name.toLowerCase().includes(search.toLowerCase()))
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="tasks-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" data-testid="tasks-title">Tasks</h1>
          <p className="text-slate-500 text-sm">{tasks.length} total tasks</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600" data-testid="add-task-btn">
          <Plus className="w-4 h-4 mr-2" /> Create Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-slate-200" data-testid="task-search-input" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'assigned', 'in_progress', 'completed'].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? 'bg-amber-500 hover:bg-amber-600' : ''}
              data-testid={`filter-${s}`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500" data-testid="no-tasks-message">No tasks found.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((task) => (
            <Card key={task.id} className="border-slate-200 hover:shadow-sm transition-shadow" data-testid={`task-card-${task.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800">{task.title}</h3>
                      <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                      {task.client_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {task.client_name}
                        </span>
                      )}
                      {task.location_name && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {task.location_name}
                        </span>
                      )}
                      {task.assigned_to_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {task.assigned_to_name}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-slate-400">{task.service_type?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={task.status} onValueChange={(val) => handleStatusChange(task.id, val)}>
                      <SelectTrigger className={`w-[140px] text-xs h-8 ${statusColors[task.status]}`} data-testid={`task-status-select-${task.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-lg" data-testid="add-task-dialog">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required data-testid="task-title-input" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} data-testid="task-desc-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select value={form.client_id} onValueChange={(val) => { setForm({ ...form, client_id: val, location_id: '' }); loadLocations(val); }}>
                  <SelectTrigger data-testid="task-client-select">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Select value={form.location_id} onValueChange={(val) => setForm({ ...form, location_id: val })}>
                  <SelectTrigger data-testid="task-location-select">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(l => (
                      <SelectItem key={l.id} value={l.id}>{l.location_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select value={form.service_type} onValueChange={(val) => setForm({ ...form, service_type: val })}>
                  <SelectTrigger data-testid="task-service-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="amc_visit">AMC Visit</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(val) => setForm({ ...form, priority: val })}>
                  <SelectTrigger data-testid="task-priority-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={form.assigned_to} onValueChange={(val) => setForm({ ...form, assigned_to: val })}>
                  <SelectTrigger data-testid="task-assign-select">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.employee_id} value={e.employee_id}>{e.name} ({e.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} data-testid="task-duedate-input" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={saving} data-testid="save-task-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
