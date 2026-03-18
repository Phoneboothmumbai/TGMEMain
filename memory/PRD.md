# The Good Men Enterprise (TGME) — Product Requirements Document

## Original Problem Statement
Build a comprehensive MSP platform for TGME — an IT support company in Mumbai providing AMC, sales, support, repair, warranty claims, email/domain services, and complete IT infrastructure management for businesses.

## What's Been Implemented

### 1. SEO Landing Pages (13 pages) — COMPLETE
### 2. Asset Management — COMPLETE
- Dynamic device-specific forms (22 types: CCTV, Router, Laptop, Server, Switch, Printer, etc.)
- Bulk CSV upload with downloadable templates per type
- QR code generation, accessory grouping
- Asset reassignment history — when employee changes, old assignment logged with dates
- Status change history — tracks every status change with timestamps
- **Detailed service history endpoint** — GET /api/workspace/assets/{id}/service-history returns tasks, service entries, AMC contracts, assignment/status history

### 3. AMC Contract Management — COMPLETE (Enhanced)
- Full CRUD for AMC contracts per client
- Fields: contract name, start/end dates, coverage type, amount, billing cycle, devices covered, visit frequency, includes parts/on-site
- **Number of Visits field** — tracks total visits in contract
- **Asset Linking** — link specific assets from the asset register to an AMC contract via a searchable checkbox list
- Stats dashboard: total, active, expiring/expired, pending renewal, annual revenue
- Table shows: Visits count and Linked Assets count columns

### 4. License & Subscription Management — COMPLETE
- Full CRUD for licenses and subscriptions
- Supports: GWS, Microsoft 365, Titan, antivirus, OS, backup, remote access, accounting, domains

### 5. Client Portal — COMPLETE (NEW - Phase 3)
- **Separate auth system** for clients (client_portal_users collection)
- **Admin management**: Portal Users page in ServiceBook to create/delete portal users per client
- **Portal Login** at /portal/login with email/password
- **Portal Dashboard**: Asset counts, AMC info, recent tickets
- **Our Assets**: Searchable table with click-to-expand detail showing service history and AMC coverage
- **Our Contacts**: List of company contacts on file
- **AMC Contracts**: View active AMC contracts with visit/frequency details
- **Support Tickets**: View all service tickets with status tracking
- **Raise Ticket**: Submit support tickets with optional asset selection, integrated with osTicket API

## Key Files
- `/app/backend/asset_routes.py` — Asset CRUD, bulk upload, QR, history, **service-history endpoint**
- `/app/backend/subscription_routes.py` — AMC + License CRUD (with number_of_visits)
- `/app/backend/client_portal_routes.py` — **NEW**: Portal auth, user management, data access, ticket creation
- `/app/backend/server.py` — Registers all routers including client_portal_router
- `/app/frontend/src/pages/workspace/AssetsPage.jsx` — Asset management UI
- `/app/frontend/src/pages/workspace/AMCManagementPage.jsx` — AMC contracts UI (enhanced)
- `/app/frontend/src/pages/workspace/LicensesPage.jsx` — Licenses UI
- `/app/frontend/src/pages/workspace/PortalUsersPage.jsx` — **NEW**: Admin page for portal users
- `/app/frontend/src/pages/portal/*` — **NEW**: 8 portal pages (login, layout, dashboard, assets, contacts, AMCs, tickets, raise-ticket)
- `/app/frontend/src/contexts/PortalAuthContext.jsx` — **NEW**: Portal auth + API helper
- `/app/frontend/src/data/assetTypeConfigs.js` — 22 device type configs

## Upcoming — MSP Platform Roadmap

### Phase 4 — Bulk Operations (P1)
- Bulk Deployment Projects (new office setup tracking)
- Bulk Employee Upload (CSV)
- Bulk Asset Assignment (CSV mapping employees ↔ assets)

### Phase 5 — Lead Management (P2)
- Lead Dashboard in ServiceBook to view/manage leads from landing pages
- IT Health Check interactive tool as lead magnet

### Phase 6 — Reports & Advanced (P3)
- Reports Dashboard (asset health, warranty expiring, AMC renewals, revenue per client)
- SLA Tracking, Vendor Management, Remote Access Links, Asset Audit Trail
- Un-hide AI Blog
- Pending Billing / Invoice generation
- Razorpay payment gateway
- Live chat widget
