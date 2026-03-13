# TGME - The Good Men Enterprise - Product Requirements Document

## Original Problem Statement
Build a comprehensive website for "The Good Men Enterprise (TGME)" technology solutions company, including:
1. A professional marketing website (Landing page, 7+ service pages)
2. A Knowledge Base with CMS backend
3. A "ServiceBook" application for managing field service operations

## Live URL
- Website: https://thegoodmen.in
- ServiceBook Login: https://thegoodmen.in/workspace/login
- Credentials: ADMIN001 / admin123

## Core Architecture
- **Frontend**: React + React Router + TailwindCSS + Shadcn UI
- **Backend**: FastAPI + Pydantic + Motor (async MongoDB driver)
- **Database**: MongoDB
- **Deployment**: Vultr VPS (Ubuntu) + Nginx + PM2 + Let's Encrypt SSL
- **CDN/Proxy**: Cloudflare (should be set to "Full" SSL mode)

## What's Been Implemented

### Phase 1: Marketing Website (COMPLETED)
- Landing page with hero, services, contact sections
- Service pages: Cybersecurity, Email Solutions, Hardware Repair, Device Lifecycle
- About, How We Work, Case Studies pages
- Header with two-column Solutions dropdown + "Employee Login" link
- Responsive design

### Phase 2: Knowledge Base + CMS (COMPLETED)
- Public KB with categories, articles, search
- Admin CMS at /kb/admin with full CRUD
- Auth: testadmin / testpass123

### Phase 3: ServiceBook Admin Interface (COMPLETED - Feb 2026)
- **Login**: Employee-based auth at /workspace/login (ADMIN001 / admin123)
- **Dashboard**: Stats overview (clients, employees, tasks, billing, etc.)
- **Clients Management**: Full CRUD with multi-location and contacts support, WhatsApp links (wa.me/)
- **Employees Management**: CRUD with roles (admin, backoffice, engineer, delivery)
- **Parts & Materials**: CRUD with stock tracking, low-stock alerts, pricing
- **Tasks Management**: Create, assign, filter by status, change status inline
- **Service Entries**: List view with billing status
- **Pending Billing**: Track unbilled service entries, mark as billed
- **Parts Requests**: View/approve/reject field requests
- **Expenses**: View/approve employee expenses with pending total

### Phase 4: Field Engineer PWA (COMPLETED - Feb 2026)
- **My Tasks**: Mobile-friendly task list for assigned engineers
- **Task Detail**: Full task view with Start/Complete workflow
- **Service Entry Form**: Work description, issues found, remarks
- **Photo Capture**: Before/after photos via camera
- **Digital Signature**: Customer sign-off with signature pad
- **GPS Tracking**: Capture start/end GPS coordinates
- **Parts Used**: Select parts from inventory with quantities
- **My Expenses**: Submit travel/food/parts/misc expenses
- **Request Parts**: Submit parts requests from the field with urgency
- **PWA**: Service worker + manifest for installable app

### Phase 5: Deployment & SSL (COMPLETED - Feb 2026)
- Deployed to Vultr VPS at 65.20.81.4
- Let's Encrypt SSL certificate installed (auto-renewable)
- Nginx configured for both HTTP and HTTPS (Cloudflare compatible)
- "Employee Login" link added to homepage navigation

## Key Routes
- Marketing: `/`, `/about`, `/services/*`, `/kb`
- KB Admin: `/kb/admin/*`
- ServiceBook: `/workspace/login`, `/workspace/servicebook/*`

## API Endpoints
- `/api/kb/*` - Knowledge Base
- `/api/workspace/*` - ServiceBook (auth, employees, clients, locations, contacts, parts, tasks, service-entries, billing, parts-requests, expenses, dashboard)

## Credentials
- KB Admin: testadmin / testpass123
- ServiceBook Admin: ADMIN001 / admin123
- Vultr Server: root / iW)35P-m=2W9xQDQ (65.20.81.4)

## Pending/Upcoming Tasks

### P1 - Cloudflare SSL Mode
- Switch Cloudflare SSL from "Flexible" to "Full (Strict)" since origin server now has valid Let's Encrypt cert

### P2 - Task Management Enhancements
- Task detail view with full history
- Bulk task assignment
- Task templates for recurring service types

### P2 - Billing Enhancements
- Billing summary/report generation
- Export to CSV/PDF
- Service Report PDF generator for clients

### P3 - Contact Form Backend
- Save website contact form leads to database
- Email notification on new leads

### P3 - Content Population
- About TGME, How We Work, Case Studies with real content

### P4 - Interactive Tools
- Smart IT Setup Wizard
- Infrastructure Planner, Network Visualizer
