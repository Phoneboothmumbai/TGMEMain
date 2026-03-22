import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Zap, Play, Loader2, RefreshCw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function ScraperPage() {
  const [config, setConfig] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ locations: [], business_types: [], sources: ['google'] });
  const [scraping, setScraping] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [cfg, j] = await Promise.all([
      fetch(`${API}/api/leads/scraper/config`).then(r => r.json()),
      fetch(`${API}/api/leads/scraper/jobs`).then(r => r.json()),
    ]);
    setConfig(cfg); setJobs(j); setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Auto-refresh running jobs
  useEffect(() => {
    if (jobs.some(j => j.status === 'running' || j.status === 'queued')) {
      const t = setInterval(loadData, 5000);
      return () => clearInterval(t);
    }
  }, [jobs]);

  const toggle = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const startScrape = async () => {
    if (form.locations.length === 0 || form.business_types.length === 0) {
      toast.error('Select at least one location and business type'); return;
    }
    setScraping(true);
    try {
      const r = await fetch(`${API}/api/leads/scraper/start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      }).then(r => r.json());
      toast.success(`Scrape job started: #${r.job_id}`);
      loadData();
    } catch { toast.error('Failed to start'); }
    finally { setScraping(false); }
  };

  const selectAll = (key) => {
    if (!config) return;
    const all = config[key] || [];
    setForm(f => ({ ...f, [key]: f[key].length === all.length ? [] : [...all] }));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-5 max-w-4xl" data-testid="scraper-page">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Zap className="w-5 h-5 text-emerald-500" /> Lead Scraper</h1>
        <p className="text-slate-500 text-sm mt-1">Find businesses across Mumbai that need IT services</p>
      </div>

      {config && (
        <Card>
          <CardContent className="p-5 space-y-5">
            {/* Locations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="font-semibold text-sm">Locations</Label>
                <button onClick={() => selectAll('locations')} className="text-xs text-emerald-600 hover:underline">
                  {form.locations.length === config.locations.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {config.locations.map(loc => (
                  <button key={loc} onClick={() => setForm(f => ({ ...f, locations: toggle(f.locations, loc) }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${form.locations.includes(loc) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {loc.replace(' Mumbai', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Types */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="font-semibold text-sm">Business Types</Label>
                <button onClick={() => selectAll('business_types')} className="text-xs text-emerald-600 hover:underline">
                  {form.business_types.length === config.business_types.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {config.business_types.map(bt => (
                  <button key={bt} onClick={() => setForm(f => ({ ...f, business_types: toggle(f.business_types, bt) }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${form.business_types.includes(bt) ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div>
              <Label className="font-semibold text-sm mb-2 block">Search Sources</Label>
              <div className="flex gap-2">
                {config.sources.map(s => (
                  <button key={s} onClick={() => setForm(f => ({ ...f, sources: toggle(f.sources, s) }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${form.sources.includes(s) ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <Button onClick={startScrape} disabled={scraping || form.locations.length === 0 || form.business_types.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-base" data-testid="start-scrape-btn">
                {scraping ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                Start Scraping ({form.locations.length} locations x {form.business_types.length} types)
              </Button>
              <p className="text-xs text-slate-400 text-center mt-2">Estimated: ~{form.locations.length * form.business_types.length * 3}s for {form.locations.length * form.business_types.length} searches</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs History */}
      {jobs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700">Scrape History</h2>
            <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-3">
            {jobs.map(j => (
              <Card key={j.job_id} data-testid={`scrape-job-${j.job_id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {j.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {j.status === 'running' && <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
                      {j.status === 'queued' && <Clock className="w-5 h-5 text-slate-400" />}
                      {j.status === 'failed' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                      <div>
                        <span className="font-mono text-sm text-slate-500">#{j.job_id}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                          j.status === 'completed' ? 'bg-green-100 text-green-700' :
                          j.status === 'running' ? 'bg-amber-100 text-amber-700' :
                          j.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>{j.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600">{j.new_leads} new leads</div>
                      <div className="text-xs text-slate-400">{j.found} found total</div>
                    </div>
                  </div>
                  {j.last_query && <div className="text-xs text-slate-400 mt-2">Last search: {j.last_query}</div>}
                  <div className="text-xs text-slate-400 mt-1">{j.created_at ? new Date(j.created_at).toLocaleString() : ''}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
