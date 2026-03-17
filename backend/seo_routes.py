"""
SEO Routes — sitemap.xml and robots.txt
"""

from fastapi import APIRouter
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

router = APIRouter(tags=["seo"])

db = None

def set_seo_db(database):
    global db
    db = database

SITE = "https://thegoodmen.in"

STATIC_PAGES = [
    ("/", "1.0", "weekly"),
    ("/about", "0.7", "monthly"),
    ("/how-we-work", "0.6", "monthly"),
    ("/amc", "0.9", "weekly"),
    ("/support", "0.9", "weekly"),
    ("/services/email", "0.8", "monthly"),
    ("/services/cybersecurity", "0.8", "monthly"),
    ("/services/repair", "0.8", "monthly"),
    ("/kb", "0.7", "weekly"),
    ("/blog", "0.8", "daily"),
    ("/case-studies", "0.5", "monthly"),
    # SEO Service Landing Pages
    ("/services/cctv-installation", "0.9", "monthly"),
    ("/services/networking", "0.9", "monthly"),
    ("/services/server-solutions", "0.9", "monthly"),
    ("/services/printer-repair", "0.9", "monthly"),
    ("/services/ups-solutions", "0.9", "monthly"),
    ("/services/data-backup", "0.9", "monthly"),
    ("/services/apple-repair", "0.9", "monthly"),
    ("/services/firewall-security", "0.9", "monthly"),
    # SEO Location Landing Pages
    ("/it-support-mumbai", "0.9", "monthly"),
    ("/computer-repair-mumbai", "0.9", "monthly"),
    ("/it-support-small-business", "0.9", "monthly"),
    ("/it-services-mulund-thane", "0.9", "monthly"),
]


@router.get("/sitemap.xml")
async def sitemap():
    today = datetime.now().strftime("%Y-%m-%d")

    urls = []
    for path, priority, freq in STATIC_PAGES:
        urls.append(f"""  <url>
    <loc>{SITE}{path}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>
  </url>""")

    # Blog posts
    if db is not None:
        posts = await db.blog_posts.find(
            {"status": "published"},
            {"slug": 1, "published_at": 1, "_id": 0}
        ).to_list(1000)
        for post in posts:
            date = post.get("published_at", today)
            if isinstance(date, str) and "T" in date:
                date = date.split("T")[0]
            urls.append(f"""  <url>
    <loc>{SITE}/blog/{post['slug']}</loc>
    <lastmod>{date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>""")

    # KB categories and articles
    if db is not None:
        categories = await db.kb_categories.find({}, {"slug": 1, "_id": 0}).to_list(100)
        for cat in categories:
            urls.append(f"""  <url>
    <loc>{SITE}/kb/category/{cat['slug']}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>""")

        articles = await db.kb_articles.find(
            {"status": "published"},
            {"slug": 1, "updated_at": 1, "_id": 0}
        ).to_list(1000)
        for art in articles:
            date = str(art.get("updated_at", today))
            if "T" in date:
                date = date.split("T")[0]
            urls.append(f"""  <url>
    <loc>{SITE}/kb/article/{art['slug']}</loc>
    <lastmod>{date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>""")

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

    return Response(content=xml, media_type="application/xml")


@router.get("/robots.txt")
async def robots():
    content = f"""User-agent: *
Allow: /
Disallow: /workspace/
Disallow: /kb/admin/

Sitemap: {SITE}/sitemap.xml
"""
    return Response(content=content, media_type="text/plain")
