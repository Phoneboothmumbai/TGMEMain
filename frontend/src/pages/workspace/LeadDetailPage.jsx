import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import { useWorkspaceAuth } from '../../contexts/WorkspaceAuthContext';
import {
  ArrowLeft, Phone, Mail, Globe, MapPin, Building2, UserCircle,
  Calendar, TrendingUp, Send, Loader2, Pencil, MessageCircle,
  Clock, User, Tag, IndianRupee, Target, StickyNote, ChevronRight
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-amber-100 text-amber-700 border-amber-200',
  qualified: 'bg-purple-100 text-purple-700 border-purple-200',
  converted: 'bg-green-100 text-green-700 border-green-200',
  lost: 'bg-slate-100 text-slate-600 border-slate-200',
};
const PRIORITY_COLORS = {
  low: 'bg-slate-50 text-slate-600', medium: 'bg-blue-50 text-blue-600',
  high: 'bg-orange-50 text-orange-700', urgent: 'bg-red-50 text-red-700',
};
const STAGES = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export default function LeadDetailPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { employee } = useWorkspaceAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const commentRef = useRef(null);

  const loadLead = async () => {
    try {
      const data = await fetch(`${API}/api/leads/${leadId}/detail`).then(r => { if (!r.ok) throw new Error(); return r.json(); });
      setLead(data);
    } catch { toast.error('Failed to load lead'); navigate('/workspace/sales/leads'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadLead();
    Promise.all([
      fetch(`${API}/api/leads/accounts/list`).then(r => r.json()),
      fetch(`${API}/api/leads/contacts/list`).then(r => r.json()),
    ]).then(([a, c]) => { setAccounts(a); setContacts(c); }).catch(() => {});
  }, [leadId]);

  const postComment = async () => {
    if (!comment.trim()) return;
    setSendingComment(true);
    try {
      const entry = await fetch(`${API}/api/leads/${leadId}/stream`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment.trim(), user_name: employee?.name || 'Admin' }),
      }).then(r => r.json());
      setLead(prev => ({ ...prev, stream: [entry, ...(prev?.stream || [])] }));
      setComment('');
    } catch { toast.error('Failed to post comment'); }
    finally { setSendingComment(false); }
  };

  const openEdit = () => {
    setEditForm({
      status: lead.status, priority: lead.priority, assigned_to: lead.assigned_to || '',
      amount: lead.amount || 0, probability: lead.probability || 0,
      close_date: lead.close_date || '', account_id: lead.account_id || '',
      contact_ids: lead.contact_ids || [], description: lead.description || '',
      lead_source: lead.lead_source || '', next_followup: lead.next_followup || '',
      notes: lead.notes || '',
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/leads/${leadId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      toast.success('Lead updated');
      setShowEdit(false);
      loadLead();
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const quickStatus = async (newStatus) => {
    try {
      await fetch(`${API}/api/leads/${leadId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, assigned_to: employee?.name || 'Admin' }),
      });
      toast.success(`Status changed to ${newStatus}`);
      loadLead();
    } catch { toast.error('Failed'); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment(); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  if (!lead) return null;

  const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; }
  };

  const formatDateTime = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return d; }
  };

  return (
    <div className="max-w-6xl" data-testid="lead-detail-page">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <Link to="/workspace/sales/leads" className="text-emerald-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> All Leads
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-400" />
        <span className="text-slate-700 font-medium truncate">{lead.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" data-testid="lead-detail-name">{lead.name}</h1>
          {lead.company && lead.company !== lead.name && <p className="text-slate-500 text-sm mt-0.5">{lead.company}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEdit} data-testid="edit-lead-btn"><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
          {lead.phone && <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"><Phone className="w-4 h-4" /> Call</a>}
          {lead.phone && <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition-colors"><MessageCircle className="w-4 h-4" /> WhatsApp</a>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lead Details + Stream */}
        <div className="lg:col-span-2 space-y-5">
          {/* Detail Fields */}
          <Card>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Stage</div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-md text-sm font-medium capitalize border ${STATUS_COLORS[lead.status] || ''}`} data-testid="lead-detail-status">{lead.status}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Amount</div>
                  <div className="text-lg font-semibold text-slate-800 flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />{(lead.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Account</div>
                  {lead.account_name ? (
                    <span className="text-sm text-blue-600 font-medium flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{lead.account_name}</span>
                  ) : <span className="text-sm text-slate-400">None</span>}
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Probability, %</div>
                  <div className="text-sm font-medium text-slate-700">{lead.probability || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Close Date</div>
                  <div className="text-sm text-slate-700">{formatDate(lead.close_date)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Lead Source</div>
                  <div className="text-sm text-slate-700 capitalize">{lead.lead_source || lead.source || 'None'}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Contacts</div>
                  {lead.contacts && lead.contacts.length > 0 ? (
                    <div className="space-y-1">{lead.contacts.map(c => (
                      <span key={c.id} className="inline-flex items-center gap-1 text-sm text-blue-600"><UserCircle className="w-3.5 h-3.5" />{c.name}</span>
                    ))}</div>
                  ) : <span className="text-sm text-slate-400">None</span>}
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Phone</div>
                  {lead.phone ? <a href={`tel:${lead.phone}`} className="text-sm text-blue-600 hover:underline">{lead.phone}</a> : <span className="text-sm text-slate-400">-</span>}
                </div>
                {lead.email && <div>
                  <div className="text-xs text-slate-400 mb-1">Email</div>
                  <a href={`mailto:${lead.email}`} className="text-sm text-blue-600 hover:underline">{lead.email}</a>
                </div>}
                {lead.website && <div>
                  <div className="text-xs text-slate-400 mb-1">Website</div>
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Globe className="w-3 h-3" />{lead.website.replace(/https?:\/\//, '').slice(0, 40)}</a>
                </div>}
                {lead.address && <div className="col-span-2">
                  <div className="text-xs text-slate-400 mb-1">Address</div>
                  <div className="text-sm text-slate-700 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{lead.address}{lead.location ? `, ${lead.location}` : ''}</div>
                </div>}
              </div>
              {lead.description && <div className="mt-4 pt-4 border-t">
                <div className="text-xs text-slate-400 mb-1">Description</div>
                <div className="text-sm text-slate-700 whitespace-pre-wrap">{lead.description}</div>
              </div>}
            </CardContent>
          </Card>

          {/* Stream */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-700 mb-4">Stream</h3>
              {/* Comment Input */}
              <div className="flex gap-3 mb-5">
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-semibold text-xs flex-shrink-0">
                  {(employee?.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    ref={commentRef}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write your comment here..."
                    className="w-full h-16 px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                    data-testid="stream-comment-input"
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={postComment} disabled={sendingComment || !comment.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="post-comment-btn">
                      {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1" /> Post</>}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stream Entries */}
              <div className="space-y-4">
                {(!lead.stream || lead.stream.length === 0) && (
                  <p className="text-sm text-slate-400 text-center py-4">No activity yet. Write the first update!</p>
                )}
                {lead.stream && lead.stream.map(entry => (
                  <div key={entry.id} className="flex gap-3" data-testid={`stream-entry-${entry.id}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${entry.type === 'comment' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {(entry.user_name || 'S').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-700">{entry.user_name || 'System'}</span>
                        {entry.type !== 'comment' && <span className="text-xs text-slate-400 italic">{entry.type === 'status_change' ? 'status update' : entry.type}</span>}
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap">{entry.content}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDateTime(entry.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Quick Stage Change */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Stage</h4>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map(s => (
                  <button key={s} onClick={() => quickStatus(s)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all border ${lead.status === s ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                    data-testid={`stage-btn-${s}`}>
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assigned User & Meta */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <div className="text-xs text-slate-400 mb-1">Assigned User</div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-semibold">
                    {(lead.assigned_to || 'N').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{lead.assigned_to || 'Unassigned'}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Priority</div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${PRIORITY_COLORS[lead.priority] || ''}`}>{lead.priority || 'medium'}</span>
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1">Created</div>
                <div className="text-sm text-slate-600">{formatDateTime(lead.created_at)}</div>
              </div>
              {lead.next_followup && <div>
                <div className="text-xs text-slate-400 mb-1">Next Follow-up</div>
                <div className="text-sm text-slate-700 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-amber-500" />{formatDate(lead.next_followup)}</div>
              </div>}
              {lead.business_type && <div>
                <div className="text-xs text-slate-400 mb-1">Business Type</div>
                <div className="text-sm text-slate-600 capitalize">{lead.business_type}</div>
              </div>}
              {lead.location && <div>
                <div className="text-xs text-slate-400 mb-1">Location</div>
                <div className="text-sm text-slate-600">{lead.location}</div>
              </div>}
            </CardContent>
          </Card>

          {/* Notes */}
          {lead.notes && (
            <Card>
              <CardContent className="p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Notes</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Actions</h4>
              <div className="space-y-2">
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm hover:bg-blue-100 transition-colors w-full">
                    <Phone className="w-4 h-4" /> Call {lead.phone}
                  </a>
                )}
                {lead.phone && (
                  <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi, this is from The Good Men Enterprise.')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-600 text-sm hover:bg-green-100 transition-colors w-full">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 text-purple-600 text-sm hover:bg-purple-100 transition-colors w-full">
                    <Mail className="w-4 h-4" /> Email
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={v => { if (!v) setShowEdit(false); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Lead</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Status</Label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm" data-testid="edit-detail-status">
                  {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div><Label>Priority</Label>
                <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm">
                  {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (INR)</Label><Input type="number" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })} /></div>
              <div><Label>Probability %</Label><Input type="number" min="0" max="100" value={editForm.probability} onChange={e => setEditForm({ ...editForm, probability: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Close Date</Label><Input type="date" value={editForm.close_date} onChange={e => setEditForm({ ...editForm, close_date: e.target.value })} /></div>
              <div><Label>Next Follow-up</Label><Input type="date" value={editForm.next_followup} onChange={e => setEditForm({ ...editForm, next_followup: e.target.value })} /></div>
            </div>
            <div><Label>Account</Label>
              <select value={editForm.account_id} onChange={e => setEditForm({ ...editForm, account_id: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm">
                <option value="">-- None --</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div><Label>Assigned To</Label><Input value={editForm.assigned_to} onChange={e => setEditForm({ ...editForm, assigned_to: e.target.value })} placeholder="Assigned user" /></div>
            <div><Label>Lead Source</Label>
              <select value={editForm.lead_source} onChange={e => setEditForm({ ...editForm, lead_source: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm">
                <option value="">None</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold_call">Cold Call</option>
                <option value="scraper">Scraper</option>
                <option value="social_media">Social Media</option>
                <option value="trade_show">Trade Show</option>
                <option value="partner">Partner</option>
              </select>
            </div>
            <div><Label>Description</Label>
              <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full h-20 px-3 py-2 rounded-md border text-sm resize-none" placeholder="Detailed description..." />
            </div>
            <div><Label>Notes</Label>
              <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} className="w-full h-16 px-3 py-2 rounded-md border text-sm resize-none" placeholder="Internal notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white" data-testid="save-detail-edit-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
