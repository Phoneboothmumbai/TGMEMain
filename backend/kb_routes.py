"""
Knowledge Base API Routes
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from datetime import datetime, timedelta
import os
import uuid
import jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient

from kb_models import (
    MainCategory, MainCategoryCreate, MainCategoryUpdate,
    SubCategory, SubCategoryCreate, SubCategoryUpdate,
    Article, ArticleCreate, ArticleUpdate, ArticleWithCategory, ArticleStatus,
    AdminUser, AdminUserCreate, AdminLogin, TokenResponse,
    ImageUploadResponse, KBStats, PublicMainCategory, PublicSubCategory, PublicArticle
)

# Router
kb_router = APIRouter(prefix="/api/kb", tags=["Knowledge Base"])

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("JWT_SECRET", "tgme-kb-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Database connection (will be set from main server.py)
db = None

def set_database(database):
    global db
    db = database


# ============== Auth Helpers ==============
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        admin = await db.kb_admins.find_one({"username": username})
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ============== Admin Auth Routes ==============
@kb_router.post("/admin/setup", response_model=dict)
async def setup_admin(admin_data: AdminUserCreate):
    """Create initial admin user (only works if no admin exists)"""
    existing = await db.kb_admins.find_one({})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists. Use login.")
    
    admin = AdminUser(
        id=str(uuid.uuid4()),
        username=admin_data.username,
        password_hash=hash_password(admin_data.password),
        created_at=datetime.utcnow()
    )
    await db.kb_admins.insert_one(admin.dict())
    return {"message": "Admin created successfully"}


@kb_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(login_data: AdminLogin):
    """Admin login"""
    admin = await db.kb_admins.find_one({"username": login_data.username})
    if not admin or not verify_password(login_data.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": admin["username"]})
    return TokenResponse(access_token=token)


@kb_router.get("/admin/me")
async def get_admin_info(admin = Depends(get_current_admin)):
    """Get current admin info"""
    return {"username": admin["username"], "created_at": admin["created_at"]}


@kb_router.put("/admin/password")
async def change_password(
    old_password: str,
    new_password: str,
    admin = Depends(get_current_admin)
):
    """Change admin password"""
    if not verify_password(old_password, admin["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid old password")
    
    new_hash = hash_password(new_password)
    await db.kb_admins.update_one(
        {"_id": admin["_id"]},
        {"$set": {"password_hash": new_hash}}
    )
    return {"message": "Password updated successfully"}


# ============== Main Category Routes ==============
@kb_router.get("/admin/categories", response_model=List[MainCategory])
async def get_all_categories(admin = Depends(get_current_admin)):
    """Get all main categories"""
    categories = await db.kb_main_categories.find().sort("order", 1).to_list(1000)
    result = []
    for cat in categories:
        cat["id"] = cat.pop("_id", cat.get("id"))
        # Count subcategories and articles
        subcat_count = await db.kb_subcategories.count_documents({"main_category_id": cat["id"]})
        article_count = await db.kb_articles.count_documents({
            "subcategory_id": {"$in": [
                s["id"] for s in await db.kb_subcategories.find(
                    {"main_category_id": cat["id"]}, {"id": 1, "_id": 1}
                ).to_list(1000)
            ]}
        }) if subcat_count > 0 else 0
        cat["subcategory_count"] = subcat_count
        cat["article_count"] = article_count
        result.append(MainCategory(**cat))
    return result


@kb_router.post("/admin/categories", response_model=MainCategory)
async def create_category(category: MainCategoryCreate, admin = Depends(get_current_admin)):
    """Create a new main category"""
    # Check slug uniqueness
    existing = await db.kb_main_categories.find_one({"slug": category.slug})
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    new_category = MainCategory(
        id=str(uuid.uuid4()),
        **category.dict(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    cat_dict = new_category.dict()
    cat_dict["_id"] = cat_dict.pop("id")
    await db.kb_main_categories.insert_one(cat_dict)
    cat_dict["id"] = cat_dict.pop("_id")
    return MainCategory(**cat_dict)


@kb_router.get("/admin/categories/{category_id}", response_model=MainCategory)
async def get_category(category_id: str, admin = Depends(get_current_admin)):
    """Get a single main category"""
    category = await db.kb_main_categories.find_one({"_id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    category["id"] = category.pop("_id")
    return MainCategory(**category)


@kb_router.put("/admin/categories/{category_id}", response_model=MainCategory)
async def update_category(
    category_id: str,
    category_update: MainCategoryUpdate,
    admin = Depends(get_current_admin)
):
    """Update a main category"""
    existing = await db.kb_main_categories.find_one({"_id": category_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = {k: v for k, v in category_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.kb_main_categories.update_one(
            {"_id": category_id},
            {"$set": update_data}
        )
    
    updated = await db.kb_main_categories.find_one({"_id": category_id})
    updated["id"] = updated.pop("_id")
    return MainCategory(**updated)


@kb_router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str, admin = Depends(get_current_admin)):
    """Delete a main category and all its subcategories/articles"""
    existing = await db.kb_main_categories.find_one({"_id": category_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Get all subcategories
    subcategories = await db.kb_subcategories.find({"main_category_id": category_id}).to_list(1000)
    subcat_ids = [s.get("_id", s.get("id")) for s in subcategories]
    
    # Delete all articles in these subcategories
    if subcat_ids:
        await db.kb_articles.delete_many({"subcategory_id": {"$in": subcat_ids}})
    
    # Delete all subcategories
    await db.kb_subcategories.delete_many({"main_category_id": category_id})
    
    # Delete the main category
    await db.kb_main_categories.delete_one({"_id": category_id})
    
    return {"message": "Category and all contents deleted"}


# ============== Sub Category Routes ==============
@kb_router.get("/admin/subcategories", response_model=List[SubCategory])
async def get_all_subcategories(
    main_category_id: Optional[str] = None,
    admin = Depends(get_current_admin)
):
    """Get all subcategories, optionally filtered by main category"""
    query = {}
    if main_category_id:
        query["main_category_id"] = main_category_id
    
    subcategories = await db.kb_subcategories.find(query).sort("order", 1).to_list(1000)
    result = []
    for subcat in subcategories:
        subcat["id"] = subcat.pop("_id", subcat.get("id"))
        article_count = await db.kb_articles.count_documents({"subcategory_id": subcat["id"]})
        subcat["article_count"] = article_count
        result.append(SubCategory(**subcat))
    return result


@kb_router.post("/admin/subcategories", response_model=SubCategory)
async def create_subcategory(subcategory: SubCategoryCreate, admin = Depends(get_current_admin)):
    """Create a new subcategory"""
    # Verify main category exists
    main_cat = await db.kb_main_categories.find_one({"_id": subcategory.main_category_id})
    if not main_cat:
        raise HTTPException(status_code=400, detail="Main category not found")
    
    # Check slug uniqueness within main category
    existing = await db.kb_subcategories.find_one({
        "main_category_id": subcategory.main_category_id,
        "slug": subcategory.slug
    })
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists in this category")
    
    new_subcat = SubCategory(
        id=str(uuid.uuid4()),
        **subcategory.dict(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    subcat_dict = new_subcat.dict()
    subcat_dict["_id"] = subcat_dict.pop("id")
    await db.kb_subcategories.insert_one(subcat_dict)
    subcat_dict["id"] = subcat_dict.pop("_id")
    return SubCategory(**subcat_dict)


@kb_router.get("/admin/subcategories/{subcategory_id}", response_model=SubCategory)
async def get_subcategory(subcategory_id: str, admin = Depends(get_current_admin)):
    """Get a single subcategory"""
    subcat = await db.kb_subcategories.find_one({"_id": subcategory_id})
    if not subcat:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    subcat["id"] = subcat.pop("_id")
    return SubCategory(**subcat)


@kb_router.put("/admin/subcategories/{subcategory_id}", response_model=SubCategory)
async def update_subcategory(
    subcategory_id: str,
    subcat_update: SubCategoryUpdate,
    admin = Depends(get_current_admin)
):
    """Update a subcategory"""
    existing = await db.kb_subcategories.find_one({"_id": subcategory_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    update_data = {k: v for k, v in subcat_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.kb_subcategories.update_one(
            {"_id": subcategory_id},
            {"$set": update_data}
        )
    
    updated = await db.kb_subcategories.find_one({"_id": subcategory_id})
    updated["id"] = updated.pop("_id")
    return SubCategory(**updated)


@kb_router.delete("/admin/subcategories/{subcategory_id}")
async def delete_subcategory(subcategory_id: str, admin = Depends(get_current_admin)):
    """Delete a subcategory and all its articles"""
    existing = await db.kb_subcategories.find_one({"_id": subcategory_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    # Delete all articles
    await db.kb_articles.delete_many({"subcategory_id": subcategory_id})
    
    # Delete the subcategory
    await db.kb_subcategories.delete_one({"_id": subcategory_id})
    
    return {"message": "Subcategory and all articles deleted"}


# ============== Article Routes ==============
@kb_router.get("/admin/articles", response_model=List[ArticleWithCategory])
async def get_all_articles(
    subcategory_id: Optional[str] = None,
    status: Optional[ArticleStatus] = None,
    search: Optional[str] = None,
    admin = Depends(get_current_admin)
):
    """Get all articles with filters"""
    query = {}
    if subcategory_id:
        query["subcategory_id"] = subcategory_id
    if status:
        query["status"] = status.value
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]
    
    articles = await db.kb_articles.find(query).sort([("order", 1), ("created_at", -1)]).to_list(1000)
    result = []
    for article in articles:
        article["id"] = article.pop("_id", article.get("id"))
        # Get subcategory and main category info
        subcat = await db.kb_subcategories.find_one({"_id": article["subcategory_id"]})
        if subcat:
            article["subcategory_name"] = subcat.get("name", "")
            main_cat = await db.kb_main_categories.find_one({"_id": subcat.get("main_category_id")})
            if main_cat:
                article["main_category_id"] = main_cat.get("_id", "")
                article["main_category_name"] = main_cat.get("name", "")
        result.append(ArticleWithCategory(**article))
    return result


@kb_router.post("/admin/articles", response_model=Article)
async def create_article(article: ArticleCreate, admin = Depends(get_current_admin)):
    """Create a new article"""
    # Verify subcategory exists
    subcat = await db.kb_subcategories.find_one({"_id": article.subcategory_id})
    if not subcat:
        raise HTTPException(status_code=400, detail="Subcategory not found")
    
    new_article = Article(
        id=str(uuid.uuid4()),
        **article.dict(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    article_dict = new_article.dict()
    article_dict["_id"] = article_dict.pop("id")
    await db.kb_articles.insert_one(article_dict)
    article_dict["id"] = article_dict.pop("_id")
    return Article(**article_dict)


@kb_router.get("/admin/articles/{article_id}", response_model=ArticleWithCategory)
async def get_article(article_id: str, admin = Depends(get_current_admin)):
    """Get a single article"""
    article = await db.kb_articles.find_one({"_id": article_id})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    article["id"] = article.pop("_id")
    # Get subcategory and main category info
    subcat = await db.kb_subcategories.find_one({"_id": article["subcategory_id"]})
    if subcat:
        article["subcategory_name"] = subcat.get("name", "")
        main_cat = await db.kb_main_categories.find_one({"_id": subcat.get("main_category_id")})
        if main_cat:
            article["main_category_id"] = main_cat.get("_id", "")
            article["main_category_name"] = main_cat.get("name", "")
    
    return ArticleWithCategory(**article)


@kb_router.put("/admin/articles/{article_id}", response_model=Article)
async def update_article(
    article_id: str,
    article_update: ArticleUpdate,
    admin = Depends(get_current_admin)
):
    """Update an article"""
    existing = await db.kb_articles.find_one({"_id": article_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Article not found")
    
    update_data = {k: v for k, v in article_update.dict().items() if v is not None}
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await db.kb_articles.update_one(
            {"_id": article_id},
            {"$set": update_data}
        )
    
    updated = await db.kb_articles.find_one({"_id": article_id})
    updated["id"] = updated.pop("_id")
    return Article(**updated)


@kb_router.delete("/admin/articles/{article_id}")
async def delete_article(article_id: str, admin = Depends(get_current_admin)):
    """Delete an article"""
    existing = await db.kb_articles.find_one({"_id": article_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Article not found")
    
    await db.kb_articles.delete_one({"_id": article_id})
    return {"message": "Article deleted"}


# ============== Image Upload ==============
@kb_router.post("/admin/upload", response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...), admin = Depends(get_current_admin)):
    """Upload an image for articles"""
    # Create uploads directory if not exists
    upload_dir = "/app/backend/uploads/kb"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    
    # Save file
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    
    # Return URL
    url = f"/api/kb/uploads/{filename}"
    return ImageUploadResponse(url=url, filename=filename)


# ============== Stats ==============
@kb_router.get("/admin/stats", response_model=KBStats)
async def get_stats(admin = Depends(get_current_admin)):
    """Get KB statistics"""
    total_categories = await db.kb_main_categories.count_documents({})
    total_subcategories = await db.kb_subcategories.count_documents({})
    total_articles = await db.kb_articles.count_documents({})
    published_articles = await db.kb_articles.count_documents({"status": "published"})
    draft_articles = await db.kb_articles.count_documents({"status": "draft"})
    
    # Calculate total views
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$views"}}}]
    views_result = await db.kb_articles.aggregate(pipeline).to_list(1)
    total_views = views_result[0]["total"] if views_result else 0
    
    return KBStats(
        total_categories=total_categories,
        total_subcategories=total_subcategories,
        total_articles=total_articles,
        published_articles=published_articles,
        draft_articles=draft_articles,
        total_views=total_views
    )


# ============== Public API Routes ==============
@kb_router.get("/public/categories")
async def public_get_categories():
    """Get all categories with subcategories (public)"""
    categories = await db.kb_main_categories.find().sort("order", 1).to_list(1000)
    result = []
    
    for cat in categories:
        cat_id = cat.get("_id", cat.get("id"))
        subcategories = await db.kb_subcategories.find(
            {"main_category_id": cat_id}
        ).sort("order", 1).to_list(1000)
        
        subcats_result = []
        total_articles = 0
        
        for subcat in subcategories:
            subcat_id = subcat.get("_id", subcat.get("id"))
            article_count = await db.kb_articles.count_documents({
                "subcategory_id": subcat_id,
                "status": "published"
            })
            total_articles += article_count
            
            subcats_result.append({
                "id": subcat_id,
                "name": subcat.get("name", ""),
                "slug": subcat.get("slug", ""),
                "description": subcat.get("description", ""),
                "article_count": article_count
            })
        
        result.append({
            "id": cat_id,
            "name": cat.get("name", ""),
            "slug": cat.get("slug", ""),
            "description": cat.get("description", ""),
            "icon": cat.get("icon", "Folder"),
            "subcategories": subcats_result,
            "article_count": total_articles
        })
    
    return result


@kb_router.get("/public/categories/{category_slug}")
async def public_get_category(category_slug: str):
    """Get a single category with subcategories (public)"""
    category = await db.kb_main_categories.find_one({"slug": category_slug})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    cat_id = category.get("_id", category.get("id"))
    subcategories = await db.kb_subcategories.find(
        {"main_category_id": cat_id}
    ).sort("order", 1).to_list(1000)
    
    subcats_result = []
    for subcat in subcategories:
        subcat_id = subcat.get("_id", subcat.get("id"))
        article_count = await db.kb_articles.count_documents({
            "subcategory_id": subcat_id,
            "status": "published"
        })
        subcats_result.append({
            "id": subcat_id,
            "name": subcat.get("name", ""),
            "slug": subcat.get("slug", ""),
            "description": subcat.get("description", ""),
            "article_count": article_count
        })
    
    return {
        "id": cat_id,
        "name": category.get("name", ""),
        "slug": category.get("slug", ""),
        "description": category.get("description", ""),
        "icon": category.get("icon", "Folder"),
        "subcategories": subcats_result
    }


@kb_router.get("/public/subcategories/{subcategory_slug}/articles")
async def public_get_subcategory_articles(subcategory_slug: str):
    """Get articles in a subcategory (public)"""
    subcat = await db.kb_subcategories.find_one({"slug": subcategory_slug})
    if not subcat:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    subcat_id = subcat.get("_id", subcat.get("id"))
    main_cat = await db.kb_main_categories.find_one({"_id": subcat.get("main_category_id")})
    
    articles = await db.kb_articles.find({
        "subcategory_id": subcat_id,
        "status": "published"
    }).sort("order", 1).to_list(1000)
    
    articles_result = []
    for article in articles:
        articles_result.append({
            "id": article.get("_id", article.get("id")),
            "title": article.get("title", ""),
            "slug": article.get("slug", ""),
            "excerpt": article.get("excerpt", ""),
            "updated_at": article.get("updated_at", ""),
            "views": article.get("views", 0)
        })
    
    return {
        "subcategory": {
            "id": subcat_id,
            "name": subcat.get("name", ""),
            "slug": subcat.get("slug", ""),
            "description": subcat.get("description", "")
        },
        "main_category": {
            "id": main_cat.get("_id", "") if main_cat else "",
            "name": main_cat.get("name", "") if main_cat else "",
            "slug": main_cat.get("slug", "") if main_cat else ""
        },
        "articles": articles_result
    }


@kb_router.get("/public/articles/{article_slug}")
async def public_get_article(article_slug: str):
    """Get a single article (public)"""
    article = await db.kb_articles.find_one({
        "slug": article_slug,
        "status": "published"
    })
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment views
    await db.kb_articles.update_one(
        {"_id": article.get("_id")},
        {"$inc": {"views": 1}}
    )
    
    # Get category info
    subcat = await db.kb_subcategories.find_one({"_id": article.get("subcategory_id")})
    main_cat = None
    if subcat:
        main_cat = await db.kb_main_categories.find_one({"_id": subcat.get("main_category_id")})
    
    return {
        "id": article.get("_id", article.get("id")),
        "title": article.get("title", ""),
        "slug": article.get("slug", ""),
        "excerpt": article.get("excerpt", ""),
        "content": article.get("content", ""),
        "tags": article.get("tags", []),
        "created_at": article.get("created_at", ""),
        "updated_at": article.get("updated_at", ""),
        "views": article.get("views", 0) + 1,
        "subcategory": {
            "id": subcat.get("_id", "") if subcat else "",
            "name": subcat.get("name", "") if subcat else "",
            "slug": subcat.get("slug", "") if subcat else ""
        },
        "main_category": {
            "id": main_cat.get("_id", "") if main_cat else "",
            "name": main_cat.get("name", "") if main_cat else "",
            "slug": main_cat.get("slug", "") if main_cat else ""
        }
    }


@kb_router.get("/public/search")
async def public_search(q: str = Query(..., min_length=2)):
    """Search articles (public)"""
    articles = await db.kb_articles.find({
        "status": "published",
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"content": {"$regex": q, "$options": "i"}},
            {"excerpt": {"$regex": q, "$options": "i"}}
        ]
    }).limit(20).to_list(20)
    
    result = []
    for article in articles:
        subcat = await db.kb_subcategories.find_one({"_id": article.get("subcategory_id")})
        main_cat = None
        if subcat:
            main_cat = await db.kb_main_categories.find_one({"_id": subcat.get("main_category_id")})
        
        result.append({
            "id": article.get("_id", article.get("id")),
            "title": article.get("title", ""),
            "slug": article.get("slug", ""),
            "excerpt": article.get("excerpt", ""),
            "subcategory_name": subcat.get("name", "") if subcat else "",
            "main_category_name": main_cat.get("name", "") if main_cat else ""
        })
    
    return result
