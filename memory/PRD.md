# The Good Men Enterprise (TGME) — Product Requirements Document

## Original Problem Statement
Build a comprehensive MSP platform for TGME — an IT support company in Mumbai providing AMC, sales, support, repair, warranty claims, email/domain services, and complete IT infrastructure management for businesses.

## What's Been Implemented (This Session)

### 1. SEO Landing Pages (13 pages) — COMPLETE
### 2. Asset Management — COMPLETE
- Dynamic device-specific forms (22 types: CCTV, Router, Laptop, Server, Switch, Printer, etc.)
- Bulk CSV upload with downloadable templates per type
- QR code generation, accessory grouping
- **Asset reassignment history** — when employee changes, old assignment logged with dates
- **Status change history** — tracks every status change with timestamps
- Service history display in expanded view

### 3. AMC Contract Management — COMPLETE
- Full CRUD for AMC contracts per client
- Fields: contract name, start/end dates, coverage type (comprehensive/non-comprehensive/labor only), amount, billing cycle, devices covered, visit frequency, includes parts/on-site
- Stats dashboard: total, active, expiring/expired, pending renewal, annual revenue
- Filter by client and status

### 4. License & Subscription Management — COMPLETE
- Full CRUD for licenses and subscriptions
- Supports: GWS, Microsoft 365, Titan, antivirus, OS, backup, remote access, accounting, domains
- License types: Subscription (monthly/yearly/multi-year), Perpetual, One-time, Trial, Open Source
- Tracks: seats (used/total), license keys, expiry dates, costs, billing cycles, auto-renew
- Categories: Email & Productivity, Security, OS, Backup, Productivity, Domain & Hosting, Remote Access, Accounting
- Stats: total, active, expiring, seats used/total, annual cost

## Key Files
- `/app/backend/asset_routes.py` — Asset CRUD, bulk upload, QR, history
- `/app/backend/subscription_routes.py` — AMC + License CRUD
- `/app/frontend/src/pages/workspace/AssetsPage.jsx` — Asset management UI
- `/app/frontend/src/pages/workspace/AMCManagementPage.jsx` — AMC contracts UI
- `/app/frontend/src/pages/workspace/LicensesPage.jsx` — Licenses UI
- `/app/frontend/src/data/assetTypeConfigs.js` — 22 device type configs

## Upcoming — MSP Platform Roadmap

### Phase 3 — Client Portal (NEXT)
- Client login (separate auth)
- Dashboard: see employees, assigned devices, device details
- Raise ticket → osTicket (select device, describe issue)
- View service history per device

### Phase 4 — Projects & Bulk Operations
- Bulk Deployment Projects (new office setup tracking)
- Bulk Employee Upload (CSV)
- Bulk Asset Assignment (CSV mapping employees ↔ assets)

### Phase 5 — Reports & Advanced
- Reports Dashboard (asset health, warranty expiring, AMC renewals, revenue per client)
- SLA Tracking, Vendor Management, Remote Access Links, Asset Audit Trail, Recurring Billing
