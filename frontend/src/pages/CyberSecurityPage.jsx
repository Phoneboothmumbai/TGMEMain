import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Shield, Lock, Eye, AlertTriangle, CheckCircle2, 
  Server, Globe, Smartphone, Cloud, FileSearch, Code,
  ArrowRight, Zap, Users, Clock, Award, Target,
  ShieldCheck, ShieldAlert, Scan, Bug, FileCheck, Network
} from 'lucide-react';

export default function CyberSecurityPage() {
  const services = [
    {
      icon: Network,
      title: 'Network Security Audit',
      description: 'Comprehensive assessment of your network infrastructure to identify vulnerabilities, misconfigurations, and potential entry points for attackers.',
      features: ['Firewall configuration review', 'Network segmentation analysis', 'Wireless security testing', 'Traffic analysis']
    },
    {
      icon: FileSearch,
      title: 'Vulnerability Assessment',
      description: 'Systematic examination of your systems, applications, and networks to discover security weaknesses before attackers do.',
      features: ['Automated scanning', 'Manual verification', 'Risk prioritization', 'Remediation guidance']
    },
    {
      icon: Bug,
      title: 'Penetration Testing',
      description: 'Simulated cyber attacks to test your defenses and identify exploitable vulnerabilities in your systems.',
      features: ['Black box testing', 'White box testing', 'Social engineering tests', 'Detailed reporting']
    },
    {
      icon: Globe,
      title: 'Web Application Security',
      description: 'Security testing of web applications to identify OWASP Top 10 vulnerabilities and application-specific risks.',
      features: ['SQL injection testing', 'XSS detection', 'Authentication testing', 'Session management review']
    },
    {
      icon: Smartphone,
      title: 'Mobile App Security',
      description: 'Security assessment of iOS and Android applications to ensure your mobile apps don\'t become attack vectors.',
      features: ['Static analysis', 'Dynamic analysis', 'API security testing', 'Data storage review']
    },
    {
      icon: Cloud,
      title: 'Cloud Security Audit',
      description: 'Assessment of your cloud infrastructure (AWS, Azure, GCP) to ensure proper configuration and security controls.',
      features: ['IAM review', 'Storage security', 'Network configuration', 'Compliance checks']
    },
    {
      icon: FileCheck,
      title: 'Compliance & Certification',
      description: 'Help your organization achieve and maintain compliance with industry standards and regulations.',
      features: ['ISO 27001', 'SOC 2', 'GDPR compliance', 'PCI DSS']
    },
    {
      icon: ShieldCheck,
      title: 'Endpoint Protection',
      description: 'Deploy and manage endpoint security solutions to protect devices from malware, ransomware, and advanced threats.',
      features: ['Antivirus/EDR deployment', 'Patch management', 'Device encryption', 'USB control']
    }
  ];

  const threatStats = [
    { value: '2,200+', label: 'Cyber attacks occur daily worldwide' },
    { value: '₹17Cr', label: 'Average cost of a data breach in India' },
    { value: '280 days', label: 'Average time to identify a breach' },
    { value: '95%', label: 'Breaches caused by human error' }
  ];

  const whyUs = [
    { icon: Eye, title: 'Non-stop Threat Intelligence', description: 'Our team monitors cyber threats 24/7, using advanced tools to provide actionable insights about potential dangers.' },
    { icon: FileCheck, title: 'Effortless Compliance', description: 'Streamlined processes ensure security compliance and transparency, with clear documentation and regular updates.' },
    { icon: Shield, title: 'Comprehensive Solutions', description: 'We integrate various security measures into one cohesive system, enhancing efficiency and effectiveness.' },
    { icon: Users, title: 'Expert Team', description: 'Certified security professionals with years of experience protecting businesses across industries.' }
  ];

  const process = [
    { step: '01', title: 'Discovery', description: 'Understand your infrastructure, assets, and security requirements' },
    { step: '02', title: 'Assessment', description: 'Conduct thorough security testing and vulnerability analysis' },
    { step: '03', title: 'Report', description: 'Deliver detailed findings with risk ratings and remediation steps' },
    { step: '04', title: 'Remediate', description: 'Help implement fixes and verify security improvements' }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section - Dark Theme */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-red-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-red-500/30">
                <ShieldAlert className="w-4 h-4" />
                Cyber Security Solutions
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Win the <span className="text-red-500">Cyber</span> Battle
                <br />of Today & Tomorrow
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Protect your business from evolving cyber threats with comprehensive security 
                assessments, penetration testing, and managed security solutions.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="/#contact" className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                  Get Security Assessment
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#services" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20">
                  View Services
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Threat Stats */}
        <section className="py-12 bg-slate-800 border-y border-slate-700">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {threatStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-red-500 mb-2">{stat.value}</p>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 lg:py-24 bg-slate-900">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Why Partner with TGME for Security?</h2>
              <p className="text-slate-400 text-lg">Equip your entire organization to combat cyber threats</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyUs.map((item, index) => (
                <Card key={index} className="bg-slate-800 border-slate-700 hover:border-red-500/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section id="services" className="py-16 lg:py-24 bg-slate-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Our Security Services</h2>
              <p className="text-slate-400 text-lg">Comprehensive solutions to protect your digital assets</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <Card key={index} className="bg-slate-900 border-slate-700 hover:border-red-500/50 transition-all hover:transform hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center mb-4 border border-red-500/20">
                      <service.icon className="w-7 h-7 text-red-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle2 className="w-3 h-3 text-red-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 lg:py-24 bg-slate-900">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Our Security Assessment Process</h2>
              <p className="text-slate-400 text-lg">A systematic approach to identifying and fixing vulnerabilities</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {process.map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-red-500">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-red-500 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Tips Banner */}
        <section className="py-12 bg-gradient-to-r from-red-600 to-red-500">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Think You're Secure?</h3>
                <p className="text-red-100">Get a free security health check for your organization</p>
              </div>
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-8 py-4 rounded-lg hover:bg-red-50 transition-colors"
              >
                Request Free Assessment
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Common Threats Section */}
        <section className="py-16 lg:py-24 bg-slate-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Threats We Protect Against</h2>
              <p className="text-slate-400 text-lg">Stay protected from the most common cyber attacks</p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { name: 'Ransomware', icon: Lock },
                { name: 'Phishing', icon: AlertTriangle },
                { name: 'Data Breach', icon: Shield },
                { name: 'Malware', icon: Bug },
                { name: 'DDoS Attacks', icon: Zap },
                { name: 'Insider Threats', icon: Users }
              ].map((threat, index) => (
                <Card key={index} className="bg-slate-900 border-slate-700 text-center">
                  <CardContent className="p-4">
                    <threat.icon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-300">{threat.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-slate-900 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Don't Wait for a Breach
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Proactive security is always cheaper than reactive damage control. 
              Let's assess your security posture today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                Schedule Security Consultation
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
