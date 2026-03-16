import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/sections/HeroSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { SEO } from '../components/SEO';
import { WhyUsSection } from '../components/sections/WhyUsSection';
import { ClientsSection } from '../components/sections/ClientsSection';
import { PhilosophySection } from '../components/sections/PhilosophySection';
import { ContactSection } from '../components/sections/ContactSection';
import { Toaster } from '../components/ui/sonner';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="IT Support, AMC & Hardware Services in Mumbai"
        description="The Good Men Enterprise (TGME) provides professional IT support, Annual Maintenance Contracts, CCTV installation, cybersecurity, networking, and hardware repair services in Mumbai. Trusted by 500+ businesses."
        keywords="IT support Mumbai, computer AMC Mumbai, CCTV installation Mumbai, hardware repair Mumbai, cybersecurity services Mumbai, IT company Mulund, network setup Mumbai, laptop repair Mumbai, business IT solutions Mumbai, TGME"
        path="/"
      />
      <Toaster position="top-right" richColors />
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <WhyUsSection />
        <ClientsSection />
        <PhilosophySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
