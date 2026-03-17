import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SEO, serviceSchema, faqSchema, breadcrumbSchema } from '../components/SEO';
import { LeadCaptureForm, LeadCaptureBanner } from '../components/LeadCapture';
import { Toaster } from '../components/ui/sonner';
import { landingPages, locationPages } from '../data/landingPageData';
import {
  CheckCircle2, Phone, Clock, Shield, Users, Star,
  ArrowRight, MapPin, Award, Headphones, ChevronDown, ChevronUp
} from 'lucide-react';

const TRUST_STATS = [
  { icon: Users, value: '500+', label: 'Businesses Served' },
  { icon: Clock, value: 'Same Day', label: 'Service Available' },
  { icon: Award, value: '14+ Years', label: 'Experience' },
  { icon: Star, value: '4.8/5', label: 'Client Rating' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden" data-testid={`faq-item-${q.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors"
        data-testid="faq-toggle"
      >
        <span className="font-semibold text-slate-800 pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function SEOLandingPage({ type = 'service', slug: propSlug }) {
  const params = useParams();
  const slug = propSlug || params.slug;
  const allData = type === 'location' ? locationPages : landingPages;
  const data = allData[slug];

  if (!data) return <Navigate to="/" replace />;

  const isLocation = type === 'location';
  const pagePath = isLocation ? `/${slug}` : `/services/${slug}`;

  const seoServiceSchema = serviceSchema({
    name: data.serviceLabel || data.title,
    description: data.metaDesc,
    url: pagePath,
  });

  const faqSchemaData = data.faq?.length
    ? faqSchema(data.faq.map(f => ({ question: f.q, answer: f.a })))
    : null;

  const bcSchema = breadcrumbSchema([
    { name: 'Home', path: '/' },
    ...(isLocation ? [] : [{ name: 'Services', path: '/#services' }]),
    { name: data.serviceLabel || data.title, path: pagePath },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={data.metaTitle}
        description={data.metaDesc}
        keywords={data.keywords}
        path={pagePath}
        schema={[seoServiceSchema, faqSchemaData, bcSchema].filter(Boolean)}
      />
      <Toaster position="top-right" richColors />
      <Header />

      {/* Hero */}
      <section className="relative bg-slate-900 overflow-hidden" data-testid="seo-hero">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-4" data-testid="service-label">
                {data.serviceLabel}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5" data-testid="hero-title">
                {data.hero}
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                {data.subtitle}
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <a href="tel:+919769444455" className="inline-flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors text-sm" data-testid="hero-call-btn">
                  <Phone className="w-4 h-4" /> Call +91 97694 44455
                </a>
                <button onClick={() => document.getElementById('get-quote-cta')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold transition-colors border border-white/20 text-sm cursor-pointer" data-testid="hero-quote-btn">
                  Get Free Quote <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Serving Mumbai, Thane, Navi Mumbai & MMR</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <LeadCaptureForm
                service={data.serviceLabel}
                source={pagePath}
                variant="card"
                heading={`Get ${data.serviceLabel} Quote`}
                subheading="Free assessment. We'll call you within 2 hours."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b border-slate-100" data-testid="trust-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {TRUST_STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{stat.value}</div>
                  <div className="text-slate-500 text-xs">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {data.sections?.map((section, i) => (
        <section
          key={i}
          className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
          data-testid={`content-section-${i}`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">{section.heading}</h2>
            <div
              className="prose prose-slate max-w-none prose-li:marker:text-amber-500 prose-strong:text-slate-800 prose-a:text-amber-600"
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
          </div>
        </section>
      ))}

      {/* Mobile Lead Form (shown only on mobile, below content) */}
      <section className="lg:hidden bg-slate-900 py-12 px-4" id="get-quote-mobile" data-testid="mobile-lead-form">
        <div className="max-w-md mx-auto">
          <LeadCaptureForm
            service={data.serviceLabel}
            source={pagePath}
            variant="card"
            heading={`Get ${data.serviceLabel} Quote`}
            subheading="Free assessment. We'll call you within 2 hours."
          />
        </div>
      </section>

      {/* Why Choose TGME */}
      <section className="bg-white py-14 sm:py-16" data-testid="why-tgme">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-10 text-center">
            Why Mumbai Businesses Choose TGME
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Clock, title: 'Fast Response', desc: 'Same-day on-site support across Mumbai, Thane, and Navi Mumbai. Most issues resolved within 4 hours.' },
              { icon: Shield, title: 'Experienced Team', desc: '14+ years in IT services. Certified engineers who understand business-critical systems.' },
              { icon: Headphones, title: 'Dedicated Support', desc: 'Direct phone line, WhatsApp, and email. No call centers — you talk to the engineer.' },
              { icon: CheckCircle2, title: 'Transparent Pricing', desc: 'No hidden charges. Detailed quotes before any work begins. AMC plans for predictable costs.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {data.faq?.length > 0 && (
        <section className="bg-slate-50 py-14 sm:py-16" data-testid="faq-section">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 text-center">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-center mb-10">
              {data.serviceLabel} in Mumbai — common questions answered
            </p>
            <div className="space-y-3">
              {data.faq.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-slate-900 py-14 sm:py-16" id="get-quote-cta" data-testid="final-cta">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Get a free assessment and quote for {data.serviceLabel.toLowerCase()} from our expert team. We serve businesses across Mumbai, Thane, and Navi Mumbai.
              </p>
              <ul className="space-y-3">
                {['Free on-site assessment', 'Same-day service available', 'Transparent, upfront pricing', 'AMC plans for ongoing support'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
                <Phone className="w-4 h-4" />
                <span>Or call directly: <a href="tel:+919769444455" className="text-amber-400 font-semibold hover:text-amber-300">+91 97694 44455</a></span>
              </div>
            </div>
            <LeadCaptureForm
              service={data.serviceLabel}
              source={pagePath}
              variant="card"
              heading="Get Your Free Quote"
              subheading="No obligations. Expert advice guaranteed."
              ctaText="Request Callback"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
