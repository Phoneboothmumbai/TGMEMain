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
- Landing page, service pages, SEO landing pages
- Location-based pages, About, How We Work, Case Studies, WhatsApp widget

### Knowledge Base — COMPLETE
- Public KB with categories and articles, Admin CMS

### ServiceBook (Field Service App) — COMPLETE
- Employee auth with role-based access, Clients/Locations/Contacts
- Task workflow, Parts inventory, Service entries, Billing, Expenses
- Bulk upload, Assets with QR codes, AMC & License management
- Client Portal (portal login, assets, AMCs, tickets)

### Support Forms & osTicket Integration — COMPLETE

### Digital Business Card — COMPLETE
- Static HTML at `/card` (11KB, loads in <1s)

### Lead Generation & Sales CRM — COMPLETE (Mar 22, 2026)
- **Separated Sales CRM** from ServiceBook with app selector on login
- **Sales Dashboard**: Stats, quick actions (Accounts, Contacts, Scraper, Pipeline, Visitors), recent leads
- **Accounts**: Full CRUD for company records (name, industry, phone, email, website, address, city, notes). Shows linked contacts_count and leads_count.
- **Contacts**: Full CRUD for people records linked to accounts (name, title, phone, email, account). WhatsApp & call quick actions.
- **Lead Detail (EspoCRM-style)**: Full-page detail view with:
  - Left panel: Stage, Amount (INR), Account, Probability %, Close Date, Lead Source, Contacts, Phone, Email, Website, Address, Description
  - Stream section: Comment input + chronological activity feed with user names & timestamps. Auto-logs status changes.
  - Right sidebar: Stage quick-change buttons, Assigned User, Priority, Created date, Notes, Quick Actions (Call, WhatsApp, Email)
  - Edit dialog: All fields editable including amount, probability, close_date, account, lead_source
- **Lead Scraper**: DuckDuckGo-based (works on production only)
- **Sales Pipeline**: Kanban board with Amount display, click navigates to detail page
- **Visitor Analytics**: Tracks public page visits
- **All Leads**: Table with search/filter, click navigates to detail page

### Blog — COMPLETE (hidden pending approval)

## Auth & Access
- Workspace employees have `apps_access` array: `["servicebook", "sales", "admin"]`
- Login sends `section` field to determine which app to load

## Credentials
- Employee ID: `maharathy` | Password: `Charu@123@`

## DB Collections (Sales CRM)
- `leads` / `scraped_leads`: Lead records with enhanced fields (amount, probability, close_date, account_id, contact_ids, description, lead_source)
- `sales_accounts`: Company records (name, industry, phone, email, website, address, city, notes)
- `sales_contacts`: People records (name, title, phone, email, account_id, notes)
- `lead_stream`: Activity feed entries (lead_id, type, content, user_name, created_at)

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
- Last deployed: Mar 22, 2026
