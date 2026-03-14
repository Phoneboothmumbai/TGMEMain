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

    # Plan details lookup
    plan_info = {
        "Silver": {"price": 2500, "features": "Response: 48hrs | 2 on-site visits/yr | Remote support (business hrs) | Labor included | Parts at actuals | Annual preventive checkup | Email & phone support"},
        "Gold": {"price": 3000, "features": "Response: 24hrs | 4 on-site visits/yr | Remote support (extended hrs) | Labor included | Parts at discounted rates | Quarterly preventive maintenance | Priority email, phone & WhatsApp | Monthly health reports"},
        "Platinum": {"price": 4000, "features": "Response: 8hrs | 6 on-site visits/yr | Remote support (extended hrs) | Labor included | Parts at cost price | Bi-monthly preventive maintenance | Priority WhatsApp & phone | Quarterly health reports | Backup & recovery assistance"},
        "Diamond": {"price": 6500, "features": "Response: 4hrs (Priority) | Unlimited on-site visits | 24/7 remote support | Labor + Parts fully included | Monthly preventive maintenance | Dedicated Account Manager | Asset tracking & inventory | Quarterly IT audit & reports | Data backup & disaster recovery | Network monitoring & alerts | Replacement device during repair"},
    }
    selected = plan_info.get(data.plan, {"price": 0, "features": "Custom plan"})
    per_device = selected["price"]
    total_cost = per_device * data.total_devices

    # Build device rows
    device_rows = ""
    for d in data.devices:
        subtotal = per_device * d.count
        device_rows += f"<tr><td style='padding:6px 12px;border:1px solid #ddd;'>{d.device_type}</td><td style='padding:6px 12px;border:1px solid #ddd;text-align:center;'>{d.count}</td><td style='padding:6px 12px;border:1px solid #ddd;'>{d.details or '-'}</td><td style='padding:6px 12px;border:1px solid #ddd;text-align:right;'>Rs.{subtotal:,}/yr</td></tr>"

    # Build feature rows
    features_html = ""
    for f in selected["features"].split(" | "):
        features_html += f"<li style='padding:2px 0;'>{f}</li>"

    message = f"""data:text/html,
<h2 style='color:#d97706;margin-bottom:5px;'>AMC Plan Request</h2>
<hr style='border-color:#d97706;'>

<h3 style='color:#d97706;margin-bottom:8px;'>Selected Plan: {data.plan}</h3>
<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>
<tr><td style='padding:6px 12px;font-weight:bold;width:180px;background:#fef3c7;'>Plan Name</td><td style='padding:6px 12px;background:#fef3c7;font-weight:bold;'>{data.plan}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Rate Per Device</td><td style='padding:6px 12px;'>Rs.{per_device:,}/device/year</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Total Devices</td><td style='padding:6px 12px;'>{data.total_devices}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;background:#fef3c7;'>Estimated Annual Cost</td><td style='padding:6px 12px;background:#fef3c7;font-weight:bold;font-size:16px;'>Rs.{total_cost:,}/year</td></tr>
</table>
<p style='margin-bottom:5px;font-weight:bold;'>Plan Includes:</p>
<ul style='margin:0 0 15px 20px;padding:0;'>{features_html}</ul>

<h3 style='color:#d97706;margin-bottom:8px;'>Company Details</h3>
<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>
<tr><td style='padding:6px 12px;font-weight:bold;width:180px;border-bottom:1px solid #eee;'>Company Name</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.company_name}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Contact Person</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.contact_person}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Email</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.email}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Phone</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.phone}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>GST Number</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.gst_number or 'Not provided'}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Address</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.address or 'Not provided'}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>City</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.city or 'Not provided'}</td></tr>
</table>

<h3 style='color:#d97706;margin-bottom:8px;'>Device Inventory (Total: {data.total_devices} devices)</h3>
<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>
<tr style='background:#d97706;color:white;'><th style='padding:8px 12px;text-align:left;'>Device Type</th><th style='padding:8px 12px;text-align:center;'>Count</th><th style='padding:8px 12px;text-align:left;'>Details/Models</th><th style='padding:8px 12px;text-align:right;'>Subtotal</th></tr>
{device_rows}
<tr style='background:#fef3c7;font-weight:bold;'><td style='padding:8px 12px;' colspan='2'>Grand Total</td><td style='padding:8px 12px;'>{data.total_devices} devices</td><td style='padding:8px 12px;text-align:right;font-size:15px;'>Rs.{total_cost:,}/year</td></tr>
</table>

{f"<h3 style='color:#d97706;margin-bottom:8px;'>Additional Notes / Requirements</h3><p style='background:#f8fafc;padding:10px;border-left:3px solid #d97706;'>{data.notes}</p>" if data.notes else ""}
<hr>
<p style='color:#888;font-size:11px;'>Submitted via TGME Website - AMC Plans Page | thegoodmen.in/amc</p>
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
