# TGME ServiceBook - Product Requirements Document

## Live URL
- Website: https://thegoodmen.in
- AMC Plans: https://thegoodmen.in/amc
- ServiceBook: https://thegoodmen.in/workspace/login  
- Support Portal: https://support.thegoodmen.in
- Credentials: maharathy / Charu@123@

## Complete Workflow (Feb 2026)

### Scenario 1: Known Issue
Ticket → Create Task (Known Issue, Ticket ID mandatory) → Order Part from Supplier (WhatsApp with Ticket ID + Customer ID) → Part Received → Send Estimate to Customer (WhatsApp) → Estimate Approved → Assign to Engineer (WhatsApp) → Engineer Visits → Start Job → Complete Work + Entry + Signature → End Job → Back Office Reviews → Generate Invoice (Invoice# + Serial#) → Billed

### Scenario 2: Diagnosis Required  
Ticket → Create Task (Diagnosis Required, Ticket ID mandatory) → Assign Engineer → Engineer Visits → Diagnoses Issue → Logs Findings + Notes + Signature → Marks "Pending for Part" → Back Office Orders Part (WhatsApp with Ticket ID + Customer ID) → Part Received → Send Estimate → Estimate Approved → Reassign → Engineer Visits → Completes → Invoice → Billed

### Task Statuses
new → part_ordered → part_received → estimate_sent → estimate_approved → assigned → in_progress → pending_for_part (loops) → completed → billed

### Auto Job ID: JOB-YYYY-NNN format

## Modules Built
1. **Dashboard** - Workflow stats (New, Pending Parts, Awaiting Estimate, Ready to Assign, etc.)
2. **Jobs/Tasks** - Create with type selection (Known Issue / Diagnosis Required), mandatory Ticket ID, filter tabs, click-through to workflow detail
3. **Task Workflow Detail** - Step-by-step actions: Order Part, Mark Received, Send Estimate, Approve Estimate, Assign Engineer, Bill Task. Full timeline audit trail. Ticket ID displayed in header.
4. **Clients** - CRUD + multi-location + contacts + WhatsApp + bulk upload
5. **Employees** - CRUD + roles + bulk upload
6. **Suppliers** - CRUD + WhatsApp ordering
7. **Parts & Materials** - CRUD + stock tracking + bulk upload
8. **Part Orders** - Linked to tasks, supplier selection, WhatsApp (uses Ticket ID + Customer ID), mark received
9. **Service Entries** - Engineer completion forms + billing status
10. **Parts Requests** - Field requests with Company, Location, Device Details (Name/Model/Serial), optional User Name + approve/reject
11. **Expenses** - Submit + approve
12. **Field Engineer PWA** - My Tasks → Field Task Detail (Start Task → Complete + Photo + Signature + GPS + Parts Used). Role-based routing.
13. **AMC Plans Page** - Public-facing page with 4 plans (Silver ₹2,500, Gold ₹3,000, Platinum ₹4,000, Diamond ₹6,500). Form captures company details + device inventory. Submits to osTicket (support.thegoodmen.in) as "AMC Request" ticket.

## 3rd Party Integrations
- **osTicket** - Ticket creation via REST API (X-API-Key: 0D5F5BDE6501B6BB9A6567683D40357D, whitelisted for IP 65.20.81.4)
- **Cloudflare** - DNS and SSL proxy
- **WhatsApp** - Manual wa.me links for supplier/engineer messaging

## Bug Fixes Completed (Mar 2026)
- P0: Fixed broken field engineer panel - restored role-based navigation
- P1: Fixed WhatsApp messages for part orders - now use Ticket ID and Customer ID
- P1: Made Ticket ID mandatory in task creation
- P1: Fixed Start Task button - was calling non-existent API, now uses changeTaskStatus
- Enhancement: Request Parts page - added Company/Location (mandatory), Device Details (3 separate fields), User Name (optional)

## Pending/Upcoming
- P2: Pending Billing feature - auto-list completed jobs, generate invoices, mark as billed
- P3: Contact form backend to save leads
- P3: Content population (About, How We Work, Case Studies)
- P4: Smart IT Setup Wizard
- P4: Interactive tools (Infrastructure Planner, Network Visualizer)
