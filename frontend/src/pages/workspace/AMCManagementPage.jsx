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
import { FileText, Plus, Search, Loader2, Pencil, Trash2, CheckCircle2, AlertTriangle, Clock, XCircle, IndianRupee, Monitor, X as XIcon, Link2 } from 'lucide-react';

const COVERAGE_OPTS = [
  { value: 'comprehensive', label: 'Comprehensive (Parts + Labor)' },
  { value: 'non_comprehensive', label: 'Non-Comprehensive (Labor Only)' },
  { value: 'labor_only', label: 'Labor Only' },
];
const BILLING_OPTS = ['annual', 'quarterly', 'monthly', 'one_time'];
const VISIT_OPTS = [
  { value: 'monthly', label: 'Monthly' }, { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half Yearly' }, { value: 'on_demand', label: 'On Demand' },
];
const STATUS_OPTS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-700', icon: XCircle },
  { value: 'pending_renewal', label: 'Pending Renewal', color: 'bg-amber-100 text-amber-700', icon: Clock },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-100 text-slate-600', icon: XCircle },
];

function StatusBadge({ status }) {
  const opt = STATUS_OPTS.find(s => s.value === status) || STATUS_OPTS[0];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt.color}`}>{opt.label}</span>;
}

const EMPTY = {
  client_id: '', contract_name: '', start_date: '', end_date: '',
  coverage_type: 'comprehensive', amount: 0, billing_cycle: 'annual',
  devices_covered: 0, number_of_visits: 0, asset_ids: [],
  includes_parts: true, includes_onsite: true,
  visit_frequency: 'quarterly', notes: '', status: 'active',
};

export default function AMCPage() {
  const { employee } = useWorkspaceAuth();
  const [amcs, setAmcs] = useState([]);
  const [stats, setStats] = useState(null);
  const [clients, setClients] = useState([]);
  const [clientAssets, setClientAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [amcList, amcStats, clientList] = await Promise.all([
        workspaceApi.getAMCs({ client_id: filterClient, status: filterStatus, search }),
        workspaceApi.getAMCStats(filterClient),
        workspaceApi.getClients(),
      ]);
      setAmcs(amcList || []);
      setStats(amcStats);
      setClients(clientList || []);
    } catch { toast.error('Failed to load AMC data'); }
    finally { setLoading(false); }
  }, [filterClient, filterStatus, search]);

  useEffect(() => { loadData(); }, [loadData]);

  // Load assets when client is selected in form
  useEffect(() => {
    if (form.client_id) {
      workspaceApi.getAssets({ client_id: form.client_id, parent_only: 'true', limit: 500 })
        .then(res => setClientAssets(res?.assets || []))
        .catch(() => setClientAssets([]));
    } else {
      setClientAssets([]);
    }
  }, [form.client_id]);

  const toggleAsset = (assetId) => {
    setForm(prev => {
      const ids = prev.asset_ids || [];
      return { ...prev, asset_ids: ids.includes(assetId) ? ids.filter(a => a !== assetId) : [...ids, assetId] };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.client_id || !form.contract_name || !form.start_date || !form.end_date) {
      toast.error('Client, name, start and end dates are required'); return;
    }
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) || 0, devices_covered: parseInt(form.devices_covered) || 0, number_of_visits: parseInt(form.number_of_visits) || 0, created_by: employee?.employee_id || '' };
      if (editing) { await workspaceApi.updateAMC(editing.id, payload); toast.success('AMC updated'); }
      else { await workspaceApi.createAMC(payload); toast.success('AMC created'); }
      setShowForm(false); setEditing(null); setForm({ ...EMPTY }); loadData();
    } catch (err) { toast.error(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const openEdit = (amc) => {
    setForm({
      client_id: amc.client_id || '', contract_name: amc.contract_name || '',
      start_date: amc.start_date || '', end_date: amc.end_date || '',
      coverage_type: amc.coverage_type || 'comprehensive', amount: amc.amount || 0,
      billing_cycle: amc.billing_cycle || 'annual', devices_covered: amc.devices_covered || 0,
      number_of_visits: amc.number_of_visits || 0, asset_ids: amc.asset_ids || [],
      includes_parts: amc.includes_parts !== false, includes_onsite: amc.includes_onsite !== false,
      visit_frequency: amc.visit_frequency || 'quarterly', notes: amc.notes || '',
      status: amc.status || 'active',
    });
    setEditing(amc); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this AMC contract?')) return;
    try { await workspaceApi.deleteAMC(id); toast.success('AMC deleted'); loadData(); }
    catch (err) { toast.error(err.message); }
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const diff = (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff >= 0;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-6" data-testid="amc-page">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" data-testid="amc-stats">
          {[
            { label: 'Total AMCs', value: stats.total, icon: FileText, color: 'text-slate-700' },
            { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-green-600' },
            { label: 'Expiring/Expired', value: stats.expiring_soon + stats.expired, icon: AlertTriangle, color: 'text-red-600' },
            { label: 'Pending Renewal', value: stats.pending_renewal, icon: Clock, color: 'text-amber-600' },
            { label: 'Annual Revenue', value: `₹${(stats.total_revenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-600' },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color} flex-shrink-0`} />
              <div><div className="text-xl font-bold text-slate-800">{s.value}</div><div className="text-xs text-slate-500">{s.label}</div></div>
            </CardContent></Card>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search AMCs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-48 text-sm" data-testid="amc-search" />
          </div>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white" data-testid="amc-filter-client">
            <option value="">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white" data-testid="amc-filter-status">
            <option value="">All Statuses</option>
            {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <Button onClick={() => { setForm({ ...EMPTY }); setEditing(null); setShowForm(true); }} className="bg-amber-500 hover:bg-amber-600 text-white h-9 text-sm" data-testid="add-amc-btn">
          <Plus className="w-4 h-4 mr-1" /> Add AMC
        </Button>
      </div>

      {/* Table */}
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Contract</TableHead><TableHead>Client</TableHead><TableHead>Coverage</TableHead>
            <TableHead>Period</TableHead><TableHead>Amount</TableHead><TableHead>Devices</TableHead>
            <TableHead>Visits</TableHead><TableHead>Linked Assets</TableHead><TableHead>Status</TableHead><TableHead className="w-20">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {amcs.length === 0 && <TableRow><TableCell colSpan={10} className="text-center py-12 text-slate-400">No AMC contracts found.</TableCell></TableRow>}
            {amcs.map(amc => (
              <TableRow key={amc.id} className={isExpiringSoon(amc.end_date) ? 'bg-amber-50' : ''} data-testid={`amc-row-${amc.id}`}>
                <TableCell className="font-medium text-sm">{amc.contract_name}</TableCell>
                <TableCell className="text-sm">{amc.client_name || '—'}</TableCell>
                <TableCell className="text-xs capitalize">{amc.coverage_type?.replace('_', ' ')}</TableCell>
                <TableCell className="text-xs text-slate-500">{amc.start_date} → {amc.end_date}</TableCell>
                <TableCell className="text-sm font-medium">₹{(amc.amount || 0).toLocaleString('en-IN')}</TableCell>
                <TableCell className="text-sm text-center">{amc.devices_covered || '—'}</TableCell>
                <TableCell className="text-sm text-center">{amc.number_of_visits || '—'}</TableCell>
                <TableCell className="text-sm text-center">
                  {amc.asset_ids?.length ? <span className="flex items-center gap-1 text-xs text-blue-600"><Link2 className="w-3 h-3" />{amc.asset_ids.length}</span> : '—'}
                </TableCell>
                <TableCell><StatusBadge status={amc.status} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(amc)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="w-4 h-4 text-slate-500" /></button>
                    <button onClick={() => handleDelete(amc.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit AMC Contract' : 'Add AMC Contract'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Client *</Label>
                <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" required data-testid="amc-client">
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div><Label>Contract Name *</Label>
                <Input value={form.contract_name} onChange={e => setForm({ ...form, contract_name: e.target.value })} placeholder="e.g. Annual IT AMC 2025" required data-testid="amc-name" />
              </div>
              <div><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required data-testid="amc-start" /></div>
              <div><Label>End Date *</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required data-testid="amc-end" /></div>
              <div><Label>Coverage Type</Label>
                <select value={form.coverage_type} onChange={e => setForm({ ...form, coverage_type: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="amc-coverage">
                  {COVERAGE_OPTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g. 50000" data-testid="amc-amount" /></div>
              <div><Label>Billing Cycle</Label>
                <select value={form.billing_cycle} onChange={e => setForm({ ...form, billing_cycle: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm capitalize" data-testid="amc-billing">
                  {BILLING_OPTS.map(b => <option key={b} value={b}>{b.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div><Label>Devices Covered</Label><Input type="number" value={form.devices_covered} onChange={e => setForm({ ...form, devices_covered: e.target.value })} data-testid="amc-devices" /></div>
              <div><Label>Number of Visits</Label><Input type="number" value={form.number_of_visits} onChange={e => setForm({ ...form, number_of_visits: e.target.value })} placeholder="e.g. 4" data-testid="amc-num-visits" /></div>
              <div><Label>Visit Frequency</Label>
                <select value={form.visit_frequency} onChange={e => setForm({ ...form, visit_frequency: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="amc-visits">
                  {VISIT_OPTS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
              <div><Label>Status</Label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="amc-status">
                  {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.includes_parts} onChange={e => setForm({ ...form, includes_parts: e.target.checked })} /> Includes Parts</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.includes_onsite} onChange={e => setForm({ ...form, includes_onsite: e.target.checked })} /> Includes On-site</label>
              </div>
            </div>
            {/* Linked Assets */}
            {form.client_id && (
              <div data-testid="amc-asset-linker">
                <Label className="flex items-center gap-2 mb-2"><Link2 className="w-4 h-4" /> Link Assets from Register</Label>
                {(form.asset_ids || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(form.asset_ids || []).map(aid => {
                      const a = clientAssets.find(x => x.id === aid);
                      return <span key={aid} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                        <Monitor className="w-3 h-3" />{a ? `${a.asset_tag} ${a.brand} ${a.model}` : aid}
                        <button type="button" onClick={() => toggleAsset(aid)} className="hover:text-red-500"><XIcon className="w-3 h-3" /></button>
                      </span>;
                    })}
                  </div>
                )}
                <Input placeholder="Search assets..." value={assetSearch} onChange={e => setAssetSearch(e.target.value)} className="h-8 text-xs mb-1" data-testid="amc-asset-search" />
                <div className="max-h-32 overflow-y-auto border rounded-md">
                  {clientAssets
                    .filter(a => !assetSearch || `${a.asset_tag} ${a.brand} ${a.model} ${a.serial_number}`.toLowerCase().includes(assetSearch.toLowerCase()))
                    .slice(0, 20)
                    .map(a => (
                      <label key={a.id} className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-slate-50 border-b last:border-0 ${(form.asset_ids || []).includes(a.id) ? 'bg-blue-50' : ''}`}>
                        <input type="checkbox" checked={(form.asset_ids || []).includes(a.id)} onChange={() => toggleAsset(a.id)} className="rounded" />
                        <span className="font-mono text-slate-500">{a.asset_tag}</span>
                        <span className="capitalize">{a.type}</span>
                        <span className="font-medium">{a.brand} {a.model}</span>
                        {a.serial_number && <span className="text-slate-400">S/N: {a.serial_number}</span>}
                      </label>
                    ))
                  }
                  {clientAssets.length === 0 && <div className="p-3 text-xs text-slate-400 text-center">No assets found for this client</div>}
                </div>
              </div>
            )}
            <div><Label>Notes</Label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full h-20 px-3 py-2 rounded-md border text-sm resize-none" placeholder="Additional notes..." /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="save-amc-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update AMC' : 'Create AMC'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
