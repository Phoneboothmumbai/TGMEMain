import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function LeadCaptureForm({ service = '', source = '', variant = 'inline', ctaText = 'Get Free Quote', heading, subheading }) {
  const [form, setForm] = useState({ name: '', phone: '', company: '', service: service });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Please enter your name and phone number');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/leads/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source: source || window.location.pathname }),
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success('We\'ll call you back within 2 hours!');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } catch {
      toast.error('Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`${variant === 'card' ? 'bg-green-50 border border-green-200 rounded-2xl p-8' : 'bg-green-500/10 border border-green-500/20 rounded-xl p-6'} text-center`} data-testid="lead-form-success">
        <CheckCircle2 className={`w-10 h-10 mx-auto mb-3 ${variant === 'card' ? 'text-green-600' : 'text-green-400'}`} />
        <p className={`font-semibold text-lg ${variant === 'card' ? 'text-green-800' : 'text-green-300'}`}>We've received your request!</p>
        <p className={`text-sm mt-1 ${variant === 'card' ? 'text-green-600' : 'text-green-400/80'}`}>Our team will call you back within 2 hours.</p>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm" data-testid="lead-form-card">
        <h3 className="text-xl font-bold text-slate-800 mb-1">{heading || 'Get a Free Quote'}</h3>
        <p className="text-slate-500 text-sm mb-5">{subheading || 'We\'ll call you back within 2 hours'}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="Your Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} data-testid="lead-name" className="h-11" required />
          <Input placeholder="Phone Number *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} data-testid="lead-phone" type="tel" className="h-11" required />
          <Input placeholder="Company Name" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} data-testid="lead-company" className="h-11" />
          <Input placeholder="Service Needed" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} data-testid="lead-service" className="h-11" />
          <Button type="submit" disabled={submitting} className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold" data-testid="lead-submit">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{ctaText} <ArrowRight className="w-4 h-4 ml-1" /></>}
          </Button>
        </form>
      </div>
    );
  }

  // Inline dark variant (for dark pages)
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6" data-testid="lead-form-inline">
      <h3 className="text-lg font-bold text-white mb-1">{heading || 'Get a Free Quote'}</h3>
      <p className="text-slate-400 text-xs mb-4">{subheading || 'We\'ll call you back within 2 hours'}</p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input placeholder="Your Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-10 bg-white/10 border-white/10 text-white placeholder:text-slate-400 text-sm flex-1" required />
        <Input placeholder="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} type="tel" className="h-10 bg-white/10 border-white/10 text-white placeholder:text-slate-400 text-sm flex-1" required />
        <Input placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="h-10 bg-white/10 border-white/10 text-white placeholder:text-slate-400 text-sm flex-1 hidden sm:block" />
        <Button type="submit" disabled={submitting} className="h-10 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 text-sm whitespace-nowrap" data-testid="lead-submit-inline">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{ctaText} <ArrowRight className="w-4 h-4 ml-1" /></>}
        </Button>
      </form>
    </div>
  );
}

// Sticky top banner version
export function LeadCaptureBanner({ service = '' }) {
  const [show, setShow] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/api/leads/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, service, source: window.location.pathname }),
      });
      setDone(true);
      toast.success('We\'ll call you back shortly!');
      setTimeout(() => setShow(false), 3000);
    } catch {} finally { setSubmitting(false); }
  };

  if (done) {
    return (
      <div className="bg-green-600 text-white text-center py-2.5 px-4 text-sm font-medium" data-testid="lead-banner-success">
        <CheckCircle2 className="w-4 h-4 inline mr-1" /> Thanks! We'll call you back within 2 hours.
      </div>
    );
  }

  return (
    <div className="bg-amber-500 text-white py-2.5 px-4" data-testid="lead-banner">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-2 flex-wrap justify-center text-sm">
        <span className="font-semibold whitespace-nowrap">Free IT Assessment</span>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-7 px-2 rounded text-slate-800 text-xs w-28 border-0" required />
        <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="h-7 px-2 rounded text-slate-800 text-xs w-28 border-0" type="tel" required />
        <button type="submit" disabled={submitting} className="h-7 px-3 bg-slate-900 hover:bg-slate-800 rounded text-xs font-semibold transition-colors">
          {submitting ? '...' : 'Get Callback'}
        </button>
        <button type="button" onClick={() => setShow(false)} className="ml-1 text-white/70 hover:text-white text-xs">✕</button>
      </form>
    </div>
  );
}
