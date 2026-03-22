"""
TGME Workspace - Multi-App Platform
Database Models for ServiceBook App
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ============== ENUMS ==============

class EmployeeRole(str, Enum):
    ADMIN = "admin"
    BACKOFFICE = "backoffice"
    ENGINEER = "engineer"
    DELIVERY = "delivery"

class TaskStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class ServiceType(str, Enum):
    DELIVERY = "delivery"
    INSTALLATION = "installation"
    INSPECTION = "inspection"
    REPAIR = "repair"
    AMC_VISIT = "amc_visit"
    SERVICE = "service"
    OTHER = "other"

class ExpenseType(str, Enum):
    TRAVEL = "travel"
    FOOD = "food"
    PARTS = "parts"
    MISC = "misc"

class PartsRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FULFILLED = "fulfilled"

# ============== EMPLOYEE ==============

class EmployeeCreate(BaseModel):
    employee_id: str  # Custom ID like EMP001
    name: str
    phone: str = ""
    email: Optional[str] = None
    role: EmployeeRole = EmployeeRole.ENGINEER
    password: str
    is_active: bool = True
    apps_access: List[str] = ["servicebook"]
    permissions: Optional[dict] = {}

class EmployeeLogin(BaseModel):
    employee_id: str
    password: str
    section: str  # App section they want to access

class EmployeeResponse(BaseModel):
    id: str
    employee_id: str
    name: str
    phone: str = ""
    email: Optional[str] = None
    role: EmployeeRole = EmployeeRole.ENGINEER
    is_active: bool = True
    apps_access: List[str] = []
    permissions: Optional[dict] = {}

# ============== CLIENT ==============

class ClientCreate(BaseModel):
    company_name: str
    gst_number: Optional[str] = None
    industry: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True
    qr_code: Optional[str] = None  # Auto-generated

class ClientResponse(BaseModel):
    id: str
    company_name: str
    gst_number: Optional[str]
    industry: Optional[str]
    notes: Optional[str]
    is_active: bool
    qr_code: Optional[str]
    created_at: datetime
    locations_count: int = 0
    contacts_count: int = 0

# ============== CLIENT LOCATION ==============

class ClientLocationCreate(BaseModel):
    client_id: str
    location_name: str  # e.g., "Head Office", "Warehouse", "Branch - Andheri"
    address: str
    city: str
    state: str
    pincode: str
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    is_active: bool = True

class ClientLocationResponse(BaseModel):
    id: str
    client_id: str
    location_name: str
    address: str
    city: str
    state: str
    pincode: str
    gps_lat: Optional[float]
    gps_lng: Optional[float]
    is_active: bool

# ============== CLIENT CONTACT ==============

class ClientContactCreate(BaseModel):
    client_id: str
    location_id: Optional[str] = None  # Can be linked to specific location
    name: str
    designation: Optional[str] = None
    phone: str
    phone_alt: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None  # If different from phone
    is_primary: bool = False
    is_active: bool = True

class ClientContactResponse(BaseModel):
    id: str
    client_id: str
    location_id: Optional[str]
    name: str
    designation: Optional[str]
    phone: str
    phone_alt: Optional[str]
    email: Optional[str]
    whatsapp: Optional[str]
    is_primary: bool
    is_active: bool

# ============== PARTS / MATERIALS ==============

class PartCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    unit: str = "pcs"  # pcs, kg, ltr, etc.
    stock_qty: float = 0
    min_stock: float = 0  # Alert when below this
    price: float = 0
    is_active: bool = True

class PartResponse(BaseModel):
    id: str
    name: str
    sku: Optional[str]
    category: Optional[str]
    unit: str
    stock_qty: float
    min_stock: float
    price: float
    is_active: bool

# ============== TASK ==============

class TaskCreate(BaseModel):
    client_id: str
    location_id: str
    assigned_to: Optional[str] = None  # Employee ID
    service_type: ServiceType
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    created_by: str  # Employee ID who created

class TaskUpdate(BaseModel):
    assigned_to: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None

class TaskResponse(BaseModel):
    id: str
    client_id: str
    location_id: str
    assigned_to: Optional[str]
    service_type: ServiceType
    title: str
    description: Optional[str]
    priority: TaskPriority
    status: TaskStatus
    due_date: Optional[datetime]
    created_by: str
    created_at: datetime
    updated_at: datetime
    # Populated fields
    client_name: Optional[str] = None
    location_name: Optional[str] = None
    assigned_to_name: Optional[str] = None

# ============== SERVICE ENTRY ==============

class PartUsed(BaseModel):
    part_id: str
    part_name: str
    quantity: float
    serial_number: Optional[str] = None

class ServiceEntryCreate(BaseModel):
    task_id: str
    client_id: str
    location_id: str
    employee_id: str
    service_type: ServiceType
    # Location tracking
    start_gps_lat: Optional[float] = None
    start_gps_lng: Optional[float] = None
    end_gps_lat: Optional[float] = None
    end_gps_lng: Optional[float] = None
    # Service details
    work_performed: str
    parts_used: List[PartUsed] = []
    remarks: Optional[str] = None
    issues_found: Optional[str] = None
    # Photos
    photos_before: List[str] = []  # URLs/base64
    photos_after: List[str] = []
    # Signature
    customer_signature: Optional[str] = None  # Base64
    customer_name: Optional[str] = None
    # Timestamps
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    # Contacts notified
    contacts_notified: List[str] = []  # Contact IDs

class ServiceEntryResponse(BaseModel):
    id: str
    task_id: str
    client_id: str
    location_id: str
    employee_id: str
    service_type: ServiceType
    start_gps_lat: Optional[float]
    start_gps_lng: Optional[float]
    end_gps_lat: Optional[float]
    end_gps_lng: Optional[float]
    work_performed: str
    parts_used: List[PartUsed]
    remarks: Optional[str]
    issues_found: Optional[str]
    photos_before: List[str]
    photos_after: List[str]
    customer_signature: Optional[str]
    customer_name: Optional[str]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    contacts_notified: List[str]
    created_at: datetime
    # Billing
    is_billed: bool = False
    bill_number: Optional[str] = None
    billed_at: Optional[datetime] = None
    # Populated
    client_name: Optional[str] = None
    location_name: Optional[str] = None
    employee_name: Optional[str] = None

# ============== PARTS REQUEST ==============

class PartsRequestCreate(BaseModel):
    employee_id: str
    task_id: Optional[str] = None
    client_id: Optional[str] = None
    items: List[dict]  # [{part_id, part_name, quantity, reason}]
    urgency: str = "normal"  # normal, urgent
    notes: Optional[str] = None

class PartsRequestResponse(BaseModel):
    id: str
    employee_id: str
    task_id: Optional[str]
    client_id: Optional[str]
    items: List[dict]
    urgency: str
    notes: Optional[str]
    status: PartsRequestStatus
    created_at: datetime
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    employee_name: Optional[str] = None

# ============== EXPENSE ==============

class ExpenseCreate(BaseModel):
    employee_id: str
    task_id: Optional[str] = None
    expense_type: ExpenseType
    amount: float
    description: str
    receipt_photo: Optional[str] = None  # Base64/URL
    expense_date: datetime

class ExpenseResponse(BaseModel):
    id: str
    employee_id: str
    task_id: Optional[str]
    expense_type: ExpenseType
    amount: float
    description: str
    receipt_photo: Optional[str]
    expense_date: datetime
    created_at: datetime
    is_approved: bool = False
    approved_by: Optional[str] = None
    employee_name: Optional[str] = None

# ============== BILLING ==============

class BillingUpdate(BaseModel):
    service_entry_id: str
    bill_number: str
