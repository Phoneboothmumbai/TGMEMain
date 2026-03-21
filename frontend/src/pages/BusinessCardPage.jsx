import React, { useState } from 'react';

const C = {
  name: 'Chaarudutt Motta', desg: '\u092E\u093E\u0932\u093F\u0915', company: 'The Good Men Enterprise',
  phone: '+919820998208', phoneClean: '919820998208', email: 'ckmotta@thegoodmen.in',
  website: 'https://thegoodmen.in', addr: '7, Lok Kedar, JSD Road, Mulund West, Mumbai - 400080',
  waMsg: 'Hi Chaarudutt, I scanned your business card. I\u2019d like to know more about TGME\u2019s IT services.',
  vcf: 'BEGIN:VCARD\nVERSION:3.0\nFN:Chaarudutt Motta\nN:Motta;Chaarudutt;;;\nORG:The Good Men Enterprise\nTITLE:\u092E\u093E\u0932\u093F\u0915\nTEL;TYPE=CELL:+919820998208\nEMAIL;TYPE=WORK:ckmotta@thegoodmen.in\nEMAIL;TYPE=WORK:support@thegoodmen.in\nNOTE:IT Support Mumbai | Computer AMC | CCTV Installation | Networking | Server | Printer Repair | UPS | Apple Mac iPad | Cybersecurity | Firewall | Email Setup | Google Workspace | Data Backup | Hardware Repair | Laptop Desktop | IT Company Mulund Thane | Annual Maintenance Contract | IT Infrastructure | Access Control | Attendance Machine | Software License | Cloud Solutions | WiFi Setup | IT Services\nURL:https://thegoodmen.in\nADR;TYPE=WORK:;;7, Lok Kedar, JSD Road, Mulund West, Mumbai - 400080;;;;\nEND:VCARD',
};

const dl = () => { const b = new Blob([C.vcf], { type: 'text/vcard;charset=utf-8' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'Chaarudutt_Motta_TGME.vcf'; a.click(); URL.revokeObjectURL(u); };
const sh = () => { if (navigator.share) navigator.share({ title: C.name + ' - TGME', text: 'Contact for IT services in Mumbai', url: location.href }).catch(() => {}); else { navigator.clipboard.writeText(location.href); alert('Link copied!'); } };

const Pin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:1}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const Dn = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const Msg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>;
const Ph = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const Hp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>;
const Chv = ({open}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{transition:'transform .2s',transform:open?'rotate(180deg)':'none'}}><polyline points="6 9 12 15 18 9"/></svg>;
const Gl = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
const Em = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const Sh = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;

const SVCS = [
  ['IT Support & AMC','M2 3h20v14H2zM8 21h8M12 17v4'],
  ['CCTV & Security','M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z|C12 13 4'],
  ['Networking','M5 12.55a11 11 0 0114.08 0|M1.42 9a16 16 0 0121.16 0|M8.53 16.11a6 6 0 016.95 0|L12 20 12.01 20'],
  ['Email & Cloud','M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z|P22,6 12,13 2,6'],
  ['Cybersecurity','M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  ['Hardware Repair','M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z'],
];

const btn = 'w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.98] transition-all no-underline';

export default function BusinessCardPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center" data-testid="business-card-page">
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden mb-6">
          <div className="h-3 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400" />
          <div className="px-6 py-5">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight" data-testid="card-name">{C.name}</h1>
            <p className="text-amber-600 font-semibold text-base mt-0.5" data-testid="card-designation">{C.desg}</p>
            <p className="text-slate-500 text-sm mt-1">{C.company}</p>
            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400"><Pin /><span>{C.addr}</span></div>
          </div>
        </div>
        <div className="space-y-3 mb-6">
          <button onClick={dl} className={btn} data-testid="save-contact-btn">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><Dn /></div>
            <div className="text-left"><div className="font-semibold text-slate-800 text-sm">Save Contact</div><div className="text-xs text-slate-400">Add to your phonebook</div></div>
          </button>
          <a href={`https://wa.me/${C.phoneClean}?text=${encodeURIComponent(C.waMsg)}`} target="_blank" rel="noopener noreferrer" className={btn} data-testid="whatsapp-btn">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600"><Msg /></div>
            <div className="text-left"><div className="font-semibold text-slate-800 text-sm">Chat on WhatsApp</div><div className="text-xs text-slate-400">Quick message, instant reply</div></div>
          </a>
          <a href={`tel:${C.phone}`} className={btn} data-testid="call-btn">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Ph /></div>
            <div className="text-left"><div className="font-semibold text-slate-800 text-sm">Call Now</div><div className="text-xs text-slate-400">{C.phone}</div></div>
          </a>
          <a href="https://thegoodmen.in/support" className={btn} data-testid="support-btn">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600"><Hp /></div>
            <div className="text-left"><div className="font-semibold text-slate-800 text-sm">Request Support</div><div className="text-xs text-slate-400">IT help & service requests</div></div>
          </a>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left" data-testid="services-toggle">
            <span className="font-semibold text-slate-700 text-sm">What we do</span><Chv open={open} />
          </button>
          {open && <div className="grid grid-cols-2 gap-2 px-5 pb-5">{SVCS.map(([l]) => <div key={l} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span className="text-xs text-slate-600 font-medium">{l}</span></div>)}</div>}
        </div>
        <div className="flex items-center justify-center gap-4 mb-8">
          <a href={C.website} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500" data-testid="website-link"><Gl /></a>
          <a href={`mailto:${C.email}`} className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500" data-testid="email-link"><Em /></a>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(C.addr)}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500" data-testid="map-link"><Pin /></a>
          <button onClick={sh} className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-500" data-testid="share-btn"><Sh /></button>
        </div>
        <div className="text-center"><p className="text-xs text-slate-300">thegoodmen.in</p></div>
      </div>
    </div>
  );
}
