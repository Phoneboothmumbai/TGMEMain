import React from 'react';
import { companyInfo, contactInfo } from '../../data/mock';
import { Mail, Phone, MapPin, ArrowUpRight, Headphones } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const solutions = [
    { label: 'IT Infrastructure & Hardware', href: '/services/infrastructure' },
    { label: 'Networking & Wi-Fi', href: '/services/networking' },
    { label: 'Device Lifecycle Management', href: '/services/devices' },
    { label: 'Cloud & Hosting', href: '/services/cloud' },
    { label: 'Email Solutions', href: '/services/email' },
    { label: 'Cyber Security', href: '/services/cybersecurity' },
    { label: 'Managed IT Support', href: '/services/support' },
    { label: 'Web & Business Applications', href: '/services/webapps' },
    { label: 'Hardware Repair & Service', href: '/services/repair' }
  ];

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About TGME', href: '/about' },
    { label: 'How We Work', href: '/how-we-work' },
    { label: 'Knowledge Base', href: '/kb' },
    { label: 'Support Portal', href: 'https://support.thegoodmen.in', external: true },
    { label: 'Contact', href: '/#contact' }
  ];

  const handleNavClick = (href) => {
    if (href.startsWith('/#')) {
      const isHomePage = window.location.pathname === '/';
      if (isHomePage) {
        const element = document.querySelector(href.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        window.location.href = href;
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-bold text-white text-lg">
                TG
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-lg">{companyInfo.shortName}</span>
                <span className="text-slate-500 text-xs">The Good Men Enterprise</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {companyInfo.tagline}
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <a href={`mailto:${contactInfo.email}`} className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2">
                <Mail size={16} />
                {contactInfo.email}
              </a>
              <a href={`tel:${contactInfo.phone}`} className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-2">
                <Phone size={16} />
                {contactInfo.phone}
              </a>
              <span className="text-slate-400 flex items-center gap-2">
                <MapPin size={16} />
                {contactInfo.address}
              </span>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Solutions</h4>
            <ul className="space-y-3">
              {solutions.map((solution) => (
                <li key={solution.href}>
                  <a
                    href={solution.href}
                    target={solution.external ? "_blank" : undefined}
                    rel={solution.external ? "noopener noreferrer" : undefined}
                    className="text-slate-400 hover:text-amber-400 transition-colors text-sm text-left"
                  >
                    {solution.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-slate-400 hover:text-amber-400 transition-colors text-sm flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Column */}
          <div>
            <h4 className="text-white font-semibold mb-6">Ready to Start?</h4>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Let's discuss how TGME can help build your technology foundation.
            </p>
            <button
              onClick={() => handleNavClick('/#contact')}
              className="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
            >
              Get in Touch
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} The Good Men Enterprise. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Making technology dependable again.
          </p>
        </div>
      </div>
    </footer>
  );
};
