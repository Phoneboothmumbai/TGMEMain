import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Card, CardContent } from '../components/ui/card';
import { 
  Laptop, Monitor, Printer, Smartphone, Server, Cpu,
  CheckCircle2, Clock, Shield, Wrench, ArrowRight,
  Phone, MapPin, Zap, Award, Users, ThumbsUp
} from 'lucide-react';

export default function HardwareRepairPage() {
  const devices = [
    {
      icon: Laptop,
      name: 'Laptops',
      description: 'All brands including HP, Dell, Lenovo, Asus, Acer, Apple MacBook',
      repairs: ['Screen replacement', 'Keyboard repair', 'Battery replacement', 'Motherboard repair', 'SSD/RAM upgrade', 'Hinge repair']
    },
    {
      icon: Monitor,
      name: 'Desktops & Workstations',
      description: 'Complete desktop repair and upgrade services',
      repairs: ['Hardware diagnostics', 'Component replacement', 'Power supply repair', 'Graphics card issues', 'Cooling system', 'OS installation']
    },
    {
      icon: Printer,
      name: 'Printers & Scanners',
      description: 'Inkjet, laser, and multifunction printer repairs',
      repairs: ['Paper jam issues', 'Print quality problems', 'Connectivity issues', 'Cartridge problems', 'Roller replacement', 'Annual maintenance']
    },
    {
      icon: Server,
      name: 'Servers & Storage',
      description: 'Enterprise server repair and maintenance',
      repairs: ['RAID recovery', 'Hard drive replacement', 'Memory upgrades', 'Power supply issues', 'Fan replacement', 'Firmware updates']
    },
    {
      icon: Smartphone,
      name: 'Tablets & Mobile Devices',
      description: 'iPad, Android tablets, and business mobile devices',
      repairs: ['Screen repair', 'Battery replacement', 'Charging port fix', 'Software issues', 'Data recovery', 'Enterprise setup']
    },
    {
      icon: Cpu,
      name: 'Networking Equipment',
      description: 'Routers, switches, access points, and firewalls',
      repairs: ['Configuration issues', 'Firmware updates', 'Port repairs', 'Performance tuning', 'Replacement', 'Setup & installation']
    }
  ];

  const whyUs = [
    { icon: Clock, title: 'Quick Turnaround', description: 'Most repairs completed within 24-48 hours' },
    { icon: Shield, title: 'Warranty on Repairs', description: '90-day warranty on all repair services' },
    { icon: Award, title: 'Certified Technicians', description: 'Experienced and certified repair experts' },
    { icon: ThumbsUp, title: 'Genuine Parts', description: 'We use only quality OEM and genuine parts' },
    { icon: Zap, title: 'Free Diagnostics', description: 'Complimentary diagnosis for all devices' },
    { icon: Users, title: 'On-Site Support', description: 'We come to your office for bulk repairs' }
  ];

  const process = [
    { step: '01', title: 'Contact Us', description: 'Call or submit your repair request online' },
    { step: '02', title: 'Free Diagnosis', description: 'We diagnose the issue at no charge' },
    { step: '03', title: 'Get Quote', description: 'Receive transparent pricing before repair' },
    { step: '04', title: 'Quick Repair', description: 'Expert repair with quality parts' },
    { step: '05', title: 'Quality Check', description: 'Thorough testing before handover' },
    { step: '06', title: 'Pickup/Delivery', description: 'Collect or we deliver to your location' }
  ];

  const commonIssues = [
    'Laptop not turning on',
    'Blue screen errors',
    'Slow performance',
    'Overheating issues',
    'Broken screen/display',
    'Keyboard not working',
    'Battery draining fast',
    'Printer not printing',
    'Paper jam problems',
    'Wi-Fi connectivity issues',
    'Data recovery needed',
    'Virus/malware removal'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-amber-500/30">
                  <Wrench className="w-4 h-4" />
                  Hardware Repair & Service
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                  Expert Repairs for All Your IT Equipment
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed mb-8">
                  From laptops and desktops to printers and servers—we fix it all. 
                  Fast turnaround, genuine parts, and warranty on all repairs.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a href="/#contact" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                    Request Repair
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <a href="tel:+919769444455" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20">
                    <Phone className="w-5 h-5" />
                    +91 9769444455
                  </a>
                </div>
              </div>
              <div className="hidden lg:grid grid-cols-2 gap-4">
                {[Laptop, Monitor, Printer, Cpu].map((Icon, idx) => (
                  <Card key={idx} className="bg-white/10 border-white/20">
                    <CardContent className="p-6 flex items-center justify-center">
                      <Icon className="w-16 h-16 text-amber-400" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {whyUs.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Devices We Repair */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Devices We Repair</h2>
              <p className="text-slate-600 text-lg">Comprehensive repair services for all IT equipment</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <device.icon className="w-7 h-7 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">{device.name}</h3>
                        <p className="text-sm text-slate-500">{device.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {device.repairs.map((repair, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span>{repair}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Common Issues */}
        <section className="py-16 bg-slate-800 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Common Issues We Fix</h2>
              <p className="text-slate-400 text-lg">Facing any of these problems? We can help!</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {commonIssues.map((issue, index) => (
                <div key={index} className="flex items-center gap-3 bg-slate-700/50 rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span className="text-slate-200">{issue}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Repair Process */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Repair Process</h2>
              <p className="text-slate-600 text-lg">Simple, transparent, and hassle-free</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {process.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brands We Service */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Brands We Service</h2>
              <p className="text-slate-600">Expert repairs for all major brands</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {['HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Apple', 'Microsoft', 'Samsung', 'LG', 'Canon', 'Epson', 'Brother'].map((brand, index) => (
                <div key={index} className="bg-white px-6 py-3 rounded-lg border border-slate-200 shadow-sm">
                  <span className="font-semibold text-slate-700">{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-br from-amber-500 to-amber-600">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <Wrench className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Need a Repair? Get in Touch!
            </h2>
            <p className="text-amber-100 text-lg mb-8">
              Free diagnosis for all devices. Call us or submit a repair request online.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 bg-white text-amber-600 font-semibold px-8 py-4 rounded-lg hover:bg-amber-50 transition-colors"
              >
                Request Repair
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="tel:+919769444455"
                className="inline-flex items-center gap-2 bg-amber-600 border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
