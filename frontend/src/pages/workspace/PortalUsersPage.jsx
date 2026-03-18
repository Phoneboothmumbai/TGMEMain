import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { Shield, Plus, Loader2, Trash2, Users, Copy } from 'lucide-react';

export default function PortalUsersPage() {
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_id: '', name: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [u, c] = await Promise.all([workspaceApi.getPortalUsers(), workspaceApi.getClients()]);
      setUsers(u || []); setClients(c || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.client_id || !form.name || !form.email || !form.password) { toast.error('All fields required'); return; }
    setSaving(true);
    try {
      await workspaceApi.createPortalUser(form);
      toast.success('Portal user created');
      setShowForm(false); setForm({ client_id: '', name: '', email: '', phone: '', password: '' }); loadData();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this portal user?')) return;
    try { await workspaceApi.deletePortalUser(id); toast.success('User deactivated'); loadData(); }
    catch { toast.error('Failed'); }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/portal/login`;
    navigator.clipboard.writeText(url); toast.success('Portal link copied');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-4" data-testid="portal-users-page">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Shield className="w-5 h-5" /> Client Portal Users</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyLink} className="text-xs" data-testid="copy-portal-link"><Copy className="w-3 h-3 mr-1" /> Copy Portal Link</Button>
          <Button onClick={() => setShowForm(true)} className="bg-amber-500 hover:bg-amber-600 text-white h-9 text-sm" data-testid="add-portal-user-btn"><Plus className="w-4 h-4 mr-1" /> Add Portal User</Button>
        </div>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Company</TableHead><TableHead className="w-16">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {users.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400">No portal users. Create one to give a client access.</TableCell></TableRow>}
            {users.map(u => (
              <TableRow key={u.id} data-testid={`portal-user-${u.id}`}>
                <TableCell className="font-medium text-sm">{u.name}</TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell className="text-sm">{u.phone || '—'}</TableCell>
                <TableCell className="text-sm">{u.client_name || '—'}</TableCell>
                <TableCell>
                  <button onClick={() => handleDelete(u.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Client Portal User</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Client *</Label>
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" required data-testid="pu-client">
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required data-testid="pu-name" /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required data-testid="pu-email" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} data-testid="pu-phone" /></div>
            <div><Label>Password *</Label><Input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Set initial password" required data-testid="pu-password" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-white" data-testid="save-pu-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
