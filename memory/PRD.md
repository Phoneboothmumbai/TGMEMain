# TGME ServiceBook - Product Requirements Document

## Live URL
- Website: https://thegoodmen.in
- ServiceBook: https://thegoodmen.in/workspace/login  
- Credentials: maharathy / Charu@123@

## Complete Workflow (Feb 2026)

### Scenario 1: Known Issue
Ticket → Create Task (Known Issue) → Order Part from Supplier (WhatsApp) → Part Received → Send Estimate to Customer (WhatsApp) → Estimate Approved → Assign to Engineer (WhatsApp) → Engineer Visits → Start Job → Complete Work + Entry + Signature → End Job → Back Office Reviews → Generate Invoice (Invoice# + Serial#) → Billed

### Scenario 2: Diagnosis Required  
Ticket → Create Task (Diagnosis Required) → Assign Engineer → Engineer Visits → Diagnoses Issue → Logs Findings + Notes + Signature → Marks "Pending for Part" → Back Office Orders Part (WhatsApp) → Part Received → Send Estimate → Estimate Approved → Reassign → Engineer Visits → Completes → Invoice → Billed

### Task Statuses
new → part_ordered → part_received → estimate_sent → estimate_approved → assigned → in_progress → pending_for_part (loops) → completed → billed

### Auto Job ID: JOB-YYYY-NNN format

## Modules Built
1. **Dashboard** - Workflow stats (New, Pending Parts, Awaiting Estimate, Ready to Assign, etc.)
2. **Jobs/Tasks** - Create with type selection (Known Issue / Diagnosis Required), filter tabs, click-through to workflow detail
3. **Task Workflow Detail** - Step-by-step actions: Order Part, Mark Received, Send Estimate, Approve Estimate, Assign Engineer, Bill Task. Full timeline audit trail
4. **Clients** - CRUD + multi-location + contacts + WhatsApp + bulk upload
5. **Employees** - CRUD + roles + bulk upload
6. **Suppliers** - CRUD + WhatsApp ordering
7. **Parts & Materials** - CRUD + stock tracking + bulk upload
8. **Part Orders** - Linked to tasks, supplier selection, WhatsApp, mark received
9. **Service Entries** - Engineer completion forms + billing status
10. **Parts Requests** - Field requests + approve/reject
11. **Expenses** - Submit + approve
12. **Field Engineer PWA** - My Tasks, Task Detail, Photo, Signature, GPS, Parts Used

## Pending/Upcoming
- P2: Kanban board view for tasks
- P2: Service Report PDF generator
- P3: Contact form backend
- P3: Content population (About, Case Studies)
- P4: Interactive tools
