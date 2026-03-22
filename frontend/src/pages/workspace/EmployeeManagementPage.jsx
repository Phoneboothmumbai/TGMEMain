import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { Users, Plus, Pencil, Trash2, Shield, Loader2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const APP_COLORS = {
  servicebook: { active: 'border-emerald-400 bg-emerald-50 text-emerald-700', inactive: 'border-slate-200 bg-white text-slate-400 hover:border-slate-300' },
  sales: { active: 'border-blue-400 bg-blue-50 text-blue-700', inactive: 'border-slate-200 bg-white text-slate-400 hover:border-slate-300' },
};

// App definitions with their features
const APP_DEFINITIONS = {
  servicebook: {
    label: 'ServiceBook',
    color: 'emerald',
    features: {
      clients: { label: 'Clients', actions: ['view', 'create', 'edit', 'delete'] },
      tasks: { label: 'Tasks', actions: ['view', 'create', 'edit', 'delete'] },
      assets: { label: 'Assets', actions: ['view', 'create', 'edit', 'delete'] },
      amcs: { label: 'AMCs', actions: ['view', 'create', 'edit', 'delete'] },
      licenses: { label: 'Licenses', actions: ['view', 'create', 'edit', 'delete'] },
      parts: { label: 'Parts & Inventory', actions: ['view', 'create', 'edit', 'delete'] },
      billing: { label: 'Billing & Expenses', actions: ['view', 'create', 'edit'] },
      suppliers: { label: 'Suppliers', actions: ['view', 'create', 'edit', 'delete'] },
    },
  },
  sales: {
    label: 'Sales CRM',
    color: 'blue',
    features: {
      leads: { label: 'Leads', actions: ['view', 'create', 'edit', 'delete'] },
      accounts: { label: 'Accounts', actions: ['view', 'create', 'edit', 'delete'] },
      contacts: { label: 'Contacts', actions: ['view', 'create', 'edit', 'delete'] },
      pipeline: { label: 'Pipeline', actions: ['view'] },
      scraper: { label: 'Lead Scraper', actions: ['view', 'create'] },
      visitors: { label: 'Visitor Analytics', actions: ['view'] },
    },
  },
};

const ROLES = ['admin', 'backoffice', 'engineer', 'delivery'];

function getDefaultPermissions() {
  const perms = {};
  Object.entries(APP_DEFINITIONS).forEach(([appId, app]) => {
    perms[appId] = {};
    Object.entries(app.features).forEach(([featureId, feature]) => {
      perms[appId][featureId] = {};
      feature.actions.forEach(action => { perms[appId][featureId][action] = true; });
    });
  });
  return perms;
}

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    employee_id: '', name: '', phone: '', email: '', role: 'engineer', password: '',
    is_active: true, apps_access: ['servicebook'], permissions: getDefaultPermissions(),
  });

  // Expanded app sections in permission editor
  const [expanded, setExpanded] = useState({});

  const load = async () => {
    try {
      const data = await fetch(`${API}/api/workspace/admin/employees`).then(r => r.json());
      setEmployees(data);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({
      employee_id: '', name: '', phone: '', email: '', role: 'engineer', password: '',
      is_active: true, apps_access: ['servicebook'], permissions: getDefaultPermissions(),
    });
    setExpanded({});
    setShowForm(true);
  };

  const openEdit = (emp) => {
    setEditId(emp.employee_id);
    const perms = emp.permissions && Object.keys(emp.permissions).length > 0 ? emp.permissions : getDefaultPermissions();
    setForm({
      employee_id: emp.employee_id, name: emp.name, phone: emp.phone || '',
      email: emp.email || '', role: emp.role, password: '',
      is_active: emp.is_active, apps_access: emp.apps_access || [],
      permissions: perms,
    });
    setExpanded({});
    setShowForm(true);
  };

  const toggleApp = (appId) => {
    const current = form.apps_access || [];
    let updated;
    if (current.includes(appId)) {
      updated = current.filter(a => a !== appId);
    } else {
      updated = [...current, appId];
    }
    setForm({ ...form, apps_access: updated });
  };

  const togglePermission = (appId, featureId, action) => {
    const perms = { ...form.permissions };
    if (!perms[appId]) perms[appId] = {};
    if (!perms[appId][featureId]) perms[appId][featureId] = {};
    perms[appId][featureId][action] = !perms[appId][featureId][action];
    setForm({ ...form, permissions: perms });
  };

  const toggleAllFeature = (appId, featureId) => {
    const perms = { ...form.permissions };
    if (!perms[appId]) perms[appId] = {};
    if (!perms[appId][featureId]) perms[appId][featureId] = {};
    const feature = APP_DEFINITIONS[appId].features[featureId];
    const allEnabled = feature.actions.every(a => perms[appId][featureId][a]);
    feature.actions.forEach(a => { perms[appId][featureId][a] = !allEnabled; });
    setForm({ ...form, permissions: perms });
  };

  const setFullAccess = (appId) => {
    const perms = { ...form.permissions };
    perms[appId] = {};
    Object.entries(APP_DEFINITIONS[appId].features).forEach(([fid, f]) => {
      perms[appId][fid] = {};
      f.actions.forEach(a => { perms[appId][fid][a] = true; });
    });
    setForm({ ...form, permissions: perms });
  };

  const setNoAccess = (appId) => {
    const perms = { ...form.permissions };
    perms[appId] = {};
    Object.entries(APP_DEFINITIONS[appId].features).forEach(([fid, f]) => {
      perms[appId][fid] = {};
      f.actions.forEach(a => { perms[appId][fid][a] = false; });
    });
    setForm({ ...form, permissions: perms });
  };

  const save = async () => {
    if (!form.name.trim() || !form.employee_id.trim()) { toast.error('Name and Employee ID are required'); return; }
    if (!editId && !form.password) { toast.error('Password is required for new employees'); return; }
    setSaving(true);
    try {
      if (editId) {
        const updates = { name: form.name, phone: form.phone, email: form.email, role: form.role, is_active: form.is_active, apps_access: form.apps_access, permissions: form.permissions };
        if (form.password) updates.password = form.password;
        await fetch(`${API}/api/workspace/employees/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
        toast.success('Employee updated');
      } else {
        await fetch(`${API}/api/workspace/employees`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Employee created');
      }
      setShowForm(false);
      load();
    } catch (e) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const deactivate = async (empId) => {
    if (!window.confirm('Deactivate this employee? They will no longer be able to login.')) return;
    await fetch(`${API}/api/workspace/admin/employees/${empId}`, { method: 'DELETE' });
    toast.success('Employee deactivated');
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="max-w-5xl space-y-4" data-testid="employee-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5" /> Employee Management</h1>
          <p className="text-slate-500 text-sm">{employees.length} employees</p>
        </div>
        <Button onClick={openCreate} className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="add-employee-btn">
          <Plus className="w-4 h-4 mr-1" /> Add Employee
        </Button>
      </div>

      {/* Employee List */}
      <div className="space-y-2">
        {employees.map(emp => (
          <Card key={emp.employee_id} className={`${!emp.is_active ? 'opacity-50' : ''}`} data-testid={`emp-card-${emp.employee_id}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">
                    {emp.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800">{emp.name}</span>
                      <span className="text-xs text-slate-400 font-mono">{emp.employee_id}</span>
                      {!emp.is_active && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Inactive</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{emp.role}</span>
                      {(emp.apps_access || []).map(app => (
                        <span key={app} className={`text-xs px-2 py-0.5 rounded-full capitalize ${app === 'servicebook' ? 'bg-emerald-50 text-emerald-700' : app === 'sales' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                          {app === 'servicebook' ? 'ServiceBook' : app === 'sales' ? 'Sales CRM' : app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(emp)} className="p-2 hover:bg-slate-100 rounded-lg" title="Edit"><Pencil className="w-4 h-4 text-slate-500" /></button>
                  {emp.is_active && <button onClick={() => deactivate(emp.employee_id)} className="p-2 hover:bg-red-50 rounded-lg" title="Deactivate"><Trash2 className="w-4 h-4 text-red-400" /></button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Employee' : 'Add Employee'}</DialogTitle></DialogHeader>

          <div className="space-y-5">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-1.5"><Users className="w-4 h-4" /> Basic Info</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Employee ID *</Label><Input value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })} placeholder="e.g., EMP001" disabled={!!editId} data-testid="emp-id-input" /></div>
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" data-testid="emp-name-input" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Role</Label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="emp-role-select">
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div><Label>{editId ? 'New Password (leave blank to keep)' : 'Password *'}</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editId ? 'Leave blank to keep current' : 'Password'} data-testid="emp-password-input" /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <Label htmlFor="isActive" className="cursor-pointer">Active Employee</Label>
              </div>
            </div>

            {/* App Access */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-1.5"><Shield className="w-4 h-4" /> App Access</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(APP_DEFINITIONS).map(([appId, app]) => (
                  <button key={appId} onClick={() => toggleApp(appId)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                      form.apps_access.includes(appId)
                        ? APP_COLORS[appId].active
                        : APP_COLORS[appId].inactive
                    }`}
                    data-testid={`toggle-app-${appId}`}>
                    {form.apps_access.includes(appId) ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {app.label}
                  </button>
                ))}
                <button onClick={() => toggleApp('admin')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                    form.apps_access.includes('admin')
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                  }`}
                  data-testid="toggle-app-admin">
                  {form.apps_access.includes('admin') ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  Admin Centre
                </button>
              </div>
            </div>

            {/* Feature Permissions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-slate-700">Feature Permissions</h3>
              {Object.entries(APP_DEFINITIONS).map(([appId, app]) => {
                if (!form.apps_access.includes(appId)) return null;
                const isExpanded = expanded[appId] !== false;
                return (
                  <div key={appId} className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 cursor-pointer" onClick={() => setExpanded({ ...expanded, [appId]: !isExpanded })}>
                      <span className="font-medium text-sm text-slate-700">{app.label}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={e => { e.stopPropagation(); setFullAccess(appId); }} className="text-xs text-emerald-600 hover:underline">Full Access</button>
                        <button onClick={e => { e.stopPropagation(); setNoAccess(appId); }} className="text-xs text-red-500 hover:underline">None</button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 py-2">
                        <table className="w-full">
                          <thead>
                            <tr className="text-xs text-slate-400">
                              <th className="text-left py-1 font-medium">Feature</th>
                              {['view', 'create', 'edit', 'delete'].map(a => <th key={a} className="text-center py-1 font-medium w-16 capitalize">{a}</th>)}
                              <th className="text-center py-1 font-medium w-12">All</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(app.features).map(([featureId, feature]) => {
                              const featurePerms = form.permissions?.[appId]?.[featureId] || {};
                              const allOn = feature.actions.every(a => featurePerms[a]);
                              return (
                                <tr key={featureId} className="border-t border-slate-100">
                                  <td className="py-1.5 text-sm text-slate-700">{feature.label}</td>
                                  {['view', 'create', 'edit', 'delete'].map(action => {
                                    if (!feature.actions.includes(action)) {
                                      return <td key={action} className="text-center"><span className="text-slate-200">-</span></td>;
                                    }
                                    return (
                                      <td key={action} className="text-center">
                                        <button onClick={() => togglePermission(appId, featureId, action)}
                                          className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto transition-colors ${featurePerms[action] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-300'}`}
                                          data-testid={`perm-${appId}-${featureId}-${action}`}>
                                          {featurePerms[action] ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                        </button>
                                      </td>
                                    );
                                  })}
                                  <td className="text-center">
                                    <button onClick={() => toggleAllFeature(appId, featureId)}
                                      className={`w-7 h-7 rounded-md flex items-center justify-center mx-auto transition-colors ${allOn ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                      {allOn ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="save-employee-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editId ? 'Update Employee' : 'Create Employee')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
