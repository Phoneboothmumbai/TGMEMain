"""
Contact Form Routes — Creates osTicket from the website contact form
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx

router = APIRouter(prefix="/api/contact", tags=["contact"])

OSTICKET_URL = "https://support.thegoodmen.in/api/tickets.json"
OSTICKET_API_KEY = "0D5F5BDE6501B6BB9A6567683D40357D"


class ContactFormData(BaseModel):
    name: str
    email: str
    company: Optional[str] = ""
    phone: Optional[str] = ""
    message: str


@router.post("/submit")
async def submit_contact_form(data: ContactFormData):
    """Create an osTicket from the website contact form."""
    if not data.name.strip() or not data.email.strip() or not data.message.strip():
        raise HTTPException(status_code=400, detail="Name, email, and message are required")

    html_message = f"""
<h3>New Enquiry from Website Contact Form</h3>
<table style='border-collapse:collapse;width:100%;'>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;width:140px;'>Name</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.name}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Email</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.email}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Company</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.company or 'N/A'}</td></tr>
<tr><td style='padding:6px 12px;border:1px solid #ddd;font-weight:bold;'>Phone</td><td style='padding:6px 12px;border:1px solid #ddd;'>{data.phone or 'N/A'}</td></tr>
</table>
<h4 style='margin-top:16px;'>Message</h4>
<p>{data.message}</p>
<hr>
<p style='color:#888;font-size:11px;'>Submitted via TGME Website — Contact Form | thegoodmen.in</p>
"""

    ticket_payload = {
        "name": data.name,
        "email": data.email,
        "phone": data.phone or "",
        "subject": f"Website Enquiry — {data.company or data.name}",
        "message": html_message,
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client_http:
            resp = await client_http.post(
                OSTICKET_URL,
                json=ticket_payload,
                headers={"X-API-Key": OSTICKET_API_KEY, "Content-Type": "application/json"},
            )

        if resp.status_code in (200, 201):
            return {"success": True, "ticket_id": resp.text.strip(), "message": "Your message has been sent. We'll get back to you within 24 hours."}
        else:
            return {"success": True, "message": "Your message has been received. We'll get back to you soon."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit: {str(e)}")
