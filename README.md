# Research Gap Finder

## Setup
pip install fastapi uvicorn anthropic requests

## Run the stub API
uvicorn backend.main:app --reload
API runs at http://localhost:8000

## Endpoints
GET /api/search?topic=your+topic&limit=50
Returns array of Paper objects (see shared/schema.py)

## Rules (everyone must follow)
1. Never define your own paper shape — import Paper from shared/schema.py
2. Never call the LLM with full PDF text — abstracts only
3. Never fetch from any source except Semantic Scholar and arXiv
4. Always check the cache before calling the LLM (backend/cache.py)
5. Every finding shown in the UI must carry a paper id — no orphan gaps

## Who owns what
- shared/         → Integrator only (do not edit without asking)
- backend/        → Integrator + Teammate B
- pipeline/       → Teammate B
- frontend/       → Teammate A

## API keys needed
- ANTHROPIC_API_KEY → get from integrator
- GEMINI_API_KEY (optional) → enables Gemini extraction; if missing, app uses local mock extractor
- GEMINI_MODEL (optional) → default `gemini-2.5-flash`
- No key needed for Semantic Scholar (free tier, 100 req/5min)
- No key needed for arXiv (open)

## Optional Gemini Setup
1. Add `GEMINI_API_KEY=your_key` to `.env`
2. Optional: add `GEMINI_MODEL=gemini-2.5-flash`
3. Run backend normally. If Gemini fails or key is missing, extractor falls back to local mock mode.

## Contributors
- **Vivek** - Frontend integrations, robust PDF extraction, and Library features.
