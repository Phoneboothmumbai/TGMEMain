"""
Support Form Routes — Handles quote and support ticket submissions to osTicket
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import httpx

router = APIRouter(prefix="/api/support", tags=["support"])

OSTICKET_URL = "https://support.thegoodmen.in/api/tickets.json"
OSTICKET_API_KEY = "0D5F5BDE6501B6BB9A6567683D40357D"


class SupportSubmission(BaseModel):
    form_type: str  # "quote" or "support"
    name: str
    email: str
    phone: str
    company_name: str
    category: str
    sub_topic: str
    priority: Optional[str] = "normal"
    description: Optional[str] = ""
    dynamic_fields: Optional[Dict[str, Any]] = {}


@router.post("/submit")
async def submit_support_request(data: SupportSubmission):
    is_quote = data.form_type == "quote"
    subject = f"{'Quote Request' if is_quote else 'Support Request'} — {data.category}"

    # Build dynamic fields HTML
    dyn_html = ""
    if data.dynamic_fields:
        dyn_rows = ""
        for key, val in data.dynamic_fields.items():
            if val:
                label = key.replace("_", " ").title()
                dyn_rows += f"<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;width:200px;'>{label}</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{val}</td></tr>"
        if dyn_rows:
            dyn_html = f"""
<h3 style='color:#d97706;margin-bottom:8px;'>Additional Details</h3>
<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>{dyn_rows}</table>"""

    color = "#d97706" if is_quote else "#2563eb"
    type_label = "Quote Request" if is_quote else "Support Request"
    priority_badge = ""
    if data.priority == "urgent":
        priority_badge = "<span style='background:#ef4444;color:white;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:bold;'>URGENT</span>"

    message = f"""data:text/html,
<h2 style='color:{color};margin-bottom:5px;'>{type_label}</h2>
{priority_badge}
<hr style='border-color:{color};'>

<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>
<tr><td style='padding:6px 12px;font-weight:bold;width:200px;background:#fef3c7;'>Type</td><td style='padding:6px 12px;background:#fef3c7;font-weight:bold;'>{type_label}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Category</td><td style='padding:6px 12px;'>{data.category}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Sub-Topic</td><td style='padding:6px 12px;'>{data.sub_topic}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;'>Priority</td><td style='padding:6px 12px;'>{data.priority.upper()}</td></tr>
</table>

<h3 style='color:{color};margin-bottom:8px;'>Contact Information</h3>
<table style='border-collapse:collapse;width:100%;margin-bottom:15px;'>
<tr><td style='padding:6px 12px;font-weight:bold;width:200px;border-bottom:1px solid #eee;'>Name</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.name}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Email</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.email}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Phone</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.phone}</td></tr>
<tr><td style='padding:6px 12px;font-weight:bold;border-bottom:1px solid #eee;'>Company</td><td style='padding:6px 12px;border-bottom:1px solid #eee;'>{data.company_name}</td></tr>
</table>

{dyn_html}

{f"<h3 style='color:{color};margin-bottom:8px;'>Description</h3><p style='background:#f8fafc;padding:10px;border-left:3px solid {color};white-space:pre-wrap;'>{data.description}</p>" if data.description else ""}
<hr>
<p style='color:#888;font-size:11px;'>Submitted via TGME Website | thegoodmen.in/support</p>
"""

    ticket_payload = {
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "subject": subject,
        "message": message,
        "alert": True,
        "autorespond": True,
        "source": "API",
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client_http:
            resp = await client_http.post(
                OSTICKET_URL,
                json=ticket_payload,
                headers={"X-API-Key": OSTICKET_API_KEY, "Content-Type": "application/json"}
            )
        ticket_id = resp.text.strip()
        if ticket_id.isdigit():
            return {"success": True, "ticket_id": ticket_id}
        raise HTTPException(status_code=502, detail=f"osTicket error: {ticket_id}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit: {str(e)}")
