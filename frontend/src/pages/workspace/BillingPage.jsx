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
import { Receipt, Loader2, CheckCircle2, Search } from 'lucide-react';

export default function BillingPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showBillDialog, setShowBillDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [billNumber, setBillNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    try {
      const data = await workspaceApi.getPendingBilling();
      setEntries(data);
    } catch (error) {
      toast.error('Failed to load pending billing');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkBilled = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workspaceApi.markAsBilled(selectedEntry.id, billNumber);
      toast.success('Marked as billed');
      setShowBillDialog(false);
      setSelectedEntry(null);
      setBillNumber('');
      loadEntries();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = entries.filter(e =>
    (e.client_name && e.client_name.toLowerCase().includes(search.toLowerCase())) ||
    (e.employee_name && e.employee_name.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="billing-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" data-testid="billing-title">Pending Billing</h1>
        <p className="text-slate-500 text-sm">{entries.length} unbilled service entries</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-slate-200" data-testid="billing-search-input" />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-slate-500" data-testid="no-billing-message">All caught up! No pending billing entries.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <Table data-testid="billing-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Engineer</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Work Done</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.id} data-testid={`billing-row-${entry.id}`}>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{entry.client_name || '-'}</TableCell>
                    <TableCell className="text-slate-500">{entry.location_name || '-'}</TableCell>
                    <TableCell className="text-slate-500">{entry.employee_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{entry.service_type?.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">
                      {entry.work_performed}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => { setSelectedEntry(entry); setShowBillDialog(true); }}
                        className="bg-green-600 hover:bg-green-700 text-xs"
                        data-testid={`bill-btn-${entry.id}`}
                      >
                        Mark Billed
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Bill Dialog */}
      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="sm:max-w-sm" data-testid="mark-billed-dialog">
          <DialogHeader>
            <DialogTitle>Mark as Billed</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMarkBilled} className="space-y-4">
            <div className="space-y-2">
              <Label>Bill / Invoice Number *</Label>
              <Input value={billNumber} onChange={(e) => setBillNumber(e.target.value)} placeholder="e.g., INV-2025-001" required data-testid="bill-number-input" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBillDialog(false)}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving} data-testid="confirm-bill-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
