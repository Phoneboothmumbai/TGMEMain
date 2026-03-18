import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { useWorkspaceAuth } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { ASSET_TYPE_CONFIGS, ALL_TYPE_OPTIONS, BULK_TEMPLATE_HEADERS } from '../../data/assetTypeConfigs';
import {
  Monitor, Plus, Search, Loader2, QrCode, Trash2, Pencil, ChevronDown, ChevronUp,
  Laptop, Server, Printer, Wifi, Shield, HardDrive, Mouse, Keyboard,
  AlertTriangle, CheckCircle2, Wrench, Package, Download, Upload, Camera, X,
  History, FileText
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'in_repair', label: 'In Repair', color: 'bg-amber-100 text-amber-700' },
  { value: 'in_stock', label: 'In Stock', color: 'bg-blue-100 text-blue-700' },
  { value: 'retired', label: 'Retired', color: 'bg-slate-100 text-slate-600' },
  { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-700' },
  { value: 'disposed', label: 'Disposed', color: 'bg-slate-200 text-slate-500' },
];

const TYPE_ICONS = {
  laptop: Laptop, desktop: Monitor, monitor: Monitor, server: Server, printer: Printer,
  router: Wifi, switch: Wifi, access_point: Wifi, firewall: Shield,
  ups: HardDrive, keyboard: Keyboard, mouse: Mouse, nas: HardDrive,
  cctv: Camera, nvr: Camera, phone: Monitor, tablet: Monitor,
};

function StatusBadge({ status }) {
  const opt = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt.color}`}>{opt.label}</span>;
}

function TypeIcon({ type }) {
  const Icon = TYPE_ICONS[type] || Package;
  return <Icon className="w-4 h-4 text-slate-500" />;
}

// Dynamic spec fields renderer
function SpecFields({ type, specs, onChange }) {
  const config = ASSET_TYPE_CONFIGS[type];
  if (!config?.specFields?.length) return null;

  return (
    <div className="border-t border-slate-100 pt-4 mt-4">
      <h4 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
        {config.label} Configuration
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {config.specFields.map(field => (
          <div key={field.key}>
            <Label className="text-xs">{field.label}</Label>
            {field.type === 'select' ? (
              <select
                value={specs[field.key] || ''}
                onChange={e => onChange({ ...specs, [field.key]: e.target.value })}
                className="w-full h-9 px-3 rounded-md border text-sm bg-white"
                data-testid={`spec-${field.key}`}
              >
                <option value="">Select...</option>
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <Input
                type={field.type === 'date' ? 'date' : 'text'}
                value={specs[field.key] || ''}
                onChange={e => onChange({ ...specs, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="h-9 text-sm"
                data-testid={`spec-${field.key}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// CSV Parser
function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    const row = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim().replace(/^"|"$/g, ''); });
    return row;
  });
}

const EMPTY_FORM = {
  type: 'laptop', brand: '', model: '', serial_number: '', status: 'active',
  client_id: '', location_id: '', assigned_to: '',
  purchase_date: '', warranty_expiry: '', amc_linked: false, amc_expiry: '',
  specs: {}, parent_asset_id: '', notes: '',
};

export default function AssetsPage() {
  const { employee } = useWorkspaceAuth();
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [expandedAsset, setExpandedAsset] = useState(null);
  const [expandedData, setExpandedData] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showAccessory, setShowAccessory] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [accessoryForm, setAccessoryForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [assetsRes, statsRes, clientsRes] = await Promise.all([
        workspaceApi.getAssets({ client_id: filterClient, status: filterStatus, type: filterType, search }),
        workspaceApi.getAssetStats(filterClient),
        workspaceApi.getClients(),
      ]);
      setAssets(assetsRes.assets || []);
      setStats(statsRes);
      setClients(clientsRes || []);
    } catch (error) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [filterClient, filterStatus, filterType, search]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadLocations = async (clientId) => {
    if (!clientId) { setLocations([]); return; }
    try {
      const locs = await workspaceApi.getLocations(clientId);
      setLocations(locs || []);
    } catch { setLocations([]); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.brand.trim() || !form.model.trim() || !form.client_id) {
      toast.error('Brand, model, and client are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, created_by: employee?.employee_id || '' };
      if (editingAsset) {
        await workspaceApi.updateAsset(editingAsset.id, payload);
        toast.success('Asset updated');
      } else {
        await workspaceApi.createAsset(payload);
        toast.success('Asset created');
      }
      setShowAdd(false);
      setEditingAsset(null);
      setForm({ ...EMPTY_FORM });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAccessory = async (e) => {
    e.preventDefault();
    if (!accessoryForm.brand.trim() || !accessoryForm.model.trim()) {
      toast.error('Brand and model are required');
      return;
    }
    setSaving(true);
    try {
      await workspaceApi.createAsset({
        ...accessoryForm,
        client_id: expandedData.client_id,
        location_id: expandedData.location_id,
        parent_asset_id: expandedData.id,
        created_by: employee?.employee_id || '',
      });
      toast.success('Accessory added');
      setShowAccessory(false);
      setAccessoryForm({ ...EMPTY_FORM });
      toggleExpand(expandedData.id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset and all its accessories?')) return;
    try {
      await workspaceApi.deleteAsset(id);
      toast.success('Asset deleted');
      setExpandedAsset(null);
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openEdit = (asset) => {
    setForm({
      type: asset.type || 'laptop', brand: asset.brand || '', model: asset.model || '',
      serial_number: asset.serial_number || '', status: asset.status || 'active',
      client_id: asset.client_id || '', location_id: asset.location_id || '',
      assigned_to: asset.assigned_to || '', purchase_date: asset.purchase_date || '',
      warranty_expiry: asset.warranty_expiry || '', amc_linked: asset.amc_linked || false,
      amc_expiry: asset.amc_expiry || '', specs: asset.specs || {},
      parent_asset_id: asset.parent_asset_id || '', notes: asset.notes || '',
    });
    if (asset.client_id) loadLocations(asset.client_id);
    setEditingAsset(asset);
    setShowAdd(true);
  };

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setEditingAsset(null);
    setLocations([]);
    setShowAdd(true);
  };

  const toggleExpand = async (id) => {
    if (expandedAsset === id) { setExpandedAsset(null); setExpandedData(null); return; }
    try {
      const detail = await workspaceApi.getAsset(id);
      setExpandedData(detail);
      setExpandedAsset(id);
    } catch { toast.error('Failed to load asset details'); }
  };

  const openQR = async (id) => {
    try {
      const qr = await workspaceApi.getAssetQR(id);
      setShowQR(qr);
    } catch { toast.error('Failed to generate QR'); }
  };

  // Bulk upload handler
  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setBulkResult(null);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) { toast.error('No data found in file'); return; }

      // Map CSV rows to asset format, extract specs from extra columns
      const commonFields = ['client_name', 'location', 'type', 'brand', 'model', 'serial_number', 'status', 'assigned_to', 'purchase_date', 'warranty_expiry', 'notes'];
      const mappedRows = rows.map(row => {
        const specs = {};
        Object.keys(row).forEach(k => {
          if (!commonFields.includes(k) && row[k]) specs[k] = row[k];
        });
        return { ...row, specs };
      });

      const result = await workspaceApi.bulkUploadAssets(mappedRows);
      setBulkResult(result);
      toast.success(`${result.created} assets created`);
      if (result.errors?.length) toast.warning(`${result.errors.length} errors`);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Download CSV template
  const downloadTemplate = (type) => {
    const common = BULK_TEMPLATE_HEADERS.common;
    const typeSpecific = BULK_TEMPLATE_HEADERS[type] || BULK_TEMPLATE_HEADERS.default;
    const headers = [...common, ...typeSpecific];
    const sampleRow = headers.map(h => {
      const samples = {
        client_name: 'Acme Corp', location: 'Head Office', type: type, brand: 'HP',
        model: 'ProBook 450', serial_number: 'ABC123', status: 'active',
        assigned_to: 'John', purchase_date: '2024-01-15', warranty_expiry: '2025-01-15', notes: '',
      };
      return samples[h] || '';
    });
    const csv = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `asset_template_${type}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="space-y-6" data-testid="assets-page">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" data-testid="asset-stats">
          {[
            { label: 'Total Assets', value: stats.total, icon: Monitor, color: 'text-slate-700' },
            { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-green-600' },
            { label: 'In Repair', value: stats.in_repair, icon: Wrench, color: 'text-amber-600' },
            { label: 'In Stock', value: stats.in_stock, icon: Package, color: 'text-blue-600' },
            { label: 'Retired/Lost', value: stats.retired, icon: AlertTriangle, color: 'text-slate-500' },
            { label: 'Warranty Exp.', value: stats.warranty_expiring, icon: AlertTriangle, color: 'text-red-600' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-5 h-5 ${s.color} flex-shrink-0`} />
                <div>
                  <div className="text-xl font-bold text-slate-800">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 w-48 text-sm" data-testid="asset-search" />
          </div>
          <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white" data-testid="filter-client">
            <option value="">All Clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white" data-testid="filter-type">
            <option value="">All Types</option>
            {ALL_TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white" data-testid="filter-status">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulk(true)} className="h-9 text-sm" data-testid="bulk-upload-btn">
            <Upload className="w-4 h-4 mr-1" /> Bulk Upload
          </Button>
          <Button onClick={openAdd} className="bg-amber-500 hover:bg-amber-600 text-white h-9 text-sm" data-testid="add-asset-btn">
            <Plus className="w-4 h-4 mr-1" /> Add Asset
          </Button>
        </div>
      </div>

      {/* Asset Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Asset Tag</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand / Model</TableHead>
                <TableHead>Serial #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center py-12 text-slate-400">No assets found. Click "Add Asset" to get started.</TableCell></TableRow>
              )}
              {assets.map(asset => (
                <React.Fragment key={asset.id}>
                  <TableRow className="cursor-pointer hover:bg-slate-50" onClick={() => toggleExpand(asset.id)} data-testid={`asset-row-${asset.asset_tag}`}>
                    <TableCell>
                      {expandedAsset === asset.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-amber-600">{asset.asset_tag}</TableCell>
                    <TableCell><div className="flex items-center gap-1.5"><TypeIcon type={asset.type} /><span className="text-sm capitalize">{(ALL_TYPE_OPTIONS.find(t => t.value === asset.type)?.label) || asset.type?.replace('_', ' ')}</span></div></TableCell>
                    <TableCell className="text-sm">{asset.brand} {asset.model}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{asset.serial_number || '—'}</TableCell>
                    <TableCell className="text-sm">{asset.client_name || '—'}</TableCell>
                    <TableCell className="text-sm text-slate-500">{asset.location_name || '—'}</TableCell>
                    <TableCell className="text-sm">{asset.assigned_to || '—'}</TableCell>
                    <TableCell><StatusBadge status={asset.status} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openQR(asset.id)} className="p-1.5 hover:bg-slate-100 rounded" title="QR Code"><QrCode className="w-4 h-4 text-slate-500" /></button>
                        <button onClick={() => openEdit(asset)} className="p-1.5 hover:bg-slate-100 rounded" title="Edit"><Pencil className="w-4 h-4 text-slate-500" /></button>
                        <button onClick={() => handleDelete(asset.id)} className="p-1.5 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Expanded Detail */}
                  {expandedAsset === asset.id && expandedData && (
                    <TableRow>
                      <TableCell colSpan={10} className="bg-slate-50 p-0">
                        <ExpandedAssetDetail
                          data={expandedData}
                          onAddAccessory={() => { setAccessoryForm({ ...EMPTY_FORM, type: 'keyboard' }); setShowAccessory(true); }}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Asset Dialog with Dynamic Form */}
      <Dialog open={showAdd} onOpenChange={v => { if (!v) { setShowAdd(false); setEditingAsset(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle data-testid="asset-dialog-title">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Device Type *</Label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, specs: {} })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="asset-type">
                  {ALL_TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="asset-status">
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Brand *</Label>
                <Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. HP, Dell, Cisco, Hikvision" required data-testid="asset-brand" />
              </div>
              <div>
                <Label>Model *</Label>
                <Input value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder="e.g. ProBook 450 G8" required data-testid="asset-model" />
              </div>
              <div>
                <Label>Serial Number</Label>
                <Input value={form.serial_number} onChange={e => setForm({ ...form, serial_number: e.target.value })} placeholder="e.g. 5CD1234567" data-testid="asset-serial" />
              </div>
              <div>
                <Label>Client *</Label>
                <select value={form.client_id} onChange={e => { setForm({ ...form, client_id: e.target.value, location_id: '' }); loadLocations(e.target.value); }}
                  className="w-full h-10 px-3 rounded-md border text-sm" required data-testid="asset-client">
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                </select>
              </div>
              <div>
                <Label>Location</Label>
                <select value={form.location_id} onChange={e => setForm({ ...form, location_id: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border text-sm" data-testid="asset-location">
                  <option value="">Select Location</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                </select>
              </div>
              <div>
                <Label>Assigned To</Label>
                <Input value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} placeholder="Person using this asset" data-testid="asset-assigned" />
              </div>
              <div>
                <Label>Purchase Date</Label>
                <Input type="date" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} data-testid="asset-purchase-date" />
              </div>
              <div>
                <Label>Warranty Expiry</Label>
                <Input type="date" value={form.warranty_expiry} onChange={e => setForm({ ...form, warranty_expiry: e.target.value })} data-testid="asset-warranty" />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={form.amc_linked} onChange={e => setForm({ ...form, amc_linked: e.target.checked })} id="amc_linked" data-testid="asset-amc-linked" />
                <Label htmlFor="amc_linked" className="mb-0">AMC Linked</Label>
              </div>
              {form.amc_linked && (
                <div>
                  <Label>AMC Expiry</Label>
                  <Input type="date" value={form.amc_expiry} onChange={e => setForm({ ...form, amc_expiry: e.target.value })} data-testid="asset-amc-expiry" />
                </div>
              )}
            </div>

            {/* Dynamic Spec Fields */}
            <SpecFields type={form.type} specs={form.specs} onChange={specs => setForm({ ...form, specs })} />

            <div>
              <Label>Notes</Label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full h-20 px-3 py-2 rounded-md border text-sm resize-none" placeholder="Additional notes..." data-testid="asset-notes" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowAdd(false); setEditingAsset(null); }}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="save-asset-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAsset ? 'Update Asset' : 'Create Asset'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Accessory Dialog */}
      <Dialog open={showAccessory} onOpenChange={setShowAccessory}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Accessory</DialogTitle></DialogHeader>
          <form onSubmit={handleAddAccessory} className="space-y-3">
            <div>
              <Label>Type</Label>
              <select value={accessoryForm.type} onChange={e => setAccessoryForm({ ...accessoryForm, type: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm">
                {ALL_TYPE_OPTIONS.filter(t => ['keyboard', 'mouse', 'webcam', 'headset', 'monitor', 'other'].includes(t.value)).map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Brand *</Label><Input value={accessoryForm.brand} onChange={e => setAccessoryForm({ ...accessoryForm, brand: e.target.value })} required /></div>
              <div><Label>Model *</Label><Input value={accessoryForm.model} onChange={e => setAccessoryForm({ ...accessoryForm, model: e.target.value })} required /></div>
            </div>
            <div><Label>Serial Number</Label><Input value={accessoryForm.serial_number} onChange={e => setAccessoryForm({ ...accessoryForm, serial_number: e.target.value })} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAccessory(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="save-accessory-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Accessory'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!showQR} onOpenChange={() => setShowQR(null)}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader><DialogTitle>Asset QR Code</DialogTitle></DialogHeader>
          {showQR && (
            <div className="space-y-3" data-testid="qr-dialog">
              <div className="bg-white p-4 rounded-lg border inline-block mx-auto">
                <img src={`data:image/png;base64,${showQR.qr_code}`} alt="QR Code" className="w-48 h-48 mx-auto" />
              </div>
              <div className="font-mono text-lg font-bold text-amber-600">{showQR.asset_tag}</div>
              <div className="text-sm text-slate-600">{showQR.label}</div>
              {showQR.serial && <div className="text-xs text-slate-400">S/N: {showQR.serial}</div>}
              <div className="text-xs text-slate-400">{showQR.client_name}</div>
              <Button variant="outline" size="sm" onClick={() => {
                const link = document.createElement('a');
                link.href = `data:image/png;base64,${showQR.qr_code}`;
                link.download = `${showQR.asset_tag}.png`;
                link.click();
              }} data-testid="download-qr-btn"><Download className="w-4 h-4 mr-1" /> Download QR</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulk} onOpenChange={v => { setShowBulk(v); setBulkResult(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Bulk Asset Upload</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Upload a CSV file with asset data. Download a template first, fill it in, then upload.</p>

            <div>
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2 block">Download Template</Label>
              <div className="flex flex-wrap gap-2">
                {['laptop', 'desktop', 'server', 'printer', 'cctv', 'router', 'switch', 'firewall', 'ups', 'monitor'].map(t => (
                  <button key={t} onClick={() => downloadTemplate(t)}
                    className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 rounded-md font-medium text-slate-700 transition-colors" data-testid={`template-${t}`}>
                    <Download className="w-3 h-3 inline mr-1" />{ALL_TYPE_OPTIONS.find(o => o.value === t)?.label || t}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 mb-3">Drop CSV file here or click to browse</p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" data-testid="bulk-file-input" />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={saving} data-testid="browse-file-btn">
                {saving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Processing...</> : 'Choose File'}
              </Button>
            </div>

            {bulkResult && (
              <div className="rounded-lg border p-4 space-y-2" data-testid="bulk-result">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">{bulkResult.created} assets created successfully</span>
                </div>
                {bulkResult.errors?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-600 mb-1">{bulkResult.errors.length} errors:</p>
                    <div className="max-h-32 overflow-y-auto text-xs text-red-500 bg-red-50 rounded p-2">
                      {bulkResult.errors.map((err, i) => <div key={i}>{err}</div>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Expanded asset detail with specs, accessories, and service history
function ExpandedAssetDetail({ data, onAddAccessory }) {
  const config = ASSET_TYPE_CONFIGS[data.type];
  const specFields = config?.specFields || [];
  const filledSpecs = specFields.filter(f => data.specs?.[f.key]);

  return (
    <div className="p-5 space-y-4" data-testid="asset-detail">
      {/* Basic Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div><span className="text-slate-400 text-xs block">Purchase Date</span><span className="font-medium">{data.purchase_date || '—'}</span></div>
        <div><span className="text-slate-400 text-xs block">Warranty Expiry</span>
          <span className={`font-medium ${data.warranty_expiry && data.warranty_expiry < new Date().toISOString().slice(0, 10) ? 'text-red-600' : ''}`}>
            {data.warranty_expiry || '—'}
          </span>
        </div>
        <div><span className="text-slate-400 text-xs block">AMC</span><span className="font-medium">{data.amc_linked ? `Yes (exp: ${data.amc_expiry || '—'})` : 'No'}</span></div>
        <div><span className="text-slate-400 text-xs block">Created By</span><span className="font-medium">{data.created_by || '—'}</span></div>
      </div>

      {/* Device-specific specs */}
      {filledSpecs.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">
            {config?.label || 'Device'} Specifications
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filledSpecs.map(f => (
              <div key={f.key} className="bg-white border rounded-lg px-3 py-2">
                <span className="text-slate-400 text-[10px] uppercase tracking-wide block">{f.label}</span>
                <span className="text-sm font-medium text-slate-700">{data.specs[f.key]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generic specs fallback */}
      {filledSpecs.length === 0 && data.specs && Object.keys(data.specs).length > 0 && (
        <div>
          <span className="text-slate-400 text-xs block mb-1">Specs</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.specs).map(([k, v]) => (
              <span key={k} className="bg-white border px-2 py-1 rounded text-xs"><span className="text-slate-400">{k}:</span> {v}</span>
            ))}
          </div>
        </div>
      )}

      {data.notes && <div><span className="text-slate-400 text-xs block">Notes</span><p className="text-sm">{data.notes}</p></div>}

      {/* Assignment History */}
      {data.assignment_history?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Assignment History</span>
          </div>
          <div className="space-y-1.5">
            {data.assignment_history.map((h, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border rounded-lg px-3 py-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-slate-700">{h.assigned_to}</span>
                  <span className="text-slate-400 text-xs ml-2">
                    {h.assigned_from?.slice(0, 10) || '?'} &rarr; {h.unassigned_date?.slice(0, 10) || '?'}
                  </span>
                </div>
                {h.client_name && <span className="text-xs text-slate-400">{h.client_name}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accessories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Accessories ({data.accessories?.length || 0})</span>
          <Button size="sm" variant="outline" onClick={onAddAccessory} className="h-7 text-xs" data-testid="add-accessory-btn">
            <Plus className="w-3 h-3 mr-1" /> Add Accessory
          </Button>
        </div>
        {data.accessories?.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.accessories.map(acc => (
              <div key={acc.id} className="flex items-center gap-2 bg-white border rounded-lg p-2.5 text-sm">
                <TypeIcon type={acc.type} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{acc.brand} {acc.model}</div>
                  <div className="text-xs text-slate-400">{acc.asset_tag} {acc.serial_number ? `/ ${acc.serial_number}` : ''}</div>
                </div>
                <StatusBadge status={acc.status} />
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-slate-400">No accessories attached.</p>}
      </div>

      {/* Service History */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <History className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Service History ({data.maintenance_history?.length || 0})</span>
        </div>
        {data.maintenance_history?.length > 0 ? (
          <div className="space-y-2">
            {data.maintenance_history.map((entry, i) => (
              <div key={i} className="bg-white border rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-700">{entry.service_type || entry.work_done || 'Service Entry'}</span>
                  <span className="text-xs text-slate-400">{entry.service_date || entry.created_at?.slice(0, 10) || ''}</span>
                </div>
                {entry.description && <p className="text-xs text-slate-500">{entry.description}</p>}
                {entry.parts_used && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <FileText className="w-3 h-3" /> Parts: {Array.isArray(entry.parts_used) ? entry.parts_used.join(', ') : entry.parts_used}
                  </div>
                )}
                {entry.technician && <div className="text-xs text-slate-400 mt-1">Technician: {entry.technician}</div>}
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-slate-400">No service history recorded for this asset.</p>}
      </div>
    </div>
  );
}
