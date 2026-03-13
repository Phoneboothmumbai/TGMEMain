import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { Truck, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  fulfilled: 'bg-blue-100 text-blue-700',
};

export default function PartsRequestsPage() {
  const { employee } = useOutletContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const data = await workspaceApi.getPartsRequests();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load parts requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await workspaceApi.approvePartsRequest(id, employee?.employee_id || 'ADMIN001');
      toast.success('Request approved');
      loadRequests();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await workspaceApi.rejectPartsRequest(id, employee?.employee_id || 'ADMIN001', 'Rejected by admin');
      toast.success('Request rejected');
      loadRequests();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="parts-requests-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-800" data-testid="parts-requests-title">Parts Requests</h1>
        <p className="text-slate-500 text-sm">{requests.length} total requests</p>
      </div>

      {requests.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500" data-testid="no-requests-message">No parts requests yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <Table data-testid="requests-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id} data-testid={`request-row-${req.id}`}>
                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{req.employee_name || req.employee_id}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {req.items?.map((item, i) => (
                        <div key={i}>{item.part_name || item.name} x{item.quantity}</div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge className={req.urgency === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'} variant="outline">
                        {req.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusColors[req.status]}`}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApprove(req.id)} className="bg-green-600 hover:bg-green-700 h-7 text-xs" data-testid={`approve-${req.id}`}>
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(req.id)} className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50" data-testid={`reject-${req.id}`}>
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </div>
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
