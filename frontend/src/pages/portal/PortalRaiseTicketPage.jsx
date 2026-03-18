import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalAuth, portalApi } from '../../contexts/PortalAuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Headphones, Loader2, CheckCircle2, Monitor } from 'lucide-react';

export default function PortalRaiseTicketPage() {
  const { token } = usePortalAuth();
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ subject: '', description: '', asset_id: '', priority: 'normal' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    portalApi.getAssets(token).then(setAssets).catch(() => {});
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.description) { toast.error('Subject and description are required'); return; }
    setSaving(true);
    try {
      const res = await portalApi.createTicket(form, token);
      setSuccess(res);
      toast.success(res.message || 'Ticket submitted');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center space-y-4" data-testid="ticket-success">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Ticket Submitted</h2>
        <p className="text-slate-500">{success.message}</p>
        {success.ticket_id && <p className="text-sm text-slate-400">osTicket ID: #{success.ticket_id}</p>}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/portal/tickets')}>View Tickets</Button>
          <Button onClick={() => { setSuccess(null); setForm({ subject: '', description: '', asset_id: '', priority: 'normal' }); }} className="bg-amber-500 hover:bg-amber-600 text-white">Raise Another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4" data-testid="portal-raise-ticket">
      <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Headphones className="w-5 h-5" /> Raise Support Ticket</h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Subject *</Label>
              <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of the issue" required data-testid="ticket-subject" />
            </div>

            <div>
              <Label>Related Asset (optional)</Label>
              <select value={form.asset_id} onChange={e => setForm({ ...form, asset_id: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="ticket-asset">
                <option value="">— No specific asset —</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.asset_tag} — {a.brand} {a.model} {a.serial_number ? `(${a.serial_number})` : ''}</option>
                ))}
              </select>
              {form.asset_id && (
                <div className="mt-1 p-2 bg-blue-50 rounded text-xs flex items-center gap-2">
                  <Monitor className="w-3 h-3 text-blue-500" />
                  Asset details will be included in the ticket
                </div>
              )}
            </div>

            <div>
              <Label>Priority</Label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="ticket-priority">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <Label>Description *</Label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full h-32 px-3 py-2 rounded-md border text-sm resize-none" placeholder="Describe the issue in detail..." required data-testid="ticket-description" />
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-amber-500 hover:bg-amber-600 text-white h-11" data-testid="submit-ticket-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Ticket'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
