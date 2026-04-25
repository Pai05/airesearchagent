from backend.cache import get_cached, save_to_cache
from pipeline.extractor_mock import extract_findings_mock

def extract_findings(papers: list[dict], topic: str = "") -> list[dict]:
    """Extract findings and gaps using mock extractor (parses abstracts locally)."""
    to_process = []
    cached_map = {}

    for p in papers:
        if not p.get("id"):
            continue
        cached = get_cached(p["id"])
        if cached:
            cached_map[p["id"]] = cached
        elif p.get("abstract"):
            to_process.append(p)
        else:
            cached_map[p["id"]] = {"findings": [], "gaps": []}

    print(f"From cache: {len(cached_map)}")
    print(f"Needs extraction: {len(to_process)}")

    if to_process:
        print("Extracting findings from abstracts (mock)...")
        for p in to_process:
            pid = p["id"]
            abstract = p.get("abstract", "")
            
            findings, gaps = extract_findings_mock(abstract)
            extracted = {"findings": findings, "gaps": gaps}
            
            save_to_cache(pid, topic, extracted)
            cached_map[pid] = extracted
        
        print(f"Extracted {len(to_process)} papers")

    for p in papers:
        pid = p.get("id", "")
        result = cached_map.get(pid, {"findings": [], "gaps": []})
        p["findings"] = result.get("findings", [])
        p["gaps"] = result.get("gaps", [])

    return papers
