import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Loader2, Phone, MessageCircle, MapPin, Globe, StickyNote, Target, RefreshCw } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const STAGES = [
  { id: 'new', label: 'New', color: 'border-blue-300 bg-blue-50', headerColor: 'bg-blue-500', textColor: 'text-blue-700' },
  { id: 'contacted', label: 'Contacted', color: 'border-amber-300 bg-amber-50', headerColor: 'bg-amber-500', textColor: 'text-amber-700' },
  { id: 'qualified', label: 'Qualified', color: 'border-purple-300 bg-purple-50', headerColor: 'bg-purple-500', textColor: 'text-purple-700' },
  { id: 'converted', label: 'Converted', color: 'border-green-300 bg-green-50', headerColor: 'bg-green-500', textColor: 'text-green-700' },
  { id: 'lost', label: 'Lost', color: 'border-slate-300 bg-slate-50', headerColor: 'bg-slate-400', textColor: 'text-slate-600' },
];

export default function SalesPipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch(`${API}/api/leads/all?limit=200`).then(r => r.json()).then(d => setLeads(d?.leads || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const getStageLeads = (status) => leads.filter(l => l.status === status);

  const moveToStage = async (leadId, newStatus) => {
    try {
      await fetch(`${API}/api/leads/${leadId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success(`Moved to ${newStatus}`);
    } catch { toast.error('Failed'); }
  };

  const updateLead = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/leads/${selected.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      toast.success('Updated'); setSelected(null); load();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const openEdit = (lead) => {
    setSelected(lead);
    setEditForm({ status: lead.status, notes: lead.notes || '', next_followup: lead.next_followup || '', priority: lead.priority || 'medium' });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-4" data-testid="sales-pipeline">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Target className="w-5 h-5" /> Sales Pipeline</h1>
          <p className="text-slate-500 text-sm">{leads.length} total leads</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
        {STAGES.map(stage => {
          const stageLeads = getStageLeads(stage.id);
          return (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className={`${stage.headerColor} text-white rounded-t-lg px-4 py-2.5 flex items-center justify-between`}>
                <span className="font-semibold text-sm">{stage.label}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">{stageLeads.length}</span>
              </div>
              <div className={`border-x border-b rounded-b-lg ${stage.color} p-2 space-y-2 min-h-[300px]`}>
                {stageLeads.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No leads</p>}
                {stageLeads.slice(0, 20).map(lead => (
                  <div key={lead.id} className="bg-white rounded-lg p-3 shadow-sm border border-white hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEdit(lead)} data-testid={`pipeline-lead-${lead.id}`}>
                    <div className="font-medium text-sm text-slate-800 truncate">{lead.name}</div>
                    {lead.business_type && <div className="text-xs text-slate-400 capitalize mt-0.5">{lead.business_type}</div>}
                    {lead.location && <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{lead.location}</div>}
                    <div className="flex items-center gap-1 mt-2">
                      {lead.phone && <a href={`tel:${lead.phone}`} onClick={e => e.stopPropagation()} className="p-1 hover:bg-blue-50 rounded"><Phone className="w-3.5 h-3.5 text-blue-500" /></a>}
                      {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1 hover:bg-green-50 rounded"><MessageCircle className="w-3.5 h-3.5 text-green-500" /></a>}
                      {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-1 hover:bg-slate-50 rounded"><Globe className="w-3.5 h-3.5 text-slate-400" /></a>}
                    </div>
                    {/* Quick move buttons */}
                    <div className="flex gap-1 mt-2 pt-2 border-t border-slate-100">
                      {STAGES.filter(s => s.id !== stage.id).slice(0, 3).map(s => (
                        <button key={s.id} onClick={e => { e.stopPropagation(); moveToStage(lead.id, s.id); }}
                          className={`text-[10px] px-1.5 py-0.5 rounded ${s.textColor} bg-opacity-50 hover:bg-opacity-100 border border-current/20`}>
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {stageLeads.length > 20 && <p className="text-xs text-slate-400 text-center">+{stageLeads.length - 20} more</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!selected} onOpenChange={v => { if (!v) setSelected(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {selected?.phone && <div className="p-2 bg-slate-50 rounded text-sm"><Phone className="w-4 h-4 inline text-slate-400 mr-2" />{selected.phone}</div>}
            {selected?.address && <div className="p-2 bg-slate-50 rounded text-sm"><MapPin className="w-4 h-4 inline text-slate-400 mr-2" />{selected.address}</div>}
            {selected?.website && <a href={selected.website} target="_blank" rel="noopener noreferrer" className="block p-2 bg-slate-50 rounded text-sm text-blue-600 hover:underline"><Globe className="w-4 h-4 inline text-slate-400 mr-2" />{selected.website}</a>}
            <div><Label>Stage</Label>
              <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm">
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div><Label>Priority</Label>
              <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div><Label>Notes</Label>
              <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} className="w-full h-20 px-3 py-2 rounded-md border text-sm resize-none" placeholder="Notes about this lead..." />
            </div>
            <div><Label>Next Follow-up</Label>
              <input type="date" value={editForm.next_followup} onChange={e => setEditForm({ ...editForm, next_followup: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={updateLead} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
