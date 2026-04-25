import hashlib
import re

def normalize_title(title: str) -> str:
    """Normalize title for comparison."""
    return re.sub(r'[^\w\s]', '', title.lower().strip())

def get_paper_id(paper: dict) -> str:
    """Generate SHA256 ID from DOI or normalized title."""
    doi = paper.get("doi")
    if doi:
        return hashlib.sha256(doi.encode()).hexdigest()[:16]
    
    title = paper.get("title", "")
    normalized = normalize_title(title)
    return hashlib.sha256(normalized.encode()).hexdigest()[:16]

def deduplicate(papers: list[dict]) -> list[dict]:
    """Remove duplicate papers by ID, keeping first occurrence."""
    seen = set()
    unique = []
    
    for paper in papers:
        paper_id = get_paper_id(paper)
        if paper_id not in seen:
            paper["id"] = paper_id
            seen.add(paper_id)
            unique.append(paper)
    
    return unique
