# The Good Men Enterprise (TGME) — Product Requirements Document

## Original Problem Statement
Build a comprehensive digital platform for The Good Men Enterprise (TGME), an IT support company based in Mumbai. The platform includes a marketing website, knowledge base, ServiceBook field service app, dynamic AMC pricing, multi-step support form integrated with osTicket, AI-driven blog, and a complete SEO + lead generation funnel.

## User Personas
- **Business Owners/IT Managers**: Looking for IT support services in Mumbai
- **TGME Admin/Staff**: Managing service entries, clients, employees, parts, billing
- **Website Visitors**: Potential leads finding TGME through search or referrals

## Core Requirements
1. Professional marketing website with SEO
2. Knowledge Base with CMS
3. ServiceBook application for service management
4. AMC page with complex pricing → osTicket tickets
5. Dynamic multi-step support form → osTicket tickets
6. AI-driven blog (feature complete, currently hidden)
7. Comprehensive Mumbai-targeted SEO strategy
8. Lead generation funnel (landing pages, WhatsApp widget, lead capture forms → osTicket)
9. IT Health Check interactive tool (upcoming)
10. Lead Dashboard in ServiceBook (upcoming)

## Architecture
- **Frontend**: React (CRA) with Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Integrations**: osTicket, DeepSeek (blog), OpenAI GPT Image 1 (blog images), WhatsApp
- **Deployment**: Vultr server (manual scp/ssh)

## What's Been Implemented

### Marketing Website (COMPLETE)
- Landing page with hero, services, why-us, clients, contact sections
- Service pages (email, cybersecurity, repair, etc.)
- About, How We Work, Case Studies pages
- Header with dropdowns, Footer with links

### Knowledge Base (COMPLETE)
- Public KB with categories and articles
- Admin panel for CRUD operations
- Auth-protected admin routes

### ServiceBook (COMPLETE)
- Employee login with role-based access
- Clients, Employees, Parts, Tasks management
- Service entries, billing, expenses
- Task workflow with field task detail
- Parts requests, suppliers management

### AMC Page (COMPLETE)
- Complex pricing tiers
- Form submission → osTicket ticket

### Support Form (COMPLETE)
- Multi-step dynamic form
- osTicket integration

### AI Blog (COMPLETE — HIDDEN)
- DeepSeek for content generation
- Web scraping for topic research
- AI fact-checking with trust scores
- AI image generation (GPT Image 1)
- Content uniqueness checks
- Scheduler for auto-generation
- Admin UI in ServiceBook
- **Status**: Hidden from public navigation at user's request

### SEO Implementation (COMPLETE)
- react-helmet-async for dynamic metadata
- Mumbai-focused titles, descriptions, keywords on every page
- Schema.org markup (Organization, Service, FAQ, Breadcrumb)
- Dynamic sitemap.xml and robots.txt
- **12 SEO Landing Pages** (8 service + 4 location) — COMPLETE

### Lead Generation Funnel (PHASE 2 COMPLETE)
- Global WhatsApp widget with page-specific messages
- Reusable LeadCaptureForm component (card + inline + banner variants)
- Backend /api/leads/submit → saves to DB + creates osTicket ticket
- Lead status management API (/api/leads/list, /api/leads/{phone}/status)
- **12 hyper-targeted SEO landing pages** with:
  - Hero section with CTA
  - Lead capture form (card variant on desktop)
  - Trust bar (500+ businesses, same-day, 14+ years, 4.8/5)
  - Rich content sections
  - FAQ with accordion + Schema.org markup
  - Final CTA section with second lead form
  - Mobile-optimized lead form
  - LeadCaptureBanner at top
  - WhatsApp widget

### Contact Form → osTicket (COMPLETE)

## P0/P1/P2 Features Remaining

### P1 — IT Health Check Tool
Interactive assessment tool as lead magnet on landing pages. Users answer questions about their IT setup and get a score + recommendations. Captures leads.

### P2 — Lead Dashboard in ServiceBook
Internal dashboard for viewing/managing captured leads. Filter by status, source, date. Update lead status (new → contacted → converted → lost).

### P2 — Un-hide AI Blog
Re-add blog link to Header navigation and uncomment routes when user approves.

### P3 — Pending Billing & Invoices
Invoice generation feature in ServiceBook.

### P3 — Client Portal
Customers can view tickets, AMCs, and invoices.

### P3 — Payment Gateway (Razorpay)
Online payment for invoices.

### P4 — Live Chat Widget
Real-time chat on the website.

### P4 — Static Pages Content
Populate About Us and Case Studies with real content.

## Key Technical Details
- osTicket API Key: stored in backend .env
- DeepSeek API Key: stored in backend .env
- Emergent LLM Key: used for blog image generation
- ServiceBook credentials: maharathy / Charu@123@
- Production server: 65.20.81.4 (Vultr)
