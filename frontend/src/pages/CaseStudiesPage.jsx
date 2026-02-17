import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Building2, Users, TrendingUp, Clock, CheckCircle, 
  ArrowRight, Quote, Filter, Server, Shield, Cloud,
  Monitor, Headphones, Globe
} from 'lucide-react';

export default function CaseStudiesPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const caseStudies = [
    {
      id: 1,
      category: 'infrastructure',
      industry: 'Manufacturing',
      title: 'Complete IT Infrastructure Overhaul for Manufacturing Plant',
      client: 'Leading Auto Parts Manufacturer',
      challenge: 'Outdated infrastructure causing frequent downtime and productivity loss across 3 manufacturing units.',
      solution: 'End-to-end infrastructure upgrade including servers, networking, and structured cabling with redundancy built-in.',
      results: [
        { metric: '99.9%', label: 'Uptime Achieved' },
        { metric: '60%', label: 'Reduction in IT Issues' },
        { metric: '₹45L', label: 'Annual Savings' }
      ],
      testimonial: 'TGME transformed our IT operations. We went from constant firefighting to a stable, reliable infrastructure.',
      testimonialAuthor: 'IT Head, Manufacturing Company',
      icon: Server,
      color: 'amber'
    },
    {
      id: 2,
      category: 'security',
      industry: 'Financial Services',
      title: 'Cybersecurity Enhancement for NBFC',
      client: 'Growing Non-Banking Financial Company',
      challenge: 'Increasing security threats and regulatory compliance requirements with limited in-house expertise.',
      solution: 'Comprehensive security assessment, firewall implementation, endpoint protection, and security awareness training.',
      results: [
        { metric: '100%', label: 'Compliance Achieved' },
        { metric: '0', label: 'Security Breaches' },
        { metric: '85%', label: 'Threat Detection Rate' }
      ],
      testimonial: 'The TGME team understood our compliance needs and delivered a security framework that gives us peace of mind.',
      testimonialAuthor: 'CISO, Financial Services',
      icon: Shield,
      color: 'emerald'
    },
    {
      id: 3,
      category: 'cloud',
      industry: 'E-commerce',
      title: 'Cloud Migration for E-commerce Platform',
      client: 'Fast-Growing Online Retailer',
      challenge: 'On-premise servers couldn\'t handle traffic spikes during sales events, leading to lost revenue.',
      solution: 'Migrated to cloud infrastructure with auto-scaling, CDN integration, and disaster recovery setup.',
      results: [
        { metric: '300%', label: 'Traffic Capacity' },
        { metric: '40%', label: 'Cost Reduction' },
        { metric: '99.99%', label: 'Availability' }
      ],
      testimonial: 'Our Diwali sale handled 10x normal traffic without a glitch. TGME made it possible.',
      testimonialAuthor: 'CTO, E-commerce Company',
      icon: Cloud,
      color: 'blue'
    },
    {
      id: 4,
      category: 'support',
      industry: 'Healthcare',
      title: 'Managed IT Support for Hospital Chain',
      client: 'Multi-Location Hospital Group',
      challenge: '24/7 operations with critical systems requiring immediate support, but no dedicated IT team at each location.',
      solution: 'Deployed managed IT support with remote monitoring, on-site engineers, and priority escalation for critical systems.',
      results: [
        { metric: '<15 min', label: 'Response Time' },
        { metric: '95%', label: 'First-Call Resolution' },
        { metric: '24/7', label: 'Coverage' }
      ],
      testimonial: 'Having TGME as our IT backbone lets us focus on patient care. Their response time is exceptional.',
      testimonialAuthor: 'Operations Director, Healthcare',
      icon: Headphones,
      color: 'purple'
    },
    {
      id: 5,
      category: 'infrastructure',
      industry: 'Education',
      title: 'Campus-Wide Network Deployment for University',
      client: 'Private University',
      challenge: 'Inconsistent Wi-Fi coverage, slow network speeds, and lack of centralized management across campus.',
      solution: 'Designed and deployed enterprise-grade Wi-Fi with centralized management, VLAN segmentation, and bandwidth management.',
      results: [
        { metric: '100%', label: 'Campus Coverage' },
        { metric: '10x', label: 'Speed Improvement' },
        { metric: '5000+', label: 'Concurrent Users' }
      ],
      testimonial: 'Students and faculty now have reliable connectivity everywhere on campus. A game-changer for digital learning.',
      testimonialAuthor: 'IT Director, University',
      icon: Globe,
      color: 'cyan'
    },
    {
      id: 6,
      category: 'cloud',
      industry: 'Professional Services',
      title: 'Digital Workplace Transformation for Consulting Firm',
      client: 'Management Consulting Firm',
      challenge: 'Remote workforce struggling with collaboration tools and secure access to company resources.',
      solution: 'Implemented Microsoft 365, VPN solutions, and device management for a seamless remote work experience.',
      results: [
        { metric: '50%', label: 'Productivity Gain' },
        { metric: '100%', label: 'Remote Capability' },
        { metric: '30%', label: 'IT Cost Reduction' }
      ],
      testimonial: 'TGME helped us become truly location-independent. Our team collaborates better than ever.',
      testimonialAuthor: 'Managing Partner, Consulting Firm',
      icon: Monitor,
      color: 'indigo'
    }
  ];

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'security', label: 'Security' },
    { id: 'cloud', label: 'Cloud' },
    { id: 'support', label: 'Managed Support' }
  ];

  const filteredStudies = activeFilter === 'all' 
    ? caseStudies 
    : caseStudies.filter(study => study.category === activeFilter);

  const stats = [
    { value: '500+', label: 'Projects Completed' },
    { value: '200+', label: 'Happy Clients' },
    { value: '15+', label: 'Industries Served' },
    { value: '99%', label: 'Client Satisfaction' }
  ];

  const colorClasses = {
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium mb-6">
                Case Studies
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Success Stories
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                Real results for real businesses. Explore how we've helped organizations 
                across industries transform their IT operations and achieve their goals.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl font-bold text-amber-500 mb-2">{stat.value}</p>
                  <p className="text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-white sticky top-20 z-40 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies Grid */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {filteredStudies.map((study) => (
                <Card key={study.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className={`p-6 ${colorClasses[study.color]} border-b`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-medium uppercase tracking-wider opacity-75">
                            {study.industry}
                          </span>
                          <h3 className="text-xl font-bold mt-1">{study.title}</h3>
                        </div>
                        <study.icon className="w-10 h-10 opacity-50" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-6">
                        <h4 className="font-semibold text-slate-800 mb-2">The Challenge</h4>
                        <p className="text-slate-600 text-sm">{study.challenge}</p>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-slate-800 mb-2">Our Solution</h4>
                        <p className="text-slate-600 text-sm">{study.solution}</p>
                      </div>

                      {/* Results */}
                      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                        {study.results.map((result, idx) => (
                          <div key={idx} className="text-center">
                            <p className="text-2xl font-bold text-slate-800">{result.metric}</p>
                            <p className="text-xs text-slate-500">{result.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Testimonial */}
                      <div className="border-l-4 border-amber-400 pl-4 py-2 bg-amber-50/50 rounded-r-lg">
                        <Quote className="w-5 h-5 text-amber-400 mb-2" />
                        <p className="text-sm text-slate-600 italic mb-2">"{study.testimonial}"</p>
                        <p className="text-xs text-slate-500 font-medium">— {study.testimonialAuthor}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredStudies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">No case studies found for this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Industries Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Industries We Serve</h2>
              <p className="text-slate-600 text-lg">Expertise across diverse sectors</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                'Manufacturing', 'Healthcare', 'Financial Services', 'Education',
                'E-commerce', 'Professional Services', 'Retail', 'Logistics',
                'Real Estate', 'Hospitality', 'Media', 'Non-Profit'
              ].map((industry, index) => (
                <Card key={index} className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <Building2 className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">{industry}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Be Our Next Success Story?
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              Let's discuss how we can help your business achieve similar results.
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              Start Your Project
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
