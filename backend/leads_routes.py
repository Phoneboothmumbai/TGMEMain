"""
TGME Lead Generation Platform — Dashboard API, Visitor Tracking, Scraper Management.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from bson import ObjectId
import asyncio
import uuid

from leads_scraper import (
    run_scrape_job, BUSINESS_TYPES, LOCATIONS
)

router = APIRouter(prefix="/api/leads", tags=["leads"])

import httpx

OSTICKET_URL = "https://support.thegoodmen.in/api/tickets.json"
OSTICKET_API_KEY = "0D5F5BDE6501B6BB9A6567683D40357D"

db = None

def set_leads_db(database):
    global db
    db = database


# ==================== MODELS ====================

class LeadData(BaseModel):
    name: str
    phone: str
    company: Optional[str] = ""
    service: Optional[str] = ""
    source: Optional[str] = ""
    email: Optional[str] = ""
    score: Optional[int] = None
    health_check: Optional[dict] = None

class LeadUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[List[str]] = None
    next_followup: Optional[str] = None

class VisitorEvent(BaseModel):
    page: str
    referrer: Optional[str] = ""
    utm_source: Optional[str] = ""
    utm_medium: Optional[str] = ""
    utm_campaign: Optional[str] = ""
    session_id: Optional[str] = ""

class ScrapeRequest(BaseModel):
    locations: List[str] = []
    business_types: List[str] = []
    sources: List[str] = ["google"]


# ==================== INBOUND LEADS ====================

@router.post("/submit")
async def submit_lead(data: LeadData):
    if not data.name.strip() or not data.phone.strip():
        raise HTTPException(status_code=400, detail="Name and phone are required")

    lead = {
        "name": data.name.strip(),
        "phone": data.phone.strip(),
        "company": data.company.strip() if data.company else "",
        "email": data.email.strip() if data.email else "",
        "service": data.service.strip() if data.service else "",
        "source": data.source or "website",
        "score": data.score,
        "health_check": data.health_check,
        "status": "new",
        "priority": "medium",
        "tags": [],
        "notes": "",
        "assigned_to": "",
        "next_followup": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if db is not None:
        await db.leads.insert_one(lead)
        lead.pop("_id", None)

    # Create osTicket
    service_label = data.service or "General IT Services"
    html_message = f"""<h3>New Lead from Website</h3>
<table style='border-collapse:collapse;width:100%;'>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;width:140px;'>Name</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.name}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Phone</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.phone}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Company</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.company or 'N/A'}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Service</td><td style='padding:6px 12px;border:1px solid #ddd;'>{service_label}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Source</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.source or 'website'}</td></tr>
</table><hr><p style='color:#888;font-size:11px;'>Lead captured via TGME Website</p>"""

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            await client.post(OSTICKET_URL, json={
                "name": data.name,
                "email": data.email or f"{data.phone}@lead.thegoodmen.in",
                "phone": data.phone,
                "subject": f"Website Lead — {service_label} — {data.company or data.name}",
                "message": html_message,
            }, headers={"X-API-Key": OSTICKET_API_KEY, "Content-Type": "application/json"})
    except Exception:
        pass

    return {"success": True, "message": "We'll call you back within 2 hours!"}


# ==================== LEAD DASHBOARD ====================

@router.get("/dashboard/stats")
async def lead_stats():
    """Dashboard statistics."""
    total_inbound = await db.leads.count_documents({})
    total_scraped = await db.scraped_leads.count_documents({})
    new_leads = await db.leads.count_documents({"status": "new"}) + await db.scraped_leads.count_documents({"status": "new"})
    contacted = await db.leads.count_documents({"status": "contacted"}) + await db.scraped_leads.count_documents({"status": "contacted"})
    qualified = await db.leads.count_documents({"status": "qualified"}) + await db.scraped_leads.count_documents({"status": "qualified"})
    converted = await db.leads.count_documents({"status": "converted"}) + await db.scraped_leads.count_documents({"status": "converted"})
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_visitors = await db.visitor_events.count_documents({"date": today})
    today_leads = await db.leads.count_documents({"created_at": {"$regex": f"^{today}"}})

    return {
        "total_inbound": total_inbound,
        "total_scraped": total_scraped,
        "total_leads": total_inbound + total_scraped,
        "new": new_leads,
        "contacted": contacted,
        "qualified": qualified,
        "converted": converted,
        "today_visitors": today_visitors,
        "today_leads": today_leads,
    }


@router.get("/all")
async def list_all_leads(
    source: str = "", status: str = "", search: str = "",
    business_type: str = "", location: str = "",
    sort_by: str = "created_at", sort_dir: int = -1,
    limit: int = 50, skip: int = 0
):
    """List leads from both inbound and scraped sources."""
    results = []

    # Build query
    query = {}
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]

    if source != "scraped":
        # Inbound leads
        inbound_q = {**query}
        async for doc in db.leads.find(inbound_q).sort(sort_by, sort_dir).skip(skip).limit(limit):
            results.append({
                "id": str(doc["_id"]),
                "name": doc.get("name", ""),
                "phone": doc.get("phone", ""),
                "email": doc.get("email", ""),
                "company": doc.get("company", ""),
                "service": doc.get("service", ""),
                "source": doc.get("source", "website"),
                "lead_type": "inbound",
                "status": doc.get("status", "new"),
                "priority": doc.get("priority", "medium"),
                "tags": doc.get("tags", []),
                "notes": doc.get("notes", ""),
                "assigned_to": doc.get("assigned_to", ""),
                "next_followup": doc.get("next_followup", ""),
                "score": doc.get("score"),
                "created_at": doc.get("created_at", ""),
            })

    if source != "inbound":
        # Scraped leads
        scraped_q = {**query}
        if business_type:
            scraped_q["business_type"] = business_type
        if location:
            scraped_q["location"] = {"$regex": location, "$options": "i"}

        async for doc in db.scraped_leads.find(scraped_q).sort(sort_by, sort_dir).skip(skip).limit(limit):
            results.append({
                "id": str(doc["_id"]),
                "name": doc.get("name", ""),
                "phone": doc.get("phone", ""),
                "email": doc.get("email", ""),
                "company": doc.get("name", ""),
                "website": doc.get("website", ""),
                "address": doc.get("address", ""),
                "business_type": doc.get("business_type", ""),
                "location": doc.get("location", ""),
                "source": "scraper",
                "lead_type": "scraped",
                "status": doc.get("status", "new"),
                "priority": doc.get("priority", "medium"),
                "tags": doc.get("tags", []),
                "notes": doc.get("notes", ""),
                "assigned_to": doc.get("assigned_to", ""),
                "next_followup": doc.get("next_followup", ""),
                "created_at": doc.get("created_at", ""),
            })

    # Sort combined results
    results.sort(key=lambda x: x.get("created_at", ""), reverse=(sort_dir == -1))
    total_inbound = await db.leads.count_documents(query if source != "scraped" else {"_never": True})
    total_scraped = await db.scraped_leads.count_documents(query if source != "inbound" else {"_never": True})

    return {"leads": results[:limit], "total": total_inbound + total_scraped}


@router.put("/{lead_id}")
async def update_lead(lead_id: str, data: LeadUpdate):
    """Update a lead (inbound or scraped)."""
    update = {}
    if data.status is not None:
        update["status"] = data.status
    if data.notes is not None:
        update["notes"] = data.notes
    if data.assigned_to is not None:
        update["assigned_to"] = data.assigned_to
    if data.priority is not None:
        update["priority"] = data.priority
    if data.tags is not None:
        update["tags"] = data.tags
    if data.next_followup is not None:
        update["next_followup"] = data.next_followup

    if not update:
        return {"message": "Nothing to update"}

    update["updated_at"] = datetime.now(timezone.utc).isoformat()

    # Try inbound first, then scraped
    r = await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": update})
    if r.matched_count == 0:
        r = await db.scraped_leads.update_one({"_id": ObjectId(lead_id)}, {"$set": update})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")

    return {"message": "Lead updated"}


@router.delete("/{lead_id}")
async def delete_lead(lead_id: str):
    """Delete a lead."""
    r = await db.leads.delete_one({"_id": ObjectId(lead_id)})
    if r.deleted_count == 0:
        r = await db.scraped_leads.delete_one({"_id": ObjectId(lead_id)})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted"}


# Keep backward compatibility
@router.get("/list")
async def list_leads_legacy(status: str = None, limit: int = 50, skip: int = 0):
    query = {}
    if status:
        query["status"] = status
    total = await db.leads.count_documents(query)
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return {"leads": leads, "total": total}


@router.put("/{phone}/status")
async def update_lead_status_legacy(phone: str, data: dict):
    status = data.get("status")
    if status not in ("new", "contacted", "qualified", "converted", "lost"):
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.leads.update_one({"phone": phone}, {"$set": {"status": status}})
    return {"message": f"Lead status updated to {status}"}


# ==================== VISITOR TRACKING ====================

@router.post("/track")
async def track_visitor(event: VisitorEvent, request: Request):
    """Track a page visit from the website."""
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "")
    if "," in ip:
        ip = ip.split(",")[0].strip()

    doc = {
        "page": event.page,
        "referrer": event.referrer,
        "utm_source": event.utm_source,
        "utm_medium": event.utm_medium,
        "utm_campaign": event.utm_campaign,
        "session_id": event.session_id,
        "ip": ip,
        "user_agent": request.headers.get("user-agent", ""),
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.visitor_events.insert_one(doc)
    return {"ok": True}


@router.get("/visitors/stats")
async def visitor_stats(days: int = 7):
    """Get visitor stats for the last N days."""
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    dates = [(now - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days)]

    daily = []
    for d in reversed(dates):
        count = await db.visitor_events.count_documents({"date": d})
        unique = len(await db.visitor_events.distinct("ip", {"date": d}))
        daily.append({"date": d, "visits": count, "unique": unique})

    # Top pages
    pipeline = [
        {"$match": {"date": {"$in": dates}}},
        {"$group": {"_id": "$page", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    top_pages = await db.visitor_events.aggregate(pipeline).to_list(10)

    # Top referrers
    pipeline2 = [
        {"$match": {"date": {"$in": dates}, "referrer": {"$ne": ""}}},
        {"$group": {"_id": "$referrer", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]
    top_referrers = await db.visitor_events.aggregate(pipeline2).to_list(10)

    return {
        "daily": daily,
        "top_pages": [{"page": p["_id"], "count": p["count"]} for p in top_pages],
        "top_referrers": [{"referrer": r["_id"], "count": r["count"]} for r in top_referrers],
    }


# ==================== SCRAPER MANAGEMENT ====================

@router.get("/scraper/config")
async def get_scraper_config():
    """Return available business types and locations for the scraper."""
    return {
        "business_types": BUSINESS_TYPES,
        "locations": LOCATIONS,
        "sources": ["google", "justdial", "indiamart"],
    }


@router.post("/scraper/start")
async def start_scrape(req: ScrapeRequest):
    """Start a new scrape job."""
    if not req.locations:
        req.locations = LOCATIONS[:5]
    if not req.business_types:
        req.business_types = BUSINESS_TYPES[:5]
    if not req.sources:
        req.sources = ["google"]

    job_id = str(uuid.uuid4())[:8]
    job = {
        "job_id": job_id,
        "locations": req.locations,
        "business_types": req.business_types,
        "sources": req.sources,
        "status": "queued",
        "found": 0,
        "new_leads": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.scrape_jobs.insert_one(job)

    # Run in background
    asyncio.create_task(run_scrape_job(db, job_id, req.locations, req.business_types, req.sources))

    return {"job_id": job_id, "message": "Scrape job started", "status": "queued"}


@router.get("/scraper/jobs")
async def list_scrape_jobs():
    """List all scrape jobs."""
    jobs = []
    async for j in db.scrape_jobs.find().sort("created_at", -1).limit(20):
        jobs.append({
            "job_id": j.get("job_id"),
            "status": j.get("status"),
            "locations": j.get("locations", []),
            "business_types": j.get("business_types", []),
            "sources": j.get("sources", []),
            "found": j.get("found", 0),
            "new_leads": j.get("new_leads", 0),
            "last_query": j.get("last_query", ""),
            "created_at": j.get("created_at", ""),
            "completed_at": j.get("completed_at", ""),
            "error": j.get("error", ""),
        })
    return jobs


@router.get("/scraper/jobs/{job_id}")
async def get_scrape_job(job_id: str):
    """Get status of a specific scrape job."""
    j = await db.scrape_jobs.find_one({"job_id": job_id})
    if not j:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "job_id": j.get("job_id"),
        "status": j.get("status"),
        "found": j.get("found", 0),
        "new_leads": j.get("new_leads", 0),
        "last_query": j.get("last_query", ""),
        "created_at": j.get("created_at", ""),
        "completed_at": j.get("completed_at", ""),
        "error": j.get("error", ""),
    }
