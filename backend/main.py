from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Annotated
from fastapi import Depends
import os
from pipeline.fetcher import fetch_all
from pipeline.extractor import extract_findings
from backend.auth import get_current_user
from backend.cache import init_db  # Ensure database is initialized on startup

# Response models
class SearchResponse(BaseModel):
    topic: str
    total: int
    papers: list[dict]

app = FastAPI()

# Initialize database on startup
init_db()


def _get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS")
    if raw:
        origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
        return origins
    
    # Default CORS origins for local development
    default_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ]
    
    # Allow all origins in production if not explicitly configured
    if os.getenv("ENVIRONMENT") == "production":
        return ["*"]
    
    return default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

@app.get("/api/config")
async def get_config():
    return {
        "firebaseConfig": {
            "apiKey": os.getenv("FIREBASE_API_KEY"),
            "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN"),
            "projectId": os.getenv("FIREBASE_PROJECT_ID"),
            "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET"),
            "messagingSenderId": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
            "appId": os.getenv("FIREBASE_APP_ID"),
            "measurementId": os.getenv("FIREBASE_MEASUREMENT_ID")
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/search", response_model=SearchResponse)
async def search(
    topic: str = "",
    limit: int = 50,
    sources: Optional[str] = Query(default=None),
    user: dict = Depends(get_current_user)
) -> SearchResponse:
    if not topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    if limit < 1:
        raise HTTPException(status_code=400, detail="Limit must be at least 1")
    
    # Parse sources filter
    allowed_sources = None
    if sources:
        allowed_sources = [s.strip() for s in sources.split(',') if s.strip()]
    
    try:
        papers = fetch_all(topic, allowed_sources=allowed_sources)
        papers = extract_findings(papers, topic=topic)
        final = papers[:limit]
        
        # Ensure all papers are dicts (not dataclass instances)
        papers_data = []
        for p in final:
            if isinstance(p, dict):
                papers_data.append(p)
            else:
                # If it's a dataclass, convert to dict
                papers_data.append(vars(p) if hasattr(p, '__dict__') else p)
        
        return SearchResponse(
            topic=topic,
            total=len(papers_data),
            papers=papers_data
        )
    except Exception as e:
        import traceback
        print(f"Error in search endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")

