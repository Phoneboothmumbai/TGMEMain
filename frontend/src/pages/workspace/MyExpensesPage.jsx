import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Receipt } from 'lucide-react';

export default function MyExpensesPage() {
  const { employee } = useOutletContext();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    expense_type: 'travel', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => { loadExpenses(); }, [employee]);

  const loadExpenses = async () => {
    try {
      const data = await workspaceApi.getExpenses({ employee_id: employee?.employee_id });
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workspaceApi.createExpense({
        employee_id: employee.employee_id,
        expense_type: form.expense_type,
        amount: parseFloat(form.amount),
        description: form.description,
        expense_date: new Date(form.expense_date).toISOString(),
      });
      toast.success('Expense submitted');
      setShowAdd(false);
      setForm({ expense_type: 'travel', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
      loadExpenses();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto" data-testid="my-expenses-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">My Expenses</h1>
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-amber-500 hover:bg-amber-600" size="sm" data-testid="add-expense-btn">
          {showAdd ? 'Cancel' : '+ Add'}
        </Button>
      </div>

      {showAdd && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label className="text-sm">Type</Label>
                <Select value={form.expense_type} onValueChange={(val) => setForm({ ...form, expense_type: val })}>
                  <SelectTrigger data-testid="expense-type-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="parts">Parts</SelectItem>
                    <SelectItem value="misc">Misc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">Amount (₹) *</Label>
                  <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required data-testid="expense-amount-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Date *</Label>
                  <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} required data-testid="expense-date-input" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Description *</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} required placeholder="e.g., Cab to client site" data-testid="expense-desc-input" />
              </div>
              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={saving} data-testid="submit-expense-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Expense
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {expenses.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No expenses yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <Card key={exp.id} className="border-slate-200" data-testid={`my-expense-${exp.id}`}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">{exp.description}</p>
                  <p className="text-xs text-slate-500 capitalize">{exp.expense_type} &middot; {new Date(exp.expense_date || exp.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">₹{exp.amount?.toLocaleString()}</p>
                  <p className={`text-xs ${exp.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                    {exp.is_approved ? 'Approved' : 'Pending'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
