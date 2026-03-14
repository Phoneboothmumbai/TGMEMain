import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  Shield, CheckCircle2, Phone, Clock, Wrench, Monitor,
  Printer, Server, Wifi, Camera, Laptop, Plus, Minus,
  Loader2, ArrowRight, Star, Zap, Crown, X
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const plans = [
  {
    id: 'silver',
    name: 'Silver',
    price: 2500,
    icon: Shield,
    color: 'from-slate-400 to-slate-500',
    accent: 'text-slate-600',
    border: 'border-slate-200 hover:border-slate-400',
    bg: 'bg-slate-50',
    badge: null,
    features: [
      'Response within 48 hours',
      '2 on-site visits per year',
      'Remote support (business hours)',
      'Labor charges included',
      'Parts charged at actuals',
      'Annual preventive checkup',
      'Email & phone support',
    ],
    notIncluded: ['Parts not included', 'No dedicated manager'],
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 3000,
    icon: Star,
    color: 'from-amber-400 to-amber-500',
    accent: 'text-amber-600',
    border: 'border-amber-200 hover:border-amber-400',
    bg: 'bg-amber-50',
    badge: 'Most Popular',
    features: [
      'Response within 24 hours',
      '4 on-site visits per year',
      'Remote support (extended hours)',
      'Labor charges included',
      'Parts at discounted rates',
      'Quarterly preventive maintenance',
      'Priority email, phone & WhatsApp',
      'Monthly health reports',
    ],
    notIncluded: ['Parts at discounted cost'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 4000,
    icon: Zap,
    color: 'from-violet-400 to-violet-500',
    accent: 'text-violet-600',
    border: 'border-violet-200 hover:border-violet-400',
    bg: 'bg-violet-50',
    badge: null,
    features: [
      'Response within 8 hours',
      '6 on-site visits per year',
      'Remote support (extended hours)',
      'Labor charges included',
      'Parts at cost price',
      'Bi-monthly preventive maintenance',
      'Priority WhatsApp & phone support',
      'Quarterly health reports',
      'Backup & recovery assistance',
    ],
    notIncluded: [],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    price: 6500,
    icon: Crown,
    color: 'from-cyan-400 to-teal-500',
    accent: 'text-teal-600',
    border: 'border-teal-200 hover:border-teal-400',
    bg: 'bg-teal-50',
    badge: 'Premium',
    features: [
      'Response within 4 hours (Priority)',
      'Unlimited on-site visits',
      '24/7 remote support',
      'Labor + Parts fully included',
      'Monthly preventive maintenance',
      'Dedicated Account Manager',
      'Asset tracking & inventory',
      'Quarterly IT audit & reports',
      'Data backup & disaster recovery',
      'Network monitoring & alerts',
      'Replacement device during repair',
    ],
    notIncluded: [],
  },
];

const deviceTypes = [
  { value: 'Desktops', icon: Monitor },
  { value: 'Laptops', icon: Laptop },
  { value: 'Printers / Scanners', icon: Printer },
  { value: 'Servers', icon: Server },
  { value: 'Networking Equipment', icon: Wifi },
  { value: 'CCTV / Surveillance', icon: Camera },
  { value: 'UPS / Power Backup', icon: Zap },
  { value: 'Other', icon: Wrench },
];

export default function AMCPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const [company, setCompany] = useState({ name: '', contact: '', email: '', phone: '', gst: '', address: '', city: '' });
  const [devices, setDevices] = useState([{ device_type: 'Desktops', count: 1, details: '' }]);
  const [notes, setNotes] = useState('');

  const addDevice = () => setDevices(prev => [...prev, { device_type: 'Laptops', count: 1, details: '' }]);
  const removeDevice = (i) => setDevices(prev => prev.filter((_, idx) => idx !== i));
  const updateDevice = (i, field, val) => {
    setDevices(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: val }; return u; });
  };

  const totalDevices = devices.reduce((s, d) => s + (d.count || 0), 0);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('amc-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company.name || !company.contact || !company.email || !company.phone) {
      toast.error('Please fill all required company details');
      return;
    }
    if (totalDevices === 0) {
      toast.error('Please add at least one device');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/amc/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: company.name,
          contact_person: company.contact,
          email: company.email,
          phone: company.phone,
          gst_number: company.gst || null,
          address: company.address || null,
          city: company.city || null,
          plan: selectedPlan.name,
          devices: devices.filter(d => d.count > 0),
          total_devices: totalDevices,
          notes: notes || null,
        })
      });
      const data = await res.json();
      if (data.success) {
        setTicketId(data.ticket_id);
        setSubmitted(true);
        toast.success('AMC request submitted successfully!');
      } else {
        toast.error(data.detail || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Request Submitted!</h1>
          <p className="text-slate-400 text-lg mb-6">
            Your AMC request has been received. Our team will contact you within 24 hours.
          </p>
          {ticketId && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
              <p className="text-slate-400 text-sm">Your Ticket ID</p>
              <p className="text-2xl font-mono font-bold text-amber-400 mt-1">#{ticketId}</p>
              <p className="text-slate-500 text-xs mt-2">
                Track your request at <a href="https://support.thegoodmen.in" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">support.thegoodmen.in</a>
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.href = '/'} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
              Back to Home
            </Button>
            <Button onClick={() => { setSubmitted(false); setShowForm(false); setSelectedPlan(null); }} className="bg-amber-500 hover:bg-amber-600 text-white">
              Submit Another Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Annual Maintenance Contracts</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Keep Your IT Infrastructure<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Running Smoothly</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Non-comprehensive AMC plans designed for Indian businesses. Expert on-site support,
            preventive maintenance, and priority response times to minimize your downtime.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> Fast Response</span>
            <span className="flex items-center gap-1.5"><Wrench className="w-4 h-4 text-amber-500" /> Expert Engineers</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-amber-500" /> Dedicated Support</span>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative bg-slate-800/60 backdrop-blur border rounded-2xl p-6 transition-all duration-300 cursor-pointer group
                    ${isSelected ? 'border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]' : 'border-slate-700 hover:border-slate-500'}
                  `}
                  onClick={() => handleSelectPlan(plan)}
                  data-testid={`plan-${plan.id}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-bold text-white">{plan.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</span>
                    <span className="text-slate-500 text-sm">/device/year</span>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                    {plan.notIncluded.map((f, i) => (
                      <li key={`no-${i}`} className="flex items-start gap-2 text-sm text-slate-500">
                        <X className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${isSelected ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'} transition-colors`}
                    data-testid={`select-plan-${plan.id}`}
                  >
                    {isSelected ? 'Selected' : 'Get This Plan'} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form Section */}
      {showForm && selectedPlan && (
        <section id="amc-form" className="pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center`}>
                  <selectedPlan.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Request {selectedPlan.name} Plan</h2>
                  <p className="text-slate-400 text-sm">{selectedPlan.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}/device/year</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Details */}
                <div>
                  <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Company Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">Company Name *</Label>
                      <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} required
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="Your company name" data-testid="amc-company-name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">Contact Person *</Label>
                      <Input value={company.contact} onChange={(e) => setCompany({ ...company, contact: e.target.value })} required
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="Full name" data-testid="amc-contact-person" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">Email *</Label>
                      <Input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} required
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="email@company.com" data-testid="amc-email" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">Phone *</Label>
                      <Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} required
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="98XXXXXXXX" data-testid="amc-phone" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">GST Number</Label>
                      <Input value={company.gst} onChange={(e) => setCompany({ ...company, gst: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="Optional" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">City</Label>
                      <Input value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="e.g., Mumbai" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <Label className="text-slate-300 text-xs">Address</Label>
                    <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="Office / site address" />
                  </div>
                </div>

                {/* Device Inventory */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Device Inventory</h3>
                    <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">Total: {totalDevices} devices</span>
                  </div>
                  <div className="space-y-3">
                    {devices.map((d, i) => (
                      <div key={i} className="bg-slate-700/30 border border-slate-700 rounded-xl p-4">
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <Label className="text-slate-400 text-xs">Device Type</Label>
                            <select
                              value={d.device_type}
                              onChange={(e) => updateDevice(i, 'device_type', e.target.value)}
                              className="w-full h-9 mt-1 bg-slate-700/50 border border-slate-600 rounded-md text-white text-sm px-3 outline-none focus:border-amber-500"
                              data-testid={`device-type-${i}`}
                            >
                              {deviceTypes.map(dt => (
                                <option key={dt.value} value={dt.value}>{dt.value}</option>
                              ))}
                            </select>
                          </div>
                          <div className="w-20">
                            <Label className="text-slate-400 text-xs">Count</Label>
                            <Input type="number" min="1" value={d.count}
                              onChange={(e) => updateDevice(i, 'count', parseInt(e.target.value) || 0)}
                              className="bg-slate-700/50 border-slate-600 text-white h-9 mt-1 text-center" data-testid={`device-count-${i}`} />
                          </div>
                          {devices.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeDevice(i)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9 px-2">
                              <Minus className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <div className="mt-2">
                          <Input value={d.details} onChange={(e) => updateDevice(i, 'details', e.target.value)}
                            placeholder="Model / brand details (optional)"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 h-8 text-xs" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addDevice}
                    className="w-full mt-3 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white" data-testid="add-device-btn">
                    <Plus className="w-3 h-3 mr-1" /> Add Another Device Type
                  </Button>
                </div>

                {/* Estimated Cost */}
                {totalDevices > 0 && (
                  <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-xs">Estimated Annual Cost</p>
                        <p className="text-sm text-slate-300 mt-0.5">{totalDevices} devices x {selectedPlan.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-400">
                        {(totalDevices * selectedPlan.price).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                        <span className="text-xs text-slate-500 font-normal">/year</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs">Additional Notes / Requirements</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
                    placeholder="Any specific requirements, preferred visit schedule, etc." />
                </div>

                {/* Submit */}
                <Button type="submit" className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base" disabled={submitting} data-testid="submit-amc-btn">
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</>
                  ) : (
                    <><Shield className="w-5 h-5 mr-2" /> Submit AMC Request</>
                  )}
                </Button>
                <p className="text-xs text-slate-500 text-center">Our team will review your request and get back within 24 hours.</p>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center">
        <p className="text-slate-500 text-sm">The Good Men Enterprise - Your Trusted IT Partner</p>
      </footer>
    </div>
  );
}
