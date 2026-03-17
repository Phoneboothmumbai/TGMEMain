import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

const PHONE = '919769444455';

const PAGE_MESSAGES = {
  '/amc': 'Hi TGME, I want to know about your AMC plans for my business.',
  '/support': 'Hi TGME, I need IT support for my business.',
  '/services/cctv': 'Hi TGME, I need CCTV installation for my business.',
  '/services/cctv-installation': 'Hi TGME, I need CCTV camera installation and setup for my business in Mumbai.',
  '/services/networking': 'Hi TGME, I need network/WiFi setup for my office.',
  '/services/server-solutions': 'Hi TGME, I need server installation and maintenance for my business.',
  '/services/printer-repair': 'Hi TGME, I need printer repair or AMC service.',
  '/services/ups-solutions': 'Hi TGME, I need UPS installation for my office.',
  '/services/data-backup': 'Hi TGME, I need data backup solutions for my business.',
  '/services/apple-repair': 'Hi TGME, I need Apple MacBook/iMac repair service.',
  '/services/apple-mac-ipad-bulk': 'Hi TGME, I want bulk pricing for Apple Mac and iPad for my business.',
  '/services/firewall-security': 'Hi TGME, I need firewall and network security setup.',
  '/services/email': 'Hi TGME, I need help setting up business email.',
  '/services/cybersecurity': 'Hi TGME, I need cybersecurity solutions for my business.',
  '/services/repair': 'Hi TGME, I need hardware repair service.',
  '/services/server': 'Hi TGME, I need server setup/maintenance.',
  '/services/printer': 'Hi TGME, I need printer repair/AMC.',
  '/services/ups': 'Hi TGME, I need UPS installation/maintenance.',
  '/services/data-backup': 'Hi TGME, I need data backup solutions.',
  '/services/apple-repair': 'Hi TGME, I need Apple device repair.',
  '/services/firewall': 'Hi TGME, I need firewall/network security setup.',
  '/it-support-mumbai': 'Hi TGME, I need IT support for my business in Mumbai.',
  '/computer-repair-mumbai': 'Hi TGME, I need computer repair service in Mumbai.',
  '/it-support-small-business': 'Hi TGME, I need IT support for my small business.',
  '/it-services-mulund-thane': 'Hi TGME, I need IT services in the Mulund/Thane area.',
};

export function WhatsAppWidget() {
  const [isHovered, setIsHovered] = useState(false);

  const getMessage = () => {
    const path = window.location.pathname;
    for (const [key, msg] of Object.entries(PAGE_MESSAGES)) {
      if (path.startsWith(key)) return msg;
    }
    return 'Hi TGME, I need IT support for my business in Mumbai.';
  };

  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(getMessage())}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-widget"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 no-underline"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ textDecoration: 'none' }}
    >
      {isHovered && (
        <span className="bg-white text-slate-800 text-sm font-medium px-3 py-2 rounded-lg shadow-lg border border-slate-200 animate-fade-in whitespace-nowrap">
          Chat with us
        </span>
      )}
      <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </div>
    </a>
  );
}
