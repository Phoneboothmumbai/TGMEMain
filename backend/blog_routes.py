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
import asyncio
from datetime import datetime, timezone
from typing import Optional
from pathlib import Path

import httpx
import feedparser
from bs4 import BeautifulSoup
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

# --- Tech News Sources for Topic Research ---
RSS_FEEDS = [
    ("TechCrunch", "https://techcrunch.com/feed/"),
    ("The Verge", "https://www.theverge.com/rss/index.xml"),
    ("ZDNet", "https://www.zdnet.com/news/rss.xml"),
    ("VentureBeat", "https://venturebeat.com/feed/"),
    ("Ars Technica", "https://feeds.arstechnica.com/arstechnica/index"),
    ("TechRadar", "https://www.techradar.com/rss"),
    ("Tom's Hardware", "https://www.tomshardware.com/feeds/all"),
    ("Wired", "https://www.wired.com/feed/rss"),
    ("CNET", "https://www.cnet.com/rss/news/"),
    ("The Next Web", "https://thenextweb.com/feed"),
]

SCRAPE_SITES = [
    ("Gadgets360", "https://www.gadgets360.com/news"),
    ("Digit.in", "https://www.digit.in/news/"),
    ("HT Tech", "https://tech.hindustantimes.com/"),
    ("9to5Google", "https://9to5google.com/"),
    ("9to5Mac", "https://9to5mac.com/"),
    ("Android Authority", "https://www.androidauthority.com/news/"),
    ("Engadget", "https://www.engadget.com/"),
    ("GSMArena", "https://www.gsmarena.com/news.php3"),
]


async def fetch_rss_headlines(feed_url: str, limit: int = 8) -> list:
    """Fetch headlines from an RSS feed."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(feed_url, headers={"User-Agent": "TGME-BlogBot/1.0"})
        if resp.status_code != 200:
            return []
        feed = feedparser.parse(resp.text)
        return [entry.title for entry in feed.entries[:limit] if hasattr(entry, 'title')]
    except Exception:
        return []


async def scrape_headlines(url: str, limit: int = 8) -> list:
    """Scrape headlines from a news website homepage."""
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
        if resp.status_code != 200:
            return []
        soup = BeautifulSoup(resp.text, "html.parser")
        headlines = []
        for tag in soup.find_all(["h1", "h2", "h3", "h4", "a"]):
            text = tag.get_text(strip=True)
            if len(text) > 25 and len(text) < 200:
                headlines.append(text)
            if len(headlines) >= limit:
                break
        return headlines
    except Exception:
        return []


async def gather_trending_news(count: int = 4) -> str:
    """Fetch real trending headlines from tech news sources."""
    # Pick random sources from both RSS and scrape lists
    rss_picks = random.sample(RSS_FEEDS, min(count, len(RSS_FEEDS)))
    scrape_picks = random.sample(SCRAPE_SITES, min(2, len(SCRAPE_SITES)))

    tasks = []
    for name, url in rss_picks:
        tasks.append((name, fetch_rss_headlines(url)))
    for name, url in scrape_picks:
        tasks.append((name, scrape_headlines(url)))

    results = await asyncio.gather(*[t[1] for t in tasks], return_exceptions=True)

    all_headlines = []
    for i, (name, _) in enumerate(tasks):
        if isinstance(results[i], list) and results[i]:
            for h in results[i][:6]:
                all_headlines.append(f"[{name}] {h}")

    random.shuffle(all_headlines)
    if not all_headlines:
        return ""

    return "\n".join(all_headlines[:30])

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

TGME_SERVICES = "AMC, networking, cybersecurity, CCTV, hardware repair, email/cloud setup, web hosting, servers, UPS, backup & disaster recovery"

SYSTEM_PROMPT = f"""You are a senior IT journalist writing for The Good Men Enterprise (TGME), an Indian IT services company.

ABSOLUTE RULES — VIOLATION MEANS THE ARTICLE IS REJECTED:

1. NEVER FABRICATE DATA. No made-up statistics, percentages, survey results, market sizes, growth rates, or research findings. If you don't know the exact number, DON'T include one. Say "many businesses" not "73% of businesses".

2. NEVER INVENT CASE STUDIES. No fictional companies, no imaginary success stories, no "Company X saved Y%" narratives. Only reference well-known, verifiable companies (Google, Microsoft, Infosys, etc.) and only for publicly known facts.

3. NEVER MAKE UP QUOTES. No attributed quotes from unnamed experts, CEOs, or analysts.

4. KEEP IT SHORT. Target 600-900 words. Every sentence must earn its place. No filler paragraphs, no restating the same point, no generic conclusions like "In today's rapidly evolving digital landscape...".

5. BE SPECIFIC AND PRACTICAL. Tell the reader exactly what to do, what tool to use, what setting to change. Vague advice like "invest in cybersecurity" is useless.

6. WRITE LIKE A HUMAN. Use conversational, direct language. Short paragraphs. No corporate jargon. No AI-sounding phrases like "In this comprehensive guide" or "Let's dive in" or "In conclusion".

7. ONLY REAL PRODUCTS AND PRICES. Only mention products that actually exist. If referencing pricing, only use publicly listed prices from official websites.

TGME provides: {TGME_SERVICES}. Mention TGME's services naturally where relevant — one or two lines max, not a whole section.

Target audience: Indian business owners and IT managers at SMBs who need practical, trustworthy advice."""


async def get_recent_titles(days=45):
    """Fetch titles of posts created in the last N days to avoid duplicates."""
    from datetime import timedelta
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    posts = await db.blog_posts.find(
        {"created_at": {"$gte": cutoff}},
        {"title": 1, "category": 1, "tags": 1, "_id": 0}
    ).to_list(200)
    return posts


async def research_trending_topic(category: str):
    """Step 1: Scrape real tech news + ask DeepSeek to suggest a unique, trending topic."""
    # Fetch existing topics to avoid duplicates
    recent = await get_recent_titles(45)
    existing_titles = [p["title"] for p in recent]
    existing_block = ""
    if existing_titles:
        titles_list = "\n".join(f"- {t}" for t in existing_titles)
        existing_block = f"""

CRITICAL — DO NOT repeat or overlap with these existing articles (written in the last 45 days):
{titles_list}

Your suggested topic MUST be completely different from all of the above. Different subject matter, different angle, different focus area. No variations or rewrites of existing titles."""

    # Fetch real trending news from tech sites
    logger.info("[TopicResearch] Fetching trending headlines from tech news sources...")
    trending_news = await gather_trending_news(count=4)
    news_block = ""
    if trending_news:
        news_block = f"""

HERE ARE REAL TRENDING HEADLINES FROM MAJOR TECH NEWS SOURCES RIGHT NOW (use these as inspiration for picking a relevant, timely topic):
{trending_news}

Pick a topic INSPIRED by these real current news trends but tailored to Indian businesses and TGME's IT services. The topic should feel timely and newsworthy."""
        logger.info(f"[TopicResearch] Got {len(trending_news.splitlines())} headlines from tech news")
    else:
        logger.warning("[TopicResearch] Could not fetch trending news, using AI knowledge only")

    research_prompt = f"""You are a tech news editor. The current date is {datetime.now().strftime('%B %Y')}.
{news_block}

Based on the real headlines above, suggest ONE specific blog topic for the category "{category}" that:
1. Is relevant to Indian businesses who use IT services (hardware, networking, cybersecurity, cloud, email, CCTV, servers)
2. Is inspired by actual current news — not generic advice
3. Is specific enough that a reader knows exactly what the article will cover from the title alone
4. Has NOT been covered already on this blog
{existing_block}

Return ONLY a JSON object (no markdown, no code blocks):
{{"topic": "Specific topic title under 65 chars", "why_trending": "One sentence on why this matters now", "search_intent": "What someone would Google to find this"}}"""

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            DEEPSEEK_API_URL,
            headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": DEEPSEEK_MODEL,
                "messages": [{"role": "user", "content": research_prompt}],
                "temperature": 0.6,
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


# --- Fact-Check & Verification Layer ---

FACT_CHECK_PROMPT = """You are a strict editorial fact-checker for an IT services company blog. Your job is to catch fake, unverifiable, or misleading content BEFORE it gets published.

Review the article below and:

1. FLAG every claim that includes a specific statistic, percentage, dollar/rupee amount, date, or research finding. For each:
   - Is it a real, publicly verifiable fact? (e.g., "Windows 11 requires TPM 2.0" = REAL)
   - Or is it made up / unverifiable? (e.g., "73% of Indian SMBs faced cyberattacks in 2025" = LIKELY FAKE unless citing a named report)
   
2. FLAG any fake case studies, fictional company names, invented quotes, or simulated scenarios.

3. FLAG AI-sounding filler phrases like "In today's rapidly evolving landscape", "Let's dive in", "In this comprehensive guide", "As we move through 2026".

4. For each issue found: REMOVE the fake/unverifiable claim from the content entirely, or replace it with honest, general language. Never leave a fake stat in.

5. Verify that key takeaways and FAQ answers don't contain fabricated data either.

Return ONLY raw JSON (no markdown, no code blocks):
{
  "trust_score": 8,
  "issues_found": ["Description of issue 1", "Description of issue 2"],
  "changes_made": ["Removed fake stat about X", "Replaced unverifiable claim about Y"],
  "cleaned_content": "The full HTML article with all fixes applied. Keep the structure, just fix the problems.",
  "cleaned_takeaways": ["Fixed takeaway 1", "Fixed takeaway 2", "Fixed takeaway 3"],
  "cleaned_faq": [{"question": "Q1", "answer": "Verified A1"}, {"question": "Q2", "answer": "Verified A2"}, {"question": "Q3", "answer": "Verified A3"}]
}

trust_score: 1-10 where 10 = perfectly clean, 1 = full of fabrications.
If the article is already clean, return it unchanged with a high trust_score and empty issues_found."""


async def fact_check_article(title: str, content: str, takeaways: list, faq: list) -> dict:
    """Run a second AI pass to fact-check and verify the generated article."""
    if not DEEPSEEK_API_KEY:
        return None

    article_for_review = f"""TITLE: {title}

KEY TAKEAWAYS:
{json.dumps(takeaways, indent=2)}

ARTICLE CONTENT:
{content}

FAQ:
{json.dumps(faq, indent=2)}"""

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                DEEPSEEK_API_URL,
                headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": DEEPSEEK_MODEL,
                    "messages": [
                        {"role": "system", "content": FACT_CHECK_PROMPT},
                        {"role": "user", "content": article_for_review},
                    ],
                    "temperature": 0.2,
                    "max_tokens": 3500,
                },
            )

        if response.status_code != 200:
            logger.warning(f"[FactCheck] API error: {response.status_code}")
            return None

        text = response.json()["choices"][0]["message"]["content"].strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text.rsplit("```", 1)[0]

        result = json.loads(text.strip())
        return result

    except json.JSONDecodeError as e:
        logger.warning(f"[FactCheck] Failed to parse response: {e}")
        return None
    except Exception as e:
        logger.warning(f"[FactCheck] Verification failed: {e}")
        return None


async def generate_blog_post(category: str, topic_hint: str = None):
    """Generate a full blog post using DeepSeek API with trend research and image generation."""
    if not DEEPSEEK_API_KEY:
        raise HTTPException(status_code=500, detail="DEEPSEEK_API_KEY not configured")

    # Fetch existing titles for uniqueness enforcement
    recent = await get_recent_titles(45)
    existing_titles = [p["title"] for p in recent]
    uniqueness_block = ""
    if existing_titles:
        titles_list = "\n".join(f"- {t}" for t in existing_titles)
        uniqueness_block = f"""

UNIQUENESS REQUIREMENT — These articles already exist on our blog (last 45 days). Your article MUST cover a COMPLETELY DIFFERENT topic:
{titles_list}
Do NOT write about the same subject, do NOT rephrase an existing title, do NOT cover similar ground. Pick an entirely new angle and subject."""

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
    prompt = f"""Category: "{category}"
{topic_context}

Current date: {current_date}. Write for {datetime.now().year}. Reference past years only as history.
{uniqueness_block}

ARTICLE FORMAT:
- 600-900 words MAXIMUM. Not a word more. Quality over quantity.
- 3-4 sections with <h2> headings. No more.
- Short paragraphs (2-3 sentences each).
- Use <ul>/<ol> for actionable steps or comparisons.
- Bold (<strong>) only for genuinely important terms.
- ONE CTA box using: <div class="blog-cta"><p><strong>[Relevant hook]</strong> <a href="/support">Get Support</a> | <a href="/amc">AMC Plans</a></p></div>
  Place it after the most relevant section, not at the start.

AUTHENTICITY RULES:
- NO fabricated statistics or percentages
- NO made-up case studies or company stories
- NO invented quotes or expert opinions
- NO phrases like "studies show", "research indicates", "experts predict" unless citing a real, named source
- If comparing products, use only real features from their official websites
- If mentioning pricing, use real publicly available prices only

Return ONLY raw JSON (no markdown, no code blocks):
{{
  "title": "Clear, specific title under 65 characters",
  "excerpt": "One-sentence summary under 155 characters",
  "key_takeaways": [
    "Specific, actionable point 1",
    "Specific, actionable point 2",
    "Specific, actionable point 3"
  ],
  "content": "HTML article. 600-900 words. Practical, honest, no fluff.",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "faq": [
    {{"question": "Practical question a business owner would actually ask", "answer": "Direct, honest answer in 1-2 sentences. No padding."}},
    {{"question": "Another real question", "answer": "Another direct answer."}},
    {{"question": "Third question", "answer": "Third answer."}}
  ],
  "meta_keywords": "keyword1, keyword2, keyword3, keyword4"
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
                    "temperature": 0.5,
                    "max_tokens": 3000,
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

        # Step 3: FACT-CHECK & VERIFY — second AI pass
        logger.info(f"[FactCheck] Verifying article: {title}")
        verification = await fact_check_article(title, html_content, data.get("key_takeaways", []), data.get("faq", []))

        # Apply verified content
        if verification:
            html_content = verification.get("cleaned_content", html_content)
            data["key_takeaways"] = verification.get("cleaned_takeaways", data.get("key_takeaways", []))
            data["faq"] = verification.get("cleaned_faq", data.get("faq", []))
            fact_check_report = {
                "score": verification.get("trust_score", 0),
                "issues_found": verification.get("issues_found", []),
                "changes_made": verification.get("changes_made", []),
                "verified_at": datetime.now(timezone.utc).isoformat(),
            }
            logger.info(f"[FactCheck] Score: {verification.get('trust_score', '?')}/10, Issues: {len(verification.get('issues_found', []))}")
        else:
            fact_check_report = {"score": 0, "issues_found": ["Verification unavailable"], "changes_made": [], "verified_at": datetime.now(timezone.utc).isoformat()}

        word_count = len(html_content.split())
        reading_time = max(1, word_count // 250)

        # Step 4: Generate featured image
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
            "key_takeaways": data.get("key_takeaways", []),
            "faq": data.get("faq", []),
            "featured_image": featured_image,
            "fact_check": fact_check_report,
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
