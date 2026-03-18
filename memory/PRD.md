# The Good Men Enterprise (TGME) — Product Requirements Document

## Original Problem Statement
Build a comprehensive digital platform for The Good Men Enterprise (TGME), an IT support company based in Mumbai. The platform includes a marketing website, knowledge base, ServiceBook field service app, dynamic AMC pricing, multi-step support form integrated with osTicket, AI-driven blog, SEO + lead generation funnel, and IT asset management.

## User Personas
- **Business Owners/IT Managers**: Looking for IT support services in Mumbai
- **TGME Admin/Staff**: Managing service entries, clients, employees, parts, billing, assets
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
9. **Asset Management module** for tracking client IT assets
10. IT Health Check interactive tool (upcoming)
11. Lead Dashboard in ServiceBook (upcoming)

## Architecture
- **Frontend**: React (CRA) with Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Integrations**: osTicket, DeepSeek (blog), OpenAI GPT Image 1 (blog images), WhatsApp
- **Deployment**: Vultr server (manual scp/ssh)

## What's Been Implemented

### Marketing Website (COMPLETE)
### Knowledge Base (COMPLETE)
### ServiceBook (COMPLETE)
### AMC Page (COMPLETE)
### Support Form (COMPLETE)
### AI Blog (COMPLETE — HIDDEN)
### SEO Implementation (COMPLETE)
### Lead Generation Funnel — Phase 2 (COMPLETE)
- 13 SEO landing pages (8 service + 4 location + 1 Apple bulk)
- WhatsApp widget on all pages
- Lead capture forms → osTicket

### Asset Management Module (COMPLETE — NEW)
- **Asset register**: Full CRUD with auto-generated asset tags (TGME-AST-XXXX)
- **Asset types**: Laptop, desktop, monitor, printer, server, UPS, router, switch, access point, firewall, keyboard, mouse, webcam, headset, phone, tablet, scanner, projector, NAS, other
- **Asset statuses**: Active, In Repair, In Stock, Retired, Lost, Disposed
- **Client assignment**: Assets linked to clients, filterable per client
- **Location tracking**: Assets assigned to client locations
- **Employee assignment**: Track who is using each asset
- **Lifecycle tracking**: Purchase date, warranty expiry, AMC linkage
- **QR code generation**: Unique QR per asset with download option
- **Accessory grouping**: Keyboard/mouse/webcam linked to parent asset via parent_asset_id
- **Stats dashboard**: Total, active, in repair, in stock, retired/lost, warranty expiring
- **Filters**: By client, type, status, and text search
- **Data isolation**: Enforced via client_id on all queries
- **Backend**: /app/backend/asset_routes.py with 8 API endpoints
- **Frontend**: /app/frontend/src/pages/workspace/AssetsPage.jsx
- **Testing**: 100% pass rate (22/22 backend, all frontend flows)
- **Production**: Deployed to thegoodmen.in

## P0/P1/P2 Features Remaining

### P1 — IT Health Check Tool
Interactive assessment tool as lead magnet on landing pages.

### P2 — Lead Dashboard in ServiceBook
Internal dashboard for viewing/managing captured leads.

### P2 — Un-hide AI Blog
Re-add blog navigation when user approves.

### P3 — Pending Billing & Invoices
### P3 — Client Portal
### P3 — Payment Gateway (Razorpay)
### P4 — Live Chat Widget
### P4 — Static Pages Content

## Key API Endpoints — Asset Management
- `POST /api/workspace/assets` — Create asset
- `GET /api/workspace/assets` — List with filters
- `GET /api/workspace/assets/{id}` — Detail with accessories
- `PUT /api/workspace/assets/{id}` — Update
- `DELETE /api/workspace/assets/{id}` — Delete + cascade accessories
- `GET /api/workspace/assets/{id}/qr` — QR code
- `GET /api/workspace/assets/stats` — Dashboard stats
- `GET /api/workspace/assets/clients-summary` — Per-client summary
