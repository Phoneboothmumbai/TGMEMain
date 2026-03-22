import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import { Building2, Search, Plus, Phone, Mail, Globe, MapPin, Users, TrendingUp, Loader2, Pencil, Trash2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', industry: '', phone: '', email: '', website: '', address: '', city: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await fetch(`${API}/api/leads/accounts/list?search=${encodeURIComponent(search)}`).then(r => r.json());
      setAccounts(data);
    } catch { toast.error('Failed to load accounts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', industry: '', phone: '', email: '', website: '', address: '', city: '', notes: '' });
    setShowCreate(true);
  };

  const openEdit = (acc) => {
    setEditId(acc.id);
    setForm({ name: acc.name, industry: acc.industry || '', phone: acc.phone || '', email: acc.email || '', website: acc.website || '', address: acc.address || '', city: acc.city || '', notes: acc.notes || '' });
    setShowCreate(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await fetch(`${API}/api/leads/accounts/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Account updated');
      } else {
        await fetch(`${API}/api/leads/accounts/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Account created');
      }
      setShowCreate(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    await fetch(`${API}/api/leads/accounts/${id}`, { method: 'DELETE' });
    toast.success('Account deleted');
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-4 max-w-6xl" data-testid="accounts-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Building2 className="w-5 h-5" /> Accounts</h1>
          <p className="text-slate-500 text-sm">{accounts.length} companies</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="create-account-btn">
          <Plus className="w-4 h-4 mr-1" /> Create Account
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search accounts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" data-testid="accounts-search" />
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>City</TableHead>
            <TableHead className="text-center">Contacts</TableHead>
            <TableHead className="text-center">Leads</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {accounts.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400">No accounts yet. Create your first account!</TableCell></TableRow>}
            {accounts.map(acc => (
              <TableRow key={acc.id} className="hover:bg-slate-50" data-testid={`account-row-${acc.id}`}>
                <TableCell>
                  <div className="font-medium text-sm text-slate-800">{acc.name}</div>
                  {acc.website && <a href={acc.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1"><Globe className="w-3 h-3" />{acc.website.replace(/https?:\/\//, '').slice(0, 30)}</a>}
                </TableCell>
                <TableCell><span className="text-sm text-slate-600">{acc.industry || '-'}</span></TableCell>
                <TableCell>
                  {acc.phone && <div className="flex items-center gap-1 text-xs text-slate-600"><Phone className="w-3 h-3" />{acc.phone}</div>}
                  {acc.email && <div className="flex items-center gap-1 text-xs text-slate-500"><Mail className="w-3 h-3" />{acc.email}</div>}
                </TableCell>
                <TableCell><span className="text-sm text-slate-600">{acc.city || '-'}</span></TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"><Users className="w-3 h-3" />{acc.contacts_count}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium"><TrendingUp className="w-3 h-3" />{acc.leads_count}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(acc)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="w-4 h-4 text-slate-500" /></button>
                    <button onClick={() => remove(acc.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={showCreate} onOpenChange={v => { if (!v) setShowCreate(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Account' : 'Create Account'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Company Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Company name" data-testid="account-name-input" /></div>
            <div><Label>Industry</Label><Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="e.g., Shipping, Manufacturing" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" /></div>
            </div>
            <div><Label>Website</Label><Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://" /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street address" /></div>
            <div><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="City" /></div>
            <div><Label>Notes</Label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full h-16 px-3 py-2 rounded-md border text-sm resize-none" placeholder="Notes..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="save-account-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editId ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
