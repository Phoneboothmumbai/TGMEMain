import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { companyInfo } from '../../data/mock';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Solutions', href: '#', hasDropdown: true },
    { label: 'About TGME', href: '/about' },
    { label: 'How We Work', href: '/how-we-work' },
    { label: 'Knowledge Base', href: '/kb' },
    { label: 'Raise a Ticket', href: 'https://support.thegoodmen.in', external: true }
  ];

  const handleNavClick = (href, hasDropdown = false) => {
    if (hasDropdown) {
      setIsSolutionsOpen(!isSolutionsOpen);
      return;
    }
    
    setIsMobileMenuOpen(false);
    setIsSolutionsOpen(false);
    
    const isHomePage = window.location.pathname === '/';
    
    if (href.startsWith('/#')) {
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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-bold text-white text-lg transition-transform group-hover:scale-105">
              TG
            </div>
            <div className="flex flex-col">
              <span className="text-slate-800 font-semibold text-lg tracking-tight">{companyInfo.shortName}</span>
              <span className="text-slate-500 text-xs hidden sm:block">The Good Men Enterprise</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <div key={link.label} className="relative">
                {link.hasDropdown ? (
                  <div 
                    className="relative group"
                    onMouseEnter={() => setIsSolutionsOpen(true)}
                    onMouseLeave={() => setIsSolutionsOpen(false)}
                  >
                    <button
                      className="flex items-center gap-1 text-slate-600 hover:text-amber-600 transition-colors duration-200 text-sm font-medium py-2"
                    >
                      {link.label}
                      <ChevronDown size={16} className={`transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Mega Menu Dropdown */}
                    {isSolutionsOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                        {/* Invisible bridge to prevent hover gap */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-transparent"></div>
                        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 min-w-[500px]">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                            {solutions.map((solution) => (
                              <a
                                key={solution.href}
                                href={solution.href}
                                target={solution.external ? "_blank" : undefined}
                                rel={solution.external ? "noopener noreferrer" : undefined}
                                className="block px-3 py-2.5 text-sm text-slate-600 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                              >
                                {solution.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-amber-600 transition-colors duration-200 text-sm font-medium"
                  >
                    {link.label}
                  </a>
                ) : (
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-slate-600 hover:text-amber-600 transition-colors duration-200 text-sm font-medium"
                  >
                    {link.label}
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              onClick={() => handleNavClick('/#contact')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
            >
              Get in Touch
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-lg max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                <div key={link.label}>
                  {link.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                        className="flex items-center justify-between w-full text-slate-600 hover:text-amber-600 transition-colors duration-200 text-left py-3 text-lg font-medium"
                      >
                        {link.label}
                        <ChevronDown size={20} className={`transition-transform ${isSolutionsOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isSolutionsOpen && (
                        <div className="pl-4 pb-2 space-y-1">
                          {solutions.map((solution) => (
                            <a
                              key={solution.href}
                              href={solution.href}
                              className="block py-2 text-slate-500 hover:text-amber-600 transition-colors text-base"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {solution.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-amber-600 transition-colors duration-200 text-left py-3 text-lg block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-slate-600 hover:text-amber-600 transition-colors duration-200 text-left py-3 text-lg w-full"
                    >
                      {link.label}
                    </button>
                  )}
                </div>
              ))}
              <Button
                onClick={() => handleNavClick('/#contact')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold mt-4"
              >
                Get in Touch
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
