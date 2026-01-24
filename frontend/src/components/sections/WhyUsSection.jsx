import React from 'react';
import { Card, CardContent } from '../ui/card';
import { differentiators } from '../../data/mock';
import { Scale, Network, Cog, Eye, CheckCircle2 } from 'lucide-react';

const iconMap = {
  Scale,
  Network,
  Cog,
  Eye
};

export const WhyUsSection = () => {
  return (
    <section id="why-us" className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/50 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="text-amber-600 font-medium text-sm tracking-wider uppercase mb-4 block">
              How We're Different
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
              Most vendors focus on what they sell.
              <span className="text-slate-400"> We focus on </span>
              <span className="text-amber-600">what actually works.</span>
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              If something doesn't make sense technically or commercially, we'll say it upfront. 
              No vendor lock-ins, no hidden agendas — just honest advice and reliable execution.
            </p>

            {/* Key Points */}
            <ul className="space-y-4">
              {[
                "We're vendor-agnostic — we recommend what's right",
                "We think in systems, not isolated products",
                "We handle the boring but critical backend work",
                "Clarity, transparency, and accountability over buzzwords"
              ].map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Content - Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {differentiators.map((item, idx) => {
              const IconComponent = iconMap[item.icon];
              return (
                <Card
                  key={item.id}
                  className={`bg-white border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-amber-500/30 hover:-translate-y-1 group ${
                    idx === 0 ? 'sm:col-span-2' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                      <IconComponent className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
