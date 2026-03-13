# TGME - The Good Men Enterprise - Product Requirements Document

## Original Problem Statement
Build a comprehensive website for "The Good Men Enterprise (TGME)" technology solutions company, including:
1. A professional marketing website (Landing page, 7+ service pages)
2. A Knowledge Base with CMS backend
3. A "ServiceBook" application for managing field service operations

## Core Architecture
- **Frontend**: React + React Router + TailwindCSS + Shadcn UI
- **Backend**: FastAPI + Pydantic + Motor (async MongoDB driver)
- **Database**: MongoDB
- **Deployment**: Manual to Vultr VPS (Nginx + PM2 + Python venv)

## What's Been Implemented

### Phase 1: Marketing Website (COMPLETED)
- Landing page with hero, services, contact sections
- Service pages: Cybersecurity, Email Solutions, Hardware Repair, Device Lifecycle
- About, How We Work, Case Studies pages
- Header with two-column Solutions dropdown
- Responsive design

### Phase 2: Knowledge Base + CMS (COMPLETED)
- Public KB with categories, articles, search
- Admin CMS at /kb/admin with full CRUD
- Article editor, category management
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

## Key Routes
- Marketing: `/`, `/about`, `/services/*`, `/kb`
- KB Admin: `/kb/admin/*`
- ServiceBook: `/workspace/login`, `/workspace/servicebook/*`

## API Endpoints
- `/api/kb/*` - Knowledge Base
- `/api/workspace/*` - ServiceBook (auth, employees, clients, locations, contacts, parts, tasks, service-entries, billing, parts-requests, expenses, dashboard)

## Database Collections
- `workspace_employees`, `workspace_clients`, `workspace_client_locations`
- `workspace_client_contacts`, `workspace_parts`, `workspace_tasks`
- `workspace_service_entries`, `workspace_parts_requests`, `workspace_expenses`
- `workspace_sessions`

## Credentials
- KB Admin: testadmin / testpass123
- ServiceBook: ADMIN001 / admin123

## Pending/Upcoming Tasks (Prioritized)

### P1 - Task Management Enhancements
- Task detail view with full history
- Bulk task assignment
- Task templates for recurring service types

### P1 - Pending Billing Enhancements
- Billing summary/report generation
- Export to CSV/PDF

### P2 - Field Engineer Mobile Interface (PWA)
- Mobile-friendly interface for field engineers
- Photo capture, digital signatures, GPS tracking
- Parts usage logging from the field
- Offline support

### P3 - Contact Form Backend
- Save website contact form leads to database
- Email notification on new leads

### P3 - SSL Certificate
- Let's Encrypt on Vultr server for full HTTPS

### P3 - Content Population
- About TGME, How We Work, Case Studies with real content

### P4 - Interactive Tools
- Smart IT Setup Wizard
- Infrastructure Planner, Network Visualizer
