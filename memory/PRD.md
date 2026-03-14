# TGME ServiceBook - Product Requirements Document

## Live URL
- Website: https://thegoodmen.in
- AMC Plans: https://thegoodmen.in/amc
- Support Form: https://thegoodmen.in/support
- Blog: https://thegoodmen.in/blog
- ServiceBook: https://thegoodmen.in/workspace/login  
- Support Portal: https://support.thegoodmen.in
- Credentials: maharathy / Charu@123@

## Navigation (Updated Mar 2026)
Company (submenu: About, How We Work, KB) | Solutions (dropdown) | AMC Plans | Support | Blog | Login | [Get in Touch]

## AMC Plans — Device-Specific Pricing
| Plan | Price/yr | Key |
|------|---------|-----|
| Silver | 2,500 | 48hr response, 2 visits, Mon-Fri 11-6 |
| Gold | 3,000 | 24hr response, 4 visits, Mon-Sat 11-8 |
| Platinum | 4,000 | 8hr response, 6 visits, Mon-Sat 11-9 |
| Diamond | 6,500 | 4hr priority, 12 visits, Mon-Sat 11-10 |
All non-comprehensive. Parts billed separately.

Other devices: Laser Printer 1500, Heavy Printer 3000, Router/Switch 1000, Firewall 4000, CCTV 600, DVR/NVR 2500, Desktop UPS 500, Server UPS 5000, Servers = Custom Quote.

## Support Form — Topics & Sub-Topics
### Request Quote (7 categories, 21 sub-topics)
Hardware & Devices, IT Infrastructure, Business Email & Cloud, Web & Hosting, Security & IT Management, Service Contracts, Other

### Request Support (13 categories, 73 sub-topics)
Computer/Laptop, Printer/Scanner, Network/Internet, Email, Server, CCTV, UPS, Software, Remote/On-Site, Apple & Device Services, Domain/Hosting/Cloud, Billing/Account, Other

Each sub-topic has specific dynamic fields (device make/model, OS, error messages, quantities, etc.) + osTicket integration.

## AI Blog System (Completed Mar 2026)
- **Engine**: DeepSeek API (`deepseek-chat` model) for content generation
- **Categories**: 10 (How-To Guides, Cybersecurity, Troubleshooting, Product Reviews, Web Hosting, Business IT, Cloud Tools, Networking, Backup & DR, Hardware)
- **Workflow**: Generate → Pending Review → Approve/Reject → Published
- **Admin**: ServiceBook > Blog Manager (generate, approve, reject, delete, view)
- **Settings**: Posts per week (1-7), preferred days, generation hour, auto-generate toggle
- **Scheduler**: APScheduler with cron trigger for automatic post generation
- **SEO**: Schema.org Article + FAQPage markup, meta tags, canonical URLs, FAQ sections
- **Email**: Disabled (requires Resend API key)

## 3rd Party Integrations
- **osTicket** — REST API for AMC + Support ticket creation (key whitelisted for IP 65.20.81.4)
- **DeepSeek** — AI blog content generation (API key in backend/.env)
- **Cloudflare** — DNS and SSL proxy
- **WhatsApp** — wa.me links for supplier/engineer messaging

## Modules Built
1-12. ServiceBook (Dashboard, Tasks, Clients, Employees, Suppliers, Parts, Orders, Entries, Requests, Expenses, Field PWA)
13. AMC Plans Page (4 plans, per-device-type pricing, osTicket)
14. Support Form (Quote + Support, 94 sub-topics, dynamic forms, osTicket)
15. AI Blog System (DeepSeek generation, admin approval, scheduler, SEO, public blog)

## Pending/Upcoming
- P1: Finalize email approval system (needs Resend API key)
- P2: Pending Billing feature in ServiceBook
- P3: Contact form backend to save leads
- P3: Content population (About, How We Work, Case Studies)
- P3: Client Portal for tickets, AMCs, invoices
- P3: Payment gateway integration (Razorpay)
- P4: Live chat widget
- P4: Automated notifications (AMC expiry, ticket updates)
