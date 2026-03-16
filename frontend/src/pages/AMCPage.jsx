import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { SEO, serviceSchema } from '../components/SEO';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  Shield, CheckCircle2, Phone, Clock, Wrench, Monitor,
  Printer, Server, Wifi, Camera, Laptop, Plus, Minus,
  Loader2, ArrowRight, Star, Zap, Crown, X, Info, MessageSquare
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const plans = [
  {
    id: 'silver', name: 'Silver', price: 2500, icon: Shield,
    color: 'from-slate-400 to-slate-500', border: 'border-slate-700 hover:border-slate-500',
    badge: null,
    features: [
      'Response within 48 business hours',
      'Up to 2 on-site visits/year (if required)',
      'Remote support (Mon\u2013Fri, 11 AM \u2013 6 PM)',
      'Labor charges included',
      'Annual preventive maintenance',
      'Email & phone support',
      'Parts, replacements & consumables billed separately',
    ],
  },
  {
    id: 'gold', name: 'Gold', price: 3000, icon: Star,
    color: 'from-amber-400 to-amber-500', border: 'border-amber-500/30 hover:border-amber-400',
    badge: 'Most Popular',
    features: [
      'Response within 24 business hours',
      'Up to 4 on-site visits/year (if required)',
      'Remote support (Mon\u2013Sat, 11 AM \u2013 8 PM)',
      'Labor charges included',
      'Quarterly preventive maintenance',
      'Priority email, phone & WhatsApp support',
      'Basic device health report',
      'Parts, replacements & consumables billed separately',
    ],
  },
  {
    id: 'platinum', name: 'Platinum', price: 4000, icon: Zap,
    color: 'from-violet-400 to-violet-500', border: 'border-violet-500/30 hover:border-violet-500',
    badge: null,
    features: [
      'Response within 8 business hours',
      'Up to 6 on-site visits/year (if required)',
      'Remote support (Mon\u2013Sat, 11 AM \u2013 9 PM)',
      'Labor charges included',
      'Bi-monthly preventive maintenance',
      'Priority WhatsApp & phone support',
      'Quarterly IT health reports',
      'Backup & recovery assistance',
      'Parts, replacements & consumables billed separately',
    ],
  },
  {
    id: 'diamond', name: 'Diamond', price: 6500, icon: Crown,
    color: 'from-cyan-400 to-teal-500', border: 'border-teal-500/30 hover:border-teal-400',
    badge: 'Premium',
    features: [
      'Response within 4 business hours (priority)',
      'Up to 12 on-site visits/year (if required)',
      'Remote support (Mon\u2013Sat, 11 AM \u2013 10 PM)',
      'Labor charges included',
      'Monthly preventive maintenance',
      'Dedicated priority support contact',
      'Asset inventory tracking',
      'Quarterly IT audit & reports',
      'Network monitoring alerts',
      'Backup monitoring assistance',
      'Parts, replacements & consumables billed separately',
    ],
  },
];

const deviceCategories = [
  { value: 'Desktop', price: 'plan', icon: Monitor, label: 'Desktop', group: 'computer' },
  { value: 'Laptop', price: 'plan', icon: Laptop, label: 'Laptop', group: 'computer' },
  { value: 'Laser Printer', price: 1500, icon: Printer, label: 'Laser Printer', group: 'other' },
  { value: 'Heavy Duty / Network Printer', price: 3000, icon: Printer, label: 'Heavy Duty / Network Printer', group: 'other' },
  { value: 'Basic Server', price: 'quote', icon: Server, label: 'Basic Server (File/Small Business)', group: 'other' },
  { value: 'Critical Server', price: 'quote', icon: Server, label: 'Critical Server (ERP/DB/DC)', group: 'other' },
  { value: 'Router / Switch', price: 1000, icon: Wifi, label: 'Router / Switch', group: 'other' },
  { value: 'Managed Firewall', price: 4000, icon: Wifi, label: 'Managed Firewall (Fortinet/Sophos/Cisco)', group: 'other' },
  { value: 'CCTV Camera', price: 600, icon: Camera, label: 'CCTV Camera', group: 'other' },
  { value: 'DVR / NVR', price: 2500, icon: Camera, label: 'DVR / NVR', group: 'other' },
  { value: 'Desktop UPS', price: 500, icon: Zap, label: 'Desktop UPS', group: 'other' },
  { value: 'Server / Rack UPS', price: 5000, icon: Zap, label: 'Server / Rack UPS', group: 'other' },
];

const otherDevicePricing = [
  { device: 'Laser Printer', price: '1,500', note: 'Troubleshooting, drivers, connectivity, cleaning, jams' },
  { device: 'Heavy Duty / Network Printer', price: '3,000', note: 'Network setup, scan issues, email scan config' },
  { device: 'Router / Switch', price: '1,000', note: 'Network troubleshooting, config checks, firmware updates' },
  { device: 'Managed Firewall', price: '4,000', note: 'Fortinet, Sophos, Ubiquiti, Cisco' },
  { device: 'CCTV Camera', price: '600', note: 'Per camera per year' },
  { device: 'DVR / NVR', price: '2,500', note: 'Per unit per year' },
  { device: 'Desktop UPS', price: '500', note: 'Battery checks, basic maintenance' },
  { device: 'Server / Rack UPS', price: '5,000', note: 'Regular monitoring, battery health' },
  { device: 'Servers', price: null, note: 'Custom quote based on complexity, OS, virtualization & storage' },
];

export default function AMCPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const [company, setCompany] = useState({ name: '', contact: '', email: '', phone: '', gst: '', address: '', city: '' });
  const [devices, setDevices] = useState([{ device_type: 'Desktop', count: 1, details: '' }]);
  const [notes, setNotes] = useState('');

  const addDevice = () => setDevices(prev => [...prev, { device_type: 'Laptop', count: 1, details: '' }]);
  const removeDevice = (i) => setDevices(prev => prev.filter((_, idx) => idx !== i));
  const updateDevice = (i, field, val) => {
    setDevices(prev => { const u = [...prev]; u[i] = { ...u[i], [field]: val }; return u; });
  };

  const getDevicePrice = (deviceType) => {
    const cat = deviceCategories.find(d => d.value === deviceType);
    if (!cat) return 0;
    if (cat.price === 'plan') return selectedPlan?.price || 0;
    if (cat.price === 'quote') return null;
    return cat.price;
  };

  const totalDevices = devices.reduce((s, d) => s + (d.count || 0), 0);
  const hasQuoteItems = devices.some(d => getDevicePrice(d.device_type) === null && d.count > 0);
  const calculableTotal = devices.reduce((s, d) => {
    const p = getDevicePrice(d.device_type);
    return s + (p !== null ? p * (d.count || 0) : 0);
  }, 0);

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
      toast.error('Please fill all required company details'); return;
    }
    if (totalDevices === 0) { toast.error('Please add at least one device'); return; }

    setSubmitting(true);
    try {
      const devicePayload = devices.filter(d => d.count > 0).map(d => ({
        device_type: d.device_type,
        count: d.count,
        details: d.details || null,
        unit_price: getDevicePrice(d.device_type),
      }));

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
          plan_price: selectedPlan.price,
          devices: devicePayload,
          total_devices: totalDevices,
          calculable_total: calculableTotal,
          has_quote_items: hasQuoteItems,
          notes: notes || null,
        })
      });
      const data = await res.json();
      if (data.success) {
        setTicketId(data.ticket_id);
        setSubmitted(true);
        toast.success('AMC request submitted successfully!');
      } else {
        toast.error(data.detail || 'Failed to submit');
      }
    } catch (err) {
      toast.error('Failed to submit. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900">
        <SEO
          title="AMC Plans — Annual Maintenance Contract for IT Equipment Mumbai"
          description="Get Annual Maintenance Contracts for computers, printers, CCTV, servers, UPS, and networking equipment in Mumbai. Plans starting at Rs 2,500/year. 24/7 IT support by TGME."
          keywords="AMC Mumbai, annual maintenance contract computers, IT AMC plans, computer maintenance Mumbai, CCTV AMC, server AMC, printer AMC Mumbai, UPS maintenance contract, TGME AMC"
          path="/amc"
          schema={serviceSchema({ name: 'Annual Maintenance Contract (AMC)', description: 'Comprehensive AMC plans for computers, printers, CCTV, servers, UPS, and networking equipment. Starting Rs 2,500/year.', url: '/amc' })}
        />
        <Header />
        <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Request Submitted!</h1>
          <p className="text-slate-400 text-lg mb-6">Your AMC request has been received. Our team will contact you within 24 hours.</p>
          {ticketId && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
              <p className="text-slate-400 text-sm">Your Ticket ID</p>
              <p className="text-2xl font-mono font-bold text-amber-400 mt-1">#{ticketId}</p>
              <p className="text-slate-500 text-xs mt-2">Track at <a href="https://support.thegoodmen.in" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">support.thegoodmen.in</a></p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.href = '/'} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">Back to Home</Button>
            <Button onClick={() => { setSubmitted(false); setShowForm(false); setSelectedPlan(null); }} className="bg-amber-500 hover:bg-amber-600 text-white">Submit Another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Annual Maintenance Contracts</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Keep Your IT Infrastructure<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">Running Smoothly</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-6">
            Non-comprehensive AMC plans with device-specific pricing. Expert support,
            preventive maintenance, and priority response to minimize downtime.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> Fast Response</span>
            <span className="flex items-center gap-1.5"><Wrench className="w-4 h-4 text-amber-500" /> Expert Engineers</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-amber-500" /> Dedicated Support</span>
          </div>
        </div>
      </section>

      {/* Desktop / Laptop Plans */}
      <section className="pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Monitor className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Desktop & Laptop AMC Plans</h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full ml-2">Per device / year</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <div key={plan.id}
                  className={`relative bg-slate-800/60 backdrop-blur border rounded-2xl p-6 transition-all duration-300 cursor-pointer
                    ${isSelected ? 'border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]' : plan.border}`}
                  onClick={() => handleSelectPlan(plan)}
                  data-testid={`plan-${plan.id}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">{plan.badge}</span>
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
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${isSelected ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                    data-testid={`select-plan-${plan.id}`}>
                    {isSelected ? 'Selected' : 'Get This Plan'} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Other Device Pricing */}
      <section className="pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wrench className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">We Also Cover</h2>
              <span className="text-xs text-slate-500 ml-2">All non-comprehensive — parts billed separately</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {otherDevicePricing.map((item, i) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{item.device}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.note}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {item.price ? (
                      <p className="text-base font-bold text-amber-400">{'\u20B9'}{item.price}<span className="text-[10px] text-slate-500 font-normal">/yr</span></p>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-2 py-1 rounded-full">
                        <MessageSquare className="w-3 h-3" /> Custom Quote
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
                  <h2 className="text-xl font-bold text-white">Request AMC Quote</h2>
                  <p className="text-slate-400 text-sm">{selectedPlan.name} plan selected — Desktop/Laptop @ {selectedPlan.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}/device/year</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Details */}
                <div>
                  <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Company Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">Company Name *</Label>
                      <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} required className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="Your company name" data-testid="amc-company-name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">Contact Person *</Label>
                      <Input value={company.contact} onChange={(e) => setCompany({ ...company, contact: e.target.value })} required className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="Full name" data-testid="amc-contact-person" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">Email *</Label>
                      <Input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} required className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="email@company.com" data-testid="amc-email" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">Phone *</Label>
                      <Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} required className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="98XXXXXXXX" data-testid="amc-phone" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">GST Number</Label>
                      <Input value={company.gst} onChange={(e) => setCompany({ ...company, gst: e.target.value })} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="Optional" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs">City</Label>
                      <Input value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="e.g., Mumbai" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <Label className="text-slate-300 text-xs">Address</Label>
                    <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" placeholder="Office / site address" />
                  </div>
                </div>

                {/* Device Inventory */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Device Inventory</h3>
                    <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">Total: {totalDevices} devices</span>
                  </div>

                  <div className="space-y-3">
                    {devices.map((d, i) => {
                      const unitPrice = getDevicePrice(d.device_type);
                      const isQuote = unitPrice === null;
                      const subtotal = isQuote ? null : unitPrice * (d.count || 0);
                      return (
                        <div key={i} className="bg-slate-700/30 border border-slate-700 rounded-xl p-4">
                          <div className="flex gap-3 items-end">
                            <div className="flex-1">
                              <Label className="text-slate-400 text-xs">Device Type</Label>
                              <select value={d.device_type} onChange={(e) => updateDevice(i, 'device_type', e.target.value)}
                                className="w-full h-9 mt-1 bg-slate-700/50 border border-slate-600 rounded-md text-white text-sm px-3 outline-none focus:border-amber-500"
                                data-testid={`device-type-${i}`}>
                                {deviceCategories.map(dt => (
                                  <option key={dt.value} value={dt.value}>{dt.label}</option>
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
                          <Input value={d.details} onChange={(e) => updateDevice(i, 'details', e.target.value)}
                            placeholder="Model / brand details (optional)"
                            className="mt-2 bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 h-8 text-xs" />
                          {/* Per-device price tag */}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              {isQuote ? '' : `@ ${'\u20B9'}${unitPrice.toLocaleString('en-IN')}/device/yr`}
                            </span>
                            {isQuote ? (
                              <span className="inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-2 py-0.5 rounded-full">
                                <MessageSquare className="w-3 h-3" /> Custom Quote
                              </span>
                            ) : (
                              <span className="text-sm font-semibold text-amber-400">{'\u20B9'}{subtotal?.toLocaleString('en-IN')}/yr</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addDevice}
                    className="w-full mt-3 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white" data-testid="add-device-btn">
                    <Plus className="w-3 h-3 mr-1" /> Add Another Device Type
                  </Button>
                </div>

                {/* Cost Summary */}
                {totalDevices > 0 && (
                  <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
                    {/* Line items */}
                    {devices.filter(d => d.count > 0).map((d, i) => {
                      const up = getDevicePrice(d.device_type);
                      return (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{d.device_type} x {d.count}</span>
                          {up !== null ? (
                            <span className="text-slate-300">{'\u20B9'}{(up * d.count).toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="text-violet-400 text-[11px]">Custom Quote</span>
                          )}
                        </div>
                      );
                    })}
                    <div className="border-t border-amber-500/20 pt-2 flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-xs">Estimated Annual Cost</p>
                        {hasQuoteItems && (
                          <p className="text-violet-400 text-[11px] flex items-center gap-1 mt-0.5"><Info className="w-3 h-3" /> Server pricing upon assessment</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-400">
                          {calculableTotal > 0 ? `${'\u20B9'}${calculableTotal.toLocaleString('en-IN')}` : '-'}
                          {hasQuoteItems && calculableTotal > 0 && <span className="text-xs text-slate-500 font-normal"> +</span>}
                          <span className="text-xs text-slate-500 font-normal">/year</span>
                        </p>
                      </div>
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
                  {submitting ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</>) : (<><Shield className="w-5 h-5 mr-2" /> Submit AMC Request</>)}
                </Button>
                <p className="text-xs text-slate-500 text-center">Our team will review and get back within 24 hours.</p>
              </form>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-800 py-8 px-6 text-center">
        <p className="text-slate-500 text-sm">The Good Men Enterprise - Your Trusted IT Partner</p>
      </footer>
    </div>
  );
}
