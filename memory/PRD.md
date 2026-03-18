# The Good Men Enterprise (TGME) — Product Requirements Document

## Original Problem Statement
Build a comprehensive MSP (Managed Service Provider) digital platform for The Good Men Enterprise (TGME). The platform includes a marketing website, knowledge base, ServiceBook field service app, dynamic AMC pricing, multi-step support form integrated with osTicket, AI-driven blog, SEO + lead generation funnel, and a complete IT asset management system.

## Business Model
TGME is an MSP providing:
- AMC (Annual Maintenance Contracts) for clients
- Sales & support with/without AMC
- One-time chargeable support
- Device repair services
- Warranty claim assistance for sold devices
- Email services (GWS, Microsoft 365, Titan)
- Domain registration and management
- Complete IT infrastructure management

## What's Been Implemented

### Asset Management Module — Phase 1 (COMPLETE)
- **Dynamic Device Forms**: 22 device types with type-specific configuration fields
  - Laptop: Processor, RAM, Storage, OS, Screen Size, Battery Health
  - CCTV: Camera Type, Resolution, Night Vision, Placement, PoE, IP, Storage Device, Position
  - Router: WAN/LAN Ports, WiFi Standard, Throughput, VPN, IP, ISP
  - Printer: Type, Color, Connectivity, Duplex, Scanner, Paper Size, Toner, IP
  - Server: Processor, RAM, Storage, RAID, OS, Rack Unit, IP, Roles, Remote Access
  - Switch: Ports, Type, Speed, PoE, Budget, SFP, IP
  - Firewall: Throughput, VPN Tunnels, Users, UTM, Ports, IP, License Expiry
  - UPS: KVA, Phase, Type, Battery, Backup Time
  - NVR/DVR: Type, Channels, Storage, Cameras, PoE, IP, Remote Access
  - Access Point: WiFi Standard, Max Clients, PoE, Placement, IP, SSIDs
  - And 12 more types (monitor, NAS, phone, tablet, scanner, projector, webcam, headset, keyboard, mouse, other)
- **Bulk CSV Upload**: Upload dialog with downloadable templates per device type, CSV parsing, spec extraction
- **Service History**: Displayed in expanded asset detail view with repair info, parts used, technician
- **QR Code Generation**: Per-asset with download
- **Accessory Grouping**: Keyboard/mouse/webcam linked to parent assets
- **Data Isolation**: Per-client filtering
- **Testing**: 100% pass rate (36/36 backend, all frontend verified)

### SEO Landing Pages (COMPLETE)
- 13 hyper-targeted pages (8 service + 4 location + 1 Apple bulk pricing)

### Previous Features (COMPLETE)
- Marketing website, Knowledge Base, ServiceBook, AMC Page, Support Form
- AI Blog (hidden), SEO implementation, Lead generation funnel, WhatsApp widget

## Upcoming — MSP Platform Roadmap

### Phase 2 — AMC, Licenses & Subscriptions (NEXT)
- AMC Management per client (start/end, coverage, renewals, linked assets)
- License & Subscription Tracker (GWS, M365, Titan, antivirus — perpetual/subscription/one-time)
- Domain Management (registrar, expiry, DNS)
- Warranty Tracker per asset (expiry alerts, claim history)

### Phase 3 — Client Portal
- Client login (separate from employee login)
- Client dashboard (employees, devices, device details)
- Raise ticket from portal (select device → osTicket)
- View service history

### Phase 4 — Projects & Reporting
- Bulk Deployment Projects (new office setup, track deployment)
- Bulk Employee Upload (CSV)
- Bulk Asset Assignment (CSV mapping employees ↔ assets)
- Reports Dashboard (asset health, warranty, AMC renewals, revenue)

### Phase 5 — Advanced MSP Features
- SLA Tracking (response & resolution time)
- Vendor Management (purchase history)
- Remote Access Links (AnyDesk/TeamViewer IDs per device)
- Asset Audit Trail (change log)
- Recurring Billing (auto-generate invoices)
- Knowledge Base per Client (network diagrams, passwords vault)

## Key Files
- `/app/backend/asset_routes.py` — Asset CRUD, bulk upload, QR, stats
- `/app/frontend/src/pages/workspace/AssetsPage.jsx` — Asset management UI
- `/app/frontend/src/data/assetTypeConfigs.js` — 22 device type configurations
