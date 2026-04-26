from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pipeline.fetcher import fetch_all
from pipeline.extractor import extract_findings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/search")
async def search(topic: str = "", limit: int = 50):
    if not topic.strip():
        raise HTTPException(
            status_code=400,
            detail="Topic cannot be empty"
        )
    if limit < 1:
        raise HTTPException(
            status_code=400,
            detail="Limit must be at least 1"
        )
    try:
        papers = fetch_all(topic)
        papers = extract_findings(papers, topic=topic)
        sorted_papers = sorted(
            papers,
            key=lambda p: p["published_date"],
            reverse=True
        )
        final = sorted_papers[:limit]
        return {
            "topic": topic,
            "total": len(final),
            "papers": final
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

