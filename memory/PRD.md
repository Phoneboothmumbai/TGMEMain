# TGME ServiceBook - Product Requirements Document

## Live URL
- Website: https://thegoodmen.in
- AMC Plans: https://thegoodmen.in/amc
- Support Form: https://thegoodmen.in/support
- Blog: Hidden (admin only at /workspace/servicebook/blog-admin)
- ServiceBook: https://thegoodmen.in/workspace/login  
- Support Portal: https://support.thegoodmen.in
- Sitemap: https://thegoodmen.in/sitemap.xml
- Robots: https://thegoodmen.in/robots.txt
- Credentials: maharathy / Charu@123@

## SEO Implementation (Completed Mar 2026)
- **react-helmet-async** on every page with unique title, description, keywords
- **Open Graph + Twitter Cards** on all pages for social sharing
- **Schema.org**: LocalBusiness (every page), Service (service pages), BreadcrumbList, FAQPage
- **Dynamic sitemap.xml**: Auto-includes all pages, blog posts, KB articles
- **robots.txt**: Allows crawling, blocks /workspace/ and /kb/admin/
- **Canonical URLs** on every page
- **Geo tags**: Mumbai, Maharashtra, India
- **Target keywords**: IT support Mumbai, computer AMC Mumbai, CCTV installation Mumbai, hardware repair Mumbai, cybersecurity services Mumbai, email setup Mumbai, network setup Mumbai

## AI Blog System (Completed Mar 2026, Hidden from public)
- **Engine**: DeepSeek API with 4-step pipeline: News Scraping → Topic Research → Article Generation → Fact-Check Verification
- **News Sources**: RSS feeds from TechCrunch, The Verge, ZDNet, VentureBeat, Ars Technica + scraping Gadgets360, Digit.in, HT Tech, etc.
- **Fact-Check Layer**: Second AI pass verifies claims, removes fake stats, trust score 1-10
- **Image Generation**: OpenAI GPT Image 1 for featured images
- **Uniqueness**: Checks last 45 days of posts, feeds existing titles to AI to prevent duplicates
- **Settings**: Posts per week (1-7), preferred days, generation hour, auto-generate toggle
- **Admin**: Blog Manager with fact-check reports, trust score badges, approve/reject workflow

## Contact Form → osTicket (Completed Mar 2026)
- `/api/contact/submit` creates ticket in osTicket with name, email, company, phone, message

## 3rd Party Integrations
- **osTicket** — AMC + Support + Contact form tickets (key whitelisted for IP 65.20.81.4)
- **DeepSeek** — Blog content generation + trend research
- **OpenAI GPT Image 1** — Blog featured image generation via Emergent LLM Key
- **Cloudflare** — DNS, SSL, robots.txt management

## Modules Built
1-12. ServiceBook (Dashboard, Tasks, Clients, Employees, Suppliers, Parts, Orders, Entries, Requests, Expenses, Field PWA)
13. AMC Plans Page (4 plans, per-device-type pricing, osTicket)
14. Support Form (Quote + Support, 94 sub-topics, dynamic forms, osTicket)
15. AI Blog System (hidden — DeepSeek + fact-check + image gen + scheduler)
16. Contact Form → osTicket integration
17. Full SEO (meta tags, OG, Schema.org, sitemap, robots.txt, canonical URLs)

## Pending/Upcoming
- P1: Fix remaining blog content quality issues before making public
- P1: Email approval system for blog (needs Resend API key)
- P2: Pending Billing / Invoice feature in ServiceBook
- P2: Website tools (speed test, password checker, email checker, etc.)
- P3: Client Portal for tickets, AMCs, invoices
- P3: Payment gateway (Razorpay)
- P4: AI Chatbot
- P4: Live chat widget
- P4: Case Studies content
- P4: Automated notifications
