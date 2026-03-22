# The Good Men Enterprise (TGME) — Product Requirements Document

## Original Problem Statement
Build a comprehensive MSP platform for TGME — an IT support company in Mumbai. Includes marketing website, Knowledge Base, ServiceBook (field service app), Support Forms, Digital Business Card, Lead Generation/Sales CRM, and Client Portal.

## Core Architecture
- **Frontend**: React + Tailwind + Shadcn UI
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB (DB_NAME: test_database)
- **All workspace routes share a single DB connection** injected via `set_workspace_db(db)` from server.py

## What's Been Implemented

### Marketing Website & SEO — COMPLETE
- Landing page, service pages, SEO landing pages (CCTV, networking, server, printer, etc.)
- Location-based pages (IT support Mumbai, computer repair, small business IT)
- About, How We Work, Case Studies pages
- WhatsApp widget

### Knowledge Base — COMPLETE
- Public KB with categories and articles
- Admin CMS (login, dashboard, CRUD for categories/articles)

### ServiceBook (Field Service App) — COMPLETE
- Employee auth with role-based access
- Clients, Locations, Contacts management
- Task workflow (new → assigned → in_progress → completed → billed)
- Parts inventory, suppliers, part orders
- Service entries, billing, expenses
- Bulk upload (clients, employees, parts)
- Assets management with QR codes and service history
- AMC & License management
- Client Portal (portal login, assets, AMCs, tickets)

### Support Forms & osTicket Integration — COMPLETE
- AMC page with public form
- Support quote forms (Access Control, Attendance Machine options)

### Digital Business Card — COMPLETE
- Static HTML at `/card` (11KB, loads in <1s)
- vCard download, QR code for print

### Lead Generation & Sales CRM — COMPLETE
- **Separated Sales CRM** from ServiceBook with app selector on login
- **Sales Dashboard**: Stats (Total Leads, New, Contacted, Converted, Today Visitors), quick actions, recent leads
- **Lead Scraper**: DuckDuckGo-based scraper (29 business types, 16 Mumbai locations) — works on production only (egress blocked in preview)
- **Sales Pipeline**: Kanban board (New → Contacted → Qualified → Converted → Lost) with drag-to-stage, lead editing
- **Visitor Analytics**: Tracks public page visits (page, referrer, UTM params, IP, session)
- **All Leads**: Full lead management with status, priority, notes, follow-up dates, WhatsApp/call/email actions

### Blog — COMPLETE (hidden pending approval)
- DeepSeek-powered AI blog generation
- OpenAI GPT Image 1 for blog images

## Auth & Access
- Workspace employees have `apps_access` array: `["servicebook", "sales", "admin"]`
- Login sends `section` field to determine which app to load
- Separate layouts: `ServiceBookLayout` for `/workspace/servicebook/*`, `SalesLayout` for `/workspace/sales/*`

## Credentials
- Employee ID: `maharathy` | Password: `Charu@123@`

## Upcoming Tasks (P1)
- Phase 4: Bulk Deployment Projects (track/provision assets for new office setups)
- Bulk Employee & Asset Assignment (advanced CSV upload)

## Future/Backlog
- (P2) IT Health Check interactive tool (lead magnet)
- (P3) Reports Dashboard (asset health, warranty, AMC renewals, revenue)
- (P3) Pending Billing & Invoice generation
- (P3) Razorpay payment integration
- (P3) Un-hide AI Blog (pending user approval)
- (P4) Live chat widget & static content pages

## 3rd Party Integrations
- osTicket (Support tickets) — requires User API Key
- DeepSeek (Blog) — requires User API Key
- OpenAI GPT Image 1 (Blog images) — uses Emergent LLM Key
- DuckDuckGo (`ddgs` library) — local, no key, requires unblocked egress

## Deployment
- Production: Vultr server at 65.20.81.4 (manual SCP/SSH deployment)
