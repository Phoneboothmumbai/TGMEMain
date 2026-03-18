"""
TGME ServiceBook — AMC, License & Subscription Management Routes
Tracks AMCs per client, software licenses, domains, and warranty claims.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from workspace_routes import db

router = APIRouter(prefix="/api/workspace/subscriptions", tags=["subscriptions"])


# ==================== HELPERS ====================

def serialize(doc):
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


# ==================== MODELS ====================

class AMCCreate(BaseModel):
    client_id: str
    contract_name: str
    start_date: str
    end_date: str
    coverage_type: str = "comprehensive"  # comprehensive, non_comprehensive, labor_only
    amount: float = 0
    billing_cycle: str = "annual"  # annual, quarterly, monthly
    devices_covered: int = 0
    asset_ids: List[str] = []
    number_of_visits: int = 0
    includes_parts: bool = True
    includes_onsite: bool = True
    visit_frequency: str = "quarterly"  # monthly, quarterly, half_yearly, on_demand
    notes: str = ""
    status: str = "active"  # active, expired, cancelled, pending_renewal
    created_by: str = ""

class AMCUpdate(BaseModel):
    contract_name: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    coverage_type: Optional[str] = None
    amount: Optional[float] = None
    billing_cycle: Optional[str] = None
    devices_covered: Optional[int] = None
    asset_ids: Optional[List[str]] = None
    number_of_visits: Optional[int] = None
    includes_parts: Optional[bool] = None
    includes_onsite: Optional[bool] = None
    visit_frequency: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class LicenseCreate(BaseModel):
    client_id: str
    software_name: str
    vendor: str = ""
    license_type: str = "subscription"  # perpetual, subscription, one_time, trial, open_source
    subscription_tenure: str = ""  # monthly, yearly, 3_year, lifetime
    license_key: str = ""
    seats: int = 1
    seats_used: int = 0
    purchase_date: str = ""
    expiry_date: str = ""
    cost: float = 0
    billing_cycle: str = ""  # monthly, yearly, one_time
    auto_renew: bool = False
    category: str = "email"  # email, productivity, security, os, backup, other
    assigned_to: str = ""
    notes: str = ""
    status: str = "active"  # active, expired, cancelled, pending_renewal
    created_by: str = ""

class LicenseUpdate(BaseModel):
    software_name: Optional[str] = None
    vendor: Optional[str] = None
    license_type: Optional[str] = None
    subscription_tenure: Optional[str] = None
    license_key: Optional[str] = None
    seats: Optional[int] = None
    seats_used: Optional[int] = None
    purchase_date: Optional[str] = None
    expiry_date: Optional[str] = None
    cost: Optional[float] = None
    billing_cycle: Optional[str] = None
    auto_renew: Optional[bool] = None
    category: Optional[str] = None
    client_id: Optional[str] = None
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


# ==================== AMC ROUTES ====================

@router.get("/amc/stats")
async def amc_stats(client_id: str = ""):
    query = {}
    if client_id:
        query["client_id"] = client_id

    total = await db.amc_contracts.count_documents(query)
    active = await db.amc_contracts.count_documents({**query, "status": "active"})
    expired = await db.amc_contracts.count_documents({**query, "status": "expired"})
    pending = await db.amc_contracts.count_documents({**query, "status": "pending_renewal"})

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    expiring_soon = await db.amc_contracts.count_documents({
        **query, "status": "active",
        "end_date": {"$lte": today}
    })

    total_revenue = 0
    pipeline = [{"$match": {**query, "status": "active"}}, {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    async for r in db.amc_contracts.aggregate(pipeline):
        total_revenue = r["total"]

    return {
        "total": total, "active": active, "expired": expired,
        "pending_renewal": pending, "expiring_soon": expiring_soon,
        "total_revenue": total_revenue
    }


@router.get("/amc")
async def list_amcs(client_id: str = "", status: str = "", search: str = ""):
    query = {}
    if client_id:
        query["client_id"] = client_id
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"contract_name": {"$regex": search, "$options": "i"}},
            {"client_name": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.amc_contracts.find(query).sort("end_date", 1)
    amcs = [serialize(doc) async for doc in cursor]
    return amcs


@router.post("/amc")
async def create_amc(data: AMCCreate):
    client_doc = await db.workspace_clients.find_one({"_id": ObjectId(data.client_id)})
    if not client_doc:
        raise HTTPException(status_code=404, detail="Client not found")

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        **data.model_dump(),
        "client_name": client_doc.get("company_name", ""),
        "created_at": now,
        "updated_at": now,
    }
    result = await db.amc_contracts.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc


@router.get("/amc/{amc_id}")
async def get_amc(amc_id: str):
    doc = await db.amc_contracts.find_one({"_id": ObjectId(amc_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="AMC not found")
    amc = serialize(doc)

    # Get linked assets
    if amc.get("asset_ids"):
        assets = []
        for aid in amc["asset_ids"]:
            try:
                asset = await db.assets.find_one({"_id": ObjectId(aid)})
                if asset:
                    assets.append({"id": str(asset["_id"]), "asset_tag": asset.get("asset_tag"), "brand": asset.get("brand"), "model": asset.get("model"), "type": asset.get("type")})
            except:
                pass
        amc["linked_assets"] = assets

    return amc


@router.put("/amc/{amc_id}")
async def update_amc(amc_id: str, data: AMCUpdate):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.amc_contracts.update_one({"_id": ObjectId(amc_id)}, {"$set": updates})
    updated = await db.amc_contracts.find_one({"_id": ObjectId(amc_id)})
    return serialize(updated)


@router.delete("/amc/{amc_id}")
async def delete_amc(amc_id: str):
    result = await db.amc_contracts.delete_one({"_id": ObjectId(amc_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="AMC not found")
    return {"message": "AMC contract deleted"}


# ==================== LICENSE ROUTES ====================

@router.get("/licenses/stats")
async def license_stats(client_id: str = ""):
    query = {}
    if client_id:
        query["client_id"] = client_id

    total = await db.licenses.count_documents(query)
    active = await db.licenses.count_documents({**query, "status": "active"})
    expired = await db.licenses.count_documents({**query, "status": "expired"})
    pending = await db.licenses.count_documents({**query, "status": "pending_renewal"})

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    expiring_soon = await db.licenses.count_documents({
        **query, "status": "active",
        "expiry_date": {"$ne": "", "$lte": today}
    })

    # By category
    cat_pipeline = [{"$match": query}, {"$group": {"_id": "$category", "count": {"$sum": 1}}}]
    by_category = {r["_id"]: r["count"] async for r in db.licenses.aggregate(cat_pipeline)}

    # Total cost
    cost_pipeline = [{"$match": {**query, "status": "active"}}, {"$group": {"_id": None, "total": {"$sum": "$cost"}}}]
    total_cost = 0
    async for r in db.licenses.aggregate(cost_pipeline):
        total_cost = r["total"]

    # Total seats
    seats_pipeline = [{"$match": {**query, "status": "active"}}, {"$group": {"_id": None, "total": {"$sum": "$seats"}, "used": {"$sum": "$seats_used"}}}]
    total_seats = 0
    seats_used = 0
    async for r in db.licenses.aggregate(seats_pipeline):
        total_seats = r["total"]
        seats_used = r["used"]

    return {
        "total": total, "active": active, "expired": expired,
        "pending_renewal": pending, "expiring_soon": expiring_soon,
        "by_category": by_category, "total_cost": total_cost,
        "total_seats": total_seats, "seats_used": seats_used
    }


@router.get("/licenses")
async def list_licenses(client_id: str = "", status: str = "", category: str = "", license_type: str = "", search: str = ""):
    query = {}
    if client_id:
        query["client_id"] = client_id
    if status:
        query["status"] = status
    if category:
        query["category"] = category
    if license_type:
        query["license_type"] = license_type
    if search:
        query["$or"] = [
            {"software_name": {"$regex": search, "$options": "i"}},
            {"vendor": {"$regex": search, "$options": "i"}},
            {"client_name": {"$regex": search, "$options": "i"}},
            {"license_key": {"$regex": search, "$options": "i"}},
        ]

    cursor = db.licenses.find(query).sort("expiry_date", 1)
    licenses = [serialize(doc) async for doc in cursor]
    return licenses


@router.post("/licenses")
async def create_license(data: LicenseCreate):
    client_doc = await db.workspace_clients.find_one({"_id": ObjectId(data.client_id)})
    if not client_doc:
        raise HTTPException(status_code=404, detail="Client not found")

    now = datetime.now(timezone.utc).isoformat()
    doc = {
        **data.model_dump(),
        "client_name": client_doc.get("company_name", ""),
        "created_at": now,
        "updated_at": now,
    }
    result = await db.licenses.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc.pop("_id", None)
    return doc


@router.get("/licenses/{license_id}")
async def get_license(license_id: str):
    doc = await db.licenses.find_one({"_id": ObjectId(license_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="License not found")
    return serialize(doc)


@router.put("/licenses/{license_id}")
async def update_license(license_id: str, data: LicenseUpdate):
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.licenses.update_one({"_id": ObjectId(license_id)}, {"$set": updates})
    updated = await db.licenses.find_one({"_id": ObjectId(license_id)})
    return serialize(updated)


@router.delete("/licenses/{license_id}")
async def delete_license(license_id: str):
    result = await db.licenses.delete_one({"_id": ObjectId(license_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="License not found")
    return {"message": "License deleted"}
