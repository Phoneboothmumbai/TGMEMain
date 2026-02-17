import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { 
  MessageSquare, Search, FileText, Settings, 
  Rocket, HeartHandshake, ArrowRight, CheckCircle,
  Clock, Shield, Users, Zap
} from 'lucide-react';

export default function HowWeWorkPage() {
  const process = [
    {
      step: '01',
      icon: MessageSquare,
      title: 'Discovery Call',
      description: 'We start with a conversation to understand your business, challenges, and goals. No technical jargon—just a clear discussion about what you need.',
      details: [
        'Understand your current IT setup',
        'Identify pain points and challenges',
        'Define success criteria',
        'Discuss budget and timeline expectations'
      ]
    },
    {
      step: '02',
      icon: Search,
      title: 'Assessment & Analysis',
      description: 'Our experts conduct a thorough assessment of your existing infrastructure, processes, and requirements to identify the best path forward.',
      details: [
        'Technical infrastructure audit',
        'Security vulnerability assessment',
        'Performance analysis',
        'Gap identification'
      ]
    },
    {
      step: '03',
      icon: FileText,
      title: 'Solution Design',
      description: 'Based on our findings, we design a customized solution that addresses your specific needs while staying within budget and timeline constraints.',
      details: [
        'Detailed solution architecture',
        'Technology recommendations',
        'Implementation roadmap',
        'Clear cost breakdown'
      ]
    },
    {
      step: '04',
      icon: Settings,
      title: 'Implementation',
      description: 'Our certified engineers execute the plan with precision, ensuring minimal disruption to your operations. We keep you informed every step of the way.',
      details: [
        'Phased rollout approach',
        'Regular progress updates',
        'Quality assurance testing',
        'Documentation at every stage'
      ]
    },
    {
      step: '05',
      icon: Rocket,
      title: 'Go-Live & Training',
      description: 'We ensure smooth deployment and provide comprehensive training to your team so they can make the most of the new systems.',
      details: [
        'Controlled go-live process',
        'User training sessions',
        'Admin documentation',
        'Knowledge transfer'
      ]
    },
    {
      step: '06',
      icon: HeartHandshake,
      title: 'Ongoing Support',
      description: 'Our relationship doesn\'t end at deployment. We provide continuous support and optimization to ensure your systems perform at their best.',
      details: [
        'Dedicated support team',
        'Proactive monitoring',
        'Regular health checks',
        'Continuous improvement'
      ]
    }
  ];

  const principles = [
    {
      icon: Clock,
      title: 'Respect Your Time',
      description: 'We value your time as much as our own. Clear timelines, prompt responses, and efficient execution.'
    },
    {
      icon: Shield,
      title: 'No Surprises',
      description: 'Transparent pricing and clear communication. You\'ll always know what to expect.'
    },
    {
      icon: Users,
      title: 'Your Team Extension',
      description: 'We work alongside your team, not in isolation. Collaboration drives better results.'
    },
    {
      icon: Zap,
      title: 'Results Focused',
      description: 'We measure success by your business outcomes, not just technical deliverables.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-6">
                Our Process
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                How We Work
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                A proven methodology that ensures successful outcomes. From initial consultation 
                to ongoing support, we follow a structured approach that minimizes risk and maximizes value.
              </p>
            </div>
          </div>
        </section>

        {/* Principles Section */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Working Principles</h2>
              <p className="text-slate-600">The values that guide how we engage with every client</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {principles.map((principle, index) => (
                <Card key={index} className="text-center border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                      <principle.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">{principle.title}</h3>
                    <p className="text-sm text-slate-600">{principle.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Our 6-Step Process</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                A structured approach that has delivered success across hundreds of projects
              </p>
            </div>

            <div className="space-y-8">
              {process.map((item, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-3">
                      {/* Step Info */}
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-5xl font-bold text-amber-400/30">{item.step}</span>
                          <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <item.icon className="w-7 h-7 text-amber-400" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                        <p className="text-slate-300">{item.description}</p>
                      </div>

                      {/* Details */}
                      <div className="lg:col-span-2 p-8 bg-white">
                        <h4 className="font-semibold text-slate-800 mb-4">What happens in this phase:</h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {item.details.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-600">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Engagement Models */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Engagement Models</h2>
              <p className="text-slate-600 text-lg">Flexible options to suit your needs</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-t-4 border-t-amber-500 hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Project-Based</h3>
                  <p className="text-slate-600 mb-6">
                    Fixed scope, fixed timeline, fixed cost. Ideal for well-defined projects with clear deliverables.
                  </p>
                  <ul className="space-y-3">
                    {['Clear project scope', 'Defined milestones', 'Fixed budget', 'Dedicated project manager'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-emerald-500 hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Managed Services</h3>
                  <p className="text-slate-600 mb-6">
                    Ongoing support and management of your IT infrastructure. Predictable monthly costs.
                  </p>
                  <ul className="space-y-3">
                    {['24/7 monitoring', 'Proactive maintenance', 'Monthly reporting', 'Scalable support'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-blue-500 hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Staff Augmentation</h3>
                  <p className="text-slate-600 mb-6">
                    Skilled IT professionals to supplement your team. Flexible duration and expertise.
                  </p>
                  <ul className="space-y-3">
                    {['Vetted professionals', 'Quick onboarding', 'Flexible terms', 'Full integration'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-amber-500 to-amber-600">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-amber-100 text-lg mb-8">
              Schedule a free consultation call and let's discuss your requirements.
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 bg-white text-amber-600 font-semibold px-8 py-4 rounded-lg hover:bg-amber-50 transition-colors"
            >
              Schedule a Call
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
