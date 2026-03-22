import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, BarChart3, Eye, Globe, ArrowUpRight, RefreshCw } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function VisitorAnalyticsPage() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`${API}/api/leads/visitors/stats?days=${days}`).then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [days]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  const maxVisits = Math.max(...(data?.daily?.map(d => d.visits) || [1]), 1);

  return (
    <div className="space-y-5 max-w-4xl" data-testid="visitor-analytics">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Eye className="w-5 h-5" /> Visitor Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Track who's visiting your website and landing pages</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <Button key={d} variant={days === d ? 'default' : 'outline'} size="sm" onClick={() => setDays(d)}
              className={days === d ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}>
              {d}d
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>

      {data && (
        <>
          {/* Daily Traffic Chart */}
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Daily Traffic</h2>
              <div className="flex items-end gap-1" style={{ height: 160 }}>
                {data.daily.map(d => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs font-bold text-slate-600">{d.visits}</div>
                    <div className="text-[9px] text-slate-400">{d.unique}u</div>
                    <div className="w-full rounded-t-md transition-all bg-emerald-400 hover:bg-emerald-500"
                      style={{ height: `${Math.max(8, (d.visits / maxVisits) * 120)}px` }} />
                    <div className="text-[10px] text-slate-400 mt-1">{d.date.slice(5)}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <span>Total: <strong className="text-slate-600">{data.daily.reduce((a, d) => a + d.visits, 0)}</strong> visits</span>
                <span>Unique: <strong className="text-slate-600">{data.daily.reduce((a, d) => a + d.unique, 0)}</strong></span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Pages */}
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Globe className="w-4 h-4" /> Top Pages</h2>
                {data.top_pages?.length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
                <div className="space-y-2">
                  {data.top_pages?.slice(0, 10).map((p, i) => (
                    <div key={p.page} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                        <span className="text-sm text-slate-700 truncate">{p.page}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 ml-2">{p.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> Top Referrers</h2>
                {data.top_referrers?.length === 0 && <p className="text-sm text-slate-400">No referrer data yet</p>}
                <div className="space-y-2">
                  {data.top_referrers?.slice(0, 10).map((r, i) => (
                    <div key={r.referrer} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                        <span className="text-sm text-slate-700 truncate">{r.referrer}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 ml-2">{r.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
