import React, { useState, useEffect } from 'react';
import { usePortalAuth, portalApi } from '../../contexts/PortalAuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2, Shield } from 'lucide-react';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700', expired: 'bg-red-100 text-red-700',
  pending_renewal: 'bg-amber-100 text-amber-700', cancelled: 'bg-slate-100 text-slate-600',
};

export default function PortalAMCsPage() {
  const { token } = usePortalAuth();
  const [amcs, setAmcs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi.getAMCs(token).then(setAmcs).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-4 max-w-5xl" data-testid="portal-amcs-page">
      <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Shield className="w-5 h-5" /> AMC Contracts</h1>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Contract</TableHead><TableHead>Coverage</TableHead><TableHead>Period</TableHead>
            <TableHead>Visits</TableHead><TableHead>Frequency</TableHead><TableHead>Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {amcs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400">No AMC contracts.</TableCell></TableRow>}
            {amcs.map(a => (
              <TableRow key={a.id} data-testid={`portal-amc-${a.id}`}>
                <TableCell className="font-medium text-sm">{a.contract_name}</TableCell>
                <TableCell className="text-xs capitalize">{a.coverage_type?.replace('_', ' ')}</TableCell>
                <TableCell className="text-xs text-slate-500">{a.start_date} → {a.end_date}</TableCell>
                <TableCell className="text-sm text-center">{a.number_of_visits || '—'}</TableCell>
                <TableCell className="text-xs capitalize">{a.visit_frequency?.replace('_', ' ')}</TableCell>
                <TableCell><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[a.status] || ''}`}>{a.status?.replace('_', ' ')}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
