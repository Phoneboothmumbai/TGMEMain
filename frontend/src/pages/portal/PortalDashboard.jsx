import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePortalAuth } from '../../contexts/PortalAuthContext';
import { portalApi } from '../../contexts/PortalAuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Monitor, Shield, Key, FileText, Loader2, ArrowRight } from 'lucide-react';

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700', assigned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-amber-100 text-amber-700', completed: 'bg-green-100 text-green-700',
  billed: 'bg-slate-100 text-slate-600',
};

export default function PortalDashboard() {
  const { user, token } = usePortalAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi.getDashboard(token).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-6 max-w-5xl" data-testid="portal-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.name}</h1>
        <p className="text-slate-500 text-sm">{data?.client_name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: data?.total_assets || 0, icon: Monitor, color: 'text-blue-600 bg-blue-50', link: '/portal/assets' },
          { label: 'Active Assets', value: data?.active_assets || 0, icon: Monitor, color: 'text-green-600 bg-green-50', link: '/portal/assets' },
          { label: 'Active AMCs', value: data?.active_amcs || 0, icon: Shield, color: 'text-amber-600 bg-amber-50', link: '/portal/amcs' },
          { label: 'Active Licenses', value: data?.active_licenses || 0, icon: Key, color: 'text-purple-600 bg-purple-50' },
        ].map(s => (
          <Card key={s.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color} mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              {s.link && <Link to={s.link} className="text-xs text-amber-600 hover:underline flex items-center gap-1 mt-2">View <ArrowRight className="w-3 h-3" /></Link>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4" /> Recent Service Tickets</h2>
            <Link to="/portal/tickets" className="text-xs text-amber-600 hover:underline">View All</Link>
          </div>
          {data?.recent_tasks?.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No recent tickets</p>}
          <div className="space-y-2">
            {data?.recent_tasks?.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg" data-testid={`recent-ticket-${t.id}`}>
                <div>
                  <span className="text-xs font-mono text-slate-400">{t.job_id}</span>
                  <p className="text-sm font-medium text-slate-700">{t.title}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[t.status] || 'bg-slate-100 text-slate-600'}`}>
                  {t.status?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Link to="/portal/raise-ticket" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors" data-testid="raise-ticket-link">
          Need Help? Raise a Ticket <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
