from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pipeline.fetcher import fetch_all
from pipeline.extractor import extract_findings
from typing import Optional, List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/search")
async def search(
    topic: str = "",
    limit: int = 50,
    sources: Optional[str] = Query(default=None)
):
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
        return {"topic": topic, "total": len(final), "papers": final}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

