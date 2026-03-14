# TGME ServiceBook - Product Requirements Document

## Live URL
- Website: https://thegoodmen.in
- AMC Plans: https://thegoodmen.in/amc
- Support Form: https://thegoodmen.in/support
- ServiceBook: https://thegoodmen.in/workspace/login  
- Support Portal: https://support.thegoodmen.in
- Credentials: maharathy / Charu@123@

## Navigation (Updated Mar 2026)
Company (submenu: About, How We Work, KB) | Solutions (dropdown) | AMC Plans | Support | Login | [Get in Touch]

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

## 3rd Party Integrations
- **osTicket** — REST API for AMC + Support ticket creation (key whitelisted for IP 65.20.81.4)
- **Cloudflare** — DNS and SSL proxy
- **WhatsApp** — wa.me links for supplier/engineer messaging

## Modules Built
1-12. ServiceBook (Dashboard, Tasks, Clients, Employees, Suppliers, Parts, Orders, Entries, Requests, Expenses, Field PWA)
13. AMC Plans Page (4 plans, per-device-type pricing, osTicket)
14. Support Form (Quote + Support, 94 sub-topics, dynamic forms, osTicket)

## Pending/Upcoming
- P2: Pending Billing feature
- P3: Contact form backend to save leads
- P3: Content population (About, How We Work, Case Studies)
- P4: Smart IT Setup Wizard
- P4: Interactive tools
