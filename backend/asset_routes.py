"""
TGME ServiceBook — Asset Management Routes
Tracks IT assets for MSP clients with full lifecycle, accessories, QR codes, and maintenance history.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import os
import qrcode
import base64
from io import BytesIO
from bson import ObjectId

router = APIRouter(prefix="/api/workspace/assets", tags=["assets"])

# Import db from workspace_routes to ensure same connection
from workspace_routes import db


# ==================== ENUMS ====================

class AssetStatus(str, Enum):
    ACTIVE = "active"
    IN_REPAIR = "in_repair"
    IN_STOCK = "in_stock"
    RETIRED = "retired"
    LOST = "lost"
    DISPOSED = "disposed"

class AssetType(str, Enum):
    LAPTOP = "laptop"
    DESKTOP = "desktop"
    MONITOR = "monitor"
    PRINTER = "printer"
    SERVER = "server"
    UPS = "ups"
    ROUTER = "router"
    SWITCH = "switch"
    ACCESS_POINT = "access_point"
    FIREWALL = "firewall"
    KEYBOARD = "keyboard"
    MOUSE = "mouse"
    WEBCAM = "webcam"
    HEADSET = "headset"
    PHONE = "phone"
    TABLET = "tablet"
    SCANNER = "scanner"
    PROJECTOR = "projector"
    NAS = "nas"
    CCTV = "cctv"
    NVR = "nvr"
    OTHER = "other"


# ==================== MODELS ====================

class AssetCreate(BaseModel):
    type: AssetType
    brand: str
    model: str
    serial_number: Optional[str] = ""
    status: AssetStatus = AssetStatus.ACTIVE
    client_id: str
    location_id: Optional[str] = ""
    assigned_to: Optional[str] = ""
    purchase_date: Optional[str] = ""
    warranty_expiry: Optional[str] = ""
    amc_linked: bool = False
    amc_expiry: Optional[str] = ""
    specs: Optional[dict] = {}
    parent_asset_id: Optional[str] = ""
    notes: Optional[str] = ""
    created_by: str = ""

class AssetUpdate(BaseModel):
    type: Optional[AssetType] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    serial_number: Optional[str] = None
    status: Optional[AssetStatus] = None
    client_id: Optional[str] = None
    location_id: Optional[str] = None
    assigned_to: Optional[str] = None
    purchase_date: Optional[str] = None
    warranty_expiry: Optional[str] = None
    amc_linked: Optional[bool] = None
    amc_expiry: Optional[str] = None
    specs: Optional[dict] = None
    parent_asset_id: Optional[str] = None
    notes: Optional[str] = None


# ==================== HELPERS ====================

def serialize(doc):
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc

async def next_asset_tag():
    last = await db.assets.find_one(sort=[("asset_tag_seq", -1)])
    seq = (last.get("asset_tag_seq", 0) if last else 0) + 1
    return f"TGME-AST-{seq:04d}", seq

def generate_qr(data: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=8, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


# ==================== ROUTES ====================

@router.get("/stats")
async def asset_stats(client_id: str = ""):
    """Dashboard stats for assets."""
    query = {}
    if client_id:
        query["client_id"] = client_id

    total = await db.assets.count_documents({**query, "parent_asset_id": {"$in": ["", None]}})
    active = await db.assets.count_documents({**query, "status": "active", "parent_asset_id": {"$in": ["", None]}})
    in_repair = await db.assets.count_documents({**query, "status": "in_repair", "parent_asset_id": {"$in": ["", None]}})
    in_stock = await db.assets.count_documents({**query, "status": "in_stock", "parent_asset_id": {"$in": ["", None]}})
    retired = await db.assets.count_documents({**query, "status": {"$in": ["retired", "disposed", "lost"]}, "parent_asset_id": {"$in": ["", None]}})

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    warranty_expiring = await db.assets.count_documents({
        **query,
        "warranty_expiry": {"$ne": "", "$lte": today},
        "status": "active",
        "parent_asset_id": {"$in": ["", None]}
    })

    # Type breakdown
    type_pipeline = [
        {"$match": {**query, "parent_asset_id": {"$in": ["", None]}}},
        {"$group": {"_id": "$type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    type_breakdown = {r["_id"]: r["count"] async for r in db.assets.aggregate(type_pipeline)}

    return {
        "total": total, "active": active, "in_repair": in_repair,
        "in_stock": in_stock, "retired": retired,
        "warranty_expiring": warranty_expiring,
        "type_breakdown": type_breakdown
    }


@router.get("")
async def list_assets(
    client_id: str = "", location_id: str = "", status: str = "",
    type: str = "", search: str = "", parent_only: str = "true",
    skip: int = 0, limit: int = 100
):
    """List assets with filters. parent_only=true excludes accessories."""
    query = {}
    if client_id:
        query["client_id"] = client_id
    if location_id:
        query["location_id"] = location_id
    if status:
        query["status"] = status
    if type:
        query["type"] = type
    if parent_only == "true":
        query["parent_asset_id"] = {"$in": ["", None]}
    if search:
        query["$or"] = [
            {"asset_tag": {"$regex": search, "$options": "i"}},
            {"brand": {"$regex": search, "$options": "i"}},
            {"model": {"$regex": search, "$options": "i"}},
            {"serial_number": {"$regex": search, "$options": "i"}},
            {"assigned_to": {"$regex": search, "$options": "i"}},
        ]

    total = await db.assets.count_documents(query)
    cursor = db.assets.find(query).sort("created_at", -1).skip(skip).limit(limit)
    assets = [serialize(doc) async for doc in cursor]

    # Count accessories for each asset
    for asset in assets:
        asset["accessories_count"] = await db.assets.count_documents({"parent_asset_id": asset["id"]})

    return {"assets": assets, "total": total}


@router.post("")
async def create_asset(data: AssetCreate):
    """Create a new asset."""
    # Validate client exists
    client_doc = await db.workspace_clients.find_one({"_id": ObjectId(data.client_id)})
    if not client_doc:
        raise HTTPException(status_code=404, detail="Client not found")

    tag, seq = await next_asset_tag()

    # Resolve names
    client_name = client_doc.get("company_name", "")
    location_name = ""
    if data.location_id:
        loc = await db.workspace_locations.find_one({"_id": ObjectId(data.location_id)})
        if loc:
            location_name = loc.get("location_name", "")

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "asset_tag": tag,
        "asset_tag_seq": seq,
        "type": data.type.value,
        "brand": data.brand.strip(),
        "model": data.model.strip(),
        "serial_number": data.serial_number.strip() if data.serial_number else "",
        "status": data.status.value,
        "client_id": data.client_id,
        "client_name": client_name,
        "location_id": data.location_id or "",
        "location_name": location_name,
        "assigned_to": data.assigned_to.strip() if data.assigned_to else "",
        "purchase_date": data.purchase_date or "",
        "warranty_expiry": data.warranty_expiry or "",
        "amc_linked": data.amc_linked,
        "amc_expiry": data.amc_expiry or "",
        "specs": data.specs or {},
        "parent_asset_id": data.parent_asset_id or "",
        "notes": data.notes.strip() if data.notes else "",
        "created_by": data.created_by,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.assets.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc


@router.get("/clients-summary")
async def clients_asset_summary():
    """Get asset count per client for quick overview."""
    pipeline = [
        {"$match": {"parent_asset_id": {"$in": ["", None]}}},
        {"$group": {
            "_id": "$client_id",
            "client_name": {"$first": "$client_name"},
            "total": {"$sum": 1},
            "active": {"$sum": {"$cond": [{"$eq": ["$status", "active"]}, 1, 0]}},
        }},
        {"$sort": {"total": -1}}
    ]
    results = [r async for r in db.assets.aggregate(pipeline)]
    return results


@router.get("/{asset_id}")
async def get_asset(asset_id: str):
    """Get single asset with accessories."""
    doc = await db.assets.find_one({"_id": ObjectId(asset_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset = serialize(doc)

    # Get accessories
    accessories = []
    cursor = db.assets.find({"parent_asset_id": asset["id"]})
    async for acc in cursor:
        accessories.append(serialize(acc))
    asset["accessories"] = accessories

    # Get assignment history
    asset["assignment_history"] = asset.get("assignment_history", [])
    asset["status_history"] = asset.get("status_history", [])

    # Get maintenance history from service entries
    history = await db.workspace_service_entries.find(
        {"$or": [
            {"asset_id": asset_id},
            {"asset_tag": asset.get("asset_tag", "")},
            {"notes_search": {"$regex": asset.get("serial_number", "NOMATCH"), "$options": "i"}} if asset.get("serial_number") else {"_never": True}
        ]},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    asset["maintenance_history"] = history

    return asset


@router.put("/{asset_id}")
async def update_asset(asset_id: str, data: AssetUpdate):
    """Update an existing asset. Tracks assignment changes in history."""
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Get current asset for change tracking
    current = await db.assets.find_one({"_id": ObjectId(asset_id)})
    if not current:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Track assignment change
    now = datetime.now(timezone.utc).isoformat()
    if "assigned_to" in updates and updates["assigned_to"] != current.get("assigned_to", ""):
        old_assignee = current.get("assigned_to", "")
        if old_assignee:
            history_entry = {
                "assigned_to": old_assignee,
                "assigned_from": current.get("assignment_date", current.get("created_at", "")),
                "unassigned_date": now,
                "client_name": current.get("client_name", ""),
                "location_name": current.get("location_name", ""),
            }
            await db.assets.update_one(
                {"_id": ObjectId(asset_id)},
                {"$push": {"assignment_history": history_entry}}
            )
        updates["assignment_date"] = now

    # Track status change
    if "status" in updates and updates["status"] != current.get("status", ""):
        status_entry = {
            "from_status": current.get("status", ""),
            "to_status": updates["status"],
            "changed_at": now,
        }
        await db.assets.update_one(
            {"_id": ObjectId(asset_id)},
            {"$push": {"status_history": status_entry}}
        )

    # Re-resolve names if client/location changed
    if "client_id" in updates:
        client_doc = await db.workspace_clients.find_one({"_id": ObjectId(updates["client_id"])})
        if client_doc:
            updates["client_name"] = client_doc.get("company_name", "")
    if "location_id" in updates and updates["location_id"]:
        loc = await db.workspace_locations.find_one({"_id": ObjectId(updates["location_id"])})
        if loc:
            updates["location_name"] = loc.get("location_name", "")

    updates["updated_at"] = now
    await db.assets.update_one({"_id": ObjectId(asset_id)}, {"$set": updates})

    updated = await db.assets.find_one({"_id": ObjectId(asset_id)})
    return serialize(updated)


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    """Delete asset and its accessories."""
    asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    # Delete accessories first
    await db.assets.delete_many({"parent_asset_id": asset_id})
    await db.assets.delete_one({"_id": ObjectId(asset_id)})
    return {"message": "Asset deleted"}


@router.get("/{asset_id}/qr")
async def get_asset_qr(asset_id: str):
    """Generate QR code for asset."""
    asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    qr_data = f"TGME-ASSET|{asset['asset_tag']}|{asset.get('serial_number', '')}|{asset.get('brand', '')} {asset.get('model', '')}"
    qr_base64 = generate_qr(qr_data)
    return {
        "asset_tag": asset["asset_tag"],
        "qr_code": qr_base64,
        "label": f"{asset.get('brand', '')} {asset.get('model', '')}",
        "serial": asset.get("serial_number", ""),
        "client_name": asset.get("client_name", ""),
    }


@router.get("/{asset_id}/service-history")
async def get_asset_service_history(asset_id: str):
    """Get complete service history for an asset: tasks, service entries, parts used."""
    asset = await db.assets.find_one({"_id": ObjectId(asset_id)})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    asset_tag = asset.get("asset_tag", "")
    serial = asset.get("serial_number", "")

    # Find service entries linked to this asset
    se_query = {"$or": [{"asset_id": asset_id}, {"asset_tag": asset_tag}]}
    if serial:
        se_query["$or"].append({"notes_search": {"$regex": serial, "$options": "i"}})
    entries = await db.workspace_service_entries.find(se_query, {"_id": 0}).sort("created_at", -1).to_list(100)

    # Find tasks that reference this asset
    task_query = {"$or": [
        {"asset_id": asset_id},
        {"asset_tag": asset_tag},
        {"serial_number": serial} if serial else {"_never": True},
    ]}
    tasks = []
    async for t in db.workspace_tasks.find(task_query).sort("created_at", -1).limit(50):
        tasks.append({
            "id": str(t["_id"]),
            "job_id": t.get("job_id", ""),
            "title": t.get("title", ""),
            "status": t.get("status", ""),
            "task_type": t.get("task_type", ""),
            "assigned_to": t.get("assigned_to", ""),
            "created_at": t.get("created_at", ""),
            "completed_at": t.get("completed_at", ""),
            "diagnosis_notes": t.get("diagnosis_notes", ""),
            "parts_used": [],
        })

    # Find AMC contracts covering this asset
    amcs = []
    async for amc in db.amc_contracts.find({"asset_ids": asset_id}):
        amcs.append({
            "id": str(amc["_id"]),
            "contract_name": amc.get("contract_name", ""),
            "status": amc.get("status", ""),
            "start_date": amc.get("start_date", ""),
            "end_date": amc.get("end_date", ""),
            "coverage_type": amc.get("coverage_type", ""),
        })

    return {
        "asset_id": asset_id,
        "asset_tag": asset_tag,
        "service_entries": entries,
        "tasks": tasks,
        "amc_contracts": amcs,
        "assignment_history": asset.get("assignment_history", []),
        "status_history": asset.get("status_history", []),
    }


@router.post("/bulk")
async def bulk_create_assets(payload: dict):
    """Bulk upload assets from CSV data."""
    rows = payload.get("rows", [])
    if not rows:
        raise HTTPException(status_code=400, detail="No data provided")

    created = 0
    errors = []
    for i, row in enumerate(rows):
        try:
            client_doc = await db.workspace_clients.find_one({"company_name": {"$regex": f"^{row.get('client_name', '')}$", "$options": "i"}})
            if not client_doc:
                errors.append(f"Row {i+1}: Client '{row.get('client_name')}' not found")
                continue

            tag, seq = await next_asset_tag()
            now = datetime.now(timezone.utc).isoformat()
            doc = {
                "asset_tag": tag,
                "asset_tag_seq": seq,
                "type": row.get("type", "other"),
                "brand": row.get("brand", ""),
                "model": row.get("model", ""),
                "serial_number": row.get("serial_number", ""),
                "status": row.get("status", "active"),
                "client_id": str(client_doc["_id"]),
                "client_name": client_doc["company_name"],
                "location_id": "",
                "location_name": row.get("location", ""),
                "assigned_to": row.get("assigned_to", ""),
                "purchase_date": row.get("purchase_date", ""),
                "warranty_expiry": row.get("warranty_expiry", ""),
                "amc_linked": False,
                "amc_expiry": "",
                "specs": row.get("specs", {}),
                "parent_asset_id": "",
                "notes": row.get("notes", ""),
                "created_by": "bulk_upload",
                "created_at": now,
                "updated_at": now,
            }
            await db.assets.insert_one(doc)
            created += 1
        except Exception as e:
            errors.append(f"Row {i+1}: {str(e)}")

    return {"created": created, "errors": errors}
