"""
TGME Lead Scraper — Finds businesses via Google Maps / web search.
Targets: shipping, logistics, clearing & forwarding, trading, manufacturing,
pharma, IT-heavy offices in Mumbai central line areas.
"""

import httpx
import re
import asyncio
import logging
from datetime import datetime, timezone
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)

try:
    from ddgs import DDGS
    HAS_DDGS = True
except ImportError:
    try:
        from duckduckgo_search import DDGS
        HAS_DDGS = True
    except ImportError:
        HAS_DDGS = False

# Target business types for TGME (10-300 employees, high revenue, heavy computer users)
BUSINESS_TYPES = [
    "shipping company", "logistics company", "clearing and forwarding agent",
    "freight forwarder", "import export company", "trading company",
    "pharmaceutical company", "manufacturing company", "warehouse company",
    "IT company", "software company", "financial services", "insurance company",
    "stock broker", "mutual fund distributor", "NBFC",
    "advertising agency", "media company", "architect firm",
    "law firm", "corporate office", "BPO company", "KPO company",
    "e-commerce company", "real estate office", "construction company",
    "textile company", "chemical company", "engineering company",
]

LOCATIONS = [
    "Mulund Mumbai", "Thane", "Vikhroli Mumbai", "Vidyavihar Mumbai",
    "Ghatkopar Mumbai", "Dadar Mumbai", "Bhandup Mumbai",
    "Powai Mumbai", "Kurla Mumbai", "Sion Mumbai",
    "Parel Mumbai", "Fort Mumbai", "Churchgate Mumbai",
    "Nariman Point Mumbai", "Andheri East Mumbai",
    "Kanjurmarg Mumbai", "Nahur Mumbai",
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


async def scrape_duckduckgo(query: str, num_results: int = 15) -> list:
    """Search DuckDuckGo using the duckduckgo-search library (reliable)."""
    results = []
    if not HAS_DDGS:
        return results

    try:
        loop = asyncio.get_event_loop()
        raw = await loop.run_in_executor(None, _ddg_search_sync, query, num_results)
        for r in raw:
            title = r.get("title", "")
            link = r.get("href", "")
            snippet = r.get("body", "")

            phone = extract_phone(snippet) or extract_phone(title)
            email = extract_email(snippet)

            skip = ["wikipedia.org", "youtube.com", "facebook.com", "twitter.com", "instagram.com"]
            if title and not any(x in link for x in skip):
                results.append({
                    "name": clean_business_name(title),
                    "website": link,
                    "phone": phone,
                    "email": email,
                    "snippet": snippet[:300],
                })
    except Exception as e:
        logger.warning(f"DuckDuckGo search error: {e}")

    return results[:num_results]


def _ddg_search_sync(query: str, num: int) -> list:
    """Synchronous DDG search wrapper."""
    try:
        return DDGS().text(query, max_results=num)
    except Exception as e:
        logger.warning(f"DDG sync error: {e}")
        return []


def clean_business_name(title: str) -> str:
    """Clean up search result titles to extract business name."""
    # Remove common suffixes
    for suffix in [" - Home", " | Home", " - About", " | LinkedIn", " - Google Maps",
                   " - Justdial", " - IndiaMART", " Reviews", " Contact", " - Overview"]:
        title = title.replace(suffix, "")
    return title.strip()


async def scrape_google_search(query: str, num_results: int = 10) -> list:
    """Scrape Google search results for business info."""
    results = []
    url = f"https://www.google.com/search?q={quote_plus(query)}&num={num_results}"

    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url, headers=HEADERS)
            if resp.status_code != 200:
                return results

            soup = BeautifulSoup(resp.text, "html.parser")

            for div in soup.select("div.g, div[data-hveid]"):
                title_el = div.select_one("h3")
                link_el = div.select_one("a[href]")
                snippet_el = div.select_one("div.VwiC3b, span.st, div[data-sncf]")

                if not title_el:
                    continue

                title = title_el.get_text(strip=True)
                link = link_el["href"] if link_el else ""
                snippet = snippet_el.get_text(strip=True) if snippet_el else ""

                if link.startswith("/url?q="):
                    link = link.split("/url?q=")[1].split("&")[0]

                phone = extract_phone(snippet) or extract_phone(title)
                email = extract_email(snippet)

                if title and not any(x in link for x in ["google.com", "youtube.com", "wikipedia.org", "facebook.com"]):
                    results.append({
                        "name": title,
                        "website": link,
                        "phone": phone,
                        "email": email,
                        "snippet": snippet[:300],
                    })
    except Exception as e:
        logger.warning(f"Google search error: {e}")

    return results


async def scrape_justdial(query: str, location: str) -> list:
    """Scrape JustDial for business listings (Indian business directory)."""
    results = []
    url = f"https://www.justdial.com/{location.replace(' ', '-')}/{query.replace(' ', '-')}"

    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url, headers={**HEADERS, "Referer": "https://www.justdial.com/"})
            if resp.status_code != 200:
                return results

            soup = BeautifulSoup(resp.text, "html.parser")

            for card in soup.select("li.cntanr, div.resultbox_info, section.jdlist"):
                name_el = card.select_one("span.lng_lst_nm, h2 a, .resultbox_title_anchor")
                addr_el = card.select_one("span.cont_fl_addr, .resultbox_address")
                phone_el = card.select_one("a[href^='tel:'], .telelist")

                name = name_el.get_text(strip=True) if name_el else ""
                address = addr_el.get_text(strip=True) if addr_el else ""
                phone = ""
                if phone_el:
                    href = phone_el.get("href", "")
                    if href.startswith("tel:"):
                        phone = href.replace("tel:", "")
                    else:
                        phone = extract_phone(phone_el.get_text())

                if name:
                    results.append({
                        "name": name,
                        "address": address,
                        "phone": phone,
                        "website": "",
                        "email": "",
                        "snippet": address,
                    })
    except Exception as e:
        logger.warning(f"JustDial scrape error: {e}")

    return results


async def scrape_indiamart(query: str, location: str) -> list:
    """Scrape IndiaMart for business listings."""
    results = []
    url = f"https://dir.indiamart.com/search.mp?ss={quote_plus(query)}&cq={quote_plus(location)}"

    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url, headers=HEADERS)
            if resp.status_code != 200:
                return results

            soup = BeautifulSoup(resp.text, "html.parser")

            for card in soup.select("div.lst, div.producttxt"):
                name_el = card.select_one("a.lnksnmn, .lcname, h2 a")
                addr_el = card.select_one("p.lc, span.aci, .lcity")
                phone_el = card.select_one("span.phn, a[href^='tel:']")

                name = name_el.get_text(strip=True) if name_el else ""
                address = addr_el.get_text(strip=True) if addr_el else ""
                phone = ""
                if phone_el:
                    href = phone_el.get("href", "")
                    if href.startswith("tel:"):
                        phone = href.replace("tel:", "")
                    else:
                        phone = extract_phone(phone_el.get_text())

                if name:
                    results.append({
                        "name": name,
                        "address": address,
                        "phone": phone,
                        "website": "",
                        "email": "",
                        "snippet": address,
                    })
    except Exception as e:
        logger.warning(f"IndiaMart scrape error: {e}")

    return results


def extract_phone(text: str) -> str:
    """Extract Indian phone number from text."""
    if not text:
        return ""
    patterns = [
        r'(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}',
        r'(?:022|0\d{2,3})[\s-]?\d{7,8}',
        r'[6-9]\d{9}',
    ]
    for p in patterns:
        m = re.search(p, text.replace(" ", ""))
        if m:
            num = re.sub(r'[\s\-]', '', m.group())
            if len(num) >= 10:
                return num
    return ""


def extract_email(text: str) -> str:
    """Extract email from text."""
    if not text:
        return ""
    m = re.search(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', text)
    return m.group() if m else ""


async def run_scrape_job(db, job_id: str, locations: list, business_types: list, sources: list):
    """Run a full scrape job — searches multiple sources for leads."""
    total_found = 0
    total_new = 0

    try:
        await db.scrape_jobs.update_one(
            {"job_id": job_id},
            {"$set": {"status": "running", "started_at": datetime.now(timezone.utc).isoformat()}}
        )

        for loc in locations:
            for btype in business_types:
                query = f"{btype} in {loc}"
                raw_results = []

                if "google" in sources:
                    google_q = f"{btype} {loc} phone number contact"
                    r = await scrape_google_search(google_q, 10)
                    raw_results.extend(r)
                    await asyncio.sleep(2)

                    # Also try DuckDuckGo (more reliable)
                    ddg_q = f"{btype} near {loc} contact phone"
                    r2 = await scrape_duckduckgo(ddg_q, 15)
                    raw_results.extend(r2)
                    await asyncio.sleep(1)

                if "justdial" in sources:
                    r = await scrape_justdial(btype, loc)
                    raw_results.extend(r)
                    await asyncio.sleep(1)

                if "indiamart" in sources:
                    r = await scrape_indiamart(btype, loc)
                    raw_results.extend(r)
                    await asyncio.sleep(1)

                for item in raw_results:
                    total_found += 1
                    name = item.get("name", "").strip()
                    phone = item.get("phone", "").strip()

                    if not name:
                        continue

                    existing = None
                    if phone:
                        existing = await db.scraped_leads.find_one({"phone": phone})
                    if not existing and name:
                        existing = await db.scraped_leads.find_one({"name": {"$regex": f"^{re.escape(name[:30])}", "$options": "i"}})

                    if existing:
                        continue

                    lead = {
                        "name": name,
                        "phone": phone,
                        "email": item.get("email", ""),
                        "website": item.get("website", ""),
                        "address": item.get("address", "") or item.get("snippet", ""),
                        "business_type": btype,
                        "location": loc,
                        "source": "scraper",
                        "scrape_job_id": job_id,
                        "status": "new",
                        "notes": "",
                        "created_at": datetime.now(timezone.utc).isoformat(),
                    }
                    await db.scraped_leads.insert_one(lead)
                    lead.pop("_id", None)
                    total_new += 1

                await db.scrape_jobs.update_one(
                    {"job_id": job_id},
                    {"$set": {"found": total_found, "new_leads": total_new, "last_query": query}}
                )

        await db.scrape_jobs.update_one(
            {"job_id": job_id},
            {"$set": {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "found": total_found,
                "new_leads": total_new,
            }}
        )
    except Exception as e:
        logger.error(f"Scrape job {job_id} failed: {e}")
        await db.scrape_jobs.update_one(
            {"job_id": job_id},
            {"$set": {"status": "failed", "error": str(e)}}
        )
