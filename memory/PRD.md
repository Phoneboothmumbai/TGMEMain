# The Good Men Enterprise (TGME) — Product Requirements Document

## Original Problem Statement
Build a comprehensive MSP platform for TGME — an IT support company in Mumbai. Includes marketing website, Knowledge Base, ServiceBook (field service app), Support Forms, Digital Business Card, Lead Generation/Sales CRM, and Client Portal.

## Core Architecture
- **Frontend**: React + Tailwind + Shadcn UI
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB (DB_NAME: test_database on preview, tgme_database on prod)
- **All workspace routes share a single DB connection** injected via `set_workspace_db(db)` from server.py

## What's Been Implemented

### Marketing Website & SEO — COMPLETE
### Knowledge Base — COMPLETE
### ServiceBook (Field Service App) — COMPLETE
### Support Forms & osTicket Integration — COMPLETE
### Digital Business Card — COMPLETE
### Blog — COMPLETE (hidden pending approval)

### Lead Generation & Sales CRM — COMPLETE (Mar 22, 2026)
- Separated Sales CRM from ServiceBook with app selector on login
- **Accounts**: CRUD for companies (name, industry, phone, email, website, address, city)
- **Contacts**: CRUD linked to accounts (name, title, phone, email)
- **Leads**: Full list with search/filter, **manual create** (+ Create Lead button), click navigates to detail
- **Lead Detail (EspoCRM-style)**: Full-page with fields, Stream (comments + auto status logs), right sidebar (Stage, Assigned User, Priority, Quick Actions)
- **Pipeline**: Kanban board with Amount display
- **Lead Scraper**: DuckDuckGo-based (production only)
- **Visitor Analytics**: Tracks public page visits
- **Manual Lead Creation**: POST /api/leads/manual/create with full fields

## Auth & Access
- `apps_access` array: `["servicebook", "sales", "admin"]`
- Login `section` field determines app

## Credentials
- Employee ID: `maharathy` | Password: `Charu@123@`

## DB Collections (Sales CRM)
- `leads` / `scraped_leads`: Lead records
- `sales_accounts`: Company records
- `sales_contacts`: People records
- `lead_stream`: Activity feed entries

## Upcoming Tasks (P1)
- Phase 4: Bulk Deployment Projects
- Bulk Employee & Asset Assignment (CSV upload)

## Future/Backlog
- IT Health Check tool, Reports Dashboard, Billing/Invoicing, Razorpay, Un-hide AI Blog, Live chat widget

## Deployment
- Production: Vultr 65.20.81.4 — Last deployed: Mar 22, 2026
