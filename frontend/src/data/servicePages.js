// Service Pages Data

export const servicePages = {
  infrastructure: {
    id: 'infrastructure',
    title: 'IT Infrastructure & Hardware Procurement',
    tagline: 'Build the Right Foundation from Day One',
    description: 'IT infrastructure is the backbone of every business. Poor planning at this stage leads to downtime, wasted spend, and constant firefighting later. TGME helps businesses design, procure, and deploy the right IT infrastructure—tailored to their size, industry, and growth plans.',
    icon: 'Server',
    color: 'amber',
    whatWeDo: [
      'Office IT infrastructure planning',
      'Laptops, desktops, servers & peripherals',
      'Printers, scanners & accessories',
      'Structured cabling & network racks',
      'Power solutions, UPS & surge protection',
      'Vendor sourcing & procurement management'
    ],
    whoIsFor: [
      'Companies setting up a new office',
      'Businesses expanding or relocating',
      'Organizations standardizing hardware across teams',
      'IT teams needing a reliable procurement partner'
    ],
    problemsWeSolve: [
      'Buying underpowered or overkill hardware',
      'No standardization across devices',
      'Warranty tracking issues',
      'Delays due to poor vendor coordination'
    ],
    approach: 'We assess your requirements, recommend the right specifications, source from trusted vendors, deploy on-site, and document everything for long-term clarity.',
    result: 'A stable, scalable IT foundation that just works.'
  },
  networking: {
    id: 'networking',
    title: 'Networking, Wi-Fi, Security & Surveillance',
    tagline: 'Reliable Connectivity. Built for Business.',
    description: 'Unstable networks and poorly designed security setups silently kill productivity. TGME designs robust, secure, and scalable office networks that support real business usage—not just internet speed tests.',
    icon: 'Shield',
    color: 'emerald',
    whatWeDo: [
      'LAN & structured network design',
      'Business-grade Wi-Fi planning',
      'Managed & PoE switches',
      'Firewalls & network security',
      'CCTV surveillance systems',
      'Access control & attendance systems'
    ],
    whoIsFor: [
      'New office setups',
      'Wi-Fi dead zone issues',
      'Security upgrades',
      'Compliance-driven environments'
    ],
    problemsWeSolve: [
      'Consistent connectivity across the office',
      'Secure separation of staff and guest networks',
      'Controlled access to physical and digital spaces',
      'Reduced downtime and troubleshooting'
    ],
    approach: 'We assess the site, design the network architecture, deploy enterprise-grade hardware, and ensure everything is documented and support-ready.',
    result: 'A network you don\'t have to think about every day.'
  },
  devices: {
    id: 'devices',
    title: 'Endpoint Devices, Mobility & Device Management',
    tagline: 'Control Devices Without Micromanaging People',
    description: 'As teams grow mobile, controlling company data becomes harder. TGME helps businesses secure, manage, and monitor endpoint devices without disrupting daily work.',
    icon: 'Laptop',
    color: 'sky',
    whatWeDo: [
      'Device onboarding & enrollment',
      'Security policies & access control',
      'Data protection & remote wipe',
      'Lost or stolen device handling',
      'Role-based device policies'
    ],
    devices: [
      'Laptops & desktops',
      'Mobile phones',
      'Tablets'
    ],
    whoIsFor: [
      'Companies issuing devices to employees',
      'Businesses allowing BYOD (Bring Your Own Device)',
      'Teams working remotely or on the move'
    ],
    problemsWeSolve: [
      'Prevents data leaks',
      'Protects company information',
      'Ensures compliance',
      'Reduces dependency on manual IT intervention'
    ],
    approach: 'We implement comprehensive device management policies that protect company data while maintaining employee productivity.',
    result: 'Secure devices, controlled data, and peace of mind.'
  },
  cloud: {
    id: 'cloud',
    title: 'Cloud Services, Hosting & Productivity',
    tagline: 'Modern Work Needs Modern Infrastructure',
    description: 'Email, collaboration, storage, and hosting are no longer optional—they\'re business essentials. Through our sister brand Hosting Bay (hostingbay.in), we offer comprehensive cloud and hosting solutions with enterprise-grade reliability.',
    icon: 'Cloud',
    color: 'violet',
    whatWeDo: [
      'Web Hosting (Linux, Windows, WordPress, Cloud)',
      'Business Email & Collaboration (Google Workspace, Titan)',
      'Domain Registration & DNS Management',
      'SSL Certificates & Security Solutions',
      'Dedicated Servers & Cloud Infrastructure',
      'Website Builder & Development Tools'
    ],
    partnerBrand: {
      name: 'Hosting Bay',
      url: 'https://hostingbay.in',
      tagline: 'Web Hosting made EASY and AFFORDABLE'
    },
    serviceCategories: [
      {
        category: 'Web Hosting',
        services: [
          'Linux Shared Hosting (cPanel)',
          'Windows Hosting (Plesk)',
          'WordPress Optimized Hosting',
          'Cloud Hosting'
        ],
        features: ['Unlimited Bandwidth & Space', '99.9% Uptime Guarantee', 'Free Email Included', '30-Day Money-Back Guarantee']
      },
      {
        category: 'Reseller Hosting',
        services: [
          'Linux Reseller Hosting',
          'Windows Reseller Hosting',
          'Free WHMCS Included',
          'Softaculous Included'
        ],
        features: ['Start Your Own Hosting Business', 'White-Label Solutions', 'Full Control Panel Access']
      },
      {
        category: 'Business Email',
        services: [
          'Business Email Hosting',
          'Enterprise Email',
          'Google Workspace',
          'Titan Email'
        ],
        features: ['Professional Email Addresses', 'Collaboration Tools', 'Calendar & Drive Integration']
      },
      {
        category: 'Domain Services',
        services: [
          'Domain Registration',
          'Domain Transfer',
          'Bulk Domain Registration',
          'DNS Management'
        ],
        features: ['Competitive Pricing', 'Free Privacy Protection', 'Easy Management']
      },
      {
        category: 'Security & Protection',
        services: [
          'SSL Certificates (up to 256-bit)',
          'SiteLock Security',
          'CodeGuard Backup',
          'DDoS Protection'
        ],
        features: ['Browser Compatibility', 'Free Reissues', 'Malware Scanning']
      },
      {
        category: 'Infrastructure',
        services: [
          'Dedicated Servers',
          'Cloud Infrastructure',
          'Website Builder',
          'Combo Offers'
        ],
        features: ['24/7 Server Monitoring', 'Backup & Recovery', 'Enterprise-Grade Security']
      }
    ],
    whoIsFor: [
      'New companies setting up systems from scratch',
      'Businesses moving from on-premise to cloud',
      'Teams adopting remote or hybrid work',
      'Web developers & agencies needing reliable hosting',
      'Resellers looking to start hosting business'
    ],
    whyHostingBay: [
      '99.9% Uptime Guarantee',
      '24/7 Server Monitoring',
      'Data Center Security',
      'Backup & Recovery Solutions',
      'Affordable Pricing',
      '30-Day Money-Back Guarantee'
    ],
    approach: 'We don\'t just set it up—we ensure your team actually uses it efficiently. With Hosting Bay\'s infrastructure and TGME\'s implementation expertise, you get the best of both worlds.',
    result: 'A cloud environment that supports growth, not friction.',
    cta: {
      text: 'Explore Hosting Bay Services',
      url: 'https://hostingbay.in'
    }
  },
  assets: {
    id: 'assets',
    title: 'After-Sales Systems, Warranty & Asset Management',
    tagline: 'Know What You Own. Know What\'s Expiring.',
    description: 'Most businesses lose money not through bad purchases—but through poor tracking. TGME brings structure and visibility to your IT assets.',
    icon: 'Package',
    color: 'orange',
    whatWeDo: [
      'IT asset tracking',
      'Warranty & AMC management',
      'Asset-user assignment history',
      'Expiry alerts & reports',
      'Centralized asset records'
    ],
    whoIsFor: [
      'Growing companies',
      'Multi-location offices',
      'Businesses with frequent device movement',
      'Finance and operations teams'
    ],
    problemsWeSolve: [
      'Prevents warranty lapses',
      'Simplifies audits',
      'Improves budgeting',
      'Reduces asset loss'
    ],
    approach: 'We implement comprehensive asset tracking systems that give you complete visibility into your IT inventory.',
    result: 'Complete visibility into your IT inventory and lifecycle.'
  },
  support: {
    id: 'support',
    title: 'Ongoing IT Support, Maintenance & Backend Ops',
    tagline: 'IT Support That Runs on Process, Not Panic',
    description: 'TGME provides structured, reliable IT support designed for businesses that value uptime, clarity, and accountability.',
    icon: 'Headphones',
    color: 'rose',
    supportModels: [
      'On-call support',
      'AMC-based support',
      'Fully managed IT operations'
    ],
    whatWeDo: [
      'Day-to-day IT issues',
      'System monitoring',
      'Preventive maintenance',
      'Backend coordination',
      'Documentation & reporting'
    ],
    whoIsFor: [
      'Businesses that value uptime',
      'Companies needing predictable IT costs',
      'Teams without dedicated IT staff',
      'Organizations wanting process-driven support'
    ],
    philosophy: [
      'Clear scope',
      'Defined response processes',
      'No hidden assumptions',
      'No hero-driven dependency'
    ],
    approach: 'We believe good IT support should feel boring—because everything works.',
    result: 'Fewer disruptions, predictable support, and controlled IT operations.'
  },
  webapps: {
    id: 'webapps',
    title: 'Websites & Custom Web Applications',
    tagline: 'Built for Your Business, Not From a Template',
    description: 'Not every business problem has a ready-made software solution. TGME helps companies design and build custom websites and web applications tailored exactly to their workflow, operations, and growth plans. If what you need doesn\'t exist off-the-shelf — we build it.',
    icon: 'Code',
    color: 'cyan',
    whatWeDo: [
      'Business websites (corporate, service-based, solution-led)',
      'Internal portals & dashboards',
      'Custom web applications',
      'Process automation tools',
      'Admin panels & management systems',
      'Integration with third-party tools and APIs'
    ],
    whenMakesSense: [
      'You have a manual or broken process',
      'Existing software doesn\'t fit your workflow',
      'You\'re juggling Excel sheets, WhatsApp, and emails',
      'You want control over your data and systems',
      'You need something simple, specific, and reliable'
    ],
    whoIsFor: [
      'Companies with unique workflow requirements',
      'Businesses replacing manual processes',
      'Organizations needing internal tools',
      'Teams wanting control over their data'
    ],
    approachSteps: [
      'Requirement discovery & process mapping',
      'Feature scoping (what\'s needed vs what\'s noise)',
      'UX-first design (simple, usable, practical)',
      'Development & testing',
      'Deployment & documentation',
      'Ongoing support & enhancements (if required)'
    ],
    whatWeDontDo: [
      'Over-engineered apps nobody uses',
      'Buzzword-driven "AI for everything" builds',
      'Bloated features that increase cost without value'
    ],
    useCases: [
      'Asset & warranty management systems',
      'Internal IT or operations dashboards',
      'Customer portals',
      'Workflow & approval systems',
      'Custom tools to replace repetitive manual work'
    ],
    approach: 'We don\'t start with code. We start with understanding the problem. Then we build exactly what\'s needed — nothing more, nothing less.',
    result: 'Software that fits your business instead of forcing your business to fit the software.'
  }
};

export const serviceOrder = ['infrastructure', 'networking', 'devices', 'cloud', 'assets', 'support', 'webapps'];
