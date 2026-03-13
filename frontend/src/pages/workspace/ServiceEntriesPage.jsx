import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { FileText, Loader2, Search, CheckCircle2, Clock } from 'lucide-react';

export default function ServiceEntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadEntries(); }, []);

  const loadEntries = async () => {
    try {
      const data = await workspaceApi.getServiceEntries();
      setEntries(data);
    } catch (error) {
      toast.error('Failed to load service entries');
    } finally {
      setLoading(false);
    }
  };

  const filtered = entries.filter(e =>
    (e.client_name && e.client_name.toLowerCase().includes(search.toLowerCase())) ||
    (e.work_performed && e.work_performed.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="service-entries-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" data-testid="service-entries-title">Service Entries</h1>
        <p className="text-slate-500 text-sm">{entries.length} total entries</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search entries..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-slate-200" data-testid="entries-search-input" />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500" data-testid="no-entries-message">No service entries yet. Entries are created when tasks are completed in the field.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <Table data-testid="entries-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Engineer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Work Performed</TableHead>
                  <TableHead>Billing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.id} data-testid={`entry-row-${entry.id}`}>
                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{entry.client_name || '-'}</TableCell>
                    <TableCell className="text-slate-500">{entry.location_name || '-'}</TableCell>
                    <TableCell className="text-slate-500">{entry.employee_name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{entry.service_type?.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">{entry.work_performed}</TableCell>
                    <TableCell>
                      {entry.is_billed ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Billed
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
