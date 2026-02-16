"""
Knowledge Base Models for MongoDB
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class ArticleStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"


# ============== Main Category ==============
class MainCategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = ""
    icon: Optional[str] = "Folder"
    order: int = 0


class MainCategoryCreate(MainCategoryBase):
    pass


class MainCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = None


class MainCategory(MainCategoryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    subcategory_count: int = 0
    article_count: int = 0


# ============== Sub Category ==============
class SubCategoryBase(BaseModel):
    main_category_id: str
    name: str
    slug: str
    description: Optional[str] = ""
    order: int = 0


class SubCategoryCreate(SubCategoryBase):
    pass


class SubCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    main_category_id: Optional[str] = None


class SubCategory(SubCategoryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    article_count: int = 0


# ============== Article ==============
class ArticleBase(BaseModel):
    subcategory_id: str
    title: str
    slug: str
    excerpt: Optional[str] = ""
    content: str = ""
    status: ArticleStatus = ArticleStatus.DRAFT
    order: int = 0
    featured: bool = False
    tags: List[str] = []


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    status: Optional[ArticleStatus] = None
    order: Optional[int] = None
    featured: Optional[bool] = None
    tags: Optional[List[str]] = None
    subcategory_id: Optional[str] = None


class Article(ArticleBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    views: int = 0


class ArticleWithCategory(Article):
    subcategory_name: Optional[str] = None
    main_category_id: Optional[str] = None
    main_category_name: Optional[str] = None


# ============== Admin User ==============
class AdminUserBase(BaseModel):
    username: str


class AdminUserCreate(AdminUserBase):
    password: str


class AdminUser(AdminUserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AdminLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ============== Image Upload ==============
class ImageUploadResponse(BaseModel):
    url: str
    filename: str


# ============== Public API Responses ==============
class PublicMainCategory(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    icon: str
    subcategories: List["PublicSubCategory"] = []
    article_count: int = 0


class PublicSubCategory(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    article_count: int = 0


class PublicArticle(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    content: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    views: int
    subcategory_name: str
    main_category_name: str


# ============== Stats ==============
class KBStats(BaseModel):
    total_categories: int
    total_subcategories: int
    total_articles: int
    published_articles: int
    draft_articles: int
    total_views: int
