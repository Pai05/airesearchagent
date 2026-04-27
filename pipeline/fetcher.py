import concurrent.futures
from pipeline.fetch_semantic_scholar import fetch_semantic_scholar
from pipeline.fetch_arxiv import fetch_arxiv
from pipeline.fetch_pubmed import fetch_pubmed
from backend.dedup import deduplicate
from backend.validator import validate_paper
from backend.config import MIN_PAPERS

def fetch_all(topic: str, allowed_sources: list = None) -> list[dict]:
    """Fetch papers from selected sources in parallel."""
    run_ss = allowed_sources is None or 'semantic_scholar' in allowed_sources
    run_ax = allowed_sources is None or 'arxiv' in allowed_sources
    run_pm = allowed_sources is None or 'pubmed' in allowed_sources

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_ss = executor.submit(fetch_semantic_scholar, topic) if run_ss else None
        future_ax = executor.submit(fetch_arxiv, topic) if run_ax else None
        future_pm = executor.submit(fetch_pubmed, topic) if run_pm else None

        ss_papers = future_ss.result() if future_ss else []
        ax_papers = future_ax.result() if future_ax else []
        pm_papers = future_pm.result() if future_pm else []

    print(f"Semantic Scholar raw: {len(ss_papers)}")
    print(f"arXiv raw: {len(ax_papers)}")
    print(f"PubMed raw: {len(pm_papers)}")

    all_papers = ss_papers + ax_papers + pm_papers
    validated = [validate_paper(p) for p in all_papers]
    deduped = deduplicate(validated)
    # Interleave results to maintain relevance from each source
    papers_by_source = {}
    for p in deduped:
        src = p["source"]
        if src not in papers_by_source:
            papers_by_source[src] = []
        papers_by_source[src].append(p)
    
    interleaved = []
    max_len = max([len(v) for v in papers_by_source.values()]) if papers_by_source else 0
    for i in range(max_len):
        for src in sorted(papers_by_source.keys()):
            if i < len(papers_by_source[src]):
                interleaved.append(papers_by_source[src][i])
    
    print(f"After dedup and validation: {len(interleaved)}")
    
    if len(interleaved) < MIN_PAPERS:
        print(f"WARNING: only {len(interleaved)} papers found, minimum is {MIN_PAPERS}")
    
    return interleaved
