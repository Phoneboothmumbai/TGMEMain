import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Zap, TrendingUp, Phone, Eye, ArrowRight, Target, Loader2, BarChart3 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700', contacted: 'bg-amber-100 text-amber-700',
  qualified: 'bg-purple-100 text-purple-700', converted: 'bg-green-100 text-green-700',
};

export default function SalesDashboard() {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/leads/dashboard/stats`).then(r => r.json()),
      fetch(`${API}/api/leads/all?limit=5`).then(r => r.json()),
    ]).then(([s, l]) => {
      setStats(s);
      setRecentLeads(l?.leads || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-6 max-w-6xl" data-testid="sales-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Sales Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Lead generation & pipeline overview</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { icon: Users, label: 'Total Leads', value: stats.total_leads, color: 'text-blue-600 bg-blue-50', link: '/workspace/sales/leads' },
            { icon: Zap, label: 'New (Untouched)', value: stats.new, color: 'text-amber-600 bg-amber-50', link: '/workspace/sales/leads?status=new' },
            { icon: Phone, label: 'Contacted', value: stats.contacted, color: 'text-purple-600 bg-purple-50' },
            { icon: TrendingUp, label: 'Converted', value: stats.converted, color: 'text-green-600 bg-green-50' },
            { icon: Eye, label: 'Today Visitors', value: stats.today_visitors, color: 'text-indigo-600 bg-indigo-50', link: '/workspace/sales/visitors' },
          ].map(s => (
            <Card key={s.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                {s.link && <Link to={s.link} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-2">View <ArrowRight className="w-3 h-3" /></Link>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/workspace/sales/scraper">
          <Card className="hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Run Lead Scraper</div>
                <div className="text-xs text-slate-500">Find new businesses in Mumbai</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/workspace/sales/pipeline">
          <Card className="hover:shadow-md hover:border-purple-200 transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Sales Pipeline</div>
                <div className="text-xs text-slate-500">Track deals & follow-ups</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/workspace/sales/visitors">
          <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Visitor Analytics</div>
                <div className="text-xs text-slate-500">Track website traffic</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recent Leads</h2>
            <Link to="/workspace/sales/leads" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recentLeads.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No leads yet. Run the scraper to find businesses!</p>}
          <div className="space-y-2">
            {recentLeads.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg" data-testid={`recent-lead-${l.id}`}>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-800 truncate">{l.name}</div>
                  <div className="text-xs text-slate-400">{l.business_type || l.service || l.source || ''} {l.location && `• ${l.location}`}</div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {l.phone && <a href={`tel:${l.phone}`} className="p-1.5 hover:bg-blue-50 rounded"><Phone className="w-3.5 h-3.5 text-blue-500" /></a>}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[l.status] || 'bg-slate-100 text-slate-600'}`}>{l.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
