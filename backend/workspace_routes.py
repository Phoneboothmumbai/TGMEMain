"""
TGME Workspace - ServiceBook API Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Optional
import hashlib
import secrets
import qrcode
import base64
from io import BytesIO

from workspace_models import (
    EmployeeCreate, EmployeeLogin, EmployeeResponse, EmployeeRole,
    ClientCreate, ClientResponse,
    ClientLocationCreate, ClientLocationResponse,
    ClientContactCreate, ClientContactResponse,
    PartCreate, PartResponse,
    TaskCreate, TaskUpdate, TaskResponse, TaskStatus, TaskPriority,
    ServiceEntryCreate, ServiceEntryResponse,
    PartsRequestCreate, PartsRequestResponse, PartsRequestStatus,
    ExpenseCreate, ExpenseResponse,
    BillingUpdate
)

router = APIRouter(prefix="/api/workspace", tags=["workspace"])

# Database reference - set by server.py via set_workspace_db()
db = None

def set_workspace_db(database):
    global db
    db = database

# Helper function
def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc

def hash_password(password: str) -> str:
    """Hash password with salt"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_qr_code(data: str) -> str:
    """Generate QR code as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode()

# ==================== AUTH ====================

@router.post("/auth/login")
async def employee_login(login_data: EmployeeLogin):
    """Employee login with section access"""
    import re
    employee = await db.workspace_employees.find_one({
        "employee_id": re.compile(f"^{re.escape(login_data.employee_id)}$", re.IGNORECASE),
        "is_active": True
    })
    
    if not employee:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if employee["password"] != hash_password(login_data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if employee has access to this section/app
    print(f"DEBUG LOGIN: section={login_data.section}, apps_access={employee.get('apps_access', [])}, check={login_data.section not in employee.get('apps_access', [])}")
    if login_data.section not in employee.get("apps_access", []):
        raise HTTPException(status_code=403, detail="Access denied to this section")
    
    # Generate session token
    token = secrets.token_urlsafe(32)
    
    # Store session
    await db.workspace_sessions.insert_one({
        "employee_id": employee["employee_id"],
        "token": token,
        "section": login_data.section,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc).replace(hour=23, minute=59, second=59)
    })
    
    return {
        "token": token,
        "employee": {
            "id": str(employee["_id"]),
            "employee_id": employee["employee_id"],
            "name": employee["name"],
            "role": employee["role"],
            "apps_access": employee.get("apps_access", []),
            "permissions": employee.get("permissions", {})
        },
        "section": login_data.section
    }

@router.get("/auth/verify")
async def verify_token(token: str):
    """Verify session token"""
    session = await db.workspace_sessions.find_one({
        "token": token,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    employee = await db.workspace_employees.find_one({
        "employee_id": session["employee_id"]
    })
    
    return {
        "valid": True,
        "employee": {
            "id": str(employee["_id"]),
            "employee_id": employee["employee_id"],
            "name": employee["name"],
            "role": employee["role"],
            "apps_access": employee.get("apps_access", []),
            "permissions": employee.get("permissions", {})
        },
        "section": session["section"]
    }

@router.post("/auth/logout")
async def employee_logout(token: str):
    """Logout and invalidate token"""
    await db.workspace_sessions.delete_one({"token": token})
    return {"message": "Logged out successfully"}

# ==================== EMPLOYEES ====================

@router.get("/admin/employees")
async def get_all_employees_admin():
    """Get all employees with full details for admin"""
    employees = await db.workspace_employees.find().to_list(1000)
    result = []
    for emp in employees:
        result.append({
            "id": str(emp["_id"]),
            "employee_id": emp.get("employee_id", ""),
            "name": emp.get("name", ""),
            "phone": emp.get("phone", ""),
            "email": emp.get("email", ""),
            "role": emp.get("role", "engineer"),
            "is_active": emp.get("is_active", True),
            "apps_access": emp.get("apps_access", []),
            "permissions": emp.get("permissions", {}),
            "created_at": emp.get("created_at", ""),
        })
    return result

@router.delete("/admin/employees/{employee_id}")
async def delete_employee(employee_id: str):
    """Deactivate an employee"""
    result = await db.workspace_employees.update_one(
        {"employee_id": employee_id},
        {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deactivated"}

@router.get("/employees", response_model=List[EmployeeResponse])
async def get_employees():
    """Get all employees"""
    employees = await db.workspace_employees.find({"is_active": True}).to_list(1000)
    return [serialize_doc(emp) for emp in employees]

@router.post("/employees", response_model=EmployeeResponse)
async def create_employee(employee: EmployeeCreate):
    """Create new employee"""
    # Check if employee_id already exists
    existing = await db.workspace_employees.find_one({"employee_id": employee.employee_id})
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    
    emp_dict = employee.model_dump()
    emp_dict["password"] = hash_password(employee.password)
    emp_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.workspace_employees.insert_one(emp_dict)
    emp_dict["id"] = str(result.inserted_id)
    del emp_dict["password"]
    return emp_dict

@router.get("/employees/{employee_id}")
async def get_employee(employee_id: str):
    """Get employee by ID"""
    employee = await db.workspace_employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return serialize_doc(employee)

@router.put("/employees/{employee_id}")
async def update_employee(employee_id: str, updates: dict):
    """Update employee"""
    if "password" in updates:
        updates["password"] = hash_password(updates["password"])
    
    result = await db.workspace_employees.update_one(
        {"employee_id": employee_id},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {"message": "Employee updated"}

# ==================== CLIENTS ====================

@router.get("/clients", response_model=List[ClientResponse])
async def get_clients():
    """Get all clients with location/contact counts"""
    clients = await db.workspace_clients.find({"is_active": True}).to_list(1000)
    result = []
    for client in clients:
        client_id = str(client["_id"])
        locations_count = await db.workspace_client_locations.count_documents({"client_id": client_id})
        contacts_count = await db.workspace_client_contacts.count_documents({"client_id": client_id})
        
        client_data = serialize_doc(client)
        client_data["locations_count"] = locations_count
        client_data["contacts_count"] = contacts_count
        result.append(client_data)
    
    return result

@router.post("/clients", response_model=ClientResponse)
async def create_client(client: ClientCreate):
    """Create new client with auto-generated QR code"""
    client_dict = client.model_dump()
    client_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.workspace_clients.insert_one(client_dict)
    client_id = str(result.inserted_id)
    
    # Generate QR code with client ID
    qr_data = f"TGME_CLIENT:{client_id}"
    qr_code = generate_qr_code(qr_data)
    
    # Update client with QR code
    await db.workspace_clients.update_one(
        {"_id": result.inserted_id},
        {"$set": {"qr_code": qr_code}}
    )
    
    client_dict["id"] = client_id
    client_dict["qr_code"] = qr_code
    client_dict["locations_count"] = 0
    client_dict["contacts_count"] = 0
    return client_dict

@router.get("/clients/{client_id}")
async def get_client(client_id: str):
    """Get client with all locations and contacts"""
    client = await db.workspace_clients.find_one({"_id": ObjectId(client_id)})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    locations = await db.workspace_client_locations.find({"client_id": client_id}).to_list(100)
    contacts = await db.workspace_client_contacts.find({"client_id": client_id}).to_list(100)
    
    client_data = serialize_doc(client)
    client_data["locations"] = [serialize_doc(loc) for loc in locations]
    client_data["contacts"] = [serialize_doc(con) for con in contacts]
    
    return client_data

@router.get("/clients/qr/{qr_data}")
async def get_client_by_qr(qr_data: str):
    """Get client by QR code data"""
    # QR data format: TGME_CLIENT:{client_id}
    if not qr_data.startswith("TGME_CLIENT:"):
        raise HTTPException(status_code=400, detail="Invalid QR code")
    
    client_id = qr_data.replace("TGME_CLIENT:", "")
    return await get_client(client_id)

# ==================== CLIENT LOCATIONS ====================

@router.get("/clients/{client_id}/locations")
async def get_client_locations(client_id: str):
    """Get all locations for a client"""
    locations = await db.workspace_client_locations.find({"client_id": client_id}).to_list(100)
    return [serialize_doc(loc) for loc in locations]

@router.post("/locations", response_model=ClientLocationResponse)
async def create_location(location: ClientLocationCreate):
    """Create new client location"""
    loc_dict = location.model_dump()
    loc_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.workspace_client_locations.insert_one(loc_dict)
    loc_dict["id"] = str(result.inserted_id)
    return loc_dict

@router.put("/locations/{location_id}")
async def update_location(location_id: str, updates: dict):
    """Update location"""
    result = await db.workspace_client_locations.update_one(
        {"_id": ObjectId(location_id)},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location updated"}

# ==================== CLIENT CONTACTS ====================

@router.get("/clients/{client_id}/contacts")
async def get_client_contacts(client_id: str):
    """Get all contacts for a client"""
    contacts = await db.workspace_client_contacts.find({"client_id": client_id}).to_list(100)
    return [serialize_doc(con) for con in contacts]

@router.post("/contacts", response_model=ClientContactResponse)
async def create_contact(contact: ClientContactCreate):
    """Create new client contact"""
    con_dict = contact.model_dump()
    con_dict["created_at"] = datetime.now(timezone.utc)
    
    # Set whatsapp to phone if not provided
    if not con_dict.get("whatsapp"):
        con_dict["whatsapp"] = con_dict["phone"]
    
    result = await db.workspace_client_contacts.insert_one(con_dict)
    con_dict["id"] = str(result.inserted_id)
    return con_dict

@router.put("/contacts/{contact_id}")
async def update_contact(contact_id: str, updates: dict):
    """Update contact"""
    result = await db.workspace_client_contacts.update_one(
        {"_id": ObjectId(contact_id)},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"message": "Contact updated"}

# ==================== PARTS ====================

@router.get("/parts", response_model=List[PartResponse])
async def get_parts():
    """Get all parts"""
    parts = await db.workspace_parts.find({"is_active": True}).to_list(1000)
    return [serialize_doc(part) for part in parts]

@router.post("/parts", response_model=PartResponse)
async def create_part(part: PartCreate):
    """Create new part"""
    part_dict = part.model_dump()
    part_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.workspace_parts.insert_one(part_dict)
    part_dict["id"] = str(result.inserted_id)
    return part_dict

@router.put("/parts/{part_id}")
async def update_part(part_id: str, updates: dict):
    """Update part"""
    result = await db.workspace_parts.update_one(
        {"_id": ObjectId(part_id)},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Part not found")
    return {"message": "Part updated"}

# ==================== BULK UPLOAD ====================

@router.post("/bulk/clients")
async def bulk_upload_clients(data: dict):
    """Bulk upload clients from CSV data. Expects {rows: [{company_name, gst_number, industry, notes}]}"""
    rows = data.get("rows", [])
    if not rows:
        raise HTTPException(status_code=400, detail="No data provided")
    
    created = 0
    skipped = 0
    errors = []
    
    for i, row in enumerate(rows):
        try:
            if not row.get("company_name"):
                errors.append(f"Row {i+1}: company_name is required")
                skipped += 1
                continue
            
            existing = await db.workspace_clients.find_one({"company_name": row["company_name"]})
            if existing:
                errors.append(f"Row {i+1}: '{row['company_name']}' already exists")
                skipped += 1
                continue
            
            client_dict = {
                "company_name": row["company_name"],
                "gst_number": row.get("gst_number", ""),
                "industry": row.get("industry", ""),
                "notes": row.get("notes", ""),
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }
            
            result = await db.workspace_clients.insert_one(client_dict)
            client_id = str(result.inserted_id)
            qr_code = generate_qr_code(f"TGME_CLIENT:{client_id}")
            await db.workspace_clients.update_one({"_id": result.inserted_id}, {"$set": {"qr_code": qr_code}})
            created += 1
        except Exception as e:
            errors.append(f"Row {i+1}: {str(e)}")
            skipped += 1
    
    return {"created": created, "skipped": skipped, "errors": errors}

@router.post("/bulk/employees")
async def bulk_upload_employees(data: dict):
    """Bulk upload employees. Expects {rows: [{employee_id, name, phone, email, role, password}]}"""
    rows = data.get("rows", [])
    if not rows:
        raise HTTPException(status_code=400, detail="No data provided")
    
    created = 0
    skipped = 0
    errors = []
    
    for i, row in enumerate(rows):
        try:
            if not row.get("employee_id") or not row.get("name"):
                errors.append(f"Row {i+1}: employee_id and name are required")
                skipped += 1
                continue
            
            existing = await db.workspace_employees.find_one({"employee_id": row["employee_id"]})
            if existing:
                errors.append(f"Row {i+1}: '{row['employee_id']}' already exists")
                skipped += 1
                continue
            
            emp_dict = {
                "employee_id": row["employee_id"],
                "name": row["name"],
                "phone": row.get("phone", ""),
                "email": row.get("email", ""),
                "role": row.get("role", "engineer"),
                "password": hash_password(row.get("password", "tgme123")),
                "is_active": True,
                "apps_access": ["servicebook", "sales"],
                "created_at": datetime.now(timezone.utc)
            }
            await db.workspace_employees.insert_one(emp_dict)
            created += 1
        except Exception as e:
            errors.append(f"Row {i+1}: {str(e)}")
            skipped += 1
    
    return {"created": created, "skipped": skipped, "errors": errors}

@router.post("/bulk/parts")
async def bulk_upload_parts(data: dict):
    """Bulk upload parts. Expects {rows: [{name, sku, category, unit, stock_qty, min_stock, price}]}"""
    rows = data.get("rows", [])
    if not rows:
        raise HTTPException(status_code=400, detail="No data provided")
    
    created = 0
    skipped = 0
    errors = []
    
    for i, row in enumerate(rows):
        try:
            if not row.get("name"):
                errors.append(f"Row {i+1}: name is required")
                skipped += 1
                continue
            
            existing = await db.workspace_parts.find_one({"name": row["name"]})
            if existing:
                errors.append(f"Row {i+1}: '{row['name']}' already exists")
                skipped += 1
                continue
            
            part_dict = {
                "name": row["name"],
                "sku": row.get("sku", ""),
                "category": row.get("category", ""),
                "unit": row.get("unit", "pcs"),
                "stock_qty": float(row.get("stock_qty", 0)),
                "min_stock": float(row.get("min_stock", 0)),
                "price": float(row.get("price", 0)),
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }
            await db.workspace_parts.insert_one(part_dict)
            created += 1
        except Exception as e:
            errors.append(f"Row {i+1}: {str(e)}")
            skipped += 1
    
    return {"created": created, "skipped": skipped, "errors": errors}

# ==================== SUPPLIERS ====================

@router.get("/suppliers")
async def get_suppliers():
    """Get all suppliers"""
    suppliers = await db.workspace_suppliers.find({"is_active": True}).sort("name", 1).to_list(1000)
    return [serialize_doc(s) for s in suppliers]

@router.post("/suppliers")
async def create_supplier(data: dict):
    """Create a supplier"""
    supplier = {
        "name": data["name"],
        "company": data.get("company", ""),
        "phone": data.get("phone", ""),
        "whatsapp": data.get("whatsapp", "") or data.get("phone", ""),
        "email": data.get("email", ""),
        "address": data.get("address", ""),
        "notes": data.get("notes", ""),
        "is_active": True,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.workspace_suppliers.insert_one(supplier)
    supplier["id"] = str(result.inserted_id)
    del supplier["_id"]
    return supplier

@router.put("/suppliers/{supplier_id}")
async def update_supplier(supplier_id: str, data: dict):
    data.pop("id", None)
    data.pop("_id", None)
    data["updated_at"] = datetime.now(timezone.utc)
    await db.workspace_suppliers.update_one({"_id": ObjectId(supplier_id)}, {"$set": data})
    return {"message": "Supplier updated"}

# ==================== AUTO JOB ID ====================

async def generate_job_id():
    """Generate auto-incrementing job ID like JOB-2026-001"""
    year = datetime.now().year
    prefix = f"JOB-{year}-"
    last = await db.workspace_tasks.find(
        {"job_id": {"$regex": f"^{prefix}"}}
    ).sort("job_id", -1).limit(1).to_list(1)
    if last:
        last_num = int(last[0]["job_id"].split("-")[-1])
        return f"{prefix}{str(last_num + 1).zfill(3)}"
    return f"{prefix}001"

# ==================== TASKS (Full Workflow) ====================

TASK_STATUSES = [
    "new", "part_ordered", "part_received", "estimate_sent",
    "estimate_approved", "assigned", "in_progress", "pending_for_part",
    "completed", "billed", "cancelled"
]

@router.get("/tasks")
async def get_tasks(status: Optional[str] = None, assigned_to: Optional[str] = None, task_type: Optional[str] = None):
    """Get all tasks with optional filters"""
    query = {}
    if status:
        if status == "pending_parts":
            query["status"] = {"$in": ["new", "part_ordered", "pending_for_part"]}
        elif status == "ready_to_assign":
            query["status"] = {"$in": ["part_received", "estimate_approved"]}
        else:
            query["status"] = status
    if assigned_to:
        query["assigned_to"] = assigned_to
    if task_type:
        query["task_type"] = task_type

    tasks = await db.workspace_tasks.find(query).sort("created_at", -1).to_list(1000)

    result = []
    for task in tasks:
        task_data = serialize_doc(task)

        if task_data.get("client_id") and ObjectId.is_valid(task_data["client_id"]):
            c = await db.workspace_clients.find_one({"_id": ObjectId(task_data["client_id"])})
            task_data["client_name"] = c["company_name"] if c else None

        if task_data.get("location_id") and ObjectId.is_valid(task_data["location_id"]):
            loc = await db.workspace_client_locations.find_one({"_id": ObjectId(task_data["location_id"])})
            task_data["location_name"] = loc["location_name"] if loc else None

        if task_data.get("assigned_to"):
            emp = await db.workspace_employees.find_one({"employee_id": task_data["assigned_to"]})
            task_data["assigned_to_name"] = emp["name"] if emp else None
            task_data["assigned_to_phone"] = emp.get("phone", "") if emp else None

        result.append(task_data)

    return result

@router.get("/tasks/my/{employee_id}")
async def get_my_tasks(employee_id: str):
    return await get_tasks(assigned_to=employee_id)

@router.get("/tasks/{task_id}")
async def get_task_detail(task_id: str):
    """Get single task with full details including part orders and timeline"""
    task = await db.workspace_tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task_data = serialize_doc(task)

    # Populate names
    if task_data.get("client_id") and ObjectId.is_valid(task_data["client_id"]):
        c = await db.workspace_clients.find_one({"_id": ObjectId(task_data["client_id"])})
        task_data["client_name"] = c["company_name"] if c else None
    if task_data.get("location_id") and ObjectId.is_valid(task_data["location_id"]):
        loc = await db.workspace_client_locations.find_one({"_id": ObjectId(task_data["location_id"])})
        task_data["location_name"] = loc["location_name"] if loc else None
        task_data["location_address"] = loc.get("address", "") if loc else None
        task_data["location_city"] = loc.get("city", "") if loc else None
    if task_data.get("assigned_to"):
        emp = await db.workspace_employees.find_one({"employee_id": task_data["assigned_to"]})
        task_data["assigned_to_name"] = emp["name"] if emp else None
        task_data["assigned_to_phone"] = emp.get("phone", "") if emp else None

    # Get part orders for this task
    part_orders = await db.workspace_part_orders.find({"task_id": task_id}).sort("created_at", -1).to_list(100)
    task_data["part_orders"] = [serialize_doc(po) for po in part_orders]

    # Get service entries for this task
    entries = await db.workspace_service_entries.find({"task_id": task_id}).sort("created_at", -1).to_list(100)
    task_data["service_entries"] = [serialize_doc(e) for e in entries]

    # Get client contacts for WhatsApp
    if task_data.get("client_id") and ObjectId.is_valid(task_data["client_id"]):
        contacts = await db.workspace_client_contacts.find({"client_id": task_data["client_id"]}).to_list(50)
        task_data["client_contacts"] = [serialize_doc(c) for c in contacts]

    return task_data

@router.post("/tasks")
async def create_task(data: dict):
    """Create new task with auto job ID"""
    # Validate ticket_id is provided
    ticket_id = data.get("ticket_id", "").strip()
    if not ticket_id:
        raise HTTPException(status_code=400, detail="Ticket ID is mandatory")

    job_id = await generate_job_id()

    task_dict = {
        "job_id": job_id,
        "ticket_id": ticket_id,
        "task_type": data.get("task_type", "known_issue"),
        "title": data["title"],
        "description": data.get("description", ""),
        "client_id": data["client_id"],
        "location_id": data["location_id"],
        "assigned_to": data.get("assigned_to", ""),
        "created_by": data.get("created_by", ""),
        "service_type": data.get("service_type", "service"),
        "priority": data.get("priority", "medium"),
        "due_date": data.get("due_date"),
        "status": "new",
        "required_parts": data.get("required_parts", []),
        "diagnosis_notes": "",
        "diagnosis_by": "",
        "estimate_parts_total": 0,
        "estimate_labor": 0,
        "estimate_total": 0,
        "estimate_sent_at": None,
        "estimate_approved": False,
        "invoice_number": "",
        "serial_number": "",
        "timeline": [{
            "action": "Task Created",
            "by": data.get("created_by", "System"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notes": f"Task type: {data.get('task_type', 'known_issue')}"
        }],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    # If diagnosis required and engineer assigned, auto-set to assigned
    if task_dict["task_type"] == "diagnosis_required" and task_dict["assigned_to"]:
        task_dict["status"] = "assigned"
        task_dict["timeline"].append({
            "action": "Assigned for Diagnosis",
            "by": data.get("created_by", "System"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notes": f"Assigned to {task_dict['assigned_to']}"
        })

    result = await db.workspace_tasks.insert_one(task_dict)
    task_dict["id"] = str(result.inserted_id)
    del task_dict["_id"]
    return task_dict

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, data: dict):
    """Update task fields"""
    data.pop("id", None)
    data.pop("_id", None)
    data["updated_at"] = datetime.now(timezone.utc)
    await db.workspace_tasks.update_one({"_id": ObjectId(task_id)}, {"$set": data})
    return {"message": "Task updated"}

@router.post("/tasks/{task_id}/status")
async def change_task_status(task_id: str, data: dict):
    """Change task status with timeline entry"""
    new_status = data["status"]
    by = data.get("by", "System")
    notes = data.get("notes", "")

    update = {
        "status": new_status,
        "updated_at": datetime.now(timezone.utc)
    }

    timeline_entry = {
        "action": f"Status changed to {new_status.replace('_', ' ').title()}",
        "by": by,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "notes": notes
    }

    if new_status == "assigned" and data.get("assigned_to"):
        update["assigned_to"] = data["assigned_to"]
        emp = await db.workspace_employees.find_one({"employee_id": data["assigned_to"]})
        timeline_entry["notes"] = f"Assigned to {emp['name'] if emp else data['assigned_to']}"

    if new_status == "in_progress":
        update["started_at"] = datetime.now(timezone.utc)
        if data.get("gps_lat"):
            update["start_gps_lat"] = data["gps_lat"]
            update["start_gps_lng"] = data["gps_lng"]

    if new_status == "completed":
        update["completed_at"] = datetime.now(timezone.utc)

    await db.workspace_tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update, "$push": {"timeline": timeline_entry}}
    )

    return {"message": f"Status changed to {new_status}"}

@router.post("/tasks/{task_id}/diagnosis")
async def submit_diagnosis(task_id: str, data: dict):
    """Engineer submits diagnosis - can mark pending for part"""
    needs_part = data.get("needs_part", False)
    new_status = "pending_for_part" if needs_part else "completed"

    timeline_entry = {
        "action": "Diagnosis Submitted",
        "by": data.get("by", ""),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "notes": data.get("diagnosis_notes", "")
    }

    update = {
        "diagnosis_notes": data.get("diagnosis_notes", ""),
        "diagnosis_by": data.get("by", ""),
        "diagnosis_date": datetime.now(timezone.utc),
        "status": new_status,
        "updated_at": datetime.now(timezone.utc)
    }

    if needs_part:
        update["required_parts"] = data.get("required_parts", [])
        timeline_entry["action"] = "Diagnosis: Pending for Part"

    await db.workspace_tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update, "$push": {"timeline": timeline_entry}}
    )

    return {"message": f"Diagnosis submitted. Status: {new_status}"}

@router.post("/tasks/{task_id}/estimate")
async def send_estimate(task_id: str, data: dict):
    """Send estimate to customer"""
    update = {
        "estimate_parts_total": data.get("parts_total", 0),
        "estimate_labor": data.get("labor", 0),
        "estimate_total": data.get("total", 0),
        "estimate_notes": data.get("notes", ""),
        "estimate_sent_at": datetime.now(timezone.utc),
        "status": "estimate_sent",
        "updated_at": datetime.now(timezone.utc)
    }

    timeline_entry = {
        "action": "Estimate Sent to Customer",
        "by": data.get("by", "System"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "notes": f"Total: ₹{data.get('total', 0)}"
    }

    await db.workspace_tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update, "$push": {"timeline": timeline_entry}}
    )
    return {"message": "Estimate sent"}

@router.post("/tasks/{task_id}/estimate-approve")
async def approve_estimate(task_id: str, data: dict):
    """Mark estimate as approved by customer"""
    update = {
        "estimate_approved": True,
        "estimate_approved_at": datetime.now(timezone.utc),
        "status": "estimate_approved",
        "updated_at": datetime.now(timezone.utc)
    }

    timeline_entry = {
        "action": "Estimate Approved by Customer",
        "by": data.get("by", "System"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "notes": data.get("notes", "Customer approved the estimate")
    }

    await db.workspace_tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update, "$push": {"timeline": timeline_entry}}
    )
    return {"message": "Estimate approved"}

@router.post("/tasks/{task_id}/assign")
async def assign_task(task_id: str, data: dict):
    """Assign/reassign task to an employee"""
    emp_id = data["assigned_to"]
    emp = await db.workspace_employees.find_one({"employee_id": emp_id})

    update = {
        "assigned_to": emp_id,
        "status": "assigned",
        "updated_at": datetime.now(timezone.utc)
    }

    timeline_entry = {
        "action": "Task Assigned",
        "by": data.get("by", "System"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "notes": f"Assigned to {emp['name'] if emp else emp_id}"
    }

    await db.workspace_tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update, "$push": {"timeline": timeline_entry}}
    )
    return {"message": "Task assigned", "assigned_to_name": emp["name"] if emp else emp_id, "assigned_to_phone": emp.get("phone", "") if emp else ""}

@router.post("/tasks/{task_id}/bill")
async def bill_task(task_id: str, data: dict):
    """Mark task as billed with invoice number and serial number"""
    update = {
        "invoice_number": data["invoice_number"],
        "serial_number": data.get("serial_number", ""),
        "status": "billed",
        "billed_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    timeline_entry = {
        "action": "Invoiced & Billed",
        "by": data.get("by", "System"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "notes": f"Invoice: {data['invoice_number']}, Serial: {data.get('serial_number', 'N/A')}"
    }

    await db.workspace_tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update, "$push": {"timeline": timeline_entry}}
    )

    # Also mark related service entries as billed
    await db.workspace_service_entries.update_many(
        {"task_id": task_id},
        {"$set": {"is_billed": True, "bill_number": data["invoice_number"], "billed_at": datetime.now(timezone.utc)}}
    )

    return {"message": "Task billed"}

# ==================== PART ORDERS ====================

@router.get("/part-orders")
async def get_part_orders(task_id: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if task_id:
        query["task_id"] = task_id
    if status:
        query["status"] = status
    orders = await db.workspace_part_orders.find(query).sort("created_at", -1).to_list(1000)
    return [serialize_doc(o) for o in orders]

@router.post("/part-orders")
async def create_part_order(data: dict):
    """Create part order for a task"""
    order = {
        "task_id": data["task_id"],
        "part_id": data.get("part_id", ""),
        "part_name": data["part_name"],
        "quantity": data.get("quantity", 1),
        "supplier_id": data.get("supplier_id", ""),
        "supplier_name": data.get("supplier_name", ""),
        "status": "ordered",
        "notes": data.get("notes", ""),
        "created_by": data.get("created_by", ""),
        "created_at": datetime.now(timezone.utc)
    }

    result = await db.workspace_part_orders.insert_one(order)
    order["id"] = str(result.inserted_id)
    del order["_id"]

    # Update task status and timeline
    timeline_entry = {
        "action": "Part Ordered",
        "by": data.get("created_by", "System"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "notes": f"{data['part_name']} x{data.get('quantity', 1)} from {data.get('supplier_name', 'N/A')}"
    }

    await db.workspace_tasks.update_one(
        {"_id": ObjectId(data["task_id"])},
        {"$set": {"status": "part_ordered", "updated_at": datetime.now(timezone.utc)},
         "$push": {"timeline": timeline_entry}}
    )

    return order

@router.post("/part-orders/{order_id}/received")
async def mark_part_received(order_id: str, data: dict):
    """Mark part order as received"""
    await db.workspace_part_orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "received", "received_date": datetime.now(timezone.utc), "received_by": data.get("by", "")}}
    )

    order = await db.workspace_part_orders.find_one({"_id": ObjectId(order_id)})

    # Check if ALL part orders for this task are received
    task_id = order["task_id"]
    pending = await db.workspace_part_orders.count_documents({"task_id": task_id, "status": "ordered"})

    if pending == 0:
        timeline_entry = {
            "action": "All Parts Received",
            "by": data.get("by", "System"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notes": "All ordered parts have been received"
        }
        await db.workspace_tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"status": "part_received", "updated_at": datetime.now(timezone.utc)},
             "$push": {"timeline": timeline_entry}}
        )
    else:
        timeline_entry = {
            "action": "Part Received",
            "by": data.get("by", "System"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notes": f"{order['part_name']} received. {pending} order(s) still pending."
        }
        await db.workspace_tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$push": {"timeline": timeline_entry}}
        )

    return {"message": "Part marked as received", "all_received": pending == 0}

# ==================== SERVICE ENTRIES ====================

@router.get("/service-entries")
async def get_service_entries(is_billed: Optional[bool] = None):
    query = {}
    if is_billed is not None:
        query["is_billed"] = is_billed
    entries = await db.workspace_service_entries.find(query).sort("created_at", -1).to_list(1000)
    result = []
    for entry in entries:
        entry_data = serialize_doc(entry)
        if entry_data.get("client_id"):
            c = await db.workspace_clients.find_one({"_id": ObjectId(entry_data["client_id"])})
            entry_data["client_name"] = c["company_name"] if c else None
        if entry_data.get("location_id"):
            loc = await db.workspace_client_locations.find_one({"_id": ObjectId(entry_data["location_id"])})
            entry_data["location_name"] = loc["location_name"] if loc else None
        if entry_data.get("employee_id"):
            emp = await db.workspace_employees.find_one({"employee_id": entry_data["employee_id"]})
            entry_data["employee_name"] = emp["name"] if emp else None
        result.append(entry_data)
    return result

@router.get("/service-entries/pending-billing")
async def get_pending_billing():
    return await get_service_entries(is_billed=False)

@router.post("/service-entries")
async def create_service_entry(data: dict):
    """Create service entry when task is completed by engineer"""
    entry_dict = {
        "task_id": data.get("task_id"),
        "client_id": data.get("client_id"),
        "location_id": data.get("location_id"),
        "employee_id": data.get("employee_id"),
        "service_type": data.get("service_type", "service"),
        "work_performed": data.get("work_performed", ""),
        "issues_found": data.get("issues_found", ""),
        "remarks": data.get("remarks", ""),
        "customer_name": data.get("customer_name", ""),
        "customer_signature": data.get("customer_signature"),
        "photos_before": data.get("photos_before", []),
        "photos_after": data.get("photos_after", []),
        "parts_used": data.get("parts_used", []),
        "start_gps_lat": data.get("start_gps_lat"),
        "start_gps_lng": data.get("start_gps_lng"),
        "end_gps_lat": data.get("end_gps_lat"),
        "end_gps_lng": data.get("end_gps_lng"),
        "start_time": data.get("start_time"),
        "end_time": data.get("end_time"),
        "is_billed": False,
        "created_at": datetime.now(timezone.utc)
    }

    result = await db.workspace_service_entries.insert_one(entry_dict)
    entry_dict["id"] = str(result.inserted_id)
    del entry_dict["_id"]

    # Update task to completed
    if entry_dict.get("task_id"):
        timeline_entry = {
            "action": "Service Entry Completed",
            "by": data.get("employee_id", ""),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "notes": data.get("work_performed", "")[:100]
        }
        await db.workspace_tasks.update_one(
            {"_id": ObjectId(entry_dict["task_id"])},
            {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)},
             "$push": {"timeline": timeline_entry}}
        )

    # Deduct parts
    for part in entry_dict.get("parts_used", []):
        if part.get("part_id"):
            await db.workspace_parts.update_one(
                {"_id": ObjectId(part["part_id"])},
                {"$inc": {"stock_qty": -part.get("quantity", 1)}}
            )

    return entry_dict

@router.post("/service-entries/{entry_id}/mark-billed")
async def mark_as_billed(entry_id: str, data: dict):
    await db.workspace_service_entries.update_one(
        {"_id": ObjectId(entry_id)},
        {"$set": {"is_billed": True, "bill_number": data.get("bill_number", ""), "billed_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Marked as billed"}

# ==================== PARTS REQUESTS ====================

@router.get("/parts-requests")
async def get_parts_requests(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    requests = await db.workspace_parts_requests.find(query).sort("created_at", -1).to_list(1000)
    result = []
    for req in requests:
        req_data = serialize_doc(req)
        if req_data.get("employee_id"):
            emp = await db.workspace_employees.find_one({"employee_id": req_data["employee_id"]})
            req_data["employee_name"] = emp["name"] if emp else None
        if req_data.get("client_id") and ObjectId.is_valid(req_data["client_id"]):
            c = await db.workspace_clients.find_one({"_id": ObjectId(req_data["client_id"])})
            req_data["client_name"] = c["company_name"] if c else None
        if req_data.get("location_id") and ObjectId.is_valid(req_data["location_id"]):
            loc = await db.workspace_client_locations.find_one({"_id": ObjectId(req_data["location_id"])})
            req_data["location_name"] = loc["location_name"] if loc else None
        result.append(req_data)
    return result

@router.post("/parts-requests")
async def create_parts_request(data: dict):
    req_dict = {
        "employee_id": data["employee_id"],
        "client_id": data.get("client_id", ""),
        "location_id": data.get("location_id", ""),
        "device_name": data.get("device_name"),
        "device_model": data.get("device_model"),
        "device_serial": data.get("device_serial"),
        "user_name": data.get("user_name"),
        "items": data.get("items", []),
        "urgency": data.get("urgency", "normal"),
        "notes": data.get("notes", ""),
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.workspace_parts_requests.insert_one(req_dict)
    req_dict["id"] = str(result.inserted_id)
    del req_dict["_id"]
    return req_dict

@router.post("/parts-requests/{request_id}/approve")
async def approve_parts_request(request_id: str, data: dict):
    await db.workspace_parts_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "approved", "approved_by": data.get("by", ""), "approved_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Approved"}

@router.post("/parts-requests/{request_id}/reject")
async def reject_parts_request(request_id: str, data: dict):
    await db.workspace_parts_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "rejected", "rejected_by": data.get("by", ""), "rejection_reason": data.get("reason", ""), "rejected_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Rejected"}

# ==================== EXPENSES ====================

@router.get("/expenses")
async def get_expenses(employee_id: Optional[str] = None, is_approved: Optional[bool] = None):
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    if is_approved is not None:
        query["is_approved"] = is_approved
    expenses = await db.workspace_expenses.find(query).sort("created_at", -1).to_list(1000)
    result = []
    for exp in expenses:
        exp_data = serialize_doc(exp)
        if exp_data.get("employee_id"):
            emp = await db.workspace_employees.find_one({"employee_id": exp_data["employee_id"]})
            exp_data["employee_name"] = emp["name"] if emp else None
        result.append(exp_data)
    return result

@router.post("/expenses")
async def create_expense(data: dict):
    exp_dict = {
        "employee_id": data["employee_id"],
        "expense_type": data.get("expense_type", "misc"),
        "amount": data.get("amount", 0),
        "description": data.get("description", ""),
        "expense_date": data.get("expense_date"),
        "is_approved": False,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.workspace_expenses.insert_one(exp_dict)
    exp_dict["id"] = str(result.inserted_id)
    del exp_dict["_id"]
    return exp_dict

@router.post("/expenses/{expense_id}/approve")
async def approve_expense(expense_id: str, data: dict):
    await db.workspace_expenses.update_one(
        {"_id": ObjectId(expense_id)},
        {"$set": {"is_approved": True, "approved_by": data.get("by", ""), "approved_at": datetime.now(timezone.utc)}}
    )
    return {"message": "Approved"}

# ==================== DASHBOARD STATS ====================

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    stats = {
        "total_clients": await db.workspace_clients.count_documents({"is_active": True}),
        "total_employees": await db.workspace_employees.count_documents({"is_active": True}),
        "total_suppliers": await db.workspace_suppliers.count_documents({"is_active": True}),
        "new_tasks": await db.workspace_tasks.count_documents({"status": "new"}),
        "pending_parts": await db.workspace_tasks.count_documents({"status": {"$in": ["part_ordered", "pending_for_part"]}}),
        "awaiting_estimate": await db.workspace_tasks.count_documents({"status": {"$in": ["estimate_sent"]}}),
        "ready_to_assign": await db.workspace_tasks.count_documents({"status": {"$in": ["part_received", "estimate_approved"]}}),
        "assigned_tasks": await db.workspace_tasks.count_documents({"status": "assigned"}),
        "in_progress_tasks": await db.workspace_tasks.count_documents({"status": "in_progress"}),
        "completed_tasks": await db.workspace_tasks.count_documents({"status": "completed"}),
        "completed_today": await db.workspace_tasks.count_documents({"status": "completed", "completed_at": {"$gte": today}}),
        "pending_billing": await db.workspace_tasks.count_documents({"status": "completed"}),
        "billed_tasks": await db.workspace_tasks.count_documents({"status": "billed"}),
        "pending_parts_requests": await db.workspace_parts_requests.count_documents({"status": "pending"}),
        "pending_expenses": await db.workspace_expenses.count_documents({"is_approved": False})
    }
    return stats

# ==================== SETUP ====================

@router.post("/setup")
async def setup_workspace():
    import re
    existing = await db.workspace_employees.find_one({"employee_id": re.compile("^maharathy$", re.IGNORECASE)})
    if existing:
        return {"message": "Setup already completed"}
    admin = {
        "employee_id": "maharathy",
        "name": "Admin",
        "phone": "9769444455",
        "email": "admin@thegoodmen.in",
        "role": EmployeeRole.ADMIN,
        "password": hash_password("Charu@123@"),
        "is_active": True,
        "apps_access": ["servicebook", "sales", "admin"],
        "created_at": datetime.now(timezone.utc)
    }
    await db.workspace_employees.insert_one(admin)
    return {"message": "Setup completed"}
