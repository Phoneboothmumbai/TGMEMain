import React from 'react';
import { Card, CardContent } from '../ui/card';
import { clientTypes } from '../../data/mock';
import { Building2, Store, Users, Rocket } from 'lucide-react';

const iconMap = {
  Building2,
  Store,
  Users,
  Rocket
};

export const ClientsSection = () => {
  return (
    <section id="clients" className="py-24 lg:py-32 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-amber-400 font-medium text-sm tracking-wider uppercase mb-4 block">
            Who We Work With
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Trusted by Businesses That Value
            <span className="text-amber-400"> Reliability</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            We often act as the silent engine powering multiple brands and solutions — 
            trusted to deliver without drama.
          </p>
        </div>

        {/* Client Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clientTypes.map((client) => {
            const IconComponent = iconMap[client.icon];
            return (
              <Card
                key={client.id}
                className="bg-slate-800/30 border-slate-700/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/50 hover:border-amber-500/20 group text-center"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-500/20 transition-colors">
                    <IconComponent className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{client.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{client.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trust Statement */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-full px-6 py-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center"
                >
                  <span className="text-xs text-slate-300 font-medium">{i}</span>
                </div>
              ))}
            </div>
            <span className="text-slate-400 text-sm">150+ businesses trust TGME</span>
          </div>
        </div>
      </div>
    </section>
  );
};
