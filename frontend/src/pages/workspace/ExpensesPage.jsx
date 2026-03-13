import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { Receipt, Loader2, CheckCircle2, Clock, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';

export default function ExpensesPage() {
  const { employee } = useOutletContext();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadExpenses(); }, []);

  const loadExpenses = async () => {
    try {
      const data = await workspaceApi.getExpenses();
      setExpenses(data);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await workspaceApi.approveExpense(id, employee?.employee_id || 'ADMIN001');
      toast.success('Expense approved');
      loadExpenses();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filtered = expenses.filter(e =>
    (e.employee_name && e.employee_name.toLowerCase().includes(search.toLowerCase())) ||
    (e.description && e.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPending = expenses.filter(e => !e.is_approved).reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="expenses-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" data-testid="expenses-title">Expenses</h1>
          <p className="text-slate-500 text-sm">{expenses.length} total expenses</p>
        </div>
        {totalPending > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2" data-testid="pending-total">
            <p className="text-xs text-amber-600">Pending Approval</p>
            <p className="text-lg font-bold text-amber-700">₹{totalPending.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-slate-200" data-testid="expense-search-input" />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500" data-testid="no-expenses-message">No expenses found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <div className="overflow-x-auto">
            <Table data-testid="expenses-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((exp) => (
                  <TableRow key={exp.id} data-testid={`expense-row-${exp.id}`}>
                    <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                      {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString() : new Date(exp.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{exp.employee_name || exp.employee_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{exp.expense_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">{exp.description}</TableCell>
                    <TableCell className="text-right font-medium text-slate-800">₹{exp.amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      {exp.is_approved ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!exp.is_approved && (
                        <Button size="sm" onClick={() => handleApprove(exp.id)} className="bg-green-600 hover:bg-green-700 h-7 text-xs" data-testid={`approve-expense-${exp.id}`}>
                          Approve
                        </Button>
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
