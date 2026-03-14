"""
AI Blog System — Auto-generates SEO-optimized articles with approval workflow
Uses DeepSeek API for content generation, OpenAI GPT Image 1 for featured images,
and APScheduler for periodic auto-generation.
"""

import os
import re
import json
import uuid
import base64
import logging
import random
from datetime import datetime, timezone
from typing import Optional
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/blog", tags=["blog"])

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

APPROVAL_EMAIL = "ckmotta@thegoodmen.in"
SITE_URL = "https://thegoodmen.in"

# Blog image uploads directory
BLOG_UPLOADS_DIR = Path(__file__).parent / "uploads" / "blog"
BLOG_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

BLOG_CATEGORIES = [
    "How-To Guides",
    "Cybersecurity & Privacy",
    "Troubleshooting & Tech Support",
    "Product Reviews & Comparisons",
    "Web Hosting & Domains",
    "Business IT Solutions",
    "Cloud & Business Tools",
    "Networking & Infrastructure",
    "Backup & Disaster Recovery",
    "Hardware & Devices",
]

DEFAULT_SETTINGS = {
    "auto_generate_enabled": False,
    "posts_per_week": 2,
    "preferred_days": ["monday", "thursday"],
    "preferred_hour": 9,
}

db = None
scheduler = AsyncIOScheduler()


def set_blog_db(database):
    global db
    db = database


def slugify(text):
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug[:80]


def serialize_doc(doc):
    if doc is None:
        return None
    d = {k: v for k, v in doc.items() if k != '_id'}
    if '_id' in doc:
        d['id'] = str(doc['_id'])
    return d


# --- Blog Settings ---

async def get_settings():
    """Get blog settings from DB, or return defaults."""
    settings = await db.blog_settings.find_one({"_id": "blog_config"}, {"_id": 0})
    if not settings:
        return dict(DEFAULT_SETTINGS)
    return settings


async def save_settings(settings: dict):
    """Upsert blog settings."""
    await db.blog_settings.update_one(
        {"_id": "blog_config"},
        {"$set": settings},
        upsert=True,
    )


# --- AI Content Generation via DeepSeek ---

TGME_BUSINESS_CONTEXT = """
THE GOOD MEN ENTERPRISE (TGME) — Business Context:
TGME is a professional IT solutions company based in India, serving SMBs and enterprises. Their services include:
- Annual Maintenance Contracts (AMC) for computers, printers, networking equipment, CCTV, UPS, servers
- IT infrastructure setup: LAN/WAN networking, firewall configuration, server deployment
- CCTV & surveillance system installation and maintenance
- Business email setup (Microsoft 365, Google Workspace)
- Web hosting, domain management, SSL certificates
- Cybersecurity: endpoint protection, firewall management, data backup & disaster recovery
- Hardware repair & device servicing (laptops, desktops, printers, Apple devices)
- Cloud migration & business tools implementation
- Remote & on-site IT support for businesses across India
Target audience: Indian SMBs, startups, mid-size companies, and enterprises looking for reliable IT support.
"""

SYSTEM_PROMPT = f"""You are an expert IT content writer for The Good Men Enterprise (TGME).
You write authoritative, SEO-optimized blog articles that are current, trending, and deeply relevant.

{TGME_BUSINESS_CONTEXT}

CRITICAL RULES:
- The current year is 2026. NEVER write about 2024 or 2025 as if they are the present. Reference them only as past years.
- Focus on what is happening NOW in 2026 — current trends, recent developments, new product launches, evolving regulations.
- Write ONLY factual, verified information. No fabricated stories, fake case studies, or simulated scenarios.
- Use real product names, real technologies, and current best practices.
- Target audience: Indian SMBs and businesses looking for IT solutions.
- Write in professional but accessible English.
- Include practical, actionable advice that businesses can implement today.
- Naturally mention TGME's services where relevant without being overly promotional.
- Optimize for Google search and AI/LLM platforms (use structured content, clear headings, answer common questions).
- Reference Indian context: GST compliance, DPDP Act, RBI digital payment regulations, Make in India, Digital India initiatives where relevant."""


async def research_trending_topic(category: str):
    """Step 1: Ask DeepSeek to research and suggest a specific, trending topic for 2026."""
    research_prompt = f"""You are an IT industry trend researcher. The current date is {datetime.now().strftime('%B %Y')}.

Research and identify ONE specific, high-search-volume, trending topic in the category "{category}" that is:
1. Highly relevant to Indian businesses RIGHT NOW in 2026
2. Related to TGME's IT services (AMC, networking, cybersecurity, cloud, hardware, CCTV, servers, email, web hosting)
3. Something businesses are actively searching for or concerned about
4. NOT a generic/evergreen topic — it should reference specific 2026 developments, products, regulations, or trends

Think about:
- New product launches or major updates in 2026
- Recent cybersecurity threats or data breaches affecting Indian businesses
- New Indian government regulations (DPDP Act enforcement, digital compliance)
- Technology shifts (AI integration in business operations, cloud migration trends)
- Cost optimization strategies businesses are adopting in 2026
- New tools, platforms, or services gaining traction in India

Return ONLY a JSON object (no markdown, no code blocks):
{{"topic": "Specific trending topic title", "why_trending": "Brief explanation of why this is relevant now in 2026", "search_intent": "What users are searching for"}}"""

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            DEEPSEEK_API_URL,
            headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": DEEPSEEK_MODEL,
                "messages": [{"role": "user", "content": research_prompt}],
                "temperature": 0.9,
                "max_tokens": 500,
            },
        )

    if response.status_code != 200:
        logger.warning(f"Topic research failed: {response.status_code}")
        return None

    try:
        text = response.json()["choices"][0]["message"]["content"].strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]
        return json.loads(text.strip())
    except Exception as e:
        logger.warning(f"Failed to parse topic research: {e}")
        return None


async def generate_featured_image(title: str, category: str) -> str:
    """Generate a featured image for the blog post using OpenAI GPT Image 1."""
    if not EMERGENT_LLM_KEY:
        logger.warning("EMERGENT_LLM_KEY not set, skipping image generation")
        return None

    try:
        from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

        image_gen = OpenAIImageGeneration(api_key=EMERGENT_LLM_KEY)

        image_prompt = f"""Professional, modern tech blog hero image for an article titled "{title}" in the "{category}" category. 
Style: Clean, corporate, minimal flat illustration with subtle gradients. Use a dark blue (#1e293b) to deep teal color palette with amber (#f59e0b) accents. 
Show abstract tech elements related to the topic — no text, no words, no letters in the image. 
Professional quality suitable for a business IT company blog. Wide landscape format."""

        images = await image_gen.generate_images(
            prompt=image_prompt,
            model="gpt-image-1",
            number_of_images=1,
        )

        if images and len(images) > 0:
            # Save to disk
            filename = f"{uuid.uuid4().hex[:12]}.png"
            filepath = BLOG_UPLOADS_DIR / filename
            with open(filepath, "wb") as f:
                f.write(images[0])

            image_url = f"/api/blog/uploads/{filename}"
            logger.info(f"Featured image generated: {image_url}")
            return image_url

    except Exception as e:
        logger.error(f"Image generation failed: {e}")

    return None


async def generate_blog_post(category: str, topic_hint: str = None):
    """Generate a full blog post using DeepSeek API with trend research and image generation."""
    if not DEEPSEEK_API_KEY:
        raise HTTPException(status_code=500, detail="DEEPSEEK_API_KEY not configured")

    # Step 1: Research trending topic if no hint provided
    topic_context = ""
    if topic_hint:
        topic_context = f'Write about this specific topic: {topic_hint}'
    else:
        research = await research_trending_topic(category)
        if research:
            topic_context = f"""Write about this trending topic: {research.get('topic', '')}
Context: {research.get('why_trending', '')}
User search intent: {research.get('search_intent', '')}"""
            logger.info(f"Topic researched: {research.get('topic', 'N/A')}")
        else:
            topic_context = f"Choose a specific, trending topic in this category that is highly relevant to Indian businesses in {datetime.now().year}."

    # Step 2: Generate the article
    current_date = datetime.now().strftime('%B %Y')
    prompt = f"""Write a comprehensive blog article for the category: "{category}"
{topic_context}

IMPORTANT: The current date is {current_date}. Write as if you are publishing TODAY. Reference current year {datetime.now().year} developments, not past years.

Return your response in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{{
  "title": "SEO-optimized title (60-70 chars ideal, must include {datetime.now().year} if relevant)",
  "excerpt": "Compelling 150-160 char meta description for Google",
  "content": "Full article in HTML format. Use <h2>, <h3> for headings, <p> for paragraphs, <ul>/<ol> for lists, <strong> for emphasis. Write 1500-2500 words. Include an introduction referencing current {datetime.now().year} context, 4-6 main sections with subheadings, practical tips for Indian businesses, and a conclusion. Add a section mentioning how TGME can help.",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "faq": [
    {{"question": "Common question 1?", "answer": "Detailed factual answer"}},
    {{"question": "Common question 2?", "answer": "Detailed factual answer"}},
    {{"question": "Common question 3?", "answer": "Detailed factual answer"}},
    {{"question": "Common question 4?", "answer": "Detailed factual answer"}}
  ],
  "meta_keywords": "comma, separated, seo, keywords"
}}"""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                DEEPSEEK_API_URL,
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": DEEPSEEK_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.8,
                    "max_tokens": 4096,
                },
            )

        if response.status_code != 200:
            logger.error(f"DeepSeek API error {response.status_code}: {response.text}")
            raise HTTPException(status_code=502, detail=f"DeepSeek API returned {response.status_code}")

        result = response.json()
        content_text = result["choices"][0]["message"]["content"]

        # Clean response — remove markdown code blocks if present
        cleaned = content_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()

        data = json.loads(cleaned)

        title = data.get("title", "Untitled")
        slug = slugify(title)
        # Ensure slug uniqueness
        existing = await db.blog_posts.find_one({"slug": slug})
        if existing:
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"

        html_content = data.get("content", "")
        word_count = len(html_content.split())
        reading_time = max(1, word_count // 250)

        # Step 3: Generate featured image
        featured_image = await generate_featured_image(title, category)

        post = {
            "post_id": uuid.uuid4().hex[:12],
            "title": title,
            "slug": slug,
            "excerpt": data.get("excerpt", ""),
            "content": html_content,
            "meta_description": data.get("excerpt", ""),
            "meta_keywords": data.get("meta_keywords", ""),
            "category": category,
            "tags": data.get("tags", []),
            "faq": data.get("faq", []),
            "featured_image": featured_image,
            "status": "pending",
            "word_count": word_count,
            "reading_time": reading_time,
            "auto_generated": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published_at": None,
            "rejected_reason": None,
        }

        result = await db.blog_posts.insert_one(post)
        post["id"] = str(result.inserted_id)
        del post["_id"]

        logger.info(f"Blog post generated: {title} [{category}]")
        return post

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response: {e}")
        raise HTTPException(status_code=500, detail="AI generated invalid response format")
    except httpx.TimeoutException:
        logger.error("DeepSeek API request timed out")
        raise HTTPException(status_code=504, detail="AI generation timed out — please try again")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Blog generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Scheduled Auto-Generation ---

async def scheduled_generate():
    """Called by APScheduler to auto-generate a blog post."""
    try:
        settings = await get_settings()
        if not settings.get("auto_generate_enabled"):
            return

        category = random.choice(BLOG_CATEGORIES)
        post = await generate_blog_post(category)
        logger.info(f"[Scheduler] Auto-generated blog post: {post['title']}")
    except Exception as e:
        logger.error(f"[Scheduler] Auto-generation failed: {e}")


def build_cron_trigger(settings: dict) -> CronTrigger:
    """Build a cron trigger based on settings."""
    days = settings.get("preferred_days", DEFAULT_SETTINGS["preferred_days"])
    hour = settings.get("preferred_hour", DEFAULT_SETTINGS["preferred_hour"])
    day_of_week = ",".join(d[:3] for d in days)
    return CronTrigger(day_of_week=day_of_week, hour=hour, minute=0)


async def sync_scheduler():
    """Sync the scheduler with current settings."""
    settings = await get_settings()

    # Remove existing job if any
    existing = scheduler.get_job("blog_auto_gen")
    if existing:
        scheduler.remove_job("blog_auto_gen")

    if settings.get("auto_generate_enabled"):
        trigger = build_cron_trigger(settings)
        scheduler.add_job(
            scheduled_generate,
            trigger=trigger,
            id="blog_auto_gen",
            replace_existing=True,
            misfire_grace_time=3600,
        )
        logger.info(f"[Scheduler] Blog auto-gen scheduled: days={settings.get('preferred_days')}, hour={settings.get('preferred_hour')}")
    else:
        logger.info("[Scheduler] Blog auto-gen disabled")


def start_scheduler():
    """Start APScheduler. Called once from server.py on startup."""
    if not scheduler.running:
        scheduler.start()
        logger.info("[Scheduler] APScheduler started")


# --- API Routes ---

@router.get("/categories")
async def get_categories():
    return BLOG_CATEGORIES


@router.get("/posts")
async def get_posts(
    status: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 12,
):
    query = {}
    if status:
        query["status"] = status
    else:
        query["status"] = "published"
    if category:
        query["category"] = category
    if tag:
        query["tags"] = tag
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"excerpt": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]

    total = await db.blog_posts.count_documents(query)
    skip = (page - 1) * limit
    posts = await db.blog_posts.find(query, {"content": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)

    return {
        "posts": [serialize_doc(p) for p in posts],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit,
    }


@router.get("/posts/{slug_or_id}")
async def get_post(slug_or_id: str):
    post = await db.blog_posts.find_one({"slug": slug_or_id})
    if not post:
        post = await db.blog_posts.find_one({"post_id": slug_or_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return serialize_doc(post)


@router.get("/sitemap")
async def get_sitemap():
    posts = await db.blog_posts.find({"status": "published"}, {"slug": 1, "published_at": 1, "category": 1}).to_list(1000)
    return [{"slug": p["slug"], "published_at": p.get("published_at"), "category": p.get("category")} for p in posts]


# --- Settings Routes ---

@router.get("/settings")
async def get_blog_settings():
    return await get_settings()


@router.put("/settings")
async def update_blog_settings(data: dict):
    allowed = {"auto_generate_enabled", "posts_per_week", "preferred_days", "preferred_hour"}
    update = {k: v for k, v in data.items() if k in allowed}

    # Validate posts_per_week
    ppw = update.get("posts_per_week")
    if ppw is not None and (not isinstance(ppw, int) or ppw < 1 or ppw > 7):
        raise HTTPException(status_code=400, detail="posts_per_week must be 1-7")

    # Validate preferred_days
    valid_days = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}
    days = update.get("preferred_days")
    if days is not None:
        if not isinstance(days, list) or not all(d in valid_days for d in days):
            raise HTTPException(status_code=400, detail="Invalid preferred_days")

    hour = update.get("preferred_hour")
    if hour is not None and (not isinstance(hour, int) or hour < 0 or hour > 23):
        raise HTTPException(status_code=400, detail="preferred_hour must be 0-23")

    current = await get_settings()
    current.update(update)

    # Auto-derive preferred_days from posts_per_week
    ppw_final = current.get("posts_per_week", 2)
    if "preferred_days" not in update:
        day_options = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        step = max(1, 7 // ppw_final)
        current["preferred_days"] = [day_options[i * step % 7] for i in range(ppw_final)]

    await save_settings(current)
    await sync_scheduler()

    return {"message": "Settings updated", "settings": current}


# --- Admin Routes ---

@router.post("/generate")
async def trigger_generation(category: str = None, topic: str = None):
    """Manually trigger AI blog generation"""
    cat = category or random.choice(BLOG_CATEGORIES)
    post = await generate_blog_post(cat, topic)
    return {"message": "Post generated", "post": post}


@router.post("/generate-batch")
async def trigger_batch_generation(count: int = 1):
    """Generate multiple posts across categories"""
    cats = random.sample(BLOG_CATEGORIES, min(count, len(BLOG_CATEGORIES)))
    results = []
    for cat in cats:
        try:
            post = await generate_blog_post(cat)
            results.append({"category": cat, "title": post["title"], "status": "generated"})
        except Exception as e:
            results.append({"category": cat, "error": str(e), "status": "failed"})
    return {"results": results}


@router.get("/approve/{post_id}")
async def approve_or_reject(post_id: str, action: str = Query(...)):
    """Email-based approve/reject via GET link"""
    if action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="Invalid action")

    post = await db.blog_posts.find_one({"post_id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if action == "approve":
        await db.blog_posts.update_one(
            {"post_id": post_id},
            {"$set": {"status": "published", "published_at": datetime.now(timezone.utc).isoformat()}}
        )
        from fastapi.responses import HTMLResponse
        return HTMLResponse(f"""
        <html><body style="font-family:Arial;text-align:center;padding:60px;background:#f0fdf4;">
        <h1 style="color:#22c55e;">Blog Post Approved!</h1>
        <p>"{post['title']}" is now live.</p>
        <a href="{SITE_URL}/blog/{post['slug']}" style="color:#d97706;">View Post</a>
        </body></html>""")
    else:
        await db.blog_posts.update_one(
            {"post_id": post_id},
            {"$set": {"status": "rejected"}}
        )
        from fastapi.responses import HTMLResponse
        return HTMLResponse(f"""
        <html><body style="font-family:Arial;text-align:center;padding:60px;background:#fef2f2;">
        <h1 style="color:#ef4444;">Blog Post Rejected</h1>
        <p>"{post['title']}" has been rejected.</p>
        <a href="{SITE_URL}/workspace/servicebook/blog-admin" style="color:#d97706;">Back to Admin</a>
        </body></html>""")


@router.put("/posts/{post_id}/status")
async def update_post_status(post_id: str, data: dict):
    """Admin panel approve/reject"""
    status = data.get("status")
    if status not in ("published", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="Invalid status")

    update = {"status": status}
    if status == "published":
        update["published_at"] = datetime.now(timezone.utc).isoformat()

    await db.blog_posts.update_one({"post_id": post_id}, {"$set": update})
    return {"message": f"Post status changed to {status}"}


@router.put("/posts/{post_id}")
async def update_post(post_id: str, data: dict):
    """Edit a post"""
    allowed = {"title", "excerpt", "content", "meta_description", "category", "tags", "faq", "featured_image"}
    update = {k: v for k, v in data.items() if k in allowed}
    if "title" in update:
        update["slug"] = slugify(update["title"])
    await db.blog_posts.update_one({"post_id": post_id}, {"$set": update})
    return {"message": "Post updated"}


@router.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    await db.blog_posts.delete_one({"post_id": post_id})
    return {"message": "Post deleted"}


# --- Scheduler Status ---

@router.get("/scheduler-status")
async def get_scheduler_status():
    job = scheduler.get_job("blog_auto_gen")
    settings = await get_settings()
    return {
        "scheduler_running": scheduler.running,
        "job_active": job is not None,
        "next_run": str(job.next_run_time) if job else None,
        "settings": settings,
    }
