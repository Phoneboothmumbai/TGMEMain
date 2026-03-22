import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import {
  Search, Loader2, Users, Globe, Phone, Mail, MapPin,
  TrendingUp, Eye, Zap, Play, RefreshCw, ChevronDown,
  MessageCircle, ExternalLink, Trash2, StickyNote, Filter, BarChart3
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
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Scraper state
  const [scraperConfig, setScraperConfig] = useState(null);
  const [showScraper, setShowScraper] = useState(false);
  const [scrapeForm, setScrapeForm] = useState({ locations: [], business_types: [], sources: ['google'] });
  const [scrapeJobs, setScrapeJobs] = useState([]);
  const [scraping, setScraping] = useState(false);

  // Visitor stats
  const [visitorStats, setVisitorStats] = useState(null);
  const [showVisitors, setShowVisitors] = useState(false);

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

  const loadScraperData = async () => {
    const [cfg, jobs] = await Promise.all([
      fetch(`${API}/api/leads/scraper/config`).then(r => r.json()),
      fetch(`${API}/api/leads/scraper/jobs`).then(r => r.json()),
    ]);
    setScraperConfig(cfg);
    setScrapeJobs(jobs);
  };

  const loadVisitors = async () => {
    const v = await fetch(`${API}/api/leads/visitors/stats?days=7`).then(r => r.json());
    setVisitorStats(v);
  };

  const startScrape = async () => {
    if (scrapeForm.locations.length === 0 || scrapeForm.business_types.length === 0) {
      toast.error('Select at least one location and business type');
      return;
    }
    setScraping(true);
    try {
      const r = await fetch(`${API}/api/leads/scraper/start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scrapeForm),
      }).then(r => r.json());
      toast.success(`Scrape job started: ${r.job_id}`);
      loadScraperData();
    } catch { toast.error('Failed to start scrape'); }
    finally { setScraping(false); }
  };

  const updateLead = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/leads/${selected.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      toast.success('Lead updated');
      setSelected(null);
      loadData();
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await fetch(`${API}/api/leads/${id}`, { method: 'DELETE' });
    toast.success('Lead deleted');
    loadData();
  };

  const openEdit = (lead) => {
    setSelected(lead);
    setEditForm({ status: lead.status, priority: lead.priority, notes: lead.notes || '', assigned_to: lead.assigned_to || '', next_followup: lead.next_followup || '' });
  };

  const toggleArray = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-5" data-testid="lead-dashboard">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Lead Generation</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setShowVisitors(true); loadVisitors(); }} data-testid="show-visitors-btn">
            <Eye className="w-4 h-4 mr-1" /> Visitors
          </Button>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => { setShowScraper(true); loadScraperData(); }} data-testid="open-scraper-btn">
            <Zap className="w-4 h-4 mr-1" /> Lead Scraper
          </Button>
        </div>
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
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4" /></Button>
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
              <TableRow key={lead.id} className="cursor-pointer hover:bg-slate-50" data-testid={`lead-row-${lead.id}`}>
                <TableCell onClick={() => openEdit(lead)}>
                  <div className="font-medium text-sm text-slate-800">{lead.name}</div>
                  {lead.company && lead.company !== lead.name && <div className="text-xs text-slate-400">{lead.company}</div>}
                  {lead.business_type && <div className="text-xs text-amber-600 capitalize">{lead.business_type}</div>}
                  {lead.location && <div className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{lead.location}</div>}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {lead.phone && <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline"><Phone className="w-3 h-3" />{lead.phone}</a>}
                    {lead.email && <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-slate-500 hover:underline"><Mail className="w-3 h-3" />{lead.email}</a>}
                    {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-slate-400 hover:underline"><Globe className="w-3 h-3" />Website</a>}
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
                  <div className="flex items-center gap-1">
                    {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi, this is Chaarudutt from The Good Men Enterprise. We provide IT support services. Would you be interested in a free IT consultation?')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-green-50 rounded" title="WhatsApp"><MessageCircle className="w-4 h-4 text-green-500" /></a>}
                    {lead.phone && <a href={`tel:${lead.phone}`} className="p-1.5 hover:bg-blue-50 rounded" title="Call"><Phone className="w-4 h-4 text-blue-500" /></a>}
                    <button onClick={() => openEdit(lead)} className="p-1.5 hover:bg-amber-50 rounded" title="Edit"><StickyNote className="w-4 h-4 text-amber-500" /></button>
                    <button onClick={() => deleteLead(lead.id)} className="p-1.5 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      {/* Edit Lead Dialog */}
      <Dialog open={!!selected} onOpenChange={v => { if (!v) setSelected(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Lead — {selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {selected?.phone && <div className="p-2 bg-slate-50 rounded text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {selected.phone}</div>}
            {selected?.address && <div className="p-2 bg-slate-50 rounded text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {selected.address}</div>}
            <div><Label>Status</Label>
              <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="edit-lead-status">
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
            <div><Label>Priority</Label>
              <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="edit-lead-priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div><Label>Notes</Label>
              <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} className="w-full h-20 px-3 py-2 rounded-md border text-sm resize-none" placeholder="Add notes about this lead..." data-testid="edit-lead-notes" />
            </div>
            <div><Label>Next Follow-up</Label><Input type="date" value={editForm.next_followup} onChange={e => setEditForm({ ...editForm, next_followup: e.target.value })} data-testid="edit-lead-followup" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={updateLead} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="save-lead-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scraper Dialog */}
      <Dialog open={showScraper} onOpenChange={v => { if (!v) setShowScraper(false); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Lead Scraper</DialogTitle></DialogHeader>
          {scraperConfig && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-sm mb-2 block">Locations (select areas to search)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {scraperConfig.locations.map(loc => (
                    <button key={loc} onClick={() => setScrapeForm(f => ({ ...f, locations: toggleArray(f.locations, loc) }))}
                      className={`px-2.5 py-1 rounded-full text-xs transition-colors ${scrapeForm.locations.includes(loc) ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {loc.replace(' Mumbai', '')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-sm mb-2 block">Business Types (what to search for)</Label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {scraperConfig.business_types.map(bt => (
                    <button key={bt} onClick={() => setScrapeForm(f => ({ ...f, business_types: toggleArray(f.business_types, bt) }))}
                      className={`px-2.5 py-1 rounded-full text-xs capitalize transition-colors ${scrapeForm.business_types.includes(bt) ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {bt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-semibold text-sm mb-2 block">Sources</Label>
                <div className="flex gap-2">
                  {scraperConfig.sources.map(s => (
                    <button key={s} onClick={() => setScrapeForm(f => ({ ...f, sources: toggleArray(f.sources, s) }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${scrapeForm.sources.includes(s) ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={startScrape} disabled={scraping} className="w-full bg-amber-500 hover:bg-amber-600 text-white h-11" data-testid="start-scrape-btn">
                {scraping ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                Start Scraping ({scrapeForm.locations.length} locations x {scrapeForm.business_types.length} types)
              </Button>

              {/* Scrape Jobs History */}
              {scrapeJobs.length > 0 && (
                <div>
                  <Label className="font-semibold text-sm mb-2 block">Recent Jobs</Label>
                  <div className="space-y-2">
                    {scrapeJobs.map(j => (
                      <div key={j.job_id} className="p-3 bg-slate-50 rounded-lg text-xs" data-testid={`scrape-job-${j.job_id}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-500">#{j.job_id}</span>
                          <span className={`px-2 py-0.5 rounded-full font-medium ${j.status === 'completed' ? 'bg-green-100 text-green-700' : j.status === 'running' ? 'bg-amber-100 text-amber-700' : j.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{j.status}</span>
                        </div>
                        <div className="mt-1 text-slate-500">Found: {j.found} | New leads: <span className="font-bold text-green-600">{j.new_leads}</span></div>
                        {j.last_query && <div className="text-slate-400 mt-0.5">Last: {j.last_query}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Visitor Stats Dialog */}
      <Dialog open={showVisitors} onOpenChange={v => { if (!v) setShowVisitors(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Website Visitors (7 days)</DialogTitle></DialogHeader>
          {visitorStats ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500 mb-2 block">Daily Traffic</Label>
                <div className="flex items-end gap-1 h-24">
                  {visitorStats.daily.map(d => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[10px] font-bold text-slate-600">{d.visits}</div>
                      <div className="w-full bg-amber-400 rounded-t" style={{ height: `${Math.max(4, (d.visits / Math.max(...visitorStats.daily.map(x => x.visits || 1))) * 60)}px` }} />
                      <div className="text-[9px] text-slate-400">{d.date.slice(5)}</div>
                    </div>
                  ))}
                </div>
              </div>
              {visitorStats.top_pages?.length > 0 && (
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Top Pages</Label>
                  {visitorStats.top_pages.slice(0, 5).map(p => (
                    <div key={p.page} className="flex items-center justify-between py-1 text-xs">
                      <span className="text-slate-600 truncate max-w-[280px]">{p.page}</span>
                      <span className="font-bold text-amber-600">{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
