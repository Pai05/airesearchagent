import requests
import xmltodict
from backend.config import ARXIV_BASE, RESULTS_PER_SOURCE

def fetch_arxiv(topic: str) -> list[dict]:
    params = {
        "search_query": f"all:{topic}",
        "sortBy": "submittedDate",
        "sortOrder": "descending",
        "max_results": RESULTS_PER_SOURCE
    }
    try:
        r = requests.get(ARXIV_BASE, params=params, timeout=15)
        r.raise_for_status()
    except requests.exceptions.Timeout:
        print("arXiv timed out")
        return []
    except requests.exceptions.RequestException as e:
        print(f"arXiv error: {e}")
        return []

    parsed = xmltodict.parse(r.text)
    entries = parsed.get("feed", {}).get("entry", [])

    if isinstance(entries, dict):
        entries = [entries]
    if not entries:
        return []

    papers = []

    for e in entries:
        authors = e.get("author", [])
        if isinstance(authors, dict):
            authors = [authors]

        pdf_url = None
        links = e.get("link", [])
        if isinstance(links, dict):
            links = [links]
        for link in links:
            if isinstance(link, dict):
                if link.get("@type") == "application/pdf":
                    pdf_url = link.get("@href")

        arxiv_id = e.get("id", "")
        landing_url = arxiv_id

        doi_field = e.get("arxiv:doi")
        if isinstance(doi_field, dict):
            doi = doi_field.get("#text")
        else:
            doi = doi_field

        pub_date = e.get("published", "2000-01-01")[:10]

        papers.append({
            "title": (e.get("title") or "").strip().replace("\n", " "),
            "authors": [a.get("name", "") for a in authors],
            "year": int(pub_date[:4]),
            "published_date": pub_date,
            "doi": doi,
            "source": "arxiv",
            "abstract": (e.get("summary") or "").strip().replace("\n", " "),
            "pdf_url": pdf_url,
            "landing_url": landing_url,
            "is_open_access": True,
            "citation_count": 0,
            "findings": [],
            "gaps": [],
            "field_tags": []
        })

    return papers
