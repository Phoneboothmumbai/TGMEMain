"""
TGME Workspace - ServiceBook API Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Optional
import hashlib
import secrets
import qrcode
import base64
from io import BytesIO
import os

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

# Database connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "tgme_database")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

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
            "apps_access": employee.get("apps_access", [])
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
            "role": employee["role"]
        },
        "section": session["section"]
    }

@router.post("/auth/logout")
async def employee_logout(token: str):
    """Logout and invalidate token"""
    await db.workspace_sessions.delete_one({"token": token})
    return {"message": "Logged out successfully"}

# ==================== EMPLOYEES ====================

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
                "apps_access": ["servicebook"],
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

# ==================== TASKS ====================

@router.get("/tasks")
async def get_tasks(status: Optional[str] = None, assigned_to: Optional[str] = None):
    """Get all tasks with optional filters"""
    query = {}
    if status:
        query["status"] = status
    if assigned_to:
        query["assigned_to"] = assigned_to
    
    tasks = await db.workspace_tasks.find(query).sort("created_at", -1).to_list(1000)
    
    result = []
    for task in tasks:
        task_data = serialize_doc(task)
        
        # Populate client name
        if task_data.get("client_id"):
            client = await db.workspace_clients.find_one({"_id": ObjectId(task_data["client_id"])})
            task_data["client_name"] = client["company_name"] if client else None
        
        # Populate location name
        if task_data.get("location_id"):
            location = await db.workspace_client_locations.find_one({"_id": ObjectId(task_data["location_id"])})
            task_data["location_name"] = location["location_name"] if location else None
        
        # Populate assigned employee name and phone
        if task_data.get("assigned_to"):
            employee = await db.workspace_employees.find_one({"employee_id": task_data["assigned_to"]})
            task_data["assigned_to_name"] = employee["name"] if employee else None
            task_data["assigned_to_phone"] = employee.get("phone", "") if employee else None
        
        result.append(task_data)
    
    return result

@router.get("/tasks/my/{employee_id}")
async def get_my_tasks(employee_id: str):
    """Get tasks assigned to an employee"""
    return await get_tasks(assigned_to=employee_id)

@router.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate):
    """Create new task"""
    task_dict = task.model_dump()
    task_dict["status"] = TaskStatus.PENDING
    task_dict["created_at"] = datetime.now(timezone.utc)
    task_dict["updated_at"] = datetime.now(timezone.utc)
    
    if task_dict.get("assigned_to"):
        task_dict["status"] = TaskStatus.ASSIGNED
    
    result = await db.workspace_tasks.insert_one(task_dict)
    task_dict["id"] = str(result.inserted_id)
    
    return task_dict

@router.put("/tasks/{task_id}")
async def update_task(task_id: str, updates: TaskUpdate):
    """Update task"""
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.workspace_tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task updated"}

@router.post("/tasks/{task_id}/start")
async def start_task(task_id: str, employee_id: str, gps_lat: float = None, gps_lng: float = None):
    """Start a task - mark as in progress"""
    await db.workspace_tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {
            "status": TaskStatus.IN_PROGRESS,
            "started_at": datetime.now(timezone.utc),
            "start_gps_lat": gps_lat,
            "start_gps_lng": gps_lng,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Task started"}

# ==================== SERVICE ENTRIES ====================

@router.get("/service-entries")
async def get_service_entries(is_billed: Optional[bool] = None):
    """Get all service entries"""
    query = {}
    if is_billed is not None:
        query["is_billed"] = is_billed
    
    entries = await db.workspace_service_entries.find(query).sort("created_at", -1).to_list(1000)
    
    result = []
    for entry in entries:
        entry_data = serialize_doc(entry)
        
        # Populate names
        if entry_data.get("client_id"):
            client = await db.workspace_clients.find_one({"_id": ObjectId(entry_data["client_id"])})
            entry_data["client_name"] = client["company_name"] if client else None
        
        if entry_data.get("location_id"):
            location = await db.workspace_client_locations.find_one({"_id": ObjectId(entry_data["location_id"])})
            entry_data["location_name"] = location["location_name"] if location else None
        
        if entry_data.get("employee_id"):
            employee = await db.workspace_employees.find_one({"employee_id": entry_data["employee_id"]})
            entry_data["employee_name"] = employee["name"] if employee else None
        
        result.append(entry_data)
    
    return result

@router.get("/service-entries/pending-billing")
async def get_pending_billing():
    """Get all completed but unbilled service entries"""
    return await get_service_entries(is_billed=False)

@router.post("/service-entries", response_model=ServiceEntryResponse)
async def create_service_entry(entry: ServiceEntryCreate):
    """Create service entry when task is completed"""
    entry_dict = entry.model_dump()
    entry_dict["created_at"] = datetime.now(timezone.utc)
    entry_dict["is_billed"] = False
    
    result = await db.workspace_service_entries.insert_one(entry_dict)
    entry_dict["id"] = str(result.inserted_id)
    
    # Update task status to completed
    if entry_dict.get("task_id"):
        await db.workspace_tasks.update_one(
            {"_id": ObjectId(entry_dict["task_id"])},
            {"$set": {
                "status": TaskStatus.COMPLETED,
                "completed_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }}
        )
    
    # Deduct parts from inventory
    for part in entry_dict.get("parts_used", []):
        await db.workspace_parts.update_one(
            {"_id": ObjectId(part["part_id"])},
            {"$inc": {"stock_qty": -part["quantity"]}}
        )
    
    return entry_dict

@router.get("/service-entries/{entry_id}")
async def get_service_entry(entry_id: str):
    """Get single service entry with all details"""
    entry = await db.workspace_service_entries.find_one({"_id": ObjectId(entry_id)})
    if not entry:
        raise HTTPException(status_code=404, detail="Service entry not found")
    
    entry_data = serialize_doc(entry)
    
    # Get contacts for WhatsApp buttons
    if entry_data.get("client_id"):
        contacts = await db.workspace_client_contacts.find({"client_id": entry_data["client_id"]}).to_list(50)
        entry_data["client_contacts"] = [serialize_doc(c) for c in contacts]
    
    return entry_data

@router.post("/service-entries/{entry_id}/mark-billed")
async def mark_as_billed(entry_id: str, billing: BillingUpdate):
    """Mark service entry as billed"""
    result = await db.workspace_service_entries.update_one(
        {"_id": ObjectId(entry_id)},
        {"$set": {
            "is_billed": True,
            "bill_number": billing.bill_number,
            "billed_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service entry not found")
    
    return {"message": "Marked as billed"}

# ==================== PARTS REQUESTS ====================

@router.get("/parts-requests")
async def get_parts_requests(status: Optional[str] = None):
    """Get all parts requests"""
    query = {}
    if status:
        query["status"] = status
    
    requests = await db.workspace_parts_requests.find(query).sort("created_at", -1).to_list(1000)
    
    result = []
    for req in requests:
        req_data = serialize_doc(req)
        if req_data.get("employee_id"):
            employee = await db.workspace_employees.find_one({"employee_id": req_data["employee_id"]})
            req_data["employee_name"] = employee["name"] if employee else None
        result.append(req_data)
    
    return result

@router.post("/parts-requests", response_model=PartsRequestResponse)
async def create_parts_request(request: PartsRequestCreate):
    """Create parts request from field"""
    req_dict = request.model_dump()
    req_dict["status"] = PartsRequestStatus.PENDING
    req_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.workspace_parts_requests.insert_one(req_dict)
    req_dict["id"] = str(result.inserted_id)
    
    return req_dict

@router.post("/parts-requests/{request_id}/approve")
async def approve_parts_request(request_id: str, approved_by: str):
    """Approve parts request"""
    await db.workspace_parts_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {
            "status": PartsRequestStatus.APPROVED,
            "approved_by": approved_by,
            "approved_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Parts request approved"}

@router.post("/parts-requests/{request_id}/reject")
async def reject_parts_request(request_id: str, rejected_by: str, reason: str = None):
    """Reject parts request"""
    await db.workspace_parts_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {
            "status": PartsRequestStatus.REJECTED,
            "rejected_by": rejected_by,
            "rejection_reason": reason,
            "rejected_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Parts request rejected"}

# ==================== EXPENSES ====================

@router.get("/expenses")
async def get_expenses(employee_id: Optional[str] = None, is_approved: Optional[bool] = None):
    """Get all expenses"""
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
            employee = await db.workspace_employees.find_one({"employee_id": exp_data["employee_id"]})
            exp_data["employee_name"] = employee["name"] if employee else None
        result.append(exp_data)
    
    return result

@router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(expense: ExpenseCreate):
    """Create expense entry"""
    exp_dict = expense.model_dump()
    exp_dict["created_at"] = datetime.now(timezone.utc)
    exp_dict["is_approved"] = False
    
    result = await db.workspace_expenses.insert_one(exp_dict)
    exp_dict["id"] = str(result.inserted_id)
    
    return exp_dict

@router.post("/expenses/{expense_id}/approve")
async def approve_expense(expense_id: str, approved_by: str):
    """Approve expense"""
    await db.workspace_expenses.update_one(
        {"_id": ObjectId(expense_id)},
        {"$set": {
            "is_approved": True,
            "approved_by": approved_by,
            "approved_at": datetime.now(timezone.utc)
        }}
    )
    return {"message": "Expense approved"}

# ==================== DASHBOARD STATS ====================

@router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    
    stats = {
        "total_clients": await db.workspace_clients.count_documents({"is_active": True}),
        "total_employees": await db.workspace_employees.count_documents({"is_active": True}),
        "pending_tasks": await db.workspace_tasks.count_documents({"status": {"$in": ["pending", "assigned"]}}),
        "in_progress_tasks": await db.workspace_tasks.count_documents({"status": "in_progress"}),
        "completed_today": await db.workspace_tasks.count_documents({
            "status": "completed",
            "completed_at": {"$gte": today}
        }),
        "pending_billing": await db.workspace_service_entries.count_documents({"is_billed": False}),
        "pending_parts_requests": await db.workspace_parts_requests.count_documents({"status": "pending"}),
        "pending_expenses": await db.workspace_expenses.count_documents({"is_approved": False})
    }
    
    return stats

# ==================== SETUP (Create default admin) ====================

@router.post("/setup")
async def setup_workspace():
    """Initial setup - create default admin"""
    existing = await db.workspace_employees.find_one({"employee_id": "maharathy"})
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
        "apps_access": ["servicebook", "admin"],
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.workspace_employees.insert_one(admin)
    
    return {"message": "Setup completed"}
