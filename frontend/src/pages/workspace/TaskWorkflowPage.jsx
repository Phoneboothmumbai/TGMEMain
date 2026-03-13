import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import {
  Loader2, ArrowLeft, Building2, MapPin, Calendar, User,
  MessageCircle, Package, CheckCircle2, Clock, Send, FileText,
  Truck, Receipt, AlertTriangle, Play, CircleDot
} from 'lucide-react';

const statusConfig = {
  new: { label: 'New', color: 'bg-slate-100 text-slate-700', icon: CircleDot },
  part_ordered: { label: 'Part Ordered', color: 'bg-orange-100 text-orange-700', icon: Package },
  part_received: { label: 'Part Received', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
  estimate_sent: { label: 'Estimate Sent', color: 'bg-purple-100 text-purple-700', icon: Send },
  estimate_approved: { label: 'Estimate Approved', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle2 },
  assigned: { label: 'Assigned', color: 'bg-cyan-100 text-cyan-700', icon: User },
  in_progress: { label: 'In Progress', color: 'bg-violet-100 text-violet-700', icon: Play },
  pending_for_part: { label: 'Pending for Part', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  billed: { label: 'Billed', color: 'bg-emerald-100 text-emerald-700', icon: Receipt },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

export default function TaskWorkflowPage() {
  const { taskId } = useParams();
  const { employee } = useOutletContext();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [parts, setParts] = useState([]);

  // Dialog states
  const [showOrderPart, setShowOrderPart] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [saving, setSaving] = useState(false);

  // Forms
  const [orderForm, setOrderForm] = useState({ part_name: '', quantity: 1, supplier_id: '', supplier_name: '', notes: '' });
  const [estimateForm, setEstimateForm] = useState({ parts_total: 0, labor: 0, notes: '' });
  const [assignForm, setAssignForm] = useState({ assigned_to: '' });
  const [billForm, setBillForm] = useState({ invoice_number: '', serial_number: '' });

  useEffect(() => { loadData(); }, [taskId]);

  const loadData = async () => {
    try {
      const [taskData, emps, sups, pts] = await Promise.all([
        workspaceApi.getTask(taskId),
        workspaceApi.getEmployees(),
        workspaceApi.getSuppliers(),
        workspaceApi.getParts()
      ]);
      setTask(taskData);
      setEmployees(emps);
      setSuppliers(sups);
      setParts(pts);
    } catch (e) { toast.error('Failed to load task'); }
    finally { setLoading(false); }
  };

  const handleOrderPart = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const sup = suppliers.find(s => s.id === orderForm.supplier_id);
      await workspaceApi.createPartOrder({
        task_id: taskId, ...orderForm,
        supplier_name: sup?.name || orderForm.supplier_name,
        created_by: employee?.employee_id
      });
      toast.success('Part ordered');
      setShowOrderPart(false);
      setOrderForm({ part_name: '', quantity: 1, supplier_id: '', supplier_name: '', notes: '' });
      loadData();

      // Open WhatsApp to supplier
      if (sup?.whatsapp || sup?.phone) {
        const phone = (sup.whatsapp || sup.phone).replace(/\D/g, '');
        const msg = encodeURIComponent(`Hi ${sup.name}, we need:\n${orderForm.part_name} x${orderForm.quantity}\nFor Job: ${task.job_id}\nClient: ${task.client_name}\n${orderForm.notes ? 'Notes: ' + orderForm.notes : ''}`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      }
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const handleMarkReceived = async (orderId) => {
    try {
      await workspaceApi.markPartReceived(orderId, { by: employee?.employee_id });
      toast.success('Part marked received');
      loadData();
    } catch (err) { toast.error(err.message); }
  };

  const handleSendEstimate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const total = parseFloat(estimateForm.parts_total) + parseFloat(estimateForm.labor);
      await workspaceApi.sendEstimate(taskId, { ...estimateForm, total, by: employee?.employee_id });
      toast.success('Estimate sent');
      setShowEstimate(false);
      loadData();

      // Open WhatsApp to customer
      const contact = task.client_contacts?.[0];
      if (contact?.whatsapp || contact?.phone) {
        const phone = (contact.whatsapp || contact.phone).replace(/\D/g, '');
        const msg = encodeURIComponent(`Dear ${contact.name},\n\nEstimate for ${task.job_id}:\nParts: ₹${estimateForm.parts_total}\nLabor: ₹${estimateForm.labor}\nTotal: ₹${total}\n\n${estimateForm.notes || ''}\n\nPlease confirm to proceed.\n- TGME`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      }
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const handleApproveEstimate = async () => {
    try {
      await workspaceApi.approveEstimate(taskId, { by: employee?.employee_id });
      toast.success('Estimate approved'); loadData();
    } catch (err) { toast.error(err.message); }
  };

  const handleAssign = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await workspaceApi.assignTask(taskId, { ...assignForm, by: employee?.employee_id });
      toast.success('Task assigned');
      setShowAssign(false); loadData();

      // WhatsApp to engineer
      if (res.assigned_to_phone) {
        const phone = res.assigned_to_phone.replace(/\D/g, '');
        const msg = encodeURIComponent(`Hi ${res.assigned_to_name},\n\nNew job assigned: ${task.job_id}\nClient: ${task.client_name}\nLocation: ${task.location_name} ${task.location_address ? '- ' + task.location_address : ''}\nTask: ${task.title}\n${task.description ? 'Details: ' + task.description : ''}\n\nPlease start at your earliest.`);
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      }
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  const handleBill = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await workspaceApi.billTask(taskId, { ...billForm, by: employee?.employee_id });
      toast.success('Task billed'); setShowBill(false); loadData();
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  if (!task) return <div className="p-4 text-center"><p className="text-slate-500">Task not found</p></div>;

  const sc = statusConfig[task.status] || statusConfig.new;

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl" data-testid="task-workflow-page">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/workspace/servicebook/tasks')} data-testid="back-btn">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-amber-600 font-bold">{task.job_id}</span>
            <Badge className={`text-xs ${sc.color}`}>{sc.label}</Badge>
            <Badge variant="outline" className="text-xs capitalize">{task.task_type?.replace('_', ' ')}</Badge>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mt-1">{task.title}</h1>
          {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500 flex items-center gap-1"><Building2 className="w-3 h-3" /> Client</p>
          <p className="text-sm font-medium text-slate-800 mt-0.5">{task.client_name || '-'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</p>
          <p className="text-sm font-medium text-slate-800 mt-0.5">{task.location_name || '-'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3" /> Assigned To</p>
          <p className="text-sm font-medium text-slate-800 mt-0.5">{task.assigned_to_name || 'Unassigned'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Due Date</p>
          <p className="text-sm font-medium text-slate-800 mt-0.5">{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</p>
        </div>
      </div>

      {/* Action Buttons based on status */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {/* Known Issue: Order parts first */}
            {(task.status === 'new' || task.status === 'pending_for_part') && (
              <Button size="sm" onClick={() => setShowOrderPart(true)} className="bg-orange-500 hover:bg-orange-600" data-testid="order-part-btn">
                <Package className="w-4 h-4 mr-1" /> Order Part
              </Button>
            )}

            {/* Mark parts received */}
            {task.status === 'part_ordered' && task.part_orders?.some(o => o.status === 'ordered') && (
              <div className="flex flex-wrap gap-2">
                {task.part_orders.filter(o => o.status === 'ordered').map(o => (
                  <Button key={o.id} size="sm" variant="outline" onClick={() => handleMarkReceived(o.id)} data-testid={`receive-${o.id}`}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> {o.part_name} Received
                  </Button>
                ))}
              </div>
            )}

            {/* Send estimate */}
            {(task.status === 'part_received' || task.status === 'new' || task.status === 'pending_for_part') && (
              <Button size="sm" onClick={() => {
                const partsCost = task.part_orders?.reduce((s, o) => {
                  const p = parts.find(pp => pp.name === o.part_name);
                  return s + (p?.price || 0) * (o.quantity || 1);
                }, 0) || 0;
                setEstimateForm({ parts_total: partsCost, labor: 0, notes: '' });
                setShowEstimate(true);
              }} className="bg-purple-500 hover:bg-purple-600" data-testid="send-estimate-btn">
                <Send className="w-4 h-4 mr-1" /> Send Estimate
              </Button>
            )}

            {/* Approve estimate */}
            {task.status === 'estimate_sent' && (
              <Button size="sm" onClick={handleApproveEstimate} className="bg-indigo-500 hover:bg-indigo-600" data-testid="approve-estimate-btn">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Estimate Approved
              </Button>
            )}

            {/* Assign engineer */}
            {(task.status === 'estimate_approved' || task.status === 'part_received' || task.status === 'new') && (
              <Button size="sm" onClick={() => setShowAssign(true)} className="bg-cyan-500 hover:bg-cyan-600" data-testid="assign-btn">
                <User className="w-4 h-4 mr-1" /> Assign Engineer
              </Button>
            )}

            {/* Bill the completed task */}
            {task.status === 'completed' && (
              <Button size="sm" onClick={() => setShowBill(true)} className="bg-green-600 hover:bg-green-700" data-testid="bill-task-btn">
                <Receipt className="w-4 h-4 mr-1" /> Generate Invoice
              </Button>
            )}

            {/* WhatsApp to assigned employee */}
            {task.assigned_to_phone && (
              <a
                href={`https://wa.me/${task.assigned_to_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, update on ${task.job_id} - ${task.title}?`)}`}
                target="_blank" rel="noopener noreferrer"
              >
                <Button size="sm" variant="outline" className="text-green-600 border-green-200">
                  <MessageCircle className="w-4 h-4 mr-1" /> WA Engineer
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Part Orders */}
      {task.part_orders?.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Package className="w-4 h-4" /> Part Orders</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {task.part_orders.map(o => {
              const sup = suppliers.find(s => s.id === o.supplier_id);
              const supPhone = (sup?.whatsapp || sup?.phone || '').replace(/\D/g, '');
              return (
                <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm" data-testid={`order-${o.id}`}>
                  <div>
                    <p className="font-medium text-slate-800">{o.part_name} x{o.quantity}</p>
                    <p className="text-xs text-slate-500">From: {o.supplier_name || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {supPhone && (
                      <a
                        href={`https://wa.me/${supPhone}?text=${encodeURIComponent(`Hi ${o.supplier_name}, checking on order:\n${o.part_name} x${o.quantity}\nJob: ${task.job_id}\nClient: ${task.client_name}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        data-testid={`wa-supplier-${o.id}`}
                      >
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 h-7 text-xs">
                          <MessageCircle className="w-3 h-3 mr-1" /> WA Supplier
                        </Button>
                      </a>
                    )}
                    <Badge className={o.status === 'received' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                      {o.status === 'received' ? 'Received' : 'Ordered'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Estimate Info */}
      {task.estimate_total > 0 && (
        <Card className="border-slate-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Estimate</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-slate-500 text-xs">Parts</p><p className="font-medium">₹{task.estimate_parts_total?.toLocaleString()}</p></div>
              <div><p className="text-slate-500 text-xs">Labor</p><p className="font-medium">₹{task.estimate_labor?.toLocaleString()}</p></div>
              <div><p className="text-slate-500 text-xs">Total</p><p className="font-bold text-lg">₹{task.estimate_total?.toLocaleString()}</p></div>
            </div>
            <Badge className={`mt-2 text-xs ${task.estimate_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {task.estimate_approved ? 'Customer Approved' : 'Awaiting Approval'}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Invoice Info */}
      {task.status === 'billed' && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Receipt className="w-5 h-5 text-green-600" /><h3 className="font-semibold text-green-800">Invoiced</h3></div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-green-600 text-xs">Invoice Number</p><p className="font-medium">{task.invoice_number}</p></div>
              <div><p className="text-green-600 text-xs">Serial Number</p><p className="font-medium">{task.serial_number || 'N/A'}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Timeline</CardTitle></CardHeader>
        <CardContent className="p-4 pt-0">
          {task.timeline?.length > 0 ? (
            <div className="space-y-3">
              {[...task.timeline].reverse().map((entry, i) => (
                <div key={i} className="flex gap-3 text-sm" data-testid={`timeline-${i}`}>
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800">{entry.action}</p>
                    <p className="text-xs text-slate-500">{entry.by} &middot; {new Date(entry.timestamp).toLocaleString()}</p>
                    {entry.notes && <p className="text-xs text-slate-600 mt-0.5">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No timeline entries yet</p>
          )}
        </CardContent>
      </Card>

      {/* Order Part Dialog */}
      <Dialog open={showOrderPart} onOpenChange={setShowOrderPart}>
        <DialogContent className="sm:max-w-md" data-testid="order-part-dialog">
          <DialogHeader><DialogTitle>Order Part from Supplier</DialogTitle></DialogHeader>
          <form onSubmit={handleOrderPart} className="space-y-4">
            <div className="space-y-2">
              <Label>Part Name *</Label>
              <Input value={orderForm.part_name} onChange={(e) => setOrderForm({...orderForm, part_name: e.target.value})} required placeholder="e.g., Battery 65Wh" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" min="1" value={orderForm.quantity} onChange={(e) => setOrderForm({...orderForm, quantity: parseInt(e.target.value) || 1})} />
            </div>
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <Select value={orderForm.supplier_id} onValueChange={(v) => setOrderForm({...orderForm, supplier_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name} {s.company ? `(${s.company})` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={orderForm.notes} onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})} rows={2} placeholder="Urgency, specs, etc." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowOrderPart(false)}>Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />} Order & WhatsApp
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Estimate Dialog */}
      <Dialog open={showEstimate} onOpenChange={setShowEstimate}>
        <DialogContent className="sm:max-w-md" data-testid="estimate-dialog">
          <DialogHeader><DialogTitle>Send Estimate to Customer</DialogTitle></DialogHeader>
          <form onSubmit={handleSendEstimate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Parts Cost (₹)</Label>
                <Input type="number" step="0.01" value={estimateForm.parts_total} onChange={(e) => setEstimateForm({...estimateForm, parts_total: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Labor Cost (₹)</Label>
                <Input type="number" step="0.01" value={estimateForm.labor} onChange={(e) => setEstimateForm({...estimateForm, labor: e.target.value})} />
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <p className="text-xs text-slate-500">Total Estimate</p>
              <p className="text-2xl font-bold text-slate-800">₹{(parseFloat(estimateForm.parts_total || 0) + parseFloat(estimateForm.labor || 0)).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={estimateForm.notes} onChange={(e) => setEstimateForm({...estimateForm, notes: e.target.value})} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEstimate(false)}>Cancel</Button>
              <Button type="submit" className="bg-purple-500 hover:bg-purple-600" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} Send & WhatsApp
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="sm:max-w-sm" data-testid="assign-dialog">
          <DialogHeader><DialogTitle>Assign to Engineer</DialogTitle></DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Employee *</Label>
              <Select value={assignForm.assigned_to} onValueChange={(v) => setAssignForm({assigned_to: v})}>
                <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.role === 'engineer' || e.role === 'delivery').map(e => (
                    <SelectItem key={e.employee_id} value={e.employee_id}>{e.name} ({e.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
              <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Assign & WhatsApp
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bill Dialog */}
      <Dialog open={showBill} onOpenChange={setShowBill}>
        <DialogContent className="sm:max-w-sm" data-testid="bill-dialog">
          <DialogHeader><DialogTitle>Generate Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleBill} className="space-y-4">
            <div className="space-y-2">
              <Label>Invoice Number *</Label>
              <Input value={billForm.invoice_number} onChange={(e) => setBillForm({...billForm, invoice_number: e.target.value})} required placeholder="e.g., INV-2026-001" data-testid="invoice-number-input" />
            </div>
            <div className="space-y-2">
              <Label>Serial Number *</Label>
              <Input value={billForm.serial_number} onChange={(e) => setBillForm({...billForm, serial_number: e.target.value})} required placeholder="e.g., SN-12345" data-testid="serial-number-input" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBill(false)}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving} data-testid="confirm-bill-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Receipt className="w-4 h-4 mr-2" />} Bill & Close
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
