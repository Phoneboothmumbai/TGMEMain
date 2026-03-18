import React, { useState, useEffect } from 'react';
import { usePortalAuth, portalApi } from '../../contexts/PortalAuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Search, Loader2, Monitor, ChevronRight, Shield, Wrench } from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700', in_repair: 'bg-amber-100 text-amber-700',
  in_stock: 'bg-blue-100 text-blue-700', retired: 'bg-slate-100 text-slate-600',
};

export default function PortalAssetsPage() {
  const { token } = usePortalAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const params = search ? `search=${encodeURIComponent(search)}` : '';
    portalApi.getAssets(token, params).then(setAssets).catch(console.error).finally(() => setLoading(false));
  }, [token, search]);

  const openDetail = async (asset) => {
    setSelected(asset); setDetailLoading(true);
    try { const d = await portalApi.getAssetDetail(asset.id, token); setDetail(d); }
    catch { setDetail(null); }
    finally { setDetailLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-4 max-w-6xl" data-testid="portal-assets-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Monitor className="w-5 h-5" /> Our Assets</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-56 text-sm" data-testid="portal-asset-search" />
        </div>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Asset Tag</TableHead><TableHead>Type</TableHead><TableHead>Device</TableHead>
            <TableHead>Serial</TableHead><TableHead>Assigned To</TableHead><TableHead>Location</TableHead>
            <TableHead>Status</TableHead><TableHead className="w-10"></TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {assets.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-12 text-slate-400">No assets found.</TableCell></TableRow>}
            {assets.map(a => (
              <TableRow key={a.id} className="cursor-pointer hover:bg-slate-50" onClick={() => openDetail(a)} data-testid={`portal-asset-row-${a.id}`}>
                <TableCell className="font-mono text-xs text-slate-500">{a.asset_tag}</TableCell>
                <TableCell className="text-sm capitalize">{a.type?.replace('_', ' ')}</TableCell>
                <TableCell className="text-sm font-medium">{a.brand} {a.model}</TableCell>
                <TableCell className="text-xs text-slate-500">{a.serial_number || '—'}</TableCell>
                <TableCell className="text-sm">{a.assigned_to || '—'}</TableCell>
                <TableCell className="text-sm">{a.location_name || '—'}</TableCell>
                <TableCell><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>{a.status?.replace('_', ' ')}</span></TableCell>
                <TableCell><ChevronRight className="w-4 h-4 text-slate-400" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      {/* Asset Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={v => { if (!v) { setSelected(null); setDetail(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Monitor className="w-5 h-5" /> {selected?.brand} {selected?.model}</DialogTitle></DialogHeader>
          {detailLoading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div> : detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">Asset Tag:</span> <span className="font-mono">{detail.asset_tag}</span></div>
                <div><span className="text-slate-500">Type:</span> <span className="capitalize">{detail.type?.replace('_', ' ')}</span></div>
                <div><span className="text-slate-500">Serial:</span> {detail.serial_number || '—'}</div>
                <div><span className="text-slate-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[detail.status] || ''}`}>{detail.status?.replace('_', ' ')}</span></div>
                <div><span className="text-slate-500">Assigned To:</span> {detail.assigned_to || '—'}</div>
                <div><span className="text-slate-500">Location:</span> {detail.location_name || '—'}</div>
                <div><span className="text-slate-500">Purchase:</span> {detail.purchase_date || '—'}</div>
                <div><span className="text-slate-500">Warranty:</span> {detail.warranty_expiry || '—'}</div>
              </div>

              {/* AMC Contracts */}
              {detail.amc_contracts?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-amber-500" /> AMC Coverage</h3>
                  {detail.amc_contracts.map(amc => (
                    <div key={amc.id} className="p-2 bg-amber-50 rounded text-xs mb-1">
                      <span className="font-medium">{amc.contract_name}</span> — <span className="capitalize">{amc.status}</span> (until {amc.end_date})
                    </div>
                  ))}
                </div>
              )}

              {/* Service History */}
              <div>
                <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2 mb-2"><Wrench className="w-4 h-4 text-blue-500" /> Service History</h3>
                {detail.service_entries?.length === 0 && <p className="text-xs text-slate-400">No service records yet</p>}
                {detail.service_entries?.map((entry, i) => (
                  <div key={i} className="p-2 bg-slate-50 rounded text-xs mb-1 border-l-2 border-blue-300">
                    <div className="font-medium">{entry.work_performed || entry.service_type || 'Service'}</div>
                    <div className="text-slate-400 mt-0.5">{entry.created_at ? new Date(entry.created_at).toLocaleDateString() : ''} {entry.remarks && `— ${entry.remarks}`}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
