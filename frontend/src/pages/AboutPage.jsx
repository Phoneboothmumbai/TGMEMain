import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { 
  Target, Eye, Heart, Users, Award, CheckCircle, 
  Building2, Globe, Handshake, TrendingUp
} from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Client First',
      description: 'Every decision we make starts with one question: How does this help our clients succeed?'
    },
    {
      icon: CheckCircle,
      title: 'Reliability',
      description: 'We deliver on our promises. When we commit to something, we see it through.'
    },
    {
      icon: Users,
      title: 'Partnership',
      description: 'We don\'t just provide services—we become an extension of your team.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Improvement',
      description: 'Technology evolves, and so do we. We stay ahead so you can too.'
    }
  ];

  const stats = [
    { value: '10+', label: 'Years of Experience' },
    { value: '500+', label: 'Projects Delivered' },
    { value: '200+', label: 'Happy Clients' },
    { value: '99%', label: 'Client Retention' }
  ];

  const milestones = [
    { year: '2014', title: 'Founded', description: 'TGME was established with a vision to provide reliable IT solutions to growing businesses.' },
    { year: '2016', title: 'Expanded Services', description: 'Added cloud solutions and cybersecurity to our service portfolio.' },
    { year: '2018', title: 'Regional Growth', description: 'Expanded operations across multiple cities, serving clients nationwide.' },
    { year: '2020', title: 'Digital Transformation', description: 'Helped businesses rapidly adapt to remote work and digital operations.' },
    { year: '2022', title: 'Managed Services Launch', description: 'Introduced 24/7 managed IT support services for enterprise clients.' },
    { year: '2024', title: 'Innovation Hub', description: 'Launched dedicated R&D initiatives for emerging technologies.' }
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
                About TGME
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Technology Solutions Built on Trust
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                The Good Men Enterprise (TGME) is a technology solutions company dedicated to helping businesses 
                leverage IT as a strategic advantage. We believe in doing things right—the first time, every time.
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

        {/* Mission & Vision */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              <Card className="border-l-4 border-l-amber-500">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-6">
                    <Target className="w-7 h-7 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Mission</h2>
                  <p className="text-slate-600 leading-relaxed">
                    To empower businesses with reliable, scalable, and innovative technology solutions 
                    that drive growth and operational excellence. We strive to be the trusted IT partner 
                    that businesses can depend on for their most critical technology needs.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
                    <Eye className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Vision</h2>
                  <p className="text-slate-600 leading-relaxed">
                    To be the most trusted technology partner for businesses across industries, 
                    known for our integrity, expertise, and commitment to client success. We envision 
                    a world where every business has access to enterprise-grade IT solutions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 lg:py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Story</h2>
              <p className="text-slate-600 text-lg">
                A decade of helping businesses thrive through technology
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-amber-200 hidden lg:block"></div>
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                      <Card className="inline-block">
                        <CardContent className="p-6">
                          <span className="text-amber-500 font-bold text-lg">{milestone.year}</span>
                          <h3 className="text-xl font-semibold text-slate-800 mt-2 mb-2">{milestone.title}</h3>
                          <p className="text-slate-600">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="hidden lg:flex w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100 z-10"></div>
                    <div className="flex-1 hidden lg:block"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Values</h2>
              <p className="text-slate-600 text-lg">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
                      <value.icon className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">{value.title}</h3>
                    <p className="text-slate-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 lg:py-24 bg-slate-800 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Businesses Choose TGME</h2>
                <p className="text-slate-300 text-lg mb-8">
                  We're not just another IT vendor. We're a partner invested in your success.
                </p>
                <ul className="space-y-4">
                  {[
                    'Proven track record with 500+ successful projects',
                    'Dedicated support team available when you need us',
                    'Transparent pricing with no hidden costs',
                    'Scalable solutions that grow with your business',
                    'Industry-certified professionals on every project'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-200">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-6 text-center">
                    <Building2 className="w-10 h-10 text-amber-400 mx-auto mb-4" />
                    <p className="text-white font-semibold">Enterprise Ready</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-6 text-center">
                    <Globe className="w-10 h-10 text-amber-400 mx-auto mb-4" />
                    <p className="text-white font-semibold">Pan-India Presence</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-6 text-center">
                    <Handshake className="w-10 h-10 text-amber-400 mx-auto mb-4" />
                    <p className="text-white font-semibold">Trusted Partner</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-6 text-center">
                    <Award className="w-10 h-10 text-amber-400 mx-auto mb-4" />
                    <p className="text-white font-semibold">Certified Experts</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-amber-500">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Work with Us?
            </h2>
            <p className="text-amber-100 text-lg mb-8">
              Let's discuss how TGME can help your business achieve its technology goals.
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 bg-white text-amber-600 font-semibold px-8 py-4 rounded-lg hover:bg-amber-50 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
