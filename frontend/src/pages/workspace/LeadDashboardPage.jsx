import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import {
  Search, Loader2, Users, Globe, Phone, Mail, MapPin,
  TrendingUp, Eye, Zap, RefreshCw,
  MessageCircle, Trash2, StickyNote
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700', contacted: 'bg-amber-100 text-amber-700',
  qualified: 'bg-purple-100 text-purple-700', converted: 'bg-green-100 text-green-700',
  lost: 'bg-slate-100 text-slate-600',
};
const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-600', medium: 'bg-blue-50 text-blue-600',
  high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700',
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </CardContent>
    </Card>
  );
}

export default function LeadDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [s, l] = await Promise.all([
        fetch(`${API}/api/leads/dashboard/stats`).then(r => r.json()),
        fetch(`${API}/api/leads/all?source=${filterSource}&status=${filterStatus}&search=${encodeURIComponent(search)}&limit=100`).then(r => r.json()),
      ]);
      setStats(s);
      setLeads(l?.leads || []);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, [search, filterSource, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await fetch(`${API}/api/leads/${id}`, { method: 'DELETE' });
    toast.success('Lead deleted');
    loadData();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-5" data-testid="lead-dashboard">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Leads</h1>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <StatCard icon={Users} label="Total Leads" value={stats.total_leads} color="text-blue-600 bg-blue-50" />
          <StatCard icon={Zap} label="New" value={stats.new} color="text-amber-600 bg-amber-50" />
          <StatCard icon={Phone} label="Contacted" value={stats.contacted} color="text-purple-600 bg-purple-50" />
          <StatCard icon={TrendingUp} label="Converted" value={stats.converted} color="text-green-600 bg-green-50" />
          <StatCard icon={Eye} label="Today Visitors" value={stats.today_visitors} color="text-indigo-600 bg-indigo-50" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" data-testid="lead-search" />
        </div>
        <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="h-9 px-3 rounded-md border text-sm" data-testid="lead-source-filter">
          <option value="">All Sources</option>
          <option value="inbound">Inbound (Website)</option>
          <option value="scraped">Scraped</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 px-3 rounded-md border text-sm" data-testid="lead-status-filter">
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Leads Table */}
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name / Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-28">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {leads.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400">No leads found. Run the scraper to find new businesses!</TableCell></TableRow>}
            {leads.map(lead => (
              <TableRow key={lead.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/workspace/sales/leads/${lead.id}`)} data-testid={`lead-row-${lead.id}`}>
                <TableCell>
                  <div className="font-medium text-sm text-slate-800">{lead.name}</div>
                  {lead.company && lead.company !== lead.name && <div className="text-xs text-slate-400">{lead.company}</div>}
                  {lead.business_type && <div className="text-xs text-amber-600 capitalize">{lead.business_type}</div>}
                  {lead.location && <div className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.location}</div>}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {lead.phone && <div className="flex items-center gap-1 text-xs text-blue-600"><Phone className="w-3 h-3" />{lead.phone}</div>}
                    {lead.email && <div className="flex items-center gap-1 text-xs text-slate-500"><Mail className="w-3 h-3" />{lead.email}</div>}
                    {lead.website && <div className="flex items-center gap-1 text-xs text-slate-400"><Globe className="w-3 h-3" />Website</div>}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${lead.lead_type === 'inbound' ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'}`}>
                    {lead.lead_type === 'inbound' ? lead.source || 'website' : 'scraper'}
                  </span>
                </TableCell>
                <TableCell><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[lead.status] || ''}`}>{lead.status}</span></TableCell>
                <TableCell><span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_COLORS[lead.priority] || ''}`}>{lead.priority || 'medium'}</span></TableCell>
                <TableCell className="text-xs text-slate-500">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-green-50 rounded" title="WhatsApp"><MessageCircle className="w-4 h-4 text-green-500" /></a>}
                    {lead.phone && <a href={`tel:${lead.phone}`} className="p-1.5 hover:bg-blue-50 rounded" title="Call"><Phone className="w-4 h-4 text-blue-500" /></a>}
                    <button onClick={() => navigate(`/workspace/sales/leads/${lead.id}`)} className="p-1.5 hover:bg-amber-50 rounded" title="View"><StickyNote className="w-4 h-4 text-amber-500" /></button>
                    <button onClick={() => deleteLead(lead.id)} className="p-1.5 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
