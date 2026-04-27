import requests
from backend.config import SEMANTIC_SCHOLAR_BASE, RESULTS_PER_SOURCE

FIELDS = ",".join([
    "title",
    "authors",
    "year",
    "publicationDate",
    "externalIds",
    "abstract",
    "openAccessPdf",
    "citationCount",
    "fieldsOfStudy"
])

def fetch_semantic_scholar(topic: str) -> list[dict]:
    url = f"{SEMANTIC_SCHOLAR_BASE}/paper/search"
    params = {
        "query": topic,
        "limit": RESULTS_PER_SOURCE,
        "fields": FIELDS
    }
    try:
        r = requests.get(url, params=params, timeout=15)
        r.raise_for_status()
    except requests.exceptions.Timeout:
        print("Semantic Scholar timed out")
        return []
    except requests.exceptions.RequestException as e:
        print(f"Semantic Scholar error: {e}")
        return []

    raw = r.json().get("data", [])
    papers = []

    for p in raw:
        doi = p.get("externalIds", {}).get("DOI")
        pub_date = p.get("publicationDate") or f"{p.get('year', '2000')}-01-01"
        open_access = p.get("openAccessPdf") or {}
        pdf_url = open_access.get("url")

        if doi:
            landing_url = f"https://doi.org/{doi}"
        else:
            landing_url = f"https://www.semanticscholar.org/paper/{p.get('paperId', '')}"

        field_tags = []
        fields = p.get("fieldsOfStudy") or []
        if isinstance(fields, list):
            for f in fields:
                if isinstance(f, dict) and "category" in f:
                    field_tags.append(f["category"])

        papers.append({
            "title": p.get("title") or "",
            "authors": [a["name"] for a in p.get("authors", [])],
            "year": p.get("year") or 0,
            "published_date": pub_date,
            "doi": doi,
            "source": "semantic_scholar",
            "abstract": p.get("abstract") or "",
            "pdf_url": pdf_url,
            "landing_url": landing_url,
            "is_open_access": bool(pdf_url),
            "citation_count": p.get("citationCount") or 0,
            "findings": [],
            "gaps": [],
            "field_tags": field_tags
        })

    return papers
