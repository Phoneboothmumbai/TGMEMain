"""
Lead Capture Routes — Saves leads to DB and creates osTicket
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx

router = APIRouter(prefix="/api/leads", tags=["leads"])

OSTICKET_URL = "https://support.thegoodmen.in/api/tickets.json"
OSTICKET_API_KEY = "0D5F5BDE6501B6BB9A6567683D40357D"

db = None

def set_leads_db(database):
    global db
    db = database


class LeadData(BaseModel):
    name: str
    phone: str
    company: Optional[str] = ""
    service: Optional[str] = ""
    source: Optional[str] = ""
    email: Optional[str] = ""
    score: Optional[int] = None
    health_check: Optional[dict] = None


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
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if db is not None:
        await db.leads.insert_one(lead)
        lead.pop("_id", None)

    service_label = data.service or "General IT Services"
    source_label = data.source or "Website"

    html_message = f"""
<h3>New Lead from Website</h3>
<table style='border-collapse:collapse;width:100%;'>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;width:140px;'>Name</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.name}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Phone</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.phone}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Company</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.company or 'N/A'}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Service</td><td style='padding:6px 12px;border:1px solid #ddd;'>{service_label}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Source Page</td><td style='padding:6px 12px;border:1px solid #ddd;'>{source_label}</td></tr>
</table>
"""

    if data.health_check:
        hc = data.health_check
        html_message += f"""
<h4>IT Health Check Results</h4>
<p><strong>Score: {data.score}/100</strong></p>
<table style='border-collapse:collapse;width:100%;'>
"""
        for key, val in hc.items():
            html_message += f"<tr><td style='padding:4px 12px;border:1px solid #ddd;font-weight:bold;'>{key}</td><td style='padding:4px 12px;border:1px solid #ddd;'>{val}</td></tr>"
        html_message += "</table>"

    html_message += "<hr><p style='color:#888;font-size:11px;'>Lead captured via TGME Website | thegoodmen.in</p>"

    ticket_payload = {
        "name": data.name,
        "email": data.email or f"{data.phone}@lead.thegoodmen.in",
        "phone": data.phone,
        "subject": f"Website Lead — {service_label} — {data.company or data.name}",
        "message": html_message,
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            await client.post(
                OSTICKET_URL,
                json=ticket_payload,
                headers={"X-API-Key": OSTICKET_API_KEY, "Content-Type": "application/json"},
            )
    except Exception:
        pass

    return {"success": True, "message": "We'll call you back within 2 hours!"}


@router.get("/list")
async def list_leads(status: str = None, limit: int = 50, skip: int = 0):
    """Admin endpoint to view leads."""
    query = {}
    if status:
        query["status"] = status
    total = await db.leads.count_documents(query)
    leads = await db.leads.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return {"leads": leads, "total": total}


@router.put("/{phone}/status")
async def update_lead_status(phone: str, data: dict):
    status = data.get("status")
    if status not in ("new", "contacted", "converted", "lost"):
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.leads.update_one({"phone": phone}, {"$set": {"status": status}})
    return {"message": f"Lead status updated to {status}"}
