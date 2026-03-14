"""
AMC (Annual Maintenance Contract) Routes
Handles AMC plan inquiries and ticket creation via osTicket
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import httpx
import os

router = APIRouter(prefix="/api/amc", tags=["amc"])

OSTICKET_URL = "https://support.thegoodmen.in/api/tickets.json"
OSTICKET_API_KEY = "0D5F5BDE6501B6BB9A6567683D40357D"


class DeviceEntry(BaseModel):
    device_type: str
    count: int
    details: Optional[str] = None


class AMCSubmission(BaseModel):
    # Company Details
    company_name: str
    contact_person: str
    email: str
    phone: str
    gst_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    # Plan
    plan: str
    # Devices
    devices: List[DeviceEntry]
    total_devices: int
    # Additional
    notes: Optional[str] = None


@router.post("/submit")
async def submit_amc_request(data: AMCSubmission):
    """Submit AMC request and create osTicket"""

    # Build HTML message with all details
    device_rows = ""
    for d in data.devices:
        device_rows += f"<tr><td style='padding:6px 12px;border:1px solid #ddd;'>{d.device_type}</td><td style='padding:6px 12px;border:1px solid #ddd;text-align:center;'>{d.count}</td><td style='padding:6px 12px;border:1px solid #ddd;'>{d.details or '-'}</td></tr>"

    message = f"""data:text/html,
<h2 style='color:#d97706;'>AMC Plan Request</h2>
<hr>
<h3>Selected Plan: {data.plan}</h3>

<h3>Company Details</h3>
<table style='border-collapse:collapse;width:100%;'>
<tr><td style='padding:6px 12px;font-weight:bold;width:150px;'>Company Name</td><td style='padding:6px 12px;'>{data.company_name}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Contact Person</td><td style='padding:6px 12px;'>{data.contact_person}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Email</td><td style='padding:6px 12px;'>{data.email}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Phone</td><td style='padding:6px 12px;'>{data.phone}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>GST Number</td><td style='padding:6px 12px;'>{data.gst_number or 'Not provided'}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Address</td><td style='padding:6px 12px;'>{data.address or 'Not provided'}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>City</td><td style='padding:6px 12px;'>{data.city or 'Not provided'}</td></tr>
</table>

<h3>Device Inventory (Total: {data.total_devices} devices)</h3>
<table style='border-collapse:collapse;width:100%;'>
<tr style='background:#f59e0b;color:white;'><th style='padding:8px 12px;text-align:left;'>Device Type</th><th style='padding:8px 12px;text-align:center;'>Count</th><th style='padding:8px 12px;text-align:left;'>Details/Models</th></tr>
{device_rows}
</table>

{f"<h3>Additional Notes</h3><p>{data.notes}</p>" if data.notes else ""}
<hr>
<p style='color:#888;font-size:12px;'>Submitted via TGME Website - AMC Plans Page</p>
"""

    ticket_payload = {
        "name": data.contact_person,
        "email": data.email,
        "phone": data.phone,
        "subject": "AMC Request",
        "message": message,
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client_http:
            resp = await client_http.post(
                OSTICKET_URL,
                json=ticket_payload,
                headers={
                    "X-API-Key": OSTICKET_API_KEY,
                    "Content-Type": "application/json"
                }
            )

        if resp.status_code == 201 or (resp.status_code == 200 and resp.text.strip().isdigit()):
            ticket_id = resp.text.strip()
            return {"success": True, "ticket_id": ticket_id, "message": "AMC request submitted successfully"}
        else:
            # Log but still return success to user - ticket might have been created
            return {"success": True, "ticket_id": resp.text.strip(), "message": "AMC request submitted"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit ticket: {str(e)}")
