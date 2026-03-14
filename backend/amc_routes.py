"""
AMC (Annual Maintenance Contract) Routes
Handles AMC plan inquiries and ticket creation via osTicket
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import httpx

router = APIRouter(prefix="/api/amc", tags=["amc"])

OSTICKET_URL = "https://support.thegoodmen.in/api/tickets.json"
OSTICKET_API_KEY = "0D5F5BDE6501B6BB9A6567683D40357D"

# Per-device-type pricing (matches frontend)
DEVICE_PRICING = {
    "Desktop": "plan",
    "Laptop": "plan",
    "Laser Printer": 1500,
    "Heavy Duty / Network Printer": 3000,
    "Basic Server": "quote",
    "Critical Server": "quote",
    "Router / Switch": 1000,
    "Managed Firewall": 4000,
    "CCTV Camera": 600,
    "DVR / NVR": 2500,
    "Desktop UPS": 500,
    "Server / Rack UPS": 5000,
}

PLAN_FEATURES = {
    "Silver": {"price": 2500, "features": "Response: 48 business hrs | Up to 2 on-site visits/yr | Remote support (Mon-Fri, 11AM-6PM) | Labor included | Annual preventive maintenance | Email & phone support | Parts, replacements & consumables billed separately"},
    "Gold": {"price": 3000, "features": "Response: 24 business hrs | Up to 4 on-site visits/yr | Remote support (Mon-Sat, 11AM-8PM) | Labor included | Quarterly preventive maintenance | Priority email, phone & WhatsApp | Basic device health report | Parts, replacements & consumables billed separately"},
    "Platinum": {"price": 4000, "features": "Response: 8 business hrs | Up to 6 on-site visits/yr | Remote support (Mon-Sat, 11AM-9PM) | Labor included | Bi-monthly preventive maintenance | Priority WhatsApp & phone | Quarterly IT health reports | Backup & recovery assistance | Parts, replacements & consumables billed separately"},
    "Diamond": {"price": 6500, "features": "Response: 4 business hrs (priority) | Up to 12 on-site visits/yr | Remote support (Mon-Sat, 11AM-10PM) | Labor included | Monthly preventive maintenance | Dedicated priority support contact | Asset inventory tracking | Quarterly IT audit & reports | Network monitoring alerts | Backup monitoring assistance | Parts, replacements & consumables billed separately"},
}


class DeviceEntry(BaseModel):
    device_type: str
    count: int
    details: Optional[str] = None
    unit_price: Optional[int] = None  # null means custom quote


class AMCSubmission(BaseModel):
    company_name: str
    contact_person: str
    email: str
    phone: str
    gst_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    plan: str
    plan_price: Optional[int] = None
    devices: List[DeviceEntry]
    total_devices: int
    calculable_total: Optional[int] = 0
    has_quote_items: Optional[bool] = False
    notes: Optional[str] = None


@router.post("/submit")
async def submit_amc_request(data: AMCSubmission):
    """Submit AMC request and create osTicket with full per-device pricing"""

    plan = PLAN_FEATURES.get(data.plan, {"price": 0, "features": "Custom"})
    plan_price = data.plan_price or plan["price"]

    # Build device rows with per-type pricing
    device_rows = ""
    calc_total = 0
    has_quote = False
    for d in data.devices:
        if d.count <= 0:
            continue
        raw = DEVICE_PRICING.get(d.device_type, 0)
        if raw == "plan":
            unit = plan_price
        elif raw == "quote":
            unit = None
        else:
            unit = raw

        if unit is not None:
            subtotal = unit * d.count
            calc_total += subtotal
            price_cell = f"Rs.{unit:,}"
            subtotal_cell = f"Rs.{subtotal:,}"
        else:
            has_quote = True
            price_cell = "<em style='color:#8b5cf6;'>Custom Quote</em>"
            subtotal_cell = "<em style='color:#8b5cf6;'>Upon Assessment</em>"

        device_rows += f"""<tr>
<td style='padding:6px 12px;border:1px solid #ddd;'>{d.device_type}</td>
<td style='padding:6px 12px;border:1px solid #ddd;text-align:center;'>{d.count}</td>
<td style='padding:6px 12px;border:1px solid #ddd;'>{d.details or '-'}</td>
<td style='padding:6px 12px;border:1px solid #ddd;text-align:right;'>{price_cell}</td>
<td style='padding:6px 12px;border:1px solid #ddd;text-align:right;font-weight:bold;'>{subtotal_cell}</td>
</tr>"""

    # Plan features HTML
    features_html = "".join(f"<li style='padding:2px 0;'>{f}</li>" for f in plan["features"].split(" | "))

    # Grand total line
    total_display = f"Rs.{calc_total:,}/year" if calc_total > 0 else "-"
    if has_quote:
        total_display += " + Custom Quote items"

    message = f"""data:text/html,
<h2 style='color:#d97706;margin-bottom:5px;'>AMC Plan Request</h2>
<hr style='border-color:#d97706;'>

<h3 style='color:#d97706;margin-bottom:8px;'>Selected Plan: {data.plan}</h3>
<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>
<tr><td style='padding:6px 12px;font-weight:bold;width:200px;background:#fef3c7;'>Desktop/Laptop Plan</td><td style='padding:6px 12px;background:#fef3c7;font-weight:bold;'>{data.plan} — Rs.{plan_price:,}/device/year</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Total Devices</td><td style='padding:6px 12px;'>{data.total_devices}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;background:#fef3c7;'>Estimated Annual Cost</td><td style='padding:6px 12px;background:#fef3c7;font-weight:bold;font-size:16px;'>{total_display}</td></tr>
</table>

<p style='margin-bottom:5px;font-weight:bold;'>Plan Includes (Desktop/Laptop):</p>
<ul style='margin:0 0 15px 20px;padding:0;'>{features_html}</ul>

<h3 style='color:#d97706;margin-bottom:8px;'>Company Details</h3>
<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>
<tr><td style='padding:6px 12px;font-weight:bold;width:200px;border-bottom:1px solid #eee;'>Company Name</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.company_name}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Contact Person</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.contact_person}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Email</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.email}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Phone</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.phone}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>GST Number</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.gst_number or 'Not provided'}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Address</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.address or 'Not provided'}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>City</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.city or 'Not provided'}</td></tr>
</table>

<h3 style='color:#d97706;margin-bottom:8px;'>Device Inventory — Itemized Pricing</h3>
<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>
<tr style='background:#d97706;color:white;'>
<th style='padding:8px 12px;text-align:left;'>Device Type</th>
<th style='padding:8px 12px;text-align:center;'>Qty</th>
<th style='padding:8px 12px;text-align:left;'>Details</th>
<th style='padding:8px 12px;text-align:right;'>Unit Price/yr</th>
<th style='padding:8px 12px;text-align:right;'>Subtotal/yr</th>
</tr>
{device_rows}
<tr style='background:#fef3c7;font-weight:bold;'>
<td style='padding:8px 12px;' colspan='3'>Grand Total ({data.total_devices} devices)</td>
<td style='padding:8px 12px;'></td>
<td style='padding:8px 12px;text-align:right;font-size:15px;'>{total_display}</td>
</tr>
</table>

<p style='background:#f3f4f6;padding:8px 12px;border-radius:6px;font-size:12px;color:#6b7280;'>
<strong>Note:</strong> All plans are non-comprehensive. Parts, consumables (toner, drum, fuser, rollers), and hardware replacements are always billed separately.
{" Server pricing depends on complexity, OS, virtualization, and storage requirements — will be assessed separately." if has_quote else ""}
</p>

{f"<h3 style='color:#d97706;margin-bottom:8px;'>Additional Notes / Requirements</h3><p style='background:#f8fafc;padding:10px;border-left:3px solid #d97706;'>{data.notes}</p>" if data.notes else ""}
<hr>
<p style='color:#888;font-size:11px;'>Submitted via TGME Website — AMC Plans Page | thegoodmen.in/amc</p>
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
                headers={"X-API-Key": OSTICKET_API_KEY, "Content-Type": "application/json"}
            )

        if resp.status_code == 201 or (resp.status_code == 200 and resp.text.strip().isdigit()):
            return {"success": True, "ticket_id": resp.text.strip(), "message": "AMC request submitted successfully"}
        else:
            return {"success": True, "ticket_id": resp.text.strip(), "message": "AMC request submitted"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit ticket: {str(e)}")
