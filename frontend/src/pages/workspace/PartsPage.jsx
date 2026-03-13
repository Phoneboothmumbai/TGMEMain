import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { Package, Plus, Search, Loader2, AlertTriangle } from 'lucide-react';

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', category: '', unit: 'pcs', stock_qty: 0, min_stock: 0, price: 0
  });

  useEffect(() => { loadParts(); }, []);

  const loadParts = async () => {
    try {
      const data = await workspaceApi.getParts();
      setParts(data);
    } catch (error) {
      toast.error('Failed to load parts');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workspaceApi.createPart({
        ...form,
        stock_qty: parseFloat(form.stock_qty),
        min_stock: parseFloat(form.min_stock),
        price: parseFloat(form.price),
      });
      toast.success('Part added successfully');
      setShowAdd(false);
      setForm({ name: '', sku: '', category: '', unit: 'pcs', stock_qty: 0, min_stock: 0, price: 0 });
      loadParts();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = parts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="parts-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" data-testid="parts-title">Parts & Materials</h1>
          <p className="text-slate-500 text-sm">{parts.length} items in inventory</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600" data-testid="add-part-btn">
          <Plus className="w-4 h-4 mr-2" /> Add Part
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search parts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-slate-200" data-testid="part-search-input" />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500" data-testid="no-parts-message">No parts found. Add your first part to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <Table data-testid="parts-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((part) => (
                  <TableRow key={part.id} data-testid={`part-row-${part.id}`}>
                    <TableCell className="font-medium text-slate-800">{part.name}</TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">{part.sku || '-'}</TableCell>
                    <TableCell className="text-slate-500">{part.category || '-'}</TableCell>
                    <TableCell className="text-right font-medium">{part.stock_qty} {part.unit}</TableCell>
                    <TableCell className="text-right text-slate-500">{part.min_stock} {part.unit}</TableCell>
                    <TableCell className="text-right text-slate-700">
                      {part.price > 0 ? `₹${part.price.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      {part.stock_qty <= part.min_stock ? (
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Low
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 text-xs">In Stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add Part Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md" data-testid="add-part-dialog">
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Part Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="part-name-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g., RAM-8GB-DDR4" data-testid="part-sku-input" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., RAM, SSD" data-testid="part-category-input" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} data-testid="part-unit-input" />
              </div>
              <div className="space-y-2">
                <Label>Stock Qty</Label>
                <Input type="number" value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} data-testid="part-stock-input" />
              </div>
              <div className="space-y-2">
                <Label>Min Stock</Label>
                <Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} data-testid="part-minstock-input" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Price (₹)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="part-price-input" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={saving} data-testid="save-part-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Part
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
