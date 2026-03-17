from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

from kb_routes import kb_router, set_database
from workspace_routes import router as workspace_router
from amc_routes import router as amc_router
from support_form_routes import router as support_form_router
from blog_routes import router as blog_router, set_blog_db, start_scheduler, sync_scheduler
from contact_routes import router as contact_router
from seo_routes import router as seo_router, set_seo_db
from leads_routes import router as leads_router, set_leads_db


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Set database for KB routes
set_database(db)
set_blog_db(db)
set_seo_db(db)
set_leads_db(db)

# Create the main app without a prefix
app = FastAPI()

# Create uploads directory
uploads_dir = ROOT_DIR / "uploads" / "kb"
uploads_dir.mkdir(parents=True, exist_ok=True)
blog_uploads_dir = ROOT_DIR / "uploads" / "blog"
blog_uploads_dir.mkdir(parents=True, exist_ok=True)

# Mount static files for uploads
app.mount("/api/kb/uploads", StaticFiles(directory=str(uploads_dir)), name="kb_uploads")
app.mount("/api/blog/uploads", StaticFiles(directory=str(blog_uploads_dir)), name="blog_uploads")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

# Include KB router
app.include_router(kb_router)

# Include Workspace router (ServiceBook app)
app.include_router(workspace_router)

# Include AMC router
app.include_router(amc_router)

# Include Support Form router
app.include_router(support_form_router)

# Include Blog router
app.include_router(blog_router)

# Include Contact router
app.include_router(contact_router)

# Include SEO router
app.include_router(seo_router)

# Include Leads router
app.include_router(leads_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    start_scheduler()
    await sync_scheduler()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()