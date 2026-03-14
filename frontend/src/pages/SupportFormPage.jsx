import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import {
  ShoppingCart, Headphones, ChevronRight, ChevronLeft, CheckCircle2,
  Loader2, Send, ArrowLeft, AlertTriangle
} from 'lucide-react';
import { quoteTopics, supportTopics, fieldDefs } from '../data/supportFormData';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function SupportFormPage() {
  const [step, setStep] = useState(1); // 1=type, 2=category, 3=subtopic, 4=form
  const [formType, setFormType] = useState(null); // 'quote' or 'support'
  const [category, setCategory] = useState(null);
  const [subTopic, setSubTopic] = useState(null);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', company: '' });
  const [dynValues, setDynValues] = useState({});
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const topics = formType === 'quote' ? quoteTopics : supportTopics;

  const selectType = (type) => { setFormType(type); setStep(2); setCategory(null); setSubTopic(null); };
  const selectCategory = (cat) => { setCategory(cat); setStep(3); setSubTopic(null); };
  const selectSubTopic = (st) => { setSubTopic(st); setDynValues({}); setStep(4); };

  const goBack = () => {
    if (step === 4) { setStep(3); setSubTopic(null); }
    else if (step === 3) { setStep(2); setCategory(null); }
    else if (step === 2) { setStep(1); setFormType(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.name || !contact.email || !contact.phone || !contact.company) {
      toast.error('Please fill all contact fields'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/support/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: formType,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          company_name: contact.company,
          category: category.label,
          sub_topic: subTopic.label,
          priority,
          description,
          dynamic_fields: dynValues,
        }),
      });
      const data = await res.json();
      if (data.success) { setTicketId(data.ticket_id); setSubmitted(true); toast.success('Request submitted!'); }
      else toast.error(data.detail || 'Submission failed');
    } catch { toast.error('Failed to submit. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const reset = () => {
    setStep(1); setFormType(null); setCategory(null); setSubTopic(null);
    setContact({ name: '', email: '', phone: '', company: '' });
    setDynValues({}); setDescription(''); setPriority('normal');
    setSubmitted(false); setTicketId('');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900"><Header />
        <div className="pt-32 pb-20 px-6 max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Request Submitted!</h1>
          <p className="text-slate-400 text-lg mb-2">Our team will get back to you within 24 hours.</p>
          {ticketId && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 my-6">
              <p className="text-slate-400 text-sm">Ticket ID</p>
              <p className="text-2xl font-mono font-bold text-amber-400 mt-1">#{ticketId}</p>
              <p className="text-slate-500 text-xs mt-2">Track at <a href="https://support.thegoodmen.in" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">support.thegoodmen.in</a></p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.location.href = '/'} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">Home</Button>
            <Button onClick={reset} className="bg-amber-500 hover:bg-amber-600 text-white">Submit Another</Button>
          </div>
        </div>
      </div>
    );
  }

  const isQuote = formType === 'quote';
  const accentColor = isQuote ? 'amber' : 'blue';

  return (
    <div className="min-h-screen bg-slate-900"><Header />
      <div className="pt-28 pb-20 px-6 max-w-3xl mx-auto">

        {/* Breadcrumb */}
        {step > 1 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
            <button onClick={reset} className="hover:text-amber-400 transition-colors">Home</button>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => { setStep(2); setCategory(null); setSubTopic(null); }} className={`hover:text-amber-400 ${step === 2 ? 'text-amber-400' : ''}`}>
              {isQuote ? 'Request Quote' : 'Request Support'}
            </button>
            {category && (<><ChevronRight className="w-3 h-3" /><button onClick={() => { setStep(3); setSubTopic(null); }} className={`hover:text-amber-400 ${step === 3 ? 'text-amber-400' : ''}`}>{category.label}</button></>)}
            {subTopic && (<><ChevronRight className="w-3 h-3" /><span className="text-amber-400">{subTopic.label}</span></>)}
          </div>
        )}

        {/* Step 1 — Choose Type */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 text-center">How can we help?</h1>
            <p className="text-slate-400 text-center mb-8">Choose what you need and we'll guide you through</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <button onClick={() => selectType('quote')}
                className="bg-slate-800/60 border border-slate-700 hover:border-amber-500/50 rounded-2xl p-8 text-left transition-all group" data-testid="choose-quote">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Request a Quote</h2>
                <p className="text-slate-400 text-sm">Get pricing for hardware, software, IT services, hosting, security & more</p>
              </button>
              <button onClick={() => selectType('support')}
                className="bg-slate-800/60 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-8 text-left transition-all group" data-testid="choose-support">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Headphones className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Request Support</h2>
                <p className="text-slate-400 text-sm">Get help with technical issues, troubleshooting, repairs & service requests</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Choose Category */}
        {step === 2 && (
          <div>
            <button onClick={goBack} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl font-bold text-white mb-1">{isQuote ? 'What do you need a quote for?' : 'What do you need help with?'}</h1>
            <p className="text-slate-400 text-sm mb-6">Select a category</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topics.map((t) => (
                <button key={t.id} onClick={() => selectCategory(t)}
                  className={`bg-slate-800/50 border border-slate-700 hover:border-${accentColor}-500/40 rounded-xl p-4 text-left transition-all group`}
                  data-testid={`cat-${t.id}`}>
                  <span className="text-white font-medium group-hover:text-amber-400 transition-colors">{t.label}</span>
                  <span className="text-slate-500 text-xs ml-2">{t.subtopics.length} options</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Choose Sub-Topic */}
        {step === 3 && category && (
          <div>
            <button onClick={goBack} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl font-bold text-white mb-1">{category.label}</h1>
            <p className="text-slate-400 text-sm mb-6">Select your specific need</p>
            <div className="space-y-2">
              {category.subtopics.map((st) => (
                <button key={st.id} onClick={() => selectSubTopic(st)}
                  className="w-full bg-slate-800/50 border border-slate-700 hover:border-amber-500/40 rounded-xl px-5 py-3.5 text-left transition-all flex items-center justify-between group"
                  data-testid={`st-${st.id}`}>
                  <span className="text-white text-sm group-hover:text-amber-400 transition-colors">{st.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Form */}
        {step === 4 && subTopic && (
          <div>
            <button onClick={goBack} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-1">{subTopic.label}</h2>
              <p className="text-slate-500 text-sm mb-6">{category.label} — {isQuote ? 'Quote Request' : 'Support Request'}</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Contact Details */}
                <div>
                  <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Your Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1"><Label className="text-slate-300 text-xs">Name *</Label>
                      <Input value={contact.name} onChange={e => setContact({...contact, name: e.target.value})} required className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 h-9" placeholder="Full name" data-testid="sf-name" /></div>
                    <div className="space-y-1"><Label className="text-slate-300 text-xs">Company Name *</Label>
                      <Input value={contact.company} onChange={e => setContact({...contact, company: e.target.value})} required className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 h-9" placeholder="Company name" data-testid="sf-company" /></div>
                    <div className="space-y-1"><Label className="text-slate-300 text-xs">Email *</Label>
                      <Input type="email" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} required className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 h-9" placeholder="email@company.com" data-testid="sf-email" /></div>
                    <div className="space-y-1"><Label className="text-slate-300 text-xs">Phone *</Label>
                      <Input value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} required className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 h-9" placeholder="98XXXXXXXX" data-testid="sf-phone" /></div>
                  </div>
                </div>

                {/* Dynamic Fields */}
                {subTopic.fields.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
                      {isQuote ? 'Requirement Details' : 'Issue Details'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {subTopic.fields.map((fk) => {
                        const fd = fieldDefs[fk];
                        if (!fd) return null;
                        const val = dynValues[fk] || '';
                        const onChange = (v) => setDynValues(prev => ({...prev, [fk]: v}));
                        const cls = "bg-slate-700/50 border-slate-600 text-white placeholder-slate-500";

                        if (fd.type === 'textarea') return (
                          <div key={fk} className="sm:col-span-2 space-y-1">
                            <Label className="text-slate-300 text-xs">{fd.label}</Label>
                            <Textarea value={val} onChange={e => onChange(e.target.value)} rows={2} className={cls} placeholder={fd.placeholder} />
                          </div>
                        );
                        if (fd.type === 'select') return (
                          <div key={fk} className="space-y-1">
                            <Label className="text-slate-300 text-xs">{fd.label}</Label>
                            <select value={val} onChange={e => onChange(e.target.value)}
                              className="w-full h-9 bg-slate-700/50 border border-slate-600 rounded-md text-white text-sm px-3 outline-none focus:border-amber-500">
                              <option value="">Select...</option>
                              {fd.options.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        );
                        if (fd.type === 'date') return (
                          <div key={fk} className="space-y-1">
                            <Label className="text-slate-300 text-xs">{fd.label}</Label>
                            <Input type="date" value={val} onChange={e => onChange(e.target.value)} className={`${cls} h-9`} />
                          </div>
                        );
                        return (
                          <div key={fk} className="space-y-1">
                            <Label className="text-slate-300 text-xs">{fd.label}</Label>
                            <Input type={fd.type === 'number' ? 'number' : 'text'} value={val} onChange={e => onChange(e.target.value)}
                              className={`${cls} h-9`} placeholder={fd.placeholder} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Priority (support only) */}
                {!isQuote && (
                  <div>
                    <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Priority</h3>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setPriority('normal')}
                        className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${priority === 'normal' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                        Normal
                      </button>
                      <button type="button" onClick={() => setPriority('urgent')}
                        className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${priority === 'urgent' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                        <AlertTriangle className="w-3.5 h-3.5" /> Urgent
                      </button>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-1">
                  <Label className="text-slate-300 text-xs">{isQuote ? 'Additional Requirements / Notes' : 'Describe the issue in detail'}</Label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-500"
                    placeholder={isQuote ? 'Any specific requirements, timeline, budget constraints...' : 'Please describe the issue, when it started, steps already tried...'} />
                </div>

                <Button type="submit" className={`w-full h-12 font-semibold text-base text-white ${isQuote ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'}`} disabled={submitting} data-testid="sf-submit">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                  {isQuote ? 'Submit Quote Request' : 'Submit Support Request'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
