import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { services } from '../../data/mock';
import { Server, Shield, Laptop, Cloud, Package, Headphones, Code, ArrowRight } from 'lucide-react';

const iconMap = {
  Server,
  Shield,
  Laptop,
  Cloud,
  Package,
  Headphones,
  Code
};

const serviceRoutes = {
  1: 'infrastructure',
  2: 'networking',
  3: 'devices',
  4: 'cloud',
  5: 'assets',
  6: 'support',
  7: 'webapps'
};

export const ServicesSection = () => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section id="services" className="py-24 lg:py-32 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-amber-400 font-medium text-sm tracking-wider uppercase mb-4 block">
            What We Do
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            End-to-End Technology Solutions
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            We don't just sell products. We design solutions, source the right components, 
            deploy them correctly, and support them long after installation.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon];
            const isHovered = hoveredId === service.id;
            const serviceRoute = serviceRoutes[service.id];

            return (
              <Link
                key={service.id}
                to={`/services/${serviceRoute}`}
                className="block"
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Card
                  className={`h-full bg-slate-800/50 border-slate-700/50 backdrop-blur-sm transition-all duration-300 cursor-pointer group overflow-hidden ${
                    isHovered ? 'bg-slate-800 border-amber-500/30 shadow-xl shadow-amber-500/5 -translate-y-1' : 'hover:border-slate-600'
                  }`}
                >
                  <CardContent className="p-8">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 ${
                      isHovered ? 'bg-amber-500 text-slate-900' : 'bg-slate-700/50 text-amber-400'
                    }`}>
                      <IconComponent size={28} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-amber-400 transition-colors">
                      {service.shortTitle}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      {service.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="w-1.5 h-1.5 bg-amber-500/60 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Learn More Link */}
                    <div className={`mt-6 pt-6 border-t border-slate-700/50 flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                      isHovered ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                      <span>Learn more</span>
                      <ArrowRight size={16} className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
