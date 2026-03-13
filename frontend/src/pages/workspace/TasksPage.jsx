import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
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
  ClipboardList, Plus, Search, Loader2, Calendar,
  User, Building2, MapPin, MessageCircle, ArrowRight
} from 'lucide-react';

const statusConfig = {
  new: { label: 'New', color: 'bg-slate-100 text-slate-700' },
  part_ordered: { label: 'Part Ordered', color: 'bg-orange-100 text-orange-700' },
  part_received: { label: 'Part Received', color: 'bg-blue-100 text-blue-700' },
  estimate_sent: { label: 'Estimate Sent', color: 'bg-purple-100 text-purple-700' },
  estimate_approved: { label: 'Est. Approved', color: 'bg-indigo-100 text-indigo-700' },
  assigned: { label: 'Assigned', color: 'bg-cyan-100 text-cyan-700' },
  in_progress: { label: 'In Progress', color: 'bg-violet-100 text-violet-700' },
  pending_for_part: { label: 'Pending Part', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  billed: { label: 'Billed', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

const filterTabs = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'pending_parts', label: 'Pending Parts' },
  { key: 'ready_to_assign', label: 'Ready to Assign' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'billed', label: 'Billed' },
];

export default function TasksPage() {
  const { employee } = useOutletContext();
  const navigate = useNavigate();
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
    task_type: 'known_issue', client_id: '', location_id: '', assigned_to: '',
    service_type: 'service', title: '', description: '', priority: 'medium', due_date: ''
  });

  useEffect(() => { loadData(); }, [statusFilter]);

  const loadData = async () => {
    try {
      const filters = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      const [tasksData, clientsData, employeesData] = await Promise.all([
        workspaceApi.getTasks(filters), workspaceApi.getClients(), workspaceApi.getEmployees()
      ]);
      setTasks(tasksData); setClients(clientsData); setEmployees(employeesData);
    } catch (e) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const loadLocations = async (clientId) => {
    if (!clientId) { setLocations([]); return; }
    try { setLocations(await workspaceApi.getLocations(clientId)); } catch (e) {}
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await workspaceApi.createTask({ ...form, created_by: employee?.employee_id || 'SYSTEM', due_date: form.due_date ? new Date(form.due_date).toISOString() : null });
      toast.success('Task created'); setShowAdd(false);
      setForm({ task_type: 'known_issue', client_id: '', location_id: '', assigned_to: '', service_type: 'service', title: '', description: '', priority: 'medium', due_date: '' });
      loadData();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const filtered = tasks.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.job_id?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="tasks-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" data-testid="tasks-title">Jobs / Tasks</h1>
          <p className="text-slate-500 text-sm">{tasks.length} tasks</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600" data-testid="add-task-btn">
          <Plus className="w-4 h-4 mr-2" /> Create Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search by title, client, job ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-slate-200" data-testid="task-search-input" />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <Button key={tab.key} variant={statusFilter === tab.key ? 'default' : 'outline'} size="sm"
            onClick={() => setStatusFilter(tab.key)}
            className={statusFilter === tab.key ? 'bg-amber-500 hover:bg-amber-600' : 'text-xs'}
            data-testid={`filter-${tab.key}`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Task Cards */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card className="border-slate-200"><CardContent className="py-12 text-center"><ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No tasks found.</p></CardContent></Card>
        ) : filtered.map((task) => {
          const sc = statusConfig[task.status] || statusConfig.new;
          return (
            <Card key={task.id} className="border-slate-200 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate(`/workspace/servicebook/task/${task.id}`)} data-testid={`task-card-${task.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-amber-600 font-bold">{task.job_id}</span>
                      <h3 className="font-semibold text-slate-800 text-sm">{task.title}</h3>
                      <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{task.task_type?.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                      {task.client_name && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {task.client_name}</span>}
                      {task.location_name && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {task.location_name}</span>}
                      {task.assigned_to_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {task.assigned_to_name}
                          {task.assigned_to_phone && (
                            <a href={`https://wa.me/${task.assigned_to_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, update on ${task.job_id}?`)}`}
                              target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                              className="text-green-600 hover:text-green-700 font-medium ml-1">
                              <MessageCircle className="w-3 h-3 inline" />
                            </a>
                          )}
                        </span>
                      )}
                      {task.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs whitespace-nowrap ${sc.color}`}>{sc.label}</Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-lg" data-testid="add-task-dialog">
          <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            {/* Task Type Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm({...form, task_type: 'known_issue'})}
                className={`p-3 border-2 rounded-lg text-left transition-colors ${form.task_type === 'known_issue' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}
                data-testid="type-known">
                <p className="font-semibold text-sm text-slate-800">Known Issue</p>
                <p className="text-xs text-slate-500 mt-0.5">Issue identified, parts may be needed</p>
              </button>
              <button type="button" onClick={() => setForm({...form, task_type: 'diagnosis_required'})}
                className={`p-3 border-2 rounded-lg text-left transition-colors ${form.task_type === 'diagnosis_required' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}
                data-testid="type-diagnosis">
                <p className="font-semibold text-sm text-slate-800">Diagnosis Required</p>
                <p className="text-xs text-slate-500 mt-0.5">Engineer needs to visit & diagnose</p>
              </button>
            </div>

            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required data-testid="task-title-input" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select value={form.client_id} onValueChange={(v) => { setForm({...form, client_id: v, location_id: ''}); loadLocations(v); }}>
                  <SelectTrigger data-testid="task-client-select"><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Select value={form.location_id} onValueChange={(v) => setForm({...form, location_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.location_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={form.service_type} onValueChange={(v) => setForm({...form, service_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">Delivery</SelectItem><SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem><SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="amc_visit">AMC Visit</SelectItem><SelectItem value="service">Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({...form, due_date: e.target.value})} />
              </div>
            </div>
            {form.task_type === 'diagnosis_required' && (
              <div className="space-y-2">
                <Label>Assign To (for diagnosis)</Label>
                <Select value={form.assigned_to} onValueChange={(v) => setForm({...form, assigned_to: v})}>
                  <SelectTrigger><SelectValue placeholder="Assign engineer..." /></SelectTrigger>
                  <SelectContent>{employees.filter(e => e.role === 'engineer').map(e => <SelectItem key={e.employee_id} value={e.employee_id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={saving} data-testid="save-task-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
