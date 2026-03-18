import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePortalAuth, portalApi } from '../../contexts/PortalAuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2, FileText, Plus } from 'lucide-react';

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700', assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-amber-100 text-amber-700', completed: 'bg-green-100 text-green-700',
  billed: 'bg-slate-100 text-slate-600', part_ordered: 'bg-purple-100 text-purple-700',
  pending_for_part: 'bg-orange-100 text-orange-700',
};

export default function PortalTicketsPage() {
  const { token } = usePortalAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi.getTickets(token).then(setTickets).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-4 max-w-5xl" data-testid="portal-tickets-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText className="w-5 h-5" /> Support Tickets</h1>
        <Link to="/portal/raise-ticket">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white h-9 text-sm" data-testid="raise-ticket-btn"><Plus className="w-4 h-4 mr-1" /> Raise Ticket</Button>
        </Link>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Job ID</TableHead><TableHead>Subject</TableHead><TableHead>Priority</TableHead>
            <TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead>Completed</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {tickets.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400">No tickets yet.</TableCell></TableRow>}
            {tickets.map(t => (
              <TableRow key={t.id} data-testid={`portal-ticket-${t.id}`}>
                <TableCell className="font-mono text-xs text-slate-500">{t.job_id || '—'}</TableCell>
                <TableCell className="font-medium text-sm">{t.title}</TableCell>
                <TableCell className="text-xs capitalize">{t.priority}</TableCell>
                <TableCell><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[t.status] || 'bg-slate-100 text-slate-600'}`}>{t.status?.replace('_', ' ')}</span></TableCell>
                <TableCell className="text-xs text-slate-500">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</TableCell>
                <TableCell className="text-xs text-slate-500">{t.completed_at ? new Date(t.completed_at).toLocaleDateString() : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
