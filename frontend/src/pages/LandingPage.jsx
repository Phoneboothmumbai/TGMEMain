import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { HeroSection } from '../components/sections/HeroSection';
import { ServicesSection } from '../components/sections/ServicesSection';
import { WhyUsSection } from '../components/sections/WhyUsSection';
import { ClientsSection } from '../components/sections/ClientsSection';
import { PhilosophySection } from '../components/sections/PhilosophySection';
import { ContactSection } from '../components/sections/ContactSection';
import { Toaster } from '../components/ui/sonner';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
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
