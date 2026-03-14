# TGME ServiceBook - Product Requirements Document

## Live URL
- Website: https://thegoodmen.in
- AMC Plans: https://thegoodmen.in/amc
- ServiceBook: https://thegoodmen.in/workspace/login  
- Support Portal: https://support.thegoodmen.in
- Credentials: maharathy / Charu@123@

## AMC Plans — Device-Specific Pricing (Mar 2026)

### Desktop/Laptop Plans (shown on main page)
| Plan | Price/device/yr | Key Feature |
|------|----------------|-------------|
| Silver | ₹2,500 | 48hr response, 2 visits/yr, business-hr support |
| Gold | ₹3,000 | 24hr response, 4 visits/yr, extended-hr support |
| Platinum | ₹4,000 | 8hr response, 6 visits/yr, parts at cost |
| Diamond | ₹6,500 | 4hr priority, unlimited visits, parts included |

### Other Device Pricing (shown in "We Also Cover")
| Device | Price/yr |
|--------|---------|
| Laser Printer | ₹1,500 |
| Heavy Duty / Network Printer | ₹3,000 |
| Router / Switch | ₹1,000 |
| Managed Firewall | ₹4,000 |
| CCTV Camera | ₹600/camera |
| DVR / NVR | ₹2,500 |
| Desktop UPS | ₹500 |
| Server / Rack UPS | ₹5,000 |
| Servers | Custom Quote (never show public price) |

All non-comprehensive. Parts always billed separately.

## Complete Workflow

### Scenario 1: Known Issue
Ticket → Create Task (Known Issue, Ticket ID mandatory) → Order Part → Part Received → Send Estimate → Estimate Approved → Assign Engineer → Start Job → Complete → Invoice → Billed

### Scenario 2: Diagnosis Required
Ticket → Create Task (Diagnosis) → Assign Engineer → Diagnose → Log Findings → Pending Part → Order → Received → Estimate → Approve → Reassign → Complete → Invoice → Billed

### Task Statuses
new → part_ordered → part_received → estimate_sent → estimate_approved → assigned → in_progress → pending_for_part → completed → billed

## Modules Built
1. Dashboard, 2. Jobs/Tasks (mandatory Ticket ID), 3. Task Workflow Detail, 4. Clients, 5. Employees, 6. Suppliers, 7. Parts & Materials, 8. Part Orders (WhatsApp with Ticket ID + Customer ID), 9. Service Entries, 10. Parts Requests (with Company/Location/Device Details), 11. Expenses, 12. Field Engineer PWA, 13. AMC Plans Page (per-device-type pricing + osTicket integration)

## 3rd Party Integrations
- **osTicket** — REST API for AMC ticket creation (key whitelisted for IP 65.20.81.4)
- **Cloudflare** — DNS and SSL proxy
- **WhatsApp** — wa.me links for supplier/engineer messaging

## Pending/Upcoming
- P2: Pending Billing feature — auto-list completed jobs, generate invoices
- P3: Contact form backend to save leads
- P3: Content population (About, How We Work, Case Studies)
- P4: Smart IT Setup Wizard
- P4: Interactive tools (Infrastructure Planner, Network Visualizer)
