import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Toaster } from '../components/ui/sonner';
import { servicePages, serviceOrder } from '../data/servicePages';
import {
  Server, Shield, Laptop, Cloud, Package, Headphones, Code,
  ArrowLeft, ArrowRight, CheckCircle2, Target, Users, Wrench, Zap, X, Lightbulb
} from 'lucide-react';

const iconMap = {
  Server, Shield, Laptop, Cloud, Package, Headphones, Code
};

const colorMap = {
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500/20 to-transparent'
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500/20 to-transparent'
  },
  sky: {
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    gradient: 'from-sky-500/20 to-transparent'
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
    gradient: 'from-violet-500/20 to-transparent'
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    gradient: 'from-orange-500/20 to-transparent'
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    gradient: 'from-rose-500/20 to-transparent'
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    gradient: 'from-cyan-500/20 to-transparent'
  }
};

export default function ServicePage() {
  const { serviceId } = useParams();
  const service = servicePages[serviceId];
  
  if (!service) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Service not found</h1>
          <Link to="/" className="text-amber-400 hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const IconComponent = iconMap[service.icon];
  const colors = colorMap[service.color];
  
  // Get prev/next services
  const currentIndex = serviceOrder.indexOf(serviceId);
  const prevService = currentIndex > 0 ? servicePages[serviceOrder[currentIndex - 1]] : null;
  const nextService = currentIndex < serviceOrder.length - 1 ? servicePages[serviceOrder[currentIndex + 1]] : null;

  const scrollToContact = () => {
    window.location.href = '/#contact';
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Toaster position="top-right" richColors />
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${colors.gradient}`} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
            {/* Back Link */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {/* Icon Badge */}
                <div className={`inline-flex items-center gap-3 ${colors.bg} ${colors.border} border rounded-full px-4 py-2 mb-6`}>
                  <IconComponent className={`w-5 h-5 ${colors.text}`} />
                  <span className={`text-sm font-medium ${colors.text}`}>TGME Service</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {service.title}
                </h1>
                
                <p className={`text-xl lg:text-2xl font-medium ${colors.text} mb-6`}>
                  {service.tagline}
                </p>
                
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  {service.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={scrollToContact}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-6 text-lg transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
                  >
                    Get Started
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/#services'}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-6 text-lg"
                  >
                    View All Services
                  </Button>
                </div>
              </div>

              {/* Result Card */}
              <div className="relative">
                <Card className={`bg-slate-800/50 ${colors.border} border backdrop-blur-sm`}>
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center mb-6`}>
                      <Zap className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">The Result</h3>
                    <p className="text-2xl font-medium text-white leading-relaxed">
                      {service.result}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-20 bg-slate-900">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Wrench className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">What We Do</h2>
                </div>
                <ul className="space-y-4">
                  {service.whatWeDo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                      <span className="text-slate-300 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Devices list for MDM service */}
                {service.devices && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Devices We Manage</h3>
                    <div className="flex flex-wrap gap-3">
                      {service.devices.map((device, idx) => (
                        <span key={idx} className={`${colors.bg} ${colors.text} px-4 py-2 rounded-full text-sm font-medium`}>
                          {device}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Support Models */}
                {service.supportModels && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Support Models</h3>
                    <div className="flex flex-wrap gap-3">
                      {service.supportModels.map((model, idx) => (
                        <span key={idx} className={`${colors.bg} ${colors.text} px-4 py-2 rounded-full text-sm font-medium`}>
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Users className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Who This Is For</h2>
                </div>
                <ul className="space-y-4">
                  {service.whoIsFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                      <span className="text-slate-300 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Problems We Solve / Why It Matters */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Target className={`w-5 h-5 ${colors.text}`} />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {service.philosophy ? 'Our Philosophy' : 'Why This Matters'}
                </h2>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(service.philosophy || service.problemsWeSolve).map((item, idx) => (
                <Card key={idx} className={`bg-slate-800/30 border-slate-700/50 hover:${colors.border} transition-colors`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
                      <span className={`text-lg font-bold ${colors.text}`}>{String(idx + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="text-slate-300">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Approach Section */}
        <section className="py-20 bg-slate-900">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">TGME's Approach</h2>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              {service.approach}
            </p>
            <div className={`inline-block ${colors.bg} ${colors.border} border rounded-xl p-6`}>
              <p className={`text-lg font-semibold ${colors.text}`}>
                Result: {service.result}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-slate-950">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              TGME doesn't just deliver services—we design systems that support how your business actually works.
            </p>
            <Button
              onClick={scrollToContact}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-10 py-6 text-lg transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/25"
            >
              Start a Conversation
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </section>

        {/* Navigation to Other Services */}
        <section className="py-12 bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center">
              {prevService ? (
                <Link
                  to={`/services/${prevService.id}`}
                  className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left">
                    <p className="text-xs text-slate-500 uppercase">Previous</p>
                    <p className="font-medium">{prevService.title.split(' ').slice(0, 3).join(' ')}...</p>
                  </div>
                </Link>
              ) : <div />}
              
              {nextService ? (
                <Link
                  to={`/services/${nextService.id}`}
                  className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
                >
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase">Next</p>
                    <p className="font-medium">{nextService.title.split(' ').slice(0, 3).join(' ')}...</p>
                  </div>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : <div />}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
