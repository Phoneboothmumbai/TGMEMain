# The Good Men Enterprise (TGME) — Product Requirements Document

## Original Problem Statement
Build a comprehensive MSP platform for TGME — an IT support company in Mumbai. Includes marketing website, Knowledge Base, ServiceBook, Support Forms, Digital Business Card, Lead Generation/Sales CRM, Client Portal, and Admin Command Centre.

## Core Architecture
- **Frontend**: React + Tailwind + Shadcn UI
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB (test_database on preview, tgme_database on prod)
- **All workspace routes share a single DB connection** via `set_workspace_db(db)` from server.py

## What's Been Implemented

### Marketing Website & SEO — COMPLETE
### Knowledge Base — COMPLETE
### ServiceBook (Field Service App) — COMPLETE
### Support Forms & osTicket Integration — COMPLETE
### Digital Business Card — COMPLETE
### Blog — COMPLETE (hidden pending approval)

### Lead Generation & Sales CRM — COMPLETE
- Accounts, Contacts, Leads (manual create + scraper), Pipeline, Visitor Analytics
- EspoCRM-style Lead Detail with Stream/Activity feed
- Lead Scraper (DuckDuckGo, production only)

### Admin Command Centre — COMPLETE (Mar 22, 2026)
- **Login**: 3 app options — ServiceBook, Sales CRM, Admin Centre
- **Dashboard**: Quick links to Employee Management, Open ServiceBook, Open Sales CRM
- **Employee Management**: Full CRUD with:
  - Basic Info: Employee ID, Name, Phone, Email, Role, Password, Active status
  - **App Access**: Toggle ServiceBook, Sales CRM, Admin Centre per employee
  - **Feature Permissions Matrix**: Per-feature View/Create/Edit/Delete checkboxes
    - ServiceBook: Clients, Tasks, Assets, AMCs, Licenses, Parts, Billing, Suppliers
    - Sales CRM: Leads, Accounts, Contacts, Pipeline, Scraper, Visitors
  - Full Access / None quick-set buttons per app

## Auth & Access
- `apps_access`: array of app IDs employee can access
- `permissions`: nested dict `{app: {feature: {action: bool}}}`
- Login `section` field determines which app to load

## Credentials
- Employee ID: `maharathy` | Password: `Charu@123@`

## DB Collections
- `workspace_employees`: Employee records with apps_access and permissions
- `workspace_sessions`: Active login sessions
- `leads` / `scraped_leads`: Lead records
- `sales_accounts` / `sales_contacts`: CRM records
- `lead_stream`: Activity feed entries

## Upcoming Tasks (P1)
- Phase 4: Bulk Deployment Projects
- Bulk Employee & Asset Assignment (CSV upload)

## Future/Backlog
- IT Health Check tool, Reports Dashboard, Billing/Invoicing, Razorpay, Un-hide AI Blog, Live chat widget
- Backend permission enforcement middleware
- Frontend permission-based feature hiding

## Deployment
- Production: Vultr 65.20.81.4 — Last deployed: Mar 22, 2026
