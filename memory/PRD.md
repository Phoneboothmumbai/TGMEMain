# TGME - The Good Men Enterprise - Product Requirements Document

## Original Problem Statement
Build a comprehensive website for "The Good Men Enterprise (TGME)" technology solutions company, including:
1. A professional marketing website (Landing page, 7+ service pages)
2. A Knowledge Base with CMS backend
3. A "ServiceBook" application for managing field service operations

## Live URL
- Website: https://thegoodmen.in
- ServiceBook Login: https://thegoodmen.in/workspace/login
- Credentials: maharathy / Charu@123@

## Core Architecture
- **Frontend**: React + React Router + TailwindCSS + Shadcn UI
- **Backend**: FastAPI + Pydantic + Motor (async MongoDB driver)
- **Database**: MongoDB
- **Deployment**: Vultr VPS (Ubuntu) + Nginx + PM2 + Let's Encrypt SSL
- **CDN/Proxy**: Cloudflare

## What's Been Implemented

### Phase 1: Marketing Website (COMPLETED)
- Landing page, service pages, KB, header with "Employee Login" link

### Phase 2: Knowledge Base + CMS (COMPLETED)
- Public KB + Admin CMS at /kb/admin (testadmin / testpass123)

### Phase 3: ServiceBook Admin Interface (COMPLETED)
- Dashboard, Clients (multi-location + contacts), Employees, Parts, Tasks, Service Entries, Billing, Parts Requests, Expenses
- **Bulk Upload** for Clients, Employees, Parts (CSV upload with template download)

### Phase 4: Field Engineer PWA (COMPLETED)
- My Tasks, Task Detail (start/complete), Service Entry Form, Photo Capture, Digital Signature, GPS Tracking, Parts Used, My Expenses, Request Parts, PWA manifest + service worker

### Phase 5: Deployment & SSL (COMPLETED)
- Deployed to Vultr, Let's Encrypt SSL, Nginx configured

### Bug Fixes (Feb 2026)
- Fixed sidebar/content alignment issue (flexbox layout)
- Fixed login uppercase conversion for employee IDs
- Fixed "body stream already read" auth error

## Pending/Upcoming Tasks

### P1 - Cloudflare SSL Mode
- Switch from "Flexible" to "Full (Strict)"

### P2 - Task Management Enhancements
- Task detail view with full history, bulk assignment, templates

### P2 - Billing Enhancements
- Reports, CSV/PDF export, Service Report PDF generator

### P3 - Contact Form Backend, Content Population

### P4 - Interactive Tools (IT Setup Wizard, etc.)
