import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { companyInfo, stats } from '../../data/mock';

export const HeroSection = () => {
  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-slate-200/50 rounded-full blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-slate-600 text-sm">Backend Technology & Procurement Powerhouse</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-800 mb-6 leading-tight">
            Technology should{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600">solve problems</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                <path d="M2 10C50 4 100 4 150 6C200 8 250 4 298 10" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" className="opacity-50" />
              </svg>
            </span>
            <br />not create new ones.
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {companyInfo.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              onClick={() => scrollToSection('#contact')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-6 text-lg transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/25 group"
            >
              Start a Conversation
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
            <Button
              variant="outline"
              onClick={() => scrollToSection('#services')}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 px-8 py-6 text-lg transition-all duration-200"
            >
              Explore Services
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-slate-200">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-slate-800 mb-1">{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={() => scrollToSection('#services')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 hover:text-amber-500 transition-colors animate-bounce"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
};
