import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { Truck, Plus, Search, Loader2, Phone, MessageCircle } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', phone: '', whatsapp: '', email: '', address: '', notes: '' });

  useEffect(() => { loadSuppliers(); }, []);
  const loadSuppliers = async () => {
    try { setSuppliers(await workspaceApi.getSuppliers()); } catch (e) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await workspaceApi.createSupplier(form);
      toast.success('Supplier added'); setShowAdd(false);
      setForm({ name: '', company: '', phone: '', whatsapp: '', email: '', address: '', notes: '' });
      loadSuppliers();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.company && s.company.toLowerCase().includes(search.toLowerCase())));

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="suppliers-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
          <p className="text-slate-500 text-sm">{suppliers.length} suppliers</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600" data-testid="add-supplier-btn">
          <Plus className="w-4 h-4 mr-2" /> Add Supplier
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-slate-200" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <Card className="border-slate-200 col-span-full"><CardContent className="py-12 text-center"><Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No suppliers found.</p></CardContent></Card>
        ) : filtered.map((s) => (
          <Card key={s.id} className="border-slate-200 hover:shadow-md transition-shadow" data-testid={`supplier-${s.id}`}>
            <CardContent className="p-4">
              <p className="font-semibold text-slate-800">{s.name}</p>
              {s.company && <p className="text-xs text-slate-500">{s.company}</p>}
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                {s.phone && <a href={`tel:${s.phone}`} className="flex items-center gap-1 hover:text-amber-600"><Phone className="w-3 h-3" /> {s.phone}</a>}
                {(s.whatsapp || s.phone) && (
                  <a href={`https://wa.me/${(s.whatsapp || s.phone).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                )}
              </div>
              {s.address && <p className="text-xs text-slate-400 mt-2">{s.address}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md" data-testid="add-supplier-dialog">
          <DialogHeader><DialogTitle>Add Supplier</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required data-testid="supplier-name-input" /></div>
              <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required /></div>
              <div className="space-y-2"><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({...form, whatsapp: e.target.value})} placeholder="Same as phone if empty" /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
            <div className="space-y-2"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={saving} data-testid="save-supplier-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
