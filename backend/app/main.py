from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine, seed_database
from app.api.endpoints import router as api_router
from app.config import settings

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Seed database with engineering college data
seed_database()

app = FastAPI(
    title="EduPath AI API",
    description="Backend API powering the college prediction and student multi-agent planner system.",
    version="1.0.0"
)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add API router
app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "EduPath AI Guidance Agent",
        "database": "SQLite connected and seeded",
        "gemini_api": "active" if settings.GEMINI_API_KEY else "inactive (running with fallbacks)"
    }
