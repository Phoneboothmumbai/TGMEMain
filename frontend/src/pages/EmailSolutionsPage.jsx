import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Mail, CheckCircle2, ExternalLink, Shield, Clock, Users,
  Smartphone, Calendar, Cloud, Lock, Globe, Zap, ArrowRight
} from 'lucide-react';

export default function EmailSolutionsPage() {
  const emailSolutions = [
    {
      id: 'google-workspace',
      name: 'Google Workspace',
      tagline: 'Intelligent tools your business can depend on',
      description: 'The complete productivity suite with Gmail, Drive, Docs, Sheets, Meet, and more. Perfect for teams that need collaboration and cloud storage.',
      logo: '🟡',
      color: 'amber',
      startingPrice: '₹136/user/month',
      features: [
        'Professional Gmail with your domain',
        '30GB - Unlimited cloud storage',
        'Google Meet HD video (100-250 participants)',
        'Google Docs, Sheets, Slides, Forms',
        'Shared calendars & scheduling',
        'Admin console & security controls',
        'Mobile apps for iOS & Android',
        '24/7 support'
      ],
      plans: [
        { name: 'Business Starter', storage: '30GB', price: '₹136/mo', users: 'Ideal for small teams' },
        { name: 'Business Standard', storage: '2TB', price: '₹736/mo', users: 'Recording + 150 participants' },
        { name: 'Business Plus', storage: '5TB', price: '₹1,380/mo', users: 'Vault + Advanced security' },
        { name: 'Enterprise', storage: 'Unlimited', price: '₹2,069/mo', users: 'Full enterprise features' }
      ],
      cta: {
        text: 'Get Google Workspace',
        url: 'https://hostingbay.in/google_apps.php'
      },
      highlights: [
        'Used by 6M+ businesses worldwide',
        'Real-time collaboration',
        'AI-powered smart features'
      ]
    },
    {
      id: 'titan-email',
      name: 'Titan Email',
      tagline: 'Look Professional, Build Trust, Strengthen Your Brand',
      description: 'Business email built for professionals. Rich webmail, mobile apps, and advanced features like read receipts and email templates.',
      logo: '🔵',
      color: 'blue',
      startingPrice: '₹99/user/month',
      features: [
        'Professional email on your domain',
        '5GB - 50GB storage per account',
        'Rich webmail + iOS/Android apps',
        'Built-in calendar & contacts',
        'Read receipts & email templates',
        'Advanced anti-spam & anti-virus',
        'Two-factor authentication',
        'One-click email migration'
      ],
      plans: [
        { name: 'Professional', storage: '5GB', price: '₹99/mo', users: 'For bloggers & freelancers' },
        { name: 'Business', storage: '10GB', price: '₹149/mo', users: 'Multi-account support' },
        { name: 'Enterprise', storage: '50GB', price: '₹349/mo', users: 'Priority inbox + Templates' }
      ],
      cta: {
        text: 'Get Titan Email',
        url: 'https://hostingbay.in/titan-business-email-hosting'
      },
      highlights: [
        'Built for Indian businesses',
        'Affordable pricing',
        'Easy migration from Gmail/Outlook'
      ]
    },
    {
      id: 'business-email',
      name: 'Business Email',
      tagline: 'Simple, Reliable Email Hosting',
      description: 'Basic professional email hosting with your domain. Perfect for businesses that need straightforward email without the extras.',
      logo: '🟢',
      color: 'emerald',
      startingPrice: '₹49/user/month',
      features: [
        'Email on your domain',
        'Webmail access',
        'POP3/IMAP support',
        'Spam & virus protection',
        'Mobile device support',
        'Email forwarding',
        'Auto-responders',
        '24/7 support'
      ],
      plans: [
        { name: 'Starter', storage: '5GB', price: '₹49/mo', users: 'Basic email needs' },
        { name: 'Professional', storage: '10GB', price: '₹99/mo', users: 'Growing businesses' },
        { name: 'Enterprise', storage: '25GB', price: '₹199/mo', users: 'Large mailboxes' }
      ],
      cta: {
        text: 'Get Business Email',
        url: 'https://hostingbay.in/business-email'
      },
      highlights: [
        'Most affordable option',
        'Simple setup',
        'Works with any email client'
      ]
    }
  ];

  const colorClasses = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', button: 'bg-amber-500 hover:bg-amber-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', button: 'bg-blue-500 hover:bg-blue-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', button: 'bg-emerald-500 hover:bg-emerald-600' }
  };

  const whyBusinessEmail = [
    { icon: Shield, title: 'Build Trust', description: 'Customers trust emails from your domain more than free Gmail/Yahoo' },
    { icon: Lock, title: 'Enhanced Security', description: 'Enterprise-grade security, spam protection, and data encryption' },
    { icon: Users, title: 'Team Collaboration', description: 'Shared calendars, contacts, and document collaboration' },
    { icon: Smartphone, title: 'Access Anywhere', description: 'Webmail and mobile apps for iOS and Android' },
    { icon: Zap, title: 'Productivity Tools', description: 'Calendars, contacts, tasks, and more built-in' },
    { icon: Clock, title: '99.9% Uptime', description: 'Reliable email delivery when you need it most' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Mail className="w-4 h-4" />
                Email Solutions
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Professional Email for Your Business
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Make the right impression with email that matches your domain. Choose from 
                Google Workspace, Titan Email, or Business Email based on your needs and budget.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#compare" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  Compare Plans
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a href="https://hostingbay.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  Visit Hosting Bay
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Business Email */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Why Professional Email Matters</h2>
              <p className="text-slate-600">yourname@yourbusiness.com vs yourname@gmail.com</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyBusinessEmail.map((item, index) => (
                <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Email Solutions Comparison */}
        <section id="compare" className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Choose Your Email Solution</h2>
              <p className="text-slate-600 text-lg">All solutions powered by Hosting Bay</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {emailSolutions.map((solution) => {
                const colors = colorClasses[solution.color];
                return (
                  <Card key={solution.id} className={`overflow-hidden border-2 ${colors.border} hover:shadow-xl transition-shadow`}>
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className={`${colors.bg} p-6 border-b ${colors.border}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{solution.logo}</span>
                          <div>
                            <h3 className="text-xl font-bold text-slate-800">{solution.name}</h3>
                            <p className="text-sm text-slate-600">{solution.tagline}</p>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm mb-4">{solution.description}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-slate-800">Starting at</span>
                          <span className={`text-lg font-semibold ${colors.text}`}>{solution.startingPrice}</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <div className="flex flex-wrap gap-2">
                          {solution.highlights.map((highlight, idx) => (
                            <span key={idx} className={`text-xs ${colors.bg} ${colors.text} px-2 py-1 rounded-full font-medium`}>
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="p-6">
                        <h4 className="font-semibold text-slate-800 mb-4">Key Features</h4>
                        <ul className="space-y-3 mb-6">
                          {solution.features.slice(0, 6).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle2 className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        {/* Plans Preview */}
                        <h4 className="font-semibold text-slate-800 mb-3">Available Plans</h4>
                        <div className="space-y-2 mb-6">
                          {solution.plans.map((plan, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded">
                              <span className="font-medium text-slate-700">{plan.name}</span>
                              <span className="text-slate-500">{plan.storage}</span>
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <a
                          href={solution.cta.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2 w-full ${colors.button} text-white font-semibold py-3 px-6 rounded-lg transition-colors`}
                        >
                          {solution.cta.text}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Quick Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-4 font-semibold text-slate-800">Feature</th>
                    <th className="text-center p-4 font-semibold text-amber-600">Google Workspace</th>
                    <th className="text-center p-4 font-semibold text-blue-600">Titan Email</th>
                    <th className="text-center p-4 font-semibold text-emerald-600">Business Email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-4 text-slate-600">Starting Price</td>
                    <td className="p-4 text-center">₹136/mo</td>
                    <td className="p-4 text-center">₹99/mo</td>
                    <td className="p-4 text-center">₹49/mo</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-4 text-slate-600">Storage</td>
                    <td className="p-4 text-center">30GB - Unlimited</td>
                    <td className="p-4 text-center">5GB - 50GB</td>
                    <td className="p-4 text-center">5GB - 25GB</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-4 text-slate-600">Video Conferencing</td>
                    <td className="p-4 text-center">✅ Google Meet</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">❌</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-4 text-slate-600">Cloud Storage (Drive)</td>
                    <td className="p-4 text-center">✅ Included</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">❌</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-4 text-slate-600">Office Apps (Docs/Sheets)</td>
                    <td className="p-4 text-center">✅ Included</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">❌</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-4 text-slate-600">Read Receipts</td>
                    <td className="p-4 text-center">❌</td>
                    <td className="p-4 text-center">✅ Enterprise</td>
                    <td className="p-4 text-center">❌</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-4 text-slate-600">Best For</td>
                    <td className="p-4 text-center text-sm">Teams needing collaboration</td>
                    <td className="p-4 text-center text-sm">Sales & customer-facing roles</td>
                    <td className="p-4 text-center text-sm">Basic email needs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-amber-500 to-amber-600">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Help Choosing?
            </h2>
            <p className="text-amber-100 text-lg mb-8">
              Our team can help you select and set up the perfect email solution for your business.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 bg-white text-amber-600 font-semibold px-8 py-4 rounded-lg hover:bg-amber-50 transition-colors"
              >
                Contact Us
              </a>
              <a
                href="https://hostingbay.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-600 border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Visit Hosting Bay
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
