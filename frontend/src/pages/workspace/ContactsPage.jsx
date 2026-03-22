import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';
import { UserCircle, Search, Plus, Phone, Mail, Building2, Loader2, Pencil, Trash2, MessageCircle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', title: '', phone: '', email: '', account_id: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [c, a] = await Promise.all([
        fetch(`${API}/api/leads/contacts/list?search=${encodeURIComponent(search)}`).then(r => r.json()),
        fetch(`${API}/api/leads/accounts/list`).then(r => r.json()),
      ]);
      setContacts(c);
      setAccounts(a);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', title: '', phone: '', email: '', account_id: '', notes: '' });
    setShowCreate(true);
  };

  const openEdit = (con) => {
    setEditId(con.id);
    setForm({ name: con.name, title: con.title || '', phone: con.phone || '', email: con.email || '', account_id: con.account_id || '', notes: con.notes || '' });
    setShowCreate(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await fetch(`${API}/api/leads/contacts/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Contact updated');
      } else {
        await fetch(`${API}/api/leads/contacts/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
        toast.success('Contact created');
      }
      setShowCreate(false);
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    await fetch(`${API}/api/leads/contacts/${id}`, { method: 'DELETE' });
    toast.success('Contact deleted');
    load();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-4 max-w-6xl" data-testid="contacts-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><UserCircle className="w-5 h-5" /> Contacts</h1>
          <p className="text-slate-500 text-sm">{contacts.length} people</p>
        </div>
        <Button onClick={openCreate} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="create-contact-btn">
          <Plus className="w-4 h-4 mr-1" /> Create Contact
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" data-testid="contacts-search" />
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Title / Role</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Account</TableHead>
            <TableHead className="w-28">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {contacts.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400">No contacts yet. Create your first contact!</TableCell></TableRow>}
            {contacts.map(con => (
              <TableRow key={con.id} className="hover:bg-slate-50" data-testid={`contact-row-${con.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-sm">
                      {con.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="font-medium text-sm text-slate-800">{con.name}</div>
                  </div>
                </TableCell>
                <TableCell><span className="text-sm text-slate-600">{con.title || '-'}</span></TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    {con.phone && <div className="flex items-center gap-1 text-xs text-slate-600"><Phone className="w-3 h-3" />{con.phone}</div>}
                    {con.email && <div className="flex items-center gap-1 text-xs text-slate-500"><Mail className="w-3 h-3" />{con.email}</div>}
                  </div>
                </TableCell>
                <TableCell>
                  {con.account_name ? (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600"><Building2 className="w-3 h-3" />{con.account_name}</span>
                  ) : <span className="text-xs text-slate-400">-</span>}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {con.phone && <a href={`https://wa.me/${con.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-green-50 rounded"><MessageCircle className="w-4 h-4 text-green-500" /></a>}
                    {con.phone && <a href={`tel:${con.phone}`} className="p-1.5 hover:bg-blue-50 rounded"><Phone className="w-4 h-4 text-blue-500" /></a>}
                    <button onClick={() => openEdit(con)} className="p-1.5 hover:bg-slate-100 rounded"><Pencil className="w-4 h-4 text-slate-500" /></button>
                    <button onClick={() => remove(con.id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Dialog open={showCreate} onOpenChange={v => { if (!v) setShowCreate(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Contact' : 'Create Contact'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" data-testid="contact-name-input" /></div>
            <div><Label>Title / Role</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., CEO, IT Manager" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" /></div>
            </div>
            <div>
              <Label>Account</Label>
              <select value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="contact-account-select">
                <option value="">-- No Account --</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div><Label>Notes</Label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full h-16 px-3 py-2 rounded-md border text-sm resize-none" placeholder="Notes..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="save-contact-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editId ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
