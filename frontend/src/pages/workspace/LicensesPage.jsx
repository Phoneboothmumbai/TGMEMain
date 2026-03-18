import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { useWorkspaceAuth } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { Key, Plus, Search, Loader2, Pencil, Trash2, CheckCircle2, AlertTriangle, Clock, XCircle, Users, IndianRupee } from 'lucide-react';

const TYPE_OPTS = [
  { value: 'subscription', label: 'Subscription' },
  { value: 'perpetual', label: 'Perpetual' },
  { value: 'one_time', label: 'One-Time' },
  { value: 'trial', label: 'Trial' },
  { value: 'open_source', label: 'Open Source / Free' },
];
const TENURE_OPTS = ['monthly', 'yearly', '2_year', '3_year', '5_year', 'lifetime'];
const CATEGORY_OPTS = [
  { value: 'email', label: 'Email & Productivity (GWS, M365, Titan)' },
  { value: 'security', label: 'Security (Antivirus, Firewall, EDR)' },
  { value: 'os', label: 'Operating System (Windows, Server)' },
  { value: 'backup', label: 'Backup & Recovery' },
  { value: 'productivity', label: 'Productivity (Adobe, Office)' },
  { value: 'domain', label: 'Domain & Hosting' },
  { value: 'remote', label: 'Remote Access (TeamViewer, AnyDesk)' },
  { value: 'accounting', label: 'Accounting (Tally, Zoho)' },
  { value: 'other', label: 'Other' },
];
const STATUS_OPTS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-700' },
  { value: 'pending_renewal', label: 'Pending Renewal', color: 'bg-amber-100 text-amber-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-100 text-slate-600' },
];

function StatusBadge({ status }) {
  const opt = STATUS_OPTS.find(s => s.value === status) || STATUS_OPTS[0];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt.color}`}>{opt.label}</span>;
}

const EMPTY = {
  client_id: '', software_name: '', vendor: '', license_type: 'subscription',
  subscription_tenure: 'yearly', license_key: '', seats: 1, seats_used: 0,
  purchase_date: '', expiry_date: '', cost: 0, billing_cycle: 'yearly',
  auto_renew: false, category: 'email', assigned_to: '', notes: '', status: 'active',
};

export default function LicensesPage() {
  const { employee } = useWorkspaceAuth();
  const [licenses, setLicenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [licList, licStats, clientList] = await Promise.all([
        workspaceApi.getLicenses({ client_id: filterClient, status: filterStatus, category: filterCategory, license_type: filterType, search }),
        workspaceApi.getLicenseStats(filterClient),
        workspaceApi.getClients(),
      ]);
      setLicenses(licList || []);
      setStats(licStats);
      setClients(clientList || []);
    } catch { toast.error('Failed to load licenses'); }
    finally { setLoading(false); }
  }, [filterClient, filterStatus, filterCategory, filterType, search]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.client_id || !form.software_name) {
      toast.error('Client and software name are required'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, seats: parseInt(form.seats) || 1, seats_used: parseInt(form.seats_used) || 0, cost: parseFloat(form.cost) || 0, created_by: employee?.employee_id || '' };
      if (editing) { await workspaceApi.updateLicense(editing.id, payload); toast.success('License updated'); }
      else { await workspaceApi.createLicense(payload); toast.success('License created'); }
      setShowForm(false); setEditing(null); setForm({ ...EMPTY }); loadData();
    } catch (err) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const openEdit = (lic) => {
    setForm({
      client_id: lic.client_id || '', software_name: lic.software_name || '',
      vendor: lic.vendor || '', license_type: lic.license_type || 'subscription',
      subscription_tenure: lic.subscription_tenure || 'yearly', license_key: lic.license_key || '',
      seats: lic.seats || 1, seats_used: lic.seats_used || 0,
      purchase_date: lic.purchase_date || '', expiry_date: lic.expiry_date || '',
      cost: lic.cost || 0, billing_cycle: lic.billing_cycle || 'yearly',
      auto_renew: lic.auto_renew || false, category: lic.category || 'email',
      assigned_to: lic.assigned_to || '', notes: lic.notes || '', status: lic.status || 'active',
    });
    setEditing(lic); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this license?')) return;
    try { await workspaceApi.deleteLicense(id); toast.success('License deleted'); loadData(); }
    catch (err) { toast.error(err.message); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-6" data-testid="licenses-page">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="license-stats">
          {[
            { label: 'Total Licenses', value: stats.total, icon: Key, color: 'text-slate-700' },
            { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-green-600' },
            { label: 'Expiring/Expired', value: (stats.expiring_soon || 0) + (stats.expired || 0), icon: AlertTriangle, color: 'text-red-600' },
            { label: 'Pending Renewal', value: stats.pending_renewal, icon: Clock, color: 'text-amber-600' },
            { label: 'Seats (Used/Total)', value: `${stats.seats_used}/${stats.total_seats}`, icon: Users, color: 'text-blue-600' },
            { label: 'Annual Cost', value: `₹${(stats.total_cost || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-600' },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color} flex-shrink-0`} />
              <div><div className="text-lg font-bold text-slate-800">{s.value}</div><div className="text-xs text-slate-500">{s.label}</div></div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search licenses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-48 text-sm" data-testid="lic-search" />
          </div>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white">
            <option value="">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white">
            <option value="">All Categories</option>
            {CATEGORY_OPTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white">
            <option value="">All Types</option>
            {TYPE_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white">
            <option value="">All Statuses</option>
            {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <Button onClick={() => { setForm({ ...EMPTY }); setEditing(null); setShowForm(true); }} className="bg-amber-500 hover:bg-amber-600 text-white h-9 text-sm" data-testid="add-license-btn">
          <Plus className="w-4 h-4 mr-1" /> Add License
        </Button>
      </div>

      {/* Table */}
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Software</TableHead><TableHead>Client</TableHead><TableHead>Category</TableHead>
            <TableHead>Type</TableHead><TableHead>Seats</TableHead><TableHead>Expiry</TableHead>
            <TableHead>Cost</TableHead><TableHead>Status</TableHead><TableHead className="w-20">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {licenses.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-12 text-slate-400">No licenses found.</TableCell></TableRow>}
            {licenses.map(lic => (
              <TableRow key={lic.id} data-testid={`lic-row-${lic.id}`}>
                <TableCell>
                  <div className="text-sm font-medium">{lic.software_name}</div>
                  <div className="text-xs text-slate-400">{lic.vendor}</div>
                </TableCell>
                <TableCell className="text-sm">{lic.client_name || '—'}</TableCell>
                <TableCell className="text-xs capitalize">{CATEGORY_OPTS.find(c => c.value === lic.category)?.label?.split('(')[0]?.trim() || lic.category}</TableCell>
                <TableCell className="text-xs"><span className="capitalize">{lic.license_type?.replace('_', ' ')}</span>{lic.subscription_tenure ? <span className="text-slate-400 ml-1">({lic.subscription_tenure.replace('_', ' ')})</span> : ''}</TableCell>
                <TableCell className="text-sm">{lic.seats_used}/{lic.seats}</TableCell>
                <TableCell className={`text-xs ${lic.expiry_date && new Date(lic.expiry_date) < new Date() ? 'text-red-600 font-medium' : 'text-slate-500'}`}>{lic.expiry_date || 'N/A'}</TableCell>
                <TableCell className="text-sm">₹{(lic.cost || 0).toLocaleString('en-IN')}{lic.billing_cycle ? <span className="text-xs text-slate-400">/{lic.billing_cycle.replace('_', '')}</span> : ''}</TableCell>
                <TableCell><StatusBadge status={lic.status} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(lic)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="w-4 h-4 text-slate-500" /></button>
                    <button onClick={() => handleDelete(lic.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); setEditing(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit License' : 'Add License / Subscription'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Client *</Label>
                <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" required data-testid="lic-client">
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div><Label>Software / Service *</Label>
                <Input value={form.software_name} onChange={e => setForm({ ...form, software_name: e.target.value })} placeholder="e.g. Google Workspace, Microsoft 365, Kaspersky" required data-testid="lic-software" />
              </div>
              <div><Label>Vendor</Label>
                <Input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} placeholder="e.g. Google, Microsoft, GoDaddy" data-testid="lic-vendor" />
              </div>
              <div><Label>Category</Label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="lic-category">
                  {CATEGORY_OPTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div><Label>License Type</Label>
                <select value={form.license_type} onChange={e => setForm({ ...form, license_type: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="lic-type">
                  {TYPE_OPTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {form.license_type === 'subscription' && (
                <div><Label>Subscription Tenure</Label>
                  <select value={form.subscription_tenure} onChange={e => setForm({ ...form, subscription_tenure: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm capitalize" data-testid="lic-tenure">
                    {TENURE_OPTS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
              )}
              <div><Label>License Key</Label>
                <Input value={form.license_key} onChange={e => setForm({ ...form, license_key: e.target.value })} placeholder="License key or activation code" data-testid="lic-key" />
              </div>
              <div><Label>Seats / Quantity</Label>
                <Input type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} min="1" data-testid="lic-seats" />
              </div>
              <div><Label>Seats Used</Label>
                <Input type="number" value={form.seats_used} onChange={e => setForm({ ...form, seats_used: e.target.value })} min="0" data-testid="lic-seats-used" />
              </div>
              <div><Label>Purchase Date</Label><Input type="date" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} data-testid="lic-expiry" /></div>
              <div><Label>Cost (₹)</Label><Input type="number" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="e.g. 15000" data-testid="lic-cost" /></div>
              <div><Label>Billing Cycle</Label>
                <select value={form.billing_cycle} onChange={e => setForm({ ...form, billing_cycle: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm capitalize">
                  <option value="">N/A</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one_time">One-time</option>
                </select>
              </div>
              <div><Label>Status</Label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="lic-status">
                  {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={form.auto_renew} onChange={e => setForm({ ...form, auto_renew: e.target.checked })} id="auto_renew" />
                <Label htmlFor="auto_renew" className="mb-0">Auto Renew</Label>
              </div>
              <div className="col-span-2"><Label>Assigned To / Notes</Label>
                <Input value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} placeholder="e.g. All employees, IT Team, Accounts dept" />
              </div>
            </div>
            <div><Label>Notes</Label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full h-20 px-3 py-2 rounded-md border text-sm resize-none" placeholder="Admin credentials, renewal instructions..." /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="save-license-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update License' : 'Create License'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
