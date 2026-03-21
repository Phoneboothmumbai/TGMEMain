import React, { useState } from 'react';
import { Phone, MessageCircle, Download, Headphones, MapPin, Globe, Share2, ChevronDown, Monitor, Shield, Wifi, Mail, Wrench, Camera } from 'lucide-react';

const CONTACT = {
  name: 'Chaarudutt Motta',
  designation: '\u092E\u093E\u0932\u093F\u0915',
  company: 'The Good Men Enterprise',
  phone: '+919820998208',
  phoneClean: '919820998208',
  email: 'info@thegoodmen.in',
  website: 'https://thegoodmen.in',
  address: '7, Lok Kedar, JSD Road, Mulund West, Mumbai - 400080',
  whatsappMsg: 'Hi Chaarudutt, I scanned your business card. I\u2019d like to know more about TGME\u2019s IT services.',
};

const SERVICES = [
  { icon: Monitor, label: 'IT Support & AMC' },
  { icon: Camera, label: 'CCTV & Security' },
  { icon: Wifi, label: 'Networking' },
  { icon: Mail, label: 'Email & Cloud' },
  { icon: Shield, label: 'Cybersecurity' },
  { icon: Wrench, label: 'Hardware Repair' },
];

function generateVCard() {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${CONTACT.name}`,
    `N:Motta;Chaarudutt;;;`,
    `ORG:${CONTACT.company}`,
    `TITLE:${CONTACT.designation}`,
    `TEL;TYPE=CELL:${CONTACT.phone}`,
    `EMAIL:${CONTACT.email}`,
    `URL:${CONTACT.website}`,
    `ADR;TYPE=WORK:;;${CONTACT.address};;;;`,
    'END:VCARD',
  ].join('\n');

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Chaarudutt_Motta_TGME.vcf';
  a.click();
  URL.revokeObjectURL(url);
}

function handleShare() {
  if (navigator.share) {
    navigator.share({
      title: `${CONTACT.name} - ${CONTACT.company}`,
      text: `Contact ${CONTACT.name} from ${CONTACT.company} for IT services in Mumbai.`,
      url: window.location.href,
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
}

export default function BusinessCardPage() {
  const [showServices, setShowServices] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center" data-testid="business-card-page">
      {/* Card Container */}
      <div className="w-full max-w-md mx-auto px-4 py-8">

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden mb-6">
          {/* Top Accent */}
          <div className="h-3 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400" />

          {/* Info */}
          <div className="px-6 py-5">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight" data-testid="card-name">{CONTACT.name}</h1>
            <p className="text-amber-600 font-semibold text-base mt-0.5" data-testid="card-designation">{CONTACT.designation}</p>
            <p className="text-slate-500 text-sm mt-1">{CONTACT.company}</p>

            <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{CONTACT.address}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          {/* Save Contact */}
          <button
            onClick={generateVCard}
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-amber-200 active:scale-[0.98] transition-all group"
            data-testid="save-contact-btn"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Download className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-800 text-sm">Save Contact</div>
              <div className="text-xs text-slate-400">Add to your phonebook</div>
            </div>
          </button>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${CONTACT.phoneClean}?text=${encodeURIComponent(CONTACT.whatsappMsg)}`}
            target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-green-200 active:scale-[0.98] transition-all group no-underline"
            data-testid="whatsapp-btn"
          >
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-800 text-sm">Chat on WhatsApp</div>
              <div className="text-xs text-slate-400">Quick message, instant reply</div>
            </div>
          </a>

          {/* Call Now */}
          <a
            href={`tel:${CONTACT.phone}`}
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 active:scale-[0.98] transition-all group no-underline"
            data-testid="call-btn"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-800 text-sm">Call Now</div>
              <div className="text-xs text-slate-400">{CONTACT.phone}</div>
            </div>
          </a>

          {/* Request Support */}
          <a
            href="https://thegoodmen.in/support"
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md hover:border-purple-200 active:scale-[0.98] transition-all group no-underline"
            data-testid="support-btn"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Headphones className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-800 text-sm">Request Support</div>
              <div className="text-xs text-slate-400">IT help & service requests</div>
            </div>
          </a>
        </div>

        {/* Services Accordion */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <button
            onClick={() => setShowServices(!showServices)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
            data-testid="services-toggle"
          >
            <span className="font-semibold text-slate-700 text-sm">What we do</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showServices ? 'rotate-180' : ''}`} />
          </button>
          {showServices && (
            <div className="grid grid-cols-2 gap-2 px-5 pb-5">
              {SERVICES.map(s => (
                <div key={s.label} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50">
                  <s.icon className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs text-slate-600 font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <a href={CONTACT.website} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:shadow-md transition-shadow" data-testid="website-link">
            <Globe className="w-4.5 h-4.5 text-slate-500" />
          </a>
          <a href={`mailto:${CONTACT.email}`} className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:shadow-md transition-shadow" data-testid="email-link">
            <Mail className="w-4.5 h-4.5 text-slate-500" />
          </a>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(CONTACT.address)}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:shadow-md transition-shadow" data-testid="map-link">
            <MapPin className="w-4.5 h-4.5 text-slate-500" />
          </a>
          <button onClick={handleShare} className="w-11 h-11 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:shadow-md transition-shadow" data-testid="share-btn">
            <Share2 className="w-4.5 h-4.5 text-slate-500" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-300">thegoodmen.in</p>
        </div>
      </div>
    </div>
  );
}
