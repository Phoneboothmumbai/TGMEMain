import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { Loader2, Truck, Plus, Minus, CheckCircle2 } from 'lucide-react';

export default function RequestPartsPage() {
  const { employee } = useOutletContext();
  const [parts, setParts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([{ part_id: '', part_name: '', quantity: 1, reason: '' }]);
  const [urgency, setUrgency] = useState('normal');
  const [notes, setNotes] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [partsData, reqData] = await Promise.all([
        workspaceApi.getParts(),
        workspaceApi.getPartsRequests()
      ]);
      setParts(partsData);
      setRequests(reqData.filter(r => r.employee_id === employee?.employee_id));
    } catch (error) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'part_id') {
        const part = parts.find(p => p.id === value);
        if (part) updated[index].part_name = part.name;
      }
      return updated;
    });
  };

  const addItem = () => setItems(prev => [...prev, { part_id: '', part_name: '', quantity: 1, reason: '' }]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = items.filter(i => i.part_id);
    if (validItems.length === 0) { toast.error('Add at least one part'); return; }

    setSaving(true);
    try {
      await workspaceApi.createPartsRequest({
        employee_id: employee.employee_id,
        items: validItems,
        urgency,
        notes: notes || null,
      });
      toast.success('Parts request submitted');
      setItems([{ part_id: '', part_name: '', quantity: 1, reason: '' }]);
      setNotes('');
      setUrgency('normal');
      loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  const statusColors = { pending: 'text-yellow-600', approved: 'text-green-600', rejected: 'text-red-600', fulfilled: 'text-blue-600' };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto" data-testid="request-parts-page">
      <h1 className="text-xl font-bold text-slate-800">Request Parts</h1>

      <Card className="border-slate-200">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="space-y-2 p-3 bg-slate-50 rounded-lg">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Part</Label>
                    <Select value={item.part_id} onValueChange={(val) => updateItem(i, 'part_id', val)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select part" /></SelectTrigger>
                      <SelectContent>
                        {parts.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.stock_qty} in stock)</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-16">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} className="h-9 text-xs" />
                  </div>
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)} className="h-9 px-2 text-red-500">
                      <Minus className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <Input
                  value={item.reason}
                  onChange={(e) => updateItem(i, 'reason', e.target.value)}
                  placeholder="Reason (optional)"
                  className="h-8 text-xs"
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full" data-testid="add-item-btn">
              <Plus className="w-3 h-3 mr-1" /> Add Another Part
            </Button>

            <div className="space-y-2">
              <Label className="text-sm">Urgency</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Additional notes..." />
            </div>

            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={saving} data-testid="submit-parts-request-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />} Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Requests History */}
      {requests.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">My Requests</h2>
          {requests.map((req) => (
            <Card key={req.id} className="border-slate-200" data-testid={`my-request-${req.id}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {req.items?.map(i => `${i.part_name || i.name} x${i.quantity}`).join(', ')}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className={`text-xs font-medium capitalize ${statusColors[req.status]}`}>{req.status}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
