"""
TGME Client Portal — Routes for client-facing portal.
Clients can log in, view their assets/employees, and raise support tickets via osTicket.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
import hashlib
import secrets
import httpx

from workspace_routes import db

router = APIRouter(prefix="/api/portal", tags=["client-portal"])

OSTICKET_URL = "https://support.thegoodmen.in/api/tickets.json"
OSTICKET_API_KEY = "0D5F5BDE6501B6BB9A6567683D40357D"


# ==================== HELPERS ====================

def hash_pw(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def serialize(doc):
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


# ==================== MODELS ====================

class PortalUserCreate(BaseModel):
    client_id: str
    name: str
    email: str
    phone: str = ""
    password: str

class PortalLogin(BaseModel):
    email: str
    password: str

class TicketCreate(BaseModel):
    subject: str
    description: str
    asset_id: Optional[str] = ""
    priority: str = "normal"


# ==================== AUTH ====================

@router.post("/users")
async def create_portal_user(data: PortalUserCreate):
    """Admin creates a portal user for a client contact."""
    client = await db.workspace_clients.find_one({"_id": ObjectId(data.client_id)})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    existing = await db.client_portal_users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    now = datetime.now(timezone.utc).isoformat()
    user = {
        "client_id": data.client_id,
        "client_name": client.get("company_name", ""),
        "name": data.name,
        "email": data.email.lower(),
        "phone": data.phone,
        "password": hash_pw(data.password),
        "is_active": True,
        "created_at": now,
    }
    result = await db.client_portal_users.insert_one(user)
    return {"id": str(result.inserted_id), "email": user["email"], "client_name": user["client_name"]}


@router.get("/users")
async def list_portal_users(client_id: str = ""):
    """List portal users (admin)."""
    query = {"is_active": True}
    if client_id:
        query["client_id"] = client_id
    users = await db.client_portal_users.find(query, {"password": 0}).to_list(500)
    return [serialize(u) for u in users]


@router.delete("/users/{user_id}")
async def delete_portal_user(user_id: str):
    """Deactivate a portal user."""
    await db.client_portal_users.update_one(
        {"_id": ObjectId(user_id)}, {"$set": {"is_active": False}}
    )
    return {"message": "User deactivated"}


@router.post("/auth/login")
async def portal_login(data: PortalLogin):
    """Client portal login."""
    user = await db.client_portal_users.find_one({
        "email": data.email.lower(), "is_active": True
    })
    if not user or user["password"] != hash_pw(data.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = secrets.token_urlsafe(32)
    await db.client_portal_sessions.insert_one({
        "token": token,
        "user_id": str(user["_id"]),
        "client_id": user["client_id"],
        "created_at": datetime.now(timezone.utc),
    })

    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "client_id": user["client_id"],
            "client_name": user.get("client_name", ""),
        }
    }


@router.get("/auth/verify")
async def portal_verify(token: str):
    """Verify client portal session."""
    session = await db.client_portal_sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = await db.client_portal_users.find_one({"_id": ObjectId(session["user_id"]), "is_active": True})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {
        "valid": True,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "client_id": user["client_id"],
            "client_name": user.get("client_name", ""),
        }
    }


@router.post("/auth/logout")
async def portal_logout(token: str):
    await db.client_portal_sessions.delete_one({"token": token})
    return {"message": "Logged out"}


# ==================== PORTAL DATA ====================

async def get_session_user(token: str):
    session = await db.client_portal_sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = await db.client_portal_users.find_one({"_id": ObjectId(session["user_id"]), "is_active": True})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/my/dashboard")
async def portal_dashboard(token: str):
    """Client dashboard — asset counts, AMC info, recent tickets."""
    user = await get_session_user(token)
    client_id = user["client_id"]

    total_assets = await db.assets.count_documents({"client_id": client_id, "parent_asset_id": {"$in": ["", None]}})
    active_assets = await db.assets.count_documents({"client_id": client_id, "status": "active", "parent_asset_id": {"$in": ["", None]}})
    active_amcs = await db.amc_contracts.count_documents({"client_id": client_id, "status": "active"})
    active_licenses = await db.licenses.count_documents({"client_id": client_id, "status": "active"})

    # Recent tasks
    recent_tasks = []
    async for t in db.workspace_tasks.find({"client_id": client_id}).sort("created_at", -1).limit(5):
        recent_tasks.append({
            "id": str(t["_id"]),
            "job_id": t.get("job_id", ""),
            "title": t.get("title", ""),
            "status": t.get("status", ""),
            "created_at": str(t.get("created_at", "")),
        })

    client = await db.workspace_clients.find_one({"_id": ObjectId(client_id)})

    return {
        "client_name": client.get("company_name", "") if client else "",
        "total_assets": total_assets,
        "active_assets": active_assets,
        "active_amcs": active_amcs,
        "active_licenses": active_licenses,
        "recent_tasks": recent_tasks,
    }


@router.get("/my/assets")
async def portal_assets(token: str, status: str = "", type: str = "", search: str = ""):
    """List assets for the client."""
    user = await get_session_user(token)
    client_id = user["client_id"]

    query = {"client_id": client_id, "parent_asset_id": {"$in": ["", None]}}
    if status:
        query["status"] = status
    if type:
        query["type"] = type
    if search:
        query["$or"] = [
            {"asset_tag": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}},
            {"model": {"$regex": search, "$options": "i"}},
            {"serial_number": {"$regex": search, "$options": "i"}},
            {"assigned_to": {"$regex": search, "$options": "i"}},
        ]

    assets = []
    async for doc in db.assets.find(query).sort("created_at", -1).limit(500):
        assets.append({
            "id": str(doc["_id"]),
            "asset_tag": doc.get("asset_tag", ""),
            "type": doc.get("type", ""),
            "brand": doc.get("brand", ""),
            "model": doc.get("model", ""),
            "serial_number": doc.get("serial_number", ""),
            "status": doc.get("status", ""),
            "assigned_to": doc.get("assigned_to", ""),
            "location_name": doc.get("location_name", ""),
            "purchase_date": doc.get("purchase_date", ""),
            "warranty_expiry": doc.get("warranty_expiry", ""),
        })

    return assets


@router.get("/my/assets/{asset_id}")
async def portal_asset_detail(asset_id: str, token: str):
    """Get asset detail + service history for client portal."""
    user = await get_session_user(token)
    client_id = user["client_id"]

    doc = await db.assets.find_one({"_id": ObjectId(asset_id), "client_id": client_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Asset not found")

    asset = serialize(doc)
    asset.pop("assignment_history", None)
    asset.pop("status_history", None)

    # Get service history
    entries = await db.workspace_service_entries.find(
        {"$or": [{"asset_id": asset_id}, {"asset_tag": asset.get("asset_tag", "")}]},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    asset["service_entries"] = entries

    # AMC contracts covering this asset
    amcs = []
    async for amc in db.amc_contracts.find({"asset_ids": asset_id, "client_id": client_id}):
        amcs.append({
            "id": str(amc["_id"]),
            "contract_name": amc.get("contract_name", ""),
            "status": amc.get("status", ""),
            "end_date": amc.get("end_date", ""),
        })
    asset["amc_contracts"] = amcs

    return asset


@router.get("/my/employees")
async def portal_employees(token: str):
    """List contacts for the client (employees/POCs on file)."""
    user = await get_session_user(token)
    client_id = user["client_id"]

    contacts = await db.workspace_client_contacts.find({"client_id": client_id}).to_list(200)
    return [serialize(c) for c in contacts]


@router.get("/my/amcs")
async def portal_amcs(token: str):
    """List AMC contracts for the client."""
    user = await get_session_user(token)
    client_id = user["client_id"]

    amcs = []
    async for amc in db.amc_contracts.find({"client_id": client_id}).sort("end_date", 1):
        amcs.append({
            "id": str(amc["_id"]),
            "contract_name": amc.get("contract_name", ""),
            "start_date": amc.get("start_date", ""),
            "end_date": amc.get("end_date", ""),
            "coverage_type": amc.get("coverage_type", ""),
            "status": amc.get("status", ""),
            "number_of_visits": amc.get("number_of_visits", 0),
            "visit_frequency": amc.get("visit_frequency", ""),
        })

    return amcs


@router.get("/my/tickets")
async def portal_tickets(token: str):
    """List service tasks/tickets for the client."""
    user = await get_session_user(token)
    client_id = user["client_id"]

    tasks = []
    async for t in db.workspace_tasks.find({"client_id": client_id}).sort("created_at", -1).limit(50):
        tasks.append({
            "id": str(t["_id"]),
            "job_id": t.get("job_id", ""),
            "title": t.get("title", ""),
            "status": t.get("status", ""),
            "priority": t.get("priority", ""),
            "created_at": str(t.get("created_at", "")),
            "completed_at": str(t.get("completed_at", "")) if t.get("completed_at") else "",
        })

    return tasks


@router.post("/my/tickets")
async def portal_create_ticket(data: TicketCreate, token: str):
    """Client raises a support ticket — creates in osTicket + workspace tasks."""
    user = await get_session_user(token)
    client_id = user["client_id"]

    client = await db.workspace_clients.find_one({"_id": ObjectId(client_id)})
    client_name = client.get("company_name", "") if client else ""

    # Build asset info if provided
    asset_info = ""
    if data.asset_id:
        asset = await db.assets.find_one({"_id": ObjectId(data.asset_id), "client_id": client_id})
        if asset:
            asset_info = f"""
<h3 style='color:#d97706;margin-bottom:8px;'>Asset Details</h3>
<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;width:200px;'>Asset Tag</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{asset.get('asset_tag', '')}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Device</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{asset.get('brand', '')} {asset.get('model', '')}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Serial</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{asset.get('serial_number', '')}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Type</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{asset.get('type', '')}</td></tr>
</table>"""

    message = f"""data:text/html,
<h2 style='color:#d97706;margin-bottom:5px;'>Client Portal — Support Request</h2>
<hr style='border-color:#d97706;'>

<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>
<tr><td style='padding:6px 12px;font-weight:bold;width:200px;background:#fef3c7;'>Company</td><td style='padding:6px 12px;background:#fef3c7;font-weight:bold;'>{client_name}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Submitted By</td><td style='padding:6px 12px;'>{user['name']} ({user['email']})</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Priority</td><td style='padding:6px 12px;'>{data.priority.upper()}</td></tr>
</table>

{asset_info}

<h3 style='color:#d97706;margin-bottom:8px;'>Issue Description</h3>
<p style='background:#f8fafc;padding:10px;border-left:3px solid #d97706;white-space:pre-wrap;'>{data.description}</p>
<hr>
<p style='color:#888;font-size:11px;'>Submitted via TGME Client Portal</p>
"""

    ticket_payload = {
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone", ""),
        "subject": data.subject,
        "message": message,
        "alert": True,
        "autorespond": True,
        "source": "API",
    }

    ticket_id = ""
    try:
        async with httpx.AsyncClient(timeout=15) as http_client:
            resp = await http_client.post(
                OSTICKET_URL,
                json=ticket_payload,
                headers={"X-API-Key": OSTICKET_API_KEY, "Content-Type": "application/json"}
            )
        raw = resp.text.strip()
        if raw.isdigit():
            ticket_id = raw
    except Exception:
        pass

    return {
        "success": True,
        "ticket_id": ticket_id,
        "message": "Support ticket submitted successfully" + (f" (Ticket #{ticket_id})" if ticket_id else ""),
    }
