"""
AI Blog System — Auto-generates SEO-optimized articles with approval workflow
"""

import os
import re
import json
import uuid
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/blog", tags=["blog"])

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
APPROVAL_EMAIL = "ckmotta@thegoodmen.in"
SITE_URL = "https://thegoodmen.in"

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

db = None

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


# --- AI Content Generation ---

async def generate_blog_post(category: str, topic_hint: str = None):
    """Generate a full blog post using GPT-5.2"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"blog-gen-{uuid.uuid4().hex[:8]}",
        system_message="""You are an expert IT content writer for The Good Men Enterprise (TGME), 
a professional IT solutions company based in India. You write authoritative, SEO-optimized blog articles.

STRICT RULES:
- Write ONLY factual, verified information. No fabricated stories, fake case studies, or simulated scenarios.
- Use real product names, real technologies, and current best practices.
- Every technical claim must be accurate and verifiable.
- Target audience: Indian SMBs and businesses looking for IT solutions.
- Write in professional but accessible English.
- Include practical, actionable advice.
- Naturally mention TGME's services where relevant (IT support, AMC, networking, CCTV, email setup, etc.) without being overly promotional.
- Optimize for Google search and AI/LLM platforms."""
    ).with_model("openai", "gpt-5.2")

    prompt = f"""Write a comprehensive blog article for the category: "{category}"
{f'Topic hint: {topic_hint}' if topic_hint else 'Choose a trending, high-search-volume topic in this category relevant to Indian businesses in 2025-2026.'}

Return your response in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{{
  "title": "SEO-optimized title (60-70 chars ideal)",
  "excerpt": "Compelling 150-160 char meta description for Google",
  "content": "Full article in HTML format. Use <h2>, <h3> for headings, <p> for paragraphs, <ul>/<ol> for lists, <strong> for emphasis. Write 1500-2500 words. Include an introduction, 4-6 main sections with subheadings, practical tips, and a conclusion. Add a section mentioning how TGME can help.",
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
        response = await chat.send_message(UserMessage(text=prompt))
        # Clean response — remove markdown code blocks if present
        cleaned = response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned.rsplit("```", 1)[0]
        cleaned = cleaned.strip()

        data = json.loads(cleaned)

        title = data.get("title", "Untitled")
        slug = slugify(title)
        content = data.get("content", "")
        word_count = len(content.split())
        reading_time = max(1, word_count // 250)

        post = {
            "post_id": uuid.uuid4().hex[:12],
            "title": title,
            "slug": slug,
            "excerpt": data.get("excerpt", ""),
            "content": content,
            "meta_description": data.get("excerpt", ""),
            "meta_keywords": data.get("meta_keywords", ""),
            "category": category,
            "tags": data.get("tags", []),
            "faq": data.get("faq", []),
            "featured_image": None,
            "status": "pending",
            "word_count": word_count,
            "reading_time": reading_time,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published_at": None,
            "rejected_reason": None,
        }

        result = await db.blog_posts.insert_one(post)
        post["id"] = str(result.inserted_id)
        del post["_id"]

        # Send approval email
        await send_approval_email(post)

        return post

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response: {e}")
        raise HTTPException(status_code=500, detail="AI generated invalid response format")
    except Exception as e:
        logger.error(f"Blog generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Email Notification ---

async def send_approval_email(post):
    """Send approval email with Accept/Reject links"""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set, skipping email notification")
        return

    try:
        import resend
        resend.api_key = RESEND_API_KEY

        approve_url = f"{SITE_URL}/api/blog/approve/{post['post_id']}?action=approve"
        reject_url = f"{SITE_URL}/api/blog/approve/{post['post_id']}?action=reject"
        preview_url = f"{SITE_URL}/blog/preview/{post['post_id']}"

        html = f"""
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;">
  <div style="background:#1e293b;color:white;padding:20px 24px;border-radius:12px 12px 0 0;">
    <h1 style="margin:0;font-size:20px;">New Blog Post for Review</h1>
    <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">AI-Generated Content — Needs Your Approval</p>
  </div>
  <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
    <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px;">{post['title']}</h2>
    <p style="color:#64748b;font-size:13px;margin:0 0 4px;"><strong>Category:</strong> {post['category']}</p>
    <p style="color:#64748b;font-size:13px;margin:0 0 4px;"><strong>Words:</strong> {post['word_count']} ({post['reading_time']} min read)</p>
    <p style="color:#64748b;font-size:13px;margin:0 0 16px;"><strong>Tags:</strong> {', '.join(post.get('tags', []))}</p>
    <p style="color:#475569;font-size:14px;margin:0 0 20px;line-height:1.5;">{post['excerpt']}</p>
    <div style="margin-bottom:20px;">
      <a href="{preview_url}" style="color:#d97706;font-size:13px;text-decoration:underline;">Read Full Article</a>
    </div>
    <div style="text-align:center;">
      <a href="{approve_url}" style="display:inline-block;background:#22c55e;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin:0 8px;">Approve & Publish</a>
      <a href="{reject_url}" style="display:inline-block;background:#ef4444;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin:0 8px;">Reject</a>
    </div>
    <p style="color:#94a3b8;font-size:11px;text-align:center;margin:16px 0 0;">You can also manage posts from the <a href="{SITE_URL}/workspace/servicebook/blog-admin" style="color:#d97706;">ServiceBook Admin Panel</a></p>
  </div>
</div>"""

        params = {
            "from": os.environ.get("SENDER_EMAIL", "blog@thegoodmen.in"),
            "to": [APPROVAL_EMAIL],
            "subject": f"Blog Review: {post['title']}",
            "html": html,
        }

        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Approval email sent for post: {post['title']}")
    except Exception as e:
        logger.error(f"Failed to send approval email: {e}")


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


# --- Admin Routes ---

@router.post("/generate")
async def trigger_generation(category: str = None, topic: str = None):
    """Manually trigger AI blog generation"""
    import random
    cat = category or random.choice(BLOG_CATEGORIES)
    post = await generate_blog_post(cat, topic)
    return {"message": "Post generated", "post": post}


@router.post("/generate-batch")
async def trigger_batch_generation(count: int = 1):
    """Generate multiple posts across categories"""
    import random
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
