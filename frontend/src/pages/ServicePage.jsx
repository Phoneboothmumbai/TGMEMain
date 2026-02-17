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
  ArrowLeft, ArrowRight, CheckCircle2, Target, Users, Wrench, Zap, X, Lightbulb,
  ExternalLink, Globe, Mail, Lock, Database, Monitor
} from 'lucide-react';

const iconMap = {
  Server, Shield, Laptop, Cloud, Package, Headphones, Code
};

const colorMap = {
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    gradient: 'from-amber-50 to-white'
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    gradient: 'from-emerald-50 to-white'
  },
  sky: {
    bg: 'bg-sky-50',
    text: 'text-sky-600',
    border: 'border-sky-200',
    gradient: 'from-sky-50 to-white'
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'border-violet-200',
    gradient: 'from-violet-50 to-white'
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    gradient: 'from-orange-50 to-white'
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
    gradient: 'from-rose-50 to-white'
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    gradient: 'from-cyan-50 to-white'
  }
};

export default function ServicePage() {
  const { serviceId } = useParams();
  const service = servicePages[serviceId];
  
  if (!service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Service not found</h1>
          <Link to="/" className="text-amber-600 hover:underline">Go back home</Link>
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
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" richColors />
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className={`relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b ${colors.gradient}`}>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
            {/* Back Link */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8"
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

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                  {service.title}
                </h1>
                
                <p className={`text-xl lg:text-2xl font-medium ${colors.text} mb-6`}>
                  {service.tagline}
                </p>
                
                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                  {service.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={scrollToContact}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-6 text-lg transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
                  >
                    Get Started
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/#services'}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 px-8 py-6 text-lg"
                  >
                    View All Services
                  </Button>
                </div>
              </div>

              {/* Result Card */}
              <div className="relative">
                <Card className={`bg-white ${colors.border} border shadow-lg`}>
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center mb-6`}>
                      <Zap className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">The Result</h3>
                    <p className="text-2xl font-medium text-slate-700 leading-relaxed">
                      {service.result}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Wrench className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">What We Do</h2>
                </div>
                <ul className="space-y-4">
                  {service.whatWeDo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                      <span className="text-slate-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Devices list for MDM service */}
                {service.devices && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Devices We Manage</h3>
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
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Support Models</h3>
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
                  <h2 className="text-2xl font-bold text-slate-800">
                    {service.whenMakesSense ? 'When This Makes Sense' : 'Who This Is For'}
                  </h2>
                </div>
                <ul className="space-y-4">
                  {(service.whenMakesSense || service.whoIsFor).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                      <span className="text-slate-700 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Approach Steps - for webapps service */}
        {service.approachSteps && (
          <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Lightbulb className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">How TGME Approaches Custom Builds</h2>
                </div>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                  We don't start with code. We start with understanding the problem.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.approachSteps.map((step, idx) => (
                  <Card key={idx} className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-4`}>
                        <span className={`text-lg font-bold ${colors.text}`}>{idx + 1}</span>
                      </div>
                      <p className="text-slate-700">{step}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* What We Don't Do - for webapps service */}
        {service.whatWeDontDo && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <X className="w-5 h-5 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">What We Don't Do</h2>
                  </div>
                  <ul className="space-y-4">
                    {service.whatWeDontDo.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {service.useCases && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <Target className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-800">Typical Use Cases</h2>
                    </div>
                    <ul className="space-y-4">
                      {service.useCases.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-5 h-5 ${colors.text} mt-0.5 flex-shrink-0`} />
                          <span className="text-slate-700 text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Problems We Solve / Why It Matters - skip for webapps as it has different sections */}
        {!service.approachSteps && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Target className={`w-5 h-5 ${colors.text}`} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {service.philosophy ? 'Our Philosophy' : 'Why This Matters'}
                </h2>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(service.philosophy || service.problemsWeSolve).map((item, idx) => (
                <Card key={idx} className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mx-auto mb-4`}>
                      <span className={`text-lg font-bold ${colors.text}`}>{String(idx + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="text-slate-700">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* Approach Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">TGME's Approach</h2>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
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
        <section className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              TGME doesn't just deliver services—we design systems that support how your business actually works.
            </p>
            <Button
              onClick={scrollToContact}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-10 py-6 text-lg transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/25"
            >
              Start a Conversation
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </section>

        {/* Navigation to Other Services */}
        <section className="py-12 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-center">
              {prevService ? (
                <Link
                  to={`/services/${prevService.id}`}
                  className="flex items-center gap-3 text-slate-500 hover:text-slate-800 transition-colors group"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <div className="text-left">
                    <p className="text-xs text-slate-400 uppercase">Previous</p>
                    <p className="font-medium">{prevService.title.split(' ').slice(0, 3).join(' ')}...</p>
                  </div>
                </Link>
              ) : <div />}
              
              {nextService ? (
                <Link
                  to={`/services/${nextService.id}`}
                  className="flex items-center gap-3 text-slate-500 hover:text-slate-800 transition-colors group"
                >
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase">Next</p>
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
