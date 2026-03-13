import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import {
  Building2, Plus, MapPin, User, Search, Loader2, Phone,
  Mail, ChevronDown, ChevronUp, Eye, Upload
} from 'lucide-react';
import BulkUploadDialog from './BulkUploadDialog';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [expandedClient, setExpandedClient] = useState(null);
  const [clientDetail, setClientDetail] = useState(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBulk, setShowBulk] = useState(false);

  const [form, setForm] = useState({ company_name: '', gst_number: '', industry: '', notes: '' });
  const [locationForm, setLocationForm] = useState({ location_name: '', address: '', city: '', state: '', pincode: '' });
  const [contactForm, setContactForm] = useState({ name: '', designation: '', phone: '', email: '', whatsapp: '', is_primary: false });

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    try {
      const data = await workspaceApi.getClients();
      setClients(data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workspaceApi.createClient(form);
      toast.success('Client added successfully');
      setShowAdd(false);
      setForm({ company_name: '', gst_number: '', industry: '', notes: '' });
      loadClients();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = async (clientId) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
      setClientDetail(null);
      return;
    }
    try {
      const detail = await workspaceApi.getClient(clientId);
      setClientDetail(detail);
      setExpandedClient(clientId);
    } catch (error) {
      toast.error('Failed to load client details');
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workspaceApi.createLocation({ ...locationForm, client_id: expandedClient });
      toast.success('Location added');
      setShowAddLocation(false);
      setLocationForm({ location_name: '', address: '', city: '', state: '', pincode: '' });
      const detail = await workspaceApi.getClient(expandedClient);
      setClientDetail(detail);
      loadClients();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workspaceApi.createContact({ ...contactForm, client_id: expandedClient });
      toast.success('Contact added');
      setShowAddContact(false);
      setContactForm({ name: '', designation: '', phone: '', email: '', whatsapp: '', is_primary: false });
      const detail = await workspaceApi.getClient(expandedClient);
      setClientDetail(detail);
      loadClients();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = clients.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.gst_number && c.gst_number.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4" data-testid="clients-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" data-testid="clients-title">Clients</h1>
          <p className="text-slate-500 text-sm">{clients.length} total clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulk(true)} data-testid="bulk-upload-clients-btn">
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={() => setShowAdd(true)} className="bg-amber-500 hover:bg-amber-600" data-testid="add-client-btn">
            <Plus className="w-4 h-4 mr-2" /> Add Client
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-slate-200"
          data-testid="client-search-input"
        />
      </div>

      {/* Clients List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500" data-testid="no-clients-message">No clients found. Add your first client to get started.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((client) => (
            <Card key={client.id} className="border-slate-200" data-testid={`client-card-${client.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{client.company_name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        {client.gst_number && <span>GST: {client.gst_number}</span>}
                        {client.industry && <span>{client.industry}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" /> {client.locations_count}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <User className="w-3 h-3 mr-1" /> {client.contacts_count}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(client.id)}
                      data-testid={`expand-client-${client.id}`}
                    >
                      {expandedClient === client.id ? <ChevronUp className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedClient === client.id && clientDetail && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4" data-testid="client-detail-section">
                    {/* Locations */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> Locations
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => setShowAddLocation(true)} data-testid="add-location-btn">
                          <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                      {clientDetail.locations?.length > 0 ? (
                        <div className="space-y-2">
                          {clientDetail.locations.map((loc) => (
                            <div key={loc.id} className="p-3 bg-slate-50 rounded-lg text-sm" data-testid={`location-${loc.id}`}>
                              <p className="font-medium text-slate-700">{loc.location_name}</p>
                              <p className="text-slate-500 text-xs mt-0.5">{loc.address}, {loc.city}, {loc.state} - {loc.pincode}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No locations added yet</p>
                      )}
                    </div>

                    {/* Contacts */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                          <User className="w-4 h-4" /> Contacts
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => setShowAddContact(true)} data-testid="add-contact-btn">
                          <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                      {clientDetail.contacts?.length > 0 ? (
                        <div className="space-y-2">
                          {clientDetail.contacts.map((con) => (
                            <div key={con.id} className="p-3 bg-slate-50 rounded-lg text-sm flex items-center justify-between" data-testid={`contact-${con.id}`}>
                              <div>
                                <p className="font-medium text-slate-700">
                                  {con.name}
                                  {con.is_primary && <Badge className="ml-2 text-xs bg-amber-100 text-amber-700">Primary</Badge>}
                                </p>
                                <p className="text-slate-500 text-xs mt-0.5">{con.designation}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                {con.phone && (
                                  <a href={`tel:${con.phone}`} className="flex items-center gap-1 hover:text-amber-600">
                                    <Phone className="w-3 h-3" /> {con.phone}
                                  </a>
                                )}
                                {con.whatsapp && (
                                  <a
                                    href={`https://wa.me/${con.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-700 font-medium"
                                    data-testid={`whatsapp-${con.id}`}
                                  >
                                    WhatsApp
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">No contacts added yet</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Client Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md" data-testid="add-client-dialog">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddClient} className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} required data-testid="client-name-input" />
            </div>
            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} placeholder="e.g., 27AABCU9603R1ZM" data-testid="client-gst-input" />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g., Manufacturing, IT" data-testid="client-industry-input" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes" data-testid="client-notes-input" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={saving} data-testid="save-client-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Location Dialog */}
      <Dialog open={showAddLocation} onOpenChange={setShowAddLocation}>
        <DialogContent className="sm:max-w-md" data-testid="add-location-dialog">
          <DialogHeader>
            <DialogTitle>Add Location</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLocation} className="space-y-4">
            <div className="space-y-2">
              <Label>Location Name *</Label>
              <Input value={locationForm.location_name} onChange={(e) => setLocationForm({ ...locationForm, location_name: e.target.value })} placeholder="e.g., Head Office" required data-testid="location-name-input" />
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input value={locationForm.address} onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })} required data-testid="location-address-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={locationForm.city} onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })} required data-testid="location-city-input" />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input value={locationForm.state} onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value })} required data-testid="location-state-input" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pincode *</Label>
              <Input value={locationForm.pincode} onChange={(e) => setLocationForm({ ...locationForm, pincode: e.target.value })} required data-testid="location-pincode-input" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddLocation(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={saving} data-testid="save-location-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Location
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="sm:max-w-md" data-testid="add-contact-dialog">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddContact} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required data-testid="contact-name-input" />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input value={contactForm.designation} onChange={(e) => setContactForm({ ...contactForm, designation: e.target.value })} placeholder="e.g., IT Manager" data-testid="contact-designation-input" />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} required data-testid="contact-phone-input" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} data-testid="contact-email-input" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input value={contactForm.whatsapp} onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })} placeholder="Same as phone if empty" data-testid="contact-whatsapp-input" />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_primary"
                checked={contactForm.is_primary}
                onChange={(e) => setContactForm({ ...contactForm, is_primary: e.target.checked })}
                className="rounded"
                data-testid="contact-primary-checkbox"
              />
              <Label htmlFor="is_primary" className="text-sm">Primary Contact</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddContact(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={saving} data-testid="save-contact-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload */}
      <BulkUploadDialog
        open={showBulk}
        onOpenChange={setShowBulk}
        title="Clients"
        columns={['company_name', 'gst_number', 'industry', 'notes']}
        templateFilename="clients_template.csv"
        onUpload={workspaceApi.bulkUploadClients}
        onSuccess={loadClients}
      />
    </div>
  );
}