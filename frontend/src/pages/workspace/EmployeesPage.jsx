import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import { Users, Plus, Search, Loader2, Phone, Mail, Shield } from 'lucide-react';

const roleColors = {
  admin: 'bg-red-100 text-red-700',
  backoffice: 'bg-blue-100 text-blue-700',
  engineer: 'bg-green-100 text-green-700',
  delivery: 'bg-orange-100 text-orange-700',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    employee_id: '', name: '', phone: '', email: '', role: 'engineer', password: '', apps_access: ['servicebook']
  });

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try {
      const data = await workspaceApi.getEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workspaceApi.createEmployee(form);
      toast.success('Employee added successfully');
      setShowAdd(false);
      setForm({ employee_id: '', name: '', phone: '', email: '', role: 'engineer', password: '', apps_access: ['servicebook'] });
      loadEmployees();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="employees-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" data-testid="employees-title">Employees</h1>
          <p className="text-slate-500 text-sm">{employees.length} total employees</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600" data-testid="add-employee-btn">
          <Plus className="w-4 h-4 mr-2" /> Add Employee
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 border-slate-200" data-testid="employee-search-input" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <Card className="border-slate-200 col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500" data-testid="no-employees-message">No employees found.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((emp) => (
            <Card key={emp.id} className="border-slate-200 hover:shadow-md transition-shadow" data-testid={`employee-card-${emp.employee_id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-emerald-600 text-sm">{emp.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 truncate">{emp.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{emp.employee_id}</p>
                    <Badge className={`text-xs mt-2 ${roleColors[emp.role] || 'bg-slate-100 text-slate-700'}`}>
                      <Shield className="w-3 h-3 mr-1" /> {emp.role}
                    </Badge>
                    <div className="mt-2 space-y-1">
                      {emp.phone && (
                        <a href={`tel:${emp.phone}`} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600">
                          <Phone className="w-3 h-3" /> {emp.phone}
                        </a>
                      )}
                      {emp.email && (
                        <a href={`mailto:${emp.email}`} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600">
                          <Mail className="w-3 h-3" /> {emp.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md" data-testid="add-employee-dialog">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Employee ID *</Label>
                <Input value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value.toUpperCase() })} placeholder="e.g., EMP001" required data-testid="emp-id-input" />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required data-testid="emp-name-input" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required data-testid="emp-phone-input" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="emp-email-input" />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                <SelectTrigger data-testid="emp-role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="backoffice">Back Office</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required data-testid="emp-password-input" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={saving} data-testid="save-employee-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
