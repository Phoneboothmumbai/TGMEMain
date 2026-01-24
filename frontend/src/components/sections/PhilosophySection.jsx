import React from 'react';
import { philosophyPoints } from '../../data/mock';
import { Quote } from 'lucide-react';

export const PhilosophySection = () => {
  return (
    <section id="philosophy" className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08),transparent_70%)]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Quote Section */}
          <div className="relative">
            <Quote className="w-16 h-16 text-amber-500/20 absolute -top-4 -left-4" />
            <div className="pl-8">
              <span className="text-amber-600 font-medium text-sm tracking-wider uppercase mb-4 block">
                Our Philosophy
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                Technology changes fast.
                <br />
                <span className="text-amber-600">Principles don't.</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                We call ourselves The Good Men not because we're perfect — 
                but because we show up, take responsibility, and get things done.
              </p>

              {/* Philosophy Statement */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-slate-800 font-semibold mb-3">The Bigger Picture</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  TGME isn't just a company. It's the foundation behind multiple technology brands, 
                  platforms, and services — each focused on solving real problems in the Indian tech ecosystem. 
                  As businesses grow more dependent on technology, our role is simple: 
                  <span className="text-amber-600 font-medium"> make technology dependable again.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right - Philosophy Points */}
          <div className="space-y-6">
            {philosophyPoints.map((point, idx) => (
              <div
                key={point.id}
                className="flex gap-6 p-6 bg-white border border-slate-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-amber-500/30 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-lg group-hover:bg-amber-100 transition-colors">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">
                    {point.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
