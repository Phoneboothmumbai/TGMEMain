import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE = 'https://thegoodmen.in';
const BRAND = 'The Good Men Enterprise (TGME)';

// Organization schema — appears on every page
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "The Good Men Enterprise",
  "alternateName": "TGME",
  "url": SITE,
  "logo": `${SITE}/logo.png`,
  "image": `${SITE}/logo.png`,
  "description": "Professional IT support, AMC, networking, CCTV, cybersecurity, and hardware repair services for businesses in Mumbai.",
  "telephone": "+919769444455",
  "email": "support@thegoodmen.in",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "7, Lok Kedar, JSD Road, Mulund West",
    "addressLocality": "Mumbai",
    "addressRegion": "Maharashtra",
    "postalCode": "400080",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "19.1726",
    "longitude": "72.9570"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "10:00",
      "closes": "19:00"
    }
  ],
  "priceRange": "$$",
  "areaServed": [
    { "@type": "City", "name": "Mumbai" },
    { "@type": "State", "name": "Maharashtra" },
    { "@type": "Country", "name": "India" }
  ],
  "sameAs": [],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "IT Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Annual Maintenance Contract (AMC)" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "IT Support & Repair" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "CCTV Installation" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Network Setup" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Cybersecurity" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Business Email Setup" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Hardware Repair" } }
    ]
  }
};

export function SEO({ title, description, keywords, path = '/', type = 'website', image, schema, noIndex = false }) {
  const fullTitle = title ? `${title} | ${BRAND}` : `${BRAND} — IT Support & Services Mumbai`;
  const url = `${SITE}${path}`;
  const ogImage = image || `${SITE}/og-default.png`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={BRAND} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Geo */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Mumbai" />

      {/* Organization Schema — every page */}
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>

      {/* Page-specific schema */}
      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
    </Helmet>
  );
}

// Breadcrumb schema helper
export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": `${SITE}${item.path}`
    }))
  };
}

// Service schema helper
export function serviceSchema({ name, description, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "url": `${SITE}${url}`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "The Good Men Enterprise",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Mumbai",
        "addressRegion": "Maharashtra",
        "addressCountry": "IN"
      }
    },
    "areaServed": { "@type": "City", "name": "Mumbai" }
  };
}

// FAQ schema helper
export function faqSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": { "@type": "Answer", "text": q.answer }
    }))
  };
}
